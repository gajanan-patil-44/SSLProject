// src/pages/WorkManagement/workManagementData.js

const STORAGE_KEYS = {
  REPORTS: 'vishvin_wm_reports',
  TASKS: 'vishvin_wm_tasks',
  TEAM: 'vishvin_wm_team',
  DEPARTMENTS: 'vishvin_wm_departments'
};

export const INITIAL_DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'QA / Testing',
  'Operations',
  'Sales & Marketing',
  'HR',
  'Finance'
];

export const INITIAL_PROJECTS = [
  { id: 1, name: 'ERP Cloud Suite', code: 'PRJ-ERP-01' },
  { id: 2, name: 'CRM Portal 2.0', code: 'PRJ-CRM-02' },
  { id: 3, name: 'Billing & Payments Engine', code: 'PRJ-BIL-03' },
  { id: 4, name: 'Mobile Warehouse App', code: 'PRJ-WMS-04' },
  { id: 5, name: 'Supply Chain Operations', code: 'PRJ-SCM-05' },
  { id: 6, name: 'Analytics & Reporting Hub', code: 'PRJ-BI-06' }
];

export const WORK_CATEGORIES = [
  'Development',
  'Bug Fixing',
  'Code Review',
  'Testing & QA',
  'Architecture & Design',
  'Client / Team Meeting',
  'Documentation',
  'Support & Maintenance',
  'Research & Spikes',
  'Training & Learning'
];

export const INITIAL_TEAM_MEMBERS = [
  { id: 101, employeeId: 'EMP-0101', name: 'Nithin T B', role: 'Full Stack Engineer', department: 'Engineering', avatar: '', email: 'nithin@vishvin.co.in' },
  { id: 102, employeeId: 'EMP-0102', name: 'Andrew Miller', role: 'Lead Architect', department: 'Engineering', avatar: '', email: 'andrew@vishvin.co.in' },
  { id: 103, employeeId: 'EMP-0103', name: 'Sneha Rao', role: 'Senior Product Manager', department: 'Product', avatar: '', email: 'sneha@vishvin.co.in' },
  { id: 104, employeeId: 'EMP-0104', name: 'Vikram Joshi', role: 'UX/UI Designer', department: 'Design', avatar: '', email: 'vikram@vishvin.co.in' },
  { id: 105, employeeId: 'EMP-0105', name: 'Pooja Sharma', role: 'QA Automation Lead', department: 'QA / Testing', avatar: '', email: 'pooja@vishvin.co.in' },
  { id: 106, employeeId: 'EMP-0106', name: 'Karthik Raja', role: 'DevOps & Cloud Engineer', department: 'Operations', avatar: '', email: 'karthik@vishvin.co.in' },
  { id: 107, employeeId: 'EMP-0107', name: 'Ananya Sen', role: 'Marketing Specialist', department: 'Sales & Marketing', avatar: '', email: 'ananya@vishvin.co.in' },
  { id: 108, employeeId: 'EMP-0108', name: 'Rajesh Verma', role: 'HR Business Partner', department: 'HR', avatar: '', email: 'rajesh@vishvin.co.in' }
];

