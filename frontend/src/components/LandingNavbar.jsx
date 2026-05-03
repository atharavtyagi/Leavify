import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDownIcon, Bars3Icon, XMarkIcon, ArrowRightIcon,
    ChartBarIcon, ShieldCheckIcon, BellIcon,
    CalendarDaysIcon, CurrencyRupeeIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

const productLinks = [
    { icon: CalendarDaysIcon, label: 'Leave Management', desc: 'Smart leave tracking & approvals', href: '/features#leaves' },
    { icon: CurrencyRupeeIcon, label: 'Expense Reimbursements', desc: 'Streamlined claim submissions', href: '/features#reimbursements' },
    { icon: ShieldCheckIcon, label: 'Role-Based Access', desc: 'Enterprise-grade RBAC security', href: '/features#security' },
    { icon: SparklesIcon, label: 'AI HR Assistant', desc: 'Gemini-powered HR chatbot', href: '/features#ai' },
    { icon: BellIcon, label: 'Real-Time Notifications', desc: 'Instant Socket.io alerts', href: '/features#notifications' },
    { icon: ChartBarIcon, label: 'Analytics Dashboard', desc: 'Org-wide leave insights', href: '/features#analytics' },
];

const resourceLinks = [
    { label: 'What is HRMS?', href: '/guide/hrms' },
    { label: 'Guide to Leave Management', href: '/guide/leave-management' },
    { label: 'Guide to Role-Based Access', href: '/guide/rbac' },
    { label: 'Pricing & Plans', href: '/pricing' },
];

const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Pricing', href: '/pricing' },
];

// Dropdown for Product (with icons + descriptions)
const DropdownMenu = ({ items, isOpen }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-[#111117] rounded-2xl shadow-2xl border border-white/10 p-3 z-50"
            >
                {items.map((item) => (
                    <Link key={item.label} to={item.href}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                        {item.icon && <item.icon className="w-5 h-5 mt-0.5 text-indigo-400 flex-shrink-0" />}
                        <div>
                            <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{item.label}</p>
                            {item.desc && <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>}
                        </div>
                    </Link>
                ))}
            </motion.div>
        )}
    </AnimatePresence>
);

// Simple dropdown (no icons)
const SimpleDropdown = ({ items, isOpen }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-[#111117] rounded-2xl shadow-2xl border border-white/10 p-2 z-50"
            >
                {items.map((item) => (
                    <Link key={item.label} to={item.href}
                        className="block px-4 py-2.5 text-sm font-medium text-gray-300 rounded-xl hover:bg-white/5 hover:text-indigo-400 transition-colors">
                        {item.label}
                    </Link>
                ))}
            </motion.div>
        )}
    </AnimatePresence>
);

const LandingNavbar = () => {
    const [openMenu, setOpenMenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        setOpenMenu(null);
        setMobileOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
        };
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = (menu) => setOpenMenu(prev => prev === menu ? null : menu);

    return (
        <nav
            ref={navRef}
            className={`fixed w-full z-50 transition-all duration-500 ${
                scrolled
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30'
                    : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                            <span className="text-white text-base font-black">L</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">Leavify</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-1">

                        {/* Product Dropdown */}
                        <div className="relative">
                            <button onClick={() => toggleMenu('product')}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                Product
                                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${openMenu === 'product' ? 'rotate-180' : ''}`} />
                            </button>
                            <DropdownMenu items={productLinks} isOpen={openMenu === 'product'} />
                        </div>

                        <NavLink to="/pricing"
                            className={({ isActive }) =>
                                `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                    isActive ? 'text-indigo-400' : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }`
                            }>
                            Pricing
                        </NavLink>

                        {/* Resources Dropdown */}
                        <div className="relative">
                            <button onClick={() => toggleMenu('resources')}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                Resources
                                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${openMenu === 'resources' ? 'rotate-180' : ''}`} />
                            </button>
                            <SimpleDropdown items={resourceLinks} isOpen={openMenu === 'resources'} />
                        </div>

                        {/* Company Dropdown */}
                        <div className="relative">
                            <button onClick={() => toggleMenu('company')}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                Company
                                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${openMenu === 'company' ? 'rotate-180' : ''}`} />
                            </button>
                            <SimpleDropdown items={companyLinks} isOpen={openMenu === 'company'} />
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <Link to="/login"
                            className="px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white rounded-xl border border-white/15 hover:border-white/30 transition-all">
                            Log In
                        </Link>
                        <Link to="/register"
                            className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md hover:shadow-indigo-500/40 transition-all hover:scale-105">
                            Free Trial →
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-hidden">
                        <div className="px-4 py-6 space-y-2">
                            {productLinks.map(item => (
                                <Link key={item.label} to={item.href}
                                    className="flex items-center gap-2 py-2.5 px-3 text-sm font-medium text-gray-300 hover:text-indigo-400 rounded-xl hover:bg-white/5 transition-colors">
                                    <item.icon className="w-4 h-4 text-indigo-500" /> {item.label}
                                </Link>
                            ))}
                            <hr className="border-white/10 my-2" />
                            <Link to="/pricing" className="block py-2.5 px-3 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors">Pricing</Link>
                            <Link to="/about" className="block py-2.5 px-3 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors">About</Link>
                            <Link to="/contact" className="block py-2.5 px-3 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors">Contact</Link>
                            <div className="pt-3 flex flex-col gap-2">
                                <Link to="/login" className="text-center py-3 text-sm font-semibold border border-white/15 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Log In</Link>
                                <Link to="/register" className="text-center py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600">Free Trial →</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default LandingNavbar;
