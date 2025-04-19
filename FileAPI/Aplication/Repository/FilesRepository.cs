using Aplication.Interfeses;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;

namespace Aplication.Repository
{
    public class FilesRepository : IFilesRepository
    {
        private readonly string _folderPath;
        private readonly ISheredDirRepository _sheredDirRepository;

        public FilesRepository(string folderPath, ISheredDirRepository sheredDirRepository)
        {
            _folderPath = folderPath;
            _sheredDirRepository = sheredDirRepository;
        }


        public FileStream? GetFileStream(string userId, string path)
        {
            var filePath = Path.Combine(_folderPath, userId, path);

            if (File.Exists(filePath))
            {
                return new FileStream(filePath, FileMode.Open, FileAccess.Read);
            }
            return null;
        }



        public async Task<string> Upload(string userId, string path, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            var filePath = _folderPath + userId+ "\\" + path + file.FileName;
            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                return filePath;
            }
            catch 
            { 
                return null; 
            }
        }


        public string? MakeDir(String userId, string path)
        {
            string folderPath = _folderPath + userId + "\\" + path;
            Console.WriteLine(folderPath);
            try
            {
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                    return folderPath;
                }
                return null;
            }
            catch
            {
                return null;
            }
        }


        public async Task<List<string>>? Delete(string userId, List<string> paths)
        {
            try
            {
                await Task.Run(async () =>
                {
                    foreach (var path in paths)
                    {
                        var filePath = Path.GetFullPath(_folderPath + userId + "\\" + path);

                        Console.WriteLine(filePath);
                        if (File.Exists(filePath))
                        {
                            File.Delete(filePath);
                        }
                        else if (Directory.Exists(filePath))
                        {
                            FileAttributes attributes = File.GetAttributes(filePath);  
                            if ((attributes & FileAttributes.ReparsePoint) == FileAttributes.ReparsePoint)
                            {
                                var user = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(filePath);

                                if (user != null)
                                {
                                    var owner = await _sheredDirRepository.GetSheredDirByIdAsync(user.SheredDirId);

                                    var deleteUser = await _sheredDirRepository.RemoveConnectedUserAsync(user.Id);


                                    var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);

                                    if (users == null || users.Count() == 0)
                                        await _sheredDirRepository.RemoveSheredDirAsync(owner.Id);
                                }
                            }
                            else
                            {
                                Guid.TryParse(userId, out var id);
                                var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(Path.GetFullPath(filePath));
                                if (owner != null )
                                {
                                    var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
                                    foreach(var user in users)
                                    {
                                        Directory.Delete(user.SimLinkLocation, true);
                                        await _sheredDirRepository.RemoveConnectedUserAsync(user.Id);
                                    }
                                    await _sheredDirRepository.RemoveSheredDirAsync(owner.Id);
                                }
                            }

                            Directory.Delete(filePath, true);
                        }
                    }
                });
                return paths;      
            }
            catch
            {
                return null;
            }           
        }

        public string? Delete(string path)
        {
            try
            {

                if (File.Exists(path))
                {
                    File.Delete(path);
                }
                else if (Directory.Exists(path))
                {
                    Directory.Delete(path, true);
                }
                return path;
            }
            catch
            {
                return null;
            }
        }

        public async Task<string> ChangeName(string userId, string oldPath, string newPath)
        {
            try
            {
                var oldFilePath = Path.GetFullPath(_folderPath + userId + oldPath);
                var newFilePath = Path.GetFullPath(_folderPath + userId + newPath);
                Console.WriteLine("ttttt"+oldFilePath);
                Console.WriteLine("ttttt" + newFilePath);
                if (File.Exists(oldFilePath))
                {
                    File.Move(oldFilePath, newFilePath);
                }
                else if (Directory.Exists(oldFilePath))
                {
                    Directory.Move(oldFilePath, newFilePath);

                    FileAttributes attributes = File.GetAttributes(newFilePath);
                    if ((attributes & FileAttributes.ReparsePoint) == FileAttributes.ReparsePoint)
                    {
                        var user = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(oldFilePath);

                        if (user != null)
                        {
                            user.SimLinkLocation = newFilePath;
                            var changeUser = await _sheredDirRepository.UpdateConnectedUserAsync(user);
                        }
                     
                    }

                    else
                    {
                        Guid.TryParse(userId, out var id);
                        var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(Path.GetFullPath(oldFilePath));
                        if (owner != null)
                        {
                            var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
                            foreach (var user in users)
                            {
                                Directory.Delete(user.SimLinkLocation, true);
                                CreateSymlinkWindows(newFilePath, user.SimLinkLocation);
                            }
                            owner.DirLocation = newFilePath;
                            await _sheredDirRepository.UpdateSheredDirAsync(owner);
                        }
                    }
                }
                return newPath;
            }
            catch 
            {
                return null;
            }
        }

        public string CreateSymlinkWindows(string originalFolderPath, string symlinkPath)
        {
            Process process = new Process();
            process.StartInfo.FileName = "cmd.exe";
            process.StartInfo.Arguments = $"/c mklink /D \"{symlinkPath}\" \"{originalFolderPath}\"";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.CreateNoWindow = true;

            process.Start();
            process.WaitForExit();

            if (process.ExitCode == 0)
            {
                return symlinkPath;
            }
            return null;
        }

        public string CreateSymlinkUnix(string originalFolderPath, string symlinkPath)
        {
            Process process = new Process();
            process.StartInfo.FileName = "/bin/ln";
            process.StartInfo.Arguments = $"-s \"{originalFolderPath}\" \"{symlinkPath}\"";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;
            process.StartInfo.CreateNoWindow = true;

            process.Start();
            process.WaitForExit();

            if (process.ExitCode == 0)
            {
                return symlinkPath;
            }
            return null;
        }
    }
}
