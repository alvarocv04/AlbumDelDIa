import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const NavLink = ({ to, children, active }: { to: string; children?: React.ReactNode; active: boolean }) => (
    <Link 
        to={to} 
        className={`text-sm font-medium leading-normal transition-colors ${active ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'}`}
    >
        {children}
    </Link>
);

const Header: React.FC = () => {
    const location = useLocation();
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'es' : 'en');
    };

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark/95 backdrop-blur-md px-4 sm:px-10 py-3">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-4 dark:text-white text-slate-900">
                    <div className="size-8 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px]">album</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">albumaldia</h2>
                </Link>
                <nav className="hidden md:flex items-center gap-9">
                    <NavLink to="/" active={location.pathname === '/'}>{t('nav.home')}</NavLink>
                    <NavLink to="/friends" active={location.pathname === '/friends'}>{t('nav.friends')}</NavLink>
                    <NavLink to="/recommendations" active={location.pathname === '/recommendations'}>{t('nav.recommendations')}</NavLink>
                    <NavLink to="/details" active={location.pathname === '/details'}>{t('nav.library')}</NavLink>
                    <NavLink to="/summary" active={location.pathname === '/summary'}>{t('nav.wrapped')}</NavLink>
                </nav>
            </div>
            <div className="flex items-center justify-end gap-4 sm:gap-8">
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-border-dark transition-colors"
                >
                    {language.toUpperCase()}
                </button>
                <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64 relative group">
                    <div className="flex w-full flex-1 items-stretch rounded-full h-full border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark group-focus-within:border-primary transition-colors overflow-hidden">
                        <div className="text-slate-400 flex items-center justify-center pl-4">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-slate-900 dark:text-white focus:outline-0 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal border-none focus:ring-0 h-full" placeholder={t('search.placeholder')}/>
                    </div>
                </label>
                <Link to="/profile" className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer" data-alt="User profile picture placeholder" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCHArSSTfJSIcGf7QdNbMJihyEyltpS_FUOTMc8e2qFiY7ZLGiR4P4-QtZ8H1o7R0EJ7gWw1l4ID9IYd2ngubAzKxrXMq59p9Odk5XVaMwbUpMVlGJK3wrK0yLTLAoLTM4dh_JxsilE3bOSmSQjCexJEtKkzQFAjIfRpLpoFGy2Y1-EGF0KDyjteyDFaV3ZE-EOeHBxdeXnb9hFLRr7MoK996Rd6ro-rY-uInOtk_66Gpr-Xp6kpx_CIG47Y_yjby7A4qGG9FdY0m8")'}}></Link>
            </div>
        </header>
    );
};

export default Header;