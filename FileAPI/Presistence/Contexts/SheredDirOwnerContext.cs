using Core;
using Microsoft.EntityFrameworkCore;

namespace Presistence.Contexts
{
    public class SheredDirOwnerContext : DbContext
    {
        public DbSet<SheredDirOwner> SheredDirOwners => Set<SheredDirOwner>();
        public SheredDirOwnerContext() => Database.EnsureCreated();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Host=192.168.10.54;Database=NastyshaDisk;Username=user;Password=1234");
        }
    }
}
