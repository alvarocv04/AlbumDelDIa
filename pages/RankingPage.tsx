
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserUserData } from '../services/userService';
import { getAlbumsByIds } from '../services/albumService';
import { Album } from '../types';
import LoginRequired from '../components/LoginRequired';

interface RankedAlbum extends Album {
    personalRating: number;
}

const RankingPage: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [rankedAlbums, setRankedAlbums] = useState<RankedAlbum[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            if (!currentUser) {
                setIsLoading(false);
                return;
            }

            try {
                // 1. Get User Data including ratings
                const userData: any = await getUserUserData(currentUser.uid);

                if (userData && userData.ratings) {
                    const ratingEntries = Object.entries(userData.ratings);
                    // Filter entries that have a personal rating
                    const ratedAlbumIds = ratingEntries
                        .filter(([_, ratings]: [string, any]) => ratings.personal > 0)
                        .map(([albumId]) => albumId);

                    if (ratedAlbumIds.length > 0) {
                        // 2. Fetch Album Details
                        const albums = await getAlbumsByIds(ratedAlbumIds);

                        // 3. Combine and Sort
                        const rankedWithDetails = albums.map(album => {
                            const userRating = userData.ratings[album.spotifyId];
                            return {
                                ...album,
                                personalRating: userRating?.personal || 0
                            };
                        });

                        // Sort by personal rating descending
                        rankedWithDetails.sort((a, b) => b.personalRating - a.personalRating);

                        setRankedAlbums(rankedWithDetails);
                    }
                }
            } catch (error) {
                console.error("Error loading ranking:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRanking();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center relative z-10">
                    <LoginRequired
                        titleKey="ranking.login_required"
                        descriptionKey="ranking.login_desc"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-4xl">military_tech</span>
                            {t('ranking.title')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                            {t('ranking.subtitle')}
                        </p>
                    </div>

                    {/* Ranking List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : rankedAlbums.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rankedAlbums.map((album, index) => (
                                <div key={album.spotifyId} className="group relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                    {/* Rank Badge */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className={`
                                            flex items-center justify-center w-10 h-10 rounded-full font-black text-white shadow-lg text-lg
                                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-800 dark:bg-slate-700'}
                                        `}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Album Cover */}
                                    <div className="aspect-square w-full overflow-hidden relative">
                                        <div
                                            className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url("${album.coverUrl}")` }}
                                        ></div>
                                        <Link to={`/album/${album.spotifyId}`} className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <span className="material-symbols-outlined text-white text-5xl drop-shadow-lg">play_circle</span>
                                        </Link>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col gap-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                {album.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-1">
                                                {album.artist}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-left block w-full">{t('ranking.personal_rating')}</span>
                                                <div className="flex items-center gap-1 text-primary font-black text-xl">
                                                    <span>{album.personalRating}</span>
                                                    <span className="text-sm font-medium text-slate-400">/ 5</span>
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-sm filled">favorite</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl">sentiment_dissatisfied</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('ranking.no_ratings')}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                {t('ranking.start_rating')}
                            </p>
                            <Link to="/" className="mt-4 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-primary/25">
                                {t('nav.home')}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RankingPage;
