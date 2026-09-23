namespace EasyTrade.BrokerService.Helpers.Logging;

public sealed class CustomLoggerConfiguration
{
    public int EventId { get; set; }

    /// <summary>
    /// Formatting colors definitions as LogLevel - ConsoleColor dictionary
    /// </summary>
    public Dictionary<LogLevel, ConsoleColor> LogLevelToColorMap { get; set; } =
        new()
        {
            [LogLevel.Trace] = ConsoleColor.White,
            [LogLevel.Debug] = ConsoleColor.White,
            [LogLevel.Information] = ConsoleColor.Green,
            [LogLevel.Warning] = ConsoleColor.Yellow,
            [LogLevel.Error] = ConsoleColor.Red,
            [LogLevel.Critical] = ConsoleColor.DarkRed
        };

    /// <summary>
    /// Timestamp format of the log ouput, e.g. "dd/MM/yy HH:mm:ss"
    /// </summary>
    public string TimestampFormat { get; set; } = "dd/MM/yy HH:mm:ss";

    /// <summary>
    /// Remove namespace from caller name
    /// </summary>
    public bool SimplifiedNames = false;

    /// <summary>
    /// Remove custom string from the name, such as root namespace
    /// </summary>
    public string SkipString = string.Empty;

    /// <summary>
    /// Minimum length of log message before caller name, useful for compatibilty with some consoles (such as Docker containter stdout)
    /// </summary>
    public int MinimumMessageLength = 0;
}
