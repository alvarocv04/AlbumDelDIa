import React, { useState, useEffect, useRef } from 'react';
import { getAlbumChatResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface AlbumChatbotProps {
    albumTitle: string;
    artistName: string;
}

const AlbumChatbot: React.FC<AlbumChatbotProps> = ({ albumTitle, artistName }) => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', parts: [{ text: input }] };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getAlbumChatResponse(artistName, albumTitle, newMessages, language);
            setMessages([...newMessages, { role: 'model', parts: [{ text: response }] }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: 'model', parts: [{ text: t('chat.error') }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-display">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white/90 dark:bg-[#1a1f29]/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-[#282e39] flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-[#282e39] flex items-center justify-between bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined filled">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('chat.assistant_title')}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('chat.online')}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#282e39] text-slate-400 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                                <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
                                <p className="text-xs text-slate-500 max-w-[200px]">
                                    {language === 'es' ? `¡Pregúntame sobre "${albumTitle}"!` : `Ask me about "${albumTitle}"!`}
                                </p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                        : 'bg-slate-100 dark:bg-[#282e39] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-transparent'
                                    }`}>
                                    {msg.parts[0].text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-[#282e39] p-4 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-[#282e39] bg-white/50 dark:bg-transparent">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('chat.ask_curiosity')}
                                className="w-full h-12 pl-4 pr-12 rounded-full bg-slate-100 dark:bg-[#282e39] border-none focus:ring-2 focus:ring-primary/50 text-sm transition-all dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1.5 top-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-[20px] filled">send</span>
                            </button>
                        </div>
                        <p className="text-[9px] text-center mt-3 text-slate-400 font-medium">Powered by Gemini 2.0 Flash</p>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 relative group ${isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-primary text-white'
                    }`}
            >
                <span className="material-symbols-outlined text-3xl filled">
                    {isOpen ? 'close' : 'auto_awesome'}
                </span>
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-background-dark rounded-full"></span>
                )}

                {/* Tooltip */}
                {!isOpen && (
                    <div className="absolute right-full mr-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                        {t('chat.assistant_title')}
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                )}
            </button>
        </div>
    );
};

export default AlbumChatbot;
