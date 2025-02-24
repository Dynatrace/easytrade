using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Net.Http.Headers;
using easyTradeManager.Models;

namespace easyTradeManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VersionController : ControllerBase
    {
        private readonly Version _version;

        public VersionController(IConfiguration config)
        {
            _version = new Version(config["BuildVersion"], config["BuildDate"], config["BuildCommit"]);
        }

        [HttpGet]
        [Produces(MediaTypeNames.Text.Plain, MediaTypeNames.Application.Json)]
        public ContentResult GetVersion()
        {
            Request.Headers.TryGetValue(HeaderNames.Accept, out var accept);
            switch (accept)
            {
                case MediaTypeNames.Application.Json:
                    return Content(_version.ToJson(), MediaTypeNames.Application.Json);
                default:
                    return Content(_version.ToString());
            }
        }
    }
}