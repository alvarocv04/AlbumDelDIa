import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';

const RecommendationsPage: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden">
            <Header />
            <div className="flex flex-1 h-full relative">
                <aside className="w-80 hidden lg:flex flex-col border-r border-border-dark bg-surface-dark/30 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto custom-scrollbar">
                    <div className="p-6 pb-2">
                        <h3 className="text-white tracking-tight text-xl font-bold leading-tight mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-primary">tune</span> {t('rec.mixing_console')}</h3>
                        <p className="text-[#9da6b9] text-sm">{t('rec.fine_tune')}</p>
                    </div>
                    
                    <div className="p-6 space-y-6 border-t border-border-dark/50">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-0.5"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#9da6b9] text-[18px]">public</span><p className="text-white text-sm font-semibold">{t('rec.global_sounds')}</p></div></div>
                            <label className="relative flex h-[24px] w-[44px] cursor-pointer items-center rounded-full border-none bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200"><div className="h-[20px] w-[20px] rounded-full bg-white shadow-sm"></div><input defaultChecked className="invisible absolute" type="checkbox"/></label>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-0.5"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#9da6b9] text-[18px]">diamond</span><p className="text-white text-sm font-semibold">{t('rec.deep_cuts')}</p></div></div>
                            <label className="relative flex h-[24px] w-[44px] cursor-pointer items-center rounded-full border-none bg-[#282e39] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-primary transition-colors duration-200"><div className="h-[20px] w-[20px] rounded-full bg-white shadow-sm"></div><input defaultChecked className="invisible absolute" type="checkbox"/></label>
                        </div>
                    </div>
                    <div className="px-6 pb-6 border-t border-border-dark/50 pt-6 mt-auto">
                        <button className="w-full mt-6 bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px] animate-spin-slow">refresh</span> {t('rec.refresh_feed')}
                        </button>
                    </div>
                </aside>
                <main className="flex-1 p-4 md:p-8 lg:p-10 min-w-0 animate-fade-in">
                        <div className="mb-10">
                        <div className="flex flex-col gap-3 max-w-2xl">
                            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">{t('rec.tune_discovery')}</h1>
                            <p className="text-[#9da6b9] text-lg font-normal leading-normal">{t('rec.exploring')} <span className="text-white font-semibold">{t('rec.global_sounds')}</span> {t('rec.and')} <span className="text-white font-semibold">{t('rec.deep_cuts')}</span>.</p>
                        </div>
                    </div>
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary">verified</span>
                            <h2 className="text-white text-2xl font-bold">{t('rec.top_pick')}</h2>
                        </div>
                        <div className="relative group rounded-2xl overflow-hidden bg-surface-dark border border-border-dark hover:border-primary/50 transition-colors">
                            <div className="flex flex-col md:flex-row">
                                <Link to="/album/3" className="w-full md:w-1/2 lg:w-2/5 aspect-square md:aspect-auto relative min-h-[300px]">
                                    <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYPm0tlOojMHaUj8qdyk1U6EPajPSlOEOmiz9816fb1nGSEEHSBdqVfdUp7904BKMQsWsHvIsc1cBzeZJXViOQpBhLQTPNKj3cXwTzOpRyf0aujR4p05fE4WyvZcKWROKK-Wc9dS0FdpOdHq94XgAmXyz0Mjaas6YZKRUzRysGE0vW6mHRDzAPmHswcASDaoq9EDZd_KoGVBDkaCnH_-DXIGxvEcRiY0bIXvbD5JtNJ8Du_e6pNPRXHsUlbrJsvxTzUldqshMMtQs")'}}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark md:bg-gradient-to-r md:from-transparent md:to-surface-dark"></div>
                                </Link>
                                <div className="flex flex-col justify-center p-6 md:p-10 w-full md:w-1/2 lg:w-3/5 gap-4">
                                    <div className="inline-flex items-center self-start px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                                        <span className="material-symbols-outlined text-[14px] mr-1">auto_awesome</span> 98% {t('rec.match')}
                                    </div>
                                    <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight">Neon Horizons</h3>
                                    <div className="flex items-center gap-2 text-[#9da6b9]">
                                        <span className="font-medium text-white text-lg">Solar Fields</span>
                                        <span>•</span><span>2023</span><span>•</span><span>Electronic / Ambient</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <Link to="/album/3" className="bg-white text-background-dark hover:bg-gray-200 font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-colors"><span className="material-symbols-outlined fill-1">play_arrow</span> {t('rec.play_now')}</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="mb-12">
                        <div className="flex items-end justify-between mb-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-400">explore</span><h2 className="text-white text-2xl font-bold">{t('rec.expanding_horizons')}</h2></div>
                                <p className="text-[#9da6b9] text-sm">{t('rec.discover_sounds')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            <Link to="/album/2" className="group flex flex-col gap-3 cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#282e39]">
                                    <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAPpFKPb2vwHvDH-h3ziE_VsEabb5mnFN_Fia2E-EgWW8Gpkqscq_sSyrwBqgGmy7Kww5lmFaGBjnCJiIShYBwU6cwXU5Tmi4T3O9s1bKVT6Q9qSZVpTJNWRFW1NdotFD10usbDrvzNjyKmMowfHPR9Vmll7OjdwsmrsY37vPuQeIEQZfArk7kD-OvwkRAhAscol_nq2ZSXTUppOYk5rGGq4t7QQwjd946vHZEISACtXVxT7K1c-auuv4KwdsTqrldani5RjuhZRoA")'}}></div>
                                </div>
                                <div className="flex flex-col"><h4 className="text-white font-bold leading-tight truncate">Tokyo Drift</h4><p className="text-[#9da6b9] text-sm truncate">Teriyaki Boyz</p></div>
                            </Link>
                            <Link to="/album/6" className="group flex flex-col gap-3 cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#282e39]">
                                    <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCt0rU6Zgf7Uzao3mumZIxQJ199Ygn9-5RNKcoJ-m1HeX1SPMal5_ly6GW4Sam-oM8IfcFE7Amx4BySTxfggGowJWugT9arEYM9KfZuFKf_pjJR34KlHUq-utTkQwtpO2Rt8EGq-Cojg_gU4prJYw2NVw0jio5h4liEPlZ9A9utCIS0OnhvjFUPJiuvj-YY1_LusWPvk2b4ttq830WowyRRhGwp-GN0rCRBe77w76hPce4gQhaBHcYYH0o6mJcU_tAf1p-D4sAAG60")'}}></div>
                                </div>
                                <div className="flex flex-col"><h4 className="text-white font-bold leading-tight truncate">Afro Blue</h4><p className="text-[#9da6b9] text-sm truncate">Robert Glasper Experiment</p></div>
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default RecommendationsPage;