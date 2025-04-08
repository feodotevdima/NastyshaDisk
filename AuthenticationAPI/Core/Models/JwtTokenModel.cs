namespace Core.Models
{
    public class JwtTokenModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiration { get; set; }
    }
}
