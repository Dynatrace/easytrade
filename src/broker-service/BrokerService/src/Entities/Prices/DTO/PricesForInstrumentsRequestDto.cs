using System.Text.Json.Serialization;

namespace EasyTrade.BrokerService.Entities.Prices.DTO;

public class PricesForInstrumentsRequestDto(IEnumerable<Guid> instrumentIds, DateTimeOffset since)
{
    [JsonPropertyName("instrumentIds")]
    public IEnumerable<Guid> InstrumentIds { get; set; } = instrumentIds;

    [JsonPropertyName("since")]
    public DateTimeOffset Since { get; set; } = since;
}
