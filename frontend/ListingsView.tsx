import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { FilterPanel, FilterState } from './FilterPanel';
import { SearchBar } from './SearchBar';
import { Button } from './ui/button';

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
  userName: string;
  createdAt: string;
}

export function ListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    breed: '',
    city: '',
    age: '',
    healthChecked: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings(filters, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery]);

  const fetchListings = async (currentFilters: FilterState, currentSearch: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Query parametreleri oluştur
      const params = new URLSearchParams();
      if (currentFilters.type) params.append('type', currentFilters.type);
      if (currentFilters.breed) params.append('breed', currentFilters.breed);
      if (currentFilters.city) params.append('city', currentFilters.city);
      if (currentFilters.age) params.append('age', currentFilters.age);
      if (currentFilters.healthChecked) params.append('healthChecked', 'true');
      if (currentSearch) params.append('searchQuery', currentSearch);

      const url = `http://localhost:5000/api/listings${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
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
        throw new Error(text || 'İlanlar getirilemedi');
      }

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'İlanlar getirilemedi');
      }

      if (data.success && data.data) {
        setListings(data.data);
        setFilteredListings(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchListings}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Filtre Paneli */}
      <FilterPanel onFilterChange={handleFilterChange} />

      {/* Ana İçerik */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Arama Çubuğu */}
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Sonuç Sayısı */}
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredListings.length} ilan bulundu
            </p>
          </div>

          {/* İlan Listesi */}
          {filteredListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
                    <Badge className="absolute top-2 left-2 bg-blue-600">
                      {listing.type}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{listing.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {listing.age} • {listing.city}
                    </p>
                    {listing.breed && (
                      <p className="text-xs text-gray-500 mb-2">{listing.breed}</p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{listing.userName}</span>
                      <Button size="sm" variant="outline">
                        Detay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">İlan bulunamadı</p>
              <p className="text-gray-400 text-sm">
                Filtreleri değiştirerek tekrar deneyin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

