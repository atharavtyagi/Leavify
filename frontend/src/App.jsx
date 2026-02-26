import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoutes';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/settings" element={<Settings />} />

            {/* Employee Routes */}
            <Route path="/my-leaves" element={<MyLeaves />} />
            <Route path="/my-reimbursements" element={<MyReimbursements />} />

            {/* Manager & Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Manager', 'Admin']} />}>
              <Route path="/leave-requests" element={<LeaveRequests />} />
              <Route path="/reimbursement-requests" element={<ReimbursementRequests />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/manage-balances" element={<ManageBalances />} />
              <Route path="/all-leaves" element={<AllLeaves />} />
              <Route path="/all-reimbursements" element={<AllReimbursements />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
