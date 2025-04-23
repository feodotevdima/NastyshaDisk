using Core;
using Presistence.Dtos;

namespace Aplication.Interfeses
{
    public interface IFilesService
    {
        Task<IEnumerable<string>> GetFileNames(string userId, string path, int page, int pageSize);
        Task<int> GetTotalFileCount(string userId, string path);
        string GetImageMimeType(string fileName);
        string GetMimeType(string extension);
        bool IsImageFile(string fileName);
        string? GetUserIdFromToken(string token);
        Task<string> CreateSheredDirAsync(string ownerUserId, string path, string id);
        Task<ConnectedUser> DeleteConnectedUserAsync(string ownerUserId, string path, string connectedUserId);
        VolumeDto GetVolume(string userId);
    }
}
