import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toggleAlbumSave, rateAlbum, getUserUserData, markAlbumAsListened, unmarkAlbumAsListened, markTrackAsListened, unmarkTrackAsListened, getListenedTracksForAlbum } from '../services/userService';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { generateAlbumDescription } from '../services/geminiService';
import { Album } from '../types';
import CommentsSection from '../components/CommentsSection';
import LoginModal from '../components/LoginModal';

const RatingComponent = ({
    icon,
    colorClass,
    value,
    onChange
}: {
    icon: string,
    colorClass: string,
    value: number,
    onChange: (val: number) => void
}) => {
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFull = value >= star;
                const isHalf = value >= star - 0.5 && !isFull;

                return (
                    <div key={star} className="relative cursor-pointer group"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const isClickHalf = (e.clientX - rect.left) < (rect.width / 2);
                            onChange(star - (isClickHalf ? 0.5 : 0));
                        }}
                    >
                        {/* Wrapper for scaling both layers together */}
                        <div className="relative transition-transform group-hover:scale-110">
                            {/* Base Icon */}
                            <span className={`material-symbols-outlined text-[32px] block ${isFull
                                ? `${colorClass} filled`
                                : isHalf
                                    ? `${colorClass}` // Colored outline for half state
                                    : 'text-slate-300 dark:text-[#3f4756]' // Grey empty state
                                }`}>
                                {isHalf && icon === 'star' ? 'star_half' : icon}
                            </span>

                            {/* Overlay for Half-Heart (filled, clipped to 50%) */}
                            {isHalf && icon !== 'star' && (
                                <span className={`material-symbols-outlined text-[32px] filled absolute left-0 top-0 w-[50%] overflow-hidden block ${colorClass} pointer-events-none`}>
                                    {icon}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AlbumPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, language } = useLanguage();
    const { currentUser } = useAuth();
    const [album, setAlbum] = useState<Album | null>(null);
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isListened, setIsListened] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const [personalRating, setPersonalRating] = useState(0);
    const [artisticRating, setArtisticRating] = useState(0);
    const [listenedTracks, setListenedTracks] = useState<string[]>([]);

    useEffect(() => {
        const fetchAlbum = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, 'albums', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Album;
                    console.log('Album loaded:', data.title);
                    console.log('Apple Music URL:', data.appleMusicUrl);
                    console.log('Spotify URL:', data.spotifyUrl);
                    setAlbum(data);

                    // Use cached description or generate new one based on language
                    const descriptionField = language === 'es' ? 'description_es' : 'description_en';
                    const cachedDescription = language === 'es' ? data.description_es : data.description_en;

                    if (cachedDescription) {
                        console.log(`📖 Using cached description (${language})`);
                        setDescription(cachedDescription);
                    } else {
                        console.log(`🤖 Generating new description (${language})...`);
                        generateAlbumDescription(data.artist, data.title, language).then(async (desc) => {
                            setDescription(desc);
                            // Cache the description in Firestore for future use
                            try {
                                await updateDoc(docRef, { [descriptionField]: desc });
                                console.log(`💾 Description cached in Firestore (${language})`);
                            } catch (cacheError) {
                                console.error('Failed to cache description:', cacheError);
                            }
                        });
                    }

                    // Load User State (Saved & Ratings)
                    if (currentUser) {
                        // Fetch from Firestore
                        const userData: any = await getUserUserData(currentUser.uid);
                        if (userData) {
                            setIsSaved(userData.savedAlbums?.includes(id) || false);
                            setIsListened(userData.history?.includes(id) || false);
                            if (userData.ratings && userData.ratings[id]) {
                                setPersonalRating(userData.ratings[id].personal || 0);
                                setArtisticRating(userData.ratings[id].artistic || 0);
                            }
                            // Load listened tracks for this album
                            setListenedTracks(userData.listenedTracks?.[id] || []);
                        }
                    } else {
                        // Fallback to localStorage
                        const saved = localStorage.getItem('savedAlbums');
                        if (saved) {
                            const savedList = JSON.parse(saved);
                            setIsSaved(savedList.includes(id));
                        }
                        const savedRatings = localStorage.getItem('albumRatings');
                        if (savedRatings) {
                            const ratingsMap = JSON.parse(savedRatings);
                            if (ratingsMap[id]) {
                                if (ratingsMap[id].personal) setPersonalRating(ratingsMap[id].personal);
                                if (ratingsMap[id].artistic) setArtisticRating(ratingsMap[id].artistic);
                            }
                        }
                        // Note: Listened history not fully supported in local storage fallback for simplicity/streak logic
                    }

                } else {
                    console.error("No such album!");
                }
            } catch (error) {
                console.error("Error fetching album:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlbum();
    }, [id, currentUser, language]);

    // SEO: Inject MusicAlbum structured data (JSON-LD)
    useEffect(() => {
        if (album) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'album-schema';
            script.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MusicAlbum",
                "name": album.title,
                "byArtist": {
                    "@type": "MusicGroup",
                    "name": album.artist
                },
                "image": album.coverUrl,
                "datePublished": album.releaseDate,
                "numTracks": album.totalTracks,
                "genre": album.genres?.[0] || undefined
            });

            // Remove existing schema if present
            const existing = document.getElementById('album-schema');
            if (existing) existing.remove();

            document.head.appendChild(script);

            // Update page title for SEO
            document.title = `${album.title} - ${album.artist} | Album Del Día`;

            return () => {
                const schemaScript = document.getElementById('album-schema');
                if (schemaScript) schemaScript.remove();
                document.title = 'Album Del Día';
            };
        }
    }, [album]);

    const handleSave = async () => {
        if (!id) return;

        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }

        const newSavedState = !isSaved;
        setIsSaved(newSavedState); // Optimistic update

        await toggleAlbumSave(currentUser.uid, id, newSavedState);
    };

    const handleToggleListened = async () => {
        if (!id || !album) return;

        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }

        const newListenedState = !isListened;
        setIsListened(newListenedState); // Optimistic UI

        if (newListenedState) {
            // Optimistically mark all tracks as listened
            setListenedTracks(album.tracks.map(t => t.id));
            await markAlbumAsListened(currentUser.uid, id, album.duration_total_ms, album.tracks);
        } else {
            // Optimistically unmark all tracks
            setListenedTracks([]);
            await unmarkAlbumAsListened(currentUser.uid, id, album.duration_total_ms);
        }
    };

    const handleRate = async (type: 'personal' | 'artistic', value: number) => {
        if (!id) return;

        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }

        // Optimistic Update
        if (type === 'personal') setPersonalRating(value);
        else setArtisticRating(value);

        await rateAlbum(currentUser.uid, id, type, value);
    };

    const handleToggleTrackListened = async (trackId: string, trackDurationMs: number) => {
        if (!id || !album) return;

        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }

        const isTrackListened = listenedTracks.includes(trackId);

        // If the album is marked as fully listened, don't allow unmarking individual tracks
        if (isListened && isTrackListened) {
            return;
        }

        // Optimistic update
        if (isTrackListened) {
            setListenedTracks(prev => prev.filter(t => t !== trackId));
            await unmarkTrackAsListened(currentUser.uid, id, trackId, trackDurationMs);
        } else {
            const newList = [...listenedTracks, trackId];
            setListenedTracks(newList);
            await markTrackAsListened(currentUser.uid, id, trackId, trackDurationMs);

            // Auto-mark album as listened if all tracks are now marked
            if (newList.length === album.tracks.length && !isListened) {
                setIsListened(true);
                await markAlbumAsListened(currentUser.uid, id, album.duration_total_ms, album.tracks);
            }
        }
    };

    const handleMarkAllTracksListened = async () => {
        if (!id || !album || !currentUser) {
            if (!currentUser) setIsLoginModalOpen(true);
            return;
        }

        const allTrackIds = album.tracks.map(t => t.id);
        const unlistenedTracks = album.tracks.filter(t => !listenedTracks.includes(t.id));

        if (unlistenedTracks.length === 0) {
            // All tracks are already listened - unmark all

            // If the album itself is marked as listened, use handleToggleListened 
            // to unmark the album properly (handles stats, history, etc.)
            if (isListened) {
                await handleToggleListened();
                return;
            }

            // Otherwise just unmark tracks as before
            setListenedTracks([]);
            Promise.all(
                album.tracks.map(track =>
                    unmarkTrackAsListened(currentUser.uid, id, track.id, track.duration_ms)
                )
            ).catch(error => {
                console.error('Error unmarking tracks:', error);
                setListenedTracks(allTrackIds);
            });
        } else {
            // Mark all unlistened tracks as listened
            // Use handleToggleListened if the album is not already listened to ensure full sync
            if (!isListened) {
                await handleToggleListened();
            } else {
                // Already listed as album, but maybe some tracks were missing (shouldn't happen with new logic but safe)
                setListenedTracks(allTrackIds);
                Promise.all(
                    unlistenedTracks.map(track =>
                        markTrackAsListened(currentUser.uid, id, track.id, track.duration_ms)
                    )
                ).catch(error => {
                    console.error('Error marking tracks:', error);
                    setListenedTracks(prev => prev.filter(t => !unlistenedTracks.map(ut => ut.id).includes(t)));
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!album) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <p>{t('common.unknown')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
            <Header />
            <main className="flex-grow flex flex-col items-center w-full px-4 md:px-10 py-8 animate-fade-in">
                <div className="w-full max-w-6xl flex flex-col gap-10">
                    {/* Hero / Album Detail Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Album Art Column */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div className="relative group w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10">
                                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" style={{ backgroundImage: `url('${album.coverUrl}')` }}></div>
                                <div className="relative h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${album.coverUrl}')` }}>
                                    {/* Overlay Play Button */}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]" onClick={() => window.open(album.spotifyUrl, '_blank', 'noopener,noreferrer')}>
                                        <button className="bg-primary text-white rounded-full p-4 hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-[48px] filled">play_circle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Quick Actions */}
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button onClick={() => window.open(album.spotifyUrl, '_blank', 'noopener,noreferrer')} className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-[#1DB954] text-white font-medium text-sm hover:bg-[#1ed760] transition-colors shadow-lg shadow-[#1DB954]/20">
                                        <span className="material-symbols-outlined filled text-[20px]">play_arrow</span>
                                        Spotify
                                    </button>
                                    {album.appleMusicUrl && (
                                        <button onClick={() => window.open(album.appleMusicUrl, '_blank', 'noopener,noreferrer')} className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FA243C] to-[#FA5C7C] text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#FA243C]/20">
                                            <span className="material-symbols-outlined filled text-[20px]">play_arrow</span>
                                            Apple Music
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">

                                    <button onClick={handleSave} className="flex-1 min-w-fit h-12 flex items-center justify-center gap-2 px-5 rounded-full bg-white dark:bg-[#282e39] text-slate-900 dark:text-white font-medium text-sm hover:bg-slate-50 dark:hover:bg-[#323946] transition-colors border border-slate-200 dark:border-transparent whitespace-nowrap">
                                        <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'filled text-primary' : ''}`}>{isSaved ? 'check_circle' : 'playlist_add'}</span>
                                        {isSaved ? t('album.saved_true') : t('album.saved_false')}
                                    </button>
                                    <button onClick={handleToggleListened} className={`flex-1 min-w-fit h-12 flex items-center justify-center gap-2 px-5 rounded-full transition-colors border border-slate-200 dark:border-transparent font-medium text-sm whitespace-nowrap ${isListened ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400' : 'bg-white dark:bg-[#282e39] text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#323946]'}`}>
                                        <span className={`material-symbols-outlined text-[20px] ${isListened ? 'filled' : ''}`}>{isListened ? 'check_circle' : 'check_small'}</span>
                                        {isListened ? t('album.listened_true') : t('album.listened_false')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Info & Rating Column */}
                        <div className="lg:col-span-8 flex flex-col justify-start">
                            {/* Date Badge (Mocked for now or use created date) */}
                            <div className="flex items-center gap-2 mb-4">
                                {album.wasShown && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">{t('home.album_of_day')}</span>}
                                <p className="text-slate-500 dark:text-[#9da6b9] text-sm font-medium">{album.releaseDate.split('-')[0]}</p>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">{album.title}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-lg text-slate-600 dark:text-slate-300 mb-6 font-medium">
                                <span className="text-primary">{album.artist}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                <span>{album.totalTracks} {t('album.tracks')}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                <span>{Math.round(album.duration_total_ms / 60000)} {t('album.min')}</span>
                            </div>
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {album.genres && album.genres.slice(0, 4).map((genre, idx) => (
                                    <div key={idx} className="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-slate-100 dark:bg-[#282e39] text-slate-700 dark:text-white text-xs font-medium border border-slate-200 dark:border-transparent capitalize">{genre}</div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none mb-8">
                                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
                                    {description || t('album.loading_desc')}
                                </p>
                            </div>


                            {/* Dual Rating System */}
                            <div className="bg-white dark:bg-[#1a1f29] rounded-[2rem] p-6 mb-8 border border-slate-200 dark:border-[#282e39] shadow-sm w-full">
                                <h3 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-4">{t('album.rate_album')}</h3>
                                <div className="flex flex-col sm:flex-row gap-8">
                                    {/* Personal Taste */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[20px] filled">favorite</span>
                                                {t('album.personal_taste')}
                                            </span>
                                            <span className="text-sm font-bold text-primary">{personalRating > 0 ? personalRating : '-'} / 5</span>
                                        </div>
                                        <RatingComponent
                                            icon="favorite"
                                            colorClass="text-primary"
                                            value={personalRating}
                                            onChange={(val) => handleRate('personal', val)}
                                        />
                                        <p className="text-xs text-slate-400 mt-2">{t('album.vibe_check')}</p>
                                    </div>
                                    {/* Divider for mobile/desktop */}
                                    <div className="hidden sm:block w-px bg-slate-200 dark:bg-[#282e39]"></div>
                                    {/* Artistic Quality */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-yellow-500 text-[20px] filled">grade</span>
                                                {t('album.artistic_quality')}
                                            </span>
                                            <span className="text-sm font-bold text-yellow-500">{artisticRating > 0 ? artisticRating : '-'} / 5</span>
                                        </div>
                                        <RatingComponent
                                            icon="star"
                                            colorClass="text-yellow-500"
                                            value={artisticRating}
                                            onChange={(val) => handleRate('artistic', val)}
                                        />
                                        <p className="text-xs text-slate-400 mt-2">{t('album.objective_craft')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tracklist */}
                            <div className="bg-white dark:bg-[#1a1f29] rounded-[2rem] p-6 border border-slate-200 dark:border-[#282e39] shadow-sm w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined">queue_music</span>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('album.tracklist')}</h3>
                                        {album.tracks && listenedTracks.length > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium">
                                                {listenedTracks.length}/{album.tracks.length} {t('album.tracks_listened')}
                                            </span>
                                        )}
                                    </div>
                                    {currentUser && album.tracks && album.tracks.length > 0 && (
                                        <button
                                            onClick={handleMarkAllTracksListened}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${listenedTracks.length === album.tracks.length
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">
                                                {listenedTracks.length === album.tracks.length ? 'remove_done' : 'done_all'}
                                            </span>
                                            {listenedTracks.length === album.tracks.length ? t('album.unmark_all_listened') : t('album.mark_all_listened')}
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {album.tracks && album.tracks.map((track) => {
                                        const isTrackListened = listenedTracks.includes(track.id);
                                        const isLocked = isListened && isTrackListened; // Can't unmark if album is listened
                                        return (
                                            <div
                                                key={track.id}
                                                className={`flex items-center justify-between p-3 rounded-xl transition-all group ${isLocked
                                                    ? 'bg-green-50 dark:bg-green-900/20 cursor-default'
                                                    : isTrackListened
                                                        ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer'
                                                        : 'hover:bg-slate-50 dark:hover:bg-[#282e39] cursor-pointer'
                                                    }`}
                                                onClick={() => handleToggleTrackListened(track.id, track.duration_ms)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-400 font-mono text-sm w-6 text-center">{track.track_number}</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-medium transition-colors ${isTrackListened
                                                            ? 'text-green-700 dark:text-green-400'
                                                            : 'text-slate-900 dark:text-white'
                                                            }`}>
                                                            {track.name}
                                                        </span>
                                                        <span className="text-xs text-slate-500">{album.artist}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {track.preview_url && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(track.preview_url!, '_blank', 'noopener,noreferrer');
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-primary/10 text-primary"
                                                            title={t('album.preview_url')}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                                        </button>
                                                    )}
                                                    <span className={`text-xs font-mono mr-1 ${isTrackListened ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                                                        {Math.floor(track.duration_ms / 60000)}:
                                                        {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                                                    </span>
                                                    {/* Checkbox */}
                                                    <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-out ${isTrackListened
                                                        ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50 scale-100'
                                                        : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary group-hover:scale-110 group-hover:shadow-md'
                                                        }`}>
                                                        {isTrackListened && (
                                                            <span className="material-symbols-outlined text-white text-[18px] filled animate-scale-in">check</span>
                                                        )}
                                                        {!isTrackListened && (
                                                            <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </section>
                    <CommentsSection albumId={id!} />
                </div>
            </main>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
};

export default AlbumPage;
