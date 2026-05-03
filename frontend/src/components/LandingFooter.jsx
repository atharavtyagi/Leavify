import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, CurrencyRupeeIcon, ShieldCheckIcon, SparklesIcon, BellIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const footerSections = [
    {
        title: 'Product',
        links: [
            { label: 'Leave Management', href: '/features#leaves' },
            { label: 'Expense Reimbursements', href: '/features#reimbursements' },
            { label: 'AI HR Assistant', href: '/features#ai' },
            { label: 'Analytics Dashboard', href: '/features#analytics' },
            { label: 'Role-Based Access', href: '/features#security' },
            { label: 'Real-Time Notifications', href: '/features#notifications' },
        ]
    },
    {
        title: 'HR Guides',
        links: [
            { label: 'What is HRMS?', href: '/guide/hrms' },
            { label: 'Guide to Leave Management', href: '/guide/leave-management' },
            { label: 'Guide to Reimbursements', href: '/guide/reimbursements' },
            { label: 'What is RBAC?', href: '/guide/rbac' },
        ]
    },
    {
        title: 'Resources',
        links: [
            { label: 'Pricing & Plans', href: '/pricing' },
            { label: 'About Us', href: '/about' },
            { label: 'Contact Us', href: '/contact' },
        ]
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Pricing', href: '/pricing' },
        ]
    }
];

const LandingFooter = () => {
    return (
        <footer className="bg-gray-950 border-t border-white/5 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top CTA Banner */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-14 pb-10 border-b border-white/10">
                    <p className="text-gray-300 text-lg font-semibold">
                        Create leave policies and approve requests without back-and-forth →
                    </p>
                    <Link to="/register"
                        className="flex-shrink-0 px-8 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all">
                        Book a Demo
                    </Link>
                </div>

                {/* Main Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.href} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">L</span>
                        </div>
                        <span className="text-lg font-black text-white tracking-tight">Leavify</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                        © {new Date().getFullYear()} Leavify HR Solutions. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Use</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
