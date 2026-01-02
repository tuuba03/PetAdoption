import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Pet } from './types';

interface AdoptPetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: Pet;
  onAdopt: (adoptionData: any) => void;
}

export function AdoptPetDialog({ open, onOpenChange, pet, onAdopt }: AdoptPetDialogProps) {
  const handleAdopt = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      const response = await fetch('http://localhost:5000/api/ownership', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: parseInt(pet.id),
          notes: '',
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

      onAdopt(data.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sahiplenme Onayı</DialogTitle>
          <DialogDescription>
            {pet.name} adlı hayvanı sahiplenmek istediğinizden emin misiniz?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Hayvan:</strong> {pet.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tür:</strong> {pet.type}
            </p>
            {pet.breed && (
              <p className="text-sm text-gray-600">
                <strong>Cins:</strong> {pet.breed}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleAdopt}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sahiplen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

