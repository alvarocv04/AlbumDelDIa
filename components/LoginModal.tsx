import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, message }) => {
    const { t } = useLanguage();
    const { login } = useAuth(); // Assuming login function triggers Google Sign-In

    if (!isOpen) return null;

    const handleLogin = async () => {
        try {
            await login();
            onClose();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-border-dark flex flex-col items-center p-8 text-center animate-zoom-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Icon */}
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined text-[40px]">lock</span>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {t('common.login_required')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    {message || t('common.login_required_desc')}
                </p>

                {/* Action */}
                <button
                    onClick={handleLogin}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md transform active:scale-[0.98]"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    <span>{t('profile.sign_in_google')}</span>
                </button>
            </div>
        </div>
    );
};

export default LoginModal;
