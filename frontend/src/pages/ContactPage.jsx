import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, CheckIcon } from '@heroicons/react/24/outline';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import api from '../services/api';
import toast from 'react-hot-toast';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const reasons = [
    'Set up Leavify for your organization',
    'Learn about enterprise pricing',
    'Request a live product demo',
    'Report a bug or get technical support',
    'Partnership or integration inquiries',
    'General Inquiry'
];

const ContactPage = () => {
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        company: '', 
        subject: 'General Inquiry', 
        message: '' 
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/contact', form);
            setSubmitted(true);
            toast.success('Message sent successfully!');
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#050508] text-white min-h-screen font-sans">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-16 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
                <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-3xl mx-auto px-4">
                    <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-rose-400 mb-4">Contact Us</motion.p>
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        Let&apos;s talk
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-xl mx-auto">
                        Whether you are evaluating Leavify for your company or need support, we are here to help.
                    </motion.p>
                </motion.div>
            </section>

            {/* Main Content */}
            <section className="pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Info */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl font-black mb-4">Reach out to our team</motion.h2>
                        <motion.p variants={fadeUp} className="text-gray-400 mb-10 leading-relaxed">
                            Fill in the form and we will get back to you within 24 hours. We are based in India and serve companies globally.
                        </motion.p>

                        <motion.div variants={stagger} className="space-y-5 mb-10">
                            <motion.div variants={fadeUp} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                                <EnvelopeIcon className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Email</p>
                                    <p className="text-white font-semibold text-sm">leavify8@gmail.com</p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeUp} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                                <MapPinIcon className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Location</p>
                                    <p className="text-white font-semibold text-sm">India 🇮🇳</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">How we can help:</h3>
                            <ul className="space-y-2.5">
                                {reasons.slice(0, 5).map((r) => (
                                    <li key={r} className="flex items-start gap-3 text-gray-400 text-sm">
                                        <CheckIcon className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 md:p-10">
                            {submitted ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                                        <CheckIcon className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3">Message Sent!</h3>
                                    <p className="text-gray-400">We have received your message and will get back to you within 24 hours.</p>
                                    <button 
                                        onClick={() => setSubmitted(false)}
                                        className="mt-8 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                            <input name="name" value={form.name} onChange={handleChange} required
                                                placeholder="Atharav Tyagi"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Work Email</label>
                                            <input name="email" type="email" value={form.email} onChange={handleChange} required
                                                placeholder="you@company.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                                            <input name="company" value={form.company} onChange={handleChange}
                                                placeholder="Your Company"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Inquiry Type</label>
                                            <select name="subject" value={form.subject} onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-[13px] text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                                                {reasons.map(r => <option key={r} value={r} className="bg-gray-900">{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                                        <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                                            placeholder="Tell us how we can help..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none" />
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-indigo-500/30">
                                        {loading ? 'Sending...' : 'Send Message →'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default ContactPage;
