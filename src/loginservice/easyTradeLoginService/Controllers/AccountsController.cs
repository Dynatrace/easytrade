using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using easyTradeLoginService.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;

namespace easyTradeLoginService.Controllers
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

        // GET: api/Accounts/GetAccountById/1
        [EnableCors("AllowAllPolicy")]
        [HttpGet("GetAccountById/{id}")]
        public async Task<ActionResult<Account>> GetAccountById(int id)
        {
            _logger.LogInformation("Getting account with ID [{id}]", id);
            return await _context.Accounts.FindAsync(id);
        }

        // GET: api/Accounts/GetAccountByUsername/tracy_wright
        [EnableCors("AllowAllPolicy")]
        [HttpGet("GetAccountByUsername/{username}")]
        public async Task<ActionResult<Account>> GetAccountByUsername(string username)
        {
            _logger.LogInformation("Getting account with username [{username}]", username);

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => username.Equals(a.Username));

            if (account == null)
            {
                _logger.LogInformation("Account with username [{username}] not found", username);
                return NotFound();
            }

            return account;
        }

        // POST: api/Accounts/CreateNewAccount + JSON data like:
        //{"packageId": 1,"firstName": "joe","lastName": "Doe","username": "joedoe12345","email": "joedoe12345@porn.net","hashedPassword": "f7d048204bb7d898447148643429481bb3bfc70eefb126ad37fe577c4ffd1381", "origin": "my magical test", "address": "Fantasy Lane 34 Chicago USA"}
        [EnableCors("AllowAllPolicy")]
        [HttpPost("CreateNewAccount")]
        public async Task<ActionResult<Account>> CreateNewAccount(AccountRequest accountRequest)
        {
            _logger.LogInformation("Creating new account with username [{username}], email [{email}]", accountRequest.Username, accountRequest.Email);

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Username.Equals(accountRequest.Username));
            if (account != null) {
                _logger.LogInformation("Account with username [{username}] already exists", accountRequest.Username);
                return BadRequest("An account with given username already exists!");
            }

            account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email.Equals(accountRequest.Email));
            if (account != null)
            {
                _logger.LogInformation("Account with email [{email}] already exists", accountRequest.Email);
                return BadRequest("An account with given email already exists!");
            }

            account = new Account(accountRequest);
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            _context.Balances.Add(new Balance(account.Id));
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAccountById", new { id = account.Id }, account);
        }
    }
}
