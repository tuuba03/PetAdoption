import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FilterPanelProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  type: string;
  breed: string;
  city: string;
  age: string;
  healthChecked: boolean;
}

const breedsByType: Record<string, string[]> = {
  'Kedi': ['Scottish Fold', 'Tekir', 'British Shorthair', 'Van Kedisi', 'Persian', 'Ankara Kedisi'],
  'Köpek': ['Golden Retriever', 'Labrador', 'German Shepherd', 'Husky', 'Kangal', 'Poodle'],
  'Kuş': ['Muhabbet Kuşu', 'Sultan Papağanı', 'Kanarya', 'Cennet Papağanı'],
  'Tavşan': ['Holland Lop', 'Angora', 'Lop', 'Netherland Dwarf'],
};

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    breed: '',
    city: '',
    age: '',
    healthChecked: false,
  });

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    let newFilters = { ...filters, [key]: value };
    
    // Tür değiştiğinde cins filtresini sıfırla
    if (key === 'type') {
      newFilters.breed = '';
    }
    
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: '',
      breed: '',
      city: '',
      age: '',
      healthChecked: false,
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  return (
    <aside className="w-[280px] border-r bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h2 className="font-semibold">Filtreler</h2>
        </div>
        <button 
          onClick={handleReset}
          className="text-sm text-blue-600 hover:underline"
        >
          Sıfırla
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tür / Kategori</Label>
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="Kedi">Kedi</SelectItem>
              <SelectItem value="Köpek">Köpek</SelectItem>
              <SelectItem value="Kuş">Kuş</SelectItem>
              <SelectItem value="Tavşan">Tavşan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cins</Label>
          <Select 
            value={filters.breed} 
            onValueChange={(value) => handleFilterChange('breed', value === 'all' ? '' : value)}
            disabled={!filters.type}
          >
            <SelectTrigger>
              <SelectValue placeholder={filters.type ? "Tümü" : "Önce tür seçin"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {filters.type && breedsByType[filters.type]?.map((breed) => (
                <SelectItem key={breed} value={breed}>{breed}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Şehir</Label>
          <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="İstanbul">İstanbul</SelectItem>
              <SelectItem value="Ankara">Ankara</SelectItem>
              <SelectItem value="İzmir">İzmir</SelectItem>
              <SelectItem value="Bursa">Bursa</SelectItem>
              <SelectItem value="Antalya">Antalya</SelectItem>
              <SelectItem value="Adana">Adana</SelectItem>
              <SelectItem value="Gaziantep">Gaziantep</SelectItem>
              <SelectItem value="Konya">Konya</SelectItem>
              <SelectItem value="Mersin">Mersin</SelectItem>
              <SelectItem value="Kayseri">Kayseri</SelectItem>
              <SelectItem value="Eskişehir">Eskişehir</SelectItem>
              <SelectItem value="Diyarbakır">Diyarbakır</SelectItem>
              <SelectItem value="Samsun">Samsun</SelectItem>
              <SelectItem value="Denizli">Denizli</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Yaş</Label>
          <Select value={filters.age} onValueChange={(value) => handleFilterChange('age', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="0-1">0-1 yaş</SelectItem>
              <SelectItem value="1-3">1-3 yaş</SelectItem>
              <SelectItem value="3+">3+ yaş</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="health" 
            checked={filters.healthChecked}
            onCheckedChange={(checked) => handleFilterChange('healthChecked', checked as boolean)}
          />
          <Label htmlFor="health" className="cursor-pointer">
            Sağlık kontrolü yapılmış
          </Label>
        </div>
      </div>
    </aside>
  );
}

