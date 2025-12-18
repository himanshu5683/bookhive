import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './styles/styles.css';

// Import i18n
import './config/i18n';

// Context Providers - Correct Order: ThemeProvider > AuthProvider > CreditProvider > LanguageProvider > WebSocketProvider > NotificationProvider
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './auth/AuthContext';
import { CreditProvider } from './context/CreditContext';
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
import AIDashboard from './Pages/ai/Dashboard';
import Chat from './Pages/ai/Chat';
import Summarize from './Pages/ai/Summarize';
import Search from './Pages/ai/Search';
import AutoTag from './Pages/ai/AutoTag';
import TrendDetection from './Pages/ai/TrendDetection';
import SentimentAnalysis from './Pages/ai/SentimentAnalysis';
import EventSuggestions from './Pages/ai/EventSuggestions';
// Authentication Pages
import Login from './Pages/auth/Login';
import Signup from './Pages/auth/Signup';
import OAuthCallback from './Pages/auth/OAuthCallback';

// Common Components
import Navbar from './Pages/common/Navbar';
import Home from './Pages/common/Home';
import Library from './Pages/common/Library';
import Profile from './Pages/common/Profile';
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

// Animated Page Wrapper
const AnimatedPage = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      >
        {children}
      </div>
    </AnimatePresence>
  );
};

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
                    <Route path="/" element={<Layout><AnimatedPage><Home /></AnimatedPage></Layout>} />
                    <Route path="/library" element={<Layout><AnimatedPage><Library /></AnimatedPage></Layout>} />
                    <Route path="/resources" element={<Layout><AnimatedPage><Resources /></AnimatedPage></Layout>} />
                    <Route path="/stories" element={<Layout><AnimatedPage><Stories /></AnimatedPage></Layout>} />
                    <Route path="/circles" element={<Layout><AnimatedPage><StudyCircles /></AnimatedPage></Layout>} />
                    <Route path="/leaderboard" element={<Layout><AnimatedPage><Leaderboard /></AnimatedPage></Layout>} />
                    <Route path="/profile" element={<Layout><AnimatedPage><Profile /></AnimatedPage></Layout>} />
                    <Route path="/events" element={<Layout><AnimatedPage><Events /></AnimatedPage></Layout>} />
                    
                    {/* Authentication Routes */}
                    <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
                    <Route path="/signup" element={<AnimatedPage><Signup /></AnimatedPage>} />
                    <Route path="/oauth/callback" element={<AnimatedPage><OAuthCallback /></AnimatedPage>} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><Dashboard /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/upload" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><Upload /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/files" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><FileList /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><NotificationsPage /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* AI Routes */}
                    <Route path="/ai" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><AIDashboard /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/dashboard" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><AIDashboard /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/recommendations" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><AIDashboard /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/chat" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><Chat /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/summarize" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><Summarize /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/search" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><Search /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/auto-tag" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><AutoTag /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/trend-detection" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><TrendDetection /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/sentiment" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><SentimentAnalysis /></AnimatedPage></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/event-suggestions" element={
                      <ProtectedRoute>
                        <Layout><AnimatedPage><EventSuggestions /></AnimatedPage></Layout>
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