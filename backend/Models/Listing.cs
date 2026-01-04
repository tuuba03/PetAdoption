using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Listing
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; } // Cat, Dog, etc.
        public string Breed { get; set; }
        public string Age { get; set; }
        public string City { get; set; }
        public string Health { get; set; }
        public string Description { get; set; }
        public List<string> Images { get; set; } = new List<string>();
        public string UserName { get; set; } // Owner
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
    }
}
