using Core;
using Microsoft.EntityFrameworkCore;

namespace Presistence
{
    public class UserContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public UserContext() => Database.EnsureCreated();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Data Source = Users.db");
        }
    }
}
