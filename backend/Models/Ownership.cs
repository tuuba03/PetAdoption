using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Ownerships")]
public class Ownership
{
    [Key]
    public int Id { get; set; }

    // Sahiplenilen ilan
    [Required]
    public int ListingId { get; set; }

    [ForeignKey("ListingId")]
    public Listing Listing { get; set; } = null!;

    // Sahiplenen kullanıcı (yeni sahip)
    [Required]
    public int OwnerId { get; set; }

    [ForeignKey("OwnerId")]
    public User Owner { get; set; } = null!;

    // Sahiplenme tarihi
    [Required]
    public DateTime AdoptionDate { get; set; } = DateTime.UtcNow;

    // QR kod için unique identifier
    [Required]
    [MaxLength(100)]
    public string QrCodeId { get; set; } = Guid.NewGuid().ToString();

    // Ek notlar (opsiyonel)
    [Column(TypeName = "TEXT")]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;
}

