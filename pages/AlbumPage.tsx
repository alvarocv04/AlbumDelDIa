import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toggleAlbumSave, rateAlbum, getUserUserData, markAlbumAsListened, unmarkAlbumAsListened } from '../services/userService';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [album, setAlbum] = useState<Album | null>(null);
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isListened, setIsListened] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const [personalRating, setPersonalRating] = useState(0);
    const [artisticRating, setArtisticRating] = useState(0);

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

                    // Generate description
                    generateAlbumDescription(data.artist, data.title).then(desc => {
                        setDescription(desc);
                    });

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
    }, [id, currentUser]);

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
            await markAlbumAsListened(currentUser.uid, id, album.duration_total_ms);
        } else {
            await unmarkAlbumAsListened(currentUser.uid, id, album.duration_total_ms);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert(t('album.link_copied'));
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
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]" onClick={() => window.open(album.spotifyUrl, '_blank')}>
                                        <button className="bg-primary text-white rounded-full p-4 hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-[48px] filled">play_circle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Quick Actions */}
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button onClick={() => window.open(album.spotifyUrl, '_blank')} className="flex-1 h-12 flex items-center justify-center gap-3 rounded-full bg-[#1DB954] text-white font-semibold hover:bg-[#1ed760] transition-colors shadow-lg shadow-[#1DB954]/20">
                                        <span className="material-symbols-outlined filled">play_arrow</span>
                                        Spotify
                                    </button>
                                    {album.appleMusicUrl && (
                                        <button onClick={() => window.open(album.appleMusicUrl, '_blank')} className="flex-1 h-12 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#FA243C] to-[#FA5C7C] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#FA243C]/20">
                                            <span className="material-symbols-outlined filled">play_arrow</span>
                                            Apple Music
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleShare} className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#282e39] text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-[#323946] transition-colors border border-slate-200 dark:border-transparent">
                                        <span className="material-symbols-outlined">ios_share</span>
                                        {t('album.share')}
                                    </button>
                                    <button onClick={handleSave} className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#282e39] text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-[#323946] transition-colors border border-slate-200 dark:border-transparent">
                                        <span className={`material-symbols-outlined ${isSaved ? 'filled text-primary' : ''}`}>{isSaved ? 'check_circle' : 'playlist_add'}</span>
                                        {isSaved ? t('album.saved_true') : t('album.saved_false')}
                                    </button>
                                    <button onClick={handleToggleListened} className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-full transition-colors border border-slate-200 dark:border-transparent font-medium ${isListened ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400' : 'bg-white dark:bg-[#282e39] text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#323946]'}`}>
                                        <span className={`material-symbols-outlined ${isListened ? 'filled' : ''}`}>{isListened ? 'check_circle' : 'check_small'}</span>
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
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">queue_music</span> {t('album.tracklist')}
                                </h3>
                                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {album.tracks && album.tracks.map((track) => (
                                        <div key={track.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-[#282e39] rounded-xl transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-400 font-mono text-sm w-6 text-center">{track.track_number}</span>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium text-slate-900 dark:text-white ${track.preview_url ? 'cursor-pointer group-hover:text-primary transition-colors' : ''}`} onClick={() => track.preview_url && window.open(track.preview_url, '_blank')}>
                                                        {track.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{album.artist}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono">
                                                {Math.floor(track.duration_ms / 60000)}:
                                                {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                                            </span>
                                        </div>
                                    ))}
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
