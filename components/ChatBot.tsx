import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const ChatBot: React.FC = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    // Initialize or re-initialize chat when language changes, but only if empty
    useEffect(() => {
        if (messages.length === 0) {
             setMessages([{ role: 'model', text: t('chat.initial') }]);
        }
    }, [language, t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue.trim();
        setInputValue("");
        
        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Add placeholder for model response
            setMessages(prev => [...prev, { role: 'model', text: "" }]);

            // We could append a system instruction prefix here based on language if the API supported it per-message easily, 
            // but for now we assume the model is smart enough to reply in the user's language or we rely on the initial system prompt 
            // to be general enough.
            const stream = await sendMessageToGemini(userMsg);
            
            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                // Update the last message (model's response) with current accumulated text
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    lastMsg.text = fullText;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the groove right now. Try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-700 rotate-90' : 'bg-primary'}`}
            >
                <span className="material-symbols-outlined text-white text-[28px]">
                    {isOpen ? 'close' : 'smart_toy'}
                </span>
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 w-[90vw] sm:w-[380px] h-[500px] max-h-[70vh] bg-surface-dark border border-border-dark rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}`}>
                {/* Header */}
                <div className="p-4 border-b border-border-dark bg-card-dark flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">{t('chat.bot_name')}</h3>
                        <p className="text-xs text-text-secondary flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {t('chat.online')}
                        </p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#11161f]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-br-sm' 
                                    : 'bg-card-dark text-slate-200 border border-border-dark rounded-bl-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1].role === 'user' && (
                        <div className="flex justify-start">
                             <div className="bg-card-dark border border-border-dark rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-card-dark border-t border-border-dark">
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('chat.placeholder')}
                            className="w-full bg-surface-dark border border-border-dark rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 p-1.5 bg-primary rounded-full text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px] flex">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatBot;