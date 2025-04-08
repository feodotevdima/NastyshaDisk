using Core.Models;
using Presistence.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfeses
{
    public interface ISessionRepository
    {
        public Task<JwtTokenModel?> AddSessionAsync(CreateSession session);
        public Task<JwtTokenModel> AddSessionAsync(Guid userId);
        public Task<JwtTokenModel?> RemoveSessionAsync(Guid id);
        public Task<JwtTokenModel?> UpdateSessionAsync(JwtTokenModel session);
        public Task<List<JwtTokenModel>> GetSessionsAsync();
        public Task<JwtTokenModel?> GetSessionByIdAsync(Guid id);
        public Task<JwtTokenModel?> GetSessionByUserIdAsync(Guid UserId);
        public Task<JwtTokenModel?> GetSessionByAccessTokenAsync(string accessToken);
    }
}
