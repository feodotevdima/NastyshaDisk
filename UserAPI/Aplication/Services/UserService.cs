using Aplication.Interfeses;
using Core;
using Core.Interfeses;
using Presistence.Contracts;
using System.Collections;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace Aplication.Services
{
    public class UserService : IUserService
    {
        private readonly int keySize = 64;
        private readonly int iterations = 350000;
        private readonly HashAlgorithmName hashAlgorithm = HashAlgorithmName.SHA512;

        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User> CreateNewUserAsync(CreateUser reqest)
        {
            var existUser = await _userRepository.GetUserByEmailAsync(reqest.Email);
            if ((existUser == null) && (reqest.Name != null) && (reqest.Email != null) && (reqest.Password != null))
            {
                var salt = RandomNumberGenerator.GetBytes(keySize);
                var hash = Rfc2898DeriveBytes.Pbkdf2(
                    Encoding.UTF8.GetBytes(reqest.Password),
                    salt,
                    iterations,
                    hashAlgorithm,
                    keySize);
                //var passwordHash = System.Text.Encoding.UTF8.GetString(hash);

                User user = new User(reqest.Name, reqest.Email, hash, salt);
                await _userRepository.AddUserAsync(user);
                return user;
            }
            return null;
        }

        public string? GetUserIdFromToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            if (handler.CanReadToken(token))
            {
                JwtSecurityToken jwtToken = handler.ReadJwtToken(token);
                string? userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

                return userId;
            }
            return null;
        }
    }
}
