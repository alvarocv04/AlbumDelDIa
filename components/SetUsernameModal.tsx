import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setUsername, checkUsernameAvailability } from '../services/userService';
import LegalDocuments from './LegalDocuments';

const SetUsernameModal: React.FC = () => {
    const { currentUser, dbUser, refreshDbUser } = useAuth();
    const [username, setUsernameInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showLegal, setShowLegal] = useState<'privacy' | 'terms' | null>(null);

    // Debounce username check
    useEffect(() => {
        const check = async () => {
            if (username.length < 3) {
                setIsAvailable(null);
                return;
            }
            setChecking(true);
            try {
                const available = await checkUsernameAvailability(username);
                setIsAvailable(available);
                if (!available) setError('Este nombre de usuario ya está en uso');
                else setError(null);
            } catch (err) {
                console.error(err);
            } finally {
                setChecking(false);
            }
        };

        const timeout = setTimeout(check, 500);
        return () => clearTimeout(timeout);
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !isAvailable || !acceptedTerms) return;

        setLoading(true);
        try {
            await setUsername(currentUser.uid, username);
            await refreshDbUser();
        } catch (err) {
            console.error(err);
            setError('Error al guardar el nombre de usuario. Intentalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Only show if user is logged in but has no username in DB
    if (!currentUser || (dbUser && dbUser.username)) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Completar Perfil</h2>
                <p className="text-gray-400 mb-6">Elige un nombre de usuario único para identificarte en la comunidad.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nombre de usuario
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                    setError(null);
                                }}
                                className={`w-full bg-black/50 border rounded-lg px-4 py-3 text-white outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' :
                                    isAvailable ? 'border-green-500 focus:border-green-500' :
                                        'border-white/10 focus:border-indigo-500'
                                    }`}
                                placeholder="usuario123"
                                minLength={3}
                                maxLength={20}
                                required
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {checking ? (
                                    <span className="material-symbols-outlined animate-spin text-gray-400 text-[20px]">progress_activity</span>
                                ) : isAvailable ? (
                                    <span className="material-symbols-outlined text-green-500 text-[20px]">check</span>
                                ) : username.length >= 3 && isAvailable === false ? (
                                    <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                                ) : null}
                            </div>
                        </div>
                        {error && (
                            <p className="mt-1 text-sm text-red-400">{error}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Solo letras minúsculas, números y guiones bajos.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-300">
                            He leído y acepto los <button type="button" onClick={() => setShowLegal('terms')} className="text-indigo-400 hover:text-indigo-300 underline">Términos y Condiciones</button> y la <button type="button" onClick={() => setShowLegal('privacy')} className="text-indigo-400 hover:text-indigo-300 underline">Política de Privacidad</button>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!isAvailable || !acceptedTerms || loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        Continuar
                    </button>
                </form>

            </div>

            {showLegal && (
                <LegalDocuments type={showLegal} onClose={() => setShowLegal(null)} />
            )}
        </div>
    );
};

export default SetUsernameModal;
