import React, { useState, useEffect } from 'react';
import { PlusIcon, BanknotesIcon, CurrencyDollarIcon, DocumentIcon, DocumentCheckIcon, CalendarIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { reimbursementService } from '../services/reimbursementService';

const MyReimbursements = () => {
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        expenseType: 'Travel',
        amount: '',
        expenseDate: '',
        description: '',
        receiptUrl: null
    });

    useEffect(() => {
        fetchReimbursements();
    }, []);

    const fetchReimbursements = async () => {
        try {
            const data = await reimbursementService.getMyReimbursements();
            setReimbursements(data.data);
        } catch (error) {
            toast.error('Failed to load reimbursements');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(formData.amount) <= 0) {
            return toast.error('Amount must be greater than 0');
        }

        const submitData = new FormData();
        submitData.append('expenseType', formData.expenseType);
        submitData.append('amount', formData.amount);
        submitData.append('expenseDate', formData.expenseDate);
        submitData.append('description', formData.description);

        if (formData.receiptUrl) {
            submitData.append('receiptUrl', formData.receiptUrl);
        }

        setIsSubmitting(true);
        try {
            await reimbursementService.applyReimbursement(submitData);
            toast.success('Reimbursement request submitted successfully!');
            setShowApplyModal(false);
            setFormData({ expenseType: 'Travel', amount: '', expenseDate: '', description: '', receiptUrl: null });
            fetchReimbursements();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateStats = (data) => {
        const approved = data.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.amount, 0);
        const pending = data.filter(r => r.status === 'Pending' || r.status === 'Manager Approved').reduce((sum, r) => sum + r.amount, 0);
        return {
            total: data.length,
            approvedAmount: approved,
            pendingAmount: pending
        };
    };

    const stats = calculateStats(reimbursements);

    const filteredReimbursements = filterStatus === 'All'
        ? reimbursements
        : reimbursements.filter(r => r.status === filterStatus);

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
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">My Reimbursements</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold">Track your expense claims and their approval status.</p>
                </div>
                <button onClick={() => setShowApplyModal(true)} className="btn btn-primary flex items-center shadow-primary-500/30">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Request
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden">
                    <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/20 dark:from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-2">Approved Value</p>
                        <p className="text-5xl font-black text-slate-800 dark:text-zinc-100"><span className="text-3xl text-slate-400 dark:text-zinc-500 font-semibold mr-1">$</span>{stats.approvedAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden">
                    <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 dark:from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-2">Pending Value</p>
                        <p className="text-5xl font-black text-slate-800 dark:text-zinc-100"><span className="text-3xl text-slate-400 dark:text-zinc-500 font-semibold mr-1">$</span>{stats.pendingAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden">
                    <div className="absolute -inset-4 bg-gradient-to-br from-purple-400/20 dark:from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-2">Total Claims</p>
                        <p className="text-5xl font-black text-slate-800 dark:text-zinc-100">{stats.total} <span className="text-xl text-slate-400 dark:text-zinc-500 font-semibold ml-1">submitted</span></p>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/40 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-[#0f0f11]">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center">
                        <BanknotesIcon className="w-6 h-6 mr-2 text-primary-500" />
                        Expense History
                    </h2>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field w-auto py-1.5 text-sm"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Manager Approved">Manager Approved</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10">
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Reviewed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 dark:divide-white/10">
                            {filteredReimbursements.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-0">
                                        <EmptyState title="No Claims Found" message="You haven't submitted any reimbursement claims yet for this filter." />
                                    </td>
                                </tr>
                            ) : (
                                filteredReimbursements.map((req) => (
                                    <tr key={req._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm font-semibold text-slate-800 dark:text-zinc-100 whitespace-nowrap">
                                            {new Date(req.expenseDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-slate-600 dark:text-zinc-300">
                                            {req.expenseType}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center">
                                            <CurrencyDollarIcon className="w-4 h-4 text-green-500 mr-1" />
                                            {req.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-zinc-400 max-w-xs truncate">
                                            {req.description}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                            {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply Reimbursement Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}></div>

                        <div className="inline-block w-full max-w-lg p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#f3f4f6] dark:bg-[#1a1a20] shadow-2xl rounded-[32px] border border-white/40 dark:border-white/5 relative z-10">
                            <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-6">
                                Apply for Reimbursement
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5 ml-1">Expense Type</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <DocumentCheckIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                            </div>
                                            <select name="expenseType" value={formData.expenseType} onChange={handleChange} required className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow">
                                                <option value="Travel">Travel</option>
                                                <option value="Meals">Meals</option>
                                                <option value="Supplies">Supplies</option>
                                                <option value="Training">Training</option>
                                                <option value="Internet">Internet</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5 ml-1">Amount ($)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <CurrencyDollarIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                            </div>
                                            <input type="number" step="0.01" min="0.01" name="amount" value={formData.amount} onChange={handleChange} required className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow" placeholder="0.00" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5 ml-1">Expense Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                        </div>
                                        <input type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} required max={new Date().toISOString().split('T')[0]} className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5 ml-1">Description</label>
                                    <div className="relative">
                                        <div className="absolute top-3.5 left-3.5 pointer-events-none">
                                            <DocumentTextIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                        </div>
                                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow resize-none" placeholder="Briefly describe the business purpose..."></textarea>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5 ml-1">Receipt Proof (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <LinkIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                        </div>
                                        <input type="file" accept="image/jpeg, image/png, application/pdf" name="receiptUrl" onChange={handleChange} className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-2 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow file:mr-4 file:py-2 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400 cursor-pointer" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 ml-1">Upload an image or scan of your receipt (.png, .jpg, .pdf - max 5MB)</p>
                                </div>

                                <div className="mt-8 flex justify-end space-x-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowApplyModal(false)}
                                        className="px-6 py-3 bg-white dark:bg-[#0f0f11] border border-gray-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-primary-500 text-white rounded-2xl font-semibold hover:bg-primary-600 transition-colors shadow-md disabled:opacity-50 min-w-[170px]"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex justify-center items-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            'Submit Request'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReimbursements;
