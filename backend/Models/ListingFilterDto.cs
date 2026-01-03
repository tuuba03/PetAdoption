namespace backend.Models;

public class ListingFilterDto
{
    public string? Type { get; set; }
    public string? Breed { get; set; }
    public string? City { get; set; }
    public string? Age { get; set; }
    public bool? HealthChecked { get; set; }
    public string? SearchQuery { get; set; }
}

