import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, BanknotesIcon, TrashIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { reimbursementService } from '../services/reimbursementService';
import { STATIC_BASE_URL } from '../services/api';

const AllReimbursements = () => {
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState({ total: 0, approvedAmount: 0, pendingAmount: 0 });

    useEffect(() => {
        fetchReimbursements();
    }, []);

    const fetchReimbursements = async () => {
        try {
            const data = await reimbursementService.getAllReimbursements();
            setReimbursements(data.data);
            calculateStats(data.data);
        } catch (error) {
            toast.error('Failed to load reimbursements');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const approved = data.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.amount, 0);
        const pending = data.filter(r => r.status === 'Pending' || r.status === 'Manager Approved').reduce((sum, r) => sum + r.amount, 0);
        setStats({ total: data.length, approvedAmount: approved, pendingAmount: pending });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this reimbursement record?')) return;

        try {
            await reimbursementService.deleteReimbursement(id);
            toast.success('Reimbursement deleted');
            const updated = reimbursements.filter(req => req._id !== id);
            setReimbursements(updated);
            calculateStats(updated);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete request');
        }
    };

    const getReceiptUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${STATIC_BASE_URL}${url}`;
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
            // Update the local state to match the new status
            const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
            const updated = reimbursements.map(req => req._id === id ? { ...req, status: newStatus } : req);
            setReimbursements(updated);
            calculateStats(updated);
        } catch (error) {
            toast.error(error.response?.data?.error || `Failed to ${action} request`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Manager Approved':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Financial Overview</h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold">Monitor company-wide reimbursement claims and expenditures.</p>
            </div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                        <BanknotesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Claims</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1">{stats.total}</p>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Approved Payouts</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1">${stats.approvedAmount.toFixed(2)}</p>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4 relative z-10">
                        <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider relative z-10">Pending Value</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1 relative z-10">${stats.pendingAmount.toFixed(2)}</p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/40 dark:border-white/10 flex items-center bg-white/40 dark:bg-[#0f0f11]">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100">All Master Records</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10">
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Employee & Dept</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Type / Desc</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date & Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 dark:divide-white/10">
                            {reimbursements.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <EmptyState title="No Records" message="No reimbursement records exist in the database." />
                                    </td>
                                </tr>
                            ) : (
                                reimbursements.map((req) => (
                                    <tr key={req._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{req.employee?.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">{req.employee?.department}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{req.expenseType}</p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs truncate">{req.description}</p>
                                            {req.receiptUrl && (
                                                <a href={getReceiptUrl(req.receiptUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block font-semibold">Receipt Link</a>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300 mb-2">
                                                {new Date(req.expenseDate).toLocaleDateString()}
                                            </p>
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${getStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-black text-slate-800 dark:text-zinc-100">
                                            ${req.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="space-x-2 flex justify-end">
                                                {(req.status === 'Pending' || req.status === 'Manager Approved') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req._id, 'approve')}
                                                            disabled={actionLoading === req._id}
                                                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 rounded-xl transition-colors font-semibold disabled:opacity-50"
                                                            title="Final Approve"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req._id, 'reject')}
                                                            disabled={actionLoading === req._id}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 rounded-xl transition-colors font-semibold disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircleIcon className="w-4 h-4 mr-1.5" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(req._id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors font-semibold"
                                                    title="Delete Record"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
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

export default AllReimbursements;
