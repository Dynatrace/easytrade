using Microsoft.EntityFrameworkCore;


namespace easyTradeLoginService.Models
{
    public class AccountsDbContext : DbContext
    {
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Balance> Balances {get; set;}

        public AccountsDbContext(DbContextOptions<AccountsDbContext> options) : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>().ToTable("Accounts");
            modelBuilder.Entity<Balance>().ToTable("Balance");
        }
    }
}
