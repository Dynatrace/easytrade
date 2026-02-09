using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace easyTradeManager.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Ppt { get; set; }
        public string Currency { get; set; }
    }
}
