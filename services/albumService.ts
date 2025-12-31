
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, Timestamp, query, where, orderBy, limit, documentId } from 'firebase/firestore';
import { Album } from '../types';

export const getDailyAlbum = async (): Promise<Album | null> => {
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }); // YYYY-MM-DD in Spain
    const dailyRef = doc(db, 'daily_history', today);

    try {
        // Solo intentamos leer el álbum ya generado por el servidor
        const dailySnap = await getDoc(dailyRef);

        if (dailySnap.exists()) {
            console.log("📅 Álbum del día cargado:", dailySnap.data().title);
            return dailySnap.data() as Album;
        }

        console.warn("⚠️ Aún no hay álbum seleccionado para hoy (esperando al servidor/cron).");
        return null;

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
export const getDailyHistory = async (options?: { limit?: number; startDate?: string; endDate?: string }): Promise<{ date: string; album: Album }[]> => {
    const LAUNCH_DATE = '2025-12-01';
    try {
        const historyRef = collection(db, 'daily_history');
        let q;

        if (options?.startDate && options?.endDate) {
            // Rango específico (para navegación en calendario)
            q = query(historyRef,
                where(documentId(), '>=', options.startDate),
                where(documentId(), '<=', options.endDate)
            );
        } else {
            // Carga inicial / Lista reciente
            q = query(historyRef,
                where(documentId(), '>=', LAUNCH_DATE),
                orderBy(documentId(), 'desc'),
                limit(options?.limit || 30)
            );
        }

        const snapshot = await getDocs(q);

        const history = snapshot.docs.map(doc => ({
            date: doc.id,
            album: doc.data() as Album
        }));

        // Sort by date descending
        return history.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
        console.error("Error fetching daily history:", error);
        return [];
    }
};
