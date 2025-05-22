using Aplication.Interfeses;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Diagnostics;
using System.IO;


namespace Aplication.Repository
{
    public class FilesRepository : IFilesRepository
    {
        private readonly string _folderPath;
        private readonly ISheredDirRepository _sheredDirRepository;
        private readonly IPdfRepository _pdfRepository;

        public FilesRepository(string folderPath, ISheredDirRepository sheredDirRepository, IPdfRepository pdfRepository)
        {
            _folderPath = folderPath;
            _sheredDirRepository = sheredDirRepository;
            _pdfRepository = pdfRepository;
        }


        public FileStream? GetFileStream(string path)
        {
            if (File.Exists(path))
            {
                return new FileStream(path, FileMode.Open, FileAccess.Read);
            }
            return null;
        }



        public async Task<string> Upload(string path, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            var originalFileName = file.FileName;
            var filePath = path + originalFileName;

            if (File.Exists(filePath))
            {
                var fileNameWithoutExt = Path.GetFileNameWithoutExtension(originalFileName);
                var fileExt = Path.GetExtension(originalFileName);
                int counter = 1;

                do
                {
                    var newFileName = $"{fileNameWithoutExt} ({counter}){fileExt}";
                    filePath = path + newFileName;
                    counter++;
                } while (File.Exists(filePath));
            }

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


        public string? MakeDir(string path)
        { 
            if (Directory.Exists(path))
            {
                var originalFolderPath = path;
                int counter = 1;
                do
                {
                    var newfloderName = $"{originalFolderPath} ({counter})";
                    path = newfloderName;
                    counter++;
                } while (Directory.Exists(path));
            }

            try
            {
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                    return path;
                }
                return null;
            }
            catch
            {
                return null;
            }
        }


        public async Task<List<string>>? Delete(List<string> paths)
        {
            try
            {
                await Task.Run(async () =>
                {
                    foreach (var path in paths)
                    {
                        if(Path.GetExtension(path) == ".pdf")
                        {
                            await _pdfRepository.RemovePdfAsync(path);
                        }

                        if (File.Exists(path))
                        {
                            File.Delete(path);
                        }
                        else if (Directory.Exists(path))
                        {
                            FileAttributes attributes = File.GetAttributes(path);
                            if ((attributes & FileAttributes.ReparsePoint) == FileAttributes.ReparsePoint)
                            {
                                var user = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(path);

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
                                var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(Path.GetFullPath(path));
                                if (owner != null)
                                {
                                    var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
                                    foreach (var user in users)
                                    {
                                        Directory.Delete(user.SimLinkLocation, true);
                                        await _sheredDirRepository.RemoveConnectedUserAsync(user.Id);
                                    }
                                    await _sheredDirRepository.RemoveSheredDirAsync(owner.Id);
                                }
                            }

                            Directory.Delete(path, true);
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

        public async Task<string> ChangeName(string oldPath, string newPath)
        {
            try
            {
                if (Path.GetExtension(oldPath) == ".pdf")
                {
                    var pdf = await _pdfRepository.GetPdfByPathAsync(oldPath);
                    if (pdf != null)
                    {
                        pdf.Path = newPath;
                        await _pdfRepository.UpdatePdfAsync(pdf);
                    }
                }

                if (File.Exists(oldPath))
                {
                    File.Move(oldPath, newPath);
                }
                else if (Directory.Exists(oldPath))
                {
                    Directory.Move(oldPath, newPath);

                    FileAttributes attributes = File.GetAttributes(newPath);
                    if ((attributes & FileAttributes.ReparsePoint) == FileAttributes.ReparsePoint)
                    {
                        var user = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(oldPath);

                        if (user != null)
                        {
                            user.SimLinkLocation = newPath;
                            var changeUser = await _sheredDirRepository.UpdateConnectedUserAsync(user);
                        }

                    }

                    else
                    {
                        var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(Path.GetFullPath(oldPath));
                        if (owner != null)
                        {
                            var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
                            foreach (var user in users)
                            {
                                Directory.Delete(user.SimLinkLocation, true);
                                CreateSymlinkWindows(newPath, user.SimLinkLocation);
                            }
                            owner.DirLocation = newPath;
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
