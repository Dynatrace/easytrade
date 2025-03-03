namespace EasyTrade.BrokerService.Helpers.Logging;

public sealed class CustomLogger : ILogger
{
    private readonly string _name;
    private readonly Func<CustomLoggerConfiguration> _getCurrentConfig;

    public CustomLogger(string name, Func<CustomLoggerConfiguration> getCurrentConfig) =>
        (_name, _getCurrentConfig) = (name, getCurrentConfig);

#pragma warning disable CS8633
    public IDisposable BeginScope<TState>(TState state) => default!;
#pragma warning restore CS8633

    public bool IsEnabled(LogLevel logLevel) =>
        _getCurrentConfig().LogLevelToColorMap.ContainsKey(logLevel);

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter
    )
    {
        if (!IsEnabled(logLevel))
            return;

        var config = _getCurrentConfig();

        if (config.EventId == 0 || config.EventId == eventId.Id)
        {
            ConsoleColor originalColor = Console.ForegroundColor;

            var timestamp = DateTimeOffset.Now.ToString(config.TimestampFormat);
            var callerName = config.SimplifiedNames ? _name.Split('.').Last() : _name;
            callerName = callerName.Replace(config.SkipString, string.Empty);

            var timestampAndType = $"[{timestamp} | {logLevel}]";
            var message = $" {formatter(state, exception)}";

            Console.ForegroundColor = config.LogLevelToColorMap[logLevel];
            Console.Write(timestampAndType);
            Console.ForegroundColor = originalColor;
            Console.Write(message);

            var (left, _) = Console.GetCursorPosition();
            var requieredSpace = callerName.Length + 4;
            if (Console.BufferWidth - requieredSpace >= 0)
            { // check if console is big enought
                if (Console.BufferWidth < left + requieredSpace)
                { // check if enought space left in the line
                    Console.WriteLine();
                }
                Console.CursorLeft = Console.BufferWidth - requieredSpace;
            }
            else
            {
                var offset = config.MinimumMessageLength - timestampAndType.Length - message.Length;
                if (offset > 0)
                {
                    Console.Write(new string(' ', offset));
                }
            }
            Console.WriteLine($" | {callerName}");
        }
    }
}
