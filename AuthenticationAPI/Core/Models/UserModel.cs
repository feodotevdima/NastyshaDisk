using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class UserModel
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public byte[] Password { get; set; }
        public byte[] Salt { get; set; }

        public UserModel(string email, byte[] password, byte[] salt)
        {
            Email = email;
            Password = password;
            Salt = salt;
        }
    }
}
