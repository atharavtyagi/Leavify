import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoutes';
import DashboardLayout from './layouts/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';

// Pages
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GuidePage from './pages/GuidePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyLeaves from './pages/MyLeaves';
import LeaveRequests from './pages/LeaveRequests';
import AllLeaves from './pages/AllLeaves';
import ManageUsers from './pages/ManageUsers';
import ManageBalances from './pages/ManageBalances';
import CalendarView from './pages/CalendarView';
import Settings from './pages/Settings';

// Reimbursement Pages
import MyReimbursements from './pages/MyReimbursements';
import ReimbursementRequests from './pages/ReimbursementRequests';
import AllReimbursements from './pages/AllReimbursements';

// Enterprise Pages
import AdminReview from './pages/AdminReview';
import AuditDashboard from './pages/AuditDashboard';
import MyActivity from './pages/MyActivity';
import ReviewActingDecisions from './pages/ReviewActingDecisions';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/guide/:slug" element={<GuidePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-activity" element={<MyActivity />} />

            {/* Employee Routes */}
            <Route path="/my-leaves" element={<MyLeaves />} />
            <Route path="/my-reimbursements" element={<MyReimbursements />} />

            {/* Manager & Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Manager', 'Admin']} />}>
              <Route path="/leave-requests" element={<LeaveRequests />} />
              <Route path="/reimbursement-requests" element={<ReimbursementRequests />} />
              <Route path="/audit-logs" element={<AuditDashboard />} />
              <Route path="/manager/review-acting-decisions" element={<ReviewActingDecisions />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/manage-balances" element={<ManageBalances />} />
              <Route path="/all-leaves" element={<AllLeaves />} />
              <Route path="/all-reimbursements" element={<AllReimbursements />} />
              <Route path="/admin-review" element={<AdminReview />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
