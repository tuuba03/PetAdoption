import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AddPetManuallyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (petData: any) => void;
}

const breedsByType: Record<string, string[]> = {
  'Kedi': ['Scottish Fold', 'Tekir', 'British Shorthair', 'Van Kedisi', 'Persian', 'Ankara Kedisi'],
  'Köpek': ['Golden Retriever', 'Labrador', 'German Shepherd', 'Husky', 'Kangal', 'Poodle'],
  'Kuş': ['Muhabbet Kuşu', 'Sultan Papağanı', 'Kanarya', 'Cennet Papağanı'],
  'Tavşan': ['Holland Lop', 'Angora', 'Lop', 'Netherland Dwarf'],
};

export function AddPetManuallyDialog({ open, onOpenChange, onAdd }: AddPetManuallyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    city: '',
    health: '',
    description: '',
    listingId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Giriş yapmanız gerekiyor');
      }

      // Eğer listingId varsa, o ilanı sahiplen
      if (formData.listingId) {
        const response = await fetch('http://localhost:5000/api/ownership', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listingId: parseInt(formData.listingId),
            notes: formData.description,
          }),
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            data = JSON.parse(text);
          }
        }

        if (!response.ok) {
          throw new Error(data.message || 'Sahiplenme işlemi başarısız');
        }

        onAdd(data.data);
        onOpenChange(false);
        resetForm();
      } else {
        // Manuel ekleme için sadece frontend'de kaydet (backend'de listing oluşturulmadan sahiplik oluşturulamaz)
        // Bu durumda önce bir listing oluşturulmalı, sonra sahiplenilmeli
        throw new Error('Lütfen bir ilan ID\'si girin veya önce bir ilan oluşturun');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      breed: '',
      age: '',
      city: '',
      health: '',
      description: '',
      listingId: '',
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hayvan Ekle</DialogTitle>
          <DialogDescription>
            Mevcut bir ilanı sahiplenmek için ilan ID'sini girin veya yeni bir hayvan ekleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="listingId">İlan ID (Mevcut bir ilanı sahiplenmek için)</Label>
            <Input
              id="listingId"
              type="number"
              placeholder="İlan ID'si (opsiyonel)"
              value={formData.listingId}
              onChange={(e) => setFormData({ ...formData, listingId: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mevcut bir ilanı sahiplenmek için ilan ID'sini girin. Boş bırakırsanız yeni bir hayvan eklenir.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Hayvan Adı *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!formData.listingId}
              />
            </div>

            <div>
              <Label htmlFor="type">Tür *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ ...formData, type: value, breed: '' });
                }}
                disabled={!!formData.listingId}
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
          </div>

          {formData.type && (
            <div>
              <Label htmlFor="breed">Cins</Label>
              <Select
                value={formData.breed}
                onValueChange={(value) => setFormData({ ...formData, breed: value })}
                disabled={!!formData.listingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cins seçin" />
                </SelectTrigger>
                <SelectContent>
                  {breedsByType[formData.type]?.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Yaş *</Label>
              <Input
                id="age"
                required
                placeholder="Örn: 2 yaşında"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={!!formData.listingId}
              />
            </div>

            <div>
              <Label htmlFor="city">Şehir *</Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!!formData.listingId}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="health">Sağlık Durumu</Label>
            <Input
              id="health"
              placeholder="Örn: Aşıları tam, kısırlaştırılmış"
              value={formData.health}
              onChange={(e) => setFormData({ ...formData, health: e.target.value })}
              disabled={!!formData.listingId}
            />
          </div>

          <div>
            <Label htmlFor="description">Notlar</Label>
            <Textarea
              id="description"
              placeholder="Ek bilgiler..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

