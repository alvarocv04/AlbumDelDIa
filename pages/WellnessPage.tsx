import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';

const WellnessPage: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden min-h-screen flex flex-col transition-colors duration-200">
            <Header />
            <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-40 animate-fade-in">
                <div className="max-w-[1024px] w-full flex flex-col gap-8">
                        <div className="flex flex-wrap gap-2 px-4">
                        <Link to="/" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors">{t('wellness.home')}</Link>
                        <span className="text-slate-400 text-sm font-medium">/</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium">{t('nav.wellness')}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-6 px-4">
                        <div className="flex max-w-[600px] flex-col gap-3">
                            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">{t('wellness.title')}</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-relaxed">{t('wellness.subtitle')}</p>
                        </div>
                        <div className="flex items-start">
                            <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined">play_arrow</span> {t('wellness.start_session')}
                            </button>
                        </div>
                    </div>
                    <section className="flex flex-col gap-4">
                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold px-4">{t('wellness.listening_modes')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                            <div className="group relative flex flex-col justify-between gap-4 rounded-xl border-2 border-primary bg-white dark:bg-card-dark p-6 shadow-xl shadow-blue-900/10 transition-transform hover:-translate-y-1">
                                <div className="absolute top-4 right-4 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></div>
                                <div>
                                    <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary"><span className="material-symbols-outlined text-[28px]">psychology</span></div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('wellness.focus_mode')}</h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t('wellness.focus_desc')}</p>
                                </div>
                            </div>
                            <div className="group flex flex-col justify-between gap-4 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-6 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg">
                                <div>
                                    <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 p-3 text-slate-900 dark:text-white group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors"><span className="material-symbols-outlined text-[28px]">bolt</span></div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">{t('wellness.energy_mode')}</h3>
                                </div>
                            </div>
                            <div className="group flex flex-col justify-between gap-4 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-6 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg">
                                <div>
                                    <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 p-3 text-slate-900 dark:text-white group-hover:bg-teal-500/10 group-hover:text-teal-500 transition-colors"><span className="material-symbols-outlined text-[28px]">spa</span></div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-500 transition-colors">{t('wellness.relaxation_mode')}</h3>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="flex flex-col gap-4">
                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold px-4 pt-4">{t('wellness.auditory_wellness')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                            <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-slate-400">volume_up</span><span className="text-sm font-bold text-slate-900 dark:text-white">{t('wellness.safe_volume')}</span></div>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/10 text-green-500">{t('wellness.optimal')}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-end justify-between mb-1"><span className="text-3xl font-bold text-slate-900 dark:text-white">72<span className="text-sm text-slate-500 font-medium ml-1">dB</span></span></div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex"><div className="h-full bg-green-500 w-[60%] rounded-l-full"></div><div className="h-full bg-yellow-400 w-[15%]"></div><div className="h-full bg-transparent w-[25%]"></div></div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-slate-400">timelapse</span><span className="text-sm font-bold text-slate-900 dark:text-white">{t('wellness.rest_timer')}</span></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input defaultChecked className="sr-only peer" type="checkbox"/><div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div></label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default WellnessPage;