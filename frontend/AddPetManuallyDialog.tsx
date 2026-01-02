import { useState } from 'react';
import { Upload, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AddPetManuallyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (petData: {
    id: string;
    name: string;
    type: string;
    breed?: string;
    age: string;
    city: string;
    health: string;
    image: string;
    adoptionDate: string;
    ownerName: string;
    ownerContact: string;
  }) => void;
}

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Gaziantep',
  'Konya', 'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli',
];

const breedsByType: Record<string, string[]> = {
  'Kedi': ['British Shorthair', 'Scottish Fold', 'Persian', 'Van Kedisi', 'Tekir', 'Sarman', 'Diğer'],
  'Köpek': ['Golden Retriever', 'Labrador', 'German Shepherd', 'Husky', 'Kangal', 'Melez', 'Diğer'],
  'Kuş': ['Muhabbet Kuşu', 'Kanarya', 'Sultan Papağanı', 'Cennet Papağanı', 'Diğer'],
  'Tavşan': ['Hollanda Tavşanı', 'Lop', 'Angora', 'Rex', 'Diğer'],
};

export function AddPetManuallyDialog({ open, onOpenChange, onAdd }: AddPetManuallyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    city: '',
    health: '',
    adoptionDate: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Giriş yapmanız gerekiyor');
      }

      // Sahiplenme tarihini parse et
      let adoptionDate: Date;
      if (formData.adoptionDate) {
        // Tarih formatını parse et (örn: "15 Ocak 2024")
        const dateStr = formData.adoptionDate.trim();
        // Basit parse - gerçek uygulamada daha iyi bir date parser kullanılabilir
        adoptionDate = new Date(dateStr);
        if (isNaN(adoptionDate.getTime())) {
          // Eğer parse edilemezse bugünün tarihini kullan
          adoptionDate = new Date();
        }
      } else {
        adoptionDate = new Date();
      }

      // FormData oluştur
      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.name);
      formDataToSend.append('Type', formData.type);
      if (formData.breed) {
        formDataToSend.append('Breed', formData.breed);
      }
      formDataToSend.append('Age', formData.age);
      formDataToSend.append('City', formData.city);
      formDataToSend.append('Health', formData.health);
      formDataToSend.append('AdoptionDate', adoptionDate.toISOString());
      if (formData.description) {
        formDataToSend.append('Description', formData.description);
      }
      if (imageFile) {
        formDataToSend.append('Image', imageFile);
      }

      const response = await fetch('http://localhost:5000/api/ownership/manual', {
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
        throw new Error(text || 'Sahiplik kartı oluşturulamadı');
      }

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'Sahiplik kartı oluşturulamadı');
      }

      if (data.success && data.data) {
        // Backend'den gelen veriyi frontend formatına çevir
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const newPet = {
          id: data.data.Id,
          name: data.data.Name,
          type: data.data.Type,
          breed: data.data.Breed,
          age: data.data.Age,
          city: data.data.City,
          health: data.data.Health,
          image: imagePreview || '',
          adoptionDate: data.data.AdoptionDate,
          ownerName: data.data.OwnerName || user.name,
          ownerContact: data.data.OwnerContact || user.phone,
          qrCodeId: data.data.QrCodeId,
        };

        onAdd(newPet);

        // Formu sıfırla
        setFormData({
          name: '',
          type: '',
          breed: '',
          age: '',
          city: '',
          health: '',
          adoptionDate: '',
          description: '',
        });
        setImageFile(null);
        setImagePreview('');
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: '',
      breed: '',
      age: '',
      city: '',
      health: '',
      adoptionDate: '',
      description: '',
    });
    setImageFile(null);
    setImagePreview('');
    setError(null);
    onOpenChange(false);
  };

  const availableBreeds = formData.type ? breedsByType[formData.type] || [] : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manuel Sahiplik Kartı Oluştur</DialogTitle>
          <DialogDescription>
            Platform dışında sahiplendiğiniz hayvanı sisteme ekleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Fotoğraf */}
          <div className="space-y-2">
            <Label>Fotoğraf</Label>
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                >
                  Değiştir
                </button>
              </div>
            ) : (
              <label className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Fotoğraf Yükle (Opsiyonel)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Temel Bilgiler */}
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
                  <SelectValue placeholder={formData.type ? 'Cins seçin' : 'Önce tür seçin'} />
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
              <Label htmlFor="adoptionDate">Sahiplenme Tarihi *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="adoptionDate"
                  type="date"
                  value={formData.adoptionDate}
                  onChange={(e) => handleInputChange('adoptionDate', e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              placeholder="Ek bilgiler (opsiyonel)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
