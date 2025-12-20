import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { LIBRARY_ALBUMS } from '../services/data';

const RatingComponent = ({ 
    icon, 
    colorClass, 
    value, 
    onChange 
}: { 
    icon: string, 
    colorClass: string, 
    value: number, 
    onChange: (val: number) => void 
}) => {
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="relative cursor-pointer group"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isHalf = (e.clientX - rect.left) < (rect.width / 2);
                        onChange(star - (isHalf ? 0.5 : 0));
                    }}
                >
                    <span className={`material-symbols-outlined text-[32px] transition-transform group-hover:scale-110 ${
                        value >= star 
                        ? `${colorClass} filled` 
                        : value >= star - 0.5 
                            ? `${colorClass}` // We'll use the 'star_half' or 'favorite' half trick if possible, but material symbols works best with separate icons or overlapping. 
                            : 'text-slate-300 dark:text-[#3f4756]'
                    }`}>
                        {value >= star ? icon : (value >= star - 0.5 && icon === 'star' ? 'star_half' : icon)}
                    </span>
                    {/* Overlay for half star click detection if needed, or simple click logic above */}
                </div>
            ))}
        </div>
    );
};

const AlbumPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLanguage();
    const album = LIBRARY_ALBUMS.find(a => a.id === Number(id)) || LIBRARY_ALBUMS[1]; // Default to Kendrick if not found or id 2

    const [personalRating, setPersonalRating] = useState(4.8);
    const [artisticRating, setArtisticRating] = useState(5.0);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
            <Header />
            <main className="flex-grow flex flex-col items-center w-full px-4 md:px-10 py-8 animate-fade-in">
                <div className="w-full max-w-6xl flex flex-col gap-10">
                    {/* Hero / Album Detail Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Album Art Column */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="relative group w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10">
                                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" style={{backgroundImage: `url('${album.cover}')`}}></div>
                                <div className="relative h-full w-full bg-cover bg-center" style={{backgroundImage: `url('${album.cover}')`}}>
                                    {/* Overlay Play Button */}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                        <button className="bg-primary text-white rounded-full p-4 hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-[48px] filled">play_circle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Quick Actions */}
                            <div className="flex flex-col gap-3">
                                <button className="w-full h-12 flex items-center justify-center gap-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined filled">play_arrow</span>
                                    {t('album.listen_spotify')}
                                </button>
                                <div className="flex gap-3">
                                    <button className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#282e39] text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-[#323946] transition-colors border border-slate-200 dark:border-transparent">
                                        <span className="material-symbols-outlined">ios_share</span>
                                        {t('album.share')}
                                    </button>
                                    <button className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#282e39] text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-[#323946] transition-colors border border-slate-200 dark:border-transparent">
                                        <span className="material-symbols-outlined">playlist_add</span>
                                        {t('album.save')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Info & Rating Column */}
                        <div className="lg:col-span-7 flex flex-col justify-center">
                            {/* Date Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">{t('home.album_of_day')}</span>
                                <p className="text-slate-500 dark:text-[#9da6b9] text-sm font-medium">November 14, 2023</p>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">{album.title}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-lg text-slate-600 dark:text-slate-300 mb-6 font-medium">
                                <a className="hover:text-primary transition-colors" href="#">{album.artist}</a>
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                <span>2015</span>
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                <span>78 min</span>
                            </div>
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                <div className="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-slate-100 dark:bg-[#282e39] text-slate-700 dark:text-white text-xs font-medium border border-slate-200 dark:border-transparent hover:border-primary/50 cursor-pointer transition-colors">#{album.genre.replace(/\s/g, '')}</div>
                                <div className="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-slate-100 dark:bg-[#282e39] text-slate-700 dark:text-white text-xs font-medium border border-slate-200 dark:border-transparent hover:border-primary/50 cursor-pointer transition-colors">#JazzRap</div>
                                <div className="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-slate-100 dark:bg-[#282e39] text-slate-700 dark:text-white text-xs font-medium border border-slate-200 dark:border-transparent hover:border-primary/50 cursor-pointer transition-colors">#Conscious</div>
                                <div className="flex h-8 shrink-0 items-center justify-center px-4 rounded-full bg-slate-100 dark:bg-[#282e39] text-slate-700 dark:text-white text-xs font-medium border border-slate-200 dark:border-transparent hover:border-primary/50 cursor-pointer transition-colors">#WestCoast</div>
                            </div>
                            {/* Dual Rating System */}
                            <div className="bg-white dark:bg-[#1a1f29] rounded-[2rem] p-6 mb-8 border border-slate-200 dark:border-[#282e39] shadow-sm">
                                <h3 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-4">{t('album.rate_album')}</h3>
                                <div className="flex flex-col sm:flex-row gap-8">
                                    {/* Personal Taste */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[20px] filled">favorite</span> 
                                                {t('album.personal_taste')}
                                            </span>
                                            <span className="text-sm font-bold text-primary">{personalRating}/5</span>
                                        </div>
                                        <RatingComponent 
                                            icon="favorite" 
                                            colorClass="text-primary" 
                                            value={personalRating} 
                                            onChange={setPersonalRating} 
                                        />
                                        <p className="text-xs text-slate-400 mt-2">{t('album.vibe_check')}</p>
                                    </div>
                                    {/* Divider for mobile/desktop */}
                                    <div className="hidden sm:block w-px bg-slate-200 dark:bg-[#282e39]"></div>
                                    {/* Artistic Quality */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-yellow-500 text-[20px] filled">grade</span> 
                                                {t('album.artistic_quality')}
                                            </span>
                                            <span className="text-sm font-bold text-yellow-500">{artisticRating}/5</span>
                                        </div>
                                        <RatingComponent 
                                            icon="star" 
                                            colorClass="text-yellow-500" 
                                            value={artisticRating} 
                                            onChange={setArtisticRating} 
                                        />
                                        <p className="text-xs text-slate-400 mt-2">{t('album.objective_craft')}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                                    A dense, complex exploration of fame, race, and self-worth, this album stands as a monumental achievement in modern music. Lamar weaves jazz, funk, and spoken word into a tapestry that challenges the listener while providing an undeniable groove. It is not just an album; it's a cultural artifact that demands to be heard in its entirety.
                                </p>
                            </div>
                        </div>
                    </section>
                    {/* Community & Reviews Section */}
                    <section className="border-t border-slate-200 dark:border-[#282e39] pt-10 mt-6 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    {t('album.the_debate')}
                                    <span className="bg-slate-200 dark:bg-[#282e39] text-slate-600 dark:text-slate-400 text-sm py-1 px-3 rounded-full">128 {t('album.comments')}</span>
                                </h2>
                                <p className="text-slate-500 dark:text-[#9da6b9] mt-1">Join the conversation about today's album.</p>
                            </div>
                            <button className="h-10 px-6 rounded-full bg-white dark:bg-[#282e39] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3f4756] hover:border-primary text-sm font-medium transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                {t('album.write_review')}
                            </button>
                        </div>
                        {/* Review Feed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Review Card 1 */}
                            <div className="bg-white dark:bg-[#1a1f29] p-6 rounded-[1.5rem] border border-slate-200 dark:border-[#282e39] flex flex-col gap-4 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhOFrmM9nFsX9L7uEJPkOX-zmyB2cfkGWm0e3rG70NpgY4NpznC9JyZPzV-G9dAZeKE_k9VApaaHcu9kndqHhKWuh50zm4PB_bQGZhVtbIKN_ZlRJd4GcZtIQr5nnD-Hek_fE9At3AeZM3S7omTX2E93-37yUVDpV52eRAw1xzA7KUnv2aB1FpPa23bFzhhP1nfb8UZOjRlhLn6TwWC8kdUi4n_Vj6N_0VoCFqJNdB5SLhcpcZXsMAMEWqFyF3eNG-_qg8nLgXQ80')"}}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Marcus J.</p>
                                            <p className="text-xs text-slate-500">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                                            <span className="material-symbols-outlined text-primary text-[14px] filled">favorite</span>
                                            <span className="text-xs font-bold text-primary">5</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md">
                                            <span className="material-symbols-outlined text-yellow-500 text-[14px] filled">star</span>
                                            <span className="text-xs font-bold text-yellow-500">5</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    Absolutely flawless. The production changes on "u" still give me chills. This is the gold standard for conscious rap.
                                </p>
                                <div className="mt-auto flex items-center gap-4 text-slate-400 text-xs font-medium">
                                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">thumb_up</span> 42
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">chat_bubble</span> {t('album.reply')}
                                    </button>
                                </div>
                            </div>
                            {/* Review Card 2 */}
                            <div className="bg-white dark:bg-[#1a1f29] p-6 rounded-[1.5rem] border border-slate-200 dark:border-[#282e39] flex flex-col gap-4 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC96WYoBEd3VInZ_1CiLMn3-bKdrs009tQhDzpQESanljMQKJSkmZ-COLRii0gdI0LDVliBFZTfIaX35oAENLvWyiOwGFZ3nSdrgokGDvhsMmKO8Ogd29K33hxmQBkaVznRUbfNUUA7CTq_sB9zCvquQ7gx54uOhIz-DTXM8kb7yJNOmebmWG08KfOKSUXYSKdAPAi3DPp9G7tiVaGncLCt4owauaYV8EsNDcWKOYOjMGY_LIisLaU6Xlbmff6W1yC_xmQCtpv19zM')"}}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Sarah Chen</p>
                                            <p className="text-xs text-slate-500">5 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                                            <span className="material-symbols-outlined text-primary text-[14px] filled">favorite</span>
                                            <span className="text-xs font-bold text-primary">4</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md">
                                            <span className="material-symbols-outlined text-yellow-500 text-[14px] filled">star</span>
                                            <span className="text-xs font-bold text-yellow-500">5</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    It's undeniably a masterpiece, but I find myself listening to DAMN more often. The jazz influence is heavy here, sometimes overwhelming.
                                </p>
                                <div className="mt-auto flex items-center gap-4 text-slate-400 text-xs font-medium">
                                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">thumb_up</span> 18
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">chat_bubble</span> {t('album.reply')}
                                    </button>
                                </div>
                            </div>
                            {/* Review Card 3 */}
                            <div className="bg-white dark:bg-[#1a1f29] p-6 rounded-[1.5rem] border border-slate-200 dark:border-[#282e39] flex flex-col gap-4 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDcY0kOIPQOl2xQHdqkE5hlE5TY1oRmZROno_XsRkfizympOERm62nAurY1SzCGgmY0vsrQgp6WOEHXoou8dwylM965Zjng8wHqprRpEwRLW_bHTwwIDUcts-bQsvi_qzp5Hw6DDyGIQn8xvLy4xn4n6GZ2EZovYB0RlQKiwDQeoNNA1ca6X6mT-uN5AFFFvT-1pfuNLeNT6KuSFrmAxZoUNy2CCRLqjZjZuYz71iNq5KSQmA1qelzWsqS9TRI8okt3uYg43gRkg1I')"}}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Davide B.</p>
                                            <p className="text-xs text-slate-500">1 day ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                                            <span className="material-symbols-outlined text-primary text-[14px] filled">favorite</span>
                                            <span className="text-xs font-bold text-primary">5</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md">
                                            <span className="material-symbols-outlined text-yellow-500 text-[14px] filled">star</span>
                                            <span className="text-xs font-bold text-yellow-500">5</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    "Alright" is the anthem of a generation. The social commentary is timeless.
                                </p>
                                <div className="mt-auto flex items-center gap-4 text-slate-400 text-xs font-medium">
                                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">thumb_up</span> 156
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">chat_bubble</span> {t('album.reply')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-8 mb-12">
                            <button className="text-primary font-medium text-sm hover:underline">{t('album.view_all_comments')}</button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AlbumPage;