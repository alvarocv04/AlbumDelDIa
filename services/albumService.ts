
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Album } from '../types';

export const getDailyAlbum = async (): Promise<Album | null> => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyRef = doc(db, 'daily_history', today);

    try {
        // 1. Check if today's album already exists
        const dailySnap = await getDoc(dailyRef);
        if (dailySnap.exists()) {
            console.log("📅 Album del día recuperado desde caché (daily_history).");
            return dailySnap.data() as Album;
        }

        console.log("🎲 Seleccionando un nuevo álbum para hoy...");

        // 2. If not, fetch all albums (optimized for small datasets < 1000)
        // In a larger app, you'd use a cursor or 'random' field index.
        const albumsRef = collection(db, 'albums');
        const querySnapshot = await getDocs(albumsRef);

        const candidates: Album[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as Album;
            // Only pick if not shown recently/ever
            if (!data.wasShown) {
                candidates.push(data);
            }
        });

        // Fallback: If all albums have been shown, reset pool or pick any.
        // For now, let's just pick from all if candidates is empty.
        const pool = candidates.length > 0 ? candidates : querySnapshot.docs.map(d => d.data() as Album);

        if (pool.length === 0) return null;

        // 3. Pick random
        const randomIndex = Math.floor(Math.random() * pool.length);
        const selectedAlbum = pool[randomIndex];

        // 4. Save selection for today
        // We save the whole object to avoid extra reads later
        await setDoc(dailyRef, selectedAlbum);

        // 5. Mark as shown in the main collection
        if (selectedAlbum.spotifyId) {
            const albumDocRef = doc(db, 'albums', selectedAlbum.spotifyId);
            await updateDoc(albumDocRef, {
                wasShown: true,
                lastShownDate: today
            });
        }

        console.log(`✅ Nuevo álbum seleccionado: ${selectedAlbum.title}`);
        return selectedAlbum;

    } catch (error) {
        console.error("Error getting daily album:", error);
        return null;
    }
};

export const getAlbumsByIds = async (ids: string[]): Promise<Album[]> => {
    if (!ids || ids.length === 0) return [];

    // Since Firestore 'in' queries are limited to 10 items, and we might have more,
    // and we want to preserve order or just get them all,
    // parallel getDoc is the most straightforward for history < 100 items.
    // For larger history, we might want to paginate or use a different strategy.

    // De-duplicate IDs just in case
    const uniqueIds = Array.from(new Set(ids));

    try {
        const albumPromises = uniqueIds.map(id => getDoc(doc(db, 'albums', id)));
        const snapshots = await Promise.all(albumPromises);

        const albums = snapshots
            .filter(snap => snap.exists())
            .map(snap => snap.data() as Album);

        return albums;
    } catch (error) {
        console.error("Error fetching albums by IDs:", error);
        return [];
    }
};

export const getAllAlbums = async (): Promise<Album[]> => {
    try {
        const albumsRef = collection(db, 'albums');
        const snapshot = await getDocs(albumsRef);
        return snapshot.docs.map(doc => doc.data() as Album);
    } catch (error) {
        console.error("Error fetching all albums:", error);
        return [];
    }
};

export const saveAlbum = async (album: Album): Promise<boolean> => {
    try {
        if (!album.spotifyId) throw new Error("Spotify ID is required");
        const albumRef = doc(db, 'albums', album.spotifyId);
        await setDoc(albumRef, album);
        return true;
    } catch (error) {
        console.error("Error saving album:", error);
        return false;
    }
};

export const deleteAlbum = async (albumId: string): Promise<boolean> => {
    try {
        const albumRef = doc(db, 'albums', albumId);
        await deleteDoc(albumRef);
        return true;
    } catch (error) {
        console.error("Error deleting album:", error);
        return false;
    }
};
export const getDailyHistory = async (): Promise<{ date: string; album: Album }[]> => {
    const LAUNCH_DATE = '2025-12-01';
    try {
        const historyRef = collection(db, 'daily_history');
        const snapshot = await getDocs(historyRef);

        const history = snapshot.docs
            .map(doc => ({
                date: doc.id,
                album: doc.data() as Album
            }))
            .filter(item => item.date >= LAUNCH_DATE); // Only show history from launch onwards

        // Sort by date descending
        return history.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
        console.error("Error fetching daily history:", error);
        return [];
    }
};
