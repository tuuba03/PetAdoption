using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public class ListingsController : Controller
    {
        private readonly ListingService _service;
        private readonly IWebHostEnvironment _env;

        public ListingsController(ListingService service, IWebHostEnvironment env)
        {
            _service = service;
            _env = env;
        }

        public IActionResult Index(string type, string city, string query)
        {
            var listings = _service.Search(type, city, query);
            
            ViewBag.SelectedType = type;
            ViewBag.SelectedCity = city;
            ViewBag.SearchQuery = query;
            
            return View(listings);
        }

        public IActionResult Details(int id)
        {
            var listing = _service.GetById(id);
            if (listing == null) return NotFound();
            return View(listing);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(Listing model, List<IFormFile> images)
        {
            // Simple validation
            // In a real app check ModelState.IsValid

            if (images != null && images.Count > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                foreach (var file in images)
                {
                    if (file.Length > 0)
                    {
                        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                        var filePath = Path.Combine(uploadsFolder, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }
                        model.Images.Add("/uploads/" + fileName);
                    }
                }
            }

            model.UserName = "Ahmet Yılmaz"; // Mock Logged in User
            // model.UserName = User.Identity.IsAuthenticated ? User.Identity.Name : "Anonim";
            
            _service.Add(model);
            return RedirectToAction("Index");
        }

        public IActionResult MyListings()
        {
            // Filter by current user (Mocked)
            var myName = "Ahmet Yılmaz"; 
            var all = _service.GetAll();
            var mine = all.Where(l => l.UserName == myName).ToList();
            return View(mine);
        }
    }
}
