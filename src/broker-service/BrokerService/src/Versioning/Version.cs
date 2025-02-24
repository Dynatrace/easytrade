using System.Text.Json;

namespace EasyTrade.BrokerService.Versioning;

public record Version(string BuildVersion, string BuildDate, string BuildCommit)
{
    private static readonly JsonSerializerOptions jsonSerializerOptions =
        new() { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public override string ToString() =>
        $"EasyTrade Broker Service Version: {BuildVersion}\n\nBuild date: {BuildDate}, git commit: {BuildCommit}";

    public string ToJson() => JsonSerializer.Serialize(this, jsonSerializerOptions);
}
