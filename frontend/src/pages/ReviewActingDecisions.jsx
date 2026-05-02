import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    CheckBadgeIcon, 
    ArrowsRightLeftIcon, 
    CalendarIcon, 
    BanknotesIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';

const ReviewActingDecisions = () => {
    const [reviews, setReviews] = useState({ leaves: [], reimbursements: [] });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reviews');
            setReviews(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch acting manager decisions');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (type, id) => {
        setProcessingId(id);
        try {
            await api.post(`/reviews/${type}/${id}/accept`);
            toast.success('Decision accepted and confirmed');
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to accept decision');
        } finally {
            setProcessingId(null);
        }
    };

    const handleOverride = async (type, id, currentStatus) => {
        const newStatus = currentStatus === 'Approved' || currentStatus === 'Manager Approved' ? 'Rejected' : 'Approved';
        const reason = window.prompt(`Please provide a reason for overriding this to ${newStatus}:`);
        
        if (reason === null) return; // Cancelled

        setProcessingId(id);
        try {
            await api.post(`/reviews/${type}/${id}/override`, {
                status: newStatus,
                managerComment: `OVERRIDE: ${reason}`
            });
            toast.success(`Decision overridden to ${newStatus}`);
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to override decision');
        } finally {
            setProcessingId(null);
        }
    };

    const allItems = [
        ...reviews.leaves.map(l => ({ ...l, itemType: 'leave' })),
        ...reviews.reimbursements.map(r => ({ ...r, itemType: 'reimbursement' }))
    ].sort((a, b) => new Date(b.appliedOn || b.createdAt) - new Date(a.appliedOn || a.createdAt));

    const filteredItems = allItems.filter(item => {
        const matchesFilter = filter === 'All' || item.itemType === filter.toLowerCase();
        const matchesSearch = item.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Acting Manager Reviews</h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold">Review and validate decisions taken by your acting manager during your leave period.</p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by employee name..."
                        className="input-field pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFilter('All')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'All' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('Leave')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'Leave' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10'}`}
                    >
                        Leaves
                    </button>
                    <button 
                        onClick={() => setFilter('Reimbursement')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'Reimbursement' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10'}`}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <EmptyState 
                    title="No Pending Reviews" 
                    message="Great! All acting manager decisions have been reviewed."
                />
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item._id} className="glass-card overflow-hidden group">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-xl font-black text-slate-600 dark:text-zinc-300 border border-white dark:border-white/5 shadow-sm">
                                        {item.employee?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{item.employee?.name}</h3>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{item.employee?.department}</p>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        {item.itemType === 'leave' ? (
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                                <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                                <BanknotesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Request Type</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                                                {item.itemType === 'leave' ? `${item.type} Leave` : `${item.expenseType} Expense`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Acting Manager Action</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                                                <span className={`mr-1 px-2 py-0.5 rounded-md text-[10px] uppercase font-black ${item.status === 'Approved' || item.status === 'Manager Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.status}
                                                </span>
                                                <span className="text-[10px] text-slate-400">by {item.approvedByActingManager?.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleAccept(item.itemType, item._id)}
                                        disabled={processingId === item._id}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckBadgeIcon className="w-5 h-5" />
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleOverride(item.itemType, item._id, item.status)}
                                        disabled={processingId === item._id}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowsRightLeftIcon className="w-5 h-5" />
                                        Override
                                    </button>
                                </div>
                            </div>
                            
                            {/* Detailed row */}
                            <div className="px-6 py-3 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 text-xs flex flex-wrap gap-x-6 gap-y-2">
                                <span className="text-slate-500 font-medium">
                                    {item.itemType === 'leave' 
                                        ? `Period: ${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`
                                        : `Amount: $${item.amount?.toFixed(2)} | Date: ${new Date(item.expenseDate).toLocaleDateString()}`
                                    }
                                </span>
                                <span className="text-slate-500 font-medium truncate max-w-md">
                                    Reason: {item.reason || item.description}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewActingDecisions;
