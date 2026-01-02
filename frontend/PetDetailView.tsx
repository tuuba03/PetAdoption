import { ChevronLeft, MapPin, Heart, MessageCircle, FileCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Pet } from './types';
import { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { AdoptPetDialog } from './AdoptPetDialog';

interface PetDetailViewProps {
  petId: string;
  onBack: () => void;
  onMessageClick?: () => void;
  onAIClick?: (petId: string) => void;
  onAdopt?: (adoptionData: any) => void;
}

export function PetDetailView({ petId, onBack, onMessageClick, onAIClick, onAdopt }: PetDetailViewProps) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showAdoptDialog, setShowAdoptDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPetDetail();
  }, [petId]);

  const fetchPetDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/listings/${petId}`, {
        method: 'GET',
        headers: {
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
        throw new Error(text || 'İlan getirilemedi');
      }

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'İlan getirilemedi');
      }

      if (data.success && data.data) {
        const listing = data.data;
        const formattedPet: Pet = {
          id: listing.Id.toString(),
          name: listing.Name,
          type: listing.Type,
          breed: listing.Breed,
          age: listing.Age,
          city: listing.City,
          health: listing.Health,
          description: listing.Description,
          image: listing.Images && listing.Images.length > 0 
            ? `http://localhost:5000${listing.Images[0]}` 
            : '',
          images: listing.Images 
            ? listing.Images.map((img: string) => `http://localhost:5000${img}`)
            : [],
          owner: {
            username: listing.UserName || 'Kullanıcı',
            avatar: 'https://via.placeholder.com/50?text=U',
          },
        };
        setPet(formattedPet);
        setSelectedImage(formattedPet.images[0] || formattedPet.image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'İlan bulunamadı'}</p>
          <Button onClick={onBack}>Geri Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                  Ana Sayfa
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                  {pet.type}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pet.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sol: Fotoğraflar */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white">
              <img 
                src={selectedImage || pet.image} 
                alt={pet.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Resim+Yok';
                }}
              />
            </div>
            
            {pet.images.length > 1 && (
              <div className="flex gap-4">
                {pet.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${pet.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ: Bilgiler */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {pet.type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{pet.city}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 py-4 border-y">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yaş:</span>
                    <span className="font-medium">{pet.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tür:</span>
                    <span className="font-medium">{pet.type}</span>
                  </div>
                  {pet.breed && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cins:</span>
                      <span className="font-medium">{pet.breed}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Şehir:</span>
                    <span className="font-medium">{pet.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sağlık Durumu:</span>
                    <span className="font-medium">{pet.health}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Açıklama</h3>
                  <p className="text-gray-700 leading-relaxed">{pet.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Sahiplendiren</h3>
                <div className="flex items-center gap-3">
                  <img 
                    src={pet.owner.avatar} 
                    alt={pet.owner.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">@{pet.owner.username}</p>
                    <p className="text-sm text-gray-500">İlan Sahibi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              {onMessageClick && (
                <Button className="flex-1" size="lg" onClick={onMessageClick}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Mesaj Gönder
                </Button>
              )}
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {onAdopt && (
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
                onClick={() => setShowAdoptDialog(true)}
              >
                <FileCheck className="w-5 h-5 mr-2" />
                Sahiplen
              </Button>
            )}
          </div>
        </div>
      </div>

      {onAdopt && pet && (
        <AdoptPetDialog
          open={showAdoptDialog}
          onOpenChange={setShowAdoptDialog}
          pet={pet}
          onAdopt={(adoptionData) => {
            onAdopt(adoptionData);
            setShowAdoptDialog(false);
          }}
        />
      )}
    </div>
  );
}

