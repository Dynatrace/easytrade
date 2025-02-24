using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using easyTradeLoginService.Models;
using Microsoft.EntityFrameworkCore;

namespace easyTradeLoginService
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = Configuration["MSSQL_CONNECTIONSTRING"];

            services.AddDbContext<AccountsDbContext>(options => options.UseSqlServer(connectionString));

            services.AddControllers().AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
                o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            })
            .AddXmlSerializerFormatters();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "easyTradeLoginService", Version = "v1" });
                c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
            });

            services.AddCors(services => services.AddPolicy("AllowAllPolicy", builder =>
            {
                builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            }));

            services.AddLogging(logOptions => {
                logOptions.ClearProviders();
                logOptions.AddSimpleConsole(consoleOptions => {
                    consoleOptions.TimestampFormat = "dd/MM/yy HH:mm:ss ";
                });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                ConfigureSwagger(app);
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseCors();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private void ConfigureSwagger(IApplicationBuilder app)
        {
            var proxyPrefix = Configuration["PROXY_PREFIX"];
            if (string.IsNullOrEmpty(proxyPrefix))
            {
                app.UseSwagger();
            }
            else
            {
                app.UseSwagger(opt =>
                {
                    opt.PreSerializeFilters.Add((swagger, httpReq) =>
                    {
                        var serverUrl = $"http://{httpReq.Host}/{proxyPrefix}";
                        swagger.Servers = new List<OpenApiServer> { new() { Url = serverUrl } };
                    });
                });
            }

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("v1/swagger.json", "easyTradeLoginService v1");
            });
        }
    }
}
