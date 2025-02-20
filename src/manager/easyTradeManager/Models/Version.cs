using System.Text.Json;

namespace easyTradeManager.Models
{
    public class Version
    {
        public string BuildVersion {get; set;}
        public string BuildDate {get; set;}
        public string BuildCommit {get; set;}

        public Version(string version, string date, string commit)
        {
            BuildVersion = version;
            BuildDate = date;
            BuildCommit = commit;
        }

        public override string ToString()
            => string.Format("EasyTrade Manager Version: {0}\n\nBuild date: {1}, git commit: {2}", BuildVersion, BuildDate, BuildCommit);

        public string ToJson()
            => JsonSerializer.Serialize(this, new JsonSerializerOptions{
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
    }
}