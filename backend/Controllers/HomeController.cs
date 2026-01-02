using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        // Örnek bir hayvan verisi ile sayfayı açıyoruz
        var pet = new
        {
            Id = "123",
            Name = "Pamuk",
            Type = "Kedi",
            Description = "3 yaşında, sakin, kısırlaştırılmış, apartman hayatına uygun, tekir kedi."
        };
        
        return View(pet);
    }
}
