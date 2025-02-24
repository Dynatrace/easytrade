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
    public class ProductsController : ControllerBase
    {
        private readonly ProductsDbContext _context;
        private readonly ILogger _logger;

        public ProductsController(ProductsDbContext context, ILogger<ProductsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Products/GetProductById/2
        [HttpGet("GetProductById/{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            _logger.LogInformation("Getting package with ID [{id}]", id);
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                _logger.LogWarning("Package with ID [{id}] not found", id);
                return NotFound();
            }

            return product;
        }

        // GET: api/Products/GetProducts
        [HttpGet("GetProducts")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            _logger.LogInformation("Getting all products");
            return await _context.Products.ToListAsync();
        }
    }
}
