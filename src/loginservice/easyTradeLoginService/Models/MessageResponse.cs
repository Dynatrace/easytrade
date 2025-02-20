using System.Xml.Serialization;

namespace easyTradeLoginService.Models
{
    public class MessageResponse
    {
        [XmlElement("message")]
        public string Message {get; set;}

        public MessageResponse(string message)
        {
            Message = message;
        }

        public MessageResponse()
        {
            Message = string.Empty;
        }
    }
}