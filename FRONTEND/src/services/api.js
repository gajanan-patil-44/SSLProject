// src/services/api.js
import * as mock from '../data/mockData';

// Helper to initialize and retrieve from localStorage
const getDB = (key, initialData) => {
  const data = localStorage.getItem(`erp_db_${key}`);
  if (!data) {
    localStorage.setItem(`erp_db_${key}`, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialData;
  }
};

const saveDB = (key, data) => {
  localStorage.setItem(`erp_db_${key}`, JSON.stringify(data));
};

// Initialize database object in memory
const db = {
  employees: getDB('employees', mock.mockEmployees),
  products: getDB('products', mock.mockProducts),
  departments: getDB('departments', mock.mockDepartments),
  designations: getDB('designations', mock.mockDesignations),
  categories: getDB('categories', mock.mockCategories),
  brands: getDB('brands', mock.mockBrands),
  units: getDB('units', mock.mockUnits),
  suppliers: getDB('suppliers', mock.mockSuppliers),
  customers: getDB('customers', mock.mockCustomers),
  salesOrders: getDB('salesOrders', mock.mockSalesOrders),
  invoices: getDB('invoices', mock.mockInvoices),
  purchases: getDB('purchases', mock.mockPurchases),
  expenses: getDB('expenses', mock.mockExpenses),
  expenseCategories: getDB('expenseCategories', mock.mockExpenseCategories),
  attendance: getDB('attendance', mock.mockAttendance),
  leaves: getDB('leaves', mock.mockLeaves),
  payroll: getDB('payroll', mock.mockPayroll),
  projects: getDB('projects', mock.mockProjects),
  tasks: getDB('tasks', mock.mockTasks),
  tickets: getDB('tickets', mock.mockTickets),
  assets: getDB('assets', mock.mockAssets),
  candidates: getDB('candidates', mock.mockCandidates),
  membershipPlans: getDB('membershipPlans', mock.mockMembershipPlans),
  transactions: getDB('transactions', mock.mockTransactions),
  contacts: getDB('contacts', mock.mockContacts)
};

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Employees CRUD
  getEmployees: async () => { await delay(50); return [...db.employees]; },
  getEmployeeById: async (id) => { await delay(30); return db.employees.find(e => e.id === id); },
  createEmployee: async (data) => {
    await delay(100);
    const newEmp = {
      id: `EMP-${String(db.employees.length + 1).padStart(3, '0')}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      ...data
    };
    db.employees.unshift(newEmp);
    saveDB('employees', db.employees);
    return newEmp;
  },
  updateEmployee: async (id, data) => {
    await delay(100);
    db.employees = db.employees.map(e => e.id === id ? { ...e, ...data } : e);
    saveDB('employees', db.employees);
    return db.employees.find(e => e.id === id);
  },
  deleteEmployee: async (id) => {
    await delay(80);
    db.employees = db.employees.filter(e => e.id !== id);
    saveDB('employees', db.employees);
    return true;
  },

  // Products CRUD
  getProducts: async () => { await delay(50); return [...db.products]; },
  getProductById: async (id) => { await delay(30); return db.products.find(p => p.id === id); },
  createProduct: async (data) => {
    await delay(100);
    const newProd = {
      id: `PROD-${String(db.products.length + 1).padStart(3, '0')}`,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80',
      status: 'In Stock',
      ...data
    };
    db.products.unshift(newProd);
    saveDB('products', db.products);
    return newProd;
  },
  updateProduct: async (id, data) => {
    await delay(100);
    db.products = db.products.map(p => p.id === id ? { ...p, ...data } : p);
    saveDB('products', db.products);
    return db.products.find(p => p.id === id);
  },
  deleteProduct: async (id) => {
    await delay(80);
    db.products = db.products.filter(p => p.id !== id);
    saveDB('products', db.products);
    return true;
  },

  // General lookups
  getDepartments: async () => { await delay(30); return [...db.departments]; },
  createDepartment: async (data) => {
    await delay(50);
    const newDept = {
      id: db.departments.length + 1,
      employeesCount: 0,
      ...data
    };
    db.departments.unshift(newDept);
    saveDB('departments', db.departments);
    return newDept;
  },
  getDesignations: async () => { await delay(30); return [...db.designations]; },
  createDesignation: async (data) => {
    await delay(50);
    const newDesig = {
      id: db.designations.length + 1,
      ...data
    };
    db.designations.unshift(newDesig);
    saveDB('designations', db.designations);
    return newDesig;
  },
  getCategories: async () => { await delay(30); return [...db.categories]; },
  getBrands: async () => { await delay(30); return [...db.brands]; },
  getUnits: async () => { await delay(30); return [...db.units]; },
  getSuppliers: async () => { await delay(40); return [...db.suppliers]; },
  getCustomers: async () => { await delay(40); return [...db.customers]; },
  createCustomer: async (data) => {
    await delay(80);
    const newCust = {
      id: `CUST-${String(db.customers.length + 1).padStart(3, '0')}`,
      status: 'Active',
      revenue: 0,
      ...data
    };
    db.customers.unshift(newCust);
    saveDB('customers', db.customers);
    return newCust;
  },
  getSalesOrders: async () => { await delay(40); return [...db.salesOrders]; },
  createSalesOrder: async (data) => {
    await delay(80);
    const newOrder = {
      id: `SO-${String(db.salesOrders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...data
    };
    db.salesOrders.unshift(newOrder);
    saveDB('salesOrders', db.salesOrders);
    return newOrder;
  },
  getInvoices: async () => { await delay(40); return [...db.invoices]; },
  createInvoice: async (data) => {
    await delay(80);
    const newInv = {
      id: `INV-2026-${String(db.invoices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Unpaid',
      ...data
    };
    db.invoices.unshift(newInv);
    saveDB('invoices', db.invoices);
    return newInv;
  },
  getPurchases: async () => { await delay(40); return [...db.purchases]; },
  getExpenses: async () => { await delay(40); return [...db.expenses]; },
  createExpense: async (data) => {
    await delay(80);
    const newExp = {
      id: `EXP-${String(db.expenses.length + 1).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...data
    };
    db.expenses.unshift(newExp);
    saveDB('expenses', db.expenses);
    return newExp;
  },
  getExpenseCategories: async () => { await delay(30); return [...db.expenseCategories]; },
  getAttendance: async () => { await delay(40); return [...db.attendance]; },
  saveAttendanceRecord: async (record) => {
    await delay(50);
    db.attendance = db.attendance.map(a => a.employeeId === record.employeeId && a.date === record.date ? { ...a, ...record } : a);
    saveDB('attendance', db.attendance);
    return true;
  },
  getLeaves: async () => { await delay(40); return [...db.leaves]; },
  createLeaveRequest: async (data) => {
    await delay(80);
    const newLeave = {
      id: `LV-${String(db.leaves.length + 101)}`,
      status: 'Pending',
      ...data
    };
    db.leaves.unshift(newLeave);
    saveDB('leaves', db.leaves);
    return newLeave;
  },
  approveLeave: async (id) => {
    await delay(50);
    db.leaves = db.leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l);
    saveDB('leaves', db.leaves);
    return true;
  },
  rejectLeave: async (id) => {
    await delay(50);
    db.leaves = db.leaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l);
    saveDB('leaves', db.leaves);
    return true;
  },
  getPayroll: async () => { await delay(40); return [...db.payroll]; },
  runPayroll: async (month) => {
    await delay(150);
    db.payroll = db.payroll.map(p => p.month === month ? { ...p, status: 'Paid' } : p);
    saveDB('payroll', db.payroll);
    return true;
  },
  getProjects: async () => { await delay(40); return [...db.projects]; },
  createProject: async (data) => {
    await delay(80);
    const newProj = {
      id: `PRJ-${String(db.projects.length + 1).padStart(2, '0')}`,
      progress: 0,
      status: 'In Progress',
      ...data
    };
    db.projects.unshift(newProj);
    saveDB('projects', db.projects);
    return newProj;
  },
  getTasks: async () => { await delay(30); return [...db.tasks]; },
  createTask: async (data) => {
    await delay(50);
    const newTask = {
      id: `TSK-${String(db.tasks.length + 101)}`,
      status: 'Todo',
      ...data
    };
    db.tasks.unshift(newTask);
    saveDB('tasks', db.tasks);
    return newTask;
  },
  updateTaskStatus: async (id, status) => {
    await delay(30);
    db.tasks = db.tasks.map(t => t.id === id ? { ...t, status } : t);
    saveDB('tasks', db.tasks);
    return true;
  },
  getTickets: async () => { await delay(40); return [...db.tickets]; },
  getTicketById: async (id) => { await delay(30); return db.tickets.find(t => t.id === id); },
  createTicket: async (data) => {
    await delay(80);
    const newTicket = {
      id: `TC-${String(db.tickets.length + 8291)}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Open',
      SLA: '24 Hours',
      ...data
    };
    db.tickets.unshift(newTicket);
    saveDB('tickets', db.tickets);
    return newTicket;
  },
  updateTicket: async (id, data) => {
    await delay(50);
    db.tickets = db.tickets.map(t => t.id === id ? { ...t, ...data } : t);
    saveDB('tickets', db.tickets);
    return db.tickets.find(t => t.id === id);
  },
  getAssets: async () => { await delay(40); return [...db.assets]; },
  createAsset: async (data) => {
    await delay(80);
    const newAsset = {
      id: `AST-${String(db.assets.length + 1).padStart(3, '0')}`,
      status: 'Active',
      ...data
    };
    db.assets.unshift(newAsset);
    saveDB('assets', db.assets);
    return newAsset;
  },
  getCandidates: async () => { await delay(30); return [...db.candidates]; },
  createCandidate: async (data) => {
    await delay(60);
    const newCand = {
      id: `CAN-${String(db.candidates.length + 1).padStart(2, '0')}`,
      stage: 'New',
      appliedDate: new Date().toISOString().split('T')[0],
      ...data
    };
    db.candidates.unshift(newCand);
    saveDB('candidates', db.candidates);
    return newCand;
  },
  getMembershipPlans: async () => { await delay(30); return [...db.membershipPlans]; },
  getTransactions: async () => { await delay(40); return [...db.transactions]; },
  getContacts: async () => { await delay(40); return [...db.contacts]; },
  createContact: async (data) => {
    await delay(60);
    const newContact = {
      id: `CON-${String(db.contacts.length + 1).padStart(2, '0')}`,
      stage: 'Lead',
      ...data
    };
    db.contacts.unshift(newContact);
    saveDB('contacts', db.contacts);
    return newContact;
  }
};
