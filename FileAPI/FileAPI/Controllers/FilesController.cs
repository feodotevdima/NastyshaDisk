using Aplication.Interfeses;
using Microsoft.AspNetCore.Mvc;
using Presistence.Dtos;
using Core;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;

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

            var files = new List<FileNameDto>();
            foreach (var file in fileNames)
            {
                var ReturnDto = new FileNameDto(file, _httpClient);
                var filePath = Path.GetFullPath(Path.Combine(_folderPath, userId, path, file));

                var owner = await _shredDirRepository.GetSheredDirByDirLocationAsync(filePath);
                if (owner != null)
                {
                    var connectedUsers = await _shredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
                    if (connectedUsers != null && connectedUsers.Count() != 0)
                    {
                        ReturnDto.ConectedUsers = new List<UserModel>();
                        foreach (var user in connectedUsers)
                        {
                            ReturnDto.ConectedUsers.Add(await ReturnDto.GetUserAsync(user.ConnectedUserId.ToString()));
                        }
                    }
                }

                var connectUser = await _shredDirRepository.GetConnectedUsersBySimLinkLocationAsync(filePath);
                if (connectUser != null)
                {
                    owner = await _shredDirRepository.GetSheredDirByIdAsync(connectUser.SheredDirId);

                    ReturnDto.Owner = await ReturnDto.GetUserAsync(owner.OwnerId.ToString());
                }

                files.Add(ReturnDto);
            }

            var totalCount = await _filesService.GetTotalFileCount(userId, path);

            return Results.Json(new
            {
                Data = files,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }


        [Route("open_image")]
        [HttpGet]
        public IResult OpenImage(bool isPublic, string userId, string path)
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
            var Used = new DirectoryInfo(FilePath)
                .EnumerateFiles("*", SearchOption.AllDirectories)
                .Sum(file => file.Length);

            return Results.Json(new
            {
                Used = Used,
                Free = Free
            });
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
        public IResult ChangeFileName(bool isPublic, string userId, string oldPath, string newPath)
        {

            if (isPublic)
                userId = "public\\" + userId;

            var fileNames = _filesRepository.ChangeName(userId, oldPath, newPath);
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

            Console.WriteLine(dto.Pathes);
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
        public async Task<IResult> AddUserToDirAsync(string ownerUserId, string path, string connectedUserId)
        {
            string newPath = await _filesService.CreateSheredDirAsync(ownerUserId, path, connectedUserId);

            if (newPath == null) 
                return Results.BadRequest();
            return Results.Ok();
        }

        [Route("del_user")]
        [HttpDelete]
        public async Task<IResult> DelUserToDirAsync(string ownerUserId, string path, string connectedUserId)
        {
            var newPath = await _filesService.DeleteConnectedUserAsync(ownerUserId, path, connectedUserId);

            if (newPath == null)
                return Results.BadRequest();
            return Results.Ok();
        }
    }
}
