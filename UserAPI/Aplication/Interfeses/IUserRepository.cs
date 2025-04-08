namespace Core.Interfeses
{
    public interface IUserRepository
    {
        Task<User> AddUserAsync(User user);
        Task<User> RemoveUserAsync(Guid id);
        Task<User> UpdateUserAsync(User user);
        Task<List<User>> GetUsersAsync();
        Task<User?> GetUserByIdAsync(Guid id);
        Task<User?> GetUserByEmailAsync(string email);
    }
}
