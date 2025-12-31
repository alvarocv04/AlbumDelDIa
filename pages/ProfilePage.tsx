import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserUserData, setUsername, deleteUserFirestoreData, DEFAULT_PROFILE_PIC, uploadProfilePicture, checkIsFollowing, followUser, unfollowUser } from '../services/userService';
import { MOCK_USERS } from '../services/data';
import { db } from '../services/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import BadgeList from '../components/BadgeList';
import BadgeModal from '../components/BadgeModal';
import ImageUploadModal from '../components/ImageUploadModal';
import { getAllBadges } from '../services/badgeService';
import { Badge, UserBadge, UserActivity } from '../types';
import { getUserActivity } from '../services/activityService';

import LoginRequired from '../components/LoginRequired';

const ProfilePage: React.FC = () => {
    const { t, language } = useLanguage();
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { currentUser, login, logout, dbUser, refreshDbUser } = useAuth();

    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBadgesModal, setShowBadgesModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);

    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);

    const handleProfilePicSave = async (blob: Blob) => {
        if (!currentUser) return;
        try {
            const newPhotoURL = await uploadProfilePicture(currentUser.uid, blob);
            // No need to click refreshDbUser if we use onSnapshot, but good practice to keep context in sync
            await refreshDbUser();
        } catch (error) {
            console.error("Failed to upload profile picture:", error);
            alert("Failed to upload image. Please try again.");
        }
    };

    useEffect(() => {
        const fetchBadges = async () => {
            setAllBadges(await getAllBadges());
        };
        fetchBadges();
    }, []);

    // Determine whose profile we are viewing
    // If no userId param, we assume it's the current user's profile
    const targetUserId = userId || (currentUser ? currentUser.uid : null);

    useEffect(() => {
        if (!targetUserId) {
            setLoading(false);
            setProfileData(null);
            return;
        }

        setLoading(true);

        // Check if it's a Mock User ID first
        const mockUser = MOCK_USERS.find(u => u.id === targetUserId);
        if (mockUser) {
            setProfileData(mockUser);
            setLoading(false);
            return;
        }

        // Real User - Use onSnapshot for real-time updates
        const userRef = doc(db, 'users', targetUserId);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                // Merge auth data if viewing self, but mainly trust DB
                const dbData = docSnap.data();
                if (currentUser && targetUserId === currentUser.uid) {
                    setProfileData({ ...currentUser, ...dbData });
                } else {
                    setProfileData(dbData);
                }
            } else {
                console.log("No such user!");
                setProfileData(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching profile:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [targetUserId, currentUser]);

    // Fetch Activity when profile data changes
    useEffect(() => {
        if (profileData && (profileData.uid || profileData.id)) {
            // Handle both DB uid and Mock id
            const uid = profileData.uid || profileData.id;
            getUserActivity(uid).then(setActivities);
        }
    }, [profileData]);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (currentUser && targetUserId && currentUser.uid !== targetUserId) {
                const following = await checkIsFollowing(currentUser.uid, targetUserId);
                setIsFollowing(following);
            }
        };
        checkFollowStatus();
    }, [currentUser, targetUserId]);


    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    const viewingSelf = currentUser && targetUserId === currentUser.uid;

    if (!currentUser && !userId) { // Viewing own profile but not logged in
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center relative z-10">
                    <LoginRequired
                        titleKey="profile.login_required"
                        descriptionKey="profile.login_desc"
                    />
                </div>
            </div>
        );
    }

    // If we have no profile data (and not loading), either user not found or something went wrong
    if (!profileData && !loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <p>User not found.</p>
                </div>
            </div>
        );
    }

    // Do NOT merge mock user into real user to prevent data bleeding
    // We construct displayUser safely from profileData
    const user = profileData;

    // Fallback logic moved here, applied ONLY if properties are missing
    const displayUser = {
        ...user,
        username: user.username || user.name || 'Anonymous User',
        stats: user.stats || { followers: 0, following: 0, streak: 0, minutesListened: 0 },
        history: user.history || [],
        savedAlbums: user.savedAlbums || [],
        badges: user.badges || [],
        // Ensure photoURL fallback
        photoURL: user.photoURL || user.avatar || DEFAULT_PROFILE_PIC
    };


    // Normalize badges to handle both Real (UserBadge) and Mock (Badge with earned bool) structures
    const rawBadges = displayUser.badges || [];
    const userBadges: UserBadge[] = rawBadges.map((b: any) => {
        if (b.badgeId) return b; // Already UserBadge (Real Data)
        if (b.id) return { badgeId: b.id, obtainedAt: new Date().toISOString() }; // Convert Mock/Old style
        return null;
    }).filter((b: any) => b !== null) as UserBadge[];


    const handleFollowToggle = async () => {
        if (!currentUser || !targetUserId) return;

        // Optimistic update
        const newState = !isFollowing;
        setIsFollowing(newState);

        try {
            if (newState) {
                await followUser(currentUser.uid, targetUserId);
            } else {
                await unfollowUser(currentUser.uid, targetUserId);
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
            setIsFollowing(!newState); // Revert
        }
    };

    const handleShare = async () => {
        // Construct the shareable profile URL using the user's ID
        const uid = currentUser?.uid || targetUserId;
        const profileUrl = `${window.location.origin}${window.location.pathname}#/profile/${uid}`;
        const shareText = `${t('profile.share_message')}${profileUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Album Del Día',
                    text: t('profile.share_message'),
                    url: profileUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareText);
                alert(t('album.link_copied'));
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header />
            <div className="flex flex-1 justify-center py-6 px-4 md:px-8 lg:px-12 animate-fade-in">
                <div className="flex flex-col max-w-[1200px] flex-1 w-full gap-6">
                    {/* Profile Header */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between p-6 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="relative group">
                                <div className="relative">
                                    <img
                                        src={user.photoURL || user.avatar || DEFAULT_PROFILE_PIC}
                                        alt={`Foto de perfil de ${user.username || 'usuario'}`}
                                        className="aspect-square rounded-full h-32 w-32 ring-4 ring-slate-100 dark:ring-[#282e39] object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = DEFAULT_PROFILE_PIC;
                                        }}
                                    />
                                    {viewingSelf && (
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-white text-3xl">edit</span>
                                        </button>
                                    )}
                                </div>
                                {user.isOnline && <div className="absolute bottom-1 right-1 bg-green-500 border-4 border-white dark:border-surface-dark w-6 h-6 rounded-full pointer-events-none" title="Online"></div>}
                            </div>
                            <div className="flex flex-col justify-center gap-1 mt-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                                        {displayUser.username ? `@${displayUser.username}` : 'Anonymous User'}
                                    </h1>
                                    {user.isVerified && <span className="material-symbols-outlined text-primary fill-current text-[20px]" title={t('profile.verified')}>verified</span>}
                                </div>
                                <p className="text-sm font-medium text-primary">{t('profile.sonic_explorer') || 'Sonic Explorer'}</p>

                                <div className="flex gap-4 mt-3 justify-center md:justify-start text-sm">
                                    <span className="text-slate-900 dark:text-white font-bold">{user.stats?.followers || 0} <span className="font-normal text-slate-500 dark:text-[#9da6b9]">{t('profile.followers')}</span></span>
                                    <span className="text-slate-900 dark:text-white font-bold">{user.stats?.following || 0} <span className="font-normal text-slate-500 dark:text-[#9da6b9]">{t('profile.following')}</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-2 justify-center md:justify-end">
                            {viewingSelf ? (
                                <>
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center justify-center gap-2 px-6 h-11 bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 text-sm font-bold rounded-full transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">share</span>
                                        {t('profile.share') || 'Compartir'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            const newUsername = window.prompt(t('profile.prompt_username'));
                                            if (newUsername && newUsername.length >= 3) {
                                                try {
                                                    await setUsername(currentUser.uid, newUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                                    await refreshDbUser();
                                                    window.alert(t('common.save'));
                                                } catch (e: any) {
                                                    window.alert(e.message || t('common.unknown'));
                                                }
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-full transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        {t('profile.change_username')}
                                    </button>
                                    <button onClick={logout} className="flex items-center justify-center gap-2 px-6 h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-full transition-all">
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        {t('header.logout')}
                                    </button>
                                    {currentUser.email === 'alvarocastrovalverde@gmail.com' && (
                                        <button
                                            onClick={() => navigate('/admin')}
                                            className="flex items-center justify-center gap-2 px-6 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent hover:bg-slate-700 dark:hover:bg-slate-200 text-sm font-bold rounded-full transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                            {t('profile.admin_panel')}
                                        </button>
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(t('profile.confirm_delete_1'))) {
                                                if (window.confirm(t('profile.confirm_delete_2'))) {
                                                    try {
                                                        const uid = currentUser.uid;
                                                        await deleteUserFirestoreData(uid);
                                                        await currentUser.delete();
                                                        window.alert(t('profile.delete_success'));
                                                        window.location.href = "/";
                                                    } catch (e: any) {
                                                        console.error(e);
                                                        if (e.code === 'auth/requires-recent-login') {
                                                            window.alert(t('profile.requires_recent_login'));
                                                        } else {
                                                            window.alert(t('profile.delete_error'));
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 h-11 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-bold rounded-full transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                        {t('profile.delete_account')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`flex items-center justify-center gap-2 px-6 h-11 text-sm font-bold rounded-full transition-all shadow-lg active:scale-95 ${isFollowing
                                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                        : 'bg-primary hover:bg-blue-600 text-white shadow-blue-900/20'
                                        }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">person_check</span>
                                            {t('friends.following_status')}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                                            {t('profile.follow')}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 flex flex-col items-center justify-center gap-2 shadow-sm">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full text-orange-500 mb-1">
                                <span className="material-symbols-outlined text-[32px]">local_fire_department</span>
                            </div>
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">{user.stats?.streak || 0}</span>
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">{t('profile.stats_streak')}</span>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 flex flex-col items-center justify-center gap-2 shadow-sm">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-500 mb-1">
                                <span className="material-symbols-outlined text-[32px]">headphones</span>
                            </div>
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">{user.stats?.minutesListened || 0}</span>
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">{t('profile.stats_minutes')}</span>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 flex flex-col items-center justify-center gap-2 shadow-sm">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-500 mb-1">
                                <span className="material-symbols-outlined text-[32px]">album</span>
                            </div>
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">{user.history?.length || 0}</span>
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">{t('profile.stats_albums')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Column: Badges & Listened Albums */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Insignias y Logros */}
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('profile.badges')}</h3>
                                    <button
                                        onClick={() => setShowBadgesModal(true)}
                                        className="text-primary text-sm font-bold hover:underline"
                                    >
                                        {t('common.view_all')}
                                    </button>
                                </div>

                                <BadgeList allBadges={allBadges.slice(0, 4)} userBadges={userBadges} />
                            </div>

                            {/* Listened Albums */}
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('profile.listened_albums')}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {user.history && user.history.length > 0 ? [...user.history].reverse().slice(0, 8).map((albumId: string) => (
                                        <SavedAlbumCard key={albumId} albumId={albumId} />
                                    )) : (
                                        <p className="col-span-full text-slate-500 italic">{t('profile.no_listened_albums')}</p>
                                    )}
                                </div>
                                {user.history && user.history.length > 8 && (
                                    <button className="w-full mt-4 py-2 text-sm text-primary font-bold bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                                        {t('profile.view_full_history')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Column: Activity Feed */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 h-full">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('profile.recent_activity')}</h3>
                                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
                                    {activities.length > 0 ? (
                                        activities.map((activity) => {
                                            let displayTargetName = activity.targetName;
                                            if (activity.type === 'badge' && allBadges.length > 0) {
                                                const badge = allBadges.find(b => b.id === activity.targetId);
                                                if (badge) {
                                                    displayTargetName = language === 'es'
                                                        ? (badge.name_es || badge.name)
                                                        : (badge.name_en || badge.name);
                                                }
                                            }

                                            return (
                                                <div key={activity.id} className="relative animate-fade-in">
                                                    <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-4 border-surface-light dark:border-surface-dark ${activity.type === 'rate' ? 'bg-primary' :
                                                        activity.type === 'save' ? 'bg-yellow-500' :
                                                            activity.type === 'badge' ? 'bg-green-500' :
                                                                'bg-slate-400'
                                                        }`}></div>
                                                    <p className="text-slate-900 dark:text-white font-medium">
                                                        {activity.type === 'rate' && (
                                                            <>{t('activity.rated')} <span className="text-primary font-bold">{activity.targetName}</span> {activity.metadata?.rating} {t('activity.stars')}</>
                                                        )}
                                                        {activity.type === 'save' && (
                                                            <>{t('activity.saved')} <span className="text-primary font-bold">{activity.targetName}</span> {t('activity.to_collection')}</>
                                                        )}
                                                        {activity.type === 'listen' && (
                                                            <>{t('activity.listened')} <span className="text-primary font-bold">{activity.targetName}</span></>
                                                        )}
                                                        {activity.type === 'badge' && (
                                                            <>{t('activity.earned')} <span className="text-primary font-bold">{displayTargetName}</span> {t('activity.badge')}</>
                                                        )}
                                                    </p>
                                                    <span className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-slate-500 dark:text-gray-400 text-sm italic">{t('profile.no_activity')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals outside animate-fade-in for correct fixed positioning */}
            <BadgeModal
                isOpen={showBadgesModal}
                onClose={() => setShowBadgesModal(false)}
                allBadges={allBadges}
                userBadges={userBadges}
            />
            <ImageUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSave={handleProfilePicSave}
            />

        </div >
    );
};

const SavedAlbumCard: React.FC<{ albumId: string }> = ({ albumId }) => {
    const [album, setAlbum] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const docRef = doc(db, 'albums', albumId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAlbum(docSnap.data());
                }
            } catch (err) {
                console.error("Error fetching saved album:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlbum();
    }, [albumId]);

    if (loading) {
        return <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />;
    }

    if (!album) return null;

    return (
        <a href={`#/album/${albumId}`} className="block group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <img
                src={album.coverUrl}
                alt={`${album.title} - Portada del álbum de ${album.artist}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                onLoad={(e) => (e.currentTarget.previousSibling as HTMLElement).style.display = 'none'}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors z-10" />
            <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <p className="text-white text-sm font-bold leading-tight line-clamp-2 mb-1">{album.title}</p>
                <p className="text-white/70 text-xs truncate">{album.artist}</p>
            </div>
        </a>
    );
};

export default ProfilePage;
