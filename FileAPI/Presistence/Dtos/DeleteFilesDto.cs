using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Presistence.Dtos
{
    public class DeleteFilesDto
    {
        [JsonPropertyName("IsPublic")]
        public bool IsPublic { get; set; }

        [JsonPropertyName("Pathes")]
        public List<string> Pathes { get; set; }
    }
}
