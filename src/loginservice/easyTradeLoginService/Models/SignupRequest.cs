using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace easyTradeLoginService.Models
{
    public class SignupRequest
    {
        [Required] [XmlElement("packageId")]
        public int PackageId { get; set; }
        [Required] [XmlElement("firstName")]
        public string FirstName { get; set; }
        [Required] [XmlElement("lastName")]
        public string LastName { get; set; }
        [Required] [XmlElement("username")]
        public string Username { get; set; }
        [Required] [XmlElement("email")]
        public string Email { get; set; }
        [Required] [XmlElement("password")]
        public string Password { get; set; }
        [Required] [XmlElement("origin")]
        public string Origin { get; set; }
        [Required] [XmlElement("address")]
        public string Address { get; set; }

        public SignupRequest()
        {
        }
    }
}
