# PetChatBot Projesi

Bu proje, ASP.NET Core MVC kullanılarak geliştirilmiş bir Evcil Hayvan Sahiplendirme ve Mesajlaşma platformudur.

## Son Yapılan Değişiklikler
- **Mesajlaşma Sistemi**: Kullanıcıların ilan sahipleriyle mesajlaşmasını sağlayan altyapı eklendi.
- **Frontend**: Tailwind CSS ile mesajlaşma arayüzü ve "Mesaj Gönder" butonu eklendi.
- **Backend**: `MessagesController` ve `Message`/`Conversation` modelleri eklendi (In-memory storage).

## Kurulum ve Çalıştırma
Proje `backend` klasörü içerisindedir. Terminalde bu klasöre gidip aşağıdaki komutu çalıştırın:

```bash
dotnet run
```

Tarayıcıda `http://localhost:5000` (veya size verilen port) adresine gidin.

## Dosya Konumu
Proje dosyalarınız şu dizinde saklanmaktadır:
`C:\Users\selma\.gemini\antigravity\scratch\PetChatBot\backend`
