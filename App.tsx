
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ImportData } from './components/ImportData';
import { ShopSettings } from './components/ShopSettings';
import { Mapping } from './components/Mapping';
import { getStoredUser, logoutUser } from './services/authService';
import { ShopProvider, useShop } from './context/ShopContext';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'import' | 'shop-settings' | 'mapping'>('login');
  const { refreshShopSettings } = useShop();

  // Check for persisted login on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
        setUser(storedUser);
        refreshShopSettings(); // Global fetch on mount
        setCurrentView('dashboard');
    }
  }, [refreshShopSettings]);

  const handleLoginSuccess = async (userData: User) => {
    setUser(userData);
    await refreshShopSettings(); // Global fetch on login success
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('login');
  };

  // If user is not logged in, show Login or Register
  if (!user) {
    return (
      <>
        {currentView === 'register' ? (
          <Register 
            onRegisterSuccess={handleLoginSuccess}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        ) : (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onNavigateToRegister={() => setCurrentView('register')} 
          />
        )}
      </>
    );
  }

  // Authenticated Routes
  if (currentView === 'import') {
    return <ImportData onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'shop-settings') {
    return <ShopSettings onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'mapping') {
    return <Mapping onBack={() => setCurrentView('dashboard')} />;
  }

  // Default Authenticated View: Dashboard
  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
      onNavigateToImport={() => setCurrentView('import')}
      onNavigateToShopSettings={() => setCurrentView('shop-settings')}
      onNavigateToMapping={() => setCurrentView('mapping')}
    />
  );
}

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
