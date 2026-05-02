import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AssistantWidget from '../components/AssistantWidget';
import { useAuth } from '../context/AuthContext';
import { EyeIcon } from '@heroicons/react/24/solid';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex h-screen font-sans overflow-hidden bg-transparent">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30`}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                
                {user?.isCurrentlyOnLeave && (
                    <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-center text-sm font-bold shadow-lg relative z-10 animate-in slide-in-from-top duration-500">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        <span>VIEW-ONLY MODE: You are currently on leave. Approval rights are delegated to your Acting Manager.</span>
                    </div>
                )}
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Global AI Assistant */}
            <AssistantWidget />
        </div>
    );
};

export default DashboardLayout;
