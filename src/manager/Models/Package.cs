using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace easyTradeManager.Models
{
    public class Package
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Support { get; set; }
    }
}
