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
            optionsBuilder.UseSqlite("Data Source = SheredDirOwners.db");
        }
    }
}
