import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Bars3Icon, BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Cog8ToothIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);
    const [hasUnread, setHasUnread] = useState(false);

    // Fetch dynamic live notifications based on role
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const newNotifs = [];
                const myId = user._id || user.id;

                // 1. Employee Context
                if (user.role === 'Employee') {
                    // Fetch all leaves to check backup cover & own leaves
                    const leavesRes = await api.get('/leaves').catch(() => ({ data: { data: [] } }));
                    const allLeaves = leavesRes.data.data || [];

                    // a) Backup Covers Needed
                    const pendingCovers = allLeaves.filter(l =>
                        (l.backupEmployee?._id === myId || l.backupEmployee === myId) &&
                        !l.backupConfirmed &&
                        l.status === 'Pending'
                    );

                    if (pendingCovers.length > 0) {
                        newNotifs.push({
                            id: 'backup_cover',
                            title: 'Backup Cover Requested',
                            message: `You have ${pendingCovers.length} pending request(s) to cover a colleague's leave.`,
                            time: 'Action Required',
                            isAlert: true,
                            link: '/dashboard'
                        });
                    }

                    // b) Recent Leave Decisions
                    const myLeaves = allLeaves.filter(l => (l.employee?._id === myId || l.employee === myId));
                    myLeaves.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
                    const recentLeaves = myLeaves.filter(l => l.status === 'Approved' || l.status === 'Rejected').slice(0, 2);
                    recentLeaves.forEach(l => {
                        newNotifs.push({
                            id: `leave_update_${l._id}`,
                            title: `Leave ${l.status}`,
                            message: `Your ${l.type} leave request was ${l.status.toLowerCase()}.`,
                            time: 'Recent',
                            isAlert: false,
                            link: '/my-leaves'
                        });
                    });

                    // c) Reimbursement Updates
                    const reimbRes = await api.get('/reimbursements/my').catch(() => ({ data: { data: [] } }));
                    const myReimbs = reimbRes.data.data || [];
                    const processedReimbs = myReimbs.filter(r => r.status === 'Approved' || r.status === 'Rejected').slice(0, 2);
                    processedReimbs.forEach(r => {
                        newNotifs.push({
                            id: `reimb_update_${r._id}`,
                            title: `Claim ${r.status}`,
                            message: `Your $${r.amount.toFixed(2)} expense claim was ${r.status.toLowerCase()}.`,
                            time: 'Recent',
                            isAlert: false,
                            link: '/my-reimbursements'
                        });
                    });
                }

                // 2. Manager Context
                if (user.role === 'Manager') {
                    const leavesRes = await api.get('/leaves').catch(() => ({ data: { data: [] } }));
                    const allLeaves = leavesRes.data.data || [];
                    const deptLeaves = allLeaves.filter(l => l.employee && l.employee.department === user.department);

                    const pendingLeaves = deptLeaves.filter(l => l.status === 'Pending');
                    if (pendingLeaves.length > 0) {
                        newNotifs.push({
                            id: 'mgr_pending_leaves',
                            title: 'Leave Approvals Needed',
                            message: `${pendingLeaves.length} leave request(s) await your approval.`,
                            time: 'Action Required',
                            isAlert: true,
                            link: '/leave-requests'
                        });
                    }

                    const reimbRes = await api.get('/reimbursements/all').catch(() => ({ data: { data: [] } }));
                    const allReimbs = reimbRes.data.data || [];
                    const deptReimbs = allReimbs.filter(r => r.employee && r.employee.department === user.department && r.status === 'Pending');
                    if (deptReimbs.length > 0) {
                        newNotifs.push({
                            id: 'mgr_pending_reimbs',
                            title: 'Expense Claims Pending',
                            message: `${deptReimbs.length} expense claim(s) await your review.`,
                            time: 'Action Required',
                            isAlert: true,
                            link: '/reimbursement-requests'
                        });
                    }

                    // Conflict logic
                    const pendingConflicts = deptLeaves.filter(pendingLeave => {
                        if (pendingLeave.status !== 'Pending') return false;
                        const sDate = new Date(pendingLeave.startDate);
                        const eDate = new Date(pendingLeave.endDate);
                        const overlaps = deptLeaves.filter(l =>
                            (l.status === 'Approved' || l.status === 'Pending') &&
                            l._id !== pendingLeave._id &&
                            new Date(l.startDate) <= eDate &&
                            new Date(l.endDate) >= sDate
                        );
                        return overlaps.length + 1 >= 2;
                    });
                    if (pendingConflicts.length > 0) {
                        newNotifs.push({
                            id: 'conflict_alert',
                            title: 'Smart Leave Conflict Detected',
                            message: `${pendingConflicts.length} request(s) have department overlapping conflicts.`,
                            time: 'Action Required',
                            isAlert: true,
                            link: '/leave-requests'
                        });
                    }
                }

                // 3. Admin Context
                if (user.role === 'Admin') {
                    const leavesRes = await api.get('/leaves').catch(() => ({ data: { data: [] } }));
                    const allLeaves = leavesRes.data.data || [];
                    const pendingLeaves = allLeaves.filter(l => l.status === 'Pending');
                    if (pendingLeaves.length > 0) {
                        newNotifs.push({
                            id: 'admin_pending_leaves',
                            title: 'Company Leave Queue',
                            message: `${pendingLeaves.length} leave request(s) are pending company-wide.`,
                            time: 'Informational',
                            isAlert: false,
                            link: '/all-leaves'
                        });
                    }

                    const reimbRes = await api.get('/reimbursements/all').catch(() => ({ data: { data: [] } }));
                    const allReimbs = reimbRes.data.data || [];
                    const readyReimbs = allReimbs.filter(r => r.status === 'Manager Approved');
                    if (readyReimbs.length > 0) {
                        newNotifs.push({
                            id: 'admin_ready_reimbs',
                            title: 'Final Payout Processing',
                            message: `${readyReimbs.length} Manager Approved claim(s) are ready for final sign-off.`,
                            time: 'Action Required',
                            isAlert: true,
                            link: '/all-reimbursements'
                        });
                    }
                }

                // Default empty state handling
                if (newNotifs.length === 0) {
                    newNotifs.push({
                        id: 'all_caught_up',
                        title: 'All Caught Up! 🎉',
                        message: 'You have no pending tasks or recent updates.',
                        time: 'Just now',
                        isAlert: false,
                        link: '/dashboard'
                    });
                    setHasUnread(false);
                } else {
                    setHasUnread(newNotifs.some(n => n.isAlert));
                }

                setNotifications(newNotifs);
            } catch (err) {
                console.error("Failed to fetch live notifications", err);
            }
        };

        fetchNotifications();

        // Poll every 15 seconds to simulate real-time notification socket
        const intervalId = setInterval(fetchNotifications, 15000);
        return () => clearInterval(intervalId);
    }, [user]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white/40 dark:bg-[#050505] backdrop-blur-3xl shadow-[0_4px_24px_#00000005] border-b border-white/50 dark:border-white/10 z-10 transition-colors duration-500">
            <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center">
                    <button
                        onClick={onMenuClick}
                        className="p-2 mr-4 text-slate-500 dark:text-zinc-400 rounded-xl hover:bg-white/80 dark:hover:bg-white/5 lg:hidden transition-colors shadow-sm bg-white/50 dark:bg-[#0f0f11]"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-zinc-100">
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h2>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-white/60 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                        {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                    </button>

                    {/* Notifications Dropdown */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsProfileOpen(false); setHasUnread(false); }}
                            className="p-2 text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-white/60 dark:hover:bg-white/5 transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <BellIcon className="w-6 h-6" />
                            {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-white/10 animate-pulse"></span>}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white/90 dark:bg-[#0f0f11] backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl border border-white/50 dark:border-white/10 overflow-hidden z-50 transform opacity-100 scale-100 transition-all origin-top-right">
                                <div className="p-4 border-b border-white/40 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-[#0f0f11]">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Notifications</h3>
                                    <button className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">Mark all read</button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map(notif => (
                                        notif.link ? (
                                            <Link to={notif.link} key={notif.id} className={`block p-4 border-b border-white/40 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer ${notif.isAlert ? 'bg-red-50/50 dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30' : ''}`}>
                                                <p className={`text-sm font-semibold ${notif.isAlert ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-zinc-100'}`}>
                                                    {notif.isAlert && <span className="inline-block mr-2 text-red-500 dark:text-red-400 text-lg">⚠️</span>}
                                                    {notif.title}
                                                </p>
                                                <p className={`text-xs mt-1 ${notif.isAlert ? 'text-red-600 dark:text-red-300' : 'text-slate-500 dark:text-zinc-400'}`}>{notif.message}</p>
                                                <p className={`text-xs mt-2 ${notif.isAlert ? 'text-red-500 dark:text-red-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>{notif.time}</p>
                                            </Link>
                                        ) : (
                                            <div key={notif.id} className="p-4 border-b border-white/40 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{notif.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{notif.message}</p>
                                                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">{notif.time}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                                <div className="p-3 border-t border-white/40 dark:border-white/10 bg-slate-50/50 dark:bg-[#0f0f11] text-center">
                                    <button onClick={() => setNotifications([])} className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Clear all notifications</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:block border-l border-white/60 dark:border-white/10 h-8 mx-2"></div>

                    {/* Profile Dropdown */}
                    <div className="relative flex items-center cursor-pointer" ref={profileRef} onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationOpen(false); }}>
                        <div className="hidden sm:block text-right mr-3">
                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{user?.name}</p>
                            <p className="text-xs text-primary-600 dark:text-primary-400 font-extrabold tracking-wide uppercase">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white/80 dark:border-white/10 flex items-center justify-center text-white font-black shadow-md shadow-primary-500/30 hover:shadow-lg transition-all">
                            {user?.name?.charAt(0) || 'U'}
                        </div>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-3 w-64 bg-white/90 dark:bg-[#0f0f11] backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl border border-white/50 dark:border-white/10 overflow-hidden z-50 transform opacity-100 scale-100 transition-all origin-top-right">
                                <div className="p-5 border-b border-white/40 dark:border-white/10 bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-700/40 dark:to-slate-800/40">
                                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{user?.email}</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <Link to="/settings" className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-zinc-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 rounded-xl transition-all">
                                        <UserCircleIcon className="w-5 h-5 mr-3" />
                                        My Profile
                                    </Link>
                                    <Link to="/settings" className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-zinc-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 rounded-xl transition-all">
                                        <Cog8ToothIcon className="w-5 h-5 mr-3" />
                                        Account Settings
                                    </Link>
                                </div>
                                <div className="p-2 border-t border-white/40 dark:border-white/10">
                                    <button
                                        onClick={logout}
                                        className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
