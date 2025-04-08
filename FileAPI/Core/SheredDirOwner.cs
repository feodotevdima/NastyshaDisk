namespace Core
{
    public class SheredDirOwner
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public string DirLocation { get; set; }

        public SheredDirOwner(string dirLocation, Guid ownerId)
        {
            DirLocation = dirLocation;
            OwnerId = ownerId;
        }
    }
}
