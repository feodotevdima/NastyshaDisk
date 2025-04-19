using Core;

namespace Aplication.Interfeses
{
    public interface ISheredDirRepository
    {
        Task<List<SheredDirOwner>> GetSheredDirsAsync();
        Task<List<ConnectedUser>> GetConnectedUsersAsync();
        Task<SheredDirOwner?> GetSheredDirByIdAsync(Guid dirId);
        Task<List<SheredDirOwner>> GetSheredDirByOwnerIdAsync(Guid ownerId);
        Task<SheredDirOwner?> GetSheredDirByDirLocationAsync(string path);
        Task<ConnectedUser?> GetConnectedUsersByIdAsync(Guid id);
        Task<ConnectedUser?> GetConnectedUserBySimLinkLocationAsync(string path);
        Task<List<ConnectedUser>> GetConnectedUsersBySheredDirIdAsync(Guid id);
        Task<List<ConnectedUser>> GetConnectedUsersByConnectedUserIdAsync(Guid id);
        Task<SheredDirOwner> AddSheredDirAsync(SheredDirOwner sheredDir);
        Task<ConnectedUser> AddConnectedUserAsync(ConnectedUser connectedUser);
        Task<SheredDirOwner> RemoveSheredDirAsync(Guid id);
        Task<ConnectedUser> RemoveConnectedUserAsync(Guid id);
        Task<SheredDirOwner> UpdateSheredDirAsync(SheredDirOwner SheredDir);
        Task<ConnectedUser> UpdateConnectedUserAsync(ConnectedUser connectedUser);
    }
}
