import { MapPin, Bot, Info } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Pet } from './types';

interface PetCardProps {
  pet: Pet;
  onDetailClick: (petId: string) => void;
  onAIClick?: (petId: string) => void;
}

export function PetCard({ pet, onDetailClick, onAIClick }: PetCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onDetailClick(pet.id)}>
      <div className="aspect-square overflow-hidden">
        <img 
          src={pet.image || pet.images?.[0] || 'https://via.placeholder.com/400?text=Resim+Yok'} 
          alt={pet.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Resim+Yok';
          }}
        />
      </div>
      
      <CardContent className="p-4 space-y-2">
        <div>
          <h3 className="font-semibold text-lg">{pet.name}</h3>
          <p className="text-sm text-gray-600">{pet.type}</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{pet.city}</span>
          </div>
          <Badge variant="secondary">{pet.age}</Badge>
        </div>
        
        {pet.owner && (
          <p className="text-sm text-gray-500">
            Sahiplendiren: <span className="text-blue-600">@{pet.owner.username}</span>
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => onDetailClick(pet.id)}
        >
          <Info className="w-4 h-4 mr-2" />
          İlan Detayı
        </Button>
        {onAIClick && (
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => onAIClick(pet.id)}
          >
            <Bot className="w-4 h-4 mr-2" />
            PetAdopt AI
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

