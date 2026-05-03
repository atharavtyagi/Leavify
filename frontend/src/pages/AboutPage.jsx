import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, CodeBracketIcon, RocketLaunchIcon, HeartIcon } from '@heroicons/react/24/outline';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const techStack = [
    { layer: 'Frontend', color: 'indigo', techs: ['React 18 + Vite', 'Tailwind CSS', 'Framer Motion', 'React Three Fiber', 'Chart.js', 'Socket.io Client'] },
    { layer: 'Backend', color: 'emerald', techs: ['Node.js + Express.js', 'MongoDB + Mongoose', 'JWT Authentication', 'Bcrypt.js', 'Socket.io', 'Node Cron'] },
    { layer: 'AI & Email', color: 'violet', techs: ['Google Gemini AI', 'Nodemailer (SMTP)', 'Multer (File Uploads)', 'dotenv (Config)', 'CORS Middleware', 'Audit Logging'] },
];

const values = [
    { icon: SparklesIcon, title: 'AI-First Philosophy', desc: 'We believe HR tools should be intelligent. Our Gemini AI assistant reduces repetitive queries so HR teams can focus on strategy.' },
    { icon: CodeBracketIcon, title: 'Built by Engineers', desc: 'Leavify is built with production-grade MERN stack architecture — scalable, maintainable, and ready for enterprise workloads.' },
    { icon: RocketLaunchIcon, title: 'Speed of Deployment', desc: 'From zero to fully operational HR platform in under 10 minutes. No complex configurations or lengthy onboarding.' },
    { icon: HeartIcon, title: 'Employee Experience First', desc: 'Beautiful, intuitive interfaces that employees actually enjoy using — reducing HR friction for everyone.' },
];

const colorMap = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
};

const AboutPage = () => {
    return (
        <div className="bg-[#050508] text-white min-h-screen font-sans">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-20 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
                <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-4xl mx-auto px-4">
                    <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">About Leavify</motion.p>
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        Modernizing HR,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">one company at a time.</span>
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Leavify was built to eliminate the chaos of managing employee time-off through spreadsheets and email chains. It is a fully MERN stack platform engineered for modern workplaces.
                    </motion.p>
                </motion.div>
            </section>

            {/* Mission */}
            <section className="py-20 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.blockquote variants={fadeUp}
                            className="text-3xl md:text-4xl font-black text-gray-200 leading-snug tracking-tight max-w-3xl mx-auto">
                            &ldquo;Our mission is to give every employee a seamless, transparent, and delightful HR experience — from their first leave request to their last reimbursement.&rdquo;
                        </motion.blockquote>
                        <motion.p variants={fadeUp} className="text-gray-500 mt-6 text-sm font-semibold">— The Leavify Team</motion.p>
                    </motion.div>
                </div>
            </section>

            {/* What is HRMS */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1">
                            <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">What is HRMS?</motion.p>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                                Human Resource Management System
                            </motion.h2>
                            <motion.div variants={stagger} className="space-y-4 text-gray-400 leading-relaxed">
                                <motion.p variants={fadeUp}>
                                    An HRMS (Human Resource Management System) is a digital platform that centralizes all employee-related processes — from onboarding and leave management to payroll and performance tracking.
                                </motion.p>
                                <motion.p variants={fadeUp}>
                                    Leavify focuses specifically on the <strong className="text-white">leave management and expense reimbursement</strong> lifecycle, with AI-powered assistance and real-time team collaboration built in.
                                </motion.p>
                                <motion.p variants={fadeUp}>
                                    Instead of email threads and Excel sheets, Leavify gives your organization a <strong className="text-white">single source of truth</strong> for all time-off and expense data.
                                </motion.p>
                            </motion.div>
                        </div>
                        <motion.div variants={fadeUp} className="flex-1 grid grid-cols-2 gap-4">
                            {[
                                { label: 'Leave Requests', val: 'Automated' },
                                { label: 'Approvals', val: 'One-Click' },
                                { label: 'AI Assistance', val: 'Gemini-Powered' },
                                { label: 'Notifications', val: 'Real-Time' },
                            ].map((item) => (
                                <div key={item.label} className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center hover:border-indigo-500/30 transition-colors">
                                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-1">{item.val}</p>
                                    <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-16">
                        <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-violet-400 mb-4">Our Values</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight">What drives us</motion.h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {values.map((v) => (
                            <motion.div key={v.title} variants={fadeUp}
                                className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all flex gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <v.icon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg mb-2">{v.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-16">
                        <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4">Built With</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight">Modern Tech Stack</motion.h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {techStack.map((ts) => (
                            <motion.div key={ts.layer} variants={fadeUp}
                                className={`p-8 rounded-3xl border ${colorMap[ts.color]}`}>
                                <h3 className="font-black text-white text-lg mb-5">{ts.layer}</h3>
                                <ul className="space-y-2.5">
                                    {ts.techs.map((t) => (
                                        <li key={t} className="flex items-center gap-2.5 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center border-t border-white/5">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                    className="max-w-2xl mx-auto px-4">
                    <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Start your HR journey today</motion.h2>
                    <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
                        <Link to="/register" className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 transition-all shadow-lg shadow-indigo-500/30">
                            Start Free Trial
                        </Link>
                        <Link to="/contact" className="px-8 py-3.5 rounded-full font-bold text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                            Contact Us
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default AboutPage;
