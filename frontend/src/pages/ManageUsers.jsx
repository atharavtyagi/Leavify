import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';
import UserProfileModal from '../components/UserProfileModal';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleUserUpdate = async (userId, field, newValue) => {
        try {
            await api.put(`/users/${userId}`, { [field]: newValue });
            toast.success(`User ${field} updated successfully`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || `Failed to update ${field}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${userId}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Delete failed');
            }
        }
    };

    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Manage Users</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">Administer user roles and system access.</p>
                </div>
                {/* Optional button placeholder if future registration routes are added */}
                {/* <button className="btn-primary flex items-center shadow-lg hover:-translate-y-0.5"><UserPlusIcon className="w-5 h-5 mr-2"/> Add User</button> */}
            </div>

            <div className="glass-card shadow-xl overflow-hidden border border-white/20 dark:border-white/10 relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 to-primary-600"></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-[#16161a] border-b border-white/40 dark:border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/20 dark:divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <EmptyState title="No Users Found" message="There are no users to display." />
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-bold text-slate-800 dark:text-zinc-100">{user.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">System User</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-zinc-400 font-medium">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="relative inline-block w-36">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUserUpdate(user._id, 'role', e.target.value)}
                                                    className="block w-full appearance-none bg-white dark:bg-[#1f1f22] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 py-2 px-4 pr-8 rounded-xl font-semibold text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-400 transition-colors cursor-pointer shadow-sm"
                                                >
                                                    <option value="Employee">Employee</option>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="relative inline-block w-40">
                                                <select
                                                    value={user.department || 'General'}
                                                    onChange={(e) => handleUserUpdate(user._id, 'department', e.target.value)}
                                                    className="block w-full appearance-none bg-white dark:bg-[#1f1f22] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 py-2 px-4 pr-8 rounded-xl font-semibold text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-400 transition-colors cursor-pointer shadow-sm"
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Engineering">Engineering</option>
                                                    <option value="Marketing">Marketing</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="HR">HR</option>
                                                    <option value="Design">Design</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setSelectedUserForProfile(user)}
                                                className="inline-flex items-center px-3 py-2 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-500 hover:text-white dark:bg-indigo-900/10 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl transition-all duration-200 font-bold shadow-sm opacity-50 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0f0f11]"
                                                title="View Complete Profile"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-1.5" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="inline-flex items-center px-3 py-2 bg-rose-50/50 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-900/10 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white rounded-xl transition-all duration-200 font-bold shadow-sm opacity-50 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-[#0f0f11]"
                                                title="Delete User"
                                            >
                                                <TrashIcon className="w-4 h-4 mr-1.5" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profile Modal */}
            <UserProfileModal
                user={selectedUserForProfile}
                onClose={() => setSelectedUserForProfile(null)}
            />
        </div>
    );
};

export default ManageUsers;
