import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CalendarDaysIcon, ShieldCheckIcon, CurrencyRupeeIcon,
    ServerStackIcon, CheckIcon, ArrowRightIcon, LightBulbIcon,
    ExclamationTriangleIcon, ClockIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

// ─── Guide content definitions ────────────────────────────────────────────────
const guides = {
    'hrms': {
        icon: ServerStackIcon,
        color: 'indigo',
        badge: 'Overview',
        title: 'What is an HRMS?',
        subtitle: 'A Human Resource Management System (HRMS) is digital software that centralizes every employee-related process — from hiring and leaves to payroll and performance tracking — into a single platform.',
        sections: [
            {
                heading: 'Why does your company need an HRMS?',
                body: `Before HRMS platforms existed, HR teams managed employee data across spreadsheets, email threads, and paper forms. This created data silos, approval delays, compliance risks, and a poor employee experience. An HRMS eliminates all of that by providing a single source of truth for your entire workforce.`
            },
            {
                heading: 'Core components of an HRMS',
                list: [
                    'Leave & Attendance Management — Track time-off requests, balances, and approvals.',
                    'Employee Self-Service Portal — Employees can manage their own data, requests, and history.',
                    'Role-Based Access Control — Different levels of access for employees, managers, and admins.',
                    'Expense & Reimbursement Management — Submit and approve expense claims digitally.',
                    'Notifications & Alerts — Real-time alerts for every stage of the approval workflow.',
                    'Analytics & Reporting — Dashboards for leave trends, team availability, and headcount.',
                ]
            },
            {
                heading: 'How Leavify fits in',
                body: `Leavify is a focused HRMS that covers the two most critical HR workflows: leave management and expense reimbursements. Built on the MERN stack with an AI assistant powered by Google Gemini, it is designed for teams that want a modern, real-time HR experience without the overhead of legacy enterprise software.`
            },
            {
                heading: 'Key benefits at a glance',
                list: [
                    'Reduce approval turnaround from days to minutes.',
                    'Eliminate back-and-forth emails between employees and managers.',
                    'Maintain a complete, immutable audit trail of all HR actions.',
                    'Give every employee transparent access to their own leave balances.',
                    'Enable managers to see their team\'s availability at a glance.',
                ]
            },
        ],
        relatedLinks: [
            { label: 'Guide to Leave Management', href: '/guide/leave-management' },
            { label: 'Guide to RBAC', href: '/guide/rbac' },
            { label: 'Explore Leavify Features', href: '/features' },
        ]
    },

    'leave-management': {
        icon: CalendarDaysIcon,
        color: 'emerald',
        badge: 'HR Guide',
        title: 'Guide to Leave Management',
        subtitle: 'Leave management is the process of handling employee time-off requests — from application and approval to balance tracking and calendar visibility — in a structured, policy-driven way.',
        sections: [
            {
                heading: 'The problem with manual leave management',
                body: `Most small and mid-sized companies manage leaves via email or spreadsheets. This leads to lost requests, inconsistent approvals, inaccurate balance records, and frustrated employees. A digital leave management system eliminates these pain points entirely.`
            },
            {
                heading: 'Types of leave your company should track',
                list: [
                    'Annual / Earned Leave — Accrued over time, the most common leave type.',
                    'Sick Leave — For illness and medical appointments.',
                    'Casual Leave — Short, unplanned absences for personal reasons.',
                    'Maternity / Paternity Leave — Extended leave for new parents.',
                    'Compensatory Off — Time off in lieu of overtime worked.',
                    'Leave Without Pay (LWP) — When no balance remains but absence is approved.',
                ]
            },
            {
                heading: 'The ideal leave approval workflow',
                list: [
                    '1. Employee applies with leave type, dates, and an optional reason.',
                    '2. Manager receives an instant notification to review the request.',
                    '3. Manager approves or rejects the request with optional comments.',
                    '4. Employee is notified via push notification and email.',
                    '5. Leave balance is automatically deducted upon approval.',
                    '6. Admin can view all approved leaves on a company-wide calendar.',
                ]
            },
            {
                heading: 'How Leavify handles leave management',
                body: `In Leavify, employees submit leave requests in under 30 seconds. Managers get real-time Socket.io push notifications and can approve or reject in one click. Leave balances are updated immediately, and the entire history is stored with full audit trail support.`
            },
            {
                heading: 'Best practices for leave policy',
                list: [
                    'Define clear leave types and entitlements in writing.',
                    'Set a minimum notice period for planned leave requests.',
                    'Cap the number of people from one team on leave at the same time.',
                    'Enforce a leave encashment or carry-forward policy at year end.',
                    'Allow managers to delegate approval authority when they are on leave.',
                ]
            },
        ],
        relatedLinks: [
            { label: 'Guide to Reimbursements', href: '/guide/reimbursements' },
            { label: 'What is HRMS?', href: '/guide/hrms' },
            { label: 'Try Leave Management in Leavify', href: '/register' },
        ]
    },

    'reimbursements': {
        icon: CurrencyRupeeIcon,
        color: 'violet',
        badge: 'HR Guide',
        title: 'Guide to Expense Reimbursements',
        subtitle: 'Expense reimbursements are the process by which a company repays employees for out-of-pocket business expenses — such as travel, meals, equipment, and training costs.',
        sections: [
            {
                heading: 'Why reimbursement management matters',
                body: `Poor expense management hurts both employees (who wait weeks to be repaid) and finance teams (who lack visibility into spending). A structured reimbursement system creates a clear, auditable process that protects everyone.`
            },
            {
                heading: 'Common expense categories',
                list: [
                    'Travel — Flights, trains, taxis, and fuel for business trips.',
                    'Accommodation — Hotel and lodging during official travel.',
                    'Meals & Entertainment — Business lunches, client dinners.',
                    'Office Supplies — Stationery, peripherals, and equipment.',
                    'Training & Certification — Courses, exams, and learning materials.',
                    'Communication — Work phone bills, internet top-ups.',
                ]
            },
            {
                heading: 'The reimbursement approval workflow',
                list: [
                    '1. Employee submits an expense claim with type, amount, date, and receipt.',
                    '2. Manager reviews the claim and approves or rejects it with a reason.',
                    '3. Admin performs a final review and approves for payment.',
                    '4. Employee is notified at each stage via push notification and email.',
                    '5. All approved claims are stored permanently for finance auditing.',
                ]
            },
            {
                heading: 'How Leavify handles reimbursements',
                body: `Leavify's reimbursement module supports document uploads (receipts), two-stage approval (Manager → Admin), and a full history view for every employee. Admins get a global view of all pending and processed claims, while managers see their team's submissions grouped by department.`
            },
            {
                heading: 'Reimbursement policy best practices',
                list: [
                    'Set a submission deadline (e.g., claims must be submitted within 30 days).',
                    'Define per-category spending limits to prevent overspending.',
                    'Always require receipts for claims above a minimum threshold.',
                    'Enforce a two-stage approval for claims above a certain amount.',
                    'Process approved reimbursements within a fixed payroll cycle.',
                ]
            },
        ],
        relatedLinks: [
            { label: 'Guide to Leave Management', href: '/guide/leave-management' },
            { label: 'View Pricing', href: '/pricing' },
            { label: 'Try Reimbursements in Leavify', href: '/register' },
        ]
    },

    'rbac': {
        icon: ShieldCheckIcon,
        color: 'rose',
        badge: 'Security Guide',
        title: 'What is Role-Based Access Control?',
        subtitle: 'Role-Based Access Control (RBAC) is a security model where system permissions are assigned based on a user\'s role within the organization — not to individual users directly.',
        sections: [
            {
                heading: 'Why RBAC matters in HR software',
                body: `HR software stores sensitive data — salaries, leave histories, performance reviews, personal details. Without proper access control, any employee could view another's confidential records. RBAC ensures that users only see data that is relevant and appropriate to their role.`
            },
            {
                heading: 'The three roles in Leavify',
                list: [
                    'Employee — Can manage their own leaves, reimbursements, and profile. Cannot see other employees\' data.',
                    'Manager — Can view and approve their team\'s leave and reimbursement requests. Has department-level visibility.',
                    'Admin — Has full organizational visibility and control. Can manage users, balances, audit logs, and all approvals.',
                ]
            },
            {
                heading: 'How RBAC is enforced in Leavify',
                list: [
                    'Every API endpoint is protected by JWT middleware that verifies the user\'s role.',
                    'Frontend routes are guarded by ProtectedRoute components that check role permissions.',
                    'Admin-only routes (manage users, all leaves) reject Manager and Employee tokens at the API level.',
                    'Acting Admin delegation is logged in the audit trail and expires automatically.',
                    'All sensitive actions (approve, reject, delete) are recorded with the actor\'s user ID.',
                ]
            },
            {
                heading: 'Acting Admin — a unique RBAC feature',
                body: `When an Admin goes on leave, they can designate a trusted Manager as "Acting Admin" for a specified period. The Acting Admin temporarily gains admin-level permissions. Every action they take during this period is tagged in the audit log, ensuring full accountability even during administrative handovers.`
            },
            {
                heading: 'RBAC best practices',
                list: [
                    'Apply the Principle of Least Privilege — give users the minimum access they need.',
                    'Review and update roles when employees change positions.',
                    'Always maintain an audit log of actions taken by each role.',
                    'Separate read and write permissions where possible.',
                    'Time-box elevated privileges (like Acting Admin) and revoke them automatically.',
                ]
            },
        ],
        relatedLinks: [
            { label: 'What is HRMS?', href: '/guide/hrms' },
            { label: 'Explore Security Features', href: '/features#security' },
            { label: 'Start Free Trial', href: '/register' },
        ]
    },
};

