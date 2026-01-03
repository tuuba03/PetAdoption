using backend.Models;

namespace backend.Services;

public interface ITokenService
{
    string GenerateToken(User user);
    int? GetUserIdFromToken(string token);
}

