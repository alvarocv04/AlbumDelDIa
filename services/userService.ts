import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, deleteDoc, query, where, orderBy, limit, getDocs, startAt, endAt, documentId } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { checkAndAwardBadges } from './badgeService';
import { DBUser } from '../types';
import { logActivity } from './activityService';

const getAlbumBasicInfo = async (albumId: string) => {
    try {
        const snap = await getDoc(doc(db, 'albums', albumId));
        return snap.exists() ? snap.data() : { title: 'Unknown Album', coverUrl: '' };
    } catch (e) {
        return { title: 'Unknown Album', coverUrl: '' };
    }
};

export const DEFAULT_PROFILE_PIC = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const uploadProfilePicture = async (userId: string, imageBlob: Blob): Promise<string> => {
    // 1. Convert Blob to Base64 string
    const base64String = await blobToBase64(imageBlob);

    // 2. Validate size (approximate) - Firestore limit is 1MB for the whole doc
    if (base64String.length > 700000) { // ~700KB safety limit
        throw new Error("Image is too large. Please crop it smaller.");
    }

    // 3. Save directly to Firestore user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        photoURL: base64String
    });

    return base64String;
};

export const syncUser = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            photoURL: user.photoURL || DEFAULT_PROFILE_PIC,
            username: null,
            savedAlbums: [],
            ratings: {}, // Map of albumId -> { personal: number, artistic: number }
            history: [], // Array of albumIds
            createdAt: new Date(),
            stats: {
                followers: 0,
                following: 0,
                streak: 0,
                minutesListened: 0
            },
            badges: []
        });
    } else {
        // If user exists but has no photoURL (or explicit null), update it with default or Google's if available now
        const data = userSnap.data();
        if (!data.photoURL) {
            await updateDoc(userRef, {
                photoURL: user.photoURL || DEFAULT_PROFILE_PIC
            });
        }
    }
};

export const setUsername = async (userId: string, username: string) => {
    // Check uniqueness first
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        throw new Error('Username already taken');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        username: username,
        acceptedTermsAt: new Date().toISOString()
    });
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.empty;
};

export const toggleAlbumSave = async (userId: string, albumId: string, shouldSave: boolean) => {
    const userRef = doc(db, 'users', userId);
    if (shouldSave) {
        await updateDoc(userRef, {
            savedAlbums: arrayUnion(albumId)
        });

        // Log Activity
        const albumInfo = await getAlbumBasicInfo(albumId);
        await logActivity(userId, {
            type: 'save',
            targetId: albumId,
            targetName: albumInfo.title,
            targetImage: albumInfo.coverUrl
        });
    } else {
        await updateDoc(userRef, {
            savedAlbums: arrayRemove(albumId)
        });
    }
};

export const rateAlbum = async (userId: string, albumId: string, ratingType: 'personal' | 'artistic', value: number) => {
    const userRef = doc(db, 'users', userId);
    // Dynamic field update for nested map: ratings.albumId.type

    await updateDoc(userRef, {
        [`ratings.${albumId}.${ratingType}`]: value
    });

    // Log Activity (Only for personal rating as a primary "Rated" activity?)
    if (ratingType === 'personal') {
        const albumInfo = await getAlbumBasicInfo(albumId);
        await logActivity(userId, {
            type: 'rate',
            targetId: albumId,
            targetName: albumInfo.title,
            targetImage: albumInfo.coverUrl,
            metadata: { rating: value }
        });
    }
};

export const getUserUserData = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const sn = await getDoc(userRef);
    return sn.exists() ? sn.data() : null;
};

export const markAlbumAsListened = async (userId: string, albumId: string, durationMs: number) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();

    // Check if entered history to know if it's a unique listen (for milestones)
    // We proceed regardless to update minutes/streak, but history uses arrayUnion so it won't duplicate IDs.


    // Calculate Minutes
    const minutes = Math.round(durationMs / 60000);

    // Calculate Streak & Day Tracking
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userData.stats?.lastListenedDate;

    let newStreak = userData.stats?.streak || 0;
    let albumsToday = userData.stats?.albumsListenedToday || 0;

    if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
            newStreak += 1;
        } else {
            newStreak = 1; // Reset or start new
        }
        albumsToday = 1; // First of the day
    } else {
        albumsToday += 1; // Another one today
    }

    // Update Firestore
    // Update Firestore
    await updateDoc(userRef, {
        history: arrayUnion(albumId),
        'stats.minutesListened': (userData.stats?.minutesListened || 0) + minutes,
        'stats.streak': newStreak,
        'stats.lastListenedDate': today,
        'stats.albumsListenedToday': albumsToday
    });

    // Log Listening Activity
    const albumInfo = await getAlbumBasicInfo(albumId);
    await logActivity(userId, {
        type: 'listen',
        targetId: albumId,
        targetName: albumInfo.title,
        targetImage: albumInfo.coverUrl
    });

    // Check for badges
    // Construct a temporary DBUser object with the new stats to check against
    const updatedUser: DBUser = {
        ...userData,
        history: [...(userData.history || []), albumId], // Include the new album in history for badge check
        stats: {
            ...userData.stats,
            minutesListened: (userData.stats?.minutesListened || 0) + minutes,
            streak: newStreak,
            lastListenedDate: today,
            albumsListenedToday: albumsToday
        },
        badges: userData.badges || []
    } as DBUser;

    await checkAndAwardBadges(userId, updatedUser);
};

