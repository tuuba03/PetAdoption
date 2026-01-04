using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

public class AccountController : Controller
{
    private readonly ApplicationDbContext _context;

    public AccountController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Profile()
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        if (!int.TryParse(userIdStr, out int userId))
        {
             return RedirectToAction("Login", "AuthMvc");
        }

        var user = _context.Users.Find(userId);
        if (user == null)
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var model = new UserProfileViewModel
        {
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone
        };
        return View(model);
    }

    [HttpPost]
    public IActionResult Update([FromBody] UserProfileViewModel model)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr))
        {
            return Unauthorized(new { message = "Oturum süresi doldu." });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Geçersiz veri." });
        }

        var user = _context.Users.Find(int.Parse(userIdStr));
        if (user == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        }

        user.Name = model.Name;
        user.Email = model.Email;
        user.Phone = model.Phone;

        _context.SaveChanges();
        
        // Update session name if changed
        HttpContext.Session.SetString("UserName", user.Name);

        return Ok(new { message = "Profil bilgileriniz başarıyla güncellendi!" });
    }
}
