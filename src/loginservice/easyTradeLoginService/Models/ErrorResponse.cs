using System.Xml.Serialization;

namespace easyTradeLoginService.Models
{
    public class ErrorResponse
    {
        [XmlElement("error")]
        public string Error {get; set;}

        public ErrorResponse(string error)
        {
            Error = error;
        }

        public ErrorResponse()
        {
            Error = string.Empty;
        }
    }
}