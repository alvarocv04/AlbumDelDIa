import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_USERS } from '../services/data';

const ProfilePage: React.FC = () => {
    const { t } = useLanguage();
    const { userId } = useParams<{ userId: string }>();
    const [showBadgesModal, setShowBadgesModal] = useState(false);
    
    // Default to 'me' (Alex) if no userId provided
    const user = MOCK_USERS.find(u => u.id === (userId || 'me')) || MOCK_USERS[0];
    const isCurrentUser = user.id === 'me';

    const earnedBadges = user.badges.filter(b => b.earned);
    const lockedBadges = user.badges.filter(b => !b.earned);

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header />
            <div className="flex flex-1 justify-center py-6 px-4 md:px-8 lg:px-12 animate-fade-in">
                <div className="flex flex-col max-w-[1200px] flex-1 w-full gap-6">
                    {/* Profile Header */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between p-6 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="relative group">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 ring-4 ring-slate-100 dark:ring-[#282e39]" style={{backgroundImage: `url("${user.avatar}")`}}></div>
                                {user.isOnline && <div className="absolute bottom-1 right-1 bg-green-500 border-4 border-white dark:border-surface-dark w-6 h-6 rounded-full" title="Online"></div>}
                            </div>
                            <div className="flex flex-col justify-center gap-1 mt-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">{user.name}</h1>
                                    {user.isVerified && <span className="material-symbols-outlined text-primary fill-current text-[20px]" title={t('profile.verified')}>verified</span>}
                                </div>
                                <p className="text-sm font-medium text-primary">{user.handle} • Sonic Explorer</p>
                                <p className="text-slate-500 dark:text-[#9da6b9] text-base font-normal leading-relaxed max-w-lg mt-2">{user.bio}</p>
                                <div className="flex gap-4 mt-3 justify-center md:justify-start text-sm">
                                    <span className="text-slate-900 dark:text-white font-bold">{user.stats.followers} <span className="font-normal text-slate-500 dark:text-[#9da6b9]">{t('profile.followers')}</span></span>
                                    <span className="text-slate-900 dark:text-white font-bold">{user.stats.following} <span className="font-normal text-slate-500 dark:text-[#9da6b9]">{t('profile.following')}</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-2 justify-center md:justify-end">
                            {isCurrentUser ? (
                                <button className="flex items-center justify-center gap-2 px-6 h-11 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-bold rounded-full transition-all">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    {t('profile.edit')}
                                </button>
                            ) : (
                                <button className="flex items-center justify-center gap-2 px-6 h-11 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                                    {t('profile.follow')}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Badges Preview Section */}
                        <div className="lg:col-span-7 flex flex-col gap-8">
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('profile.badges_achievements')}</h3>
                                    <button 
                                        onClick={() => setShowBadgesModal(true)}
                                        className="text-primary text-sm font-bold hover:underline"
                                    >
                                        {t('profile.see_all')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {earnedBadges.slice(0, 4).map((badge) => (
                                        <div key={badge.id} className="flex flex-col items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#111318]/50 hover:bg-slate-100 dark:hover:bg-[#111318] transition-colors cursor-pointer group">
                                            <div className="size-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined text-white text-3xl">{badge.icon}</span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{t(`badge.${badge.id}`)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {earnedBadges.length === 0 && (
                                        <div className="col-span-4 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                            No badges earned yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div className="lg:col-span-5 flex flex-col gap-8">
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 h-full">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('profile.activity_feed')}</h3>
                                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-8">
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 bg-surface-light dark:bg-surface-dark p-1"><div className="w-3 h-3 rounded-full bg-primary ring-4 ring-surface-light dark:ring-surface-dark"></div></div>
                                        <div className="flex flex-col gap-2"><p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-bold text-slate-900 dark:text-white">{user.name.split(' ')[0]}</span> {t('profile.listened_to')} <span className="text-primary font-medium cursor-pointer">Floating Points</span>.</p><span className="text-xs text-slate-400">2h {t('profile.ago')}</span></div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 bg-surface-light dark:bg-surface-dark p-1"><div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-surface-light dark:ring-surface-dark"></div></div>
                                        <div className="flex flex-col gap-2"><p className="text-sm text-slate-700 dark:text-slate-300">{t('profile.earned')} <span className="font-bold text-amber-500">Vinyl Head</span> {t('profile.badge')}</p><span className="text-xs text-slate-400">3d {t('profile.ago')}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Modal */}
            {showBadgesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface-light dark:bg-surface-dark w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-500">military_tech</span>
                                {t('profile.badges_achievements')}
                            </h2>
                            <button 
                                onClick={() => setShowBadgesModal(false)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-900 dark:text-white">close</span>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                            {/* Earned Section */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    {t('profile.earned_badges')}
                                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{earnedBadges.length}</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {earnedBadges.map((badge) => (
                                        <div key={badge.id} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#111318]/50 border border-transparent hover:border-primary/30 transition-all text-center group">
                                            <div className="size-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-white text-4xl">{badge.icon}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{t(`badge.${badge.id}`)}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{t(`badge.desc.${badge.id}`)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {earnedBadges.length === 0 && (
                                        <div className="col-span-full py-4 text-center text-slate-500 dark:text-slate-400">
                                            No earned badges yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Locked Section */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 opacity-80">
                                    {t('profile.locked_badges')}
                                    <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">{lockedBadges.length}</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {lockedBadges.map((badge) => (
                                        <div key={badge.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#111318]/30 border border-slate-200 dark:border-border-dark opacity-75 hover:opacity-100 transition-opacity">
                                            <div className="size-16 rounded-full bg-slate-200 dark:bg-[#1c222c] flex items-center justify-center flex-shrink-0 grayscale">
                                                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-3xl">{badge.icon}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t(`badge.${badge.id}`)}</p>
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t(`badge.desc.${badge.id}`)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-slate-200 dark:border-border-dark flex justify-end">
                             <button 
                                onClick={() => setShowBadgesModal(false)}
                                className="px-6 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white font-medium rounded-full transition-colors"
                            >
                                {t('profile.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;