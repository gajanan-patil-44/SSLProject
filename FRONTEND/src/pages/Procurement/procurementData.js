// src/pages/Procurement/procurementData.js
import itemCreationService from '../../services/itemCreationService';
import { userService } from '../../services/userService';

const STORAGE_KEY = 'vtpl_procurement_prs';

// Get current Indian Financial Year string (e.g., 2026-04 to 2027-03 -> "26-27")
export const getCurrentFinancialYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, 3 = April
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const startShort = String(startYear).slice(-2);
  const endShort = String(endYear).slice(-2);
  return `${startShort}-${endShort}`;
};

// Default fallback items if Item Master API is not reachable
export const FALLBACK_ITEMS = [
  { id: 1, name: '11KV HT Power Cable 3C x 300 sq.mm XLPE', category: 'Electrical Cables', uom: 'Meters' },
  { id: 2, name: 'Distribution Transformer 250 KVA 11/0.433 KV', category: 'Transformers', uom: 'Units' },
  { id: 3, name: 'Digital Earth Resistance Tester Model DET-4', category: 'Testing Equipment', uom: 'Nos' },
  { id: 4, name: 'Safety Helmet Industrial Standard ISI Marked', category: 'Safety Gear', uom: 'Nos' },
  { id: 5, name: 'SF6 Circuit Breaker 33KV Outdoor Type', category: 'Switchgear', uom: 'Units' },
  { id: 6, name: 'GI Earthing Strip 50x6 mm Hot Dip Galvanized', category: 'Hardware & Earthing', uom: 'Kg' },
  { id: 7, name: 'Polymer Pin Insulator 11KV 5KN', category: 'Insulators', uom: 'Nos' },
  { id: 8, name: 'ACSR Conductor - Dog Type 100 sq.mm', category: 'Conductors', uom: 'Meters' },
  { id: 9, name: 'Digital Multimeter True RMS 6000 Counts', category: 'Instruments', uom: 'Nos' },
  { id: 10, name: 'High Mast Light 16M Octagonal Pole', category: 'Lighting', uom: 'Sets' }
];

// Fallback approvers / managers
export const DEFAULT_APPROVERS = [
  { id: 1, name: 'Rajesh Sharma', designation: 'General Manager - Technical', department: 'Technical Operations' },
  { id: 2, name: 'Ananya Desai', designation: 'Head of Procurement', department: 'Procurement' },
  { id: 3, name: 'Vikram Malhotra', designation: 'Chief Financial Officer', department: 'Accounts & Finance' },
  { id: 4, name: 'Praveen MD', designation: 'Managing Director', department: 'Management' },
  { id: 5, name: 'Suresh Kumar', designation: 'Project Director - BESCOM', department: 'Projects' }
];

