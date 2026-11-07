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
import MaterialCategoryCreation from './pages/MaterialCategoryCreation';
import MaterialSubCategoryCreation from './pages/MaterialSubCategoryCreation';
import ItemCreation from './pages/ItemCreation';
import VendorManagement from './pages/Master/VendorManagementView';
import LocationTypeMasterView from './pages/Master/LocationTypeMasterView';
import LocationMasterView from './pages/Master/LocationMasterView';
import CompanyMasterView from './pages/Master/CompanyMasterView';
import DepartmentView from './pages/Master/DepartmentView';
import GSTCreationView from './pages/Master/GSTCreationView';
import DesignationView from './pages/Master/DesignationView';
import CompanyRoleView from './pages/Master/CompanyRoleView';
import CompanyDesignationView from './pages/Master/CompanyDesignationView';
// import RaisePRView from "./pages/POS/"

// Work Management Module
import {
  DailyWorkUpdateView,
  WorkHistoryView,
  AssignedTasksView,
  TaskAssignmentView,
  ProjectTaskTrackerView,
  TeamUpdatesView,
  WorkUpdateReviewView,
  OrganizationDashboardView,
  WorkReportsAnalyticsView
} from './pages/WorkManagement';

// Procurement / Purchase Requisition (PR) Module
import {
  RaisePRView,
  ViewRaisePRsView,
  MyPendingApprovalsView
} from './pages/Procurement';

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
          <Route path="master/designations" element={<DesignationView />} />
          <Route path="master/company-designations" element={<CompanyDesignationView />} />
          <Route path="master/company-designation" element={<CompanyDesignationView />} />
          <Route path="master/company-roles" element={<CompanyRoleView />} />
          <Route path="master/company-role" element={<CompanyRoleView />} />
          <Route path="master/roles" element={<KeyedModuleRenderer />} />
          <Route path="master/user-creation" element={<UserCreationView />} />
          <Route path="master/manage-users" element={<ManageUserView />} />
          <Route path="master/manage-page" element={<ManagePageView />} />
          <Route path="master/material-category" element={<MaterialCategoryCreation />} />
          <Route path="master/material-sub-category" element={<MaterialSubCategoryCreation />} />
          <Route path="master/material-creation" element={<ItemCreation />} />
          <Route path="master/vendor-management" element={<VendorManagement />} />
          <Route path="master/department" element={<DepartmentView />} />
          <Route path="master/departments" element={<DepartmentView />} />
          <Route path="master/gst-creation" element={<GSTCreationView />} />
          <Route path="master/gst" element={<GSTCreationView />} />

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
          <Route path="company-designations" element={<Navigate to="/master/company-designations" replace />} />
          <Route path="company-designation" element={<Navigate to="/master/company-designations" replace />} />
          <Route path="company-roles" element={<Navigate to="/master/company-roles" replace />} />
          <Route path="company-role" element={<Navigate to="/master/company-roles" replace />} />
          <Route path="projects" element={<Navigate to="/master/projects" replace />} />
          <Route path="manage-page" element={<Navigate to="/master/manage-page" replace />} />
          <Route path="department" element={<Navigate to="/master/department" replace />} />
          <Route path="departments" element={<Navigate to="/master/department" replace />} />
          <Route path="gst-creation" element={<Navigate to="/master/gst-creation" replace />} />
          <Route path="gst" element={<Navigate to="/master/gst-creation" replace />} />

          {/* HRM Special Pages */}
          <Route path="hrm/employees" element={<EmployeesView />} />
          <Route path="hrm/departments" element={<DepartmentView />} />
          <Route path="hrm/designations" element={<DesignationView />} />
          <Route path="hrm/attendance" element={<AttendanceView />} />
          <Route path="hrm/leave" element={<LeaveView />} />

          {/* CRM Special Pages */}
          <Route path="crm/pipeline" element={<PipelineView />} />

          {/* POS Special Page */}
          <Route path="pos/pos" element={<POSView />} />

          {/* Support Special Page */}
          <Route path="support/tickets" element={<TicketsView />} />

          {/* Work Management Module Pages */}
          <Route path="work-management" element={<Navigate to="/work-management/daily-update" replace />} />
          <Route path="work-management/daily-update" element={<DailyWorkUpdateView />} />
          <Route path="work-management/work-history" element={<WorkHistoryView />} />
          <Route path="work-management/assigned-tasks" element={<AssignedTasksView />} />
          <Route path="work-management/task-assignment" element={<TaskAssignmentView />} />
          <Route path="work-management/project-tasks" element={<ProjectTaskTrackerView />} />
          <Route path="work-management/team-updates" element={<TeamUpdatesView />} />
          <Route path="work-management/review" element={<WorkUpdateReviewView />} />
          <Route path="work-management/dashboard" element={<OrganizationDashboardView />} />
          <Route path="work-management/analytics" element={<WorkReportsAnalyticsView />} />

          {/* Procurement / Purchase Requisition (PR) Module */}
          {/* <Route path="procurement/raise-pr" element={<RaisePRView />} />
          <Route path="procurement/view-prs" element={<ViewRaisePRsView />} />
          <Route path="procurement/view-pr" element={<ViewRaisePRsView />} />
          <Route path="procurement/pending-approvals" element={<MyPendingApprovalsView />} />
          <Route path="procurement/my-pending-approvals" element={<MyPendingApprovalsView />} />
          <Route path="procurement" element={<Navigate to="/procurement/view-prs" replace />} /> */}

          {/* Alternate / Alias PR Routes */}
          {/* <Route path="pr/raise-pr" element={<RaisePRView />} />
          <Route path="pr/view-prs" element={<ViewRaisePRsView />} />
          <Route path="pr/view-pr" element={<ViewRaisePRsView />} />
          <Route path="pr/pending-approvals" element={<MyPendingApprovalsView />} />
          <Route path="pr/my-pending-approvals" element={<MyPendingApprovalsView />} />
          <Route path="pr" element={<Navigate to="/pr/view-prs" replace />} /> */}

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