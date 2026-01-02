using System;
using System.Collections.Generic;

namespace backend.Models;

public class Message
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Sender { get; set; } // "me" or "other"
    public string Text { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.Now;
    public string FormattedTime => Timestamp.ToString("HH:mm");
}

public class Conversation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PetId { get; set; }
    public string PetName { get; set; }
    public string PetImage { get; set; }
    public string PetType { get; set; }
    
    // In a real app, this would be a User object
    public string OtherUserName { get; set; }
    public string OtherUserPhone { get; set; }
    
    public List<Message> Messages { get; set; } = new List<Message>();
    
    public int UnreadCount { get; set; } = 0;
    
    // Helpers for UI
    public string LastMessage => Messages.LastOrDefault()?.Text ?? "";
    public string LastMessageTime => Messages.LastOrDefault()?.FormattedTime ?? "";
}
