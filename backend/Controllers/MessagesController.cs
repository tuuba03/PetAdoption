using backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers;

public class MessagesController : Controller
{
    // In-memory store for demo purposes
    private static List<Conversation> _conversations = new List<Conversation>();

    static MessagesController()
    {
        // Add some mock data if empty
        if (!_conversations.Any())
        {
            _conversations.Add(new Conversation
            {
                PetId = "123",
                PetName = "Pamuk",
                PetType = "Kedi", 
                PetImage = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60",
                OtherUserName = "Hayvan Sahiplendirme Merkezi",
                OtherUserPhone = "0532 555 1234",
                Messages = new List<Message>
                {
                    new Message { Sender = "other", Text = "Merhaba! Pamuk için ilgileniyorsunuz sanırım?", Timestamp = DateTime.Now.AddHours(-2) },
                    new Message { Sender = "me", Text = "Evet, çok tatlı görünüyor. Aşıları tam mı?", Timestamp = DateTime.Now.AddHours(-1) },
                    new Message { Sender = "other", Text = "Evet, tüm aşıları yapıldı ve karnesi mevcut.", Timestamp = DateTime.Now.AddMinutes(-55) }
                },
                UnreadCount = 0
            });

            _conversations.Add(new Conversation
            {
                PetId = "456",
                PetName = "Baron",
                PetType = "Köpek",
                PetImage = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60",
                OtherUserName = "Ahmet Y.",
                OtherUserPhone = "0555 444 3322",
                Messages = new List<Message>
                {
                    new Message { Sender = "me", Text = "Merhaba, Baron hala sahiplendirilmeyi bekliyor mu?", Timestamp = DateTime.Now.AddDays(-1) },
                    new Message { Sender = "other", Text = "Selamlar, evet hala bekliyor. Görmek ister misiniz?", Timestamp = DateTime.Now.AddDays(-1).AddMinutes(15) }
                },
                UnreadCount = 1
            });
        }
    }

    public IActionResult Index()
    {
        return View(_conversations);
    }

    [HttpGet]
    public IActionResult GetConversation(string id)
    {
        var conversation = _conversations.FirstOrDefault(c => c.Id == id);
        if (conversation == null) return NotFound();

        // Mark as read when opened
        conversation.UnreadCount = 0;
        
        return Json(conversation);
    }

    [HttpPost]
    public IActionResult SendMessage(string conversationId, [FromBody] MessageRequest request)
    {
        var conversation = _conversations.FirstOrDefault(c => c.Id == conversationId);
        if (conversation == null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Text)) return BadRequest("Message cannot be empty");

        var newMessage = new Message
        {
            Sender = "me",
            Text = request.Text,
            Timestamp = DateTime.Now
        };

        conversation.Messages.Add(newMessage);

        // Simulate reply after a delay (optional, for demo effect)
        // Task.Run(async () => { await Task.Delay(2000); conversation.Messages.Add(...); });

        return Ok(newMessage);
    }

    [HttpPost]
    public IActionResult StartChat([FromBody] StartChatRequest request)
    {
        // check if exists
        var existing = _conversations.FirstOrDefault(c => c.PetId == request.PetId);
        if (existing != null)
        {
            return Ok(new { conversationId = existing.Id });
        }

        var newConv = new Conversation
        {
            PetId = request.PetId,
            PetName = request.PetName,
            PetType = request.PetType,
            PetImage = request.PetImage ?? "https://via.placeholder.com/150",
            OtherUserName = "İlan Sahibi", // Default
            OtherUserPhone = "Görünmez",
            Messages = new List<Message>
            {
                new Message { Sender = "me", Text = "Merhaba, bu ilanla ilgileniyorum.", Timestamp = DateTime.Now }
            }
        };

        _conversations.Insert(0, newConv); // Add to top
        return Ok(new { conversationId = newConv.Id });
    }
}

public class MessageRequest
{
    public string Text { get; set; }
}

public class StartChatRequest
{
    public string PetId { get; set; }
    public string PetName { get; set; }
    public string PetType { get; set; }
    public string PetImage { get; set; }
}
