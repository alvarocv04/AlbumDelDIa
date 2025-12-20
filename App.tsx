import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import SummaryPage from './pages/SummaryPage';
import AlbumPage from './pages/AlbumPage';
import ChatBot from './components/ChatBot';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/details" element={<DetailsPage />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/friends" element={<FriendsPage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/album/:id" element={<AlbumPage />} />
                </Routes>
                <ChatBot />
            </HashRouter>
        </LanguageProvider>
    );
};

export default App;