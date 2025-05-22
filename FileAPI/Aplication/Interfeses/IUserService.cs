using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Interfeses
{
    public interface IUserService
    {
        string GetId(HttpRequest request);
        string? GetUserIdFromToken(string token);
    }
}
