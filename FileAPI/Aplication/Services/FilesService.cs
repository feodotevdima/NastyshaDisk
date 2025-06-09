using Aplication.Interfeses;
using Core;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration.UserSecrets;
using Presistence.Dtos;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.InteropServices;

namespace Aplication.Services
{
    public class FilesService : IFilesService
    {
        private readonly string _folderPath;
        private readonly IFilesRepository _filesRepository;

        public FilesService(IFilesRepository filesRepository, string folderPath)
        {
            _filesRepository = filesRepository;
            _folderPath = folderPath;
        }

        public  async Task<IEnumerable<string>> GetFileNames(string path, int page, int pageSize)
        {
            if (Directory.Exists(path))
            {
                var files = await Task.Run(() => Directory.GetFileSystemEntries(path)
                                 .Select(Path.GetFileName)
                                 .ToList());
                
                return files.Skip((page - 1) * pageSize).Take(pageSize);
            }
            return null;
        }

        public async Task<int> GetTotalFileCount(string path)
        {
            if (Directory.Exists(path))
            {
                return await Task.Run(() => Directory.GetFileSystemEntries(path).Length);
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

        public VolumeDto GetVolume(string userId)
        {
            string programPath = AppDomain.CurrentDomain.BaseDirectory;
            DriveInfo driveInfo = new DriveInfo(Path.GetPathRoot(programPath));
            VolumeDto volume = new VolumeDto();
            volume.Free = driveInfo.TotalFreeSpace;

            var FilePath = Path.GetFullPath(_folderPath + userId);
            try
            {
                volume.Used = new DirectoryInfo(FilePath)
                    .EnumerateFiles("*", SearchOption.AllDirectories)
                    .Sum(file => file.Length);
                return volume;
            }
            catch
            {
                volume.Used = 0;
                return volume;
            }
        }

        public string GetPath(string userId, string path)
        {
            string folderPath = _folderPath + userId + "/" + path;

            bool isSlash = false;
            string result = "";
            foreach (var s in folderPath)
            {
                if (s == '/' && !isSlash)
                {
                    isSlash = true;
                    result += '/';
                }
                if (s != '/')
                {
                    if (isSlash)
                        isSlash = false;
                    result += s;
                }
            }
            return result;
        }
    }
}
