import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserUserData } from '../services/userService';
import { getAlbumsByIds } from '../services/albumService';
import { Album } from '../types';

import LoginRequired from '../components/LoginRequired';

interface LibraryAlbum extends Album {
    isSaved: boolean;
    isListened: boolean;
}

const DetailsPage: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [filter, setFilter] = useState<'all' | 'listened' | 'saved'>('all');
    const [search, setSearch] = useState('');
    const [albums, setAlbums] = useState<LibraryAlbum[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLibrary = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userData = await getUserUserData(currentUser.uid);
                if (!userData) {
                    setLoading(false);
                    return;
                }

                const savedIds = userData.savedAlbums || [];
                const listenedIds = userData.history || [];
                const allIds = Array.from(new Set([...savedIds, ...listenedIds]));

                if (allIds.length === 0) {
                    setAlbums([]);
                    setLoading(false);
                    return;
                }

                const fetchedAlbums = await getAlbumsByIds(allIds);

                // Map to LibraryAlbum with status flags
                const libraryAlbums: LibraryAlbum[] = fetchedAlbums.map(album => ({
                    ...album,
                    isSaved: savedIds.includes(album.spotifyId),
                    isListened: listenedIds.includes(album.spotifyId)
                }));

                setAlbums(libraryAlbums);
            } catch (error) {
                console.error("Error fetching library:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [currentUser]);

    const filteredAlbums = albums.filter(album => {
        const matchesStatus = filter === 'all' ||
            (filter === 'listened' && album.isListened) ||
            (filter === 'saved' && album.isSaved);
        const matchesSearch = album.title.toLowerCase().includes(search.toLowerCase()) ||
            album.artist.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow w-full px-4 md:px-10 py-8 animate-fade-in relative z-10">
                {!currentUser ? (
                    <div className="max-w-7xl mx-auto h-full flex flex-col pt-12">
                        <LoginRequired
                            titleKey="library.login_required"
                            descriptionKey="library.login_desc"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[36px]">library_music</span>
                                {t('library.title')}
                            </h1>

                            <div className="flex items-center gap-3 bg-white dark:bg-surface-dark p-1 rounded-full border border-slate-200 dark:border-border-dark shadow-sm">
                                {(['all', 'listened', 'saved'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === tab
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {t(`library.filter.${tab}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder={t('library.search_placeholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            />
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredAlbums.map(album => (
                                <Link to={`/album/${album.spotifyId}`} key={album.spotifyId} className="group relative flex flex-col gap-3 p-3 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-black/20">
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${album.coverUrl}')` }}></div>
                                        <div className="absolute top-2 left-2 right-2 flex flex-col gap-1 items-start">
                                            {album.isListened && (
                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide backdrop-blur-md bg-green-500/90 text-white shadow-sm whitespace-nowrap">
                                                    {t('library.filter.listened')}
                                                </span>
                                            )}
                                            {album.isSaved && !album.isListened && (
                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide backdrop-blur-md bg-orange-500/90 text-white shadow-sm whitespace-nowrap">
                                                    {t('library.filter.saved')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 text-white transition-colors">
                                                <span className="material-symbols-outlined filled">play_arrow</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col px-1">
                                        <h3 className="text-slate-900 dark:text-white font-bold leading-tight truncate" title={album.title}>{album.title}</h3>
                                        <p className="text-slate-500 dark:text-text-secondary text-sm truncate" title={album.artist}>{album.artist}</p>
                                        <p className="text-primary text-xs font-medium mt-1">{album.genres?.[0] || 'Unknown'}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filteredAlbums.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-surface-dark rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl">album</span>
                                </div>
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold">{t('library.no_albums')}</h3>
                                <p className="text-slate-500 dark:text-slate-400">{t('library.try_adjusting')}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DetailsPage;