export const INITIAL_TASKS = [
  {
    id: 'TSK-501',
    title: 'Implement Daily Work Update dynamic forms & state caching',
    description: 'Design and build the employee workspace for multiple entry logging and daily bundle submit.',
    projectId: 1,
    projectName: 'ERP Cloud Suite',
    assignedToId: 101,
    assignedToName: 'Nithin T B',
    assignedById: 102,
    assignedByName: 'Andrew Miller',
    priority: 'High',
    taskType: 'Feature',
    startDate: '2026-11-01',
    dueDate: '2026-11-06',
    progress: 85,
    status: 'In Progress',
    remarks: 'Form validation and side panel completed. Hooking into storage.'
  },
  {
    id: 'TSK-502',
    title: 'Audit and standardize responsive layout across Work Management modules',
    description: 'Ensure mobile and desktop responsive views with glassmorphic cards and pinned non-scrollable footers.',
    projectId: 1,
    projectName: 'ERP Cloud Suite',
    assignedToId: 101,
    assignedToName: 'Nithin T B',
    assignedById: 102,
    assignedByName: 'Andrew Miller',
    priority: 'Medium',
    taskType: 'Architecture',
    startDate: '2026-11-02',
    dueDate: '2026-11-07',
    progress: 70,
    status: 'In Progress',
    remarks: 'Layout tested on 1080p and 768p viewports.'
  },
  {
    id: 'TSK-503',
    title: 'Design high-converting landing components & analytics widgets',
    description: 'Create modern charts for department-wise compliance and activity breakdown.',
    projectId: 6,
    projectName: 'Analytics & Reporting Hub',
    assignedToId: 104,
    assignedToName: 'Vikram Joshi',
    assignedById: 103,
    assignedByName: 'Sneha Rao',
    priority: 'High',
    taskType: 'Design',
    startDate: '2026-10-28',
    dueDate: '2026-11-04',
    progress: 100,
    status: 'Completed',
    remarks: 'Figma tokens exported and applied.'
  },
  {
    id: 'TSK-504',
    title: 'Automate E2E testing for work review workflow & clarification triggers',
    description: 'Write Cypress/Playwright suites covering manager review, clarification request, and status updates.',
    projectId: 1,
    projectName: 'ERP Cloud Suite',
    assignedToId: 105,
    assignedToName: 'Pooja Sharma',
    assignedById: 102,
    assignedByName: 'Andrew Miller',
    priority: 'Medium',
    taskType: 'Testing & QA',
    startDate: '2026-11-03',
    dueDate: '2026-11-08',
    progress: 40,
    status: 'In Progress',
    remarks: 'Review flow spec written.'
  },
  {
    id: 'TSK-505',
    title: 'Resolve database connection pool timeouts under high concurrent load',
    description: 'Investigate Postgres connection spike during 6 PM daily reporting peak hour.',
    projectId: 3,
    projectName: 'Billing & Payments Engine',
    assignedToId: 106,
    assignedToName: 'Karthik Raja',
    assignedById: 102,
    assignedByName: 'Andrew Miller',
    priority: 'High',
    taskType: 'Bug Fix',
    startDate: '2026-10-25',
    dueDate: '2026-10-31',
    progress: 25,
    status: 'Blocked',
    remarks: 'Waiting on RDS replication log access from DevOps security team.'
  },
  {
    id: 'TSK-506',
    title: 'Create Product PRD for Q1 2027 enterprise work orchestration',
    description: 'Draft cross-department collaboration features, SLA rules, and executive notifications.',
    projectId: 2,
    projectName: 'CRM Portal 2.0',
    assignedToId: 103,
    assignedToName: 'Sneha Rao',
    assignedById: 102,
    assignedByName: 'Andrew Miller',
    priority: 'Medium',
    taskType: 'Documentation',
    startDate: '2026-11-01',
    dueDate: '2026-11-12',
    progress: 10,
    status: 'Not Started',
    remarks: 'User interview synthesis in progress.'
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'WR-2026-101',
    reportId: 'WR-2026-101',
    employeeId: 'EMP-0101',
    employeeName: 'Nithin T B',
    department: 'Engineering',
    workDate: '2026-11-04',
    totalHours: 8.5,
    project: 'ERP Cloud Suite',
    submittedOn: '2026-11-04 18:25',
    reviewStatus: 'Reviewed',
    reviewedBy: 'Andrew Miller',
    reviewedOn: '2026-11-04 19:10',
    reviewComments: 'Outstanding progress on the UI theme overhaul and component stabilization. Great attention to detail.',
    overallSummary: 'Completed full theme modernization, refactored project dropdown patch calls, and initiated work management specifications.',
    entries: [
      {
        id: 'ENT-1',
        category: 'Development',
        department: 'Engineering',
        project: 'ERP Cloud Suite',
        hours: 4.5,
        status: 'Completed',
        description: 'Overhauled global UI color system, modernized Sidebar, Topbar and DataTable styling across light & dark modes.',
        challenges: 'Ensured 100% backward compatibility with Zod validation schemas.',
        remarks: 'Zero frontend build regressions.'
      },
      {
        id: 'ENT-2',
        category: 'Code Review',
        department: 'Engineering',
        project: 'ERP Cloud Suite',
        hours: 2.0,
        status: 'Completed',
        description: 'Reviewed API payload structures for Project Master patch requests and company product associations.',
        challenges: '',
        remarks: 'Approved after verification.'
      },
      {
        id: 'ENT-3',
        category: 'Bug Fixing',
        department: 'Engineering',
        project: 'ERP Cloud Suite',
        hours: 2.0,
        status: 'Completed',
        description: 'Fixed footer positioning from scrollable viewport to fixed layout column with responsive blur glass.',
        challenges: '',
        remarks: 'Tested on Safari & Chrome.'
      }
    ]
  },
  {
    id: 'WR-2026-102',
    reportId: 'WR-2026-102',
    employeeId: 'EMP-0103',
    employeeName: 'Sneha Rao',
    department: 'Product',
    workDate: '2026-11-04',
    totalHours: 7.5,
    project: 'CRM Portal 2.0',
    submittedOn: '2026-11-04 17:45',
    reviewStatus: 'Reviewed',
    reviewedBy: 'Andrew Miller',
    reviewedOn: '2026-11-04 18:30',
    reviewComments: 'Well organized user stories. Let us review the sprint allocation tomorrow morning.',
    overallSummary: 'Finalized Sprint 42 scope and conducted backlog refinement with frontend and QA leads.',
    entries: [
      {
        id: 'ENT-4',
        category: 'Architecture & Design',
        department: 'Product',
        project: 'CRM Portal 2.0',
        hours: 4.5,
        status: 'Completed',
        description: 'Refined user stories and acceptance criteria for automated deal escalation.',
        challenges: 'Complex dependencies on billing API webhooks.',
        remarks: 'Documented in Confluence.'
      },
      {
        id: 'ENT-5',
        category: 'Client / Team Meeting',
        department: 'Product',
        project: 'CRM Portal 2.0',
        hours: 3.0,
        status: 'Completed',
        description: 'Sprint planning and sprint backlog alignment meeting with team leads.',
        challenges: '',
        remarks: 'Story points committed.'
      }
    ]
  },
  {
    id: 'WR-2026-103',
    reportId: 'WR-2026-103',
    employeeId: 'EMP-0105',
    employeeName: 'Pooja Sharma',
    department: 'QA / Testing',
    workDate: '2026-11-04',
    totalHours: 8.0,
    project: 'ERP Cloud Suite',
    submittedOn: '2026-11-04 18:40',
    reviewStatus: 'Pending Review',
    reviewedBy: '',
    reviewedOn: '',
    reviewComments: '',
    overallSummary: 'Executed regression test suites on release candidate v2.4; verified 24 test cases across Material Master.',
    entries: [
      {
        id: 'ENT-6',
        category: 'Testing & QA',
        department: 'QA / Testing',
        project: 'ERP Cloud Suite',
        hours: 5.0,
        status: 'Completed',
        description: 'Full regression test of Material Category, Subcategory, and Item creation screens.',
        challenges: '',
        remarks: 'All 24 test cases passed.'
      },
      {
        id: 'ENT-7',
        category: 'Bug Fixing',
        department: 'QA / Testing',
        project: 'ERP Cloud Suite',
        hours: 3.0,
        status: 'In Progress',
        description: 'Investigating intermittent token expiration edge case on file export.',
        challenges: 'Difficult to reproduce locally without production network latency.',
        remarks: 'Logged bug ticket #BUG-902.'
      }
    ]
  },
  {
    id: 'WR-2026-104',
    reportId: 'WR-2026-104',
    employeeId: 'EMP-0106',
    employeeName: 'Karthik Raja',
    department: 'Operations',
    workDate: '2026-11-04',
    totalHours: 8.0,
    project: 'Billing & Payments Engine',
    submittedOn: '2026-11-04 19:15',
    reviewStatus: 'Clarification Requested',
    reviewedBy: 'Andrew Miller',
    reviewedOn: '2026-11-04 20:00',
    reviewComments: 'Please specify the exact RDS parameter group modifications made and whether maintenance window approval is required.',
    overallSummary: 'Configured automated database read replica failover and diagnosed connection pool bottlenecks.',
    entries: [
      {
        id: 'ENT-8',
        category: 'Support & Maintenance',
        department: 'Operations',
        project: 'Billing & Payments Engine',
        hours: 4.0,
        status: 'Completed',
        description: 'Configured automated health-check alerts in AWS CloudWatch for RDS cluster.',
        challenges: '',
        remarks: 'Alert threshold set to 80% CPU.'
      },
      {
        id: 'ENT-9',
        category: 'Support & Maintenance',
        department: 'Operations',
        project: 'Billing & Payments Engine',
        hours: 4.0,
        status: 'Blocked',
        description: 'Attempting to patch RDS pgBouncer pool limits; blocked on permission grant.',
        challenges: 'DevOps security lead has not granted production parameter write access.',
        remarks: 'High urgency.'
      }
    ]
  }
];

