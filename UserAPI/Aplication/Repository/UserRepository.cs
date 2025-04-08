using Core;
using Core.Interfeses;
using Microsoft.EntityFrameworkCore;
using Presistence;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace Aplication.Repository
{
    public class UserRepository : IUserRepository
    {

        public async Task<User> AddUserAsync(User user)
        {
            if (user == null) return null;
            using (UserContext db = new UserContext())
            {
                await db.Users.AddAsync(user);
                await db.SaveChangesAsync();
            }
            return user;
        }

        public async Task<User> RemoveUserAsync(Guid id)
        {
            var user = await GetUserByIdAsync(id);
            if (user == null) return null;
            using (UserContext db = new UserContext())
            {
                db.Users.Remove(user);
                await db.SaveChangesAsync();
            }
            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            if (user == null) return null;
            using (UserContext db = new UserContext())
            {
                db.Users.Update(user);
                await db.SaveChangesAsync();
            }
            return user;
        }

        public async Task<List<User>> GetUsersAsync()
        {
            using (UserContext db = new UserContext())
            {
                var users = await db.Users.ToListAsync();
                return users;
            }
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            List<User> users = await GetUsersAsync();
            var user = users.FirstOrDefault(item => item.Id == id);
            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            List<User> users = await GetUsersAsync();
            var user = users.FirstOrDefault(item => item.Email.ToLower() == email.ToLower());
            return user;
        }
    }
}
