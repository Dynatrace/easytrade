using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Packages;
using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Entities.Trades;
using Microsoft.EntityFrameworkCore;

namespace EasyTrade.BrokerService;

// Database context for Broker Service
// Account and Price are fetched from an external service
public class BrokerDbContext(DbContextOptions<BrokerDbContext> options) : DbContext(options)
{
    public DbSet<Balance> Balances => Set<Balance>();
    public DbSet<BalanceHistory> BalanceHistories => Set<BalanceHistory>();
    public DbSet<Instrument> Instruments => Set<Instrument>();
    public DbSet<OwnedInstrument> OwnedInstruments => Set<OwnedInstrument>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Trade> Trades => Set<Trade>();

    // Set default store type for decimal properties to "decimal(18, 8)"
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var decimalProperties = modelBuilder
            .Model.GetEntityTypes()
            .SelectMany(type => type.GetProperties())
            .Where(property =>
                property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?)
            );

        foreach (var property in decimalProperties)
        {
            property.SetPrecision(18);
            property.SetScale(8);
        }
    }
}
