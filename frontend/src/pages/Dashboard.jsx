import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    BanknotesIcon,
    CurrencyDollarIcon,
    ArrowRightIcon,
    UserPlusIcon,
    AdjustmentsHorizontalIcon,
    DocumentMagnifyingGlassIcon,
    ChartPieIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Register ChartJS plugins
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const StatCard = ({ title, value, icon: Icon, colorClass, link }) => {
    const cardContent = (
        <div className="glass-card flex-1 min-w-[200px] h-32 p-6 flex items-center justify-between group cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-white/30 dark:from-white/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col justify-end h-full">
                <p className="text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
                <p className="text-4xl font-black text-slate-800 dark:text-zinc-100 leading-none">{value}</p>
            </div>

            <div className={`p-4 rounded-2xl shadow-lg ${colorClass} self-center shrink-0`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
        </div>
    );
    return link ? <Link to={link} className="flex-1 flex">{cardContent}</Link> : <div className="flex-1 flex">{cardContent}</div>;
};

const Dashboard = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [stats, setStats] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backupRequests, setBackupRequests] = useState([]);
    const [acceptedBackupRequests, setAcceptedBackupRequests] = useState([]);
    const [backupModal, setBackupModal] = useState({ isOpen: false, reqId: null, action: '', comment: '' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const leavesRes = await api.get('/leaves').catch(() => ({ data: { data: [] } }));
                const allLeaves = leavesRes.data.data;

                let leaves = allLeaves;
                if (user.role === 'Employee') {
                    const currentUserId = user._id || user.id;
                    // Split actual requests from backup requests
                    leaves = allLeaves.filter(l => (l.employee?._id === currentUserId) || (l.employee === currentUserId));
                    const reqs = allLeaves.filter(l => (l.backupEmployee?._id === currentUserId || l.backupEmployee === currentUserId) && !l.backupConfirmed);
                    const acceptedReqs = allLeaves.filter(l => (l.backupEmployee?._id === currentUserId || l.backupEmployee === currentUserId) && l.backupConfirmed);
                    setBackupRequests(reqs);
                    setAcceptedBackupRequests(acceptedReqs);
                }

                let usersCount = 0;
                if (user.role === 'Admin') {
                    const usersRes = await api.get('/users').catch(() => ({ data: { data: [] } }));
                    usersCount = usersRes.data.data.length;
                } else if (user.role === 'Employee') {
                    const balanceRes = await api.get('/balances/me').catch(() => null);
                    if (balanceRes && balanceRes.data) {
                        setBalance(balanceRes.data.data);
                    }
                }

                // Analytics Calculations
                const statusCounts = { pending: 0, approved: 0, rejected: 0 };
                const typeCounts = { Sick: 0, Casual: 0, Annual: 0 };
                const departmentAbsences = {};

                leaves.forEach(l => {
                    if (l.status === 'Pending') statusCounts.pending++;
                    if (l.status === 'Approved') statusCounts.approved++;
                    if (l.status === 'Rejected') statusCounts.rejected++;

                    if (l.type === 'Sick') typeCounts.Sick++;
                    if (l.type === 'Casual') typeCounts.Casual++;
                    if (l.type === 'Annual') typeCounts.Annual++;

                    // For department tracking
                    if (l.status === 'Approved' && l.employee?.department) {
                        departmentAbsences[l.employee.department] = (departmentAbsences[l.employee.department] || 0) + 1;
                    }
                });

                let hasConflictRisk = false;
                if (user.role === 'Manager' && user.department) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const in14Days = new Date();
                    in14Days.setDate(today.getDate() + 14);

                    const upcomingDeptLeaves = leaves.filter(l =>
                        l.status === 'Approved' &&
                        l.employee &&
                        l.employee.department === user.department &&
                        new Date(l.endDate) >= today &&
                        new Date(l.startDate) <= in14Days
                    );

                    if (upcomingDeptLeaves.length >= 2) {
                        // Check if they actually overlap on specific days for distinct employees
                        for (let d = new Date(today); d <= in14Days; d.setDate(d.getDate() + 1)) {
                            const overlappingEmployeeIds = new Set();

                            upcomingDeptLeaves.forEach(l => {
                                const start = new Date(l.startDate);
                                start.setHours(0, 0, 0, 0);
                                const end = new Date(l.endDate);
                                end.setHours(23, 59, 59, 999);

                                if (d >= start && d <= end) {
                                    const empId = l.employee._id ? l.employee._id.toString() : l.employee.toString();
                                    overlappingEmployeeIds.add(empId);
                                }
                            });

                            if (overlappingEmployeeIds.size >= 2) {
                                hasConflictRisk = true;
                                break;
                            }
                        }
                    }
                }

                let adminReimbursements = [];
                let pendingPayoutsCount = 0;
                let pendingPayoutValue = 0;
                let activeAbsencesToday = [];

                if (user.role === 'Admin') {
                    const reimbRes = await api.get('/reimbursements/all').catch(() => ({ data: { data: [] } }));
                    adminReimbursements = reimbRes.data.data || [];

                    adminReimbursements.forEach(r => {
                        if (r.status === 'Manager Approved') {
                            pendingPayoutsCount++;
                            pendingPayoutValue += r.amount;
                        }
                    });

                    // Calculate who is on leave TODAY
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    activeAbsencesToday = allLeaves.filter(l => {
                        if (l.status !== 'Approved') return false;
                        const sDate = new Date(l.startDate);
                        sDate.setHours(0, 0, 0, 0);
                        const eDate = new Date(l.endDate);
                        eDate.setHours(23, 59, 59, 999);
                        return today >= sDate && today <= eDate;
                    });
                }

                const calculatedStats = {
                    total: leaves.length,
                    ...statusCounts,
                    totalUsers: usersCount,
                    typeCounts,
                    departmentAbsences,
                    statusCounts,
                    hasConflictRisk,
                    pendingPayoutsCount,
                    pendingPayoutValue,
                    activeAbsencesToday,
                    recentAdminItems: {
                        pendingLeaves: leaves.filter(l => l.status === 'Pending').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, 5),
                        readyPayouts: adminReimbursements.filter(r => r.status === 'Manager Approved').sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)).slice(0, 5)
                    }
                };

                setStats(calculatedStats);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.role, user._id]);

    const handleOpenBackupModal = (reqId, action) => {
        setBackupModal({ isOpen: true, reqId, action, comment: '' });
    };

    const handleBackupAction = async (e) => {
        if (e) e.preventDefault();
        const { reqId, action, comment } = backupModal;
        try {
            await api.post(`/leaves/${reqId}/backup/${action}`, { comment });
            toast.success(`Backup request ${action}d successfully`);
            setBackupModal({ isOpen: false, reqId: null, action: '', comment: '' });

            if (action === 'accept') {
                const reqToMove = backupRequests.find(r => r._id === reqId || r.id === reqId);
                if (reqToMove) {
                    setBackupRequests(prev => prev.filter(r => r._id !== reqId && r.id !== reqId));
                    setAcceptedBackupRequests(prev => [...prev, { ...reqToMove, backupConfirmed: true }]);
                }
            } else {
                setBackupRequests(prev => prev.filter(r => r._id !== reqId && r.id !== reqId));
            }
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to ${action} backup request`);
            setBackupModal({ isOpen: false, reqId: null, action: '', comment: '' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Unable to load dashboard data. Please try refreshing.</p>
            </div>
        );
    }

    // Chart Data Definitions
    const pieChartData = {
        labels: ['Sick Leave', 'Casual Leave', 'Annual Leave'],
        datasets: [
            {
                data: [stats.typeCounts.Sick, stats.typeCounts.Casual, stats.typeCounts.Annual],
                backgroundColor: ['#ef4444', '#3b82f6', '#10b981'],
                hoverBackgroundColor: ['#dc2626', '#2563eb', '#059669'],
                borderWidth: 1,
            },
        ],
    };

    const doughnutChartData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                data: [stats.statusCounts.approved, stats.statusCounts.pending, stats.statusCounts.rejected],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
                borderWidth: 1,
            },
        ],
    };

    // Department Absences Data
    const deptLabels = Object.keys(stats.departmentAbsences);
    const deptDataValues = Object.values(stats.departmentAbsences);

    const departmentChartData = {
        labels: deptLabels.length > 0 ? deptLabels : ['No Data'],
        datasets: [
            {
                data: deptDataValues.length > 0 ? deptDataValues : [1],
                backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#10b981', '#3b82f6'],
                hoverBackgroundColor: ['#7c3aed', '#db2777', '#d97706', '#0891b2', '#059669', '#2563eb'],
                borderWidth: 1,
            },
        ],
    };

    // Employee Accrual Bars Definitions
    let employeeAccrualData = null;
    if (balance) {
        employeeAccrualData = {
            labels: [`Sick (Total: ${balance.sickLeave + stats.typeCounts.Sick})`, `Casual (Total: ${balance.casualLeave + stats.typeCounts.Casual})`, `Annual (Total: ${balance.annualLeave + stats.typeCounts.Annual})`],
            datasets: [
                {
                    label: 'Leaves Used',
                    data: [stats.typeCounts.Sick, stats.typeCounts.Casual, stats.typeCounts.Annual],
                    backgroundColor: '#10b981',
                },
                {
                    label: 'Leaves Remaining',
                    data: [balance.sickLeave, balance.casualLeave, balance.annualLeave],
                    backgroundColor: '#e5e7eb',
                }
            ]
        };
    }

    const barOptions = {
        indexAxis: 'y',
        responsive: true,
        scales: {
            x: { stacked: true },
            y: { stacked: true }
        }
    };


    return (
        <div>
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                    {user.name.split(' ')[0]}'s Dashboard
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">Overview of your {user.role === 'Admin' || user.role === 'Manager' ? 'organization\'s' : 'personal'} leave statistics.</p>
            </div>

            {stats.hasConflictRisk && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-md flex items-start shadow-sm">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-bold text-red-800 dark:text-red-300">High Team Leave Conflict Risk</h3>
                        <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                            <p>Multiple employees in your department have approved leaves overlapping in the next 14 days. Please review upcoming requests carefully.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Standard Metrics */}
            {user.role === 'Admin' ? (
                <>
                    {/* Admin KPI Ribbon */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8 w-full items-stretch h-auto md:h-32">
                        <StatCard title="Total Employees" value={stats.totalUsers} icon={UsersIcon} colorClass="bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/30" link="/manage-users" />
                        <StatCard title="On Leave Today" value={stats.activeAbsencesToday.length} icon={ClockIcon} colorClass="bg-gradient-to-br from-rose-400 to-red-600 shadow-red-500/30" link="/all-leaves" />
                        <StatCard title="Pending Approvals" value={stats.pending} icon={ClipboardDocumentListIcon} colorClass="bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/30" link="/all-leaves" />
                        <StatCard title="Awaiting Payout" value={stats.pendingPayoutsCount} icon={BanknotesIcon} colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30" link="/all-reimbursements" />
                    </div>

                    {/* Today's Absences Live Widget */}
                    <div className="mb-10 glass-card overflow-hidden border border-white/20 dark:border-white/10">
                        <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 bg-gradient-to-r from-rose-500/10 dark:from-rose-500/20 to-transparent flex items-center justify-between">
                            <div className="flex items-center">
                                <ClockIcon className="h-6 w-6 text-rose-500 dark:text-rose-400 mr-2" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">Today's Active Absences</h2>
                            </div>
                            <span className="px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 rounded-full text-xs font-bold tracking-wider uppercase">
                                {stats.activeAbsencesToday.length} Out of Office
                            </span>
                        </div>

                        {stats.activeAbsencesToday.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {stats.activeAbsencesToday.map(leave => (
                                    <div key={leave._id} className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-white/40 dark:border-white/5 flex items-center shadow-sm">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg mr-4">
                                            {leave.employee?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-zinc-100">{leave.employee?.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{leave.employee?.department || 'General'} • {leave.type} Leave</p>
                                            <p className="text-xs font-semibold text-rose-500 mt-1">Returns: {new Date(new Date(leave.endDate).getTime() + 86400000).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-slate-500 dark:text-zinc-400 font-medium">All employees are present today. Great attendance!</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Access Control Panel */}
                    <div className="mb-10">
                        <h2 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/manage-users" className="glass-card p-4 flex items-center space-x-3 hover:-translate-y-1 transition-transform group">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 transition-colors"><UserPlusIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
                                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">Add Users</span>
                            </Link>
                            <Link to="/manage-balances" className="glass-card p-4 flex items-center space-x-3 hover:-translate-y-1 transition-transform group">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 transition-colors"><AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">Leave Balances</span>
                            </Link>
                            <Link to="/all-reimbursements" className="glass-card p-4 flex items-center space-x-3 hover:-translate-y-1 transition-transform group">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 transition-colors"><DocumentMagnifyingGlassIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">Review Expenses</span>
                            </Link>
                            <Link to="/settings" className="glass-card p-4 flex items-center space-x-3 hover:-translate-y-1 transition-transform group">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 transition-colors"><ChartPieIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" /></div>
                                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">System Settings</span>
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 mb-10 w-full stretch-items items-stretch h-auto md:h-32">
                    <StatCard title="Total Leaves" value={stats.total} icon={ClipboardDocumentListIcon} colorClass="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30" link={user.role === 'Manager' ? '/leave-requests' : '/my-leaves'} />
                    <StatCard title="Pending Approvals" value={stats.pending} icon={ClockIcon} colorClass="bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/30" link={user.role === 'Employee' ? '/my-leaves' : '/leave-requests'} />
                    <StatCard title="Approved Leaves" value={stats.approved} icon={CheckCircleIcon} colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30" link={user.role === 'Manager' ? '/leave-requests' : '/my-leaves'} />
                    <StatCard title="Rejected Leaves" value={stats.rejected} icon={XCircleIcon} colorClass="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30" link={user.role === 'Manager' ? '/leave-requests' : '/my-leaves'} />
                </div>
            )}

            {user.role === 'Employee' && backupRequests.length > 0 && (
                <div className="mb-10 glass-card overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/20 dark:border-white/10 bg-gradient-to-r from-orange-500/10 dark:from-orange-500/20 to-transparent flex items-center">
                        <UsersIcon className="h-6 w-6 text-orange-500 dark:text-orange-400 mr-2" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">Pending Backup Cover Requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
                            <thead className="bg-white/40 dark:bg-[#0f0f11]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dates</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-white/20 dark:divide-white/10">
                                {backupRequests.map(req => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-zinc-100">{req.employee?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-zinc-400">
                                            {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenBackupModal(req._id, 'confirm')} className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors">Confirm</button>
                                            <button onClick={() => handleOpenBackupModal(req._id, 'decline')} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors">Decline</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {user.role === 'Employee' && acceptedBackupRequests.length > 0 && (
                <div className="mb-10 glass-card overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/20 dark:border-white/10 bg-gradient-to-r from-emerald-500/10 dark:from-emerald-500/20 to-transparent flex items-center">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400 mr-2" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">Accepted Backup Duties</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
                            <thead className="bg-white/40 dark:bg-[#0f0f11]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Colleague</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dates</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Colleague Leave Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-white/20 dark:divide-white/10">
                                {acceptedBackupRequests.map(req => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-zinc-100">{req.employee?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-zinc-400">
                                            {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Advanced Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                {/* Admin/Manager Organizational View */}
                {/* Admin/Manager Organizational View */}
                {(user.role === 'Admin' || user.role === 'Manager') && (
                    <>
                        {user.role === 'Admin' && (
                            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-8 mb-4">
                                {/* Dual Action Center 1: Leaves */}
                                <div className="glass-card overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-white/40 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-orange-400/10 to-transparent">
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center">
                                            <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-orange-500" />
                                            Action Center: Oldest Pending Leaves
                                        </h2>
                                        <Link to="/all-leaves" className="text-sm font-semibold text-orange-600 hover:text-orange-800 flex items-center hover:underline">
                                            Process Queue <ArrowRightIcon className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                    <div className="overflow-x-auto flex-1 h-[250px]">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10 sticky top-0">
                                                <tr>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Dept</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/40 dark:divide-white/10">
                                                {stats.recentAdminItems.pendingLeaves.length > 0 ? stats.recentAdminItems.pendingLeaves.map(leave => (
                                                    <tr key={leave._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                                        <td className="p-3 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-zinc-100">{leave.employee?.name}</td>
                                                        <td className="p-3 whitespace-nowrap text-sm text-slate-500">{leave.employee?.department || 'General'}</td>
                                                        <td className="p-3 whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#1f1f22] rounded mr-2 inline-block mt-2">
                                                            {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="3" className="p-8 text-center text-slate-500 text-sm">No pending leaves in queue.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Dual Action Center 2: Finances */}
                                <div className="glass-card overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-white/40 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-400/10 to-transparent">
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center">
                                            <BanknotesIcon className="w-5 h-5 mr-2 text-emerald-500" />
                                            Action Center: Ready for Payout
                                        </h2>
                                        <Link to="/all-reimbursements" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center hover:underline">
                                            Process Payouts <ArrowRightIcon className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                    <div className="overflow-x-auto flex-1 h-[250px]">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10 sticky top-0">
                                                <tr>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/40 dark:divide-white/10">
                                                {stats.recentAdminItems.readyPayouts.length > 0 ? stats.recentAdminItems.readyPayouts.map(r => (
                                                    <tr key={r._id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                                        <td className="p-3 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-zinc-100">{r.employee?.name}</td>
                                                        <td className="p-3 whitespace-nowrap text-sm text-slate-500">{r.expenseType}</td>
                                                        <td className="p-3 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">${r.amount.toFixed(2)}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="3" className="p-8 text-center text-slate-500 text-sm">No pending payouts waiting.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user.role === 'Manager' && stats.recentAdminItems?.pendingLeaves?.length > 0 && (
                            <div className="glass-card overflow-hidden lg:col-span-2 mb-2">
                                <div className="p-4 border-b border-white/40 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-[#0f0f11]">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center">
                                        <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-primary-500" />
                                        Action Center: Priority Pending Leaves
                                    </h2>
                                    <Link to="/leave-requests" className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center">
                                        View All Queue <ArrowRightIcon className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10">
                                            <tr>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/40 dark:divide-white/10">
                                            {stats.recentAdminItems.pendingLeaves.map(leave => (
                                                <tr key={leave._id} className="hover:bg-white/40 transition-colors">
                                                    <td className="p-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-zinc-100">{leave.employee?.name}</td>
                                                    <td className="p-4 whitespace-nowrap text-sm text-slate-600">{leave.type}</td>
                                                    <td className="p-4 whitespace-nowrap text-sm text-slate-600">{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-8 border border-white/40 dark:border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                            <h2 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 mb-6 border-b border-white/40 dark:border-white/10 pb-3">Global Leave Types Distribution</h2>
                            <div className="h-64 flex justify-center max-w-[280px] mx-auto">
                                {stats.total > 0 ? <Doughnut data={pieChartData} options={{ maintainAspectRatio: false, color: theme === 'dark' ? '#cbd5e1' : '#64748b' }} /> : <p className="text-slate-400 dark:text-zinc-500 self-center font-semibold">No data available.</p>}
                            </div>
                        </div>

                        <div className="glass-card p-8 border border-white/40 dark:border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                            <h2 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 mb-6 border-b border-white/40 dark:border-white/10 pb-3">Absences by Department</h2>
                            <div className="h-64 flex justify-center max-w-[280px] mx-auto">
                                {Object.keys(stats.departmentAbsences).length > 0 ? <Pie data={departmentChartData} options={{ maintainAspectRatio: false, color: theme === 'dark' ? '#cbd5e1' : '#64748b' }} /> : <p className="text-slate-400 dark:text-zinc-500 self-center font-semibold">No data available.</p>}
                            </div>
                        </div>
                    </>
                )}

                {/* Employee Accrual Tracker View */}
                {user.role === 'Employee' && employeeAccrualData && (
                    <div className="glass-card p-8 border border-white/40 dark:border-white/10 col-span-1 lg:col-span-2 relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100 mb-6 border-b border-white/40 dark:border-white/10 pb-3">Your Leave Accrual & Usage Balance</h2>
                        <div className="h-72 w-full flex items-center justify-center -ml-2">
                            <Bar data={employeeAccrualData} options={{ ...barOptions, color: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
                        </div>
                    </div>
                )}

            </div>

            {/* Backup Comment Modal */}
            {backupModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0f0f11] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in border dark:border-white/10">
                        <div className="flex justify-between items-center mb-4 border-b dark:border-white/10 pb-3">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                                {backupModal.action === 'confirm' ? 'Confirm Backup Request' : 'Decline Backup Request'}
                            </h3>
                            <button onClick={() => setBackupModal({ isOpen: false, reqId: null, action: '', comment: '' })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleBackupAction}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Message to Colleague (Optional)</label>
                                <textarea
                                    className="input-field min-h-[100px] resize-none"
                                    placeholder={backupModal.action === 'confirm' ? "e.g. Happy to cover for you!" : "e.g. Sorry, I have too much on my plate."}
                                    value={backupModal.comment}
                                    onChange={(e) => setBackupModal({ ...backupModal, comment: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-2">This note will be visible on the leave request.</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setBackupModal({ isOpen: false, reqId: null, action: '', comment: '' })} className="px-4 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-slate-700 dark:text-zinc-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button type="submit" className={`px-4 py-2 rounded-xl text-white font-semibold shadow-md transition-colors ${backupModal.action === 'confirm' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}>
                                    {backupModal.action === 'confirm' ? 'Yes, Confirm' : 'Yes, Decline'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
