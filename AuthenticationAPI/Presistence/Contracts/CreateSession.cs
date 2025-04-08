namespace Presistence.Contracts
{
    public record CreateSession(Guid UserId, string AccessToken, string RefreshToken, DateTime RefreshTokenExpiration);
}
