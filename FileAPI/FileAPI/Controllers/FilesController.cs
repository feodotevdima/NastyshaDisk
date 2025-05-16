using Aplication.Interfeses;
using Microsoft.AspNetCore.Mvc;
using Presistence.Dtos;
using Core;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;
using System.Diagnostics.Eventing.Reader;

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
        private readonly string _folderPath;

        public FilesController(IFilesService filesService, IFilesRepository filesRepository, string folderPath, ISheredDirRepository sheredDirRepository, HttpClient httpClient, ISheredDirService sheredDirService)
        {
            _filesService = filesService;
            _filesRepository = filesRepository;
            _folderPath = folderPath;
            _shredDirRepository = sheredDirRepository;
            _httpClient = httpClient;
            _sheredDirService = sheredDirService;
        }

        [Route("get_files_name")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetFilesNameAsync([FromQuery] string path, [FromQuery] int page, [FromQuery] int pageSize, [FromQuery] bool isPublic)
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);

                if (isPublic)
                    userId = "public\\" + userId;

                var fileNames = await _filesService.GetFileNames(userId, path, page, pageSize);

                if (fileNames == null)
                    return Results.BadRequest();


                var totalCount = await _filesService.GetTotalFileCount(userId, path);

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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                Guid.TryParse(_filesService.GetUserIdFromToken(token), out var userId);

                var FilePath = Path.GetFullPath(_folderPath + userId + path);


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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                Guid.TryParse(_filesService.GetUserIdFromToken(token), out var userId);

                var owner = await _sheredDirService.GetOwnerAsync(userId, path);

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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);

                var users = await _sheredDirService.GetConnectedUsersAsync(userId, path);

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
            if (isPublic)
                userId = "public\\" + userId;
            try
            {
                if (!_filesService.IsImageFile(path))
                {
                    return Results.BadRequest();
                }

                var fileStream = _filesRepository.GetFileStream(userId, path);

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
        public IActionResult OpenPdf([FromQuery] bool isPublic, [FromQuery] string path)
        {
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var userId = _filesService.GetUserIdFromToken(token);

            if (isPublic)
                userId = "public\\" + userId;

            var fileStream = _filesRepository.GetFileStream(userId, path);

            if (fileStream == null) return BadRequest();

            return File(fileStream, "application/pdf", enableRangeProcessing: true);

        }

        [Route("download")]
        [HttpGet]
        [Authorize]
        public IActionResult DownloadFile([FromQuery] bool isPublic, [FromQuery] string path)
        {
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var userId = _filesService.GetUserIdFromToken(token);
            if (userId == null)
                return Unauthorized();

            try
            {
                var fileStream = _filesRepository.GetFileStream(userId, path);
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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);
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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);


                if (files == null || files.Count == 0)
                    return Results.BadRequest("No files uploaded.");

                if (isPublic)
                    userId = "public\\" + userId;

                var uploadedPaths = new List<string>();

                foreach (var file in files)
                {
                    string filePath = await _filesRepository.Upload(userId, path, file);

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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);

                if (dto.isPublic)
                    userId = "public\\" + userId;

                var fileNames = _filesRepository.MakeDir(userId, dto.path);

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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);

                if (dto.IsPublic)
                    userId = "public\\" + userId;

                var fileNames = await _filesRepository.ChangeName(userId, dto.OldPath, dto.NewPath);
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

                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);

                if (dto.IsPublic)
                    userId = "public\\" + userId;

                if (names == null || names.Count() == 0)
                {
                    return Results.BadRequest();
                }

                dirName = _filesRepository.MakeDir(userId, path + dirName);
                string[] parts = dirName.Split("\\");
                dirName = parts.Length > 0 ? parts[parts.Length-1] : path;

                foreach (var name in names)
                {
                    var fileNames = await _filesRepository.ChangeName(userId, path + name, path+ dirName + "\\" + name);
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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var userId = _filesService.GetUserIdFromToken(token);

                if (dto.IsPublic)
                    userId = "public\\" + userId;

                var fileNames = await _filesRepository.Delete(userId, dto.Pathes);
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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var ownerUserId = _filesService.GetUserIdFromToken(token);

                string newPath = await _filesService.CreateSheredDirAsync(ownerUserId, dto.Path, dto.ConnectedUserId);
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
                var token = Request.Headers["Authorization"].ToString();
                token = token.Substring(7);
                var ownerUserId = _filesService.GetUserIdFromToken(token);

                var user = await _filesService.DeleteConnectedUserAsync(ownerUserId, dto.Path, dto.ConnectedUserId);

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
