import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserUserData, toggleAlbumSave } from '../services/userService';
import { getDailyAlbum } from '../services/albumService';
import { Album, UserBadge, Badge } from '../types';
import BadgeList from '../components/BadgeList';
import BadgeModal from '../components/BadgeModal';
import LoginModal from '../components/LoginModal';
import { getAllBadges } from '../services/badgeService';

const HomePage: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [dailyAlbum, setDailyAlbum] = useState<Album | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState<{
        streak: number;
        minutesListened: number;
        badgesCount: number;
        userBadges: UserBadge[];
    }>({
        streak: 0,
        minutesListened: 0,
        badgesCount: 0,
        userBadges: []
    });
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Daily Album
                const album = await getDailyAlbum();
                setDailyAlbum(album);

                // Fetch User Stats
                let stats = { streak: 0, minutesListened: 0, badgesCount: 0, userBadges: [] as UserBadge[] };
                if (currentUser) {
                    const userData: any = await getUserUserData(currentUser.uid);
                    if (userData && userData.stats) {
                        stats.streak = userData.stats.streak || 0;
                        stats.minutesListened = userData.stats.minutesListened || 0;
                        stats.badgesCount = (userData.badges || []).length;
                        stats.userBadges = userData.badges || [];

                        if (userData.savedAlbums && Array.isArray(userData.savedAlbums) && album) {
                            setIsSaved(userData.savedAlbums.includes(album.spotifyId));
                        }
                    }
                }
                setUserStats(stats);
                setAllBadges(await getAllBadges());

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const handleSaveAlbum = async () => {
        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }
        if (!dailyAlbum) return;

        const newState = !isSaved;
        setIsSaved(newState);

        try {
            await toggleAlbumSave(currentUser.uid, dailyAlbum.spotifyId, newState);
        } catch (error) {
            console.error('Error saving album:', error);
            setIsSaved(!newState); // Revert
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <Header />
            <main className="flex flex-col items-center flex-1 px-4 sm:px-10 py-6 sm:py-10 animate-fade-in">
                <div className="layout-content-container flex flex-col max-w-[1024px] w-full flex-1 gap-8">

                    {/* Hero Section: Daily Album */}
                    <section className="w-full">
                        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark min-h-[400px] shadow-sm">
                            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none blur-3xl" style={{ background: "radial-gradient(circle at 70% 30%, #135bec 0%, transparent 60%)" }}></div>

                            {isLoading ? (
                                <div className="flex items-center justify-center w-full h-[400px]">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                </div>
                            ) : dailyAlbum ? (
                                <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-10 md:flex-row items-center md:items-start">
                                    {/* Album Cover */}
                                    <div className="group relative w-full max-w-[320px] aspect-square rounded-lg overflow-hidden shadow-xl transition-transform hover:scale-[1.02]">
                                        <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${dailyAlbum.coverUrl}")` }}></div>
                                        <Link to={`/album/${dailyAlbum.spotifyId}`} className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="bg-primary text-white rounded-full p-4 shadow-lg transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all">
                                                <span className="material-symbols-outlined text-[40px] filled">play_arrow</span>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Album Info */}
                                    <div className="flex flex-col gap-6 flex-1 text-center md:text-left">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">{t('home.album_of_day')}</span>
                                                {dailyAlbum.genres?.[0] && (
                                                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-medium capitalize">{dailyAlbum.genres[0]}</span>
                                                )}
                                            </div>
                                            <h1 className="text-slate-900 dark:text-white text-4xl sm:text- Leviathan 5xl font-black leading-tight tracking-tight">{dailyAlbum.title}</h1>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg sm:text- Leviathan xl font-medium mt-1">{t('common.by')} <span className="text-slate-900 dark:text-white">{dailyAlbum.artist}</span></p>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <Link to={`/album/${dailyAlbum.spotifyId}`} className="flex items-center justify-center gap-2 h-12 px-8 bg-primary hover:bg-blue-600 text-white rounded-full font-bold transition-all shadow-lg shadow-primary/25">
                                                <span className="material-symbols-outlined">play_circle</span>
                                                <span>{t('home.start_listening')}</span>
                                            </Link>
                                            <button
                                                onClick={handleSaveAlbum}
                                                className={`flex items-center justify-center gap-2 h-12 px-6 border rounded-full font-medium transition-all ${isSaved
                                                    ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                                                    : 'bg-white dark:bg-transparent border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                <span className={`material-symbols-outlined ${isSaved ? 'filled' : ''}`}>
                                                    {isSaved ? 'bookmark' : 'bookmark_add'}
                                                </span>
                                                <span>{isSaved ? t('library.filter.saved') : t('home.save_later')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-[400px] text-slate-400">
                                    <p>{t('common.loading')}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content: Stats & Badges */}
                        <div className="lg:col-span-2 flex flex-col gap-10">

                            {/* Your Vibe: Stats */}
                            <section className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">equalizer</span>
                                        {t('home.your_vibe')}
                                    </h2>
                                    <Link to="/summary" className="text-sm font-medium text-primary hover:underline">{t('home.view_history')}</Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="size-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                <span className="material-symbols-outlined filled">local_fire_department</span>
                                            </div>
                                            {userStats.streak > 0 && <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded uppercase tracking-wider">{t('home.streak_active')}</span>}
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{t('home.streak')}</p>
                                            <p className="text-slate-900 dark:text-white text-3xl font-black mt-1">{userStats.streak} {t('home.days')}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                <span className="material-symbols-outlined">schedule</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{t('home.total_minutes')}</p>
                                            <p className="text-slate-900 dark:text-white text-3xl font-black mt-1">{userStats.minutesListened.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <span className="material-symbols-outlined">military_tech</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{t('home.badges_earned')}</p>
                                            <p className="text-slate-900 dark:text-white text-3xl font-black mt-1">{userStats.badgesCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Badges Section */}
                            <section className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight flex items-center gap-2">
                                        <span className="material-symbols-outlined text-yellow-500">military_tech</span>
                                        {t('home.badges')}
                                    </h2>
                                    <button onClick={() => setIsBadgeModalOpen(true)} className="text-sm font-medium text-primary hover:underline">{t('common.view_all')}</button>
                                </div>
                                <BadgeList allBadges={allBadges.slice(0, 4)} userBadges={userStats.userBadges} />
                            </section>
                        </div>

                        {/* Sidebar */}
                        <aside className="flex flex-col gap-6">
                            <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{t('home.recent_badges')}</h2>
                                    <span className="material-symbols-outlined text-yellow-500">stars</span>
                                </div>
                                <div className="flex flex-col">
                                    {userStats.userBadges.length > 0 ? (
                                        userStats.userBadges.slice(-3).reverse().map((ub) => {
                                            const badge = allBadges.find(b => b.id === ub.badgeId);
                                            if (!badge) return null;
                                            return (
                                                <div key={ub.badgeId} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                                    <div className="size-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform text-2xl">
                                                        {badge.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">{badge.name}</span>
                                                        <span className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1">{badge.description}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                            {t('home.no_badges_yet')}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-black/20 text-center">
                                    <Link to="/profile" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">{t('home.explore_more')}</Link>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </main>

            <BadgeModal
                isOpen={isBadgeModalOpen}
                onClose={() => setIsBadgeModalOpen(false)}
                allBadges={allBadges}
                userBadges={userStats.userBadges}
            />
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
};

export default HomePage;