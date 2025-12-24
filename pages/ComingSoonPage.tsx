import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ComingSoonPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const launchDate = new Date('2026-01-01T00:00:00');

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = launchDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'es' ? 'en' : 'es');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-dark via-[#0d1423] to-[#0a0f1a] flex flex-col items-center justify-center relative overflow-hidden py-20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Music Notes / Vinyl Records */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-accent-green/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Vinyl Record Animation */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 opacity-10">
                    <div className="w-full h-full rounded-full border-8 border-white/20 animate-spin-slow" style={{ animationDuration: '20s' }}>
                        <div className="absolute inset-1/3 rounded-full bg-white/10" />
                    </div>
                </div>
                <div className="absolute -top-32 -right-32 w-96 h-96 opacity-5">
                    <div className="w-full h-full rounded-full border-8 border-white/20 animate-spin-slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }}>
                        <div className="absolute inset-1/3 rounded-full bg-white/10" />
                    </div>
                </div>
            </div>

            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-lg">language</span>
                {language === 'es' ? 'EN' : 'ES'}
            </button>

            {/* Main Content */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                {/* Logo / Brand */}
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary via-purple-600 to-pink-500 mb-6 shadow-2xl shadow-primary/30">
                        <span className="material-symbols-outlined text-5xl text-white">album</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 mb-2">
                        AlbumDelDía
                    </h1>
                    <p className="text-xl md:text-2xl text-primary font-semibold tracking-wide">
                        {t('coming_soon.tagline')}
                    </p>
                </div>

                {/* Description */}
                <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        {t('coming_soon.description')}
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <h2 className="text-sm uppercase tracking-widest text-text-secondary mb-6 font-semibold">
                        {t('coming_soon.launching_in')}
                    </h2>
                    <div className="flex justify-center gap-3 md:gap-6">
                        {[
                            { value: timeLeft.days, label: t('coming_soon.days') },
                            { value: timeLeft.hours, label: t('coming_soon.hours') },
                            { value: timeLeft.minutes, label: t('coming_soon.minutes') },
                            { value: timeLeft.seconds, label: t('coming_soon.seconds') }
                        ].map((item, index) => (
                            <div
                                key={item.label}
                                className="flex flex-col items-center"
                                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                            >
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-surface-dark to-card-dark border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl">
                                    <span className="text-2xl md:text-4xl font-black text-white tabular-nums">
                                        {String(item.value).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-xs md:text-sm text-text-secondary mt-2 uppercase tracking-wider font-medium">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Launch Date */}
                <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-primary">calendar_today</span>
                        <span className="text-white font-semibold">
                            {t('coming_soon.launch_date')}
                        </span>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                    {[
                        { icon: 'album', titleKey: 'coming_soon.feature1_title', descKey: 'coming_soon.feature1_desc' },
                        { icon: 'group', titleKey: 'coming_soon.feature2_title', descKey: 'coming_soon.feature2_desc' },
                        { icon: 'emoji_events', titleKey: 'coming_soon.feature3_title', descKey: 'coming_soon.feature3_desc' }
                    ].map((feature, index) => (
                        <div
                            key={feature.icon}
                            className="p-6 rounded-2xl bg-gradient-to-br from-surface-dark/80 to-card-dark/80 border border-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mb-4 mx-auto group-hover:from-primary/30 group-hover:to-purple-600/30 transition-all duration-300">
                                <span className="material-symbols-outlined text-primary text-2xl">{feature.icon}</span>
                            </div>
                            <h3 className="text-white font-bold mb-2">{t(feature.titleKey)}</h3>
                            <p className="text-text-secondary text-sm">{t(feature.descKey)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-center text-text-secondary text-sm">
                <p>© 2026 AlbumDelDía. {t('coming_soon.rights_reserved')}</p>
            </div>
        </div>
    );
};

export default ComingSoonPage;
