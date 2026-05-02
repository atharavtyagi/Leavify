import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChatBubbleLeftEllipsisIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ChatModal from '../components/ChatModal';

const AllLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatModal, setChatModal] = useState({ isOpen: false, contextId: null });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves');
            setLeaves(res.data.data.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)));
        } catch (error) {
            toast.error('Failed to fetch leaves');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/leaves/${id}`, { status });
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            fetchLeaves();
        } catch (error) {
            toast.error(error.response?.data?.error || `Failed to ${status.toLowerCase()} leave`);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">All Company Leaves</h1>
                <p className="text-gray-600 dark:text-zinc-400 mt-1">Global view of all leave applications across the company.</p>
            </div>

            <div className="glass-card overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
                    <thead className="bg-white/40 dark:bg-[#0f0f11]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leave Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discussion</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-white/20 dark:divide-white/10">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : leaves.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No leave applications found.
                                </td>
                            </tr>
                        ) : (
                            leaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-zinc-100">{leave.employee?.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{leave.employee?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium text-gray-900 dark:text-zinc-100">{leave.type}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-zinc-400">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(leave.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {leave.status === 'Pending' && leave.employee?.role === 'Manager' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(leave._id, 'Approved')}
                                                        className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 rounded-xl transition-colors font-semibold"
                                                        title="Approve Leave"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(leave._id, 'Rejected')}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 rounded-xl transition-colors font-semibold"
                                                        title="Reject Leave"
                                                    >
                                                        <XCircleIcon className="w-4 h-4 mr-1.5" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setChatModal({ isOpen: true, contextId: leave._id })}
                                                className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20 rounded-xl transition-colors font-semibold text-xs border border-slate-200 dark:border-white/10"
                                            >
                                                <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1.5" />
                                                View Chat
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ChatModal
                isOpen={chatModal.isOpen}
                onClose={() => setChatModal({ isOpen: false, contextId: null })}
                contextType="leave"
                contextId={chatModal.contextId}
                title="Leave Application Discussion (Read-Only)"
            />
        </div>
    );
};

export default AllLeaves;
