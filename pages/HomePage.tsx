import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
    const { t } = useLanguage();
    
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <Header />
            <main className="flex flex-col items-center flex-1 px-4 sm:px-10 py-6 sm:py-10 animate-fade-in">
                <div className="layout-content-container flex flex-col max-w-[1024px] w-full flex-1 gap-8">
                    {/* Hero Section */}
                    <section className="@container w-full">
                        <div className="relative overflow-hidden rounded-xl bg-surface-dark dark:bg-surface-dark border border-slate-200 dark:border-border-dark">
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none blur-3xl" style={{background: "radial-gradient(circle at 70% 30%, #135bec 0%, transparent 60%)"}}></div>
                            <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-10 @[864px]:flex-row items-center sm:items-start">
                                <div className="group relative w-full sm:max-w-[400px] aspect-square rounded-lg overflow-hidden shadow-2xl shadow-black/50 transition-transform hover:scale-[1.01]">
                                    <div className="w-full h-full bg-center bg-no-repeat bg-cover" data-alt="Abstract colorful album cover art" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDkePu4aWds-i7zf-xGoXrZtbjeCr7xtY2gmnofYrVS9laeU2ZzeRoupAkZk3cu11LyDhYdNmFS26oj1-UfljHjPelu3Bk6rAKk9gG362X7mFCxky6ZUoxrh1As9E4cV6vnBU7LLAJNI2Ya1zaFCsvCJuD2NdsS1mRvbIhqPxAQsYwsyOtFOaMwOlA1XqblNvqhMJiOW3wvMJRRC-BeejjsrDGEd6LBuazCFxyj8nKQ4jl1bk79H6n7wd29Te4bvyCBLN5OwOw86lg")'}}></div>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                    <Link to="/album/1" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-primary text-white rounded-full p-4 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                            <span className="material-symbols-outlined text-[48px] fill-1">play_arrow</span>
                                        </div>
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-6 w-full @[864px]:justify-center @[864px]:py-4">
                                    <div className="flex flex-col gap-1 text-left">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">{t('home.album_of_day')}</span>
                                            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium">Ambient / Electronic</span>
                                        </div>
                                        <h1 className="text-slate-900 dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-tight">Solar Echoes</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl font-medium mt-1">by <span className="text-slate-900 dark:text-white hover:underline cursor-pointer">The Starlight Collective</span></p>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mt-4 max-w-xl">Experience the new ambient masterpiece. Deep, resonant, and conscious. Join 1,240 others listening today.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <Link to="/album/1" className="flex items-center justify-center gap-2 h-12 px-6 bg-primary hover:bg-blue-600 text-white rounded-full font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform active:scale-95">
                                            <span className="material-symbols-outlined">play_circle</span>
                                            <span>{t('home.start_listening')}</span>
                                        </Link>
                                        <button className="flex items-center justify-center gap-2 h-12 px-6 bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full font-medium transition-all">
                                            <span className="material-symbols-outlined">bookmark_add</span>
                                            <span>{t('home.save_later')}</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-border-dark">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7Exwx_9u02YZubiZt4ohBx8FJFUeNOcVibGUvOMbE0h071cMTh0EOvEN1CEnPagb8T4bmThTsrZtCcYCeQ-pG2TAq7w2IPZym9tfAdwKRP-PG2l1iYYcrPCmCzqP-jghzG9akkMlbl6u56NSXz4GqMEJ_2aNxQNZkOw-ENuV-kRyLokkYxlNLrRMNH-IULIr7s1soVFDt-oqalAnywihNJkS0NffuZ88ycuka29zk75hLPIMVRkTogNP6ugn5L8yIgw0NODqvRAc")'}}></div>
                                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCCm08ya0GWF-MTd0MheL4nSWR2_Zg2Z0CDhHZi99YdnvcjUA2cMWnehmDi3N9MxlD-RxOf5a8l5jF28nj6bKcTRgoRycVF0MMILld-zM60JCKZ3zv3-gmrisst5gwhNqXWzUVmJn-VJ6DQQOekStgvXqhT9bj1zGfvFEm1afH2u78ih6hf3llH99rG-4i-LqlWbSYKGnqFzhyyHlMrCNLgeCqly8fxP9DV8ZE2JVjnW9lF_giErNhx6zUhl46AbSKgLAu6fZ_5oHY")'}}></div>
                                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAXAbqt69t-eCFt5aLWjLwDGi2JPqvLFLm_-ucHujp8JyJJtNOFW89URmmgpP1zbSF7Eq39aOVtMn7TTOCgVlOGq4mkvDL0ozAwz7aQr0WLk2mSIY8dHH7rHCr92rRHADPfGW5FnqnKn7q92xijcWiia5CVsOZPQxpvkbgIBZUuJpoIiZB7GSosFaus1xrrwze1vujh8GnRYQGkN2v6zPFCZ89Iuo-R9lMcOk1WGm2xBp19cqlPfWnl--vBJDkyxbDjjD5US--ccGg")'}}></div>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-white">Sarah</span> {t('home.vibing')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats */}
                        <section className="lg:col-span-2 flex flex-col gap-4">
                            <div className="flex items-center justify-between pb-2">
                                <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">equalizer</span>
                                    {t('home.your_vibe')}
                                </h2>
                                <Link to="/summary" className="text-sm font-medium text-primary hover:text-blue-400">{t('home.view_history')}</Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="size-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500"><span className="material-symbols-outlined fill-1">local_fire_department</span></div>
                                        <span className="text-xs font-bold bg-green-500/20 text-green-500 px-2 py-1 rounded-md">+2 today</span>
                                    </div>
                                    <div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('home.streak')}</p><p className="text-slate-900 dark:text-white text-3xl font-black mt-1">14 {t('home.days')}</p></div>
                                </div>
                                <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500"><span className="material-symbols-outlined">schedule</span></div>
                                    </div>
                                    <div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('home.total_minutes')}</p><p className="text-slate-900 dark:text-white text-3xl font-black mt-1">1,240</p></div>
                                </div>
                                <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><span className="material-symbols-outlined">military_tech</span></div>
                                    </div>
                                    <div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('home.badges_earned')}</p><p className="text-slate-900 dark:text-white text-3xl font-black mt-1">8</p></div>
                                </div>
                            </div>
                            {/* Chart */}
                            <div className="mt-4 p-6 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">{t('home.listening_activity')}</h3>
                                <div className="flex items-end justify-between gap-2 h-32 w-full px-2">
                                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-md h-[40%] hover:bg-primary/60 transition-colors relative group"></div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-md h-[65%] hover:bg-primary/60 transition-colors relative group"></div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-md h-[50%] hover:bg-primary/60 transition-colors relative group"></div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-md h-[80%] hover:bg-primary/60 transition-colors relative group"></div>
                                    <div className="w-full bg-primary rounded-t-md h-[95%] shadow-[0_0_10px_rgba(19,91,236,0.5)] relative group"></div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-md h-[30%] hover:bg-primary/60 transition-colors relative group"></div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-md h-[45%] hover:bg-primary/60 transition-colors relative group"></div>
                                </div>
                            </div>
                        </section>

                        {/* Sidebar */}
                        <aside className="flex flex-col gap-6">
                            <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{t('home.recent_badges')}</h2>
                                    <span className="material-symbols-outlined text-yellow-500">stars</span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="size-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">album</span></div>
                                        <div className="flex flex-col"><span className="text-slate-900 dark:text-white font-bold text-sm">Vinyl Head</span><span className="text-slate-500 dark:text-slate-400 text-xs">Listened to 5 complete albums</span></div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="size-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">waves</span></div>
                                        <div className="flex flex-col"><span className="text-slate-900 dark:text-white font-bold text-sm">Deep Diver</span><span className="text-slate-500 dark:text-slate-400 text-xs">1 hour of ambient music</span></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-black/20 text-center"><Link to="/profile" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">{t('home.explore_more')}</Link></div>
                            </div>
                            
                            <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-5 gap-4">
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold">{t('home.recommended')}</h3>
                                <div className="flex gap-3">
                                    <Link to="/album/2" className="w-1/3 aspect-square bg-slate-800 rounded-lg bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpeQyK1bnwB11OwTeEL7iwPjLJvB0iJPJiFOnjlyaM3SerrxwmGrjd27VJX3t2d8Jn8Jp-7GZcsyuoQVli8Dd9E3polanmV9eKId6_3s5J9poH7MBwwbAXj_0oR3o7nofbWQhWQkr5TjOn08ppAsJ9gjWk-WMqqT-ZY30x5nQoBAoaCAH26zszX28OFr4eDAoGWN_76C5ZdyFCMoHfwVQiZmFpFWheHKCVO6fJtkabB3K_TfGkH65PPCrQi3101OgdITTUYbJ3Ijc")'}}></Link>
                                    <Link to="/album/3" className="w-1/3 aspect-square bg-slate-800 rounded-lg bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBvY661MMocomTfvMYE9fvNCiWdzUoBSnGeZUk2zhjFCQcYAsYjYqnF-XI8CoHaCKV8s0r_3GK2jCN-v2WvBX3KeLxHdqorHJGk9HhGnnXb6yWAqhYNYy5dNobRrOBn2tKH6chR_VF4EQacAjbfJnO1uzdMlv98HfyaoFXjsdnmTxq-Yqpd08G0t5c2IxhEs3ul0W4vIrAIQvUqQiqVn46AoUiqUW3ZCSszYdyelUtmoSVGpj7cVRTC4prynQqthlq3j5wuLGltKIY")'}}></Link>
                                    <Link to="/album/4" className="w-1/3 aspect-square bg-slate-800 rounded-lg bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC6QbkRXThCwo3fq6RHAUU8DYnry4N3nyIXZOuBThH7lHxhNG_qM1kPuW0JKgF5z9uPoxkPsAo3uG2KYl0aQIk70yfYqrfpljROPkj8GCTpNsknrtrEiVqqA2N782c5_6DjYruQOMbolIPc1srWe1qBrc1dNx5BTerm3rATi3ucNNQ4NovaNQyBKTQtHPSLLi7-NKJ-3rPQ39hFdP7nFCJaCIEbbkFfbPf5JXIlr8dxLEWYr5UGKNfrIvmr89Fp8gzl_DHpRxaEb7I")'}}></Link>
                                </div>
                                <Link to="/recommendations" className="w-full mt-1 py-2 rounded-lg border border-slate-200 dark:border-border-dark text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white flex items-center justify-center">{t('home.explore_more')}</Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;