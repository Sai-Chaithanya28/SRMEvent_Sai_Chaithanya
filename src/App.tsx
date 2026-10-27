import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { DataProvider } from '@/shared/lib/DataContext';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { WorkerLayout } from '@/worker/WorkerLayout';
import { EmployerLayout } from '@/employer/EmployerLayout';

// Worker Pages
import { WorkerHomePage } from '@/worker/pages/HomePage';
import { CheckinPage } from '@/worker/pages/CheckinPage';
import { HoursPage } from '@/worker/pages/HoursPage';
import { PayslipPage } from '@/worker/pages/PayslipPage';
import { HazardReportPage } from '@/worker/pages/HazardReportPage';
import { SpeakUpPage } from '@/worker/pages/SpeakUpPage';

// Employer Pages (Route-level code splitting)
const OverviewPage = lazy(() =>
  import('@/employer/pages/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const AttendancePage = lazy(() =>
  import('@/employer/pages/AttendancePage').then((m) => ({ default: m.AttendancePage }))
);
const OvertimePage = lazy(() =>
  import('@/employer/pages/OvertimePage').then((m) => ({ default: m.OvertimePage }))
);
const HazardInboxPage = lazy(() =>
  import('@/employer/pages/HazardInboxPage').then((m) => ({ default: m.HazardInboxPage }))
);
const FeedbackInsightsPage = lazy(() =>
  import('@/employer/pages/FeedbackInsightsPage').then((m) => ({ default: m.FeedbackInsightsPage }))
);
const WorkersPage = lazy(() =>
  import('@/employer/pages/WorkersPage').then((m) => ({ default: m.WorkersPage }))
);

const RoleRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'employer' ? '/employer' : '/worker'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-slate-700">Loading FairShift...</span>
                </div>
              </div>
            }
          >
            <Routes>
              {/* Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Worker Routes */}
              <Route path="/worker" element={<WorkerLayout />}>
                <Route index element={<WorkerHomePage />} />
                <Route path="checkin" element={<CheckinPage />} />
                <Route path="hours" element={<HoursPage />} />
                <Route path="payslip" element={<PayslipPage />} />
                <Route path="hazard" element={<HazardReportPage />} />
                <Route path="speak-up" element={<SpeakUpPage />} />
              </Route>

              {/* Employer Routes */}
              <Route path="/employer" element={<EmployerLayout />}>
                <Route index element={<OverviewPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="overtime" element={<OvertimePage />} />
                <Route path="hazards" element={<HazardInboxPage />} />
                <Route path="feedback" element={<FeedbackInsightsPage />} />
                <Route path="workers" element={<WorkersPage />} />
              </Route>

              {/* Default Redirect */}
              <Route path="/" element={<RoleRedirect />} />
              <Route path="*" element={<RoleRedirect />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
