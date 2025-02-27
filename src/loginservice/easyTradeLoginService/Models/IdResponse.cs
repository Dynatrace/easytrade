using System.Xml.Serialization;

namespace easyTradeLoginService.Models
{
    public class IdResponse
    {
        [XmlElement("id")]
        public int Id {get; set;}

        public IdResponse(int id)
        {
            Id = id;
        }

        public IdResponse()
        {

        }
    }
}