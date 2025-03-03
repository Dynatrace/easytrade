namespace easyTradeLoginService.Models
{
    public class AccountRequest
    {
        public int PackageId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string HashedPassword { get; set; }
        public string Origin { get; set; }
        public string Address { get; set; }

        public AccountRequest()
        {
        }
    }
}
