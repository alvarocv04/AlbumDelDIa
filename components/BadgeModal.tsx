import React from 'react';
import { Badge, UserBadge } from '../types';
import BadgeList from './BadgeList';
import { useLanguage } from '../contexts/LanguageContext';

interface BadgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    allBadges: Badge[];
    userBadges: UserBadge[];
}

const BadgeModal: React.FC<BadgeModalProps> = ({ isOpen, onClose, allBadges, userBadges }) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="relative w-full max-w-4xl bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-500 text-3xl">military_tech</span>
                            {t('badge.modal.title')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {t('badge.modal.subtitle')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <BadgeList allBadges={allBadges} userBadges={userBadges} />
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-border-dark text-center text-sm text-slate-500 dark:text-slate-400">
                    {t('badge.modal.earned')} <span className="font-bold text-primary">{userBadges.length}</span> {t('badge.modal.out_of')} <span className="font-bold">{allBadges.length}</span> {t('badge.modal.badges_suffix')}
                </div>
            </div>
        </div>
    );
};

export default BadgeModal;
