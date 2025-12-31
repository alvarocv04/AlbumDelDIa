import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Badge } from '../types';
import { useLanguage } from './LanguageContext';

interface Notification {
    id: string;
    badge: Badge;
}

interface NotificationContextType {
    showBadgeNotification: (badge: Badge) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { t, language } = useLanguage();

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showBadgeNotification = useCallback((badge: Badge) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications(prev => [...prev, { id, badge }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ showBadgeNotification }}>
            {children}
            {/* Notification Portal / Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
                {notifications.map((notification) => {
                    const badge = notification.badge;
                    const name = language === 'es' ? (badge.name_es || badge.name) : (badge.name_en || badge.name);

                    return (
                        <div
                            key={notification.id}
                            className="pointer-events-auto flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-in-right overflow-hidden relative group max-w-sm"
                        >
                            {/* Animated Background Pulse */}
                            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse"></div>

                            {/* Badge Icon */}
                            <div className="relative z-10 size-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                {badge.icon}
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col">
                                <span className="text-primary font-black text-xs uppercase tracking-widest">{t('notification.badge_unlocked')}</span>
                                <span className="text-slate-900 dark:text-white font-bold text-base mt-1 leading-tight">{name}</span>
                                <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t('notification.congratulations')}</span>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>

                            {/* Progress Bar (5s) */}
                            <div className="absolute bottom-0 left-0 h-1 bg-primary animate-progress-shrink"></div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes progress-shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-progress-shrink {
                    animation: progress-shrink 5s linear forwards;
                }
            `}</style>
        </NotificationContext.Provider>
    );
};
