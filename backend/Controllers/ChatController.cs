using Microsoft.AspNetCore.Mvc;
using System.Text;
using Newtonsoft.Json;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public ChatController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient("GeminiClient");
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            return BadRequest("API Key is missing in configuration.");
        }

        var prompt = BuildPrompt(request);
        
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}", content);

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        var geminiResponse = JsonConvert.DeserializeObject<GeminiResponse>(jsonResponse);
        
        var botReply = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

        return Ok(new { Response = botReply });
    }

    private string BuildPrompt(ChatRequest request)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Sen bir evcil hayvan sahiplendirme asistanısın. Aşağıdaki hayvan hakkında soruları cevaplayacaksın.");
        sb.AppendLine("Cevabı verirken SADECE bu hayvana ait özellikleri ve açıklamadaki detayları kullan. Genel geçer veteriner tavsiyeleri verme.");
        sb.AppendLine("Eğer mama veya bakım sorulursa, genel konuşmak yerine spesifik içerik önerileri ver (örn: 'somonlu kısır kedi maması', 'kızılcık özlü mama'). Marka ismi vermeden içeriğe odaklan.");
        sb.AppendLine("Cevabın kısa, samimi ve öz olsun. En fazla 100 kelime kullan.");
        sb.AppendLine($"Hayvan Adı: {request.Pet.Name}");
        sb.AppendLine($"Tür: {request.Pet.Type}");
        sb.AppendLine($"Açıklama: {request.Pet.Description}");
        sb.AppendLine("---");
        sb.AppendLine("Kullanıcı Sorusu: " + request.UserMessage);
        return sb.ToString();
    }
}

public class ChatRequest
{
    public PetInfo Pet { get; set; }
    public string UserMessage { get; set; }
}

public class PetInfo
{
    public string Name { get; set; }
    public string Type { get; set; }
    public string Description { get; set; }
}

public class GeminiResponse
{
    public Candidate[] Candidates { get; set; }
}

public class Candidate
{
    public Content Content { get; set; }
}

public class Content
{
    public Part[] Parts { get; set; }
}

public class Part
{
    public string Text { get; set; }
}
