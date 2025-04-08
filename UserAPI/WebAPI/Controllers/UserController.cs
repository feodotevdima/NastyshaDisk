using Microsoft.AspNetCore.Mvc;
using Core;
using Core.Interfeses;
using Presistence.Contracts;
using Aplication.Interfeses;
using System.IdentityModel.Tokens.Jwt;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserService _userService;
        private readonly string _targetFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        public UserController(IUserRepository userRepository, IUserService userService)
        {
            _userRepository = userRepository;
            _userService = userService;
            if (!Directory.Exists(_targetFilePath))
            {
                Directory.CreateDirectory(_targetFilePath);
            }
        }

        [Route("all")]
        [HttpGet]
        public async Task<IResult> GetAllUsersAsync()
        {
            var user = await _userRepository.GetUsersAsync();
            if (user == null) return Results.BadRequest();
            return Results.Json(user);
        }


        [HttpGet("{token}")]
        public async Task<IResult> GetUserByTokenAsync(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            if (handler.CanReadToken(token))
            {
                JwtSecurityToken jwtToken = handler.ReadJwtToken(token);
                string? userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                Guid.TryParse(userId, out var Id);
                var user = await _userRepository.GetUserByIdAsync(Id);
                if (user == null) return Results.BadRequest();
                return Results.Json(user);
            }
            return Results.BadRequest();
        }

        [HttpGet ("id/{id}")]
        public async Task<IResult> GetUserAsync(Guid id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return Results.BadRequest();
            return Results.Json(user);
        }

        [HttpGet("login/{login}")]
        public async Task<IResult> GetUserByLoginAsync(string login)
        {
            var user = await _userRepository.GetUserByEmailAsync(login);
            if (user == null) return Results.BadRequest();
            return Results.Json(user);
        }

        [Route("add")]
        [HttpPost]
        public async Task<IResult> AddUserAsync(CreateUser reqest)
        {
            var user = await _userService.CreateNewUserAsync(reqest);

            if (user != null)
                return Results.Json(user);     

            return Results.StatusCode(400);
        }

        [HttpDelete("{id}")]
        public async Task<IResult> DeleteUserAsync(Guid id)
        {
            User user = await _userRepository.RemoveUserAsync(id);
            if (user != null)
                return Results.Ok();
            return Results.BadRequest();
        }

        [HttpPut("{id}")]
        public async Task<IResult> UpdateUserAsync(string id, [FromBody] String name)
        {
            if (name != null)
            {
                Guid.TryParse(id, out var IdGuid);
                var user = await _userRepository.GetUserByIdAsync(IdGuid);
                user.Name = name;
                User newUser = await _userRepository.UpdateUserAsync(user);
                if (newUser != null)
                    return Results.Ok();
            }
            return Results.BadRequest();
        }
    }
}
