// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Reusable dynamic page renderer
import { ModuleRenderer } from './pages/ModuleRegistry';

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
          <Route path="applications" element={<ModuleRenderer />} />
          <Route path="layouts" element={<ModuleRenderer />} />

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

          {/* Dynamic Metadata routing fallback for other modules */}
          <Route path=":module/:subpage" element={<ModuleRenderer />} />
          <Route path=":module/:subpage/:subid" element={<ModuleRenderer />} />

          {/* 404 Fallback routing */}
          <Route path="*" element={<Navigate to="/pages/error/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
