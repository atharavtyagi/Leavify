import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { DocumentTextIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';

const LeaveRequests = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [actionModal, setActionModal] = useState({ show: false, leaveId: null, action: '' });
    const [managerComment, setManagerComment] = useState('');
    const [conflict, setConflict] = useState({ isConflict: false, reason: '' });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves');
            const sortedLeaves = res.data.data.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
            setLeaves(sortedLeaves);
            calculateStats(sortedLeaves);
        } catch (error) {
            toast.error('Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const approvedCount = data.filter(l => l.status === 'Approved').length;
        const pendingCount = data.filter(l => l.status === 'Pending').length;
        setStats({ total: data.length, pending: pendingCount, approved: approvedCount });
    };

    const handleActionClick = (leaveId, action) => {
        setActionModal({ show: true, leaveId, action });
        setConflict({ isConflict: false, reason: '' });
    };

    const submitAction = async () => {
        try {
            const payload = {
                status: actionModal.action,
                managerComment
            };
            if (conflict.isConflict && conflict.reason) {
                payload.conflictOverrideReason = conflict.reason;
            }

            await api.put(`/leaves/${actionModal.leaveId}`, payload);
            toast.success(`Leave request ${actionModal.action.toLowerCase()} successfully`);
            setActionModal({ show: false, leaveId: null, action: '' });
            setManagerComment('');
            setConflict({ isConflict: false, reason: '' });
            fetchLeaves();
        } catch (error) {
            if (error.response?.data?.requiresOverride) {
                setConflict({ isConflict: true, reason: '' });
                toast.error(error.response?.data?.error || 'Conflict detected');
            } else {
                toast.error(error.response?.data?.error || 'Action failed');
            }
        }
    };

    const filteredLeaves = leaves.filter(leave => filter === 'All' ? true : leave.status === filter);

    const checkConflict = (pendingLeave) => {
        if (pendingLeave.status !== 'Pending' || !pendingLeave.employee || !pendingLeave.employee.department) return { isConflict: false };

        const department = pendingLeave.employee.department;
        const startDate = new Date(pendingLeave.startDate);
        const endDate = new Date(pendingLeave.endDate);

        const overlappingApproved = leaves.filter(l =>
            l.status === 'Approved' &&
            l._id !== pendingLeave._id &&
            l.employee &&
            l.employee.department === department &&
            new Date(l.startDate) <= endDate &&
            new Date(l.endDate) >= startDate
        );

        const limit = 2; // Hardcoded fallback for UI warning threshold

        if (overlappingApproved.length >= limit) {
            return { isConflict: true, type: 'critical', msg: 'Critical: Over Limit' };
        }

        const overlappingPending = leaves.filter(l =>
            l.status === 'Pending' &&
            l._id !== pendingLeave._id &&
            l.employee &&
            l.employee.department === department &&
            new Date(l.startDate) <= endDate &&
            new Date(l.endDate) >= startDate
        );

        if (overlappingApproved.length + overlappingPending.length >= 1) {
            return { isConflict: true, type: 'warning', msg: 'Multiple Dept Requests' };
        }

        return { isConflict: false };
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Leave Requests</h1>
                    <p className="text-gray-600 mt-1">Review and manage employee leave applications</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <select
                        className="input-field max-w-[200px]"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Requests</option>
                        <option value="Pending">Pending Only</option>
                        <option value="Approved">Approved Only</option>
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
                        <DocumentTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Requests</p>
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
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1 relative z-10 pointer-events-none">{stats.pending}</p>
                </div>

                <div
                    onClick={() => setFilter('Approved')}
                    className="glass-card p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/50 transition-colors"
                >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Approved Leaves</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-zinc-100 mt-1">{stats.approved}</p>
                </div>
            </div>

            <div className="glass-card overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-white/40">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type & Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-white/20">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredLeaves.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-0">
                                    <EmptyState title="No Requests Found" message="There are no leave requests matching the current filter." />
                                </td>
                            </tr>
                        ) : (
                            filteredLeaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-white/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{leave.employee?.name}</div>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-xs text-gray-500">{leave.employee?.department || 'General'}</div>
                                            {(() => {
                                                const conflictRes = checkConflict(leave);
                                                if (conflictRes.isConflict) {
                                                    return (
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${conflictRes.type === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}
                                                            title={conflictRes.type === 'critical' ? "Approving this will cause a department leave conflict" : "Multiple pending requests exist for this period"}
                                                        >
                                                            {conflictRes.msg}
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {leave.riskLevel && (
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${leave.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                                        leave.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}
                                                    title={`Skill Risk Impact: ${leave.riskLevel}`}
                                                >
                                                    Skill Risk: {leave.riskLevel}
                                                </span>
                                            )}
                                        </div>
                                        {leave.backupEmployee && (
                                            <div className="mt-1">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${leave.backupConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    Cover: {leave.backupEmployee.name} ({leave.backupConfirmed ? 'Confirmed' : 'Pending'})
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-medium text-primary-600">{leave.type}</div>
                                        <div>{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>
                                        {leave.reason}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                        {leave.status === 'Pending' ? (
                                            <div className="space-x-2 flex justify-end">
                                                <button
                                                    onClick={() => handleActionClick(leave._id, 'Approved')}
                                                    className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 rounded-xl transition-colors font-semibold"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleActionClick(leave._id, 'Rejected')}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 rounded-xl transition-colors font-semibold"
                                                >
                                                    <XCircleIcon className="w-4 h-4 mr-1.5" />
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {actionModal.show && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setActionModal({ show: false, leaveId: null, action: '' })}></div>

                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 backdrop-blur-3xl shadow-2xl rounded-3xl border border-white/50">
                            <h3 className={`text-lg font-bold leading-6 mb-4 ${actionModal.action === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                                {actionModal.action === 'Approved' ? 'Approve' : 'Reject'} Leave Request
                            </h3>

                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-4">
                                    Are you sure you want to {actionModal.action.toLowerCase()} this leave request? You can optionally provide a comment.
                                </p>

                                <label className="block text-sm font-medium text-gray-700">Manager Comment (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={managerComment}
                                    onChange={(e) => setManagerComment(e.target.value)}
                                    className="input-field mt-1 resize-none"
                                    placeholder="E.g., Approved, please ensure a handover is done..."
                                ></textarea>

                                {conflict.isConflict && actionModal.action === 'Approved' && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <label className="block text-sm font-medium text-red-700">Team Conflict Detected</label>
                                        <p className="text-xs text-red-600 mb-2">Multiple employees in this department have approved leaves during this period. An override reason is required.</p>
                                        <textarea
                                            rows="2"
                                            value={conflict.reason}
                                            onChange={(e) => setConflict({ ...conflict, reason: e.target.value })}
                                            className="input-field mt-1 border-red-300 focus:border-red-500 focus:ring-red-500"
                                            placeholder="Provide reason for overriding this conflict..."
                                            required
                                        ></textarea>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => { setActionModal({ show: false, leaveId: null, action: '' }); setConflict({ isConflict: false, reason: '' }); }}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitAction}
                                    className={`btn ${actionModal.action === 'Approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-danger'}`}
                                >
                                    Confirm {actionModal.action}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequests;
