import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, deleteDoc, doc, updateDoc, increment, arrayUnion, arrayRemove, runTransaction, getDoc } from 'firebase/firestore';
import { Comment, DBUser } from '../types';

const COMMENTS_COLLECTION = 'comments';

export const addComment = async (albumId: string, content: string, user: DBUser): Promise<Comment> => {
    const newComment = {
        albumId,
        userId: user.uid,
        username: user.username || 'Anonymous',
        userPhotoURL: user.photoURL,
        content,
        createdAt: new Date().toISOString(),
        votes: 0,
        upvotedBy: [],
        downvotedBy: [],
        replyCount: 0
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

    // Client-side sort: votes DESC, then date DESC
    // Filter out replies (only show top-level comments)
    return comments
        .filter(c => !c.parentId)
        .sort((a, b) => {
            if (b.votes !== a.votes) return b.votes - a.votes;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
};

export const deleteComment = async (commentId: string): Promise<void> => {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);
};

export const addReply = async (parentId: string, albumId: string, content: string, user: DBUser): Promise<Comment> => {
    const newReply = {
        albumId,
        parentId,
        userId: user.uid,
        username: user.username || 'Anonymous',
        userPhotoURL: user.photoURL,
        content,
        createdAt: new Date().toISOString(),
        votes: 0,
        upvotedBy: [],
        downvotedBy: []
    };

    // Run as transaction to update reply count on parent
    return await runTransaction(db, async (transaction) => {
        const parentRef = doc(db, COMMENTS_COLLECTION, parentId);
        const parentDoc = await transaction.get(parentRef);

        if (!parentDoc.exists()) throw new Error('Parent comment not found');

        const replyRef = doc(collection(db, COMMENTS_COLLECTION));
        transaction.set(replyRef, newReply);
        transaction.update(parentRef, { replyCount: increment(1) });

        return {
            id: replyRef.id,
            ...newReply
        } as Comment;
    });
};

export const getReplies = async (parentId: string): Promise<Comment[]> => {
    const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('parentId', '==', parentId)
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];
    const userIds = new Set<string>();

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({ id: doc.id, ...data } as Comment);
        if (data.userId) userIds.add(data.userId);
    });

    if (userIds.size > 0) {
        const { getUserUserData } = await import('./userService');
        const userMap = new Map();
        await Promise.all(Array.from(userIds).map(async (uid) => {
            const userData = await getUserUserData(uid);
            if (userData) userMap.set(uid, userData);
        }));

        comments.forEach(comment => {
            const user = userMap.get(comment.userId);
            if (user) {
                comment.username = user.username || comment.username;
                comment.userPhotoURL = user.photoURL || comment.userPhotoURL;
            }
        });
    }

    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const upvoteComment = async (commentId: string, userId: string): Promise<void> => {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) return;

    const data = commentDoc.data() as Comment;
    const isUpvoted = data.upvotedBy?.includes(userId);
    const isDownvoted = data.downvotedBy?.includes(userId);

    if (isUpvoted) {
        // Remove upvote
        await updateDoc(commentRef, {
            votes: increment(-1),
            upvotedBy: arrayRemove(userId)
        });
    } else {
        // Add upvote
        await updateDoc(commentRef, {
            votes: increment(isDownvoted ? 2 : 1), // If downvoted, +2 (remove downvote + add upvote)
            upvotedBy: arrayUnion(userId),
            downvotedBy: arrayRemove(userId)
        });
    }
};

export const downvoteComment = async (commentId: string, userId: string): Promise<void> => {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) return;

    const data = commentDoc.data() as Comment;
    const isUpvoted = data.upvotedBy?.includes(userId);
    const isDownvoted = data.downvotedBy?.includes(userId);

    if (isDownvoted) {
        // Remove downvote
        await updateDoc(commentRef, {
            votes: increment(1),
            downvotedBy: arrayRemove(userId)
        });
    } else {
        // Add downvote
        await updateDoc(commentRef, {
            votes: increment(isUpvoted ? -2 : -1),
            downvotedBy: arrayUnion(userId),
            upvotedBy: arrayRemove(userId)
        });
    }
};
