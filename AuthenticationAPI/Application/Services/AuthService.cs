using Core;
using Core.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Application.Repository;
using Application.Interfeses;
using System.Security.Cryptography;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly int keySize = 64;
        private readonly int iterations = 350000;
        private readonly HashAlgorithmName hashAlgorithm = HashAlgorithmName.SHA512;

        private readonly JwtSettingsModel _jwtSettingsModel;
        private readonly HttpClient _httpClient;
        private readonly ISessionRepository _sessionRepository;

        public AuthService(IOptions<JwtSettingsModel> jwtSettings, HttpClient httpClient, ISessionRepository sessionRepository)
        {
            _jwtSettingsModel = jwtSettings.Value;
            _httpClient = httpClient;
            _sessionRepository = sessionRepository;           
        }

        public async Task<JwtTokenModel?> AuthenticationUserAsync(string userLogin, string userPassword)
        {
            if (!(string.IsNullOrWhiteSpace(userLogin) || string.IsNullOrWhiteSpace(userPassword)))
            {
                var response = await _httpClient.GetAsync($"{Links.DbProvider}/User/login/{userLogin}");
                if (response.IsSuccessStatusCode)
                {
                    var user = await response.Content.ReadFromJsonAsync<UserModel>();

                    var hash = Rfc2898DeriveBytes.Pbkdf2(
                        Encoding.UTF8.GetBytes(userPassword),
                        user.Salt,
                        iterations,
                        hashAlgorithm,
                        keySize);

                    if ((user != null) && (System.Text.Encoding.UTF8.GetString(hash) == System.Text.Encoding.UTF8.GetString(user.Password)))
                    {
                        JwtTokenModel? session = await _sessionRepository.AddSessionAsync(user.Id);

                        var AccessToken = GenerateAccessToken(user.Id.ToString(), session.Id.ToString());
                        (var RefreshToken, var RefreshTokenExpiration) = GenerateRefreshToken(user.Id.ToString(), session.Id.ToString());

                        session.AccessToken = AccessToken;
                        session.RefreshToken = RefreshToken;
                        session.RefreshTokenExpiration = RefreshTokenExpiration;
                        session = await _sessionRepository.UpdateSessionAsync(session);
                        return session;
                    }
                }
            }
            return null;
        }


        public string? GenerateAccessToken(string userId, string sessionId)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Jti, sessionId)
            };

            if (!string.IsNullOrEmpty(_jwtSettingsModel.Secret))
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettingsModel.Secret));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _jwtSettingsModel.Issuer,
                    audience: _jwtSettingsModel.Audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(_jwtSettingsModel.AccessTokenExpirationMinutes),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }

            return null;
        }

        public (string? Token, DateTime Expiration) GenerateRefreshToken(string userId, string sessionId)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Jti, sessionId)
            };
            if (!string.IsNullOrEmpty(_jwtSettingsModel.Secret))
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettingsModel.Secret));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _jwtSettingsModel.Issuer,
                    audience: _jwtSettingsModel.Audience,
                    claims: claims,
                    expires: DateTime.Now.AddDays(_jwtSettingsModel.RefreshTokenExpirationDays),
                    signingCredentials: creds);
                return (new JwtSecurityTokenHandler().WriteToken(token), token.ValidTo);
            }

            return (null, DateTime.MinValue);
        }

        public async Task<bool> ValidateRefreshTokenAsync(Guid SessionId)
        {
            if (Guid.Empty.Equals(SessionId))
            {
                return false;
            }
            JwtTokenModel? response = await _sessionRepository.GetSessionByIdAsync(SessionId);

            if (response != null)
            {
                if (response.RefreshTokenExpiration <= DateTime.UtcNow)
                {
                    await _sessionRepository.RemoveSessionAsync(response.Id);
                    return false;
                }
                return true;
            }
            return false;
        }

        public (string? UserId, string? SessionId) ExtractClaimsFromToken(string? Token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (handler.CanReadToken(Token))
                {
                    JwtSecurityToken jwtToken = handler.ReadJwtToken(Token);
                    string? userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                    string? sessionId = jwtToken.Claims.FirstOrDefault(c => c.Type == "jti")?.Value;

                    return (userId, sessionId);
                }
                return (null, null);
            }
            catch
            {
                Console.WriteLine("No valid token");
                return (null, null);
            }
        }

        public async Task<JwtTokenModel?> RefreshTokensAsync(string refreshToken)
        {
            (var userId, var sessionId) = ExtractClaimsFromToken(refreshToken);
            Guid.TryParse(sessionId, out var newId);

            var session= await _sessionRepository.GetSessionByIdAsync(newId);
            if (await ValidateRefreshTokenAsync(newId) && (session.RefreshToken==refreshToken))
            {
                var newAccessToken = GenerateAccessToken(userId, sessionId);
                (var newRefreshToken, var newRefreshTokenExpiration) = GenerateRefreshToken(userId, sessionId);

                Guid.TryParse(sessionId, out var newSessionId);
                Guid.TryParse(userId, out var newUserId);

                JwtTokenModel tokens = new JwtTokenModel
                {
                    Id = newSessionId,
                    UserId = newUserId,
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken,
                    RefreshTokenExpiration = newRefreshTokenExpiration
                };
                var newTokens = await _sessionRepository.UpdateSessionAsync(tokens);
                return tokens;
            }
            return null;
        }
    }
}