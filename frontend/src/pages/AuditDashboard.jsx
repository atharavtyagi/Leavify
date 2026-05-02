import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    ShieldCheckIcon, 
    ClockIcon, 
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ComputerDesktopIcon,
    GlobeAltIcon,
    UserIcon,
    IdentificationIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';
import { format } from 'date-fns';

const AuditDashboard = () => {
    const [activeTab, setActiveTab] = useState('logs');
    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState(null);
    
    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'logs') {
                const res = await api.get('/audit/logs');
                setLogs(res.data.data);
            } else {
                const res = await api.get('/audit/login-history');
                setHistory(res.data.data);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.details || error.response?.data?.error || `Failed to fetch your ${activeTab}`;
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesAction = actionFilter ? log.action === actionFilter : true;
        const searchStr = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            log.performedBy?.name?.toLowerCase().includes(searchStr) || 
            log.action.toLowerCase().includes(searchStr) ||
            log.targetUser?.name?.toLowerCase().includes(searchStr);
        return matchesAction && matchesSearch;
    });

    const filteredHistory = history.filter(h => {
        const searchStr = searchTerm.toLowerCase();
        return !searchTerm || 
            h.user?.name?.toLowerCase().includes(searchStr) || 
            h.ipAddress.includes(searchStr) ||
            h.device.toLowerCase().includes(searchStr);
    });

    const getActionBadgeColor = (action) => {
        if (action.includes('APPROVED') || action.includes('CREATED')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (action.includes('REJECTED') || action.includes('DELETED')) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
        if (action.includes('ROLE') || action.includes('PASSWORD')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight flex items-center">
                        <ShieldCheckIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
                        Security & Audit Center
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">
                        Monitor system activity, user transitions, and authentication integrity.
                    </p>
                </div>
                <button 
                    onClick={fetchData}
                    className="btn btn-secondary flex items-center self-start md:self-center"
                    disabled={loading}
                >
                    <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div className="flex p-1 bg-slate-100 dark:bg-[#16161a] rounded-2xl w-fit border border-white/20 dark:border-white/10">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'logs' 
                            ? 'bg-white dark:bg-[#1f1f22] text-primary-600 dark:text-primary-400 shadow-sm' 
                            : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                        }`}
                    >
                        <IdentificationIcon className="w-5 h-5 mr-2" />
                        Action Logs
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
                        Login History
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-[#1f1f22] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none w-64 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {activeTab === 'logs' && (
                        <div className="relative">
                            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select 
                                className="pl-9 pr-8 py-2.5 appearance-none bg-white dark:bg-[#1f1f22] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all cursor-pointer"
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                            >
                                <option value="">All Actions</option>
                                <option value="USER_LOGIN">Logins</option>
                                <option value="ROLE_CHANGED">Role Changes</option>
                                <option value="LEAVE_APPROVED">Leave Approvals</option>
                                <option value="REIMBURSEMENT_APPROVED">Expense Approvals</option>
                                <option value="USER_CREATED">User Creations</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="glass-card overflow-hidden border border-white/20 dark:border-white/10 relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>
                
                {activeTab === 'logs' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Performed By</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Target/Context</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20 dark:divide-white/10">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-12 text-center animate-pulse"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2 mx-auto"></div></td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan="5"><EmptyState title="No logs found" message="Try adjusting your filters." /></td></tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <React.Fragment key={log._id}>
                                            <tr className="hover:bg-white/40 dark:hover:bg-white/5 transition-all group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs ring-1 ring-white dark:ring-white/10">
                                                            {log.performedBy?.name?.charAt(0)}
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{log.performedBy?.name || 'Unknown'}</p>
                                                            <p className="text-[10px] items-center flex font-bold text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/10 w-fit">
                                                                {log.performedBy?.role} • {log.performedBy?.department}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${getActionBadgeColor(log.action)}`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600 dark:text-zinc-400 font-semibold">
                                                    {log.targetUser ? (
                                                        <div className="flex items-center">
                                                            <UserIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                                                            {log.targetUser.name}
                                                        </div>
                                                    ) : (
                                                        <span className="opacity-50">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-500 dark:text-zinc-500 font-medium font-mono">
                                                    {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button 
                                                        onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                                        className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                    >
                                                        {expandedLog === log._id ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedLog === log._id && log.metadata && (
                                                <tr className="bg-slate-50/50 dark:bg-black/20">
                                                    <td colSpan="5" className="px-12 py-4">
                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                            {Object.entries(log.metadata).map(([key, val]) => (
                                                                <div key={key}>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key}</p>
                                                                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 truncate">
                                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Device / Source</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">IP Address</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Login / Logout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20 dark:divide-white/10">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-12 text-center animate-pulse"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2 mx-auto"></div></td></tr>
                                ) : filteredHistory.length === 0 ? (
                                    <tr><td colSpan="4"><EmptyState title="No history found" message="Safe so far!" /></td></tr>
                                ) : (
                                    filteredHistory.map((h) => (
                                        <tr key={h._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-all group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className="ml-0">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{h.user?.name || 'Unknown'}</p>
                                                        <p className="text-[10px] font-bold text-slate-500">{h.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center text-sm font-medium text-slate-600 dark:text-zinc-400">
                                                    <ComputerDesktopIcon className="w-4 h-4 mr-2 text-primary-500" />
                                                    <span className="truncate max-w-[200px]" title={h.device}>{h.device}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center text-sm font-bold font-mono text-slate-500 dark:text-zinc-500">
                                                    <GlobeAltIcon className="w-4 h-4 mr-2 text-slate-400" />
                                                    {h.ipAddress}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-[11px] font-bold">
                                                    <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                                        {format(new Date(h.loginTime), 'MMM dd, HH:mm:ss')}
                                                    </div>
                                                    {h.logoutTime ? (
                                                        <div className="flex items-center text-slate-400 mt-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
                                                            {format(new Date(h.logoutTime), 'MMM dd, HH:mm:ss')}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-primary-500 mt-1 animate-pulse">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                                                            Active Session
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditDashboard;
