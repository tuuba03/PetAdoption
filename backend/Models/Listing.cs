using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Listings")]
public class Listing
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // Kedi, Köpek, Kuş, Tavşan

    [MaxLength(100)]
    public string? Breed { get; set; }

    [Required]
    [MaxLength(50)]
    public string Age { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Health { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "TEXT")]
    public string Description { get; set; } = string.Empty;

    // Kullanıcı ilişkisi
    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    // Resimler (JSON olarak saklanacak)
    [Column(TypeName = "TEXT")]
    public string ImagesJson { get; set; } = "[]"; // JSON array olarak saklanacak

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;
}

