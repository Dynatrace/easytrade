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
    public class AccountsController : ControllerBase
    {
        private readonly AccountsDbContext _context;
        private readonly ILogger _logger;

        public AccountsController(AccountsDbContext context, ILogger<AccountsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Accounts/5
        [HttpGet("GetAccountById/{id}")]
        public async Task<ActionResult<Account>> GetAccount(int id)
        {
            _logger.LogInformation("Getting account with ID [{id}]", id);

            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                _logger.LogWarning("Account with ID [{id}] not found", id);
                return NotFound();
            }

            return account;
        }

        // PUT: api/Accounts
        [HttpPut("ModifyAccount")]
        public async Task<IActionResult> PutAccount(Account account)
        {
             _logger.LogInformation("Modyfing account with ID [{id}]", account.Id);

            if (account.Id <= 0)
            {
                _logger.LogWarning("Account ID [{id}] cannot be lower than 1", account.Id);
                return BadRequest();
            }

            _context.Entry(account).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException exception)
            {
                if (!AccountExists(account.Id))
                {
                    _logger.LogWarning("Account with ID [{id}] not found", account.Id);
                    return NotFound();
                }
                else
                {
                    _logger.LogWarning("Error occured while updating account ({exception})", exception.ToString());
                    throw;
                }
            }

            return NoContent();
        }

        // GET: api/
        [HttpGet("")]
        public async Task<ActionResult<IList<Account>>> GetAccounts()
        {
            _logger.LogInformation("Getting all accounts");
            return await _context.Accounts.ToListAsync();
        }

        private bool AccountExists(int id)
        {
            return _context.Accounts.Any(e => e.Id == id);
        }
    }
}
