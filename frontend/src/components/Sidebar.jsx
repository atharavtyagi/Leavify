import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    ArrowRightOnRectangleIcon,
    ScaleIcon,
    CalendarIcon,
    Cog8ToothIcon,
    CurrencyDollarIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const employeeLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'My Leaves', path: '/my-leaves', icon: DocumentTextIcon },
        { name: 'Reimbursements', path: '/my-reimbursements', icon: CurrencyDollarIcon },
        { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'Settings', path: '/settings', icon: Cog8ToothIcon },
    ];

    const managerLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Leave Requests', path: '/leave-requests', icon: ClipboardDocumentCheckIcon },
        { name: 'Reimbursement Claims', path: '/reimbursement-requests', icon: CurrencyDollarIcon },
        { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'Settings', path: '/settings', icon: Cog8ToothIcon },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Manage Users', path: '/manage-users', icon: UsersIcon },
        { name: 'Manage Balances', path: '/manage-balances', icon: ScaleIcon },
        { name: 'All Leaves', path: '/all-leaves', icon: ClipboardDocumentCheckIcon },
        { name: 'All Reimbursements', path: '/all-reimbursements', icon: BanknotesIcon },
        { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'Settings', path: '/settings', icon: Cog8ToothIcon },
    ];

    let links = employeeLinks;
    if (user?.role === 'Manager') links = managerLinks;
    if (user?.role === 'Admin') links = adminLinks;

    return (
        <div className="w-64 bg-white/40 dark:bg-[#050505] backdrop-blur-3xl border-r border-white/50 dark:border-white/10 text-slate-800 dark:text-zinc-100 flex flex-col min-h-screen shadow-[4px_0_24px_#00000005] transition-colors duration-500">
            <div className="flex items-center justify-center h-20 border-b border-white/30 dark:border-white/10 relative">
                <h1 className="text-2xl font-black tracking-widest relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
                    LEAVIFY
                </h1>
            </div>

            <div className="flex-1 py-8 overflow-y-auto">
                <nav className="px-4 space-y-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 mb-1 rounded-2xl transition-all duration-300 font-semibold text-sm ${isActive
                                    ? 'bg-white dark:bg-[#0f0f11] shadow-[0_4px_12px_#0000000a] dark:shadow-none text-primary-600 dark:text-primary-400 border border-white/80 dark:border-white/10'
                                    : 'text-slate-500 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-zinc-100 hover:shadow-sm'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{link.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-white/30 dark:border-white/10">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg text-primary-700 dark:text-primary-400 font-bold shadow-sm border border-white dark:border-white/10">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{user?.name}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-2xl transition-colors hover:shadow-sm"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
