using Microsoft.AspNetCore.Http;

namespace Aplication.Interfeses
{
    public interface IFilesRepository
    {
        FileStream? GetFileStream(string userId, string path);
        Task<string> Upload(string userId, string path, IFormFile file);
        string? MakeDir(String userId, string path);
        Task<List<string>>? Delete(string userId, List<string> paths);
        string? Delete(string path);
        Task<string> ChangeName(string userId, string oldPath, string newPath);
        string CreateSymlinkWindows(string originalFolderPath, string symlinkPath);
        string CreateSymlinkUnix(string originalFolderPath, string symlinkPath);
    }
}
