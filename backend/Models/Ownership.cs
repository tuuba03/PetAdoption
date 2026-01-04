namespace backend.Models
{
    public class Ownership
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public string PetName { get; set; }
        public string PetType { get; set; }
        public string PetImage { get; set; }
        public string Breed { get; set; }
        public string Age { get; set; }
        public string City { get; set; }
        public string Health { get; set; }
        
        public string OwnerName { get; set; }
        public DateTime AdoptionDate { get; set; } = DateTime.Now;
        public string QrCodeImage { get; set; } // Base64 string
    }
}
