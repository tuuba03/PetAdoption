using backend.Models;

namespace backend.Services
{
    public class ListingService
    {
        private static List<Listing> _listings = new List<Listing>
        {
            // Initial Seed Data
            new Listing {
                Id = 1,
                Name = "Pamuk",
                Type = "Kedi",
                Breed = "Van Kedisi",
                Age = "2 yaşında",
                City = "İstanbul",
                Health = "Aşıları tam",
                Description = "Çok oyuncu, insan canlısı beyaz bir kedi.",
                Images = new List<string> { "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
                UserName = "Ahmet Yılmaz",
                CreatedAt = DateTime.Now.AddDays(-2)
            },
            new Listing {
                Id = 2,
                Name = "Karabaş",
                Type = "Köpek",
                Breed = "Kangal",
                Age = "1 yaşında",
                City = "Sivas",
                Health = "Gayet sağlıklı",
                Description = "Sadık, korumacı ve güçlü bir dost.",
                Images = new List<string> { "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
                UserName = "Mehmet Demir",
                CreatedAt = DateTime.Now.AddDays(-5)
            }
        };

        private static int _nextId = 3;

        public List<Listing> GetAll() => _listings.Where(l => l.IsActive).ToList();

        public Listing GetById(int id) => _listings.FirstOrDefault(l => l.Id == id);

        public void Add(Listing listing)
        {
            listing.Id = _nextId++;
            listing.CreatedAt = DateTime.Now;
            _listings.Add(listing);
        }

        public void Delete(int id)
        {
            var listing = GetById(id);
            if (listing != null)
            {
                _listings.Remove(listing);
            }
        }
        
        public List<Listing> Search(string type, string city, string query)
        {
            var result = _listings.AsQueryable();
            
            if (!string.IsNullOrEmpty(type) && type != "Tümü")
                result = result.Where(l => l.Type == type);
                
            if (!string.IsNullOrEmpty(city) && city != "Tümü")
                result = result.Where(l => l.City == city);
                
            if (!string.IsNullOrEmpty(query))
                result = result.Where(l => l.Name.Contains(query, StringComparison.OrdinalIgnoreCase) || 
                                           l.Description.Contains(query, StringComparison.OrdinalIgnoreCase));
                                           
            return result.ToList();
        }
    }
}
