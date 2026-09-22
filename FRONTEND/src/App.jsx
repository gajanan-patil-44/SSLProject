import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Direct custom pages imports
import Dashboard from './pages/Dashboard/index';
import EmployeesView from './pages/HRM/EmployeesView';
import AttendanceView from './pages/HRM/AttendanceView';
import LeaveView from './pages/HRM/LeaveView';
import PipelineView from './pages/CRM/PipelineView';
import POSView from './pages/POS/POSView';
import TicketsView from './pages/Support/TicketsView';
import ShowcaseView from './pages/UIInterface/ShowcaseView';
import PagesView from './pages/Pages/PagesView';
import HelpView from './pages/Help/HelpView';
import LetterBuilderView from './pages/Documents/LetterBuilderView';
import UserCreationView from './pages/Master/UserCreationView';
import ManagePageView from './pages/Master/ManagePageView';
import ManageUserView from './pages/UserManagement/ManageUserView';

// Reusable dynamic page renderer
import { ModuleRenderer } from './pages/ModuleRegistry';

// Keyed wrapper ensures complete component remount on route changes
function KeyedModuleRenderer() {
  const location = useLocation();
  return <ModuleRenderer key={location.pathname} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Layout Shell wrapper */}
        <Route path="/" element={<AppLayout />}>
          {/* Index Redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Main Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Main Single Segment routes */}
          <Route path="roles" element={<KeyedModuleRenderer />} />
          <Route path="companies" element={<KeyedModuleRenderer />} />
          <Route path="designations" element={<KeyedModuleRenderer />} />
          <Route path="projects" element={<KeyedModuleRenderer />} />
          <Route path="applications" element={<KeyedModuleRenderer />} />
          <Route path="layouts" element={<KeyedModuleRenderer />} />
          <Route path="manage-page" element={<ManagePageView />} />
          <Route path="manage-users" element={<ManageUserView />} />
          <Route path="users" element={<ManageUserView />} />

          {/* HRM Special Pages */}
          <Route path="hrm/employees" element={<EmployeesView />} />
          <Route path="hrm/attendance" element={<AttendanceView />} />
          <Route path="hrm/leave" element={<LeaveView />} />

          {/* CRM Special Pages */}
          <Route path="crm/pipeline" element={<PipelineView />} />

          {/* POS Special Page */}
          <Route path="pos/pos" element={<POSView />} />

          {/* Support Special Page */}
          <Route path="support/tickets" element={<TicketsView />} />

          {/* UI Design System Showcases */}
          <Route path="ui/:subpage" element={<ShowcaseView />} />

          {/* General Auth/Error Full screens (handled by layout class toggles) */}
          <Route path="pages/auth/:subpage" element={<PagesView />} />
          <Route path="pages/error/:subpage" element={<PagesView />} />
          <Route path="pages/utilities" element={<PagesView />} />

          {/* Help & Support Docs */}
          <Route path="help/:subpage" element={<HelpView />} />
          <Route path="help/multilevel/:subid" element={<HelpView />} />

          {/* Master Special Pages */}
          <Route path="master/user-creation" element={<UserCreationView />} />
          <Route path="master/manage-users" element={<ManageUserView />} />
          <Route path="master/manage-user" element={<ManageUserView />} />
          <Route path="master/users" element={<ManageUserView />} />
          <Route path="user-management/manage-users" element={<ManageUserView />} />
          <Route path="user-management/users" element={<ManageUserView />} />
          <Route path="master/manage-page" element={<ManagePageView />} />

          {/* Documents */}
          <Route path="documents/letter-builder" element={<LetterBuilderView />} />

          {/* Dynamic Metadata routing fallback for other modules */}
          <Route path=":module/:subpage" element={<KeyedModuleRenderer />} />
          <Route path=":module/:subpage/:subid" element={<KeyedModuleRenderer />} />

          {/* 404 Fallback routing */}
          <Route path="*" element={<Navigate to="/pages/error/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
