import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const LandingPage = () => {
    return (
        <div className="bg-transparent min-h-screen font-sans">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md fixed w-full z-50 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg transform rotate-3">
                                <span className="text-white text-xl font-bold">L</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Leavify</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Log In</Link>
                            <Link to="/register" className="btn btn-primary shadow-lg shadow-primary-500/30">Get Started Free</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 -left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
                        Leave Management, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-400">Simplified for Modern HR</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto mb-10">
                        Automate your company's time-off requests. Give employees a seamless experience while empowering managers with real-time tracking and approvals.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/register" className="btn btn-primary px-8 py-4 text-lg shadow-xl shadow-primary-500/40 hover:-translate-y-1 transition-transform">
                            Try Leavify Today
                        </Link>
                        <a href="#features" className="btn btn-secondary px-8 py-4 text-lg hover:-translate-y-1 transition-transform">
                            See How It Works
                        </a>
                    </div>

                    {/* Hero Image Mockup */}
                    <div className="mt-20 flex justify-center">
                        <div className="relative rounded-2xl bg-gray-900/5 p-2 md:p-4 ring-1 ring-inset ring-gray-900/10 lg:rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <img
                                src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
                                alt="Dashboard Preview"
                                className="rounded-xl ring-1 ring-gray-900/10 shadow-2xl w-full object-cover h-[300px] sm:h-[400px] lg:h-[600px] opacity-90 transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-transparent border-t border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Why Leavify?</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to manage time off
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="glass-card hover:-translate-y-2 p-8 transition-transform group">
                            <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                                <CheckCircleIcon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">One-Click Approvals</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Managers can review, approve, or reject leave requests instantly from their customized dashboard with optional reasoning.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card hover:-translate-y-2 p-8 transition-transform group">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                <ShieldCheckIcon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Role-Based Security</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Built with enterprise-grade security. Distinct portals ensure employees see what they need, while Admins retain absolute control.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card hover:-translate-y-2 p-8 transition-transform group">
                            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                                <ChartBarIcon className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Global Tracking</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Say goodbye to spreadsheets. Get a bird's-eye view of your entire organization's availability tracking in one centralized location.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-900">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 lg:py-20 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">Ready to streamline your HR?</span>
                        <span className="block text-primary-300">Set up your company in minutes.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                        <div className="inline-flex rounded-md shadow">
                            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-900 bg-white hover:bg-gray-50 transition-colors">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">L</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Leavify</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        &copy; 2026 Leavify HR Solutions. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
