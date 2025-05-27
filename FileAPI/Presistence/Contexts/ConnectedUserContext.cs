using Core;
using Microsoft.EntityFrameworkCore;

namespace Presistence.Contexts
{
    public class ConnectedUserContext : DbContext
    {
        public DbSet<ConnectedUser> ConnectedUsers => Set<ConnectedUser>();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Host=192.168.10.54;Database=NastyshaDisk;Username=user;Password=1234");
        }
    }
}

