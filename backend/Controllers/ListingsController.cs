using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ListingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ListingsController> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly ITokenService _tokenService;

    public ListingsController(
        ApplicationDbContext context,
        ILogger<ListingsController> logger,
        IWebHostEnvironment environment,
        ITokenService tokenService)
    {
        _context = context;
        _logger = logger;
        _environment = environment;
        _tokenService = tokenService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateListing([FromForm] CreateListingDto listingDto)
    {
        try
        {
            // Token'dan kullanıcı ID'sini al
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Giriş yapmanız gerekiyor"));
            }

            var userId = _tokenService.GetUserIdFromToken(token);
            if (userId == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Geçersiz token"));
            }

            // Kullanıcının var olduğunu kontrol et
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Kullanıcı bulunamadı"));
            }

            // Model validation
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.ErrorResponse("Validasyon hatası", errors));
            }

            // Resimleri yükle
            var imageUrls = new List<string>();
            if (Request.Form.Files.Count > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "listings");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                foreach (var file in Request.Form.Files)
                {
                    if (file.Length > 0 && file.ContentType.StartsWith("image/"))
                    {
                        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                        var filePath = Path.Combine(uploadsFolder, fileName);
                        
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        var imageUrl = $"/uploads/listings/{fileName}";
                        imageUrls.Add(imageUrl);
                    }
                }
            }

            if (imageUrls.Count == 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("En az bir fotoğraf yüklenmelidir"));
            }

            // Yeni ilan oluştur
            var listing = new Listing
            {
                Name = listingDto.Name,
                Type = listingDto.Type,
                Breed = listingDto.Breed,
                Age = listingDto.Age,
                City = listingDto.City,
                Health = listingDto.Health,
                Description = listingDto.Description,
                UserId = userId.Value,
                ImagesJson = JsonSerializer.Serialize(imageUrls),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Yeni ilan oluşturuldu: {listing.Id} - {listing.Name}");

            // Response
            var response = new
            {
                Id = listing.Id,
                Name = listing.Name,
                Type = listing.Type,
                Breed = listing.Breed,
                Age = listing.Age,
                City = listing.City,
                Health = listing.Health,
                Description = listing.Description,
                Images = imageUrls,
                CreatedAt = listing.CreatedAt
            };

            return Ok(ApiResponse<object>.SuccessResponse(response, "İlan başarıyla oluşturuldu"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İlan oluşturma işlemi sırasında bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("İlan oluşturma işlemi sırasında bir hata oluştu"));
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetListings([FromQuery] ListingFilterDto? filter = null)
    {
        try
        {
            // Veritabanında Listings tablosu var mı kontrol et
            if (!_context.Database.CanConnect())
            {
                _logger.LogError("Veritabanına bağlanılamıyor");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Veritabanı bağlantı hatası"));
            }

            var query = _context.Listings
                .Where(l => l.IsActive)
                .Include(l => l.User)
                .AsQueryable();

            // Filtreleme
            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Type))
                {
                    query = query.Where(l => l.Type == filter.Type);
                }

                if (!string.IsNullOrEmpty(filter.Breed))
                {
                    query = query.Where(l => l.Breed == filter.Breed);
                }

                if (!string.IsNullOrEmpty(filter.City))
                {
                    query = query.Where(l => l.City == filter.City);
                }

                if (!string.IsNullOrEmpty(filter.Age))
                {
                    // Yaş filtresi (yaş string formatında saklandığı için basit implementasyon)
                    if (filter.Age == "0-1")
                    {
                        query = query.Where(l => l.Age.Contains("0") || l.Age.Contains("1") || 
                            l.Age.Contains("ay") || l.Age.Contains("Ay"));
                    }
                    else if (filter.Age == "1-3")
                    {
                        query = query.Where(l => l.Age.Contains("1") || l.Age.Contains("2") || 
                            l.Age.Contains("3") || (l.Age.Contains("yaş") && !l.Age.Contains("4") && 
                            !l.Age.Contains("5") && !l.Age.Contains("6") && !l.Age.Contains("7") && 
                            !l.Age.Contains("8") && !l.Age.Contains("9")));
                    }
                    else if (filter.Age == "3+")
                    {
                        query = query.Where(l => !string.IsNullOrEmpty(l.Age) && 
                            (l.Age.Contains("3") || l.Age.Contains("4") || l.Age.Contains("5") || 
                             l.Age.Contains("6") || l.Age.Contains("7") || l.Age.Contains("8") || 
                             l.Age.Contains("9") || (l.Age.Contains("yaş") && 
                             (l.Age.Contains("3") || l.Age.Contains("4") || l.Age.Contains("5") || 
                              l.Age.Contains("6") || l.Age.Contains("7") || l.Age.Contains("8") || 
                              l.Age.Contains("9")))));
                    }
                }

                if (filter.HealthChecked == true)
                {
                    query = query.Where(l => !string.IsNullOrEmpty(l.Health) && 
                        (l.Health.Contains("aşı") || l.Health.Contains("Aşı") || 
                         l.Health.Contains("sağlık") || l.Health.Contains("Sağlık")));
                }

                // Arama (isim veya açıklamada)
                if (!string.IsNullOrEmpty(filter.SearchQuery))
                {
                    var searchTerm = filter.SearchQuery.ToLower();
                    query = query.Where(l => 
                        l.Name.ToLower().Contains(searchTerm) ||
                        l.Description.ToLower().Contains(searchTerm) ||
                        (l.Breed != null && l.Breed.ToLower().Contains(searchTerm)));
                }
            }

            var listings = await query
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            // Liste boşsa boş array döndür
            if (listings == null || listings.Count == 0)
            {
                return Ok(ApiResponse<object>.SuccessResponse(new List<object>(), "İlan bulunamadı"));
            }

            var result = new List<object>();
            foreach (var l in listings)
            {
                try
                {
                    List<string> images = new List<string>();
                    if (!string.IsNullOrEmpty(l.ImagesJson))
                    {
                        try
                        {
                            images = JsonSerializer.Deserialize<List<string>>(l.ImagesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<string>();
                        }
                        catch (JsonException ex)
                        {
                            _logger.LogWarning(ex, $"JSON parse hatası için listing {l.Id}: {l.ImagesJson}");
                            images = new List<string>();
                        }
                    }

                    result.Add(new
                    {
                        Id = l.Id,
                        Name = l.Name ?? "",
                        Type = l.Type ?? "",
                        Breed = l.Breed ?? "",
                        Age = l.Age ?? "",
                        City = l.City ?? "",
                        Health = l.Health ?? "",
                        Description = l.Description ?? "",
                        Images = images,
                        UserName = l.User?.Name ?? "Bilinmeyen Kullanıcı",
                        CreatedAt = l.CreatedAt
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Listing {l.Id} işlenirken hata: {ex.Message}");
                    // Bu listing'i atla, diğerlerini işle
                    continue;
                }
            }

            return Ok(ApiResponse<object>.SuccessResponse(result, "İlanlar başarıyla getirildi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İlanlar getirilirken bir hata oluştu: {Message}\n{StackTrace}", ex.Message, ex.StackTrace);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"İlanlar getirilirken bir hata oluştu: {ex.Message}"));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetListing(int id)
    {
        try
        {
            var listing = await _context.Listings
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);

            if (listing == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("İlan bulunamadı"));
            }

            var response = new
            {
                Id = listing.Id,
                Name = listing.Name ?? "",
                Type = listing.Type ?? "",
                Breed = listing.Breed ?? "",
                Age = listing.Age ?? "",
                City = listing.City ?? "",
                Health = listing.Health ?? "",
                Description = listing.Description ?? "",
                Images = JsonSerializer.Deserialize<List<string>>(listing.ImagesJson ?? "[]") ?? new List<string>(),
                UserName = listing.User?.Name ?? "Bilinmeyen Kullanıcı",
                UserEmail = listing.User?.Email ?? "",
                UserPhone = listing.User?.Phone ?? "",
                CreatedAt = listing.CreatedAt
            };

            return Ok(ApiResponse<object>.SuccessResponse(response, "İlan başarıyla getirildi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İlan getirilirken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("İlan getirilirken bir hata oluştu"));
        }
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyListings()
    {
        try
        {
            // Token'dan kullanıcı ID'sini al
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Giriş yapmanız gerekiyor"));
            }

            var userId = _tokenService.GetUserIdFromToken(token);
            if (userId == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Geçersiz token"));
            }

            var listings = await _context.Listings
                .Where(l => l.UserId == userId.Value)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            var result = new List<object>();
            foreach (var l in listings)
            {
                try
                {
                    var images = JsonSerializer.Deserialize<List<string>>(l.ImagesJson ?? "[]") ?? new List<string>();
                    result.Add(new
                    {
                        Id = l.Id,
                        Name = l.Name ?? "",
                        Type = l.Type ?? "",
                        Breed = l.Breed ?? "",
                        Age = l.Age ?? "",
                        City = l.City ?? "",
                        Health = l.Health ?? "",
                        Description = l.Description ?? "",
                        Images = images,
                        CreatedAt = l.CreatedAt,
                        IsActive = l.IsActive
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Listing {l.Id} işlenirken hata");
                    continue;
                }
            }

            return Ok(ApiResponse<object>.SuccessResponse(result, "İlanlarınız başarıyla getirildi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İlanlarınız getirilirken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("İlanlarınız getirilirken bir hata oluştu"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteListing(int id)
    {
        try
        {
            // Token'dan kullanıcı ID'sini al
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Giriş yapmanız gerekiyor"));
            }

            var userId = _tokenService.GetUserIdFromToken(token);
            if (userId == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Geçersiz token"));
            }

            // İlanı bul ve kullanıcı kontrolü yap
            var listing = await _context.Listings
                .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

            if (listing == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("İlan bulunamadı veya bu ilana erişim yetkiniz yok"));
            }

            // Resimleri sil
            var images = JsonSerializer.Deserialize<List<string>>(listing.ImagesJson) ?? new List<string>();
            foreach (var imageUrl in images)
            {
                try
                {
                    // URL'den dosya adını çıkar: /uploads/listings/filename.jpg -> filename.jpg
                    var fileName = Path.GetFileName(imageUrl);
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        var fullPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "listings", fileName);
                        if (System.IO.File.Exists(fullPath))
                        {
                            System.IO.File.Delete(fullPath);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Resim silinirken hata: {imageUrl}");
                }
            }

            // İlanı sil (veya pasif yap)
            _context.Listings.Remove(listing);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"İlan silindi: {listing.Id} - {listing.Name}");

            return Ok(ApiResponse<object?>.SuccessResponse(null, "İlan başarıyla silindi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İlan silinirken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("İlan silinirken bir hata oluştu"));
        }
    }

}

