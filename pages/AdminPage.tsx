import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { Album, Badge } from '../types';
import { getAllAlbums, deleteAlbum, saveAlbum } from '../services/albumService';
import { getAllBadges, deleteBadge, saveBadge } from '../services/badgeService';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAILS = ['alvarocv04@gmail.com'];

const AdminPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'albums' | 'badges'>('albums');

    // Data State
    const [albums, setAlbums] = useState<Album[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form States
    const [currentAlbum, setCurrentAlbum] = useState<Partial<Album>>({});
    const [currentBadge, setCurrentBadge] = useState<Partial<Badge>>({});

    useEffect(() => {
        if (!loading && (!currentUser || !currentUser.email || !ADMIN_EMAILS.includes(currentUser.email))) {
            // Access denied logic handled in render
        }
    }, [currentUser, loading]);

    const fetchData = async () => {
        setLoading(true);
        if (activeTab === 'albums') {
            const data = await getAllAlbums();
            setAlbums(data);
        } else {
            const data = await getAllBadges();
            setBadges(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // --- Actions ---

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;

        if (activeTab === 'albums') {
            await deleteAlbum(id);
        } else {
            await deleteBadge(id);
        }
        fetchData();
    };

    const handleEdit = (item: any) => {
        setIsEditing(true);
        if (activeTab === 'albums') {
            setCurrentAlbum(item);
        } else {
            setCurrentBadge(item);
        }
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setIsEditing(false);
        if (activeTab === 'albums') {
            setCurrentAlbum({
                spotifyId: '', title: '', artist: '', coverUrl: '',
                releaseDate: '', spotifyUrl: '', appleMusicUrl: '',
                totalTracks: 0, popularity: 0, genres: [], tracks: [], duration_total_ms: 0, label: ''
            });
        } else {
            setCurrentBadge({
                id: '', name: '', description: '', icon: '',
                name_es: '', name_en: '', description_es: '', description_en: '',
                category: 'streak', threshold: 1
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'albums') {
            if (!currentAlbum.spotifyId || !currentAlbum.title) return alert('Required fields missing');
            const toSave = { ...currentAlbum } as Album;
            await saveAlbum(toSave);
        } else {
            if (!currentBadge.id || !currentBadge.name_es) return alert('Required fields missing');
            const toSave = {
                ...currentBadge,
                name: currentBadge.name_es, // Fallback for legacy
                description: currentBadge.description_es // Fallback legacy
            } as Badge;
            await saveBadge(toSave);
        }

        setIsModalOpen(false);
        fetchData();
    };

    // --- Render Helpers ---

    if (loading && !albums.length && !badges.length) return <div className="min-h-screen flex items-center justify-center dark:bg-background-dark dark:text-white">Loading...</div>;

    if (!currentUser || !currentUser.email || !ADMIN_EMAILS.includes(currentUser.email)) {
        return (
            <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-white">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4">lock</span>
                    <h1>Access Denied</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-white transition-colors duration-200">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                        <button
                            onClick={() => setActiveTab('albums')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'albums' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Albums
                        </button>
                        <button
                            onClick={() => setActiveTab('badges')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'badges' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Badges
                        </button>
                    </div>

                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full font-medium transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add {activeTab === 'albums' ? 'Album' : 'Badge'}
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeTab === 'albums' ? (
                        albums.map((album) => (
                            <div key={album.spotifyId} className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-border-dark flex flex-col">
                                {/* Album Card Content */}
                                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img src={album.coverUrl} className="w-full h-full object-cover" alt={album.title} />
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold truncate">{album.title}</h3>
                                    <p className="text-sm text-slate-500 truncate">{album.artist}</p>
                                    <div className="mt-auto flex justify-end gap-2 pt-2">
                                        <button onClick={() => handleEdit(album)} className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">edit</span></button>
                                        <button onClick={() => handleDelete(album.spotifyId)} className="p-2 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        badges.map((badge) => (
                            <div key={badge.id} className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-border-dark flex flex-col items-center text-center">
                                <div className="text-4xl mb-3">{badge.icon}</div>
                                <h3 className="font-bold">{badge.name_es || badge.name}</h3>
                                <p className="text-sm text-slate-500 mb-4 h-10 overflow-hidden">{badge.description_es || badge.description}</p>
                                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mb-4">{badge.category} • {badge.threshold}</div>
                                <div className="mt-auto flex gap-2">
                                    <button onClick={() => handleEdit(badge)} className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">edit</span></button>
                                    <button onClick={() => handleDelete(badge.id)} className="p-2 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between sticky top-0 bg-white dark:bg-surface-dark z-10">
                                <h2 className="text-2xl font-bold">{isEditing ? 'Edit' : 'Add'} {activeTab === 'albums' ? 'Album' : 'Badge'}</h2>
                                <button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 grid gap-4">
                                {activeTab === 'albums' ? (
                                    <>
                                        <FormInput label="Spotify ID" value={currentAlbum.spotifyId} onChange={v => setCurrentAlbum({ ...currentAlbum, spotifyId: v })} required />
                                        <FormInput label="Title" value={currentAlbum.title} onChange={v => setCurrentAlbum({ ...currentAlbum, title: v })} required />
                                        <FormInput label="Artist" value={currentAlbum.artist} onChange={v => setCurrentAlbum({ ...currentAlbum, artist: v })} required />
                                        <FormInput label="Release Date" value={currentAlbum.releaseDate} onChange={v => setCurrentAlbum({ ...currentAlbum, releaseDate: v })} type="date" />
                                        <FormInput label="Cover URL" value={currentAlbum.coverUrl} onChange={v => setCurrentAlbum({ ...currentAlbum, coverUrl: v })} />
                                        <FormInput label="Spotify URL" value={currentAlbum.spotifyUrl} onChange={v => setCurrentAlbum({ ...currentAlbum, spotifyUrl: v })} />
                                        <FormInput label="Apple Music URL" value={currentAlbum.appleMusicUrl} onChange={v => setCurrentAlbum({ ...currentAlbum, appleMusicUrl: v })} />
                                    </>
                                ) : (
                                    <>
                                        <FormInput label="ID (Unique)" value={currentBadge.id} onChange={v => setCurrentBadge({ ...currentBadge, id: v })} required placeholder="e.g., streak_10" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Name (ES)" value={currentBadge.name_es} onChange={v => setCurrentBadge({ ...currentBadge, name_es: v })} required />
                                            <FormInput label="Name (EN)" value={currentBadge.name_en} onChange={v => setCurrentBadge({ ...currentBadge, name_en: v })} required />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Description (ES)" value={currentBadge.description_es} onChange={v => setCurrentBadge({ ...currentBadge, description_es: v })} required />
                                            <FormInput label="Description (EN)" value={currentBadge.description_en} onChange={v => setCurrentBadge({ ...currentBadge, description_en: v })} required />
                                        </div>

                                        <FormInput label="Icon (Emoji or URL)" value={currentBadge.icon} onChange={v => setCurrentBadge({ ...currentBadge, icon: v })} required />
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium">Category</label>
                                            <select
                                                value={currentBadge.category}
                                                onChange={e => setCurrentBadge({ ...currentBadge, category: e.target.value as any })}
                                                className="px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-border-dark"
                                            >
                                                <option value="streak">Streak</option>
                                                <option value="listening">Listening</option>
                                                <option value="milestone">Milestone</option>
                                                <option value="social">Social</option>
                                            </select>
                                        </div>
                                        <FormInput label="Threshold" value={currentBadge.threshold?.toString()} onChange={v => setCurrentBadge({ ...currentBadge, threshold: parseInt(v) || 0 })} type="number" />
                                    </>
                                )}
                                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-border-dark">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full border">Cancel</button>
                                    <button type="submit" className="px-6 py-2 rounded-full bg-primary text-white font-bold shadow-lg">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const FormInput = ({ label, value, onChange, type = 'text', required = false, placeholder = '' }: any) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-border-dark focus:border-primary outline-none transition-all"
            required={required}
        />
    </div>
);

export default AdminPage;
