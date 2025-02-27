namespace EasyTrade.BrokerService.Entities.Accounts;

public class Account(
    int id,
    int packageId,
    string firstName,
    string lastName,
    string username,
    string email,
    string hashedPassword,
    string origin,
    DateTimeOffset creationDate,
    DateTimeOffset packageActivationDate,
    bool accountActive,
    string address
)
{
    public int Id { get; set; } = id;
    public int PackageId { get; set; } = packageId;
    public string FirstName { get; set; } = firstName;
    public string LastName { get; set; } = lastName;
    public string Username { get; set; } = username;
    public string Email { get; set; } = email;
    public string HashedPassword { get; set; } = hashedPassword;
    public string Origin { get; set; } = origin;
    public DateTimeOffset CreationDate { get; set; } = creationDate;
    public DateTimeOffset PackageActivationDate { get; set; } = packageActivationDate;
    public bool AccountActive { get; set; } = accountActive;
    public string Address { get; set; } = address;
}
