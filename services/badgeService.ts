import { Badge, DBUser, UserBadge } from '../types';
import { db } from './firebase';
import { doc, updateDoc, arrayUnion, getDocs, collection, setDoc, deleteDoc } from 'firebase/firestore';
import { logActivity } from './activityService';

// Static Badge Definitions (Fallback / Seed Data)
export const DEFAULT_BADGES: Badge[] = [
    {
        id: 'streak_3',
        name: 'Racha de 3 Días',
        name_es: 'Racha de 3 Días',
        name_en: '3 Day Streak',
        description: 'Escucha un álbum 3 días seguidos',
        description_es: 'Escucha un álbum 3 días seguidos',
        description_en: 'Listen to an album for 3 consecutive days',
        icon: '🔥',
        category: 'streak',
        threshold: 3
    },
    {
        id: 'streak_7',
        name: 'Semana Musical',
        name_es: 'Semana Musical',
        name_en: 'Musical Week',
        description: 'Escucha un álbum 7 días seguidos',
        description_es: 'Escucha un álbum 7 días seguidos',
        description_en: 'Listen to an album for 7 consecutive days',
        icon: '📅',
        category: 'streak',
        threshold: 7
    },
    {
        id: 'minutes_100',
        name: 'Oyente Dedicado',
        name_es: 'Oyente Dedicado',
        name_en: 'Dedicated Listener',
        description: 'Escucha 100 minutos de música',
        description_es: 'Escucha 100 minutos de música',
        description_en: 'Listen to 100 minutes of music',
        icon: '🎧',
        category: 'listening',
        threshold: 100
    },
    {
        id: 'minutes_500',
        name: 'Melómano',
        name_es: 'Melómano',
        name_en: 'Audiophile',
        description: 'Escucha 500 minutos de música',
        description_es: 'Escucha 500 minutos de música',
        description_en: 'Listen to 500 minutes of music',
        icon: '💿',
        category: 'listening',
        threshold: 500
    },
    {
        id: 'first_album',
        name: 'Primera Escucha',
        name_es: 'Primera Escucha',
        name_en: 'First Listen',
        description: 'Escucha tu primer álbum completo',
        description_es: 'Escucha tu primer álbum completo',
        description_en: 'Listen to your first complete album',
        icon: '🎵',
        category: 'milestone',
        threshold: 1
    }
];

let cachedBadges: Badge[] | null = null;

export const getAllBadges = async (): Promise<Badge[]> => {
    if (cachedBadges) return cachedBadges;

    try {
        const querySnapshot = await getDocs(collection(db, 'badges'));
        if (querySnapshot.empty) {
            console.log('Badges collection empty. Seeding defaults...');
            await initializeBadgesCollection();
            cachedBadges = DEFAULT_BADGES;
            return DEFAULT_BADGES;
        }

        const badges: Badge[] = [];
        let needsUpdate = false;

        querySnapshot.forEach((doc) => {
            badges.push(doc.data() as Badge);
        });

        // Check if any badge is missing translations (checking one field is enough)
        if (badges.some(b => !b.name_en)) {
            console.log("Badges missing translations. Syncing with defaults...");
            await updateBadgesDefinitions();
            // Return defaults (which have the translations) to ensure UI is correct immediately
            cachedBadges = DEFAULT_BADGES;
            return DEFAULT_BADGES;
        }

        cachedBadges = badges;
        return badges;
    } catch (error) {
        console.error("Error fetching badges:", error);
        return DEFAULT_BADGES; // Fallback to static if offline or error
    }
};

const initializeBadgesCollection = async () => {
    await updateBadgesDefinitions();
};

export const updateBadgesDefinitions = async () => {
    for (const badge of DEFAULT_BADGES) {
        await setDoc(doc(db, 'badges', badge.id), badge, { merge: true });
    }
};

export const checkAndAwardBadges = async (userId: string, userData: DBUser): Promise<Badge[]> => {
    const newBadges: Badge[] = [];
    const ownedBadgeIds = new Set((userData.badges || []).map(b => b.badgeId));

    const allBadges = await getAllBadges();

    for (const badge of allBadges) {
        if (ownedBadgeIds.has(badge.id)) continue;

        let earned = false;

        switch (badge.category) {
            case 'streak':
                if ((userData.stats?.streak || 0) >= badge.threshold) {
                    earned = true;
                }
                break;
            case 'listening':
                if ((userData.stats?.minutesListened || 0) >= badge.threshold) {
                    earned = true;
                }
                break;
            case 'milestone':
                if ((userData.history || []).length >= badge.threshold) {
                    earned = true;
                }
                break;
            // Add 'social' cases later
        }

        if (earned) {
            newBadges.push(badge);
            await awardBadge(userId, badge);
        }
    }

    return newBadges;
};

const awardBadge = async (userId: string, badge: Badge) => {
    const userRef = doc(db, 'users', userId);
    const newBadge: UserBadge = {
        badgeId: badge.id,
        obtainedAt: new Date().toISOString()
    };

    await updateDoc(userRef, {
        badges: arrayUnion(newBadge)
    });

    // Log Activity
    await logActivity(userId, {
        type: 'badge',
        targetId: badge.id,
        targetName: badge.name, // "Racha de 3 Días"
        targetImage: badge.icon, // Emoji or Url
        metadata: { rating: undefined } // Just to be safe or ignore
    });
};

export const saveBadge = async (badge: Badge): Promise<boolean> => {
    try {
        await setDoc(doc(db, 'badges', badge.id), badge);
        // Invalidate cache
        cachedBadges = null;
        return true;
    } catch (error) {
        console.error("Error saving badge:", error);
        return false;
    }
};

export const deleteBadge = async (badgeId: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, 'badges', badgeId));
        // Invalidate cache
        cachedBadges = null;
        return true;
    } catch (error) {
        console.error("Error deleting badge:", error);
        return false;
    }
};

// Deprecated: use getAllBadges
export const getBadges = (): Badge[] => {
    return DEFAULT_BADGES;
};