// Helper to safely read from localStorage with fallback
export function getStoredData(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Helper to safely write to localStorage
export function setStoredData(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
  }
}

// Accessors for Work Reports
export function getAllReports() {
  return getStoredData(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
}

export function saveReport(newReport) {
  const reports = getAllReports();
  const updated = [newReport, ...reports];
  setStoredData(STORAGE_KEYS.REPORTS, updated);
  return updated;
}

export function updateReportReview(reportId, status, comments, reviewerName = 'Andrew Miller') {
  const reports = getAllReports();
  const updated = reports.map(r => {
    if (r.id === reportId || r.reportId === reportId) {
      return {
        ...r,
        reviewStatus: status,
        reviewComments: comments,
        reviewedBy: reviewerName,
        reviewedOn: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
    }
    return r;
  });
  setStoredData(STORAGE_KEYS.REPORTS, updated);
  return updated;
}

// Accessors for Tasks
export function getAllTasks() {
  return getStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS);
}

export function saveTask(newTask) {
  const tasks = getAllTasks();
  const updated = [newTask, ...tasks];
  setStoredData(STORAGE_KEYS.TASKS, updated);
  return updated;
}

export function updateTaskProgress(taskId, { progress, status, remarks }) {
  const tasks = getAllTasks();
  const updated = tasks.map(t => {
    if (t.id === taskId) {
      return {
        ...t,
        progress: Number(progress),
        status: status || t.status,
        remarks: remarks !== undefined ? remarks : t.remarks
      };
    }
    return t;
  });
  setStoredData(STORAGE_KEYS.TASKS, updated);
  return updated;
}

// Accessors for Team
export function getAllTeamMembers() {
  return getStoredData(STORAGE_KEYS.TEAM, INITIAL_TEAM_MEMBERS);
}

