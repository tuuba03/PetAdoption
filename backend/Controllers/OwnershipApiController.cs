using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[Route("api/ownership")]
[ApiController]
public class OwnershipApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<OwnershipApiController> _logger;
    private readonly ITokenService _tokenService;
    private readonly IWebHostEnvironment _environment;

    public OwnershipApiController(
        ApplicationDbContext context,
        ILogger<OwnershipApiController> logger,
        ITokenService tokenService,
        IWebHostEnvironment environment)
    {
        _context = context;
        _logger = logger;
        _tokenService = tokenService;
        _environment = environment;
    }

    // Kullanıcının sahiplendiği hayvanları getir
    [HttpGet]
    public async Task<IActionResult> GetMyOwnerships()
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

            var ownerships = await _context.Ownerships
                .Where(o => o.OwnerId == userId.Value && o.IsActive)
                .Include(o => o.Listing)
                    .ThenInclude(l => l.User)
                .Include(o => o.Owner)
                .OrderByDescending(o => o.AdoptionDate)
                .ToListAsync();

            var result = new List<object>();
            foreach (var o in ownerships)
            {
                try
                {
                    List<string> images = new List<string>();
                    if (!string.IsNullOrEmpty(o.Listing.ImagesJson))
                    {
                        try
                        {
                            images = JsonSerializer.Deserialize<List<string>>(o.Listing.ImagesJson) ?? new List<string>();
                        }
                        catch (JsonException ex)
                        {
                            _logger.LogWarning(ex, $"JSON parse hatası için ownership {o.Id}");
                            images = new List<string>();
                        }
                    }

                    result.Add(new
                    {
                        Id = o.Id.ToString(),
                        Name = o.Listing.Name ?? "",
                        Type = o.Listing.Type ?? "",
                        Breed = o.Listing.Breed ?? "",
                        Age = o.Listing.Age ?? "",
                        City = o.Listing.City ?? "",
                        Health = o.Listing.Health ?? "",
                        Image = images.FirstOrDefault() ?? "",
                        AdoptionDate = o.AdoptionDate.ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                        OwnerName = o.Owner?.Name ?? "Bilinmeyen Kullanıcı",
                        OwnerContact = o.Owner?.Phone ?? "",
                        QrCodeId = o.QrCodeId
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Ownership {o.Id} işlenirken hata");
                    continue;
                }
            }

            return Ok(ApiResponse<object>.SuccessResponse(result, "Sahiplik kartlarınız başarıyla getirildi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sahiplik kartları getirilirken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Sahiplik kartları getirilirken bir hata oluştu"));
        }
    }

    // Yeni sahiplenme kaydı oluştur
    [HttpPost]
    public async Task<IActionResult> CreateOwnership([FromBody] CreateOwnershipDto dto)
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

            // İlanı kontrol et
            var listing = await _context.Listings
                .FirstOrDefaultAsync(l => l.Id == dto.ListingId && l.IsActive);

            if (listing == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("İlan bulunamadı veya artık aktif değil"));
            }

            // Bu ilan zaten sahiplenilmiş mi kontrol et
            var existingOwnership = await _context.Ownerships
                .FirstOrDefaultAsync(o => o.ListingId == dto.ListingId && o.IsActive);

            if (existingOwnership != null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Bu hayvan zaten sahiplenilmiş"));
            }

            // Kullanıcı kendi ilanını sahiplenemez
            if (listing.UserId == userId)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Kendi ilanınızı sahiplenemezsiniz"));
            }

            // Sahiplik kaydı oluştur
            var ownership = new Ownership
            {
                ListingId = dto.ListingId,
                OwnerId = userId.Value,
                AdoptionDate = DateTime.UtcNow,
                QrCodeId = Guid.NewGuid().ToString(),
                Notes = dto.Notes,
                IsActive = true
            };

            _context.Ownerships.Add(ownership);

            // İlanı pasif yap (artık sahiplenilmiş)
            listing.IsActive = false;
            listing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Yeni sahiplik kaydı oluşturuldu: {ownership.Id} - Listing: {dto.ListingId}");

            // Oluşturulan sahiplik kartı bilgilerini döndür
            var result = new
            {
                Id = ownership.Id.ToString(),
                ListingId = listing.Id,
                AdoptionDate = ownership.AdoptionDate.ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                QrCodeId = ownership.QrCodeId
            };

            return Ok(ApiResponse<object>.SuccessResponse(result, "Hayvan başarıyla sahiplenildi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sahiplik kaydı oluşturulurken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Sahiplik kaydı oluşturulurken bir hata oluştu"));
        }
    }

    // QR kod için sahiplik bilgilerini getir
    [HttpGet("qr/{qrCodeId}")]
    public async Task<IActionResult> GetOwnershipByQrCode(string qrCodeId)
    {
        try
        {
            var ownership = await _context.Ownerships
                .Where(o => o.QrCodeId == qrCodeId && o.IsActive)
                .Include(o => o.Listing)
                    .ThenInclude(l => l.User)
                .Include(o => o.Owner)
                .FirstOrDefaultAsync();

            if (ownership == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Sahiplik kartı bulunamadı"));
            }

            List<string> images = new List<string>();
            if (!string.IsNullOrEmpty(ownership.Listing.ImagesJson))
            {
                try
                {
                    images = JsonSerializer.Deserialize<List<string>>(ownership.Listing.ImagesJson) ?? new List<string>();
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, $"JSON parse hatası için ownership {ownership.Id}");
                    images = new List<string>();
                }
            }

            var result = new
            {
                Id = ownership.Id.ToString(),
                QrCodeId = ownership.QrCodeId,
                Pet = new
                {
                    Id = ownership.Listing.Id,
                    Name = ownership.Listing.Name ?? "",
                    Type = ownership.Listing.Type ?? "",
                    Breed = ownership.Listing.Breed ?? "",
                    Age = ownership.Listing.Age ?? "",
                    City = ownership.Listing.City ?? "",
                    Health = ownership.Listing.Health ?? "",
                    Image = images.FirstOrDefault() ?? "",
                    Description = ownership.Listing.Description ?? ""
                },
                AdoptionDate = ownership.AdoptionDate.ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                Owner = new
                {
                    Name = ownership.Owner?.Name ?? "Bilinmeyen Kullanıcı",
                    Contact = ownership.Owner?.Phone ?? "",
                    Email = ownership.Owner?.Email ?? ""
                },
                OriginalOwner = new
                {
                    Name = ownership.Listing.User?.Name ?? "Bilinmeyen Kullanıcı",
                    Contact = ownership.Listing.User?.Phone ?? ""
                }
            };

            return Ok(ApiResponse<object>.SuccessResponse(result, "Sahiplik kartı bilgileri başarıyla getirildi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "QR kod ile sahiplik kartı getirilirken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Sahiplik kartı getirilirken bir hata oluştu"));
        }
    }

    // Belirli bir sahiplik kartını getir
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOwnership(int id)
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

            var ownership = await _context.Ownerships
                .Where(o => o.Id == id && o.OwnerId == userId.Value && o.IsActive)
                .Include(o => o.Listing)
                    .ThenInclude(l => l.User)
                .Include(o => o.Owner)
                .FirstOrDefaultAsync();

            if (ownership == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Sahiplik kartı bulunamadı"));
            }

            List<string> images = new List<string>();
            if (!string.IsNullOrEmpty(ownership.Listing.ImagesJson))
            {
                try
                {
                    images = JsonSerializer.Deserialize<List<string>>(ownership.Listing.ImagesJson) ?? new List<string>();
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, $"JSON parse hatası için ownership {ownership.Id}");
                    images = new List<string>();
                }
            }

            var result = new
            {
                Id = ownership.Id.ToString(),
                Name = ownership.Listing.Name ?? "",
                Type = ownership.Listing.Type ?? "",
                Breed = ownership.Listing.Breed ?? "",
                Age = ownership.Listing.Age ?? "",
                City = ownership.Listing.City ?? "",
                Health = ownership.Listing.Health ?? "",
                Image = images.FirstOrDefault() ?? "",
                AdoptionDate = ownership.AdoptionDate.ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                OwnerName = ownership.Owner?.Name ?? "Bilinmeyen Kullanıcı",
                OwnerContact = ownership.Owner?.Phone ?? "",
                QrCodeId = ownership.QrCodeId
            };

            return Ok(ApiResponse<object>.SuccessResponse(result, "Sahiplik kartı başarıyla getirildi"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sahiplik kartı getirilirken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Sahiplik kartı getirilirken bir hata oluştu"));
        }
    }

    // Manuel sahiplik kartı oluştur (platform dışında sahiplenilen hayvanlar için)
    [HttpPost("manual")]
    public async Task<IActionResult> CreateManualOwnership([FromForm] CreateManualOwnershipDto dto, IFormFile? image)
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

            // Kullanıcı bilgilerini al
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Kullanıcı bulunamadı"));
            }

            // Resim yükleme işlemi
            var imageUrls = new List<string>();
            if (image != null && image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "listings");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Geçersiz dosya formatı. Sadece resim dosyaları yüklenebilir."));
                }

                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                var imageUrl = $"/uploads/listings/{uniqueFileName}";
                imageUrls.Add(imageUrl);
            }

            // Önce bir listing oluştur (pasif olarak, çünkü zaten sahiplenilmiş)
            var listing = new Listing
            {
                Name = dto.Name,
                Type = dto.Type,
                Breed = dto.Breed,
                Age = dto.Age,
                City = dto.City,
                Health = dto.Health,
                Description = dto.Description ?? "Manuel olarak eklenen sahiplik kartı",
                UserId = userId.Value, // Sahiplenen kişi
                ImagesJson = JsonSerializer.Serialize(imageUrls),
                IsActive = false, // Zaten sahiplenilmiş, aktif değil
                CreatedAt = DateTime.UtcNow
            };

            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();

            // Şimdi sahiplik kaydı oluştur
            var ownership = new Ownership
            {
                ListingId = listing.Id,
                OwnerId = userId.Value,
                AdoptionDate = dto.AdoptionDate,
                QrCodeId = Guid.NewGuid().ToString(),
                Notes = dto.Description,
                IsActive = true
            };

            _context.Ownerships.Add(ownership);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Manuel sahiplik kartı oluşturuldu: {ownership.Id} - Listing: {listing.Id}");

            // Oluşturulan sahiplik kartı bilgilerini döndür
            var result = new
            {
                Id = ownership.Id.ToString(),
                Name = listing.Name,
                Type = listing.Type,
                Breed = listing.Breed,
                Age = listing.Age,
                City = listing.City,
                Health = listing.Health,
                Image = imageUrls.FirstOrDefault() ?? "",
                AdoptionDate = ownership.AdoptionDate.ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                OwnerName = user.Name,
                OwnerContact = user.Phone,
                QrCodeId = ownership.QrCodeId
            };

            return Ok(ApiResponse<object>.SuccessResponse(result, "Manuel sahiplik kartı başarıyla oluşturuldu"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Manuel sahiplik kartı oluşturulurken bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Manuel sahiplik kartı oluşturulurken bir hata oluştu"));
        }
    }
}

