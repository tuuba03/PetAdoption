using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Conversations")]
public class Conversation
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ListingId { get; set; }

    [ForeignKey("ListingId")]
    public Listing Listing { get; set; } = null!;

    [Required]
    public int BuyerId { get; set; } // The user who wants to buy/adopt

    [ForeignKey("BuyerId")]
    public User Buyer { get; set; } = null!;

    [Required]
    public int SellerId { get; set; } // The owner of the listing

    [ForeignKey("SellerId")]
    public User Seller { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
