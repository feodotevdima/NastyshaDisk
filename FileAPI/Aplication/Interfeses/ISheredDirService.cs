using Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Interfeses
{
    public interface ISheredDirService
    {
        Task<SheredDirOwner?> GetOwnerAsync(Guid userId, string path);
        Task<List<ConnectedUser>> GetConnectedUsersAsync(string userId, string path);
        Task<string> CreateSheredDirAsync(string ownerUserId, string path, string id);
        Task<ConnectedUser> DeleteConnectedUserAsync(string ownerUserId, string path, string connectedUserId);
    }
}
