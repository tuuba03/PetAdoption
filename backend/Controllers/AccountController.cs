using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public class AccountController : Controller
    {
        // Login GET
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        // Login POST
        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            // Mock authentication
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                ViewBag.Error = "E-posta ve şifre gereklidir.";
                return View();
            }

            // In a real app, check DB and create cookie
            // For demo, just redirect to Home
            return RedirectToAction("Index", "Listings");
        }

        // Register GET
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        // Register POST
        [HttpPost]
        public IActionResult Register(string name, string email, string phone, string password, string confirmPassword)
        {
             if (password != confirmPassword)
            {
                ViewBag.Error = "Şifreler eşleşmiyor.";
                return View();
            }

            // Mock registration success
            return RedirectToAction("Login");
        }

        public IActionResult Logout()
        {
            // Clear auth cookie
            return RedirectToAction("Login");
        }

        // Get the Account View
        [HttpGet]
        public IActionResult Profile()
        {
            // Mock data - in a real app this would come from a database/service
            var model = new UserProfileViewModel
            {
                Name = "Ahmet Yılmaz",
                Email = "ahmet.yilmaz@email.com",
                Phone = "0532 555 12 34"
            };
            return View("Index", model); // Reuse Index view as Profile
        }

        // Handle the update
        [HttpPost]
        public IActionResult Update([FromBody] UserProfileViewModel model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid data" });
            }
            return Ok(new { message = "Profil bilgileriniz başarıyla güncellendi!" });
        }
    }
}
