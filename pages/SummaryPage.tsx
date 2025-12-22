import React from 'react';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserUserData } from '../services/userService';
import LoginRequired from '../components/LoginRequired';

const SummaryPage: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    // State for user data
    const [minutesListened, setMinutesListened] = React.useState(0);
    const [newAlbumsCount, setNewAlbumsCount] = React.useState(0);
    const [topGenre, setTopGenre] = React.useState<string>('-');
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                setIsLoading(false);
                return;
            }

            try {
                // 1. Get User Data
                const userData: any = await getUserUserData(currentUser.uid);

                if (userData) {
                    setMinutesListened(userData.stats?.minutesListened || 0);

                    const historyIds = userData.history || [];
                    setNewAlbumsCount(historyIds.length);

                    // 2. Calculate Top Genre if there is history
                    if (historyIds.length > 0) {
                        import('../services/albumService').then(async ({ getAlbumsByIds }) => {
                            const albums = await getAlbumsByIds(historyIds);

                            const genreCounts: Record<string, number> = {};
                            albums.forEach(album => {
                                if (album.genres) {
                                    album.genres.forEach(g => {
                                        const genre = g.toLowerCase();
                                        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                                    });
                                }
                            });

                            let maxGenre = '-';
                            let maxCount = 0;
                            Object.entries(genreCounts).forEach(([genre, count]) => {
                                if (count > maxCount) {
                                    maxCount = count;
                                    maxGenre = genre;
                                }
                            });

                            // Capitalize first letter
                            setTopGenre(maxGenre.charAt(0).toUpperCase() + maxGenre.slice(1));
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center relative z-10">
                    <LoginRequired
                        titleKey="summary.login_required"
                        descriptionKey="summary.login_desc"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white transition-colors duration-200">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <Header />
                <div className="layout-container flex h-full grow flex-col animate-fade-in">
                    <div className="w-full flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1 px-4 md:px-0">
                            <div className="@container mb-12">
                                <div className="@[480px]:p-4">
                                    <div className="relative flex min-h-[520px] flex-col gap-6 overflow-hidden rounded-xl bg-surface-dark items-center justify-center p-8 text-center shadow-2xl">
                                        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGm-9McNmOJ_oo24BnBSIRinWWbWc_Y590jofImHDqsp27R35JxxPPqBv-h6wV2Om5NQNqve-auVi3z7pgpYdPCMJDz2ARiPPnREFEKBv2MYfcxKM4Zp5HH_Mbkghxs7hvrZacL8vCUQhaUdXJn6eW-B8GmyFUg5HN3Y0gnJHJGw2NiHL0g5DjSeWk4aZ6ExM2MsN_GP6UA8pSOBpvwxzSJESXDNnp9ch0JFReMVBWKphq4cQRmWAG8IRRj-87pk1PGKDV7gPRkyY")' }}></div>
                                        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[#101622]"></div>
                                        <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
                                            <span className="inline-flex items-center justify-center self-center rounded-full bg-primary/20 px-4 py-1.5 text-sm font-bold text-primary backdrop-blur-sm border border-primary/30"><span className="material-symbols-outlined mr-2 text-[16px]">verified</span> {t('summary.wrapped')}</span>
                                            <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] md:text-7xl drop-shadow-lg">{t('summary.journey')}</h1>
                                            <h2 className="text-gray-200 text-lg font-medium leading-relaxed max-w-lg mx-auto md:text-xl">{t('summary.subtitle')}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-16">
                                <div className="flex items-center justify-between px-4 pb-6"><h3 className="text-2xl font-bold dark:text-white flex items-center gap-2"><span className="material-symbols-outlined text-primary">analytics</span> {t('summary.at_glance')}</h3></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                                    <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-[#3b4354] shadow-sm hover:border-primary transition-colors group">
                                        <div className="flex justify-between items-start"><div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors"><span className="material-symbols-outlined">schedule</span></div>
                                            {/* <span className="text-accent-green text-sm font-bold bg-accent-green/10 px-2 py-1 rounded-full">+12% vs 2022</span> */}
                                        </div>
                                        <div><p className="text-gray-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">{t('home.total_minutes')}</p><p className="text-gray-900 dark:text-white text-4xl font-black tracking-tight mt-1">{isLoading ? '...' : minutesListened.toLocaleString()}</p></div>
                                    </div>
                                    <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-[#3b4354] shadow-sm hover:border-primary transition-colors group">
                                        <div className="flex justify-between items-start"><div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors"><span className="material-symbols-outlined">album</span></div>
                                            {/* <span className="text-accent-green text-sm font-bold bg-accent-green/10 px-2 py-1 rounded-full">+5% vs 2022</span> */}
                                        </div>
                                        <div><p className="text-gray-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">{t('summary.new_albums')}</p><p className="text-gray-900 dark:text-white text-4xl font-black tracking-tight mt-1">{isLoading ? '...' : newAlbumsCount}</p></div>
                                    </div>
                                    <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-[#3b4354] shadow-sm hover:border-primary transition-colors group">
                                        <div className="flex justify-between items-start"><div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors"><span className="material-symbols-outlined">equalizer</span></div><span className="text-text-secondary text-sm font-bold bg-gray-800 px-2 py-1 rounded-full">{t('summary.consistent')}</span></div>
                                        <div><p className="text-gray-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">{t('summary.top_genre')}</p><p className="text-gray-900 dark:text-white text-3xl font-black tracking-tight mt-1 truncate">{isLoading ? '...' : topGenre}</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryPage;