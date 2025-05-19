using Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Interfeses
{
    public interface IPdfRepository
    {
        Task<List<PdfModel>?> GetPdfAsync();
        Task<PdfModel?> GetPdfByPathAsync(string path);
        Task<PdfModel> AddPdfAsync(PdfModel pdf);
        Task<PdfModel> RemovePdfAsync(string path);
        Task<PdfModel> UpdatePdfAsync(PdfModel pdf);
        Task<int?> GetCurrentPageAsync(string userId, string path);
        Task<int?> AddCurrentPageAsync(string userId, string path, int page);
    }
}
