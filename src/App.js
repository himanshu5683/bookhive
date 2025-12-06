import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
                    
                    {/* Authentication Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/oauth/callback" element={<OAuthCallback />} />
                    
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
                    <Route path="/ai" element={
                      <ProtectedRoute>
                        <Layout><AIDashboard /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/dashboard" element={
                      <ProtectedRoute>
                        <Layout><AIDashboard /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/recommendations" element={
                      <ProtectedRoute>
                        <Layout><AIDashboard /></Layout>
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
                    <Route path="/ai/auto-tag" element={
                      <ProtectedRoute>
                        <Layout><AutoTag /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/trend-detection" element={
                      <ProtectedRoute>
                        <Layout><TrendDetection /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/sentiment" element={
                      <ProtectedRoute>
                        <Layout><SentimentAnalysis /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai/event-suggestions" element={
                      <ProtectedRoute>
                        <Layout><EventSuggestions /></Layout>
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