using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace easyTradeLoginService.Models
{
    public class LoginRequest
    {
        [Required] [XmlElement("username")]
        public string Username { get; set; }
        [Required] [XmlElement("password")]
        public string Password { get; set; }

        public LoginRequest()
        {
        }
    }
}
