using System.Text.Json;

namespace EasyTrade.BrokerService.Helpers;

public static class JsonSerializationExtension
{
    private static readonly JsonSerializerOptions indented = new() { WriteIndented = true };
    private static readonly JsonSerializerOptions unindented = new() { WriteIndented = false };

    public static string ToJson(this object value, bool writeIndented = false) =>
        JsonSerializer.Serialize(value, writeIndented ? indented : unindented);
}
