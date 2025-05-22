using Presistence.Dtos;

namespace Aplication.Interfeses
{
    public interface IFilesService
    {
        Task<IEnumerable<string>> GetFileNames(string path, int page, int pageSize);
        Task<int> GetTotalFileCount(string path);
        string GetImageMimeType(string fileName);
        string GetMimeType(string extension);
        bool IsImageFile(string fileName);
        VolumeDto GetVolume(string userId);
        string GetPath(string userId, string path);
    }
}
