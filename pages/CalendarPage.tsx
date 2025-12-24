import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { getDailyHistory } from '../services/albumService';
import { Album } from '../types';

const CalendarPage: React.FC = () => {
    const { t, language } = useLanguage();
    const [history, setHistory] = useState<Record<string, Album>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Calendar state
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getDailyHistory();
                // Convert array to record for faster lookup by YYYY-MM-DD
                const historyMap: Record<string, Album> = {};
                data.forEach(item => {
                    historyMap[item.date] = item.album;
                });
                setHistory(historyMap);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const monthName = useMemo(() => {
        return new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
            month: 'long',
            year: 'numeric'
        }).format(viewDate);
    }, [viewDate, language]);

    const daysInMonth = useMemo(() => {
        const date = new Date(currentYear, currentMonth + 1, 0);
        return date.getDate();
    }, [currentYear, currentMonth]);

    const firstDayOfMonth = useMemo(() => {
        const date = new Date(currentYear, currentMonth, 1);
        // getDay() returns 0 for Sunday, 1 for Monday, etc.
        // We want 0 for Monday to 6 for Sunday? Or standard 0-6?
        // Let's use 0 for Monday (standard European style)
        let day = date.getDay();
        return day === 0 ? 6 : day - 1;
    }, [currentYear, currentMonth]);

    const calendarDays = useMemo(() => {
        const days = [];
        // Fill previous month days (empty)
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // Fill current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, [firstDayOfMonth, daysInMonth]);

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentYear, currentMonth + direction, 1);
        setViewDate(newDate);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear;
    };

    const getAlbumForDay = (day: number) => {
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return history[dateString];
    };

    const weekDays = language === 'es'
        ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <Header />
            <main className="flex flex-col items-center flex-1 px-4 sm:px-10 py-6 sm:py-10 animate-fade-in">
                <div className="layout-content-container flex flex-col max-w-[1024px] w-full flex-1 gap-8">

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                                {t('calendar.title')}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                                {t('calendar.subtitle')}
                            </p>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-2 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span className="text-slate-900 dark:text-white font-bold min-w-[140px] text-center capitalize">
                                {monthName}
                            </span>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center w-full py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-border-dark shadow-xl overflow-hidden animate-fade-in">
                            {/* Calendar Grid Header */}
                            <div className="grid grid-cols-7 bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-border-dark">
                                {weekDays.map(day => (
                                    <div key={day} className="py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid Body */}
                            <div className="grid grid-cols-7">
                                {calendarDays.map((day, index) => {
                                    if (day === null) {
                                        return <div key={`empty-${index}`} className="aspect-square border-b border-r border-slate-100 dark:border-border-dark/30 bg-slate-50/30 dark:bg-transparent" />;
                                    }

                                    const album = getAlbumForDay(day);
                                    const isCurrentDay = isToday(day);

                                    return (
                                        <div
                                            key={day}
                                            className={`relative aspect-square border-b border-r border-slate-100 dark:border-border-dark/50 group transition-all duration-300 ${album ? 'hover:bg-primary/5' : ''
                                                }`}
                                        >
                                            {/* Day Number */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <span className={`flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full transition-colors ${isCurrentDay
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
                                                    }`}>
                                                    {day}
                                                </span>
                                            </div>

                                            {/* Album Content */}
                                            {album ? (
                                                <Link
                                                    to={`/album/${album.spotifyId}`}
                                                    className="absolute inset-0 p-1 pt-8 sm:p-2 sm:pt-10 flex flex-col items-center justify-center animate-zoom-in"
                                                >
                                                    <div className="relative w-full h-full max-w-[80px] max-h-[80px] aspect-square rounded-lg sm:rounded-xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                                        <img
                                                            src={album.coverUrl}
                                                            alt={album.title}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                            <div className="bg-white/90 dark:bg-primary/90 text-primary dark:text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                                                                <span className="material-symbols-outlined text-[20px] filled">play_arrow</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:block mt-2 w-full px-2">
                                                        <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate text-center">
                                                            {album.title}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
                                                    <span className="material-symbols-outlined text-4xl text-slate-400">music_note</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .layout-content-container {
                    max-width: 1024px;
                }
                @media (min-width: 640px) {
                    .calendar-grid-cell {
                        min-height: 120px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CalendarPage;

