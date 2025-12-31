import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { DBUser } from '../types';
import {
    searchUsers,
    followUser,
    unfollowUser,
    getGlobalLeaderboard,
    getFriendsLeaderboard,
    checkIsFollowing,
    DEFAULT_PROFILE_PIC
} from '../services/userService';

import LoginRequired from '../components/LoginRequired';

const FriendsPage: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    // UI State
    const [viewMode, setViewMode] = useState<'ranking' | 'search'>('ranking');
    const [rankingType, setRankingType] = useState<'global' | 'friends'>('global');
    const [searchQuery, setSearchQuery] = useState('');

    // Data State
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

    // Load User Relationships (to show Follow/Unfollow status correctly)
    const loadFollowStatus = async (usersList: DBUser[]) => {
        if (!currentUser) return;
        const statusMap: Record<string, boolean> = {};

        // Optimize: Check in parallel
        await Promise.all(usersList.map(async (u) => {
            if (u.uid !== currentUser.uid) {
                const isFollowing = await checkIsFollowing(currentUser.uid, u.uid);
                statusMap[u.uid] = isFollowing;
            }
        }));

        setFollowingMap(prev => ({ ...prev, ...statusMap }));
    };

    // Main Data Fetcher
    useEffect(() => {
        const fetchData = async () => {
            // Allow searching and viewing global ranking without login, but restrict friends ranking
            if (!currentUser && rankingType === 'friends') {
                setUsers([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                let data: DBUser[] = [];

                if (viewMode === 'search') {
                    if (searchQuery.trim().length > 0) {
                        data = await searchUsers(searchQuery);
                    }
                } else {
                    // Ranking Mode
                    if (rankingType === 'global') {
                        data = await getGlobalLeaderboard();
                    } else {
                        data = await getFriendsLeaderboard(currentUser!.uid);
                    }
                }

                setUsers(data);
                if (currentUser) {
                    await loadFollowStatus(data);
                }
            } catch (error) {
                console.error("Error fetching friends data:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchData, viewMode === 'search' ? 500 : 0);
        return () => clearTimeout(debounce);
    }, [viewMode, rankingType, searchQuery, currentUser]);

    const handleFollowToggle = async (targetId: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        // Optimistic Update
        const isFollowing = followingMap[targetId];
        setFollowingMap(prev => ({ ...prev, [targetId]: !isFollowing }));

        try {
            if (isFollowing) {
                await unfollowUser(currentUser.uid, targetId);
            } else {
                await followUser(currentUser.uid, targetId);
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
            // Revert on error
            setFollowingMap(prev => ({ ...prev, [targetId]: isFollowing }));
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow w-full px-4 md:px-10 py-8 animate-fade-in relative z-10">
                {!currentUser ? (
                    <div className="max-w-7xl mx-auto h-full flex flex-col pt-12">
                        <LoginRequired
                            titleKey="friends.login_required"
                            descriptionKey="friends.login_desc"
                        />
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto flex flex-col gap-8">

                        {/* Page Header */}
                        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-[28px] sm:text-[36px]">
                                        {viewMode === 'ranking' ? 'leaderboard' : 'group_add'}
                                    </span>
                                    {viewMode === 'ranking' ? t('friends.rankings_title') : t('friends.find_friends')}
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                    {viewMode === 'ranking'
                                        ? t('friends.rankings_subtitle')
                                        : t('friends.search_subtitle')}
                                </p>
                            </div>

                            {/* View Switcher */}
                            <div className="flex bg-slate-100 dark:bg-surface-dark p-1 rounded-xl">
                                <button
                                    onClick={() => { setViewMode('ranking'); setSearchQuery(''); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'ranking'
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {t('friends.rankings')}
                                </button>
                                <button
                                    onClick={() => setViewMode('search')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'search'
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {t('friends.search')}
                                </button>
                            </div>
                        </div>

                        {/* Controls Section */}
                        {viewMode === 'ranking' ? (
                            <div className="flex gap-4 border-b border-slate-200 dark:border-border-dark pb-4">
                                <button
                                    onClick={() => setRankingType('global')}
                                    className={`pb-2 px-1 text-lg font-bold transition-all relative ${rankingType === 'global'
                                        ? 'text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {t('friends.global_rank')}
                                    {rankingType === 'global' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>}
                                </button>
                                <button
                                    onClick={() => setRankingType('friends')}
                                    className={`pb-2 px-1 text-lg font-bold transition-all relative ${rankingType === 'friends'
                                        ? 'text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {t('friends.friends_rank')}
                                    {rankingType === 'friends' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>}
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                                <input
                                    type="text"
                                    placeholder={t('friends.search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg shadow-sm"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Results Grid */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                            </div>
                        ) : viewMode === 'ranking' ? (
                            /* Ranking List View */
                            <div className="flex flex-col gap-4">
                                {users.map((user, index) => (
                                    <Link
                                        to={`/profile/${user.uid}`}
                                        key={user.uid}
                                        className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-lg"
                                    >
                                        {/* Mobile: Top Row with Rank, Avatar, Name, Follow */}
                                        <div className="flex items-center gap-3 w-full">
                                            {/* Rank Number */}
                                            <div className={`flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-base sm:text-lg shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-900' :
                                                index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600' :
                                                    index === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {index + 1}
                                            </div>

                                            {/* User Avatar & Name */}
                                            <div className="flex items-center gap-3 flex-grow min-w-0">
                                                <div
                                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white dark:border-slate-600 shadow-md bg-slate-200 flex-shrink-0 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700"
                                                >
                                                    <img
                                                        src={user.photoURL || DEFAULT_PROFILE_PIC}
                                                        alt={`Foto de perfil de ${user.username || 'usuario'}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = DEFAULT_PROFILE_PIC;
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                                                        {user.username ? `@${user.username}` : 'Anonymous User'}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span>{user.stats?.followers || 0} {t('profile.followers')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Follow Action - visible on mobile */}
                                            <div className="flex-shrink-0 sm:hidden flex items-center">
                                                {currentUser?.uid !== user.uid && (
                                                    <button
                                                        onClick={(e) => handleFollowToggle(user.uid, e)}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${followingMap[user.uid]
                                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                                                            : 'bg-primary text-white'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {followingMap[user.uid] ? 'person_check' : 'person_add'}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mobile: Stats Row */}
                                        <div className="flex items-center justify-between gap-3 w-full sm:w-auto sm:justify-end bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent sm:dark:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none -mx-0 sm:mx-0">
                                            {/* Streak Badge */}
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 rounded-xl border border-orange-200/50 dark:border-orange-500/20">
                                                <span className="material-symbols-outlined text-[24px] text-orange-500 filled">local_fire_department</span>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 leading-tight">{user.stats?.streak || 0}</span>
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-orange-500/70 dark:text-orange-400/60">STREAK</span>
                                                </div>
                                            </div>

                                            {/* Minutes Listened */}
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-200/50 dark:border-blue-500/20">
                                                <span className="material-symbols-outlined text-[24px] text-primary filled">headphones</span>
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-lg font-black text-primary leading-tight">{user.stats?.minutesListened || 0}</span>
                                                        <span className="text-xs font-medium text-primary/70">min</span>
                                                    </div>
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-primary/60">{t('friends.listening_label')}</span>
                                                </div>
                                            </div>

                                            {/* Follow Action - Desktop only */}
                                            <div className="hidden sm:block flex-shrink-0 ml-2">
                                                {currentUser?.uid !== user.uid && (
                                                    <button
                                                        onClick={(e) => handleFollowToggle(user.uid, e)}
                                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${followingMap[user.uid]
                                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                                            : 'bg-primary text-white hover:bg-blue-600'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {followingMap[user.uid] ? 'person_check' : 'person_add'}
                                                        </span>
                                                        <span>
                                                            {followingMap[user.uid] ? t('friends.following_status') : t('profile.follow')}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {users.map((user, index) => (
                                    <Link to={`/profile/${user.uid}`} key={user.uid} className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-visible hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                                        <div className="h-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 dark:from-blue-500/10 dark:to-purple-600/10 rounded-t-2xl"></div>

                                        <div className="px-6 pb-6 -mt-12 flex flex-col flex-1">
                                            <div className="flex justify-between items-end mb-4">
                                                <div className="relative">
                                                    <div
                                                        className="w-24 h-24 rounded-full border-4 border-white dark:border-surface-dark shadow-lg bg-slate-200 overflow-hidden"
                                                    >
                                                        <img
                                                            src={user.photoURL || DEFAULT_PROFILE_PIC}
                                                            alt={`Foto de perfil de ${user.username || 'usuario'}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = DEFAULT_PROFILE_PIC;
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {currentUser?.uid !== user.uid && (
                                                    <button
                                                        onClick={(e) => handleFollowToggle(user.uid, e)}
                                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${followingMap[user.uid]
                                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                                            : 'bg-primary text-white hover:bg-blue-600'
                                                            }`}
                                                    >
                                                        {followingMap[user.uid] ? t('friends.following_status') : t('profile.follow')}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                                    {user.username ? `@${user.username}` : 'Anonymous User'}
                                                </h3>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                                                        <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                                                        <span>{user.stats?.streak || 0}</span>
                                                    </div>
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Streak</span>
                                                </div>
                                                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700"></div>
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1 text-blue-500 font-bold">
                                                        <span>{user.stats?.minutesListened || 0}</span>
                                                        <span className="text-xs">min</span>
                                                    </div>
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{t('friends.listening_label')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!loading && users.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-surface-dark rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl">search_off</span>
                                </div>
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                                    {viewMode === 'search' ? t('friends.no_users_found') : t('friends.no_ranking_data')}
                                </h3>
                                <p className="text-slate-500 mt-2 max-w-md">
                                    {viewMode === 'search'
                                        ? t('friends.try_different_search')
                                        : t('friends.start_listening_to_join')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FriendsPage;