namespace Core
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public byte[] Password { get; set; }
        public byte[] Salt { get; set; }

        public User(string name, string email, byte[] password, byte[] salt)
        {
            Name = name;
            Email = email;
            Password = password;
            Salt = salt;
        }
    }
}
