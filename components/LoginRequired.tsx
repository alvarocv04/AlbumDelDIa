import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface LoginRequiredProps {
    titleKey: string;
    descriptionKey: string;
}

const LoginRequired: React.FC<LoginRequiredProps> = ({ titleKey, descriptionKey }) => {
    const { t } = useLanguage();
    const { login } = useAuth();

    return (
        <div className="flex-grow flex flex-col items-center justify-center gap-6 p-4 text-center animate-fade-in">
            <div className="size-24 rounded-full bg-slate-100 dark:bg-surface-dark flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">account_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t(titleKey)}</h2>
            <p className="max-w-md text-slate-600 dark:text-slate-400">{t(descriptionKey)}</p>
            <button
                onClick={login}
                className="flex items-center gap-3 px-8 py-3 bg-white dark:bg-white text-slate-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 border border-slate-200 dark:border-transparent mt-2"
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                {t('profile.sign_in_google')}
            </button>
        </div>
    );
};

export default LoginRequired;
