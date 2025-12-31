import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
// RecommendationsPage removed
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import SummaryPage from './pages/SummaryPage';
import AlbumPage from './pages/AlbumPage';
import AdminPage from './pages/AdminPage';
import CalendarPage from './pages/CalendarPage';
import ComingSoonPage from './pages/ComingSoonPage';
import SetUsernameModal from './components/SetUsernameModal';
import FAQPage from './pages/FAQPage';
import RankingPage from './pages/RankingPage';

import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Launch date: January 1, 2026
const LAUNCH_DATE = new Date('2025-12-01T00:00:00');

// Developer bypass: allows skipping the Coming Soon page
// Use ?dev=true in URL to activate, or it persists in localStorage
const isDevMode = (): boolean => {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const devParam = urlParams.get('dev');

    // If ?dev=true, save to localStorage and return true
    if (devParam === 'true') {
        localStorage.setItem('albumdeldia_dev_mode', 'true');
        return true;
    }

    // If ?dev=false, clear localStorage and return false
    if (devParam === 'false') {
        localStorage.removeItem('albumdeldia_dev_mode');
        return false;
    }

    // Check localStorage for persisted dev mode
    return localStorage.getItem('albumdeldia_dev_mode') === 'true';
};

const isBeforeLaunch = (): boolean => {
    // Skip Coming Soon if in dev mode
    if (isDevMode()) {
        console.log('🔧 Dev mode active - skipping Coming Soon page');
        return false;
    }
    return new Date() < LAUNCH_DATE;
};

const App: React.FC = () => {
    // Check if we're before the launch date (and not in dev mode)
    if (isBeforeLaunch()) {
        return (
            <LanguageProvider>
                <ThemeProvider>
                    <ComingSoonPage />
                </ThemeProvider>
            </LanguageProvider>
        );
    }


    return (
        <LanguageProvider>
            <ThemeProvider>
                <AuthProvider>
                    <SetUsernameModal />
                    <HashRouter>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/details" element={<DetailsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/profile/:userId" element={<ProfilePage />} />
                            <Route path="/friends" element={<FriendsPage />} />
                            <Route path="/summary" element={<SummaryPage />} />
                            <Route path="/calendar" element={<CalendarPage />} />
                            <Route path="/album/:id" element={<AlbumPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/ranking" element={<RankingPage />} />
                            <Route path="/faq" element={<FAQPage />} />

                        </Routes>
                    </HashRouter>
                </AuthProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
};

export default App;