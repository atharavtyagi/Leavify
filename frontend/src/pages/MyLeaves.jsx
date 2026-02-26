import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, DocumentCheckIcon, CalendarIcon, DocumentTextIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const MyLeaves = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);

    const [formData, setFormData] = useState({
        type: 'Sick',
        startDate: '',
        endDate: '',
        reason: '',
        backupEmployee: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const leavesRes = await api.get('/leaves').catch(() => ({ data: { data: [] } }));
            const balanceRes = await api.get('/balances/me').catch(() => null);
            const usersRes = await api.get('/users').catch(() => ({ data: { data: [] } }));

            // Only show leaves where the current user is the actual applicant
            const currentUserId = user._id || user.id;
            const myLeavesOnly = leavesRes.data.data.filter(l => (l.employee?._id === currentUserId) || (l.employee === currentUserId));
            setLeaves(myLeavesOnly.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)));
            setUsers(usersRes.data.data);

            if (balanceRes && balanceRes.data) {
                setBalance(balanceRes.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/leaves', formData);
            toast.success('Leave applied successfully');
            setShowApplyModal(false);
            setFormData({ type: 'Sick', startDate: '', endDate: '', reason: '', backupEmployee: '' });
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.error;
            toast.error(typeof msg === 'string' ? msg : msg?.[0] || 'Application failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">My Leaves</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">View and manage your leave applications</p>
                </div>
                <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn btn-primary mt-4 sm:mt-0"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Apply Leave
                </button>
            </div>

            {balance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden">
                        <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/20 dark:from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-2">Annual Leave</p>
                            <p className="text-5xl font-black text-slate-800 dark:text-zinc-100">{balance.annualLeave} <span className="text-xl text-slate-400 dark:text-zinc-500 font-semibold ml-1">left</span></p>
                        </div>
                    </div>
                    <div className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden">
                        <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 dark:from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-2">Sick Leave</p>
                            <p className="text-5xl font-black text-slate-800 dark:text-zinc-100">{balance.sickLeave} <span className="text-xl text-slate-400 dark:text-zinc-500 font-semibold ml-1">left</span></p>
                        </div>
                    </div>
                    <div className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden">
                        <div className="absolute -inset-4 bg-gradient-to-br from-purple-400/20 dark:from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest mb-2">Casual Leave</p>
                            <p className="text-5xl font-black text-slate-800 dark:text-zinc-100">{balance.casualLeave} <span className="text-xl text-slate-400 dark:text-zinc-500 font-semibold ml-1">left</span></p>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-card overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
                    <thead className="bg-white/40 dark:bg-[#0f0f11]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leave Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applied On</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manager Comment</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-white/20 dark:divide-white/10">
                        {leaves.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-0">
                                    <EmptyState title="No Leaves Found" message="You haven't applied for any leaves yet. Click 'Apply Leave' to get started." />
                                </td>
                            </tr>
                        ) : (
                            leaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900 dark:text-zinc-100">{leave.type}</div>
                                        {leave.riskLevel && (
                                            <div className="mt-1">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${leave.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                                        leave.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    Skill Risk: {leave.riskLevel}
                                                </span>
                                            </div>
                                        )}
                                        {leave.backupEmployee && (
                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                                                <div>
                                                    Cover: {leave.backupEmployee.name}
                                                    <span className={`ml-1 font-semibold ${leave.backupConfirmed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-500'}`}>
                                                        ({leave.backupConfirmed ? 'Confirmed' : 'Pending'})
                                                    </span>
                                                </div>
                                                {leave.backupComment && (
                                                    <div className="p-1.5 bg-gray-50 dark:bg-[#0f0f11] rounded border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 italic mt-0.5">
                                                        "{leave.backupComment}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(leave.appliedOn).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(leave.status)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {leave.managerComment || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showApplyModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}></div>

                        <div className="inline-block w-full max-w-lg p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#f3f4f6] dark:bg-[#1a1a20] shadow-2xl rounded-[32px] border border-white/40 dark:border-white/5 relative z-10">
                            <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-6">
                                Apply for Leave
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Leave Type</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <DocumentCheckIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                        </div>
                                        <select
                                            name="type"
                                            required
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow"
                                        >
                                            <option value="Sick">Sick Leave</option>
                                            <option value="Casual">Casual Leave</option>
                                            <option value="Annual">Annual Leave</option>
                                            <option value="Maternity">Maternity Leave</option>
                                            <option value="Paternity">Paternity Leave</option>
                                            <option value="Unpaid">Unpaid Leave</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Start Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                            </div>
                                            <input
                                                type="text"
                                                name="startDate"
                                                required
                                                value={formData.startDate}
                                                onFocus={(e) => (e.target.type = "date")}
                                                onBlur={(e) => (e.target.value === "" ? (e.target.type = "text") : null)}
                                                onChange={handleChange}
                                                placeholder="dd-mm-yyyy"
                                                className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">End Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                            </div>
                                            <input
                                                type="text"
                                                name="endDate"
                                                required
                                                value={formData.endDate}
                                                onFocus={(e) => (e.target.type = "date")}
                                                onBlur={(e) => (e.target.value === "" ? (e.target.type = "text") : null)}
                                                onChange={handleChange}
                                                placeholder="dd-mm-yyyy"
                                                className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Reason</label>
                                    <div className="relative">
                                        <div className="absolute top-3.5 left-3.5 pointer-events-none">
                                            <DocumentTextIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                        </div>
                                        <textarea
                                            name="reason"
                                            required
                                            rows="2"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow resize-none"
                                            placeholder="Briefly explain your reason for leave..."
                                        ></textarea>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Backup Employee (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <UsersIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                        </div>
                                        <select
                                            name="backupEmployee"
                                            value={formData.backupEmployee}
                                            onChange={handleChange}
                                            className="w-full bg-white dark:bg-[#0f0f11] border-none rounded-2xl py-3.5 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-zinc-100 outline-none transition-shadow"
                                        >
                                            <option value="">-- No Backup Assigned --</option>
                                            {users
                                                .filter(u =>
                                                    u.role !== 'Admin' &&
                                                    u._id !== (user?._id || user?.id) &&
                                                    u.department === user?.department &&
                                                    (user?.skills || []).some(s => (u.skills || []).includes(s))
                                                )
                                                .map(u => {
                                                    const sharedSkills = (user?.skills || []).filter(s => (u.skills || []).includes(s));
                                                    return (
                                                        <option key={u._id} value={u._id}>
                                                            {u.name} {sharedSkills.length > 0 ? `(${sharedSkills.length} Shared Skills)` : ''}
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">Select a colleague to cover for you. They must confirm this request.</p>
                                </div>

                                {balance && (formData.type === 'Annual' || formData.type === 'Sick' || formData.type === 'Casual') && (
                                    <div className="bg-[#eef2ff] dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 p-4 rounded-2xl text-sm border border-indigo-100 dark:border-indigo-800/50 mt-4 leading-relaxed">
                                        <strong className="text-indigo-800 dark:text-indigo-300">Note:</strong> You have <span className="font-semibold">{formData.type === 'Annual' ? balance.annualLeave : formData.type === 'Sick' ? balance.sickLeave : balance.casualLeave} days</span> remaining for this leave type. Weekends and public holidays are excluded from deductions.
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-white/20 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowApplyModal(false)}
                                        className="btn btn-secondary px-6"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn btn-primary px-8 shadow-primary-500/30"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            'Apply Leave'
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

export default MyLeaves;
