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
    public class LogoutController : ControllerBase
    {
        private readonly AccountsDbContext _context;
        private readonly ILogger _logger;

        public LogoutController(AccountsDbContext context, ILogger<LogoutController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [EnableCors("AllowAllPolicy")]
        [HttpPost("")]
        public async Task<ActionResult<Account>> Logout(LogoutRequest logoutRequest)
        {
            _logger.LogInformation("Logging out with account ID [{accountId}]", logoutRequest.AccountId);

            var account = await _context.Accounts.FirstOrDefaultAsync(a => logoutRequest.AccountId.Equals(a.Id));

            if (account == null)
            {
                _logger.LogInformation("Account with ID [{id}] not found", logoutRequest.AccountId);
                return NotFound(new ErrorResponse("Invalid accountId"));
            }

            return Ok(new MessageResponse("User has been successfully logged out."));
        }
    }
}
