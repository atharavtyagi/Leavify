import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    SparklesIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    TrashIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SolidSparklesIcon } from '@heroicons/react/24/solid';

const AssistantWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting based on role
    useEffect(() => {
        if (!user) return;
        const initialMessage = {
            id: 'init-1',
            sender: 'ai',
            type: 'text',
            message: `Hello ${user.name.split(' ')[0]}! I'm your Leavify AI Assistant. I can help answer questions about ${user.role === 'Employee' ? 'your leaves and reimbursements.' :
                user.role === 'Manager' ? 'your department\'s leave requests and expenses.' :
                    'the company\'s overall leave and financial analytics.'
                }`,
            timestamp: new Date()
        };

        // We clear messages temporarily when user changes so it doesn't bleed during mount
        setMessages([]);

        const userId = user._id || user.id;

        // Load from session storage or set initial
        const saved = sessionStorage.getItem(`assistant_chat_${userId}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) {
                    setMessages(parsed);
                } else {
                    setMessages([initialMessage]);
                }
            } catch (e) {
                setMessages([initialMessage]);
            }
        } else {
            setMessages([initialMessage]);
        }
    }, [user]);

    // Save to session storage
    useEffect(() => {
        const userId = user?._id || user?.id;
        if (userId && messages.length > 0) {
            sessionStorage.setItem(`assistant_chat_${userId}`, JSON.stringify(messages));
        }
    }, [messages, user]);

    // Auto scroll
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isTyping]);

    const handleClear = () => {
        const userId = user?._id || user?.id;
        if (userId) sessionStorage.removeItem(`assistant_chat_${userId}`);
        setMessages([{
            id: Date.now().toString(),
            sender: 'ai',
            type: 'text',
            message: "Conversation cleared. How can I help you?",
            timestamp: new Date()
        }]);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = {
            id: Date.now().toString() + '-user',
            sender: 'user',
            type: 'text',
            message: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await api.post('/assistant/query', { message: userMsg.message });

            // Artificial delay to make it feel like "AI thinking"
            setTimeout(() => {
                const aiMsg = {
                    id: Date.now().toString() + '-ai',
                    sender: 'ai',
                    type: res.data.data.type,
                    message: res.data.data.message,
                    data: res.data.data.data,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsTyping(false);
            }, 800);

        } catch (error) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + '-err',
                    sender: 'ai',
                    type: 'text',
                    message: "Sorry, I encountered an error connecting to the intelligence server.",
                    timestamp: new Date()
                }]);
                setIsTyping(false);
            }, 800);
        }
    };

    const handleQuickAction = (text) => {
        setInput(text);
        // Delay slighty so state updates before send
        setTimeout(() => document.getElementById('assistant-submit-btn')?.click(), 50);
    };

    const getPlaceholder = () => {
        if (!user) return "Type a message...";
        if (user.role === 'Employee') return "Ask about leave balance...";
        if (user.role === 'Manager') return "Ask about pending requests...";
        return "Ask about company analytics...";
    };

    const renderMessageContent = (msg) => {
        if (msg.type === 'text') {
            return <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>;
        }

        if (msg.type === 'stat') {
            return (
                <div className="space-y-3">
                    <p className="text-[13px] leading-relaxed text-slate-700 dark:text-zinc-200">{msg.message}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {msg.data?.map((stat, i) => (
                            <div key={i} className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-center">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider truncate">{stat.label}</p>
                                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (msg.type === 'table') {
            return (
                <div className="space-y-2">
                    <p className="text-[13px] leading-relaxed text-slate-700 dark:text-zinc-200">{msg.message}</p>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 mt-2">
                        <table className="min-w-full text-left text-[11px]">
                            <thead className="bg-slate-100 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 uppercase tracking-wider font-bold">
                                <tr>
                                    {msg.data && msg.data.length > 0 && Object.keys(msg.data[0]).map(key => (
                                        <th key={key} className="px-3 py-2">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white/40 dark:bg-white/5">
                                {msg.data?.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="px-3 py-2 font-medium text-slate-700 dark:text-zinc-300">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return <p className="text-[13px]">{msg.message}</p>;
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Assistant Chat Window */}
            <div
                className={`
                    mb-4 overflow-hidden outline outline-1 outline-white/20 transition-all duration-300 origin-bottom-right
                    ${isOpen ? 'scale-100 opacity-100 w-[380px] h-[550px]' : 'scale-75 opacity-0 w-[380px] h-[550px] pointer-events-none absolute bottom-16 right-0'}
                    glass-card rounded-2xl flex flex-col shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-[#111113]/90 border border-slate-200/60 dark:border-white/10
                `}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200/60 dark:border-white/10 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <SolidSparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-wide">Leavify AI</h3>
                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{user.role} Assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={handleClear} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Clear Chat">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                            <ChevronDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
                    {messages.map((msg) => {
                        const isAi = msg.sender === 'ai';
                        return (
                            <div key={msg.id} className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'}`}>
                                <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                                    {/* Avatar */}
                                    {isAi && (
                                        <div className="w-6 h-6 rounded-full flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm mr-2 mt-1">
                                            <SolidSparklesIcon className="w-3 h-3 text-white" />
                                        </div>
                                    )}

                                    {/* Message Bubble container */}
                                    <div>
                                        <div className={`
                                            px-4 py-3 shadow-sm relative text-[13px] 
                                            ${isAi
                                                ? 'bg-white dark:bg-[#1e1e24] text-slate-700 dark:text-zinc-200 border border-slate-100 dark:border-white/5 rounded-[20px] rounded-tl-[4px] shadow-slate-200/50 dark:shadow-none'
                                                : 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-[20px] rounded-tr-[4px] ml-2'}
                                        `}>
                                            {renderMessageContent(msg)}
                                        </div>
                                        <div className={`text-[9px] font-bold text-slate-400 dark:text-zinc-500 mt-1 flex ${isAi ? 'justify-start ml-1' : 'justify-end mr-3'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isTyping && (
                        <div className="flex w-full justify-start">
                            <div className="flex max-w-[80%] flex-row">
                                <div className="w-6 h-6 rounded-full flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm mr-2 mt-1">
                                    <SolidSparklesIcon className="w-3 h-3 text-white" />
                                </div>
                                <div className="px-4 py-3.5 bg-white dark:bg-[#1e1e24] border border-slate-100 dark:border-white/5 rounded-[20px] rounded-tl-[4px] shadow-sm flex items-center space-x-1.5 h-[42px]">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions (Optional - shown only if no deep history or at bottom) */}
                {!isTyping && messages.length < 5 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
                        {user.role === 'Employee' && (
                            <>
                                <button onClick={() => handleQuickAction("How many leave days left?")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Leave Balance</button>
                                <button onClick={() => handleQuickAction("What is my reimbursement status?")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Reimbursement Status</button>
                                <button onClick={() => handleQuickAction("Who is my reporting manager?")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">My Manager</button>
                            </>
                        )}
                        {user.role === 'Manager' && (
                            <>
                                <button onClick={() => handleQuickAction("Who is on leave today?")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Leaves Today</button>
                                <button onClick={() => handleQuickAction("Pending leave requests")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Pending Leaves</button>
                                <button onClick={() => handleQuickAction("Total department reimbursement this month?")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Department Expenses</button>
                            </>
                        )}
                        {user.role === 'Admin' && (
                            <>
                                <button onClick={() => handleQuickAction("Global leaves today")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Global Absences</button>
                                <button onClick={() => handleQuickAction("Highest reimbursements")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Top Expenses</button>
                                <button onClick={() => handleQuickAction("Average approval time")} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors">Approval Times</button>
                            </>
                        )}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-[#16161a] border-t border-slate-200/60 dark:border-white/10 shrink-0">
                    <form onSubmit={handleSend} className="flex relative items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={getPlaceholder()}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                            disabled={isTyping}
                        />
                        <button
                            id="assistant-submit-btn"
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-1.5 p-2 bg-slate-800 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-full transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PaperAirplaneIcon className="w-4 h-4 transform -rotate-45 ml-0.5" />
                        </button>
                    </form>
                    <div className="text-center mt-2 flex items-center justify-center space-x-1">
                        <SparklesIcon className="w-3 h-3 text-indigo-400" />
                        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Leavify AI Insights</span>
                    </div>
                </div>
            </div>

            {/* Bubble Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-center w-14 h-14 rounded-full shadow-2xl shadow-indigo-600/30 transition-all duration-300 transform outline outline-2 outline-offset-2 hover:scale-105 active:scale-95 z-50
                    ${isOpen
                        ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 outline-slate-800 dark:outline-white rotate-90'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white outline-transparent hover:shadow-indigo-600/50'}
                `}
            >
                {isOpen ? <XMarkIcon className="w-6 h-6 -rotate-90 transition-transform" /> : <SolidSparklesIcon className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default AssistantWidget;
