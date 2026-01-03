using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class CreateListingDto
{
    [Required(ErrorMessage = "İsim gereklidir")]
    [StringLength(200, ErrorMessage = "İsim en fazla 200 karakter olabilir")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tür gereklidir")]
    [StringLength(50, ErrorMessage = "Tür en fazla 50 karakter olabilir")]
    public string Type { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Cins en fazla 100 karakter olabilir")]
    public string? Breed { get; set; }

    [Required(ErrorMessage = "Yaş gereklidir")]
    [StringLength(50, ErrorMessage = "Yaş en fazla 50 karakter olabilir")]
    public string Age { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şehir gereklidir")]
    [StringLength(100, ErrorMessage = "Şehir en fazla 100 karakter olabilir")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sağlık durumu gereklidir")]
    [StringLength(500, ErrorMessage = "Sağlık durumu en fazla 500 karakter olabilir")]
    public string Health { get; set; } = string.Empty;

    [Required(ErrorMessage = "Açıklama gereklidir")]
    public string Description { get; set; } = string.Empty;
}

