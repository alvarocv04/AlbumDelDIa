import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { DEFAULT_PROFILE_PIC } from '../services/userService';

const NavLink = ({ to, children, active }: { to: string; children?: React.ReactNode; active: boolean }) => (
    <Link
        to={to}
        className={`text-sm font-medium leading-normal transition-colors ${active ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'}`}
    >
        {children}
    </Link>
);

const UKFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="16">
        <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id="t">
            <path d="M30,15 h30 v15 z v-15 h-30 z h-30 v15 z v-15 h30 z" />
        </clipPath>
        <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
    </svg>
);

const SpainFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" width="24" height="16">
        <rect width="750" height="500" fill="#c60b1e" />
        <rect width="750" height="250" y="125" fill="#ffc400" />
    </svg>
);

const languages = [
    { code: 'en', flag: <UKFlag />, label: 'English' },
    { code: 'es', flag: <SpainFlag />, label: 'Español' }
];

const Header: React.FC = () => {
    const location = useLocation();
    const { language, setLanguage, t } = useLanguage();
    const { currentUser, logout, dbUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };

        if (isLangOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLangOpen]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <header className="sticky top-0 z-40 flex flex-col w-full border-b border-solid border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark/95 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 sm:px-10 py-3 w-full">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden flex items-center justify-center -ml-2 p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <Link to="/" className="flex items-center gap-4 dark:text-white text-slate-900">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[32px]">album</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">albumdeldia</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-9 ml-8">
                        <NavLink to="/" active={location.pathname === '/'}>{t('nav.home')}</NavLink>
                        <NavLink to="/friends" active={location.pathname === '/friends'}>{t('nav.community')}</NavLink>
                        <NavLink to="/details" active={location.pathname === '/details'}>{t('nav.library')}</NavLink>
                        <NavLink to="/summary" active={location.pathname === '/summary'}>{t('nav.wrapped')}</NavLink>
                    </nav>
                </div>
                <div className="flex items-center justify-end gap-2 sm:gap-4">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-border-dark transition-colors"
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-border-dark transition-colors"
                            title={t('header.select_language')}
                        >
                            {language === 'en' ? <UKFlag /> : <SpainFlag />}
                        </button>

                        {isLangOpen && (
                            <div className="absolute top-full right-0 mt-2 w-36 py-1 rounded-xl shadow-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col z-50 animate-zoom-in">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as 'en' | 'es');
                                            setIsLangOpen(false);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left hover:bg-slate-50 dark:hover:bg-white/5 ${language === lang.code
                                            ? 'text-primary font-bold bg-slate-50 dark:bg-white/5'
                                            : 'text-slate-700 dark:text-slate-200 font-medium'
                                            }`}
                                    >
                                        <span className="flex items-center justify-center">{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64 relative group">
                        <div className="flex w-full flex-1 items-stretch rounded-full h-full border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark group-focus-within:border-primary transition-colors overflow-hidden">
                            <div className="text-slate-400 flex items-center justify-center pl-4">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-slate-900 dark:text-white focus:outline-0 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal border-none focus:ring-0 h-full" placeholder={t('header.search_placeholder')} />
                        </div>
                    </label>
                    {currentUser && (
                        <button
                            onClick={logout}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title={t('header.logout')}
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    )}
                    <Link
                        to="/profile"
                        className="flex items-center justify-center rounded-full size-10 ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer overflow-hidden bg-slate-100 dark:bg-surface-dark"
                        title={dbUser?.username ? `@${dbUser.username}` : t('header.profile_tooltip')}
                    >
                        <img
                            src={dbUser?.photoURL || currentUser?.photoURL || DEFAULT_PROFILE_PIC}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_PROFILE_PIC;
                            }}
                        />
                    </Link>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden flex flex-col w-full border-t border-slate-200 dark:border-border-dark bg-background-light dark:bg-surface-dark animate-slide-down">
                    <nav className="flex flex-col p-4 gap-2">
                        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined">home</span>
                            {t('nav.home')}
                        </Link>
                        <Link to="/friends" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/friends' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined">group</span>
                            {t('nav.community')}
                        </Link>
                        <Link to="/details" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/details' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined">library_music</span>
                            {t('nav.library')}
                        </Link>
                        <Link to="/summary" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/summary' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined">bar_chart</span>
                            {t('nav.wrapped')}
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;