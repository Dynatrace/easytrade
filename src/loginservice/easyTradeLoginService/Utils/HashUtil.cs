using System;
using System.Security.Cryptography;
using System.Text;

namespace easyTradeLoginService.Utils
{
    public static class HashUtil
    {
        public static string hash(string password)
        {
            byte[] hashValue = SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(password));

            return BitConverter.ToString(hashValue).Replace("-", "").ToLower();
        }
    }
}