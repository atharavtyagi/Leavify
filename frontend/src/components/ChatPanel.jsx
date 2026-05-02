import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api, { STATIC_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon, UserCircleIcon, CheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ChatPanel = ({ contextType, contextId }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch initial chat history
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const res = await api.get(`/chat/${contextType}/${contextId}`);
                if (res.data.data) {
                    setMessages(res.data.data.messages || []);
                    setIsLocked(res.data.data.isLocked || false);
                }
            } catch (error) {
                // Ignore 404s, it just means chat hasn't started yet
                if (error.response && error.response.status !== 404) {
                    console.error("Failed to load chat:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        if (contextId) {
            fetchChat();
        }
    }, [contextType, contextId]);

    // Socket Setup
    useEffect(() => {
        if (!contextId || loading) return;

        const newSocket = io(STATIC_BASE_URL);
        const roomName = `${contextType}-${contextId}`;

        newSocket.on('connect', () => {
            newSocket.emit('joinRoom', roomName);
        });

        newSocket.on('newMessage', (message) => {
            setMessages((prev) => [...prev, message]);
            if (message.isSystemMessage && (
                message.message.toLowerCase().includes('finalized') ||
                message.message.toLowerCase().includes('approved') ||
                message.message.toLowerCase().includes('rejected') ||
                message.message.toLowerCase().includes('paid')
            )) {
                setIsLocked(true);
            }
        });

        setSocket(newSocket);

        // Mark seen automatically when panel is open
        api.patch(`/chat/${contextType}/${contextId}/seen`).catch(e => console.log(e));

        return () => {
            newSocket.emit('leaveRoom', roomName);
            newSocket.disconnect();
        };
    }, [contextType, contextId, loading]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && !attachment) return;

        const formData = new FormData();
        formData.append('message', inputMessage);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            setInputMessage('');
            setAttachment(null);

            // We don't push manually here because Socket intercept via newMessage handles it for everyone including us!
            await api.post(`/chat/${contextType}/${contextId}/message`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send message');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size cannot exceed 5MB');
                return;
            }
            setAttachment(file);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-6 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mr-3"></div>
                Loading discussion...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#111113] rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-inner">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-white/70 dark:bg-[#16161a]">
                <h3 className="text-sm border-l-4 border-primary-500 pl-2 font-bold text-slate-700 dark:text-zinc-200 tracking-wide uppercase">
                    Discussion Thread
                </h3>
                {isLocked && (
                    <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-zinc-400 border border-slate-200 dark:border-white/10">
                        Chat Locked
                    </span>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-[#0b0b0e] shadow-inner relative">
                {/* Optional subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                        <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <PaperAirplaneIcon className="w-8 h-8 text-slate-300 dark:text-zinc-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">No messages yet</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">Use this space to discuss the {contextType} details or attach required documents.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const myId = String(user?._id || user?.id || '');
                        const senderId = String(msg.sender?._id || msg.sender || '');
                        const isMe = myId && senderId && myId === senderId;
                        const isSystem = msg.isSystemMessage;

                        if (isSystem) {
                            return (
                                <div key={index} className="flex justify-center my-6 relative z-10">
                                    <div className="bg-primary-50/90 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 px-4 py-2 rounded-2xl max-w-sm text-center shadow-sm backdrop-blur-sm">
                                        <div className="text-[11px] text-primary-800 dark:text-primary-300 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.message.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-primary-900 dark:text-primary-200">$1</span>').replace(/\n/g, '<br/>') }} />
                                        <span className="text-[9px] text-primary-500/80 uppercase font-black tracking-widest mt-1 block">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={index} className={`flex w-full relative z-10 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    {!isMe && (
                                        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-tr from-indigo-100 to-white dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-zinc-200 shadow-sm border border-white dark:border-zinc-600 mr-2 z-10">
                                            {msg.sender?.name?.charAt(0) || <UserCircleIcon className="w-5 h-5" />}
                                        </div>
                                    )}

                                    {/* Bubble Container */}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 ml-1 mb-1">{msg.sender?.name}</span>}
                                        
                                        <div className={`
                                            px-4 py-2.5 shadow-sm text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words relative
                                            ${isMe
                                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-[20px] rounded-br-[4px] shadow-primary-500/20'
                                                : 'bg-white dark:bg-[#1e1e24] text-slate-700 dark:text-zinc-200 border border-slate-100 dark:border-white/5 rounded-[20px] rounded-bl-[4px] shadow-slate-200/50 dark:shadow-none'}
                                        `}>
                                            {msg.message}

                                            {msg.attachment && (
                                                <a
                                                    href={`${STATIC_BASE_URL}${msg.attachment}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`mt-2 flex items-center p-2.5 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity border backdrop-blur-sm ${isMe ? 'bg-black/10 border-white/20 text-white' : 'bg-slate-50/80 border-slate-200 text-slate-700 dark:bg-black/20 dark:border-white/10 dark:text-zinc-300'}`}
                                                >
                                                    <PaperClipIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                                    <span className="truncate">Attached File</span>
                                                </a>
                                            )}
                                        </div>

                                        {/* Timestamp underneath */}
                                        <div className={`text-[9px] font-semibold text-slate-400 dark:text-zinc-500 mt-1 flex items-center space-x-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {isMe && (
                                                <span className="ml-1 flex items-center">
                                                    {msg.seen ? <CheckCircleIcon className="w-3.5 h-3.5 text-primary-500" /> : <CheckIcon className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!isLocked && !user?.viewOnlyStatus ? (
                <div className="p-3 bg-white dark:bg-[#16161a] border-t border-slate-200/60 dark:border-white/10">
                    {attachment && (
                        <div className="mb-2 flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                            <div className="flex items-center text-xs font-bold text-indigo-700 dark:text-indigo-400 truncate">
                                <PaperClipIcon className="w-4 h-4 mr-1.5" />
                                <span className="truncate">{attachment.name}</span>
                            </div>
                            <button onClick={() => setAttachment(null)} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-md text-indigo-500">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-end space-x-2 relative group">
                        <label className="cursor-pointer p-2.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                            <input type="file" className="hidden" onChange={handleFileChange} />
                            <PaperClipIcon className="w-5 h-5" />
                        </label>
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 max-h-32 min-h-[44px] bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none overflow-y-auto custom-scrollbar transition-all"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={(!inputMessage.trim() && !attachment)}
                            className="p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-md shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                        >
                            <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45" />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-4 bg-slate-100 dark:bg-[#16161a] border-t border-slate-200/60 dark:border-white/10 text-center text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                    {user?.viewOnlyStatus ? 'You are on leave (Read Only)' : 'This discussion has been locked'}
                </div>
            )}
        </div>
    );
};

export default ChatPanel;
