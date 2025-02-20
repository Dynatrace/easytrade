using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace easyTradeManager.Models
{
    public class PackagesDbContext : DbContext
    {
        public DbSet<Package> Packages { get; set; }

        public PackagesDbContext(DbContextOptions<PackagesDbContext> options) : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Package>().ToTable("Packages");
        }
    }
}
