import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { addComment, getComments, deleteComment } from '../services/commentService';
import { DEFAULT_PROFILE_PIC } from '../services/userService';
import { Comment } from '../types';

interface CommentsSectionProps {
    albumId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ albumId }) => {
    const { dbUser: user } = useAuth();
    const { t } = useLanguage();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [albumId]);

    const fetchComments = async () => {
        try {
            const fetchedComments = await getComments(albumId);
            setComments(fetchedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setSubmitting(true);
        try {
            const addedComment = await addComment(albumId, newComment, user);
            setComments([addedComment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm(t('comments.delete_confirm'))) return;
        try {
            await deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('comments.just_now');
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t('comments.minutes_ago')}`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t('comments.hours_ago')}`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}${t('comments.days_ago')}`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="mt-12 w-full max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-2xl">forum</span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t('comments.title')} <span className="text-slate-500 text-lg font-normal">({comments.length})</span>
                </h3>
            </div>

            {user ? (
                <form onSubmit={handleSubmit} className="mb-12 bg-white dark:bg-[#1a1f29] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <img
                                src={user.photoURL || DEFAULT_PROFILE_PIC}
                                alt={user.username || 'User'}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = DEFAULT_PROFILE_PIC;
                                }}
                            />
                        </div>
                        <div className="flex-grow">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t('comments.placeholder')}
                                className="w-full bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 rounded-2xl p-6 min-h-[120px] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y text-base leading-relaxed"
                                rows={3}
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>{t('comments.posting')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('comments.post')}</span>
                                            <span className="material-symbols-outlined text-sm">send</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-10 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/10 border border-dashed border-slate-300 dark:border-white/10 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">lock</span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">{t('comments.join_conversation')}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t('comments.login_to_comment')}</p>
                </div>
            )}

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">chat_bubble_outline</span>
                        </div>
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{t('comments.no_comments')}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-1">{t('comments.be_first')}</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group flex gap-4 animate-fade-in text-left">
                            <div className="flex-shrink-0">
                                <img
                                    src={comment.userPhotoURL || DEFAULT_PROFILE_PIC}
                                    alt={comment.username}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-white/10 shadow-sm"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = DEFAULT_PROFILE_PIC;
                                    }}
                                />
                            </div>

                            <div className="flex-grow">
                                <div className="bg-slate-50 dark:bg-[#1a1f29] rounded-2xl rounded-tl-sm p-4 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.username}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        {(user && (user.uid === comment.userId || user.email === 'alvarocv04@gmail.com')) && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all absolute top-2 right-2"
                                                title={t('comments.delete_tooltip')}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentsSection;

