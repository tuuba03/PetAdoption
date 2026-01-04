using Microsoft.AspNetCore.Mvc;
using System.Text;
using Google.GenAI;
using Google.GenAI.Types;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient; 
    // Switching to "gemini-pro" as it is the most widely supported model and "flash" variants were returning 404.
    private const string GeminiModelId = "gemini-pro"; 

    public ChatController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
    }


    [HttpGet("test-models")]
public async Task<IActionResult> ListModels()
{
    var apiKey = _configuration["Gemini:ApiKey"];
    var url = $"https://generativelanguage.googleapis.com/v1beta/models?key={apiKey}";
    var response = await _httpClient.GetAsync(url);
    var content = await response.Content.ReadAsStringAsync();
    return Ok(content);
}
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
    {
        try
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Contains("YOUR_VALID_API_KEY"))
            {
                return Ok(new { Response = "❌ API Anahtarı eksik veya hatalı yapılandırılmış." });
            }

            // The Google.GenAI library uses 'Client' as the main entry point (based on user snippet).
            // It gets the key from environment variable usually, but let's try passing it if constructor allows.
            // If Client() doesn't take args, we must rely on Env var.
            // User snippet: var client = new Client();
            System.Environment.SetEnvironmentVariable("GOOGLE_API_KEY", apiKey); 
            var client = new Client();
            
            // 2. Validate Request
            if (request?.Pet == null || string.IsNullOrWhiteSpace(request.UserMessage))
            {
                return BadRequest(new { error = "Geçersiz istek formatı." });
            }

            // 3. Build Gemini Request
            var prompt = BuildPrompt(request);
            
            // 4. Call Gemini API using the Google.GenAI client
            // Note: usage of List<Part> instead of array based on CS0029
            // Note: usage of List<Content> based on CS1503
            var response = await client.Models.GenerateContentAsync(
                model: GeminiModelId, 
                contents: new List<Content> 
                { 
                    new Content 
                    {
                        Parts = new List<Part> { new Part { Text = prompt } }
                    }
                }
            );

            // 5. Handle Response
            var botReply = response?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            return Ok(new { Response = botReply ?? "🤔 Üzgünüm, cevap alamadım." });
        }
        catch (Exception ex)
        {
            return Ok(new { Response = $"💥 Hata: {ex.Message}" });
        }
    }

    private string BuildPrompt(ChatRequest request)
    {
         var sb = new StringBuilder();
        sb.AppendLine("Sen profesyonel ve samimi bir evcil hayvan sahiplendirme asistanısın. Görevin potansiyel sahiplere yardımcı olmak.");
        sb.AppendLine("Aşağıdaki ilan detaylarına göre kullanıcının sorusunu cevapla:");
        sb.AppendLine("---");
        sb.AppendLine($"🐾 İsim: {request.Pet.Name}");
        sb.AppendLine($"📍 Tür: {request.Pet.Type}");
        sb.AppendLine($"📝 Açıklama: {request.Pet.Description}");
        sb.AppendLine("---");
        sb.AppendLine("Kurallar:");
        sb.AppendLine("1. Sadece verilen bilgilere dayanarak cevap ver, bilmediğin konularda tahmin yürütme.");
        sb.AppendLine("2. Cevapların kısa (max 3 cümle), teşvik edici ve emojili olsun.");
        sb.AppendLine("3. Eğer açıklamada bilgi yoksa 'İlan sahibine sormanız daha doğru olur' şeklinde yönlendir.");
        sb.AppendLine("---");
        sb.AppendLine($"Kullanıcı: {request.UserMessage}");
        return sb.ToString(); 
    }
}

// --- DTOs ---

public class ChatRequest
{
    public PetInfo Pet { get; set; }
    public string UserMessage { get; set; }
}

public class ChatResponse
{
    public string Response { get; set; }
}

public class PetInfo
{
    public string Name { get; set; }
    public string Type { get; set; }
    public string Description { get; set; }
}
