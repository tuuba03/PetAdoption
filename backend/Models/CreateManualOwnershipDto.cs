using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class CreateManualOwnershipDto
{
    [Required(ErrorMessage = "İsim gereklidir")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tür gereklidir")]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Breed { get; set; }

    [Required(ErrorMessage = "Yaş gereklidir")]
    [MaxLength(50)]
    public string Age { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şehir gereklidir")]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sağlık durumu gereklidir")]
    [MaxLength(500)]
    public string Health { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sahiplenme tarihi gereklidir")]
    public DateTime AdoptionDate { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}

