using EasyTrade.BrokerService.Connectors;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.Helpers.Health;
using EasyTrade.BrokerService.Helpers.Logging;
using EasyTrade.BrokerService.Middleware.CreditCardValidation;
using EasyTrade.BrokerService.ProblemPatterns.HighCpuUsage;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Default CORS policy allowing every connection
builder.Services.AddCors(services =>
    services.AddDefaultPolicy(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin())
);

builder.Services.AddSingleton<IDbAdapterConnector, DbAdapterConnector>();
builder.Services.AddMemoryCache();
builder.Services.AddBrokerServiceHealthChecks();

// Clear default logging providers and and new ones
builder.Logging.ClearProviders();
builder.Logging.AddCustomLogger(options =>
{
    options.SkipString = "EasyTrade.BrokerService.";
    options.MinimumMessageLength = 100;
});

// Add dependency injection group
builder.Services.AddBrokerServiceDependencyGroup();
builder.Services.AddTransient<HighCpuUsageMiddleware>();

// Add HTTP client used to connect to other services
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseMiddleware<HighCpuUsageMiddleware>();
app.UseMiddleware<CreditCardValidationMiddleware>();

app.MapControllers();
app.MapBrokerServiceHealthChecks();

app.Run();
