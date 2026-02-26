import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, BanknotesIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { reimbursementService } from '../services/reimbursementService';
import { STATIC_BASE_URL } from '../services/api';

const ReimbursementRequests = () => {
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState('Pending');
    const [stats, setStats] = useState({ total: 0, pendingCount: 0, approvedValue: 0 });

    useEffect(() => {
        fetchReimbursements();
    }, []);

    const fetchReimbursements = async () => {
        try {
            const data = await reimbursementService.getAllReimbursements();
            setReimbursements(data.data);
            calculateStats(data.data);
        } catch (error) {
            toast.error('Failed to load reimbursement requests');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const approvedVal = data.filter(r => r.status === 'Approved' || r.status === 'Manager Approved').reduce((sum, r) => sum + r.amount, 0);
        const pendingCnt = data.filter(r => r.status === 'Pending').length;
        setStats({ total: data.length, pendingCount: pendingCnt, approvedValue: approvedVal });
    };

    const getReceiptUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${STATIC_BASE_URL}${url} `;
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            if (action === 'approve') {
                await reimbursementService.approveReimbursement(id);
                toast.success('Reimbursement approved');
            } else {
                await reimbursementService.rejectReimbursement(id);
                toast.success('Reimbursement rejected');
            }
            const newStatus = action === 'approve' ? 'Manager Approved' : 'Rejected';
            const updated = prevReimbursements => {
                const nextState = prevReimbursements.map(req => req._id === id ? { ...req, status: newStatus } : req);
                calculateStats(nextState);
                return nextState;
            };
            setReimbursements(updated);
        } catch (error) {
            toast.error(error.response?.data?.error || `Failed to ${action} request`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredReimbursements = reimbursements.filter(req => filter === 'All' ? true : req.status === filter);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Reimbursement Requests</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold">Review and process expense claims from your department employees.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <select
                        className="input-field max-w-[200px]"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Requests</option>
                        <option value="Pending">Pending Only</option>
                        <option value="Manager Approved">Manager Approved</option>
                        <option value="Rejected">Rejected Only</option>
                    </select>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div
                    onClick={() => setFilter('All')}
                    className="glass-card p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/50 transition-colors"
                >
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                        <BanknotesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Claims</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1">{stats.total}</p>
                </div>

                <div
                    onClick={() => setFilter('Pending')}
                    className="glass-card p-6 flex flex-col justify-center items-center text-center relative overflow-hidden cursor-pointer hover:bg-white/50 transition-colors"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4 relative z-10 pointer-events-none">
                        <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider relative z-10 pointer-events-none">Pending Action</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1 relative z-10 pointer-events-none">{stats.pendingCount}</p>
                </div>

                <div
                    onClick={() => setFilter('Manager Approved')}
                    className="glass-card p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/50 transition-colors"
                >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Approved Value</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1">${stats.approvedValue.toFixed(2)}</p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/40 dark:border-white/10 flex items-center bg-white/40 dark:bg-[#0f0f11]">
                    <BanknotesIcon className="w-6 h-6 mr-2 text-primary-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Action Required</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10">
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Employee</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Type & Info</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 dark:divide-white/10">
                            {filteredReimbursements.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <EmptyState title="No Claims Found" message="There are no reimbursement claims matching your filter." />
                                    </td>
                                </tr>
                            ) : (
                                filteredReimbursements.map((req) => (
                                    <tr key={req._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold mr-3 border border-white dark:border-white/10">
                                                    {req.employee?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{req.employee?.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">{req.employee?.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                                            {new Date(req.expenseDate).toLocaleDateString()}
                                            <div className="mt-1">
                                                <span className={`px - 2 py - 0.5 rounded - md text - [10px] font - black uppercase tracking - wider ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400' :
                                                        req.status === 'Manager Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400' :
                                                            req.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' :
                                                                'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                                                    } `}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{req.expenseType}</p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs truncate">{req.description}</p>
                                            {req.receiptUrl && (
                                                <a href={getReceiptUrl(req.receiptUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block font-semibold">
                                                    View Receipt
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center mt-3">
                                            <CurrencyDollarIcon className="w-4 h-4 text-green-500 mr-1" />
                                            {req.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right">
                                            {req.status === 'Pending' ? (
                                                <div className="space-x-2 flex justify-end">
                                                    <button
                                                        onClick={() => handleAction(req._id, 'approve')}
                                                        disabled={actionLoading === req._id}
                                                        className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 rounded-xl transition-colors font-semibold disabled:opacity-50"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req._id, 'reject')}
                                                        disabled={actionLoading === req._id}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 rounded-xl transition-colors font-semibold disabled:opacity-50"
                                                    >
                                                        <XCircleIcon className="w-4 h-4 mr-1.5" />
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReimbursementRequests;
