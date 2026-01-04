using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Controllers;

public class ListingsController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ListingsController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public IActionResult Create()
    {
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
        {
            return RedirectToAction("Login", "AuthMvc");
        }
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Create(Listing listing, List<IFormFile> images)
    {
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var userIdString = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        try
        {
            // Resim yükleme işlemi
            var imageUrls = new List<string>();
            if (images != null && images.Count > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "listings");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                foreach (var file in images)
                {
                    if (file.Length > 0 && file.ContentType.StartsWith("image/"))
                    {
                        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                        var filePath = Path.Combine(uploadsFolder, fileName);
                        
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        imageUrls.Add($"/uploads/listings/{fileName}");
                    }
                }
            }

            if (imageUrls.Count == 0)
            {
                ModelState.AddModelError("Images", "En az bir fotoğraf yüklemelisiniz.");
                return View(listing);
            }

            listing.UserId = userId;
            listing.ImagesJson = JsonSerializer.Serialize(imageUrls);
            listing.CreatedAt = DateTime.UtcNow;
            listing.IsActive = true;
            
            // Validasyon için gerekli olmayan alanları temizle
            // listing.User navigation property'si null olabilir, sorun değil

            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "İlan başarıyla oluşturuldu.";
            return RedirectToAction("Dashboard", "Home");
        }
        catch (Exception ex)
        {
            ModelState.AddModelError("", "Bir hata oluştu: " + ex.Message);
            return View(listing);
        }
    }

    [HttpGet]
    public async Task<IActionResult> Details(int id)
    {
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var listing = await _context.Listings
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);

        if (listing == null)
        {
            return NotFound();
        }

        return View(listing);
    }


    [HttpGet]
    public async Task<IActionResult> MyListings()
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var listings = await _context.Listings
            .Where(l => l.UserId == userId && l.IsActive)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return View(listings);
    }

    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var listing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id);
        if (listing == null)
        {
            return NotFound();
        }

        if (listing.UserId != userId)
        {
            return Unauthorized();
        }

        // Soft delete
        listing.IsActive = false;
        await _context.SaveChangesAsync();

        TempData["SuccessMessage"] = "İlan başarıyla silindi.";
        return RedirectToAction("MyListings");
    }
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
             return RedirectToAction("Login", "AuthMvc");
        }

        var listing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id);
        
        if (listing == null)
        {
            return NotFound();
        }

        // Only allow owner to edit
        if (listing.UserId != userId)
        {
            return Unauthorized();
        }

        return View(listing);
    }

    [HttpPost]
    public async Task<IActionResult> Edit(int id, Listing model, List<IFormFile> images)
    {
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
        {
             return RedirectToAction("Login", "AuthMvc");
        }

         var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
             return RedirectToAction("Login", "AuthMvc");
        }

        var existingListing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id);
        
        if (existingListing == null)
        {
            return NotFound();
        }

         if (existingListing.UserId != userId)
        {
            return Unauthorized();
        }

        try
        {
            // Update fields
            existingListing.Name = model.Name;
            existingListing.Type = model.Type;
            existingListing.Breed = model.Breed;
            existingListing.Age = model.Age;
            existingListing.City = model.City;
            existingListing.Health = model.Health;
            existingListing.Description = model.Description;
            // IsActive status usually remains unless specific logic changes it

            // Handle New Images
            var currentImages = !string.IsNullOrEmpty(existingListing.ImagesJson) 
                                ? JsonSerializer.Deserialize<List<string>>(existingListing.ImagesJson) ?? new List<string>() 
                                : new List<string>();

            if (images != null && images.Count > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "listings");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                foreach (var file in images)
                {
                    if (file.Length > 0 && file.ContentType.StartsWith("image/"))
                    {
                        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                        var filePath = Path.Combine(uploadsFolder, fileName);
                        
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        currentImages.Add($"/uploads/listings/{fileName}");
                    }
                }
                
                 existingListing.ImagesJson = JsonSerializer.Serialize(currentImages);
            }

            _context.Listings.Update(existingListing);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "İlan başarıyla güncellendi.";
            return RedirectToAction("MyListings");
        }
        catch (Exception ex)
        {
             ModelState.AddModelError("", "Bir hata oluştu: " + ex.Message);
             return View(model);
        }
    }
}
