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
    public class SignupController : ControllerBase
    {
        private readonly AccountsDbContext _context;
        private readonly ILogger _logger;

        public SignupController(AccountsDbContext context, ILogger<SignupController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [EnableCors("AllowAllPolicy")]
        [HttpPost("")]
        public async Task<ActionResult<Account>> Signup(SignupRequest signupRequest)
        {
            _logger.LogInformation("Signing up new user with username [{username}], email [{email}]", signupRequest.Username, signupRequest.Email);

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Username.Equals(signupRequest.Username) || a.Email.Equals(signupRequest.Email));
            if (account != null)
            {
                _logger.LogInformation("User with username [{username}], email [{email}] already exists", signupRequest.Username, signupRequest.Email);
                return BadRequest(new ErrorResponse("User already exists"));
            }

            signupRequest.Password = HashUtil.hash(signupRequest.Password); ;

            account = new Account(signupRequest);
            try
            {
                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                // Add new Balance record for the new account to the database
                _context.Balances.Add(new Balance(account.Id));
                await _context.SaveChangesAsync();
            }
            catch (Exception exception)
            {
                _logger.LogError("Error occured while saving changes to database ({exception})", exception.ToString());
                return BadRequest(new ErrorResponse(exception.Message));
            }

            return CreatedAtAction("Signup", new IdResponse(account.Id));
        }


    }
}
