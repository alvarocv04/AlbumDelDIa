import React from 'react';
import { Badge, UserBadge } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BadgeListProps {
    allBadges: Badge[];
    userBadges: UserBadge[];
}

const BadgeList: React.FC<BadgeListProps> = ({ allBadges, userBadges }) => {
    const { language } = useLanguage();
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {allBadges.map(badge => {
                const isEarned = earnedBadgeIds.has(badge.id);
                const name = language === 'es' ? (badge.name_es || badge.name) : (badge.name_en || badge.name);
                const description = language === 'es' ? (badge.description_es || badge.description) : (badge.description_en || badge.description);

                return (
                    <div
                        key={badge.id}
                        className={`
                            relative p-5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-500
                            ${isEarned
                                ? 'bg-white dark:bg-surface-dark border-purple-500/30 shadow-xl shadow-purple-500/5'
                                : 'bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-60 grayscale'
                            }
                        `}
                    >
                        {isEarned && (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none"></div>
                        )}

                        <div className={`text-5xl mb-3 relative z-10 transition-transform duration-500 ${isEarned ? 'animate-bounce-slow drop-shadow-md' : 'opacity-50'}`}>
                            {badge.icon}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 relative z-10 tracking-tight">{name}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight relative z-10 line-clamp-2">{description}</p>

                        {isEarned && (
                            <div className="absolute top-3 right-3 text-purple-500 z-10 animate-scale-in">
                                <span className="material-symbols-outlined text-lg filled">verified</span>
                            </div>
                        )}

                        {!isEarned && (
                            <div className="absolute inset-0 bg-slate-200/5 dark:bg-black/10 rounded-2xl pointer-events-none" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeList;
