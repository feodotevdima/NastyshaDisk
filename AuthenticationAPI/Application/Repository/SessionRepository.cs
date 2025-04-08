using Application.Interfeses;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Presistence;
using Presistence.Contracts;

namespace Application.Repository
{
    public class SessionRepository : ISessionRepository
    {
        public async Task<JwtTokenModel?> AddSessionAsync(CreateSession session)
        {
            if (session == null) return null;
            var tokens = new JwtTokenModel();
            tokens.UserId = session.UserId;
            tokens.AccessToken = session.AccessToken;
            tokens.RefreshToken = session.RefreshToken;
            tokens.RefreshTokenExpiration = session.RefreshTokenExpiration;

            using (SessionContext db = new SessionContext())
            {
                await db.Sessions.AddAsync(tokens);
                await db.SaveChangesAsync();
            }
            return tokens;
        }

        public async Task<JwtTokenModel> AddSessionAsync(Guid userId)
        {
            var tokens = new JwtTokenModel();
            tokens.UserId = userId;
            tokens.AccessToken = "";
            tokens.RefreshToken = "";
            tokens.RefreshTokenExpiration = DateTime.MinValue;
            using (SessionContext db = new SessionContext())
            {
                await db.Sessions.AddAsync(tokens);
                await db.SaveChangesAsync();
            }
            return tokens;
        }

        public async Task<JwtTokenModel?> RemoveSessionAsync(Guid id)
        {
            var session = await GetSessionByIdAsync(id);
            if (session == null) return null;
            using (SessionContext db = new SessionContext())
            {
                db.Sessions.Remove(session);
                await db.SaveChangesAsync();
            }
            return session;
        }

        public async Task<JwtTokenModel?> UpdateSessionAsync(JwtTokenModel session)
        {
            if (session == null) return null;
            using (SessionContext db = new SessionContext())
            {
                db.Sessions.Update(session);
                await db.SaveChangesAsync();
            }
            return session;
        }

        public async Task<List<JwtTokenModel>> GetSessionsAsync()
        {
            using (SessionContext db = new SessionContext())
            {
                var sessions = await db.Sessions.ToListAsync();
                return sessions;
            }
        }

        public async Task<JwtTokenModel?> GetSessionByIdAsync(Guid id)
        {
            List<JwtTokenModel> sessions = await GetSessionsAsync();
            var session = sessions.FirstOrDefault(item => item.Id == id);
            return session;
        }

        public async Task<JwtTokenModel?> GetSessionByUserIdAsync(Guid UserId)
        {
            List<JwtTokenModel> sessions = await GetSessionsAsync();
            var session = sessions.FirstOrDefault(item => item.UserId == UserId);
            return session;
        }

        public async Task<JwtTokenModel?> GetSessionByAccessTokenAsync(string accessToken)
        {
            List<JwtTokenModel> sessions = await GetSessionsAsync();
            var session = sessions.FirstOrDefault(item => item.AccessToken == accessToken);
            return session;
        }
    }
}
