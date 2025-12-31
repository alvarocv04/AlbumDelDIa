import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { addComment, getComments, deleteComment, upvoteComment, downvoteComment, addReply, getReplies } from '../services/commentService';
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

    // Reply states
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replies, setReplies] = useState<Record<string, Comment[]>>({});
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
    const [submittingReply, setSubmittingReply] = useState(false);

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

    const handleVote = async (commentId: string, type: 'up' | 'down') => {
        if (!user) return;

        // Optimistic update
        setComments(current => current.map(c => {
            if (c.id === commentId) {
                const isUp = c.upvotedBy?.includes(user.uid);
                const isDown = c.downvotedBy?.includes(user.uid);
                let newVotes = c.votes;
                let newUp = [...(c.upvotedBy || [])];
                let newDown = [...(c.downvotedBy || [])];

                if (type === 'up') {
                    if (isUp) {
                        newVotes--;
                        newUp = newUp.filter(id => id !== user.uid);
                    } else {
                        newVotes += isDown ? 2 : 1;
                        newUp.push(user.uid);
                        newDown = newDown.filter(id => id !== user.uid);
                    }
                } else {
                    if (isDown) {
                        newVotes++;
                        newDown = newDown.filter(id => id !== user.uid);
                    } else {
                        newVotes += isUp ? -2 : -1;
                        newDown.push(user.uid);
                        newUp = newUp.filter(id => id !== user.uid);
                    }
                }
                return { ...c, votes: newVotes, upvotedBy: newUp, downvotedBy: newDown };
            }
            return c;
        }));

        // Also update replies if needed
        setReplies(current => {
            const next = { ...current };
            let changed = false;
            Object.keys(next).forEach(parentId => {
                next[parentId] = next[parentId].map(c => {
                    if (c.id === commentId) {
                        changed = true;
                        const isUp = c.upvotedBy?.includes(user.uid!);
                        const isDown = c.downvotedBy?.includes(user.uid!);
                        let newVotes = c.votes;
                        let newUp = [...(c.upvotedBy || [])];
                        let newDown = [...(c.downvotedBy || [])];

                        if (type === 'up') {
                            if (isUp) {
                                newVotes--;
                                newUp = newUp.filter(id => id !== user.uid);
                            } else {
                                newVotes += isDown ? 2 : 1;
                                newUp.push(user.uid!);
                                newDown = newDown.filter(id => id !== user.uid);
                            }
                        } else {
                            if (isDown) {
                                newVotes++;
                                newDown = newDown.filter(id => id !== user.uid);
                            } else {
                                newVotes += isUp ? -2 : -1;
                                newDown.push(user.uid!);
                                newUp = newUp.filter(id => id !== user.uid);
                            }
                        }
                        return { ...c, votes: newVotes, upvotedBy: newUp, downvotedBy: newDown };
                    }
                    return c;
                });
            });
            return changed ? next : current;
        });

        try {
            if (type === 'up') await upvoteComment(commentId, user.uid);
            else await downvoteComment(commentId, user.uid);
        } catch (error) {
            console.error('Error voting:', error);
            fetchComments(); // Revert on error
        }
    };

    const handleReplySubmit = async (parentId: string) => {
        if (!replyContent.trim() || !user) return;

        setSubmittingReply(true);
        try {
            const addedReply = await addReply(parentId, albumId, replyContent, user);

            setReplies(prev => ({
                ...prev,
                [parentId]: [...(prev[parentId] || []), addedReply]
            }));

            // Increment reply count on parent
            setComments(current => current.map(c =>
                c.id === parentId
                    ? { ...c, replyCount: (c.replyCount || 0) + 1 }
                    : c
            ));

            setReplyContent('');
            setReplyingTo(null);
            setExpandedReplies(prev => new Set(prev).add(parentId));
        } catch (error) {
            console.error('Error adding reply:', error);
        } finally {
            setSubmittingReply(false);
        }
    };

    const toggleReplies = async (commentId: string) => {
        const isExpanded = expandedReplies.has(commentId);

        if (isExpanded) {
            const newExpanded = new Set(expandedReplies);
            newExpanded.delete(commentId);
            setExpandedReplies(newExpanded);
        } else {
            const newExpanded = new Set(expandedReplies);
            newExpanded.add(commentId);
            setExpandedReplies(newExpanded);

            if (!replies[commentId]) {
                setLoadingReplies(prev => new Set(prev).add(commentId));
                try {
                    const fetchedReplies = await getReplies(commentId);
                    setReplies(prev => ({ ...prev, [commentId]: fetchedReplies }));
                } catch (error) {
                    console.error('Error fetching replies:', error);
                } finally {
                    setLoadingReplies(prev => {
                        const next = new Set(prev);
                        next.delete(commentId);
                        return next;
                    });
                }
            }
        }
    };

    const handleDelete = async (commentId: string, parentId?: string) => {
        if (!confirm(t('comments.delete_confirm'))) return;
        try {
            await deleteComment(commentId);
            if (parentId) {
                setReplies(prev => ({
                    ...prev,
                    [parentId]: prev[parentId].filter(c => c.id !== commentId)
                }));
                // Decrement reply count
                setComments(current => current.map(c =>
                    c.id === parentId
                        ? { ...c, replyCount: Math.max(0, (c.replyCount || 0) - 1) }
                        : c
                ));
            } else {
                setComments(comments.filter(c => c.id !== commentId));
            }
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

    const renderComment = (comment: Comment, isReply = false) => {
        const isUpvoted = user && comment.upvotedBy?.includes(user.uid);
        const isDownvoted = user && comment.downvotedBy?.includes(user.uid);

        return (
            <div key={comment.id} className={`flex gap-4 animate-fade-in text-left ${isReply ? 'mt-4' : ''}`}>
                <div className="flex-shrink-0">
                    <img
                        src={comment.userPhotoURL || DEFAULT_PROFILE_PIC}
                        alt={comment.username}
                        className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover ring-2 ring-white dark:ring-white/10 shadow-sm`}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_PROFILE_PIC;
                        }}
                    />
                </div>

                <div className="flex-grow min-w-0">
                    <div className={`bg-slate-50 dark:bg-[#1a1f29] rounded-2xl rounded-tl-sm p-4 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm relative ${isReply ? 'bg-slate-100/50 dark:bg-[#1f242e]' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${isReply ? 'text-xs' : 'text-sm'} text-slate-900 dark:text-white`}>{comment.username}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatDate(comment.createdAt)}
                                </span>
                            </div>
                            {(user && (user.uid === comment.userId || user.email === 'alvarocv04@gmail.com')) && (
                                <button
                                    onClick={() => handleDelete(comment.id, comment.parentId)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                    title={t('comments.delete_tooltip')}
                                >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap word-break-all">{comment.content}</p>

                        {/* Vote Actions */}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 rounded-full p-1 pl-2 pr-2">
                                <button
                                    onClick={() => handleVote(comment.id, 'up')}
                                    className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${isUpvoted ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${isUpvoted ? 'filled' : ''}`}>thumb_up</span>
                                </button>
                                <span className={`text-xs font-bold min-w-[20px] text-center ${isUpvoted || isDownvoted ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {comment.votes || 0}
                                </span>
                                <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>
                                <button
                                    onClick={() => handleVote(comment.id, 'down')}
                                    className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${isDownvoted ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${isDownvoted ? 'filled' : ''}`}>thumb_down</span>
                                </button>
                            </div>

                            {!isReply && user && (
                                <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                >
                                    {t('comments.reply')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && !isReply && (
                        <div className="mt-4 flex gap-3 ml-4 animate-fade-in">
                            <img
                                src={user?.photoURL || DEFAULT_PROFILE_PIC}
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-grow">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={t('comments.placeholder')}
                                    className="w-full bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl p-3 min-h-[80px] text-sm focus:ring-2 focus:ring-primary/50"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setReplyContent('');
                                        }}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                        {t('comments.cancel')}
                                    </button>
                                    <button
                                        onClick={() => handleReplySubmit(comment.id)}
                                        disabled={!replyContent.trim() || submittingReply}
                                        className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg disabled:opacity-50"
                                    >
                                        {submittingReply ? t('comments.posting') : t('comments.post')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Replies List */}
                    {!isReply && (comment.replyCount || 0) > 0 && (
                        <div className="mt-2 ml-4">
                            <button
                                onClick={() => toggleReplies(comment.id)}
                                className="flex items-center gap-2 text-primary text-sm font-bold hover:bg-primary/5 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {expandedReplies.has(comment.id) ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                </span>
                                {expandedReplies.has(comment.id)
                                    ? t('comments.hide_replies')
                                    : t('comments.view_replies').replace('{count}', (comment.replyCount || 0).toString())}
                            </button>

                            {expandedReplies.has(comment.id) && (
                                <div className="mt-4 space-y-4 border-l-2 border-slate-100 dark:border-white/5 pl-4 ml-3">
                                    {loadingReplies.has(comment.id) ? (
                                        <div className="flex justify-center py-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        replies[comment.id]?.map(reply => renderComment(reply, true))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
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
                    comments.map(comment => renderComment(comment))
                )}
            </div>
        </div>
    );
};

export default CommentsSection;

