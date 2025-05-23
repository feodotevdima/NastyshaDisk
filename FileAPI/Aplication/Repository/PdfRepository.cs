﻿using Aplication.Interfeses;
using Core;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Presistence.Contexts;

namespace Aplication.Repository
{
    public class PdfRepository : IPdfRepository
    {
        private readonly string _folderPath;

        public PdfRepository(string folderPath)
        {
            _folderPath = folderPath;
        }

        public async Task<List<PdfModel>?> GetPdfAsync()
        {
            using (PdfContext db = new PdfContext())
            {
                var SheredDirs = await db.Pdf.ToListAsync();
                return SheredDirs;
            }
        }

        public async Task<PdfModel?> GetPdfByPathAsync(string path)
        {
            var pdf = await GetPdfAsync();
            return pdf.FirstOrDefault(item => item.Path == path);
        }


        public async Task<PdfModel> AddPdfAsync(PdfModel pdf)
        {
            if (pdf == null) return null;

            using (PdfContext db = new PdfContext())
            {
                await db.Pdf.AddAsync(pdf);
                await db.SaveChangesAsync();
            }
            return pdf;
        }

        public async Task<PdfModel> RemovePdfAsync(string path)
        {
            var pdf = await GetPdfByPathAsync(path);
            if (pdf == null) return null;
            using (PdfContext db = new PdfContext())
            {
                db.Pdf.Remove(pdf);
                await db.SaveChangesAsync();
            }
            return pdf;
        }

        public async Task<PdfModel> UpdatePdfAsync(PdfModel pdf)
        {
            if (pdf == null) return null;
            using (PdfContext db = new PdfContext())
            {
                db.Pdf.Update(pdf);
                await db.SaveChangesAsync();
            }
            return pdf;
        }


        public async Task<int?> GetCurrentPageAsync(string path)
        {
            var pdf = await GetPdfByPathAsync(path);
            if (pdf == null)
            {
                pdf = new PdfModel();
                pdf.Path = path;
                pdf.CurrentPage = 1;
                var newPdf = await AddPdfAsync(pdf);
                if (newPdf == null) return null;
                return 1;
            }
            else
                return pdf.CurrentPage;
        }

        public async Task<int?> AddCurrentPageAsync(string path, int page)
        {
            var pdf = await GetPdfByPathAsync(path);
            if (pdf == null)
            {
                pdf = new PdfModel();
                pdf.Path = path;
                pdf.CurrentPage = page;
                var newPdf = await AddPdfAsync(pdf);
                if (newPdf == null) return null;
                return page;
            }
            else
            {
                pdf.CurrentPage = page;
                var newPdf = await UpdatePdfAsync(pdf);
                if (newPdf == null) return null;
                return page;
            }
        }
    }
}
