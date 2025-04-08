using Aplication.Interfeses;
using Core;
using Microsoft.EntityFrameworkCore;
using Presistence.Contexts;

namespace Aplication.Repository
{
    public class SheredDirRepository : ISheredDirRepository
    {
        public async Task<List<SheredDirOwner>> GetSheredDirsAsync()
        {
            using (SheredDirOwnerContext db = new SheredDirOwnerContext())
            {
                var SheredDirs = await db.SheredDirOwners.ToListAsync();
                return SheredDirs;
            }
        }

        public async Task<List<ConnectedUser>> GetConnectedUsersAsync()
        {
            using (ConnectedUserContext db = new ConnectedUserContext())
            {
                var ConnectedUsers = await db.ConnectedUsers.ToListAsync();
                return ConnectedUsers;
            }
        }

        public async Task<SheredDirOwner?> GetSheredDirByIdAsync(Guid dirId)
        {
            List<SheredDirOwner> SheredDirOwners = await GetSheredDirsAsync();
            var SheredDir = SheredDirOwners.FirstOrDefault(item => item.Id == dirId);
            return SheredDir;
        }

        public async Task<List<SheredDirOwner>> GetSheredDirByOwnerIdAsync(Guid ownerId)
        {
            List<SheredDirOwner> SheredDirOwners = await GetSheredDirsAsync();
            var SheredDirOwner = SheredDirOwners.Where(item => item.OwnerId ==ownerId).ToList();
            return SheredDirOwner;
        }

        public async Task<SheredDirOwner?> GetSheredDirByDirLocationAsync(string path)
        {
            List<SheredDirOwner> SheredDirOwners = await GetSheredDirsAsync();
            var SheredDirOwner = SheredDirOwners.FirstOrDefault(item => item.DirLocation == path);
            return SheredDirOwner;
        }

        public async Task<ConnectedUser?> GetConnectedUsersByIdAsync(Guid id)
        {
            List<ConnectedUser> ConnectedUsers = await GetConnectedUsersAsync();
            var ConnectedUser = ConnectedUsers.FirstOrDefault(item => item.Id == id);
            return ConnectedUser;
        }

        public async Task<List<ConnectedUser>> GetConnectedUsersBySheredDirIdAsync(Guid id)
        {
            List<ConnectedUser> ConnectedUsers = await GetConnectedUsersAsync();
            var ConnectedUser = ConnectedUsers.Where(item => item.SheredDirId == id).ToList();
            return ConnectedUser;
        }

        public async Task<List<ConnectedUser>> GetConnectedUsersByConnectedUserIdAsync(Guid id)
        {
            List<ConnectedUser> ConnectedUsers = await GetConnectedUsersAsync();
            var ConnectedUser = ConnectedUsers.Where(item => item.ConnectedUserId == id).ToList();
            return ConnectedUser;
        }

        public async Task<ConnectedUser?> GetConnectedUsersBySimLinkLocationAsync(string path)
        {
            List<ConnectedUser> ConnectedUsers = await GetConnectedUsersAsync();
            var ConnectedUser = ConnectedUsers.FirstOrDefault(item => item.SimLinkLocation == path);
            return ConnectedUser;
        }


        public async Task<SheredDirOwner> AddSheredDirAsync(SheredDirOwner sheredDir)
        {
            if (sheredDir == null) return null;
            using (SheredDirOwnerContext db = new SheredDirOwnerContext())
            {
                await db.SheredDirOwners.AddAsync(sheredDir);
                await db.SaveChangesAsync();
            }
            return sheredDir;
        }

        public async Task<ConnectedUser> AddConnectedUserAsync(ConnectedUser connectedUser)
        {
            if (connectedUser == null) return null;
            using (ConnectedUserContext db = new ConnectedUserContext())
            {
                await db.ConnectedUsers.AddAsync(connectedUser);
                await db.SaveChangesAsync();
            }
            return connectedUser;
        }


        public async Task<SheredDirOwner> RemoveSheredDirAsync(Guid id)
        {
            var SheredDir = await GetSheredDirByIdAsync(id);
            if (SheredDir == null) return null;
            using (SheredDirOwnerContext db = new SheredDirOwnerContext())
            {
                db.SheredDirOwners.Remove(SheredDir);
                await db.SaveChangesAsync();
            }
            return SheredDir;
        }

        public async Task<ConnectedUser> RemoveConnectedUserAsync(Guid id)
        {
            var connectedUser = await GetConnectedUsersByIdAsync(id);
            if (connectedUser == null) return null;
            using (ConnectedUserContext db = new ConnectedUserContext())
            {
                db.ConnectedUsers.Remove(connectedUser);
                await db.SaveChangesAsync();
            }
            return connectedUser;
        }



        public async Task<SheredDirOwner> UpdateSheredDirAsync(SheredDirOwner SheredDir)
        {
            if (SheredDir == null) return null;
            using (SheredDirOwnerContext db = new SheredDirOwnerContext())
            {
                db.SheredDirOwners.Update(SheredDir);
                await db.SaveChangesAsync();
            }
            return SheredDir;
        }

        public async Task<ConnectedUser> UpdateConnectedUserAsync(ConnectedUser connectedUser)
        {
            if (connectedUser == null) return null;
            using (ConnectedUserContext db = new ConnectedUserContext())
            {
                db.ConnectedUsers.Update(connectedUser);
                await db.SaveChangesAsync();
            }
            return connectedUser;
        }
    }
}
