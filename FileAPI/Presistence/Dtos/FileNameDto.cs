using Core;
using System.Net.Http.Json;

namespace Presistence.Dtos
{
    public class FileNameDto
    {
        private readonly HttpClient _httpClient;
        public string Name { get; set; }
        public UserModel? Owner { get; set; }
        public List<UserModel>? ConectedUsers { get; set; }


        public FileNameDto(string name, HttpClient httpClient)
        {
            Name = name;
            _httpClient = httpClient;
        }

        public async Task<UserModel> GetUserAsync(string id)
        {
            var response = await _httpClient.GetAsync($"http://localhost:7001/User/id/{id}");
            if (response.IsSuccessStatusCode)
            {
                var user = await response.Content.ReadFromJsonAsync<UserModel>();
                return user;
            }
            return null;
        }
    }
}