// Initial seed PR data demonstrating all requirement states
const INITIAL_PRS = [
  {
    id: 'pr-101',
    requirementNo: 'VTPL/ON/26-27/Accounts/001',
    requestDate: '2026-11-02',
    requestedBy: 'Praveen Md',
    designation: 'Senior Project Manager',
    department: 'Accounts',
    reportingTo: 'Rajesh Sharma (General Manager)',
    project: 'BESCOM',
    priority: 'High',
    requiredDate: '2026-11-15',
    purpose: 'Urgent replacement of high tension feeder cables and distribution hardware damaged during recent storm near Bangalore North substation.',
    items: [
      { slNo: 1, itemName: '11KV HT Power Cable 3C x 300 sq.mm XLPE', qty: 250, uom: 'Meters' },
      { slNo: 2, itemName: 'GI Earthing Strip 50x6 mm Hot Dip Galvanized', qty: 120, uom: 'Kg' },
      { slNo: 3, itemName: 'Polymer Pin Insulator 11KV 5KN', qty: 40, uom: 'Nos' }
    ],
    quotationsCount: 2,
    quotations: [
      { quoteId: 'Q-901', vendor: 'Havells India Ltd', amount: '₹ 4,85,000', status: 'Received' },
      { quoteId: 'Q-902', vendor: 'Polycab Cables & Wires', amount: '₹ 4,68,500', status: 'Under Evaluation' }
    ],
    attachments: [
      { name: 'Site_Damage_Inspection_Report.pdf', size: '2.4 MB', type: 'application/pdf', uploadedAt: '2026-11-02 10:15' },
      { name: 'Substation_Single_Line_Diagram.dwg', size: '1.1 MB', type: 'application/octet-stream', uploadedAt: '2026-11-02 10:16' }
    ],
    status: 'Pending Approval',
    createdAt: '2026-11-02T10:18:00',
    approvalHistory: [
      {
        id: 'hist-1',
        actor: 'Praveen Md',
        designation: 'Senior Project Manager',
        action: 'Created',
        comments: 'Submitted initial Purchase Requisition for storm restoration work.',
        timestamp: '2026-11-02 10:18 AM'
      }
    ]
  },
  {
    id: 'pr-102',
    requirementNo: 'VTPL/ON/26-27/Accounts/002',
    requestDate: '2026-11-03',
    requestedBy: 'Sneha Patel',
    designation: 'Substation Engineer',
    department: 'Accounts',
    reportingTo: 'Praveen Md',
    project: 'KPTCL',
    priority: 'Medium',
    requiredDate: '2026-11-20',
    purpose: 'Procurement of high accuracy digital earth resistance tester and multimeters for annual maintenance audit scheduled across Hubli zone.',
    items: [
      { slNo: 1, itemName: 'Digital Earth Resistance Tester Model DET-4', qty: 4, uom: 'Nos' },
      { slNo: 2, itemName: 'Digital Multimeter True RMS 6000 Counts', qty: 8, uom: 'Nos' }
    ],
    quotationsCount: 1,
    quotations: [
      { quoteId: 'Q-885', vendor: 'Fluke Calibration India', amount: '₹ 2,12,000', status: 'Received' }
    ],
    attachments: [
      { name: 'Annual_Audit_Tool_Checklist.xlsx', size: '480 KB', type: 'application/vnd.ms-excel', uploadedAt: '2026-11-03 14:20' }
    ],
    status: 'Forwarded',
    createdAt: '2026-11-03T14:30:00',
    approvalHistory: [
      {
        id: 'hist-2',
        actor: 'Sneha Patel',
        designation: 'Substation Engineer',
        action: 'Created',
        comments: 'Purchase requisition submitted for audit equipment.',
        timestamp: '2026-11-03 02:30 PM'
      },
      {
        id: 'hist-3',
        actor: 'Praveen Md',
        designation: 'Senior Project Manager',
        action: 'Forwarded',
        comments: 'Forwarding for technical specification review and budget sanction to GM.',
        timestamp: '2026-11-03 04:45 PM'
      }
    ]
  },
  {
    id: 'pr-103',
    requirementNo: 'VTPL/ON/26-27/Accounts/003',
    requestDate: '2026-10-28',
    requestedBy: 'Praveen Md',
    designation: 'Senior Project Manager',
    department: 'Accounts',
    reportingTo: 'Rajesh Sharma (General Manager)',
    project: 'RNA',
    priority: 'High',
    requiredDate: '2026-11-10',
    purpose: 'Immediate requirement of outdoor SF6 circuit breaker unit for replacing faulty 33KV interrupter bay.',
    items: [
      { slNo: 1, itemName: 'SF6 Circuit Breaker 33KV Outdoor Type', qty: 2, uom: 'Units' }
    ],
    quotationsCount: 3,
    quotations: [
      { quoteId: 'Q-871', vendor: 'ABB India Ltd', amount: '₹ 18,50,000', status: 'Shortlisted' },
      { quoteId: 'Q-872', vendor: 'Schneider Electric', amount: '₹ 19,20,000', status: 'Rejected' },
      { quoteId: 'Q-873', vendor: 'Siemens Energy Ltd', amount: '₹ 18,95,000', status: 'Alternative' }
    ],
    attachments: [
      { name: 'Bay_Failure_Diagnostic_Report.pdf', size: '3.8 MB', type: 'application/pdf', uploadedAt: '2026-10-28 11:00' }
    ],
    status: 'Approved',
    createdAt: '2026-10-28T11:05:00',
    approvalHistory: [
      {
        id: 'hist-4',
        actor: 'Praveen Md',
        designation: 'Senior Project Manager',
        action: 'Created',
        comments: 'Requisition submitted with emergency priority.',
        timestamp: '2026-10-28 11:05 AM'
      },
      {
        id: 'hist-5',
        actor: 'Rajesh Sharma',
        designation: 'General Manager - Technical',
        action: 'Approved',
        comments: 'Approved as per emergency critical equipment sanction matrix. Proceed with PO.',
        timestamp: '2026-10-29 09:30 AM'
      }
    ]
  },
  {
    id: 'pr-104',
    requirementNo: 'VTPL/ON/26-27/Accounts/004',
    requestDate: '2026-10-25',
    requestedBy: 'Ramesh Naidu',
    designation: 'Safety Officer',
    department: 'Accounts',
    reportingTo: 'Praveen Md',
    project: 'MESCOM',
    priority: 'Low',
    requiredDate: '2026-11-25',
    purpose: 'Replenishment of safety gear and industrial helmets for line staff before upcoming transmission line stringing project.',
    items: [
      { slNo: 1, itemName: 'Safety Helmet Industrial Standard ISI Marked', qty: 150, uom: 'Nos' }
    ],
    quotationsCount: 1,
    quotations: [],
    attachments: [],
    status: 'PO Generated',
    createdAt: '2026-10-25T09:15:00',
    approvalHistory: [
      {
        id: 'hist-6',
        actor: 'Ramesh Naidu',
        designation: 'Safety Officer',
        action: 'Created',
        comments: 'Requisition submitted for annual safety gear refresh.',
        timestamp: '2026-10-25 09:15 AM'
      },
      {
        id: 'hist-7',
        actor: 'Praveen Md',
        designation: 'Senior Project Manager',
        action: 'Approved',
        comments: 'Approved. Mandatory compliance requirement.',
        timestamp: '2026-10-25 11:20 AM'
      }
    ]
  },
  {
    id: 'pr-105',
    requirementNo: 'VTPL/ON/26-27/Accounts/005',
    requestDate: '2026-11-01',
    requestedBy: 'Praveen Md',
    designation: 'Senior Project Manager',
    department: 'Accounts',
    reportingTo: 'Rajesh Sharma',
    project: 'BESCOM',
    priority: 'Medium',
    requiredDate: '2026-11-18',
    purpose: 'Draft PR for auxiliary distribution transformers for secondary power lines.',
    items: [
      { slNo: 1, itemName: 'Distribution Transformer 250 KVA 11/0.433 KV', qty: 2, uom: 'Units' }
    ],
    quotationsCount: 0,
    quotations: [],
    attachments: [],
    status: 'Draft',
    createdAt: '2026-11-01T16:45:00',
    approvalHistory: [
      {
        id: 'hist-8',
        actor: 'Praveen Md',
        designation: 'Senior Project Manager',
        action: 'Created',
        comments: 'Draft saved. Awaiting technical specifications confirmation.',
        timestamp: '2026-11-01 04:45 PM'
      }
    ]
  }
];

