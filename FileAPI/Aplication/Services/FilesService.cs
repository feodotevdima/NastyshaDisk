using Aplication.Interfeses;
using Core;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.InteropServices;

namespace Aplication.Services
{
    public class FilesService : IFilesService
    {
        private readonly string _folderPath;
        private readonly IFilesRepository _filesRepository;
        private readonly ISheredDirRepository _sheredDirRepository;

        public FilesService(IFilesRepository filesRepository, string folderPath, ISheredDirRepository sheredDirRepository)
        {
            _filesRepository = filesRepository;
            _folderPath = folderPath;
            _sheredDirRepository = sheredDirRepository;
        }

        public  async Task<IEnumerable<string>> GetFileNames(string userId, string path, int page, int pageSize)
        {
            string folderPath = _folderPath + userId  + "\\" + path;
            Console.WriteLine(folderPath);
            if (Directory.Exists(folderPath))
            {
                var files = await Task.Run(() => Directory.GetFileSystemEntries(folderPath)
                                 .Select(Path.GetFileName)
                                 .ToList());
                
                Console.WriteLine(files);
                return files.Skip((page - 1) * pageSize).Take(pageSize);
            }
            return null;
        }

        public async Task<int> GetTotalFileCount(string userId, string path)
        {
            string folderPath = _folderPath + userId + "\\" + path;
            if (Directory.Exists(folderPath))
            {
                return await Task.Run(() => Directory.GetFileSystemEntries(folderPath).Length);
            }
            return 0;
        }

        public string GetImageMimeType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                _ => "application/octet-stream"
            };
        }

        public string GetMimeType(string extension)
        {
            return extension.ToLower() switch
            {
                ".txt" => "text/plain",
                ".pdf" => "application/pdf",
                ".doc" => "application/vnd.ms-word",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".mp4" => "video/mp4",
                ".zip" => "application/zip",
                _ => "application/octet-stream"
            };
        }




        public bool IsImageFile(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" or ".png" or ".gif" or ".bmp" => true,
                _ => false
            };
        }

        public string? GetUserIdFromToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            if (handler.CanReadToken(token))
            {
                JwtSecurityToken jwtToken = handler.ReadJwtToken(token);
                string? userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

                return userId;
            }
            return null;
        }

        public async Task<string> CreateSheredDirAsync(string ownerUserId, string path, string connectedUserId)
        {
            string originalFolderPath = Path.Combine(_folderPath, ownerUserId, path);
            originalFolderPath = Path.GetFullPath(originalFolderPath);

            string symlinkPath = Path.Combine(_folderPath, connectedUserId, path);
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
            string originalFolderPath = Path.Combine(_folderPath, ownerUserId, path);
            originalFolderPath = Path.GetFullPath(originalFolderPath);

            if (!Directory.Exists(originalFolderPath))
            {
                return null;
            }

            var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(originalFolderPath);
            var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);

            if (users == null || users.Count()==0)
            {
                await _sheredDirRepository.RemoveSheredDirAsync(owner.Id);
                return null;
            }

            var user = users.FirstOrDefault(item => item.ConnectedUserId.ToString() == connectedUserId);
            if (user == null || users.Count()==0)
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
