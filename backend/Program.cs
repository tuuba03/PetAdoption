using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services;

// Load .env file
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var mvcBuilder = builder.Services.AddControllersWithViews(); // MVC pattern için

// Razor Runtime Compilation (Development için)
if (builder.Environment.IsDevelopment())
{
    mvcBuilder.AddRazorRuntimeCompilation();
}

// Session configuration
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

// Static files (CSS, JS, images)
app.UseStaticFiles();

// Uploads klasörü için static file serving
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")),
    RequestPath = ""
});

// Routing
app.UseRouting();

// Session
app.UseSession();

app.UseAuthorization();

// API routing (MVC'den önce)
app.MapControllers();

// MVC routing (API'den sonra, daha spesifik route'lar için)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Database migration (otomatik oluştur)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        
        logger.LogInformation("Veritabanı oluşturuluyor...");
        
        // Her zaman veritabanını sil ve yeniden oluştur (geliştirme için)
        // Not: Production'da bu kaldırılmalı
        try
        {
            // context.Database.EnsureDeleted(); // Verileri korumak için kapatıldı
            // logger.LogInformation("Eski veritabanı silindi.");
        }
        catch (Exception exDel)
        {
            logger.LogWarning(exDel, "Veritabanı silinirken hata (normal olabilir): {Message}", exDel.Message);
        }
        
        // Tabloları oluştur
        context.Database.EnsureCreated();
        logger.LogInformation("Veritabanı ve tablolar başarıyla oluşturuldu.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Veritabanı oluşturulurken bir hata oluştu: {Message}\n{StackTrace}", ex.Message, ex.StackTrace);
    }
}

app.Run();

