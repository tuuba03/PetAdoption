using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

public class MessagesController : Controller
{
    private readonly ApplicationDbContext _context;

    public MessagesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // List conversations
    public async Task<IActionResult> Index()
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var conversations = await _context.Conversations
            .Where(c => c.BuyerId == userId || c.SellerId == userId)
            .Include(c => c.Listing)
            .Include(c => c.Buyer)
            .Include(c => c.Seller)
            .Include(c => c.Messages)
            .OrderByDescending(c => c.LastMessageAt)
            .ToListAsync();

        return View(conversations);
    }

    // Chat room
    [HttpGet]
    public async Task<IActionResult> Chat(int id)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var conversation = await _context.Conversations
            .Include(c => c.Listing)
            .Include(c => c.Buyer)
            .Include(c => c.Seller)
            .Include(c => c.Messages.OrderBy(m => m.Timestamp))
            .FirstOrDefaultAsync(c => c.Id == id);

        if (conversation == null)
        {
            return NotFound();
        }

        // Verify access
        if (conversation.BuyerId != userId && conversation.SellerId != userId)
        {
            return Unauthorized();
        }

        // Mark incoming messages as read
        var unreadMessages = conversation.Messages
            .Where(m => m.SenderId != userId && !m.IsRead)
            .ToList();

        if (unreadMessages.Any())
        {
            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

        return View(conversation);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(int conversationId, [FromBody] MessageRequest request)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized();
        }

        var conversation = await _context.Conversations.FindAsync(conversationId);
        if (conversation == null) return NotFound();

        if (conversation.BuyerId != userId && conversation.SellerId != userId)
        {
            return Unauthorized();
        }

        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = userId,
            Text = request.Text,
            Timestamp = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        
        conversation.LastMessageAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { timestamp = message.Timestamp });
    }

    [HttpPost]
    public async Task<IActionResult> StartChat([FromBody] StartChatRequest request)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized(new { redirectUrl = "/AuthMvc/Login" });
        }

        // Find listing
        var listing = await _context.Listings.FindAsync(request.ListingId);
        if (listing == null) return NotFound("İlan bulunamadı.");

        if (listing.UserId == userId)
        {
            return BadRequest("Kendi ilanınıza mesaj atamazsınız.");
        }

        // Check existing conversation
        var existingConv = await _context.Conversations
            .FirstOrDefaultAsync(c => c.ListingId == request.ListingId && c.BuyerId == userId);

        if (existingConv != null)
        {
            return Ok(new { conversationId = existingConv.Id });
        }

        // Create new
        var newConv = new Conversation
        {
            ListingId = request.ListingId,
            BuyerId = userId,
            SellerId = listing.UserId,
            CreatedAt = DateTime.UtcNow,
            LastMessageAt = DateTime.UtcNow
        };

        _context.Conversations.Add(newConv);
        await _context.SaveChangesAsync();

        return Ok(new { conversationId = newConv.Id });
    }
    [HttpPost]
    public async Task<IActionResult> SendAdoptionRequest([FromBody] StartChatRequest request)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized(new { redirectUrl = "/AuthMvc/Login" });
        }

        var listing = await _context.Listings.FindAsync(request.ListingId);
        if (listing == null) return NotFound("İlan bulunamadı.");

        if (listing.UserId == userId)
        {
            return BadRequest("Kendi ilanınızı sahiplenemezsiniz.");
        }

        // Check or create conversation
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.ListingId == request.ListingId && c.BuyerId == userId);

        if (conversation == null)
        {
            conversation = new Conversation
            {
                ListingId = request.ListingId,
                BuyerId = userId,
                SellerId = listing.UserId,
                CreatedAt = DateTime.UtcNow,
                LastMessageAt = DateTime.UtcNow
            };
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
        }

        // Send adoption message
        var message = new Message
        {
            ConversationId = conversation.Id,
            SenderId = userId,
            Text = $"👋 Merhaba! {listing.Name} isimli ilanınızla ilgileniyorum ve sahiplenmek istiyorum. Detayları konuşabilir miyiz?",
            Timestamp = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        conversation.LastMessageAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sahiplenme talebiniz iletildi!" });
    }
}

public class MessageRequest
{
    public string Text { get; set; }
}

public class StartChatRequest
{
    public int ListingId { get; set; }
}
