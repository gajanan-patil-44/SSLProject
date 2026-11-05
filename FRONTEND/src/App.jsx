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
import PagesView from './pages/Pages/Login';
import HelpView from './pages/Help/HelpView';
import LetterBuilderView from './pages/Documents/LetterBuilderView';
import UserCreationView from './pages/Master/UserCreationView';
import ManagePageView from './pages/Master/ManagePageView';
import ManageUserView from './pages/UserManagement/ManageUserView';
import MaterialCategoryCreation from './pages/MaterialCategoryCreation';
import MaterialSubCategoryCreation from './pages/MaterialSubCategoryCreation';
import ItemCreation from './pages/ItemCreation';
import VendorManagement from './pages/Master/VendorManagementView';
import LocationTypeMasterView from './pages/Master/LocationTypeMasterView';
import LocationMasterView from './pages/Master/LocationMasterView';
import CompanyMasterView from './pages/Master/CompanyMasterView';
import RaisePRRequestView from './pages/Procurement/RaisePRRequestView';

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

          {/* Direct Auth / Login shortcuts */}
          <Route path="login" element={<Navigate to="/pages/auth/login" replace />} />
          <Route path="auth/login" element={<Navigate to="/pages/auth/login" replace />} />

          {/* Main Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* ── Procurement ── */}
          <Route path="procurement/raise-pr-request" element={<RaisePRRequestView />} />
          <Route path="procurement/raise-pr" element={<Navigate to="/procurement/raise-pr-request" replace />} />
          <Route path="procurement/pr-request" element={<Navigate to="/procurement/raise-pr-request" replace />} />

          {/* Canonical Master Special Pages */}
          <Route path="master/companies" element={<KeyedModuleRenderer />} />
          <Route path="master/company-master" element={<CompanyMasterView />} />
          <Route path="master/location-type-master" element={<LocationTypeMasterView />} />
          <Route path="master/location-type" element={<LocationTypeMasterView />} />
          <Route path="master/location-master" element={<LocationMasterView />} />
          <Route path="master/locations" element={<LocationMasterView />} />
          <Route path="master/products" element={<KeyedModuleRenderer />} />
          <Route path="master/company-products" element={<KeyedModuleRenderer />} />
          <Route path="master/projects" element={<KeyedModuleRenderer />} />
          <Route path="master/designations" element={<KeyedModuleRenderer />} />
          <Route path="master/roles" element={<KeyedModuleRenderer />} />
          <Route path="master/user-creation" element={<UserCreationView />} />
          <Route path="master/manage-users" element={<ManageUserView />} />
          <Route path="master/manage-page" element={<ManagePageView />} />
          <Route path="master/material-category" element={<MaterialCategoryCreation />} />
          <Route path="master/material-sub-category" element={<MaterialSubCategoryCreation />} />
          <Route path="master/material-creation" element={<ItemCreation />} />
          <Route path="master/vendor-management" element={<VendorManagement />} />

          {/* Legacy / Alternate Redirects to Standard Canonical URLs */}
          <Route path="master/location" element={<Navigate to="/master/location-type-master" replace />} />
          <Route path="location-type-master" element={<Navigate to="/master/location-type-master" replace />} />
          <Route path="location-type" element={<Navigate to="/master/location-type-master" replace />} />
          <Route path="location-master" element={<Navigate to="/master/location-master" replace />} />
          <Route path="locations" element={<Navigate to="/master/location-master" replace />} />
          <Route path="company-master" element={<Navigate to="/master/company-master" replace />} />
          <Route path="master/item-creation" element={<Navigate to="/master/material-creation" replace />} />
          <Route path="master/items" element={<Navigate to="/master/material-creation" replace />} />
          <Route path="master/vendors" element={<Navigate to="/master/vendor-management" replace />} />
          <Route path="vendor-management" element={<Navigate to="/master/vendor-management" replace />} />
          <Route path="vendors" element={<Navigate to="/master/vendor-management" replace />} />
          <Route path="master/manage-user" element={<Navigate to="/master/manage-users" replace />} />
          <Route path="master/users" element={<Navigate to="/master/manage-users" replace />} />
          <Route path="user-management/*" element={<Navigate to="/master/manage-users" replace />} />
          <Route path="manage-users" element={<Navigate to="/master/manage-users" replace />} />
          <Route path="users" element={<Navigate to="/master/manage-users" replace />} />
          <Route path="roles" element={<Navigate to="/master/roles" replace />} />
          <Route path="companies" element={<Navigate to="/master/companies" replace />} />
          <Route path="designations" element={<Navigate to="/master/designations" replace />} />
          <Route path="projects" element={<Navigate to="/master/projects" replace />} />
          <Route path="manage-page" element={<Navigate to="/master/manage-page" replace />} />

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

          {/* General Auth/Error Full screens */}
          <Route path="pages/auth/:subpage" element={<PagesView />} />
          <Route path="pages/error/:subpage" element={<PagesView />} />
          <Route path="pages/utilities" element={<PagesView />} />

          {/* Help & Support Docs */}
          <Route path="help/:subpage" element={<HelpView />} />
          <Route path="help/multilevel/:subid" element={<HelpView />} />

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
