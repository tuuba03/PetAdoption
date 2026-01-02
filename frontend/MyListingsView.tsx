import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, PackagePlus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface MyListingsViewProps {
  onBack: () => void;
  userListings?: Array<any>;
  onCreateListing?: () => void;
}

interface Listing {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age: string;
  city: string;
  health: string;
  description: string;
  images: string[];
  createdAt: string;
  isActive?: boolean;
}

export function MyListingsView({ onBack, onCreateListing }: MyListingsViewProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/listings/my', {
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
        throw new Error(text || 'İlanlar getirilemedi');
      }

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'İlanlar getirilemedi');
      }

      if (data.success && data.data) {
        setListings(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (listingId: number) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        method: 'DELETE',
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
          data = JSON.parse(text);
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || 'İlan silinemedi');
      }

      // Listeyi yenile
      fetchMyListings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'İlan silinirken bir hata oluştu');
    }
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
          <Button onClick={onBack}>Geri Dön</Button>
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
            <h1 className="text-2xl font-bold">İlanlarım</h1>
          </div>
          {onCreateListing && (
            <Button
              onClick={onCreateListing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni İlan
            </Button>
          )}
        </div>

        {listings && listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={listing.images && listing.images.length > 0 
                      ? `http://localhost:5000${listing.images[0]}` 
                      : 'https://via.placeholder.com/400?text=Resim+Yok'}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Resim+Yok';
                    }}
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    {listing.isActive !== false ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{listing.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {listing.type} • {listing.age}
                  </p>
                  <p className="text-sm text-gray-500">{listing.city}</p>
                  {listing.breed && (
                    <p className="text-xs text-gray-400 mt-1">{listing.breed}</p>
                  )}
                  <Separator className="my-3" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Düzenle
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(listing.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <PackagePlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz ilan yayınlamadınız.</p>
              {onCreateListing && (
                <Button
                  onClick={onCreateListing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  İlan Oluştur
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

