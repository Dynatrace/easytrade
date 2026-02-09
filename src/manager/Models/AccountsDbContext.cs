using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace easyTradeManager.Models
{
    public class AccountsDbContext : DbContext
    {
        public DbSet<Account> Accounts { get; set; }

        public AccountsDbContext(DbContextOptions<AccountsDbContext> options) : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>().ToTable("Accounts");
        }
    }
}
