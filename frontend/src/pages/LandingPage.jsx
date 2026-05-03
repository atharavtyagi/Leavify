import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CalendarDaysIcon, CurrencyRupeeIcon, ShieldCheckIcon, SparklesIcon,
    BellIcon, ChartBarIcon, CheckIcon, ArrowRightIcon, UserGroupIcon,
    ClockIcon, DocumentTextIcon, StarIcon
} from '@heroicons/react/24/outline';
import Hero3D from '../components/Hero3D';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

const stats = [
    { end: 500, suffix: '+', label: 'Companies Onboarded' },
    { end: 10, suffix: 'K+', label: 'Leave Requests Processed' },
    { end: 98, suffix: '%', label: 'Approval Accuracy' },
    { end: 3, suffix: ' Roles', label: 'Employee · Manager · Admin' },
];

// Count-up hook — counts from 0 to `end` over `duration` ms when `start` is true
const useCountUp = (end, duration = 1800, start = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(end);
        };
        requestAnimationFrame(step);
    }, [start, end, duration]);
    return count;
};

// Individual animated stat cell
const AnimatedStat = ({ end, suffix, label }) => {
    const ref = useRef(null);
    const [hasStarted, setHasStarted] = useState(false);
    const count = useCountUp(end, 1800, hasStarted);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setHasStarted(true); observer.disconnect(); } },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <motion.div ref={ref} variants={fadeUp} className="text-center">
            <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-2 tabular-nums">
                {count}{suffix}
            </p>
            <p className="text-sm text-gray-500 font-semibold">{label}</p>
        </motion.div>
    );
};

const features = [
    { icon: CalendarDaysIcon, color: 'indigo', title: 'Leave Management', desc: 'Apply, track, and manage leaves with real-time status updates, balance tracking, and team calendar views.' },
    { icon: CurrencyRupeeIcon, color: 'emerald', title: 'Expense Reimbursements', desc: 'Submit and track expense claims with document uploads. Managers approve in one click.' },
    { icon: ShieldCheckIcon, color: 'violet', title: 'Role-Based Access Control', desc: 'Strict RBAC ensures employees, managers, and admins only see what they need.' },
    { icon: SparklesIcon, color: 'amber', title: 'Gemini AI Assistant', desc: 'An intelligent HR chatbot powered by Google Gemini that answers leave queries and policy questions.' },
    { icon: BellIcon, color: 'rose', title: 'Real-Time Notifications', desc: 'Instant push alerts via Socket.io and automated email notifications through Nodemailer.' },
    { icon: ChartBarIcon, color: 'cyan', title: 'Analytics & Reporting', desc: 'Interactive charts for leave distributions, reimbursement trends, and org-wide availability.' },
];

const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const testimonials = [
    { name: 'Priya Sharma', role: 'HR Manager, TechCorp', text: 'Leavify cut our leave approval time from days to minutes. The AI assistant answers common HR queries so I can focus on strategic work.' },
    { name: 'Rahul Mehta', role: 'CEO, StartupX', text: 'Setting up took 10 minutes. The RBAC system is exactly what we needed — employees see their data, managers see their team, admins see everything.' },
    { name: 'Anita Kapoor', role: 'Operations Lead, Nexus', text: 'The real-time notifications are a game-changer. No more chasing managers for approvals — everyone gets instant alerts.' },
];

const workflowSteps = [
    { step: '01', title: 'Employee Applies', desc: 'Employee selects leave type, dates, and submits a request in under 30 seconds.', icon: DocumentTextIcon },
    { step: '02', title: 'Manager Reviews', desc: 'Manager receives an instant notification and approves or rejects with a reason.', icon: UserGroupIcon },
    { step: '03', title: 'Instant Updates', desc: 'Employee gets notified via push and email. Balances update automatically.', icon: BellIcon },
    { step: '04', title: 'Admin Oversight', desc: 'Admins monitor org-wide leaves, audit logs, and team availability on one dashboard.', icon: ChartBarIcon },
];

