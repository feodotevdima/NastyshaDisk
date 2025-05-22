using Microsoft.AspNetCore.Http;

namespace Aplication.Interfeses
{
    public interface IFilesRepository
    {
        FileStream? GetFileStream(string path);
        Task<string> Upload(string path, IFormFile file);
        string? MakeDir(string path);
        Task<List<string>>? Delete(List<string> paths);
        string? Delete(string path);
        Task<string> ChangeName(string oldPath, string newPath);
        string CreateSymlinkWindows(string originalFolderPath, string symlinkPath);
        string CreateSymlinkUnix(string originalFolderPath, string symlinkPath);
    }
}
