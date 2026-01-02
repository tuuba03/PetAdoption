import { useState } from 'react';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CreateListingViewProps {
  onBack: () => void;
  onSubmitListing: (listingData: any) => void;
}

// Türlere göre cinsler
const breedsByType: Record<string, string[]> = {
  'Kedi': ['British Shorthair', 'Scottish Fold', 'Persian', 'Van Kedisi', 'Tekir', 'Sarman', 'Diğer'],
  'Köpek': ['Golden Retriever', 'Labrador', 'German Shepherd', 'Husky', 'Kangal', 'Melez', 'Diğer'],
  'Kuş': ['Muhabbet Kuşu', 'Kanarya', 'Sultan Papağanı', 'Cennet Papağanı', 'Diğer'],
  'Tavşan': ['Hollanda Tavşanı', 'Lop', 'Angora', 'Rex', 'Diğer'],
};

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Gaziantep', 
  'Konya', 'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli'
];

export function CreateListingView({ onBack, onSubmitListing }: CreateListingViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    city: '',
    health: '',
    description: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Tür değiştiğinde cins seçimini sıfırla
      if (field === 'type') {
        updated.breed = '';
      }
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];

      Array.from(files).forEach((file) => {
        if (imageFiles.length + newFiles.length < 6) {
          newFiles.push(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === Array.from(files).length) {
              setImageFiles((prev) => [...prev, ...newFiles]);
              setImagePreviews((prev) => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validasyonu
    if (imageFiles.length === 0) {
      setError('Lütfen en az bir fotoğraf ekleyin!');
      return;
    }

    setIsLoading(true);
    try {
      // FormData oluştur
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('breed', formData.breed || '');
      formDataToSend.append('age', formData.age);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('health', formData.health);
      formDataToSend.append('description', formData.description);

      // Resimleri ekle
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Token'ı header'a ekle
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            throw new Error('Sunucudan geçersiz yanıt alındı');
          }
        } else {
          throw new Error('Sunucudan boş yanıt alındı');
        }
      } else {
        const text = await response.text();
        throw new Error(text || 'İlan oluşturma başarısız oldu');
      }

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'İlan oluşturma başarısız oldu');
      }

      // Başarılı
      onSubmitListing(data.data || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const availableBreeds = formData.type ? breedsByType[formData.type] || [] : [];

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Yeni İlan Oluştur</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Fotoğraf Yükleme */}
            <Card>
              <CardHeader>
                <CardTitle>Fotoğraflar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {imagePreviews.length < 6 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Fotoğraf Ekle</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  En fazla 6 fotoğraf yükleyebilirsiniz. İlk fotoğraf kapak resmi olacaktır.
                </p>
              </CardContent>
            </Card>

            {/* Temel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">İsim *</Label>
                    <Input
                      id="name"
                      placeholder="Örn: Pamuk"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Yaş *</Label>
                    <Input
                      id="age"
                      placeholder="Örn: 2 yaşında"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tür *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tür seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kedi">Kedi</SelectItem>
                        <SelectItem value="Köpek">Köpek</SelectItem>
                        <SelectItem value="Kuş">Kuş</SelectItem>
                        <SelectItem value="Tavşan">Tavşan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Cins</Label>
                    <Select
                      value={formData.breed}
                      onValueChange={(value) => handleInputChange('breed', value)}
                      disabled={!formData.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.type ? "Cins seçin" : "Önce tür seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBreeds.map((breed) => (
                          <SelectItem key={breed} value={breed}>
                            {breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleInputChange('city', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Şehir seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="health">Sağlık Durumu *</Label>
                    <Input
                      id="health"
                      placeholder="Örn: Aşıları tam, kısırlaştırılmış"
                      value={formData.health}
                      onChange={(e) => handleInputChange('health', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama *</Label>
                  <Textarea
                    id="description"
                    placeholder="Evcil hayvanınız hakkında detaylı bilgi verin..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Karakteristik özellikleri, alışkanlıkları ve sahiplenme şartlarını belirtin.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Butonlar */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                İptal
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

