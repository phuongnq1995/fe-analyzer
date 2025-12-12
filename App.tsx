import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ImportData } from './components/ImportData';
import { getStoredUser, logoutUser } from './services/authService';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'import'>('login');
  
  // Check for persisted login on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
        setUser(storedUser);
        setCurrentView('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
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

  // Default Authenticated View: Dashboard
  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
      onNavigateToImport={() => setCurrentView('import')}
    />
  );
}
