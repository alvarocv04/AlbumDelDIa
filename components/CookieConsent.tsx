import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LegalDocuments from './LegalDocuments';

const CookieConsent: React.FC = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [showLegal, setShowLegal] = useState<'privacy' | null>(null);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (consent === null) {
            // Delay slightly for animation
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
        // Here you would typically initialize analytics
        // For now, we rely on the reload or just the consent storage
        // Ideally, trigger a window event or context update
        window.location.reload(); // Reload to activate GA if implemented to check storage
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
                <div className="max-w-4xl mx-auto bg-surface-dark/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-gray-300 text-sm md:text-base">
                            {t('cookie.message')}{' '}
                            <button
                                onClick={() => setShowLegal('privacy')}
                                className="text-primary hover:text-blue-400 underline underline-offset-2 transition-colors"
                            >
                                {t('cookie.learn_more')}
                            </button>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDecline}
                            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            {t('cookie.decline')}
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            {t('cookie.accept')}
                        </button>
                    </div>
                </div>
            </div>

            {showLegal && (
                <LegalDocuments
                    type={showLegal}
                    onClose={() => setShowLegal(null)}
                />
            )}
        </>
    );
};

export default CookieConsent;
