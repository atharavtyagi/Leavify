import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon, KeyIcon, BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const Settings = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        skills: user?.skills || [],
        emailNotifications: user?.emailNotifications ?? true,
        pushNotifications: user?.pushNotifications ?? false,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNotificationToggle = async (field, currentValue) => {
        const newValue = !currentValue;
        setFormData({ ...formData, [field]: newValue });

        try {
            const res = await api.put('/auth/updatedetails', {
                [field]: newValue
            });
            setUser(res.data.data);
            if (newValue) {
                toast.success(`${field === 'emailNotifications' ? 'Email' : 'Push'} Notifications enabled`);
            } else {
                toast.success(`${field === 'emailNotifications' ? 'Email' : 'Push'} Notifications disabled`, {
                    icon: '🔕'
                });
            }
        } catch (error) {
            // Revert on failure
            setFormData({ ...formData, [field]: currentValue });
            toast.error('Failed to update preferences');
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/updatedetails', {
                name: formData.name,
                email: formData.email,
                skills: formData.skills
            });
            setUser(res.data.data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            return toast.error('Passwords do not match');
        }
        try {
            await api.put('/auth/updatepassword', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            toast.success('Password updated successfully!');
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update password');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">Manage your account preferences and profile details.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <nav className="glass-card p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                        >
                            <UserCircleIcon className="w-5 h-5 mr-3" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'security' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                        >
                            <KeyIcon className="w-5 h-5 mr-3" />
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'}`}
                        >
                            <BellIcon className="w-5 h-5 mr-3" />
                            Notifications
                        </button>
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    <div className="glass-card p-8">
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 mb-6 border-b border-white/40 dark:border-white/10 pb-3">Profile Information</h2>
                                <form onSubmit={handleProfileSave} className="space-y-6">
                                    <div className="flex items-center space-x-6 mb-6">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Your Skills</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.skills.map((skill, index) => (
                                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                                                    {skill}
                                                    <button type="button" onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) })} className="ml-2 text-indigo-500 hover:text-indigo-900 dark:hover:text-indigo-100">&times;</button>
                                                </span>
                                            ))}
                                            {formData.skills.length === 0 && <span className="text-sm text-slate-400 dark:text-zinc-500">No skills added yet.</span>}
                                        </div>
                                        <div className="flex">
                                            <input type="text" id="newSkillInput" placeholder="e.g. React, Python, QA" className="input-field rounded-r-none" onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = e.target.value.trim();
                                                    if (val && !formData.skills.includes(val)) {
                                                        setFormData({ ...formData, skills: [...formData.skills, val] });
                                                    }
                                                    e.target.value = '';
                                                }
                                            }} />
                                            <button type="button" className="btn btn-secondary rounded-l-none bg-slate-100 dark:bg-[#16161a] border-l-0 text-slate-600 dark:text-zinc-400 px-4" onClick={() => {
                                                const input = document.getElementById('newSkillInput');
                                                const val = input.value.trim();
                                                if (val && !formData.skills.includes(val)) {
                                                    setFormData({ ...formData, skills: [...formData.skills, val] });
                                                }
                                                input.value = '';
                                            }}>Add</button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">Press enter to add multiple skills. These are used for Smart Risk Estimation during leaves.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Role</label>
                                            <input type="text" defaultValue={user?.role || ''} className="input-field bg-slate-50/50 dark:bg-[#0f0f11] text-slate-500 dark:text-zinc-400" disabled />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Department</label>
                                            <input type="text" defaultValue={user?.department || 'N/A'} className="input-field bg-slate-50/50 dark:bg-[#0f0f11] text-slate-500 dark:text-zinc-400" disabled />
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button type="submit" className="btn btn-primary px-6 py-2 shadow-primary-500/30">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 mb-6 border-b border-white/40 dark:border-white/10 pb-3">Change Password</h2>
                                <form onSubmit={handlePasswordSave} className="space-y-6 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Current Password</label>
                                        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required placeholder="••••••••" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">New Password</label>
                                        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required placeholder="••••••••" minLength="6" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-400 mb-2">Confirm New Password</label>
                                        <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} required placeholder="••••••••" minLength="6" className="input-field" />
                                    </div>
                                    <div className="mt-8">
                                        <button type="submit" className="btn btn-primary px-6 py-2 shadow-primary-500/30">Update Password</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 mb-6 border-b border-white/40 dark:border-white/10 pb-3">Notification Preferences</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-[#0f0f11] rounded-2xl border border-white/60 dark:border-white/10">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-zinc-100">Email Notifications</p>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Receive emails for leave approvals and rejections.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.emailNotifications} onChange={() => handleNotificationToggle('emailNotifications', formData.emailNotifications)} />
                                            <div className="w-11 h-6 bg-slate-300 dark:bg-[#1e1e24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-[#0f0f11] rounded-2xl border border-white/60 dark:border-white/10">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-zinc-100">Push Notifications</p>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Receive browser push notifications.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.pushNotifications} onChange={() => handleNotificationToggle('pushNotifications', formData.pushNotifications)} />
                                            <div className="w-11 h-6 bg-slate-300 dark:bg-[#1e1e24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
