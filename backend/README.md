# PetAdopt Backend API

Bu proje PetAdopt uygulaması için C# ASP.NET Core Web API backend'idir.

## Özellikler

- Kullanıcı kayıt sistemi
- SQLite veritabanı
- BCrypt ile şifre hashleme
- Email ve telefon numarası validasyonu
- CORS desteği

## Gereksinimler

- .NET 8.0 SDK veya üzeri
- Visual Studio 2022 veya VS Code (opsiyonel)

## Kurulum

1. Proje dizinine gidin:
```bash
cd backend
```

2. Bağımlılıkları yükleyin (otomatik olarak restore edilir):
```bash
dotnet restore
```

3. Uygulamayı çalıştırın:
```bash
dotnet run
```

API `https://localhost:5001` veya `http://localhost:5000` adresinde çalışacaktır.

## API Endpoints

### POST /api/auth/register
Kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "phone": "05551234567",
  "password": "sifre123",
  "confirmPassword": "sifre123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Kayıt başarıyla tamamlandı",
  "data": {
    "id": 1,
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "phone": "05551234567",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Bu e-posta adresi zaten kullanılıyor",
  "errors": null
}
```

### GET /api/auth/check-email/{email}
E-posta adresinin kullanılıp kullanılmadığını kontrol eder.

### GET /api/auth/check-phone/{phone}
Telefon numarasının kullanılıp kullanılmadığını kontrol eder.

## Veritabanı

SQLite veritabanı otomatik olarak `petadopt.db` dosyası olarak oluşturulur. İlk çalıştırmada tablolar otomatik oluşturulur.

## Swagger

Geliştirme ortamında Swagger UI'ya `https://localhost:5001/swagger` adresinden erişebilirsiniz.

