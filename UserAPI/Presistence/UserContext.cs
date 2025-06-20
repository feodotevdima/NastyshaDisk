using Core;
using Microsoft.EntityFrameworkCore;

namespace Presistence
{
    public class UserContext : DbContext
    {
        public DbSet<User> Users => Set<User>();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Host=postgres;Database=NastyshaDisk;Username=user;Password=1234");
        }
    }
}
