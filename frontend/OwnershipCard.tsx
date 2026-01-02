import { QrCode, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface OwnershipCardProps {
  pet: {
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
  };
}

export function OwnershipCard({ pet }: OwnershipCardProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <Card className="overflow-hidden border-2 border-blue-600/20 shadow-lg hover:shadow-xl transition-all">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                🪪
              </div>
              <span className="font-semibold">SAHİPLİK KARTI</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowQR(true)}
              className="text-white hover:bg-white/20"
            >
              <QrCode className="w-4 h-4 mr-1" />
              QR
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-4">
            {/* Sol: Fotoğraf */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={pet.image || 'https://via.placeholder.com/200?text=Resim+Yok'}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Resim+Yok';
                  }}
                />
              </div>
            </div>
            {/* Sağ: Hayvan Bilgileri */}
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-bold text-lg">{pet.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {pet.type}
                  </Badge>
                  {pet.breed && (
                    <Badge variant="outline" className="text-xs">
                      {pet.breed}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Yaş:</span>
                  <span className="font-medium">{pet.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şehir:</span>
                  <span className="font-medium">{pet.city}</span>
                </div>
              </div>
              {pet.health && (
                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                  ✓ {pet.health.split(',')[0]}
                </Badge>
              )}
            </div>
          </div>
          {/* Alt Bant: Sahip Bilgileri */}
          <div className="mt-4 pt-4 border-t bg-gray-50 -mx-4 px-4 py-3">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Sahiplenme Tarihi: {pet.adoptionDate}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Sahip:</span>
                  <p className="font-medium">{pet.ownerName}</p>
                </div>
                <div>
                  <span className="text-gray-600">İletişim:</span>
                  <p className="font-medium">{pet.ownerContact}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* QR Kod Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Sahiplik Kartı QR Kodu</DialogTitle>
            <DialogDescription className="text-center">
              Bu QR kodu tarayarak sahiplik kartını doğrulayabilirsiniz
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg flex justify-center">
              {/* QR kod için placeholder - gerçek uygulamada QR kod library kullanılır */}
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    QR Kod
                    <br />
                    Kart ID: {pet.qrCodeId || pet.id}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold">{pet.name}</p>
            </div>
            <Button onClick={() => setShowQR(false)} className="w-full">
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