// Helper to safely load PRs from storage
export const getStoredPRs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored PRs:', e);
  }
  // Initialize storage with seeds
  saveStoredPRs(INITIAL_PRS);
  return INITIAL_PRS;
};

// Helper to save PRs to storage and dispatch reactivity event
export const saveStoredPRs = (prs) => {
  try {
    const serialized = JSON.stringify(prs);
    localStorage.setItem(STORAGE_KEY, serialized);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vtpl_pr_updated', { detail: { count: prs.length } }));
    }
  } catch (e) {
    console.error('Error saving PRs to storage:', e);
  }
};

/**
 * Generate next unique Requirement Number in format:
 * VTPL/ON/YY-YY/Accounts/001
 */
export const generateNextRequirementNo = (department = 'Accounts') => {
  const prs = getStoredPRs();
  const fy = getCurrentFinancialYear();
  const deptSanitized = department ? department.replace(/[^a-zA-Z0-9]/g, '') : 'Accounts';
  const prefix = `VTPL/ON/${fy}/${deptSanitized || 'Accounts'}/`;

  let maxSeq = 0;
  prs.forEach((pr) => {
    if (pr.requirementNo && pr.requirementNo.startsWith(prefix)) {
      const parts = pr.requirementNo.split('/');
      const seqStr = parts[parts.length - 1];
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    } else if (pr.requirementNo) {
      // General match on last 3 digits
      const match = pr.requirementNo.match(/\/(\d{3,})$/);
      if (match && match[1]) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}${nextSeq}`;
};

/**
 * Fetch Item Master items dynamically, falling back gracefully
 */
export const fetchActiveItemMaster = async () => {
  try {
    const items = await itemCreationService.getItems({ FlagId: 1 });
    if (Array.isArray(items) && items.length > 0) {
      return items.map((it) => ({
        id: it.id || it.MaterialId,
        name: it.name || it.MaterialName || 'Item',
        category: it.category || it.MaterialCategoryTypeName || 'General',
        uom: it.uom || it.UOMName || 'Nos',
        code: it.code || it.MaterialCode || ''
      }));
    }
  } catch (err) {
    console.warn('Using fallback item master records:', err);
  }
  return FALLBACK_ITEMS;
};

/**
 * Fetch Approvers dynamically from user service or return default approvers
 */
export const fetchApproversList = async () => {
  try {
    const res = await userService.getAllUserDetails(1);
    const users = res?.data || res?.users || (Array.isArray(res) ? res : []);
    if (Array.isArray(users) && users.length > 0) {
      return users.map((u) => {
        const name = typeof u.name === 'string' ? u.name : (u.name?.first ? `${u.name.first} ${u.name.last || ''}`.trim() : u.loginName || 'User');
        const designation = u.designation?.name || u.RoleName || u.role || 'Manager';
        const department = u.department?.name || u.department || 'Management';
        return {
          id: u.UserId || u.id,
          name,
          designation,
          department
        };
      });
    }
  } catch (e) {
    console.warn('Using default approvers:', e);
  }
  return DEFAULT_APPROVERS;
};

// PR Service API for screens
export const procurementPRService = {
  getAllPRs: () => getStoredPRs(),

  getPRById: (id) => {
    const prs = getStoredPRs();
    return prs.find((p) => p.id === id || p.requirementNo === id) || null;
  },

  getPendingApprovals: () => {
    const prs = getStoredPRs();
    return prs.filter((p) => p.status === 'Pending Approval' || p.status === 'Forwarded');
  },

  createOrUpdatePR: (prData, isSubmit = false) => {
    const prs = [...getStoredPRs()];
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const status = isSubmit ? 'Pending Approval' : 'Draft';
    const actionName = isSubmit ? 'Created' : 'Draft Saved';
    const comments = isSubmit
      ? 'Purchase Requisition submitted for approval.'
      : 'Purchase Requisition saved as draft.';

    let targetPR;
    const existingIndex = prs.findIndex((p) => p.id === prData.id || (prData.requirementNo && p.requirementNo === prData.requirementNo));

    if (existingIndex >= 0) {
      targetPR = {
        ...prs[existingIndex],
        ...prData,
        status,
        updatedAt: now.toISOString()
      };
      targetPR.approvalHistory = [
        ...(targetPR.approvalHistory || []),
        {
          id: `hist-${Date.now()}`,
          actor: prData.requestedBy || 'Current User',
          designation: prData.designation || 'Staff',
          action: actionName,
          comments,
          timestamp
        }
      ];
      prs[existingIndex] = targetPR;
    } else {
      targetPR = {
        id: `pr-${Date.now()}`,
        quotationsCount: 0,
        quotations: [],
        createdAt: now.toISOString(),
        ...prData,
        status,
        approvalHistory: [
          {
            id: `hist-${Date.now()}`,
            actor: prData.requestedBy || 'Current User',
            designation: prData.designation || 'Staff',
            action: actionName,
            comments,
            timestamp
          }
        ]
      };
      prs.unshift(targetPR);
    }

    saveStoredPRs(prs);
    return targetPR;
  },

  approvePR: (prId, approverName, approverDesignation, comments = 'Approved requisition request.') => {
    const prs = [...getStoredPRs()];
    const index = prs.findIndex((p) => p.id === prId);
    if (index === -1) throw new Error('PR not found');

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    prs[index] = {
      ...prs[index],
      status: 'Approved',
      approvedBy: approverName,
      approvedAt: now.toISOString(),
      approvalHistory: [
        ...(prs[index].approvalHistory || []),
        {
          id: `hist-${Date.now()}`,
          actor: approverName,
          designation: approverDesignation || 'Approver',
          action: 'Approved',
          comments: comments || 'Approved requisition.',
          timestamp
        }
      ]
    };

    saveStoredPRs(prs);
    return prs[index];
  },

  rejectPR: (prId, approverName, approverDesignation, rejectionReason) => {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Rejection reason is mandatory');
    }

    const prs = [...getStoredPRs()];
    const index = prs.findIndex((p) => p.id === prId);
    if (index === -1) throw new Error('PR not found');

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    prs[index] = {
      ...prs[index],
      status: 'Rejected',
      rejectedBy: approverName,
      rejectedAt: now.toISOString(),
      rejectionReason,
      approvalHistory: [
        ...(prs[index].approvalHistory || []),
        {
          id: `hist-${Date.now()}`,
          actor: approverName,
          designation: approverDesignation || 'Approver',
          action: 'Rejected',
          comments: rejectionReason,
          timestamp
        }
      ]
    };

    saveStoredPRs(prs);
    return prs[index];
  },

  forwardPR: (prId, forwarderName, forwarderDesignation, forwardToName, comments = 'Forwarding for your approval.') => {
    if (!forwardToName || !forwardToName.trim()) {
      throw new Error('Please select an approver to forward to');
    }

    const prs = [...getStoredPRs()];
    const index = prs.findIndex((p) => p.id === prId);
    if (index === -1) throw new Error('PR not found');

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    prs[index] = {
      ...prs[index],
      status: 'Forwarded',
      forwardedBy: forwarderName,
      forwardedTo: forwardToName,
      forwardedAt: now.toISOString(),
      approvalHistory: [
        ...(prs[index].approvalHistory || []),
        {
          id: `hist-${Date.now()}`,
          actor: forwarderName,
          designation: forwarderDesignation || 'Manager',
          action: 'Forwarded',
          comments: `${comments} (Forwarded to: ${forwardToName})`,
          timestamp
        }
      ]
    };

    saveStoredPRs(prs);
    return prs[index];
  }
};
