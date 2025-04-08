using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Presistence.Dtos
{
    public class CreateDirDto
    {
        public bool isPublic { get; set; }
        public string path { get; set; }
    }
}
