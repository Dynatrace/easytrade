using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;


namespace easyTradeLoginService.Models
{
    public class LogoutRequest
    {
        [Required] [XmlElement("accountId")]
        public int AccountId { get; set; }

        public LogoutRequest()
        {
        }
    }
}
