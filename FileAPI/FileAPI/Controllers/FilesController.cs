using Aplication.Interfeses;
using Microsoft.AspNetCore.Mvc;
using Presistence.Dtos;
using Core;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;
using System.Diagnostics.Eventing.Reader;
using System.IO;

namespace FileAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IFilesService _filesService;
        private readonly IFilesRepository _filesRepository;
        private readonly ISheredDirRepository _shredDirRepository;
        private readonly ISheredDirService _sheredDirService;
        private readonly IPdfRepository _pdfRepository;
        private readonly IUserService _userService;
        private readonly string _folderPath;

        public FilesController(IFilesService filesService, IFilesRepository filesRepository, string folderPath, ISheredDirRepository sheredDirRepository,
            HttpClient httpClient, ISheredDirService sheredDirService, IPdfRepository pdfRepository, IUserService userService)
        {
            _filesService = filesService;
            _filesRepository = filesRepository;
            _folderPath = folderPath;
            _shredDirRepository = sheredDirRepository;
            _httpClient = httpClient;
            _sheredDirService = sheredDirService;
            _pdfRepository = pdfRepository;
            _userService = userService;
        }

        [Route("get_files_name")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetFilesNameAsync([FromQuery] string path, [FromQuery] int page, [FromQuery] int pageSize, [FromQuery] bool isPublic)
        {
            try
            {
                var userId = _userService.GetId(Request);

                if (isPublic)
                    userId = "public\\" + userId;

                var fulPath = _filesService.GetPath(userId, path);

                var fileNames = await _filesService.GetFileNames(fulPath, page, pageSize);

                if (fileNames == null)
                    return Results.BadRequest();


                var totalCount = await _filesService.GetTotalFileCount(fulPath);

                return Results.Json(new
                {
                    Data = fileNames,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                });
            }
            catch
            {

                return Results.Problem();
            }
        }

        [Route("all_to_add")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetAllAddUsersAsync([FromQuery] string path)
        {
            try
            {
                Guid.TryParse(_userService.GetId(Request), out var userId);

                var FilePath = _filesService.GetPath(userId.ToString(), path);


                var response = await _httpClient.GetAsync("http://localhost:7001/User/all");
                var allUsers = await response.Content.ReadFromJsonAsync<List<UserModel>>();

                var owner = await _shredDirRepository.GetSheredDirByDirLocationAsync(FilePath);
                if (owner != null)
                {
                    var connectedUsers = await _shredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
                    foreach (var user in connectedUsers)
                    {
                        allUsers = allUsers.Where(item => item.Id != user.ConnectedUserId).ToList();
                    }

                }

                var users = allUsers.Where(item => item.Id != userId);
                if (users == null) return Results.BadRequest();
                return Results.Json(users);
            }
            catch
            {

                return Results.Problem();
            }
        }


        [Route("get_owner")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetOwnerAsync([FromQuery] string path)
        {
            try
            {
                Guid.TryParse(_userService.GetId(Request), out var userId);
                var fulPath = _filesService.GetPath(userId.ToString(), path);

                var owner = await _sheredDirService.GetOwnerAsync(userId, fulPath);

                if (owner == null)
                    return Results.StatusCode(201);

                var response = await _httpClient.GetAsync($"http://localhost:7001/User/id/{owner.OwnerId}");

                if (response.IsSuccessStatusCode && response.Content != null)
                {
                    var user = await response.Content.ReadFromJsonAsync<UserModel>();
                    return user != null ? Results.Ok(user) : Results.NotFound();
                }

                return Results.BadRequest();
            }
            catch
            {

                return Results.Problem();
            }
        }



        [Route("get_connected_users")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetConnectedUsersAsync([FromQuery] string path)
        {
            try
            {
                var userId = _userService.GetId(Request);
                var fulPath = _filesService.GetPath(userId, path);

                var users = await _sheredDirService.GetConnectedUsersAsync(userId, fulPath);

                if (users == null)
                    return Results.StatusCode(201);

                List<UserModel> result = new List<UserModel>();
                foreach (var user in users)
                {
                    var response = await _httpClient.GetAsync($"http://localhost:7001/User/id/{user.ConnectedUserId}");
                    if (response.IsSuccessStatusCode)
                    {
                        result.Add(await response.Content.ReadFromJsonAsync<UserModel>());

                    }
                }
                return Results.Ok(result);
            }
            catch
            {

                return Results.Problem();
            }
        }


        [Route("open_image/{userId}")]
        [HttpGet]
        public IResult OpenImage([FromQuery] bool isPublic, [FromQuery] string path, string userId)
        {
            try
            {
                if (isPublic)
                    userId = "public\\" + userId;

                if (!_filesService.IsImageFile(path))
                {
                    return Results.BadRequest();
                }

                var fulPath = _filesService.GetPath(userId, path);

                var fileStream = _filesRepository.GetFileStream(fulPath);

                var mimeType = _filesService.GetImageMimeType(path);

                if (fileStream == null)
                    return Results.BadRequest();
                return Results.File(fileStream, mimeType);
            }
            catch
            {
                return Results.NotFound();
            }

        }

        [Route("open_pdf")]
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> OpenPdfAsync([FromQuery] bool isPublic, [FromQuery] string path)
        {
            var userId = _userService.GetId(Request);
            var fulPath = _filesService.GetPath(userId, path);

            if (isPublic)
                userId = "public\\" + userId;

            var fileStream = _filesRepository.GetFileStream(fulPath);

            if (fileStream == null) return BadRequest();

            var page = await _pdfRepository.GetCurrentPageAsync(fulPath);
            if (page == null)
                return NotFound();

            Response.Headers.Append("X-Current-Page", page.ToString());
            Response.Headers.Append("Access-Control-Expose-Headers", "X-Current-Page");

            return File(fileStream, "application/pdf", enableRangeProcessing: true);
        }

        [Route("add_pdf_page")]
        [HttpPost]
        [Authorize]
        public async Task<IResult> AddPdfPageAsync([FromBody] CurentPageDto dto)
        {
            var userId = _userService.GetId(Request);
            var fulPath = _filesService.GetPath(userId, dto.Path);

            if (dto.IsPublic)
                userId = "public\\" + userId;

            var page = await _pdfRepository.AddCurrentPageAsync(fulPath, dto.CurentPage);
            if (page == null) return Results.NotFound();
            return Results.Ok(page);
        }

        [Route("download")]
        [HttpGet]
        [Authorize]
        public IActionResult DownloadFile([FromQuery] bool isPublic, [FromQuery] string path)
        {
            try
            {
                var userId = _userService.GetId(Request);
                var fulPath = _filesService.GetPath(userId, path);
                if (userId == null)
                    return Unauthorized();

                var fileStream = _filesRepository.GetFileStream(fulPath);
                if (fileStream == null) return BadRequest();

                var fileLength = fileStream.Length;

                return new FileStreamResult(fileStream, "application/octet-stream")
                {
                    FileDownloadName = Path.GetFileName(path),
                    EnableRangeProcessing = true,

                    EntityTag = new Microsoft.Net.Http.Headers.EntityTagHeaderValue($"\"{fileLength}\""),
                    LastModified = DateTimeOffset.UtcNow
                };
            }
            catch
            {
                return BadRequest();
            }
        }


        [Route("volume")]
        [HttpGet]
        [Authorize]
        public IResult GetVolume()
        {
            try
            {
                var userId = _userService.GetId(Request);
                if (userId == null)
                    return Results.BadRequest();


                var volume = _filesService.GetVolume(userId);
                return Results.Json(volume);
            }
            catch
            {
                return Results.Problem();
            }
        }


        [Route("upload")]
        [HttpPost]
        [Authorize]
        public async Task<IResult> UploadFilesAsync([FromQuery] string path, [FromQuery] bool isPublic, [FromForm] List<IFormFile> files)
        {
            try
            {
                var userId = _userService.GetId(Request);
                var fulPath = _filesService.GetPath(userId, path);

                if (files == null || files.Count == 0)
                    return Results.BadRequest("No files uploaded.");

                if (isPublic)
                    userId = "public\\" + userId;

                var uploadedPaths = new List<string>();

                foreach (var file in files)
                {
                    string filePath = await _filesRepository.Upload(fulPath, file);

                    if (filePath == null)
                        return Results.BadRequest($"Failed to upload file: {file.FileName}");

                    uploadedPaths.Add(filePath);
                }

                return Results.Ok(uploadedPaths);
            }
            catch
            {
                return Results.Problem();
            }
        }

        [Route("make_dir")]
        [HttpPost]
        [Authorize]
        public IResult MakePublicDir([FromBody] CreateDirDto dto)
        {
            try
            {
                var userId = _userService.GetId(Request);
                var fulPath = _filesService.GetPath(userId, dto.path);

                if (dto.isPublic)
                    userId = "public\\" + userId;

                var fileNames = _filesRepository.MakeDir(fulPath);

                if (fileNames == null)
                {
                    return Results.BadRequest();
                }

                return Results.Ok(fileNames);
            }
            catch
            {
                return Results.Problem();
            }
        }

        [Route("change_name")]
        [HttpPut]
        [Authorize]
        public async Task<IResult> ChangeFileNameAsync([FromBody] ChangeFileNameDto dto)
        {
            try
            {
                var userId = _userService.GetId(Request);
                var oldPath = _filesService.GetPath(userId, dto.OldPath);
                var newPath = _filesService.GetPath(userId, dto.NewPath);

                if (dto.IsPublic)
                    userId = "public\\" + userId;

                var fileNames = await _filesRepository.ChangeName(oldPath, newPath);
                if (fileNames == null)
                {
                    return Results.BadRequest();
                }
                return Results.Ok(fileNames);
            }
            catch
            {
                return Results.Problem();
            }
        }

        [Route("union_files")]
        [HttpPut]
        [Authorize]
        public async Task<IResult> UnionFilesAsync([FromBody] UnionDto dto)
        {
            try
            {
                var names = dto.Names;
                var path = dto.Path;
                var dirName = dto.DirName;

                var userId = _userService.GetId(Request);

                if (dto.IsPublic)
                    userId = "public\\" + userId;

                if (names == null || names.Count() == 0)
                {
                    return Results.BadRequest();
                }

                var dirPath = _filesService.GetPath(userId, path+dirName);

                dirName = _filesRepository.MakeDir(dirPath);

                string[] parts = dirName.Split("\\");

                dirName = parts.Length > 0 ? parts[parts.Length-1] : path;

                foreach (var name in names)
                {
                    var oldPath = _filesService.GetPath(userId, path+name);
                    var newPath = _filesService.GetPath(userId, dirName + "\\" + name);
                    var fileNames = await _filesRepository.ChangeName(oldPath, newPath);
                }
                return Results.Ok();
            }
            catch
            {
                return Results.Problem();
            }
        }

        [HttpDelete]
        [Authorize]
        public async Task<IResult> DeleteFilesAsync([FromBody] DeleteFilesDto dto)
        {
            try
            {
                var userId = _userService.GetId(Request);
                if (dto.IsPublic)
                    userId = "public\\" + userId;

                for (int i = 0; i<dto.Pathes.Count(); i++)
                {
                    dto.Pathes[i] = _filesService.GetPath(userId, dto.Pathes[i]);
                }

                var fileNames = await _filesRepository.Delete(dto.Pathes);
                if (fileNames == null)
                {
                    return Results.BadRequest();
                }

                return Results.Ok(fileNames);
            }
            catch
            {
                return Results.Problem();
            }
        }

        [Route("add_user")]
        [HttpPost]
        [Authorize]
        public async Task<IResult> AddUserToDirAsync([FromBody] AddUserDto dto)
        {
            try
            {
                var ownerUserId = _userService.GetId(Request);

                string newPath = await _sheredDirService.CreateSheredDirAsync(ownerUserId, dto.Path, dto.ConnectedUserId);
                if (newPath == null)
                    return Results.BadRequest();
                return Results.Ok(newPath);
            }
            catch
            {
                return Results.Problem();
            }
        }

        [Route("del_user")]
        [HttpDelete]
        [Authorize]
        public async Task<IResult> DelUserToDirAsync([FromBody] AddUserDto dto)
        {
            try
            {
                var ownerUserId = _userService.GetId(Request);

                var user = await _sheredDirService.DeleteConnectedUserAsync(ownerUserId, dto.Path, dto.ConnectedUserId);

                if (user == null)
                    return Results.BadRequest();
                return Results.Ok(user);
            }
            catch
            {
                return Results.Problem();
            }
        }
    }
}
