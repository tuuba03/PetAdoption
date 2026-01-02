import { useState } from 'react';
import { MessageCircle, User, PawPrint, LogOut, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  unreadCount?: number;
  onMessagesClick?: () => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onCreateListing?: () => void;
  onProfile?: () => void;
  onMyListings?: () => void;
  onOwnershipCards?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ 
  unreadCount = 0, 
  onMessagesClick, 
  onLogoClick, 
  onLogout, 
  onCreateListing, 
  onProfile, 
  onMyListings, 
  onOwnershipCards,
  onSearch 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <PawPrint className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">PetAdopt</span>
        </button>

        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch}>
            <Input 
              type="search" 
              placeholder="İlan ara..." 
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-4">
          {onCreateListing && (
            <Button 
              onClick={onCreateListing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              İlan Oluştur
            </Button>
          )}

          {onMessagesClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onMessagesClick}
            >
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          )}

          {onLogout && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onProfile && (
                  <DropdownMenuItem onClick={onProfile}>
                    Profilim
                  </DropdownMenuItem>
                )}
                {onMyListings && (
                  <DropdownMenuItem onClick={onMyListings}>
                    İlanlarım
                  </DropdownMenuItem>
                )}
                {onOwnershipCards && (
                  <DropdownMenuItem onClick={onOwnershipCards}>
                    Sahiplik Kartlarım
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

