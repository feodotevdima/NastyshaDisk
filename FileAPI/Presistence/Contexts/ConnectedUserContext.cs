using Core;
using Microsoft.EntityFrameworkCore;

namespace Presistence.Contexts
{
    public class ConnectedUserContext : DbContext
    {
        public DbSet<ConnectedUser> ConnectedUsers => Set<ConnectedUser>();
        public ConnectedUserContext() => Database.EnsureCreated();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Data Source = ConnectedUsers.db");
        }
    }
}

