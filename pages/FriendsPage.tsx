import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_USERS } from '../services/data';

const FriendsPage: React.FC = () => {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [following, setFollowing] = useState<string[]>([]);

    const toggleFollow = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setFollowing(prev => 
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const filteredUsers = MOCK_USERS.filter(user => 
        user.id !== 'me' && (
            user.name.toLowerCase().includes(search.toLowerCase()) || 
            user.handle.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow w-full px-4 md:px-10 py-8 animate-fade-in">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[36px]">group</span>
                                {t('friends.title')}
                            </h1>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                        <input 
                            type="text" 
                            placeholder={t('friends.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-lg"
                        />
                    </div>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map(user => (
                            <Link to={`/profile/${user.id}`} key={user.id} className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 opacity-80"></div>
                                <div className="px-6 pb-6 -mt-12 flex flex-col flex-1">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-surface-dark bg-cover bg-center shadow-lg" style={{backgroundImage: `url('${user.avatar}')`}}></div>
                                            {user.isOnline && <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full" title="Online"></div>}
                                        </div>
                                        <button 
                                            onClick={(e) => toggleFollow(user.id, e)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                                                following.includes(user.id)
                                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                                : 'bg-primary text-white hover:bg-blue-600'
                                            }`}
                                        >
                                            {following.includes(user.id) ? t('friends.following_status') : t('profile.follow')}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
                                        {user.isVerified && <span className="material-symbols-outlined text-primary text-[18px] filled">verified</span>}
                                    </div>
                                    <p className="text-primary text-sm font-medium mb-3">{user.handle}</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{user.bio}</p>
                                    
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-border-dark">
                                        <div className="text-center">
                                            <p className="text-slate-900 dark:text-white font-bold">{user.stats.followers}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('profile.followers')}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-900 dark:text-white font-bold">{user.badges.filter(b => b.earned).length}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('home.badges_earned')}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-surface-dark rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl">search_off</span>
                            </div>
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">{t('friends.no_users')}</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FriendsPage;