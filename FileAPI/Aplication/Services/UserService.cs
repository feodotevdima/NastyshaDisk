using Aplication.Interfeses;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;

namespace Aplication.Services
{
    public class UserService : IUserService
    {
        public string GetId(HttpRequest request)
        {
            var token = request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var userId = GetUserIdFromToken(token);
            return userId;
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
