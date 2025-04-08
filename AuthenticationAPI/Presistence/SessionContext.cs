using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Presistence
{
    public class SessionContext : DbContext
    {
        public DbSet<JwtTokenModel> Sessions => Set<JwtTokenModel>();

        public SessionContext()
        {
            //Database.EnsureDeleted();
            Database.EnsureCreated();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Data Source = Sessions.db");
        }
    }
}
