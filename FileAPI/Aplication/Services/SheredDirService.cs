using Aplication.Interfeses;
using Aplication.Repository;
using Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Services
{
    public class SheredDirService : ISheredDirService
    {
        private readonly string _folderPath;
        private readonly IFilesRepository _filesRepository;
        private readonly ISheredDirRepository _sheredDirRepository;

        public SheredDirService(IFilesRepository filesRepository, string folderPath, ISheredDirRepository sheredDirRepository)
        {
            _filesRepository = filesRepository;
            _folderPath = folderPath;
            _sheredDirRepository = sheredDirRepository;
        }


        public async Task<SheredDirOwner?> GetOwnerAsync(Guid userId, string path)
        {
            var FilePath = Path.GetFullPath(_folderPath + userId + path);

            var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(FilePath);

            if (owner != null && owner.OwnerId == userId)
                return null;

            if (owner == null)
            {
                var connectedUser = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(FilePath);
                if (connectedUser != null)
                {
                    owner = await _sheredDirRepository.GetSheredDirByIdAsync(connectedUser.SheredDirId);
                }
            }
            return owner;
        }

        public async Task<List<ConnectedUser>> GetConnectedUsersAsync(string userId, string path)
        {
            var FilePath = Path.GetFullPath(_folderPath + userId + path);

            var owner = await _sheredDirRepository.GetSheredDirByDirLocationAsync(FilePath);

            if (owner == null)
            {
                var dir = await _sheredDirRepository.GetConnectedUserBySimLinkLocationAsync(FilePath);

                if (dir == null)
                    return null;

                owner = await _sheredDirRepository.GetSheredDirByIdAsync(dir.SheredDirId);
            }

            var users = await _sheredDirRepository.GetConnectedUsersBySheredDirIdAsync(owner.Id);
            users = users.Where(item => item.ConnectedUserId.ToString() != userId).ToList();
            return users;
        }
    }
}
