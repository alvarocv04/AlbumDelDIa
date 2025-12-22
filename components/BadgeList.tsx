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
              relative p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300
              ${isEarned
                                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                : 'bg-white/5 border-white/10 opacity-60 grayscale'
                            }
            `}
                    >
                        <div className={`text-4xl mb-2 ${isEarned ? 'animate-bounce-slow' : ''}`}>
                            {badge.icon}
                        </div>
                        <h3 className="font-bold text-sm text-white mb-1">{name}</h3>
                        <p className="text-xs text-gray-400">{description}</p>

                        {isEarned && (
                            <div className="absolute top-2 right-2 text-yellow-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}

                        {!isEarned && (
                            <div className="absolute inset-0 bg-black/20 rounded-xl" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeList;
