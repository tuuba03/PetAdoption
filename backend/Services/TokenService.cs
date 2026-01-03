using System.Security.Cryptography;
using System.Text;
using backend.Models;

namespace backend.Services;

public class TokenService : ITokenService
{
    public string GenerateToken(User user)
    {
        // Basit token oluşturma (production'da JWT kullanılmalı)
        var data = $"{user.Id}:{user.Email}:{DateTime.UtcNow:yyyyMMddHHmmss}";
        var bytes = Encoding.UTF8.GetBytes(data);
        var hash = SHA256.HashData(bytes);
        var token = Convert.ToBase64String(hash);
        
        // Token'a user ID'yi ekle (basit yöntem)
        return $"{user.Id}:{token}";
    }

    public int? GetUserIdFromToken(string token)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
                return null;

            // Token formatı: "userId:hash"
            var parts = token.Split(':');
            if (parts.Length >= 1 && int.TryParse(parts[0], out var userId))
            {
                return userId;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }
}

