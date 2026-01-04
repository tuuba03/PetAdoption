using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

public class HomeController : Controller
{
    private readonly ApplicationDbContext _context;

    public HomeController(ApplicationDbContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        if (!string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
        {
            return RedirectToAction("Dashboard");
        }
        return View();
    }

    public async Task<IActionResult> Dashboard(ListingFilterDto filter)
    {
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
        {
            return RedirectToAction("Login", "AuthMvc");
        }

        var query = _context.Listings
            .Where(l => l.IsActive)
            .Include(l => l.User)
            .AsQueryable();

        // Filtreleme
        if (filter != null)
        {
                if (!string.IsNullOrEmpty(filter.Type) && filter.Type != "all")
            {
                query = query.Where(l => l.Type.ToLower() == filter.Type.ToLower());
            }

            if (!string.IsNullOrEmpty(filter.Breed) && filter.Breed != "all")
            {
                query = query.Where(l => l.Breed.ToLower() == filter.Breed.ToLower());
            }

            if (!string.IsNullOrEmpty(filter.City) && filter.City != "all")
            {
                query = query.Where(l => l.City.ToLower() == filter.City.ToLower());
            }

            if (!string.IsNullOrEmpty(filter.Age) && filter.Age != "all")
            {
                if (filter.Age == "0-1")
                {
                    query = query.Where(l => l.Age.Contains("0") || l.Age.Contains("1") || 
                        l.Age.Contains("ay") || l.Age.Contains("Ay"));
                }
                else if (filter.Age == "1-3")
                {
                    query = query.Where(l => l.Age.Contains("1") || l.Age.Contains("2") || 
                        l.Age.Contains("3") || (l.Age.Contains("yaş") && !l.Age.Contains("4") && 
                        !l.Age.Contains("5") && !l.Age.Contains("6") && !l.Age.Contains("7") && 
                        !l.Age.Contains("8") && !l.Age.Contains("9")));
                }
                else if (filter.Age == "3+")
                {
                    query = query.Where(l => !string.IsNullOrEmpty(l.Age) && 
                        (l.Age.Contains("3") || l.Age.Contains("4") || l.Age.Contains("5") || 
                         l.Age.Contains("6") || l.Age.Contains("7") || l.Age.Contains("8") || 
                         l.Age.Contains("9") || (l.Age.Contains("yaş") && 
                         (l.Age.Contains("3") || l.Age.Contains("4") || l.Age.Contains("5") || 
                          l.Age.Contains("6") || l.Age.Contains("7") || l.Age.Contains("8") || 
                          l.Age.Contains("9")))));
                }
            }

            if (filter.HealthChecked == true)
            {
                query = query.Where(l => !string.IsNullOrEmpty(l.Health) && 
                    (l.Health.Contains("aşı") || l.Health.Contains("Aşı") || 
                     l.Health.Contains("sağlık") || l.Health.Contains("Sağlık")));
            }

            if (!string.IsNullOrEmpty(filter.SearchQuery))
            {
                var searchTerm = filter.SearchQuery.ToLower();
                query = query.Where(l => 
                    l.Name.ToLower().Contains(searchTerm) ||
                    l.Description.ToLower().Contains(searchTerm) ||
                    (l.Breed != null && l.Breed.ToLower().Contains(searchTerm)));
            }
        }

        var listings = await query
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        ViewBag.Filter = filter ?? new ListingFilterDto();

        return View(listings);
    }
}

