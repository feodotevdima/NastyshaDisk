using Aplication.Interfeses;
using Core;
using System.Runtime.InteropServices;

namespace Aplication.Services
{
    public class SheredDirService : ISheredDirService
    {
        private readonly string _folderPath;
        private readonly IFilesRepository _filesRepository;
        private readonly ISheredDirRepository _sheredDirRepository;

        public SheredDirService(IFilesRepository filesRepository, string folderPath, ISheredDirRepository sheredDirRepository)
        {
            _filesRepository = filesRepository;
            _folderPath = folderPath;
            _sheredDirRepository = sheredDirRepository;
        }


        public async Task<SheredDirOwner?> GetOwnerAsync(Guid userId, string path)
        {
            var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(path);

            if (owner != null && owner.OwnerId == userId)
                return null;

            if (owner == null)
            {
                var connectedUser = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(path);
                if (connectedUser != null)
                {
                    owner = await _sheredDirRepository.GetSheredDirByIdAsync(connectedUser.SheredDirId);
                }
            }
            return owner;
        }

        public async Task<List<ConnectedUser>> GetConnectedUsersAsync(string userId, string path)
        {

            var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(path);

            if (owner == null)
            {
                var dir = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(path);

                if (dir == null)
                    return null;

                owner = await _sheredDirRepository.GetSheredDirByIdAsync(dir.SheredDirId);
            }

            var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
            users = users.Where(item => item.ConnectedUserId.ToString() != userId).ToList();
            return users;
        }

        public async Task<string> CreateSheredDirAsync(string ownerUserId, string path, string connectedUserId)
        {
            string originalFolderPath = _folderPath + ownerUserId + path;
            originalFolderPath = Path.GetFullPath(originalFolderPath);

            string symlinkPath = _folderPath + connectedUserId + path;
            symlinkPath = Path.GetFullPath(symlinkPath);

            if (!Directory.Exists(originalFolderPath))
            {
                return null;
            }

            string newPath;
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                newPath = _filesRepository.CreateSymlinkWindows(originalFolderPath, symlinkPath);
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) || RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                newPath = _filesRepository.CreateSymlinkUnix(originalFolderPath, symlinkPath);
            }
            else
            {
                return null;
            }

            if (newPath == null)
                return null;


            var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(originalFolderPath);
            if (owner == null)
            {
                Guid.TryParse(ownerUserId, out var ownerId);
                owner = new SheredDirOwner(originalFolderPath, ownerId);
                var shereDir = _sheredDirRepository.AddSheredDirAsync(owner);
            }

            Guid.TryParse(connectedUserId, out var connectedId);
            var newConnect = new ConnectedUser(owner.Id, connectedId, symlinkPath);
            var connect = _sheredDirRepository.AddConnectedUserAsync(newConnect);

            return newPath;
        }

        public async Task<ConnectedUser> DeleteConnectedUserAsync(string ownerUserId, string path, string connectedUserId)
        {
            string originalFolderPath = _folderPath + ownerUserId + path;
            originalFolderPath = Path.GetFullPath(originalFolderPath);

            if (!Directory.Exists(originalFolderPath))
            {
                return null;
            }

            var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(originalFolderPath);
            var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);

            if (users == null || users.Count() == 0)
            {
                await _sheredDirRepository.RemoveSheredDirAsync(owner.Id);
                return null;
            }

            var user = users.FirstOrDefault(item => item.ConnectedUserId.ToString() == connectedUserId);
            if (user == null || users.Count() == 0)
            {
                return null;
            }
            var deleteUser = await _sheredDirRepository.RemoveConnectedUserAsync(user.Id);

            _filesRepository.Delete(user.SimLinkLocation);

            users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);

            if (users == null || users.Count() == 0)
                await _sheredDirRepository.RemoveSheredDirAsync(owner.Id);

            return deleteUser;
        }
    }
}
