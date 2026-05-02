import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ClipboardDocumentCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';

const AdminReview = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/delegation/review');
            if (res.data.success) {
                setLeaves(res.data.data.leaves);
                setReimbursements(res.data.data.reimbursements);
            }
        } catch (error) {
            toast.error('Failed to load review pending items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.role === 'Admin') {
            fetchData();
        }
    }, [user]);

    const handleVerify = async (type, id) => {
        try {
            await api.patch(`/admin/delegation/verify/${type}/${id}`);
            toast.success('Successfully verified delegation action');
            fetchData();
        } catch (error) {
            toast.error('Failed to verify action');
        }
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
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight flex items-center">
                    <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
                    Delegation Review Panel
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">
                    Review and verify actions taken by Acting Admins during your absence
                </p>
            </div>

            <div className="space-y-10">
                {/* Leaves Section */}
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-[#0f0f11]">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Leaves Approved by Acting Admins</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
                            <thead className="bg-slate-50/50 dark:bg-[#16161a]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acting Admin</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Leave Info</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20 dark:divide-white/10">
                                {leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-0">
                                            <EmptyState title="No Pending Leave Reviews" message="All leave approvals by acting admins have been verified." />
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.map(leave => (
                                        <tr key={leave._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{leave.employee?.name}</p>
                                                <p className="text-xs text-slate-500">{leave.employee?.department}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                    {leave.approvedByActingAdmin?.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{leave.type} Leave</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleVerify('leave', leave._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4 mr-1" /> Verify
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reimbursements Section */}
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-[#0f0f11]">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Claims Approved by Acting Admins</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
                            <thead className="bg-slate-50/50 dark:bg-[#16161a]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acting Admin</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Claim Summary</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20 dark:divide-white/10">
                                {reimbursements.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-0">
                                            <EmptyState title="No Pending Claim Reviews" message="All reimbursement approvals by acting admins have been verified." />
                                        </td>
                                    </tr>
                                ) : (
                                    reimbursements.map(reimb => (
                                        <tr key={reimb._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{reimb.employee?.name}</p>
                                                <p className="text-xs text-slate-500">{reimb.employee?.department}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                    {reimb.approvedByActingAdmin?.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${reimb.amount.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-slate-500">{reimb.expenseType}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleVerify('reimbursement', reimb._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4 mr-1" /> Verify
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReview;
