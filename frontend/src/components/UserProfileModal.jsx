import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { XMarkIcon, BriefcaseIcon, BanknotesIcon, CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserProfileModal = ({ user, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                // Fetch all required data in parallel
                const [balanceRes, leaveRes, reimbRes] = await Promise.all([
                    api.get('/balances'),
                    api.get('/leaves'),
                    api.get('/reimbursements/all')
                ]);

                // Filter data for the specific user
                const userBalance = balanceRes.data.data.find(b => b.user._id === user._id || b.user === user._id);
                const userLeaves = leaveRes.data.data.filter(l => l.employee._id === user._id || l.employee === user._id);
                const userReimbursements = reimbRes.data.data.filter(r => r.employee._id === user._id || r.employee === user._id);

                setBalance(userBalance);
                setLeaves(userLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                setReimbursements(userReimbursements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

            } catch (error) {
                console.error("Error fetching user profile data:", error);
                toast.error('Failed to load complete user profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-gray-900/75 backdrop-blur-sm">
            <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-[#0f0f11] rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20 dark:border-white/10">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-[#16161a]">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xl shadow-inner">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                                {user.name}
                            </h3>
                            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                                {user.role} • {user.department || 'General'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-full transition-all">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-transparent">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
                            <p className="text-slate-500 dark:text-zinc-400 font-semibold animate-pulse">Aggregating Profile Data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Column 1: Identity & Balances */}
                            <div className="space-y-6">
                                {/* Identity Card */}
                                <div className="glass-card p-5 border border-white/40 dark:border-white/10 rounded-2xl shadow-sm bg-white/70 dark:bg-[#16161a]">
                                    <h4 className="flex items-center text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/10 pb-2">
                                        <UserCircleIcon className="w-5 h-5 mr-2 text-primary-500" />
                                        Identity & Skills
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Email Address</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Registered On</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Tracked Skills</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {user.skills && user.skills.length > 0 ? (
                                                    user.skills.map(skill => (
                                                        <span key={skill} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-bold border border-indigo-100 dark:border-indigo-800/50">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-slate-400 italic">No skills documented.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Leave Balances Card */}
                                <div className="glass-card p-5 border border-white/40 dark:border-white/10 rounded-2xl shadow-sm bg-white/70 dark:bg-[#16161a]">
                                    <h4 className="flex items-center text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/10 pb-2">
                                        <BriefcaseIcon className="w-5 h-5 mr-2 text-emerald-500" />
                                        Current Balances
                                    </h4>
                                    {balance ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30">
                                                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">Annual Leave</span>
                                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{balance.annualLeave} <span className="text-xs font-semibold text-emerald-500/70">days</span></span>
                                            </div>
                                            <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                                                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">Sick Leave</span>
                                                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{balance.sickLeave} <span className="text-xs font-semibold text-blue-500/70">days</span></span>
                                            </div>
                                            <div className="flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                                                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">Casual Leave</span>
                                                <span className="text-lg font-black text-purple-600 dark:text-purple-400">{balance.casualLeave} <span className="text-xs font-semibold text-purple-500/70">days</span></span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Balance record not initialized.</p>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Leave History */}
                            <div className="glass-card p-5 border border-white/40 dark:border-white/10 rounded-2xl shadow-sm bg-white/70 dark:bg-[#16161a] flex flex-col">
                                <h4 className="flex items-center text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/10 pb-2 flex-shrink-0">
                                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-rose-500" />
                                    Recent Leaves ({leaves.length})
                                </h4>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {leaves.length > 0 ? leaves.slice(0, 10).map(leave => (
                                        <div key={leave._id} className="p-3 bg-white dark:bg-[#0f0f11] rounded-xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">{leave.type}</span>
                                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        leave.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mb-2">
                                                {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {' '}—{' '}
                                                {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-zinc-500 bg-slate-50 dark:bg-white/5 p-2 rounded-lg italic line-clamp-2">
                                                "{leave.reason}"
                                            </p>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                                            <CalendarDaysIcon className="w-12 h-12 text-slate-400 mb-2" />
                                            <p className="text-sm font-semibold text-slate-500">No leave requests found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Expense History */}
                            <div className="glass-card p-5 border border-white/40 dark:border-white/10 rounded-2xl shadow-sm bg-white/70 dark:bg-[#16161a] flex flex-col">
                                <h4 className="flex items-center text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/10 pb-2 flex-shrink-0">
                                    <BanknotesIcon className="w-5 h-5 mr-2 text-amber-500" />
                                    Recent Expenses ({reimbursements.length})
                                </h4>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {reimbursements.length > 0 ? reimbursements.slice(0, 10).map(expense => (
                                        <div key={expense._id} className="p-3 bg-white dark:bg-[#0f0f11] rounded-xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">{expense.type}</span>
                                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${expense.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        expense.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                            expense.status === 'Manager Approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {expense.status === 'Manager Approved' ? 'L1 Apprv' : expense.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                                                    {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-sm font-black text-slate-800 dark:text-zinc-100 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-emerald-800/30">
                                                    ${expense.amount.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-zinc-500 bg-slate-50 dark:bg-white/5 p-2 rounded-lg italic truncate">
                                                "{expense.description}"
                                            </p>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                                            <BanknotesIcon className="w-12 h-12 text-slate-400 mb-2" />
                                            <p className="text-sm font-semibold text-slate-500">No expense claims found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
