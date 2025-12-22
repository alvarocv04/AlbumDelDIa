import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Comment, DBUser } from '../types';

const COMMENTS_COLLECTION = 'comments';

export const addComment = async (albumId: string, content: string, user: DBUser): Promise<Comment> => {
    const newComment = {
        albumId,
        userId: user.uid,
        username: user.username || 'Anonymous',
        userPhotoURL: user.photoURL,
        content,
        createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), newComment);

    return {
        id: docRef.id,
        ...newComment
    };
};

export const getComments = async (albumId: string): Promise<Comment[]> => {
    const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('albumId', '==', albumId)
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];
    const userIds = new Set<string>();

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({ id: doc.id, ...data } as Comment);
        if (data.userId) userIds.add(data.userId);
    });

    // Fetch fresh user data to ensure photoURL is up to date
    if (userIds.size > 0) {
        // We can't easily use 'in' query for > 10 items without batching, 
        // but for < 100 comments/users on a page this is acceptable or we do parallel fetches.
        // Let's do parallel fetches for now as it reuse existing service pattern
        const { getUserUserData } = await import('./userService');

        const userMap = new Map();
        await Promise.all(Array.from(userIds).map(async (uid) => {
            const userData = await getUserUserData(uid);
            if (userData) userMap.set(uid, userData);
        }));

        // Update comments with fresh user data
        comments.forEach(comment => {
            const user = userMap.get(comment.userId);
            if (user) {
                // Prioritize fresh data
                comment.username = user.username || comment.username;
                comment.userPhotoURL = user.photoURL || comment.userPhotoURL;
            }
        });
    }

    // Client-side sort to avoid index creation delay issues during demo
    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteComment = async (commentId: string): Promise<void> => {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);
}
