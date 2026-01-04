using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

public class OwnershipController : Controller
{
    private readonly ApplicationDbContext _context;

    public OwnershipController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var ownerships = await _context.Ownerships
            .Where(o => o.OwnerId == userId && o.IsActive)
            .Include(o => o.Listing)
                .ThenInclude(l => l.User)
            .Include(o => o.Owner)
            .OrderByDescending(o => o.AdoptionDate)
            .ToListAsync();

        return View(ownerships);
    }
    [HttpGet]
    public async Task<IActionResult> Details(int id)
    {
        var ownership = await _context.Ownerships
            .Include(o => o.Listing)
            .Include(o => o.Owner)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (ownership == null)
        {
            return NotFound();
        }

        return View(ownership);
    }

    [HttpPost]
    public async Task<IActionResult> CreateManual(string Name, string Type, string Breed, string Age, string City, string Health, string Description, DateTime? AdoptionDate, string OwnerName, string OwnerPhone, IFormFile? Image)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        try
        {
            // Resim yükleme
            var imageUrls = new List<string>();
            if (Image != null && Image.Length > 0)
            {
                 // wwwroot/uploads/listings klasörüne kaydet
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "listings");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = $"{Guid.NewGuid()}_{Image.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await Image.CopyToAsync(stream);
                }

                imageUrls.Add($"/uploads/listings/{uniqueFileName}");
            }

            // Create inactive listing for manual entry
            var listing = new Listing
            {
                Name = Name,
                Type = Type,
                Breed = Breed,
                Age = Age,
                City = City,
                Health = Health,
                Description = Description ?? "Manuel olarak eklenen sahiplik kartı",
                UserId = userId,
                ImagesJson = System.Text.Json.JsonSerializer.Serialize(imageUrls),
                IsActive = false, 
                CreatedAt = DateTime.UtcNow
            };

            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();

            // Store custom owner info in Notes as JSON
            var notesData = new {
                DisplayOwner = OwnerName,
                DisplayPhone = OwnerPhone,
                UserNote = Description
            };

            // Create ownership record
            var ownership = new Ownership
            {
                ListingId = listing.Id,
                OwnerId = userId,
                AdoptionDate = AdoptionDate ?? DateTime.UtcNow,
                QrCodeId = Guid.NewGuid().ToString(), // Basit ID
                Notes = System.Text.Json.JsonSerializer.Serialize(notesData),
                IsActive = true
            };

            _context.Ownerships.Add(ownership);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Sahiplik kartı başarıyla oluşturuldu!";
            return RedirectToAction("Index");
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = "Bir hata oluştu: " + ex.Message;
            return RedirectToAction("Index");
        }
    }
}
