using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace easyTradeLoginService.Models
{
    public class Balance
    {
        [Key]
        public int AccountId {get; set;}
        [Column(TypeName = "decimal(18,8)")]
        public decimal Value {get; set;}

        public Balance(int accountId, decimal value = 0)
        {
            AccountId = accountId;
            Value = value;
        }
    }
}