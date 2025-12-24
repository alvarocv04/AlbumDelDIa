import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';

const FAQPage: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-20">
            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500 mb-4">
                        {t('faq.title')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        {t('faq.manual_title')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Manual Section */}

                    {/* Streak Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                                <span className="material-symbols-outlined text-[28px]">local_fire_department</span>
                            </div>
                            <h2 className="text-xl font-bold">{t('faq.streak_title')}</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {t('faq.streak_desc')}
                        </p>
                    </div>

                    {/* Calendar Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                                <span className="material-symbols-outlined text-[28px]">calendar_month</span>
                            </div>
                            <h2 className="text-xl font-bold">{t('faq.calendar_title')}</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {t('faq.calendar_desc')}
                        </p>
                    </div>

                    {/* Library Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors md:col-span-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-500">
                                <span className="material-symbols-outlined text-[28px]">library_music</span>
                            </div>
                            <h2 className="text-xl font-bold">{t('faq.library_title')}</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {t('faq.library_desc')}
                        </p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">help</span>
                        {t('faq.faq_title')}
                    </h2>

                    <div className="space-y-6">
                        <FAQItem question={t('faq.q1')} answer={t('faq.a1')} />
                        <FAQItem question={t('faq.q2')} answer={t('faq.a2')} />
                        <FAQItem question={t('faq.q3')} answer={t('faq.a3')} />
                        <FAQItem question={t('faq.q4')} answer={t('faq.a4')} />
                    </div>
                </div>
            </main>
        </div>
    );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    return (
        <div className="border-b border-slate-200 dark:border-border-dark pb-6 last:border-0">
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">{question}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{answer}</p>
        </div>
    );
};

export default FAQPage;
