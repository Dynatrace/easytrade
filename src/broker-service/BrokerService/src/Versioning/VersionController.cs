using System.Net.Mime;
using EasyTrade.BrokerService.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace EasyTrade.BrokerService.Versioning;

[ApiController]
[Route("/version")]
public class VersionController(IConfiguration config) : ControllerBase
{
    private readonly Version _version =
        new(
            config[Constants.BuildVersion] ?? "0",
            config[Constants.BuildDate] ?? "0",
            config[Constants.BuildCommit] ?? "0"
        );

    [HttpGet]
    [Produces(MediaTypeNames.Text.Plain, MediaTypeNames.Application.Json)]
    public ContentResult GetVersion()
    {
        Request.Headers.TryGetValue(HeaderNames.Accept, out var accept);
        return (string?)accept switch
        {
            MediaTypeNames.Application.Json
                => Content(_version.ToJson(), MediaTypeNames.Application.Json),
            _ => Content(_version.ToString()),
        };
    }
}
