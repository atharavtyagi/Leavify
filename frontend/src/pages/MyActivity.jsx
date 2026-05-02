import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    ClockIcon, 
    IdentificationIcon,
    ArrowPathIcon,
    ComputerDesktopIcon,
    GlobeAltIcon,
    ArrowRightOnRectangleIcon,
    Bars3CenterLeftIcon
} from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';
import { format, formatDistanceToNow } from 'date-fns';

const MyActivity = () => {
    const [activeTab, setActiveTab] = useState('logs');
    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyData();
    }, [activeTab]);

    const fetchMyData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'logs') {
                const res = await api.get('/audit/me/logs');
                setLogs(res.data.data);
            } else {
                const res = await api.get('/audit/me/login-history');
                setHistory(res.data.data);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.details || error.response?.data?.error || `Failed to fetch your ${activeTab}`;
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        if (action.includes('LOGIN')) return <ArrowRightOnRectangleIcon className="w-5 h-5" />;
        if (action.includes('LEAVE')) return <Bars3CenterLeftIcon className="w-5 h-5" />;
        return <IdentificationIcon className="w-5 h-5" />;
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">My Security Activity</h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">
                    Transparency for your account security. Track your actions and sign-ins.
                </p>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-[#16161a] rounded-2xl w-fit border border-white/20 dark:border-white/10 mb-8">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'logs' 
                        ? 'bg-white dark:bg-[#1f1f22] text-primary-600 dark:text-primary-400 shadow-sm' 
                        : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                >
                    <IdentificationIcon className="w-5 h-5 mr-2" />
                    Activity Timeline
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'history' 
                        ? 'bg-white dark:bg-[#1f1f22] text-primary-600 dark:text-primary-400 shadow-sm' 
                        : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                >
                    <ClockIcon className="w-5 h-5 mr-2" />
                    Login Sessions
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <ArrowPathIcon className="w-10 h-10 text-primary-500 animate-spin" />
                </div>
            ) : activeTab === 'logs' ? (
                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <EmptyState title="No activity yet" message="Actions you perform will appear here." />
                    ) : (
                        logs.map((log, idx) => (
                            <div key={log._id} className="relative pl-8 group">
                                {/* Vertical line */}
                                {idx !== logs.length - 1 && (
                                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-200 dark:bg-white/5 group-hover:bg-primary-500/30 transition-colors" />
                                )}
                                
                                <div className="absolute left-0 top-1 w-10 h-10 rounded-full border-2 border-white dark:border-[#0f0f11] bg-slate-100 dark:bg-[#16161a] shadow-sm flex items-center justify-center text-slate-500 group-hover:text-primary-500 group-hover:scale-110 transition-all z-10 overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                     {getActionIcon(log.action)}
                                </div>

                                <div className="glass-card p-5 mb-4 border border-white/20 dark:border-white/10 group-hover:border-primary-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide text-xs">
                                            {log.action.replace(/_/g, ' ')}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium">
                                        You performed a <span className="text-primary-600 dark:text-primary-400 font-bold italic">{log.action}</span> event.
                                    </p>
                                    <div className="mt-3 text-[11px] font-mono text-slate-500 bg-slate-50/50 dark:bg-black/20 p-2 rounded-lg">
                                        Timestamp: {format(new Date(log.timestamp), 'PPP pp')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.length === 0 ? (
                        <div className="col-span-2">
                            <EmptyState title="No login history" message="This is strange, you are logged in right now!" />
                        </div>
                    ) : (
                        history.map((h) => (
                            <div key={h._id} className="glass-card p-6 border border-white/20 dark:border-white/10 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                                {!h.logoutTime && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg animate-pulse">
                                        Current Session
                                    </div>
                                )}
                                
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-100 dark:bg-[#16161a] rounded-2xl">
                                        <ComputerDesktopIcon className="w-6 h-6 text-primary-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate" title={h.device}>
                                            {h.device}
                                        </p>
                                        <div className="flex items-center mt-1 text-[11px] text-slate-500 font-bold font-mono">
                                            <GlobeAltIcon className="w-3.5 h-3.5 mr-1" />
                                            {h.ipAddress}
                                        </div>
                                        
                                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-white/5 pt-4">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Logged In</p>
                                                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    {format(new Date(h.loginTime), 'MMM dd, HH:mm')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                <p className={`text-[11px] font-bold ${h.logoutTime ? 'text-slate-500' : 'text-primary-500'}`}>
                                                    {h.logoutTime ? `Ended ${format(new Date(h.logoutTime), 'HH:mm')}` : 'Active Now'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MyActivity;
