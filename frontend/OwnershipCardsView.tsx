import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, PackagePlus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { OwnershipCard } from './OwnershipCard';
import { AddPetManuallyDialog } from './AddPetManuallyDialog';

interface OwnershipCardsViewProps {
  onBack: () => void;
  adoptedPets?: Array<{
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
    qrCodeId?: string;
  }>;
  onAddPetManually?: (petData: any) => void;
}

export function OwnershipCardsView({ onBack, onAddPetManually }: OwnershipCardsViewProps) {
  const [showAddPetDialog, setShowAddPetDialog] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerships();
  }, []);

  const fetchOwnerships = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/ownership', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
        throw new Error(text || 'Sahiplik kartları getirilemedi');
      }

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'Sahiplik kartları getirilemedi');
      }

      if (data.success && data.data) {
        // Backend'den gelen veriyi frontend formatına çevir
        const formattedPets = data.data.map((pet: any) => ({
          id: pet.Id,
          name: pet.Name,
          type: pet.Type,
          breed: pet.Breed,
          age: pet.Age,
          city: pet.City,
          health: pet.Health,
          image: pet.Image ? `http://localhost:5000${pet.Image}` : '',
          adoptionDate: pet.AdoptionDate,
          ownerName: pet.OwnerName,
          ownerContact: pet.OwnerContact,
          qrCodeId: pet.QrCodeId,
        }));
        setPets(formattedPets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPet = async (petData: any) => {
    if (onAddPetManually) {
      onAddPetManually(petData);
    }
    // Manuel ekleme sonrası listeyi yenile
    await fetchOwnerships();
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchOwnerships}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Sahiplik Kartlarım</h1>
          </div>
          <Button
            onClick={() => setShowAddPetDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Hayvan Ekle
          </Button>
        </div>

        {pets.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="text-center py-12">
              <PackagePlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz sahiplendiğiniz bir hayvan bulunmuyor.</p>
              <Button
                onClick={() => setShowAddPetDialog(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                İlk Hayvanı Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <OwnershipCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>

      {/* Manuel Hayvan Ekleme Dialog'u */}
      <AddPetManuallyDialog
        open={showAddPetDialog}
        onOpenChange={setShowAddPetDialog}
        onAdd={handleAddPet}
      />
    </div>
  );
}

