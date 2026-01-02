import { useState, useEffect } from 'react'
import { RegisterView } from './RegisterView'
import { LoginView } from './LoginView'
import { CreateListingView } from './CreateListingView'
import { MyListingsView } from './MyListingsView'
import { OwnershipCardsView } from './OwnershipCardsView'

type View = 'register' | 'login' | 'createListing' | 'myListings' | 'ownershipCards' | 'home'

function App() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentView, setCurrentView] = useState<View>('register')
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  // Token kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
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
    
    if (currentView === 'createListing') {
      return (
        <CreateListingView
          onBack={() => setCurrentView('home')}
          onSubmitListing={() => {
            setCurrentView('myListings')
          }}
        />
      )
    }

    if (currentView === 'myListings') {
      return (
        <MyListingsView
          onBack={() => setCurrentView('home')}
          onCreateListing={() => setCurrentView('createListing')}
        />
      )
    }

    if (currentView === 'ownershipCards') {
      return (
        <OwnershipCardsView
          onBack={() => setCurrentView('home')}
        />
      )
    }

    // Ana sayfa (home)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Hoş Geldiniz, {user.name || 'Kullanıcı'}!</h1>
          <p className="text-gray-600 mb-6">Başarıyla giriş yaptınız.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setCurrentView('createListing')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              İlan Oluştur
            </button>
            <button
              onClick={() => setCurrentView('myListings')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              İlanlarım
            </button>
            <button
              onClick={() => setCurrentView('ownershipCards')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Sahiplik Kartlarım
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    )
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

