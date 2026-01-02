using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public class AccountController : Controller
    {
        // Get the Account View
        [HttpGet]
        public IActionResult Index()
        {
            // Mock data - in a real app this would come from a database/service
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
            // For now, we'll just return a success message
            
            return Ok(new { message = "Profil bilgileriniz başarıyla güncellendi!" });
        }
    }
}
