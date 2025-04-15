using System.Text.Json.Serialization;

namespace Presistence.Dtos;

public class ChangeFileNameDto
{
    public bool IsPublic { get; set; }
    public string OldPath { get; set; }
    public string NewPath { get; set; }

    //public ChangeFileNameDto(bool IsPublic, string OldPath, string NewPath)
    //{
    //    this.IsPublic = IsPublic;
    //    this.OldPath = OldPath;
    //    this.NewPath = NewPath;
    //}
}