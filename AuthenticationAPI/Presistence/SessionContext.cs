using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Presistence
{
    public class SessionContext : DbContext
    {
        public DbSet<JwtTokenModel> Sessions => Set<JwtTokenModel>();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Host=192.168.10.54;Database=NastyshaDisk;Username=user;Password=1234");
        }
    }
}
