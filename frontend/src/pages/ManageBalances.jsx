import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ManageBalances = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBalance, setSelectedBalance] = useState(null);
    const [formData, setFormData] = useState({
        annualLeave: 0,
        sickLeave: 0,
        casualLeave: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchBalances();
    }, []);

    const fetchBalances = async () => {
        try {
            const res = await api.get('/balances');
            setBalances(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch user balances');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (balance) => {
        setSelectedBalance(balance);
        setFormData({
            annualLeave: balance.annualLeave,
            sickLeave: balance.sickLeave,
            casualLeave: balance.casualLeave
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/balances/${selectedBalance._id}`, formData);
            toast.success('Balance updated successfully');
            setSelectedBalance(null);
            fetchBalances();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Update failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Leave Balances</h1>
                <p className="text-slate-500 mt-2 font-semibold text-lg">Adjust and view employee leave allowances for the current year.</p>
            </div>

            <div className="glass-card overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-white/40">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Leave</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sick Leave</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Casual Leave</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-white/20">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : balances.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No balance records found.
                                </td>
                            </tr>
                        ) : (
                            balances.map((balance) => (
                                <tr key={balance._id} className="hover:bg-white/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                                    {balance.user.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{balance.user.name}</div>
                                                <div className="text-sm text-gray-500">{balance.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {balance.annualLeave}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {balance.sickLeave}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {balance.casualLeave}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {balance.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditClick(balance)}
                                            className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded"
                                            title="Adjust Balance"
                                        >
                                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedBalance && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setSelectedBalance(null)}></div>

                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 backdrop-blur-3xl shadow-2xl rounded-3xl border border-white/50">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold leading-6 text-gray-900">
                                    Adjust Balance: {selectedBalance.user.name}
                                </h3>
                                <button onClick={() => setSelectedBalance(null)} className="text-gray-400 hover:text-gray-500 transition-colors">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Annual Leave</label>
                                    <input
                                        type="number"
                                        name="annualLeave"
                                        required
                                        step="0.5"
                                        min="0"
                                        value={formData.annualLeave}
                                        onChange={handleChange}
                                        className="input-field mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sick Leave</label>
                                    <input
                                        type="number"
                                        name="sickLeave"
                                        required
                                        step="0.5"
                                        min="0"
                                        value={formData.sickLeave}
                                        onChange={handleChange}
                                        className="input-field mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Casual Leave</label>
                                    <input
                                        type="number"
                                        name="casualLeave"
                                        required
                                        step="0.5"
                                        min="0"
                                        value={formData.casualLeave}
                                        onChange={handleChange}
                                        className="input-field mt-1"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBalance(null)}
                                        className="btn btn-secondary px-4 py-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn btn-primary px-4 py-2"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
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

export default ManageBalances;
