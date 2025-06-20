using Core;
using Microsoft.EntityFrameworkCore;

namespace Presistence.Contexts
{
    public class PdfContext : DbContext
    {
        public DbSet<PdfModel> Pdf => Set<PdfModel>();
        public PdfContext() => Database.EnsureCreated();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Host=postgres;Database=NastyshaDisk;Username=user;Password=1234");
        }
    }
}
