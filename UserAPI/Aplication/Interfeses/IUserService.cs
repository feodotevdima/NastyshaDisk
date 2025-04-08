using Core;
using Presistence.Contracts;

namespace Aplication.Interfeses
{
    public interface IUserService
    {
        Task<User> CreateNewUserAsync(CreateUser reqest);
        string? GetUserIdFromToken(string token);
    }
}
