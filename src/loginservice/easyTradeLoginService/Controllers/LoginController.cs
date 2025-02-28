using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using easyTradeLoginService.Models;
using easyTradeLoginService.Utils;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;

namespace easyTradeLoginService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AccountsDbContext _context;
        private readonly ILogger _logger;

        public LoginController(AccountsDbContext context, ILogger<LoginController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [EnableCors("AllowAllPolicy")]
        [HttpPost("")]
        public async Task<ActionResult<Account>> Login(LoginRequest loginRequest)
        {
            _logger.LogInformation("Logging in as [{username}]", loginRequest.Username);

            var account = await _context.Accounts.FirstOrDefaultAsync(a => loginRequest.Username.Equals(a.Username));

            if (account == null)
            {
                _logger.LogInformation("Username [{username}] not found", loginRequest.Username);
                return NotFound(new ErrorResponse("Invalid username or password"));
            }

            string hashString = HashUtil.hash(loginRequest.Password);

            if (account.HashedPassword.Equals(hashString))
            {
                return Ok(new IdResponse(account.Id));
            }

            _logger.LogInformation("Invalid password from username [{username}]", loginRequest.Username);
            return NotFound(new ErrorResponse("Invalid username or password"));
        }
    }
}
