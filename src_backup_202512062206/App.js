import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/styles.css';

// Import i18n
import './config/i18n';

// Context Providers
import { AuthProvider } from './auth/AuthContext';
import { CreditProvider } from './context/CreditContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import ProtectedRoute from './auth/ProtectedRoute';
import AppWrapper from './Pages/common/AppWrapper';

// Page Components
import Dashboard from './Pages/Dashboard';
import Resources from './Pages/Resources';
import Stories from './Pages/Stories';
import StudyCircles from './Pages/StudyCircles';
import Leaderboard from './Pages/Leaderboard';
import Upload from './Pages/Upload';
import FileList from './Pages/FileList';
import Events from './Pages/Events';
import NotificationsPage from './Pages/NotificationsPage';

// AI Components
import Recommendations from './Pages/ai/Recommendations';
import Chat from './Pages/ai/Chat';
import Summarize from './Pages/ai/Summarize';
import Search from './Pages/ai/Search';

// Authentication Pages
import Login from './Pages/auth/Login';
import Signup from './Pages/auth/Signup';

// Common Components
import Navbar from './Pages/common/Navbar';
import Home from './Pages/common/Home';
import Library from './Pages/common/Library';
import Profile from './Pages/common/Profile';
import AuthPage from './Pages/common/AuthPage';
import Footer from './Pages/common/Footer';

// Layout component that includes navbar and footer
const Layout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <div className="container">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CreditProvider>
          <LanguageProvider>
            <WebSocketProvider>
              <NotificationProvider>
                <AppWrapper>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/library" element={<Layout><Library /></Layout>} />
                    <Route path="/resources" element={<Layout><Resources /></Layout>} />
                    <Route path="/stories" element={<Layout><Stories /></Layout>} />
                    <Route path="/circles" element={<Layout><StudyCircles /></Layout>} />
                    <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
                    <Route path="/profile" element={<Layout><Profile /></Layout>} />
                    <Route path="/events" element={<Layout><Events /></Layout>} />
                    <Route path="/auth" element={<AuthPage />} />
                    
                    {/* Authentication Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Layout><Dashboard /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/upload" element={
                      <ProtectedRoute>
                        <Layout><Upload /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/files" element={
                      <ProtectedRoute>
                        <Layout><FileList /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Layout><NotificationsPage /></Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* AI Routes */}
                    <Route path="/ai/recommendations" element={
                      <ProtectedRoute>
                        <Layout><Recommendations /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/chat" element={
                      <ProtectedRoute>
                        <Layout><Chat /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/summarize" element={
                      <ProtectedRoute>
                        <Layout><Summarize /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/search" element={
                      <ProtectedRoute>
                        <Layout><Search /></Layout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </AppWrapper>
              </NotificationProvider>
            </WebSocketProvider>
          </LanguageProvider>
        </CreditProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;