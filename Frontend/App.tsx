
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './views/LoginPage';
import DashboardPage from './views/DashboardPage';
import AnalysisPage from './views/AnalysisPage';
import ResultsPage from './views/ResultsPage';
import HistoryPage from './views/HistoryPage';
import SettingsPage from './views/SettingsPage';
import Layout from './components/Layout';
import { User, SystemSettings, Notification } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<SystemSettings>({
    guidelineSync: true,
    aiNarrativeDetail: 'Standard',
    hipaaMode: true
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'High Risk Alert', message: 'Patient PX-1029 shows toxicity risk for Clopidogrel.', type: 'alert', time: '2m ago', read: false },
    { id: '2', title: 'System Update', message: 'CPIC guidelines v2.4 successfully integrated.', type: 'success', time: '1h ago', read: false },
    { id: '3', title: 'New Report', message: 'Analysis for Patient PX-2041 is complete.', type: 'info', time: '3h ago', read: true },
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('pharmaGuardUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedSettings = localStorage.getItem('pharmaGuardSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pharmaGuardUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pharmaGuardUser');
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pharmaGuardSettings', JSON.stringify(newSettings));
  };

  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('pharmaGuardUser', JSON.stringify(updatedUser));
  };

  const markNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/" 
          element={user ? (
            <Layout 
              user={user} 
              onLogout={handleLogout} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              notifications={notifications}
              onMarkRead={markNotificationsRead}
            >
              <DashboardPage user={user} searchTerm={searchTerm} />
            </Layout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/analyze" 
          element={user ? (
            <Layout 
              user={user} 
              onLogout={handleLogout} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              notifications={notifications}
              onMarkRead={markNotificationsRead}
            >
              <AnalysisPage />
            </Layout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/results" 
          element={user ? (
            <Layout 
              user={user} 
              onLogout={handleLogout} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              notifications={notifications}
              onMarkRead={markNotificationsRead}
            >
              <ResultsPage settings={settings} />
            </Layout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/history" 
          element={user ? (
            <Layout 
              user={user} 
              onLogout={handleLogout} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              notifications={notifications}
              onMarkRead={markNotificationsRead}
            >
              <HistoryPage searchTerm={searchTerm} />
            </Layout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings" 
          element={user ? (
            <Layout 
              user={user} 
              onLogout={handleLogout} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              notifications={notifications}
              onMarkRead={markNotificationsRead}
            >
              <SettingsPage 
                user={user} 
                onUpdateProfile={updateUserProfile} 
                settings={settings} 
                onUpdateSettings={updateSettings} 
              />
            </Layout>
          ) : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
