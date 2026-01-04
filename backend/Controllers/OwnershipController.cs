using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using QRCoder;

namespace backend.Controllers
{
    public class OwnershipController : Controller
    {
        private readonly ListingService _listingService;
        
        // In-memory store
        private static List<Ownership> _ownerships = new List<Ownership>();
        private static int _nextId = 1;

        public OwnershipController(ListingService listingService)
        {
            _listingService = listingService;
        }

        public IActionResult Cards()
        {
            return View(_ownerships);
        }
        
        [HttpGet]
        public IActionResult Create(int listingId)
        {
            var listing = _listingService.GetById(listingId);
            if (listing == null) return NotFound();
            
            // Create Ownership logic
            var ownership = new Ownership
            {
                Id = _nextId++,
                ListingId = listing.Id,
                PetName = listing.Name,
                PetType = listing.Type,
                PetImage = listing.Images.FirstOrDefault() ?? "https://via.placeholder.com/150",
                Breed = listing.Breed,
                Age = listing.Age,
                City = listing.City,
                Health = listing.Health,
                OwnerName = "Ahmet Yılmaz", // Mock User
                AdoptionDate = DateTime.Now
            };

            // Generate QR Code
            string qrContent = $"PetAdopt Identity\nID: {ownership.Id}\nPet: {ownership.PetName}\nOwner: {ownership.OwnerName}\nDate: {ownership.AdoptionDate.ToShortDateString()}";
            
            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrContent, QRCodeGenerator.ECCLevel.Q);
                PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);
                byte[] qrCodeBytes = qrCode.GetGraphic(20);
                ownership.QrCodeImage = "data:image/png;base64," + Convert.ToBase64String(qrCodeBytes);
            }

            _ownerships.Add(ownership);
            
            // Mark listing as not active? Or kept for history.
            // listing.IsActive = false; 

            return RedirectToAction("Cards");
        }
    }
}
