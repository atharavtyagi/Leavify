import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CalendarDaysIcon, CurrencyRupeeIcon, ShieldCheckIcon, SparklesIcon,
    BellIcon, ChartBarIcon, CheckIcon, ArrowRightIcon, UserGroupIcon,
    ClockIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const featureDetails = [
    {
        id: 'leaves',
        icon: CalendarDaysIcon,
        color: 'indigo',
        badge: 'Core Feature',
        title: 'Leave Management',
        subtitle: 'Smart, automated leave tracking from request to approval.',
        points: [
            'Multiple leave types: Annual, Sick, Casual, and custom types',
            'Real-time leave balance tracking by year',
            'Team calendar for manager visibility',
            'One-click approvals with optional rejection reasons',
            'Automatic balance deductions upon approval',
            'Leave history and status timeline per employee',
        ],
        flip: false,
    },
    {
        id: 'reimbursements',
        icon: CurrencyRupeeIcon,
        color: 'emerald',
        badge: 'Finance',
        title: 'Expense Reimbursements',
        subtitle: 'End-to-end expense claim lifecycle management.',
        points: [
            'Submit claims with expense type, amount, and date',
            'Upload receipts and supporting documents',
            'Two-stage approval: Manager → Admin',
            'Global view of all claims for Admin',
            'Department-level grouping for Managers',
            'Permanent record of approved and rejected claims',
        ],
        flip: true,
    },
    {
        id: 'security',
        icon: ShieldCheckIcon,
        color: 'violet',
        badge: 'Security',
        title: 'Role-Based Access Control',
        subtitle: 'Enterprise-grade access management that scales with your team.',
        points: [
            'Three built-in roles: Employee, Manager, Admin',
            'JWT-based stateless authentication',
            'Bcrypt password hashing for secure storage',
            'Acting admin delegation for absences',
            'Protected API routes with middleware validation',
            'Audit logs tracking all sensitive actions',
        ],
        flip: false,
    },
    {
        id: 'ai',
        icon: SparklesIcon,
        color: 'amber',
        badge: 'AI-Powered',
        title: 'Gemini AI HR Assistant',
        subtitle: 'Your always-on HR expert, powered by Google Gemini.',
        points: [
            'Natural language HR query resolution',
            'Context-aware: reads your leave balances and history',
            'Returns structured data in tables, stats, and text',
            'Role-specific responses (Employee vs. Manager vs. Admin)',
            'Integrated directly into the dashboard as a chat panel',
            'Instant answers to policy and balance questions',
        ],
        flip: true,
    },
    {
        id: 'notifications',
        icon: BellIcon,
        color: 'rose',
        badge: 'Real-Time',
        title: 'Notifications System',
        subtitle: 'No one misses a beat with dual-channel alerting.',
        points: [
            'Real-time push notifications via Socket.io WebSockets',
            'Email alerts via Nodemailer for critical actions',
            'Notify employees when their leave is approved or rejected',
            'Alert managers when new leave requests arrive',
            'Admin notifications for pending reimbursement approvals',
            'Mark notifications as read from the dashboard',
        ],
        flip: false,
    },
    {
        id: 'analytics',
        icon: ChartBarIcon,
        color: 'cyan',
        badge: 'Analytics',
        title: 'Analytics & Reporting',
        subtitle: 'Data-driven HR decisions with beautiful visual reports.',
        points: [
            'Leave distribution charts by type and department',
            'Monthly leave trends and usage patterns',
            'Reimbursement totals and pending amounts',
            'Org-wide availability calendar view',
            'Acting manager action review dashboards',
            'Login history and audit trail per user',
        ],
        flip: true,
    },
];

const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
};

const FeaturesPage = () => {
    return (
        <div className="bg-[#050508] text-white min-h-screen font-sans">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-20 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-4xl mx-auto px-4">
                    <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Platform Features</motion.p>
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        Everything you need<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">to run HR.</span>
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Leavify is a fully-featured HR management platform covering leaves, expenses, AI assistance, security, and real-time team intelligence.
                    </motion.p>
                </motion.div>
            </section>

            {/* Feature Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-32">
                {featureDetails.map((f) => {
                    const c = colorMap[f.color];
                    return (
                        <motion.div key={f.id} id={f.id}
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
                            className={`flex flex-col ${f.flip ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center scroll-mt-32`}>
                            {/* Text */}
                            <div className="flex-1">
                                <motion.span variants={fadeUp} className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-5 ${c.badge}`}>
                                    {f.badge}
                                </motion.span>
                                <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight mb-4">{f.title}</motion.h2>
                                <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-8">{f.subtitle}</motion.p>
                                <motion.ul variants={stagger} className="space-y-3">
                                    {f.points.map((pt) => (
                                        <motion.li key={pt} variants={fadeUp} className="flex items-start gap-3 text-gray-300 text-sm">
                                            <CheckIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${c.text}`} />
                                            {pt}
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </div>

                            {/* Visual card */}
                            <motion.div variants={fadeUp} className="flex-1 w-full">
                                <div className={`rounded-3xl border ${c.border} ${c.bg} p-10 flex flex-col items-center justify-center min-h-[300px] text-center`}>
                                    <div className={`w-20 h-20 rounded-3xl ${c.bg} border ${c.border} flex items-center justify-center mb-6`}>
                                        <f.icon className={`w-10 h-10 ${c.text}`} />
                                    </div>
                                    <p className={`text-3xl font-black ${c.text} mb-2`}>{f.title}</p>
                                    <p className="text-gray-500 text-sm">{f.subtitle}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* CTA */}
            <section className="py-24 text-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                    className="max-w-2xl mx-auto px-4">
                    <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-6">Ready to get started?</motion.h2>
                    <motion.div variants={fadeUp} className="flex gap-4 justify-center">
                        <Link to="/register" className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 transition-all shadow-lg shadow-indigo-500/30">
                            Start Free Trial
                        </Link>
                        <Link to="/pricing" className="px-8 py-3.5 rounded-full font-bold text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                            View Pricing
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default FeaturesPage;
