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
        private readonly string _folderPath;

        public FilesController(IFilesService filesService, IFilesRepository filesRepository, string folderPath, ISheredDirRepository sheredDirRepository, HttpClient httpClient)
        {
            _filesService = filesService;
            _filesRepository = filesRepository;
            _folderPath = folderPath;
            _shredDirRepository = sheredDirRepository;
            _httpClient = httpClient;
        }

        [Route("get_files_name")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetFilesNameAsync([FromQuery] string path, [FromQuery] int page, [FromQuery] int pageSize, [FromQuery] bool isPublic)
        {
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var userId = _filesService.GetUserIdFromToken(token);

            if (path == null)
                path = "";

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

        [Route("all_to_add")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetAllAddUsersAsync([FromQuery] string path)
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

                var FilePath = Path.GetFullPath(_folderPath + userId + path);

                var owner = await _shredDirRepository.GetSheredDirByDirLocationAsync(FilePath);


                if (owner != null && owner.OwnerId == userId)
                    return Results.StatusCode(201);

                if (owner == null)
                {
                    var connectedUser = await _shredDirRepository.GetConnectedUserBySimLinkLocationAsync(FilePath);
                    if (connectedUser != null)
                    {
                        owner = await _shredDirRepository.GetSheredDirByIdAsync(connectedUser.SheredDirId);
                    }
                }

                if (owner == null)
                    return Results.StatusCode(201);


                var response = await _httpClient.GetAsync($"http://localhost:7001/User/id/{owner.OwnerId}");

                if (response.IsSuccessStatusCode && response.Content != null)
                {
                    var user = await response.Content.ReadFromJsonAsync<UserModel>();
                    return user != null ? Results.Ok(user) : Results.NotFound("User not found");
                }

                return Results.BadRequest("Failed to get user information");
            }
            catch (Exception ex)
            {

                return Results.Problem("Internal server error");
            }
        }



        [Route("get_connected_users")]
        [HttpGet]
        [Authorize]
        public async Task<IResult> GetConnectedUsersAsync([FromQuery] string path)
        {
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var userId = _filesService.GetUserIdFromToken(token);

            var FilePath = Path.GetFullPath(_folderPath + userId + path);

            var owner = await _shredDirRepository.GetSheredDirByDirLocationAsync(FilePath);

            if (owner == null)
            {
                var dir = await _shredDirRepository.GetConnectedUserBySimLinkLocationAsync(FilePath);

                if (dir == null)
                    return Results.Ok();

                owner = await _shredDirRepository.GetSheredDirByIdAsync(dir.SheredDirId);
            }

            var users = await _shredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
            users = users.Where(item => item.ConnectedUserId.ToString() != userId).ToList();

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

        [Route("download")]
        [HttpGet]
        [Authorize]
        public IActionResult DownloadFile([FromQuery] bool isPublic, [FromQuery] string path)
        {
            Console.WriteLine(11111);
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
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var userId = _filesService.GetUserIdFromToken(token);
            if (userId == null)
                return Results.BadRequest();


            string programPath = AppDomain.CurrentDomain.BaseDirectory;
            DriveInfo driveInfo = new DriveInfo(Path.GetPathRoot(programPath));
            var Free = driveInfo.TotalFreeSpace;


            var FilePath = Path.GetFullPath(Path.Combine(_folderPath, userId));
            try
            {
                var Used = new DirectoryInfo(FilePath)
                    .EnumerateFiles("*", SearchOption.AllDirectories)
                    .Sum(file => file.Length);
                    return Results.Json(new
                    {
                        Used = Used,
                        Free = Free
                    });
            }
            catch 
            {
                _filesRepository.MakeDir(userId, "");
                var Used = new DirectoryInfo(FilePath)
                    .EnumerateFiles("*", SearchOption.AllDirectories)
                    .Sum(file => file.Length);
                return Results.Json(new
                {
                    Used = Used,
                    Free = Free
                });
            }
        }


        [Route("upload")]
        [HttpPost]
        [Authorize]
        public async Task<IResult> UploadFilesAsync([FromQuery] string path, [FromQuery] bool isPublic, [FromForm] List<IFormFile> files)
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

        [Route("make_dir")]
        [HttpPost]
        [Authorize]
        public IResult MakePublicDir([FromBody] CreateDirDto dto)
        {
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var userId = _filesService.GetUserIdFromToken(token);

            if (dto.isPublic)
                userId = "public\\" + userId;

            var fileNames = _filesRepository.MakeDir(userId, dto.path);
            Console.WriteLine(fileNames);
            if (fileNames == null)
            {
                return Results.BadRequest();
            }

            return Results.Ok();
        }

        [Route("change_name")]
        [HttpPut]
        [Authorize]
        public async Task<IResult> ChangeFileNameAsync([FromBody] ChangeFileNameDto dto)
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
            return Results.Ok();
        }

        [HttpDelete]
        [Authorize]
        public async Task<IResult> DeleteFilesAsync([FromBody] DeleteFilesDto dto)
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

            return Results.Ok();
        }

        [Route("add_user")]
        [HttpPost]
        [Authorize]
        public async Task<IResult> AddUserToDirAsync([FromBody] AddUserDto dto)
        {
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var ownerUserId = _filesService.GetUserIdFromToken(token);

            string newPath = await _filesService.CreateSheredDirAsync(ownerUserId, dto.Path, dto.ConnectedUserId);
            if (newPath == null)
                return Results.BadRequest();
            return Results.Ok();
        }

        [Route("del_user")]
        [HttpDelete]
        [Authorize]
        public async Task<IResult> DelUserToDirAsync([FromBody] AddUserDto dto)
        {
            var token = Request.Headers["Authorization"].ToString();
            token = token.Substring(7);
            var ownerUserId = _filesService.GetUserIdFromToken(token);

            var newPath = await _filesService.DeleteConnectedUserAsync(ownerUserId, dto.Path, dto.ConnectedUserId);

            if (newPath == null)
                return Results.BadRequest();
            return Results.Ok();
        }
    }
}
