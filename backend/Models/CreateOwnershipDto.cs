using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class CreateOwnershipDto
{
    [Required(ErrorMessage = "İlan ID'si gereklidir")]
    public int ListingId { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

