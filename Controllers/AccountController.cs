using HesapBilgileriProjesi.Models;
using Microsoft.AspNetCore.Mvc;

namespace HesapBilgileriProjesi.Controllers
{
    public class AccountController : Controller
    {
        // Get the Account View
        [HttpGet]
        public IActionResult Index()
        {
            // Mock data
            var model = new UserProfileViewModel
            {
                Name = "Ahmet Yılmaz",
                Email = "ahmet.yilmaz@email.com",
                Phone = "0532 555 12 34"
            };
            return View(model);
        }

        // Handle the update
        [HttpPost]
        public IActionResult Update([FromBody] UserProfileViewModel model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid data" });
            }

            // Here you would normally save to the database
            
            return Ok(new { message = "Profil bilgileriniz başarıyla güncellendi!" });
        }
    }
}