const LandingPage = () => {
    return (
        <div className="bg-[#050508] text-white min-h-screen font-sans overflow-x-hidden">
            <LandingNavbar />

            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <Hero3D />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/40 via-transparent to-[#050508] pointer-events-none z-[1]" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div variants={fadeUp}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            AI-Powered HR Platform
                        </motion.div>

                        <motion.h1 variants={fadeUp}
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                            <span className="text-white">Leave Management,</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
                                Reimagined.
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Leavify is an enterprise-grade HR platform built on MERN stack — handling leaves, reimbursements, AI assistance, and real-time team insights for companies of all sizes.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/register"
                                className="group flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all text-base">
                                Start Free Trial
                                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/features"
                                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all text-base">
                                Explore Features
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll cue */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                    <div className="w-px h-14 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
                    <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">Scroll</span>
                </motion.div>
            </section>

            {/* ── STATS ─────────────────────────────────────────── */}
            <section className="py-16 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={stagger}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((s) => (
                            <AnimatedStat key={s.label} end={s.end} suffix={s.suffix} label={s.label} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES GRID ─────────────────────────────────── */}
            <section id="features" className="py-28 scroll-mt-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
                        className="text-center mb-20">
                        <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-4">Platform Capabilities</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight">
                            Everything HR needs,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">in one platform.</span>
                        </motion.h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <motion.div key={f.title} variants={fadeUp}
                                className="group relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-indigo-500/40 transition-all duration-500 overflow-hidden">
                                <div className="relative bg-white/[0.03] hover:bg-white/[0.06] rounded-[23px] p-8 h-full transition-colors duration-500">
                                    <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${colorMap[f.color]}`}>
                                        <f.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="text-center mt-12">
                        <Link to="/features" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors group">
                            Explore all features
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────── */}
            <section className="py-28 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-20">
                        <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">Workflow</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight">
                            How Leavify Works
                        </motion.h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workflowSteps.map((step, i) => (
                            <motion.div key={step.step} variants={fadeUp} className="relative">
                                {i < workflowSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 left-[calc(100%+12px)] w-[calc(100%-24px)] h-px bg-gradient-to-r from-indigo-500/40 to-transparent -z-10" style={{ width: 'calc(100% - 2rem)' }} />
                                )}
                                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">{step.step}</span>
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <step.icon className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── ROLE SHOWCASE ─────────────────────────────────── */}
            <section className="py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-20">
                        <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-violet-500 mb-4">Built for Everyone</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight">
                            Three roles,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">one platform.</span>
                        </motion.h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { role: 'Employee', color: 'from-indigo-600 to-blue-600', items: ['Apply for any leave type', 'Submit expense claims', 'View leave balances', 'Track request history', 'AI-powered HR assistant', 'Real-time status alerts'] },
                            { role: 'Manager', color: 'from-violet-600 to-purple-600', items: ['Approve / reject leaves', 'Review reimbursements', 'Team calendar view', 'Acting admin delegation', 'Department analytics', 'Instant notifications'] },
                            { role: 'Admin', color: 'from-emerald-600 to-teal-600', items: ['Full org-wide visibility', 'User management', 'Balance adjustments', 'Audit log access', 'All reimbursements view', 'Acting manager review'] },
                        ].map((r) => (
                            <motion.div key={r.role} variants={fadeUp}
                                className="relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden group hover:from-white/20 transition-all duration-500">
                                <div className="bg-white/[0.03] rounded-[23px] p-8 h-full">
                                    <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r ${r.color} mb-6`}>
                                        {r.role}
                                    </div>
                                    <ul className="space-y-3">
                                        {r.items.map((item) => (
                                            <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                                                <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── TESTIMONIALS ─────────────────────────────────── */}
            <section className="py-28 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-20">
                        <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-rose-500 mb-4">Testimonials</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight">
                            Trusted by HR Teams
                        </motion.h2>
                    </motion.div>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <motion.div key={t.name} variants={fadeUp}
                                className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all group">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                                <div>
                                    <p className="font-bold text-white text-sm">{t.name}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{t.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────── */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[900px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                            Ready to modernize<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">your HR?</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                            Join hundreds of teams that have replaced spreadsheets with Leavify. Set up takes less than 10 minutes.
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register"
                                className="px-10 py-4 rounded-full font-bold text-white text-base bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-all">
                                Start Free Trial
                            </Link>
                            <Link to="/pricing"
                                className="px-10 py-4 rounded-full font-bold text-gray-300 text-base bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all">
                                View Pricing
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default LandingPage;
