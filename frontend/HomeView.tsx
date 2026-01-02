import { FilterPanel, FilterState } from './FilterPanel';
import { PetCard } from './PetCard';
import { Pet } from './types';
import { useState, useEffect } from 'react';

interface HomeViewProps {
  onPetDetailClick: (petId: string) => void;
  onAIClick?: (petId: string) => void;
}

export function HomeView({ onPetDetailClick, onAIClick }: HomeViewProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    breed: '',
    city: '',
    age: '',
    healthChecked: false,
  });

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pets, filters]);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.breed) params.append('breed', filters.breed);
      if (filters.city) params.append('city', filters.city);
      if (filters.age) params.append('age', filters.age);
      if (filters.healthChecked) params.append('healthChecked', 'true');

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
        // Backend'den gelen veriyi Pet formatına çevir
        const formattedPets: Pet[] = data.data.map((listing: any) => ({
          id: listing.Id?.toString() || listing.id?.toString() || '',
          name: listing.Name || listing.name || '',
          type: listing.Type || listing.type || '',
          breed: listing.Breed || listing.breed,
          age: listing.Age || listing.age || '',
          city: listing.City || listing.city || '',
          health: listing.Health || listing.health || '',
          description: listing.Description || listing.description || '',
          image: (listing.Images && listing.Images.length > 0) 
            ? `http://localhost:5000${listing.Images[0]}` 
            : (listing.images && listing.images.length > 0)
            ? `http://localhost:5000${listing.images[0]}`
            : '',
          images: listing.Images 
            ? listing.Images.map((img: string) => `http://localhost:5000${img}`)
            : listing.images
            ? listing.images.map((img: string) => `http://localhost:5000${img}`)
            : [],
          owner: {
            username: listing.UserName || listing.userName || 'Kullanıcı',
            avatar: 'https://via.placeholder.com/50?text=U',
          },
        }));
        setPets(formattedPets);
        setFilteredPets(formattedPets);
      } else {
        // Veri yoksa boş array set et
        setPets([]);
        setFilteredPets([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...pets];

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((pet) => pet.type === filters.type);
    }

    if (filters.breed && filters.breed !== 'all') {
      filtered = filtered.filter((pet) => pet.breed === filters.breed);
    }

    if (filters.city && filters.city !== 'all') {
      filtered = filtered.filter((pet) => pet.city === filters.city);
    }

    if (filters.age && filters.age !== 'all') {
      filtered = filtered.filter((pet) => {
        const ageStr = pet.age.toLowerCase();
        if (filters.age === '0-1') {
          return ageStr.includes('0') || ageStr.includes('1') || ageStr.includes('ay');
        }
        if (filters.age === '1-3') {
          return ageStr.includes('1') || ageStr.includes('2') || ageStr.includes('3');
        }
        if (filters.age === '3+') {
          return ageStr.includes('3') || ageStr.includes('4') || ageStr.includes('5') || 
                 ageStr.includes('6') || ageStr.includes('7') || ageStr.includes('8') || 
                 ageStr.includes('9') || ageStr.includes('yaş');
        }
        return true;
      });
    }

    if (filters.healthChecked) {
      filtered = filtered.filter((pet) => 
        pet.health.toLowerCase().includes('aşı') || 
        pet.health.toLowerCase().includes('sağlık')
      );
    }

    setFilteredPets(filtered);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Backend'den yeni veri çek
    fetchListings();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchListings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <FilterPanel onFilterChange={handleFilterChange} />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Sahiplendirme İlanları</h1>
            <p className="text-gray-600">{filteredPets.length} ilan bulundu</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <PetCard 
                key={pet.id} 
                pet={pet} 
                onDetailClick={onPetDetailClick}
                onAIClick={onAIClick}
              />
            ))}
          </div>
          {filteredPets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aradığınız kriterlere uygun ilan bulunamadı.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

