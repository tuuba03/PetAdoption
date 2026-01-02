import { useState, useEffect } from 'react'
import { RegisterView } from './RegisterView'
import { LoginView } from './LoginView'
import { CreateListingView } from './CreateListingView'
import { MyListingsView } from './MyListingsView'
import { OwnershipCardsView } from './OwnershipCardsView'
import { HomeView } from './HomeView'
import { PetDetailView } from './PetDetailView'
import { Header } from './Header'

type View = 'register' | 'login' | 'createListing' | 'myListings' | 'ownershipCards' | 'home' | 'petDetail'

function App() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentView, setCurrentView] = useState<View>('register')
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)

  // Token kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      setCurrentView('home')
    }
  }, [])

  const handleRegister = () => {
    setIsRegistered(true)
    setShowLogin(false)
    setShowRegister(false)
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
    setShowLogin(false)
    setShowRegister(false)
    setCurrentView('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setIsRegistered(false)
  }

  const handleSwitchToLogin = () => {
    setShowLogin(true)
    setShowRegister(false)
    setIsRegistered(false)
  }

  const handleSwitchToRegister = () => {
    setShowRegister(true)
    setShowLogin(false)
    setIsRegistered(false)
  }

  if (isLoggedIn) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const headerProps = {
      unreadCount: 0,
      onLogoClick: () => setCurrentView('home'),
      onLogout: handleLogout,
      onCreateListing: () => setCurrentView('createListing'),
      onMyListings: () => setCurrentView('myListings'),
      onOwnershipCards: () => setCurrentView('ownershipCards'),
      onProfile: () => setCurrentView('home'),
    }

    if (currentView === 'petDetail' && selectedPetId) {
      return (
        <>
          <Header {...headerProps} />
          <PetDetailView
            petId={selectedPetId}
            onBack={() => {
              setSelectedPetId(null);
              setCurrentView('home');
            }}
            onAdopt={(adoptionData) => {
              // Sahiplenme başarılı, ownership cards'a yönlendir
              setCurrentView('ownershipCards');
            }}
          />
        </>
      );
    }

    if (currentView === 'createListing') {
      return (
        <>
          <Header {...headerProps} />
          <CreateListingView
            onBack={() => setCurrentView('home')}
            onSubmitListing={() => {
              setCurrentView('myListings')
            }}
          />
        </>
      )
    }

    if (currentView === 'myListings') {
      return (
        <>
          <Header {...headerProps} />
          <MyListingsView
            onBack={() => setCurrentView('home')}
            onCreateListing={() => setCurrentView('createListing')}
          />
        </>
      )
    }

    if (currentView === 'ownershipCards') {
      return (
        <>
          <Header {...headerProps} />
          <OwnershipCardsView
            onBack={() => setCurrentView('home')}
          />
        </>
      )
    }

    // Ana sayfa (home) - Pet card'ları göster
    if (currentView === 'home') {
      return (
        <>
          <Header {...headerProps} />
          <HomeView
            onPetDetailClick={(petId) => {
              setSelectedPetId(petId);
              setCurrentView('petDetail');
            }}
          />
        </>
      )
    }
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Kayıt Başarılı!</h1>
          <p className="text-gray-600 mb-4">Hesabınız başarıyla oluşturuldu. Giriş yapabilirsiniz.</p>
          <button
            onClick={handleSwitchToLogin}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        onSwitchToRegister={handleSwitchToRegister}
      />
    )
  }

  return (
    <RegisterView 
      onRegister={handleRegister} 
      onSwitchToLogin={handleSwitchToLogin}
    />
  )
}

export default App