export const unmarkAlbumAsListened = async (userId: string, albumId: string, durationMs: number) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();

    // Check if actually listened
    if (!userData.history || !userData.history.includes(albumId)) {
        return;
    }

    // Calculate Minutes to subtract
    const minutes = Math.round(durationMs / 60000);
    const currentMinutes = userData.stats?.minutesListened || 0;

    // Streak Logic
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userData.stats?.lastListenedDate;
    let newStreak = userData.stats?.streak || 0;
    let albumsToday = userData.stats?.albumsListenedToday || 1; // Default to 1 if missing for safety
    let newLastListenedDate = lastDate;

    if (lastDate === today) {
        albumsToday = Math.max(0, albumsToday - 1);
        if (albumsToday === 0) {
            // Revert streak if no albums left for today
            newStreak = Math.max(0, newStreak - 1);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            newLastListenedDate = yesterday.toISOString().split('T')[0];
        }
    }

    await updateDoc(userRef, {
        history: arrayRemove(albumId),
        'stats.minutesListened': Math.max(0, currentMinutes - minutes),
        'stats.streak': newStreak,
        'stats.lastListenedDate': newLastListenedDate,
        'stats.albumsListenedToday': albumsToday
    });
};

// --- Friends & Social Features ---

export const followUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) return;

    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    // Add to following subcollection
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    await setDoc(followingRef, {
        uid: targetUserId,
        followedAt: new Date().toISOString()
    });

    // Add to followers subcollection
    const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
    await setDoc(followerRef, {
        uid: currentUserId,
        followedAt: new Date().toISOString()
    });

    // Update counts (using increment would be better atomically but simple read/write ok for now)
    // We will use increment for atomicity if possible, or simple manual update since we don't have atomic increment imported yet
    // Let's import increment if I can, or just do manual read-update for simplicity in this context without changing imports too much 
    // actually let's just do manual update to be safe with current imports, or add increment to imports in next step if needed.
    // For now, simple update.

    // Update Current User Following Count
    const currentUserSnap = await getDoc(currentUserRef);
    if (currentUserSnap.exists()) {
        const data = currentUserSnap.data();
        await updateDoc(currentUserRef, {
            'stats.following': (data.stats?.following || 0) + 1
        });
    }

    // Update Target User Followers Count
    const targetUserSnap = await getDoc(targetUserRef);
    if (targetUserSnap.exists()) {
        const data = targetUserSnap.data();
        await updateDoc(targetUserRef, {
            'stats.followers': (data.stats?.followers || 0) + 1
        });
    }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) return;

    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    // Remove from following subcollection
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    await deleteDoc(followingRef);

    // Remove from followers subcollection
    const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
    await deleteDoc(followerRef);

    // Update Current User Following Count
    const currentUserSnap = await getDoc(currentUserRef);
    if (currentUserSnap.exists()) {
        const data = currentUserSnap.data();
        const currentCount = data.stats?.following || 0;
        await updateDoc(currentUserRef, {
            'stats.following': Math.max(0, currentCount - 1)
        });
    }

    // Update Target User Followers Count
    const targetUserSnap = await getDoc(targetUserRef);
    if (targetUserSnap.exists()) {
        const data = targetUserSnap.data();
        const targetCount = data.stats?.followers || 0;
        await updateDoc(targetUserRef, {
            'stats.followers': Math.max(0, targetCount - 1)
        });
    }
};

export const checkIsFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    const docRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    const snap = await getDoc(docRef);
    return snap.exists();
};

export const searchUsers = async (searchTerm: string): Promise<DBUser[]> => {
    if (!searchTerm) return [];

    // Simple search by username
    // Note: Firestore text search is limited. 
    // We'll search by displayName >= term and <= term + \uf8ff
    // This is case-sensitive. Real apps use Algolia or TypeSense.
    // For this prototype, we assume users type names somewhat correctly or we accept case sensitivity.
    // To support case-insensitive, we'd need a lowercase searchable field.

    const usersRef = collection(db, 'users');
    const q = query(
        usersRef,
        where('username', '>=', searchTerm),
        where('username', '<=', searchTerm + '\uf8ff'),
        limit(20)
    );

    const querySnapshot = await getDocs(q);
    const users: DBUser[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as DBUser);
    });

    return users;
};

export const getGlobalLeaderboard = async (): Promise<DBUser[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('stats.streak', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    const users: DBUser[] = [];
    snapshot.forEach((doc) => {
        users.push(doc.data() as DBUser);
    });
    return users;
};

export const getFriendsLeaderboard = async (currentUserId: string): Promise<DBUser[]> => {
    // 1. Get List of Following IDs
    const followingRef = collection(db, 'users', currentUserId, 'following');
    const followingSnap = await getDocs(followingRef);

    const followingIds = followingSnap.docs.map(doc => doc.id);
    followingIds.push(currentUserId); // Include self in leaderboard

    if (followingIds.length === 0) return [];

    // 2. Fetch User Data
    // We can't use 'in' for > 30 items. We'll use Promise.all which is fine for < 100 friend relationships usually.
    // Optimization: Filter unique IDs
    const uniqueIds = Array.from(new Set(followingIds));

    // Fetch in parallel
    const userPromises = uniqueIds.map(id => getUserUserData(id));
    const usersData = await Promise.all(userPromises);

    // Filter out nulls and cast
    const validUsers = usersData.filter(u => u !== null) as DBUser[];

    // 3. Sort by Streak Descending
    validUsers.sort((a, b) => (b.stats?.streak || 0) - (a.stats?.streak || 0));

    return validUsers;
};

export const deleteUserFirestoreData = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
};
