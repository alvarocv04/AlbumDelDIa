import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { UserActivity } from '../types';

export const logActivity = async (
    userId: string,
    activity: Omit<UserActivity, 'id' | 'timestamp'>
) => {
    try {
        const activitiesRef = collection(db, 'users', userId, 'activity');
        await addDoc(activitiesRef, {
            ...activity,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};

export const getUserActivity = async (userId: string, limitCount: number = 5): Promise<UserActivity[]> => {
    try {
        const activitiesRef = collection(db, 'users', userId, 'activity');
        const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserActivity));
    } catch (error) {
        console.error("Error fetching activity:", error);
        return [];
    }
};
