using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

public class AuthMvcController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthMvcController> _logger;

    public AuthMvcController(
        ApplicationDbContext context,
        IPasswordService passwordService,
        ITokenService tokenService,
        ILogger<AuthMvcController> logger)
    {
        _context = context;
        _passwordService = passwordService;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return View(registerDto);
        }

        try
        {
            // Email kontrolü
            var existingUserByEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == registerDto.Email);

            if (existingUserByEmail != null)
            {
                ModelState.AddModelError("Email", "Bu e-posta adresi zaten kullanılıyor");
                return View(registerDto);
            }

            // Telefon kontrolü
            var existingUserByPhone = await _context.Users
                .FirstOrDefaultAsync(u => u.Phone == registerDto.Phone);

            if (existingUserByPhone != null)
            {
                ModelState.AddModelError("Phone", "Bu telefon numarası zaten kullanılıyor");
                return View(registerDto);
            }

            // Şifre kontrolü
            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                ModelState.AddModelError("ConfirmPassword", "Şifreler eşleşmiyor");
                return View(registerDto);
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

            TempData["SuccessMessage"] = "Kayıt başarıyla tamamlandı! Giriş yapabilirsiniz.";
            return RedirectToAction("Register", "AuthMvc");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kayıt işlemi sırasında bir hata oluştu");
            ModelState.AddModelError("", "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            return View(registerDto);
        }
    }

    [HttpGet]
    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return View(loginDto);
        }

        try
        {
            // Kullanıcıyı bul
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                ModelState.AddModelError("", "E-posta veya şifre hatalı");
                return View(loginDto);
            }

            // Şifre kontrolü
            var isPasswordValid = _passwordService.VerifyPassword(loginDto.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                ModelState.AddModelError("", "E-posta veya şifre hatalı");
                return View(loginDto);
            }

            // Token oluştur ve session'a kaydet
            var token = _tokenService.GenerateToken(user);
            HttpContext.Session.SetString("Token", token);
            HttpContext.Session.SetString("UserId", user.Id.ToString());
            HttpContext.Session.SetString("UserName", user.Name);

            _logger.LogInformation($"Kullanıcı giriş yaptı: {user.Email}");

            // TempData["SuccessMessage"] = $"Hoş geldiniz, {user.Name}!"; // Kullanıcı isteği üzerine kaldırıldı
            return RedirectToAction("Index", "Home");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Giriş işlemi sırasında bir hata oluştu");
            ModelState.AddModelError("", "Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            return View(loginDto);
        }
    }

    [HttpPost]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return RedirectToAction("Login", "AuthMvc");
    }
}



