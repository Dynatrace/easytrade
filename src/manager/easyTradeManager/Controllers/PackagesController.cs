using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using easyTradeManager.Models;
using Microsoft.Extensions.Logging;

namespace easyTradeManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesController : ControllerBase
    {
        private readonly PackagesDbContext _context;
        private readonly ILogger _logger;

        public PackagesController(PackagesDbContext context, ILogger<PackagesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Packages/GetPackageById/2
        [HttpGet("GetPackageById/{id}")]
        public async Task<ActionResult<Package>> GetPackageById(int id)
        {
            _logger.LogInformation("Getting package with ID [{id}]", id);

            var package = await _context.Packages.FindAsync(id);

            if (package == null)
            {
                _logger.LogWarning("Package with ID [{id}] not found", id);
                return NotFound();
            }

            return package;
        }

        // GET: api/Packages/GetPackages
        [HttpGet("GetPackages")]
        public async Task<ActionResult<IEnumerable<Package>>> GetPackages()
        {
            _logger.LogInformation("Getting all packages");
            return await _context.Packages.ToListAsync();
        }
    }
}