const colorMap = {
    indigo: { icon: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', glow: 'bg-indigo-600/10' },
    emerald: { icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', glow: 'bg-emerald-600/10' },
    violet: { icon: 'bg-violet-500/10 border-violet-500/20 text-violet-400', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', glow: 'bg-violet-600/10' },
    rose: { icon: 'bg-rose-500/10 border-rose-500/20 text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', glow: 'bg-rose-600/10' },
};

const GuidePage = () => {
    const { slug } = useParams();
    const guide = guides[slug];

    if (!guide) return <Navigate to="/features" replace />;

    const c = colorMap[guide.color];

    return (
        <div className="bg-[#050508] text-white min-h-screen font-sans">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-40 pb-16 relative overflow-hidden">
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] ${c.glow} rounded-full blur-[120px] pointer-events-none`} />
                <motion.div initial="hidden" animate="visible" variants={stagger}
                    className="relative z-10 max-w-4xl mx-auto px-4">
                    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${c.icon}`}>
                            <guide.icon className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${c.badge}`}>{guide.badge}</span>
                    </motion.div>
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
                        {guide.title}
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-gray-400 text-lg leading-relaxed max-w-3xl">
                        {guide.subtitle}
                    </motion.p>
                </motion.div>
            </section>

            {/* Article content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                    className="space-y-12">
                    {guide.sections.map((section, i) => (
                        <motion.div key={i} variants={fadeUp}
                            className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                            <h2 className="text-2xl font-black text-white mb-5 tracking-tight">{section.heading}</h2>
                            {section.body && (
                                <p className="text-gray-400 leading-relaxed">{section.body}</p>
                            )}
                            {section.list && (
                                <ul className="space-y-3 mt-2">
                                    {section.list.map((item, j) => (
                                        <li key={j} className="flex items-start gap-3 text-gray-300 text-sm">
                                            <CheckIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${c.icon.split(' ').find(cls => cls.startsWith('text-'))}`} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Related links */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                    className="mt-16 p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
                    <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5">Related Resources</motion.p>
                    <motion.div variants={stagger} className="flex flex-col sm:flex-row gap-3 flex-wrap">
                        {guide.relatedLinks.map((link) => (
                            <motion.div key={link.label} variants={fadeUp}>
                                <Link to={link.href}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-300 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all group">
                                    {link.label}
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </article>

            {/* CTA */}
            <section className="py-20 border-t border-white/5 text-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                    className="max-w-xl mx-auto px-4">
                    <motion.h2 variants={fadeUp} className="text-4xl font-black mb-6">Start using Leavify today</motion.h2>
                    <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
                        <Link to="/register" className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 transition-all shadow-lg shadow-indigo-500/30">
                            Start Free Trial
                        </Link>
                        <Link to="/features" className="px-8 py-3.5 rounded-full font-bold text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                            Explore Features
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default GuidePage;
