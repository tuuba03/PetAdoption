using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        IPasswordService passwordService,
        ITokenService tokenService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _passwordService = passwordService;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            // Model validation
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.ErrorResponse("Validasyon hatası", errors));
            }

            // Email kontrolü
            var existingUserByEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == registerDto.Email);

            if (existingUserByEmail != null)
            {
                return Conflict(ApiResponse<object>.ErrorResponse("Bu e-posta adresi zaten kullanılıyor"));
            }

            // Telefon kontrolü
            var existingUserByPhone = await _context.Users
                .FirstOrDefaultAsync(u => u.Phone == registerDto.Phone);

            if (existingUserByPhone != null)
            {
                return Conflict(ApiResponse<object>.ErrorResponse("Bu telefon numarası zaten kullanılıyor"));
            }

            // Şifre hashleme
            var passwordHash = _passwordService.HashPassword(registerDto.Password);

            // Yeni kullanıcı oluştur
            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Phone = registerDto.Phone,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Yeni kullanıcı kaydedildi: {user.Email}");

            // Şifreyi response'dan çıkar
            var response = new
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt
            };

            return Ok(ApiResponse<object>.SuccessResponse(response, "Kayıt başarıyla tamamlandı"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kayıt işlemi sırasında bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Kayıt işlemi sırasında bir hata oluştu"));
        }
    }

    [HttpGet("check-email/{email}")]
    public async Task<IActionResult> CheckEmail(string email)
    {
        var exists = await _context.Users.AnyAsync(u => u.Email == email);
        return Ok(new { exists });
    }

    [HttpGet("check-phone/{phone}")]
    public async Task<IActionResult> CheckPhone(string phone)
    {
        var exists = await _context.Users.AnyAsync(u => u.Phone == phone);
        return Ok(new { exists });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            // Model validation
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.ErrorResponse("Validasyon hatası", errors));
            }

            // Kullanıcıyı bul
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("E-posta veya şifre hatalı"));
            }

            // Şifre kontrolü
            var isPasswordValid = _passwordService.VerifyPassword(loginDto.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("E-posta veya şifre hatalı"));
            }

            // Token oluştur
            var token = _tokenService.GenerateToken(user);

            _logger.LogInformation($"Kullanıcı giriş yaptı: {user.Email}");

            // Response
            var response = new
            {
                token = token,
                user = new
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Phone = user.Phone
                }
            };

            return Ok(ApiResponse<object>.SuccessResponse(response, "Giriş başarılı"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Giriş işlemi sırasında bir hata oluştu");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Giriş işlemi sırasında bir hata oluştu"));
        }
    }
}

