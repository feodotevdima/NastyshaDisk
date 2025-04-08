using Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfeses
{
    public interface IAuthService
    {
        public Task<JwtTokenModel?> AuthenticationUserAsync(string userLogin, string userPassword);
        public string? GenerateAccessToken(string userId, string sessionId);
        public (string? Token, DateTime Expiration) GenerateRefreshToken(string userId, string sessionId);
        public Task<bool> ValidateRefreshTokenAsync(Guid SessionId);
        public (string? UserId, string? SessionId) ExtractClaimsFromToken(string? Token);
        public Task<JwtTokenModel?> RefreshTokensAsync(string refreshToken);
    }
}
