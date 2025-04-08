namespace Core
{
    public class ConnectedUser
    {
        public Guid Id { get; set; }
        public Guid SheredDirId { get; set; }
        public Guid ConnectedUserId { get; set; }
        public string SimLinkLocation { get; set; }

        public ConnectedUser(Guid sheredDirId, Guid connectedUserId, string simLinkLocation) 
        {
            SheredDirId = sheredDirId;
            ConnectedUserId = connectedUserId;
            SimLinkLocation = simLinkLocation;
        }
    }
}
