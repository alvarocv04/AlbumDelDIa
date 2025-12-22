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
import SetUsernameModal from './components/SetUsernameModal';

import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
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
                            <Route path="/album/:id" element={<AlbumPage />} />
                            <Route path="/admin" element={<AdminPage />} />

                        </Routes>
                    </HashRouter>
                </AuthProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
};

export default App;