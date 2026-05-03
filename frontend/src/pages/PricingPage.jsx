import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const plans = [
    {
        name: 'Starter',
        price: { monthly: 'Free', annually: 'Free' },
        desc: 'Perfect for small teams just getting started.',
        color: 'from-gray-600 to-gray-500',
        badge: null,
        features: [
            { label: 'Up to 10 employees', included: true },
            { label: 'Leave management', included: true },
            { label: 'Basic email notifications', included: true },
            { label: 'Employee self-service portal', included: true },
            { label: 'Expense reimbursements', included: false },
            { label: 'AI HR Assistant', included: false },
            { label: 'Audit logs', included: false },
            { label: 'Acting role delegation', included: false },
            { label: 'Priority support', included: false },
        ],
        cta: 'Get Started Free',
        ctaLink: '/register',
        highlight: false,
    },
    {
        name: 'Professional',
        price: { monthly: '₹999', annually: '₹799' },
        desc: 'For growing teams that need full automation.',
        color: 'from-indigo-600 to-violet-600',
        badge: 'Most Popular',
        features: [
            { label: 'Up to 100 employees', included: true },
            { label: 'Leave management', included: true },
            { label: 'Real-time Socket.io notifications', included: true },
            { label: 'Employee self-service portal', included: true },
            { label: 'Expense reimbursements', included: true },
            { label: 'AI HR Assistant (Gemini)', included: true },
            { label: 'Audit logs', included: true },
            { label: 'Acting role delegation', included: false },
            { label: 'Priority support', included: false },
        ],
        cta: 'Start Free Trial',
        ctaLink: '/register',
        highlight: true,
    },
    {
        name: 'Enterprise',
        price: { monthly: '₹2,499', annually: '₹1,999' },
        desc: 'For large organizations requiring full control.',
        color: 'from-emerald-600 to-teal-600',
        badge: null,
        features: [
            { label: 'Unlimited employees', included: true },
            { label: 'Leave management', included: true },
            { label: 'Real-time Socket.io notifications', included: true },
            { label: 'Employee self-service portal', included: true },
            { label: 'Expense reimbursements', included: true },
            { label: 'AI HR Assistant (Gemini)', included: true },
            { label: 'Full audit logs & reports', included: true },
            { label: 'Acting role delegation', included: true },
            { label: 'Priority support (SLA)', included: true },
        ],
        cta: 'Contact Sales',
        ctaLink: '/contact',
        highlight: false,
    },
];

const faqs = [
    { q: 'Is there a free trial?', a: 'Yes! The Starter plan is completely free and requires no credit card. You can upgrade at any time.' },
    { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from your account settings.' },
    { q: 'What happens to my data if I downgrade?', a: 'Your data is preserved. You will just lose access to features that are not available on the lower plan.' },
    { q: 'Is the AI Assistant included in all plans?', a: 'The Gemini AI HR Assistant is available on Professional and Enterprise plans.' },
    { q: 'How does acting role delegation work?', a: 'Admins can designate a manager as an "Acting Admin" for a specified period when they are on leave. All actions taken during this period are logged.' },
    { q: 'Is my data secure?', a: 'Yes. We use JWT authentication, Bcrypt password hashing, and enforce strict role-based access control on every API endpoint.' },
];

const PricingPage = () => {
    const [billing, setBilling] = useState('monthly');
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="bg-[#050508] text-white min-h-screen font-sans">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-16 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
                <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-3xl mx-auto px-4">
                    <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-violet-400 mb-4">Pricing</motion.p>
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        Simple, transparent<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">pricing.</span>
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10">
                        No hidden fees. No per-feature charges. Pick a plan and get full access to everything in it.
                    </motion.p>

                    {/* Billing toggle */}
                    <motion.div variants={fadeUp} className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
                        <button onClick={() => setBilling('monthly')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}>
                            Monthly
                        </button>
                        <button onClick={() => setBilling('annually')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${billing === 'annually' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}>
                            Annually <span className="text-emerald-400 text-xs ml-1">Save 20%</span>
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Plans */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <motion.div key={plan.name} variants={fadeUp}
                            className={`relative rounded-3xl overflow-hidden ${plan.highlight ? 'ring-2 ring-indigo-500/50' : 'border border-white/10'}`}>
                            {plan.badge && (
                                <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {plan.badge}
                                </div>
                            )}
                            <div className={`h-1.5 bg-gradient-to-r ${plan.color}`} />
                            <div className={`p-8 ${plan.highlight ? 'bg-indigo-500/5' : 'bg-white/[0.03]'} h-full`}>
                                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-sm mb-6">{plan.desc}</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-black text-white">{plan.price[billing]}</span>
                                    {plan.price[billing] !== 'Free' && <span className="text-gray-500 text-sm ml-1">/ user / month</span>}
                                </div>

                                <Link to={plan.ctaLink}
                                    className={`block text-center py-3.5 rounded-xl font-bold text-sm mb-8 transition-all hover:scale-[1.02] ${plan.highlight ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' : 'border border-white/10 text-white hover:bg-white/5'}`}>
                                    {plan.cta}
                                </Link>

                                <ul className="space-y-3">
                                    {plan.features.map((f) => (
                                        <li key={f.label} className="flex items-center gap-3 text-sm">
                                            {f.included ? (
                                                <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <XMarkIcon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                                            )}
                                            <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>{f.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* FAQ */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-4">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-16">
                        <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">FAQ</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight">Frequently Asked</motion.h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="space-y-3">
                        {faqs.map((faq, i) => (
                            <motion.div key={i} variants={fadeUp}
                                className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03]">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left">
                                    <span className="font-semibold text-white text-sm">{faq.q}</span>
                                    <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-45' : ''} text-2xl leading-none`}>+</span>
                                </button>
                                {openFaq === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pb-5">
                                        <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default PricingPage;
