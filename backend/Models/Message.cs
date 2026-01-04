using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Messages")]
public class Message
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ConversationId { get; set; }

    [ForeignKey("ConversationId")]
    public Conversation Conversation { get; set; } = null!;

    [Required]
    public int SenderId { get; set; }

    [ForeignKey("SenderId")]
    public User Sender { get; set; } = null!;

    [Required]
    public string Text { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
