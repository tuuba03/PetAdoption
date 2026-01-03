using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}

