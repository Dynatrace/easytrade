using EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers.FeatureFlagService;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeFeatureFlagServiceConnector : IFeatureFlagServiceConnector
{
    private readonly List<Flag> _flags = new();

    public FakeFeatureFlagServiceConnector(List<Flag> flags) => _flags = flags;

    public FakeFeatureFlagServiceConnector() { }

    public void SetFlag(Flag flag)
    {
        var current = _flags.Find(x => x.Id == flag.Id);
        if (current is null)
        {
            _flags.Add(flag);
        }
        else
        {
            current = flag;
        }
    }

    public Task<Flag?> GetFlag(string id) => Task.FromResult(_flags.Find(x => x.Id == id));
}
