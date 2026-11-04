// src/pages/Master/CompanyProductView.jsx
import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Building2,
  Package,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LayoutGrid,
  List,
  ShieldCheck,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button, PageHeader, Switch, IconButton } from '../../components/ui/index';
import { useERPStore } from '../../store/useERPStore';

// Helper to get session company
const getSessionCompany = () => {
  try {
    const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
    if (raw) {
      const s = JSON.parse(raw);
      const comps = s?.data?.context?.companies || s?.context?.companies || s?.data?.companies || s?.companies;
      if (Array.isArray(comps) && comps.length > 0) return comps[0];
    }
    const ctx = useERPStore.getState()?.userContext;
    if (ctx?.companies?.length > 0) return ctx.companies[0];
  } catch {}
  return null;
};

// Initial Mock UI Data (Ready to be wired to API when provided)
const INITIAL_COMPANY_PRODUCTS = [
  {
    id: 1,
    CompanyProductId: 1,
    CompanyId: 101,
    CompanyName: 'Vishvin Global Technologies',
    CompanyCode: 'VGT',
    ProductId: 201,
    ProductName: 'Vishvin Enterprise ERP',
    ProductCode: 'ERP-CORE-v2',
    CompanyProductCode: 'VGT-ERP-PRO',
    LicenseType: 'Enterprise',
    MaxUsers: 250,
    ActiveUsers: 184,
    BillingCycle: 'Annual',
    StartDate: '2026-01-15',
    ExpiryDate: '2027-01-14',
    Description: 'Flagship enterprise suite deployment with HRM, CRM, Inventory, and Accounting modules.',
    EnabledModules: ['HRM', 'CRM', 'Inventory', 'Finance', 'POS', 'Letter Builder'],
    status: 'Active',
    IsDisabled: false,
    CreatedOn: '2026-01-15T09:30:00Z',
    CreatedByUserName: 'admin_vishvin',
    UpdatedByUserName: 'admin_vishvin'
  },
  {
    id: 2,
    CompanyProductId: 2,
    CompanyId: 101,
    CompanyName: 'Vishvin Global Technologies',
    CompanyCode: 'VGT',
    ProductId: 202,
    ProductName: 'Vishvin Smart HRM & Payroll',
    ProductCode: 'HRM-PAY-v1',
    CompanyProductCode: 'VGT-HRM-STD',
    LicenseType: 'Professional',
    MaxUsers: 100,
    ActiveUsers: 92,
    BillingCycle: 'Annual',
    StartDate: '2026-02-01',
    ExpiryDate: '2027-01-31',
    Description: 'Automated biometric attendance, payroll computing, and employee self-service portal.',
    EnabledModules: ['HRM', 'Attendance', 'Leave', 'Payroll'],
    status: 'Active',
    IsDisabled: false,
    CreatedOn: '2026-02-01T11:15:00Z',
    CreatedByUserName: 'admin_vishvin',
    UpdatedByUserName: 'nithin_mgr'
  },
  {
    id: 3,
    CompanyProductId: 3,
    CompanyId: 102,
    CompanyName: 'Apex Logistics Corp',
    CompanyCode: 'ALC',
    ProductId: 203,
    ProductName: 'OmniTrack Supply & Inventory',
    ProductCode: 'INV-TRACK-v3',
    CompanyProductCode: 'ALC-INV-MAX',
    LicenseType: 'Enterprise',
    MaxUsers: 500,
    ActiveUsers: 412,
    BillingCycle: 'Multi-Year',
    StartDate: '2025-11-10',
    ExpiryDate: '2028-11-09',
    Description: 'Multi-warehouse stock balancing, barcode dispatch tracking, and vendor procurement.',
    EnabledModules: ['Inventory', 'Suppliers', 'Warehouse', 'Stock Analytics'],
    status: 'Active',
    IsDisabled: false,
    CreatedOn: '2025-11-10T14:20:00Z',
    CreatedByUserName: 'ops_apex',
    UpdatedByUserName: 'ops_apex'
  },
  {
    id: 4,
    CompanyProductId: 4,
    CompanyId: 103,
    CompanyName: 'Zenith Retail & Superstores',
    CompanyCode: 'ZRS',
    ProductId: 204,
    ProductName: 'Cloud POS & Cashier Station',
    ProductCode: 'POS-CLOUD-v4',
    CompanyProductCode: 'ZRS-POS-ULTRA',
    LicenseType: 'Professional',
    MaxUsers: 75,
    ActiveUsers: 68,
    BillingCycle: 'Quarterly',
    StartDate: '2026-03-01',
    ExpiryDate: '2026-06-01',
    Description: 'Fast-checkout offline-first POS cash registers, barcode scanning, and thermal printing.',
    EnabledModules: ['POS', 'Orders', 'Barcode Print', 'Sales Analytics'],
    status: 'Active',
    IsDisabled: false,
    CreatedOn: '2026-03-01T08:00:00Z',
    CreatedByUserName: 'retail_lead',
    UpdatedByUserName: 'retail_lead'
  },
  {
    id: 5,
    CompanyProductId: 5,
    CompanyId: 104,
    CompanyName: 'BlueWave Digital Media',
    CompanyCode: 'BDM',
    ProductId: 205,
    ProductName: 'CRM & Customer Pipeline Suite',
    ProductCode: 'CRM-LEAD-v2',
    CompanyProductCode: 'BDM-CRM-PLUS',
    LicenseType: 'Starter',
    MaxUsers: 25,
    ActiveUsers: 21,
    BillingCycle: 'Monthly',
    StartDate: '2026-02-15',
    ExpiryDate: '2026-03-15',
    Description: 'Inbound sales pipeline, customer journey stages, email outreach, and SLA deal tracking.',
    EnabledModules: ['CRM', 'Leads', 'Deals', 'Pipeline', 'Campaigns'],
    status: 'Active',
    IsDisabled: false,
    CreatedOn: '2026-02-15T16:45:00Z',
    CreatedByUserName: 'admin_vishvin',
    UpdatedByUserName: 'admin_vishvin'
  },
  {
    id: 6,
    CompanyProductId: 6,
    CompanyId: 105,
    CompanyName: 'Kreston Financial Advisory',
    CompanyCode: 'KFA',
    ProductId: 206,
    ProductName: 'Audit & Compliance Ledger',
    ProductCode: 'FIN-AUDIT-v1',
    CompanyProductCode: 'KFA-FIN-CUSTOM',
    LicenseType: 'Custom',
    MaxUsers: 50,
    ActiveUsers: 0,
    BillingCycle: 'Annual',
    StartDate: '2025-08-01',
    ExpiryDate: '2026-07-31',
    Description: 'Trial mapping and compliance ledger. Currently paused pending license renewal.',
    EnabledModules: ['Finance', 'Budgeting', 'Taxes', 'Reports'],
    status: 'Inactive',
    IsDisabled: true,
    CreatedOn: '2025-08-01T10:00:00Z',
    CreatedByUserName: 'finance_kreston',
    UpdatedByUserName: 'finance_kreston'
  }
];

const AVAILABLE_COMPANIES = [
  { id: 101, code: 'VGT', name: 'Vishvin Global Technologies' },
  { id: 102, code: 'ALC', name: 'Apex Logistics Corp' },
  { id: 103, code: 'ZRS', name: 'Zenith Retail & Superstores' },
  { id: 104, code: 'BDM', name: 'BlueWave Digital Media' },
  { id: 105, code: 'KFA', name: 'Kreston Financial Advisory' }
];

const AVAILABLE_PRODUCTS = [
  { id: 201, code: 'ERP-CORE-v2', name: 'Vishvin Enterprise ERP' },
  { id: 202, code: 'HRM-PAY-v1', name: 'Vishvin Smart HRM & Payroll' },
  { id: 203, code: 'INV-TRACK-v3', name: 'OmniTrack Supply & Inventory' },
  { id: 204, code: 'POS-CLOUD-v4', name: 'Cloud POS & Cashier Station' },
  { id: 205, code: 'CRM-LEAD-v2', name: 'CRM & Customer Pipeline Suite' },
  { id: 206, code: 'FIN-AUDIT-v1', name: 'Audit & Compliance Ledger' }
];

const AVAILABLE_MODULES = [
  'HRM', 'CRM', 'Inventory', 'Finance', 'POS', 'Letter Builder',
  'Attendance', 'Leave', 'Payroll', 'Suppliers', 'Warehouse', 'Orders', 'Barcode Print'
];

export default function CompanyProductView() {
  const sessionCompany = getSessionCompany();
  const sessionCompanyId = sessionCompany?.CompanyId ?? sessionCompany?.CompanyMasterId ?? sessionCompany?.companyId;
  const sessionCompanyName = sessionCompany?.CompanyName ?? sessionCompany?.name;

  // State
  const [items, setItems] = useState(INITIAL_COMPANY_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [licenseFilter, setLicenseFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State
  const initialForm = {
    CompanyId: sessionCompanyId ? String(sessionCompanyId) : '',
    ProductId: '',
    CompanyProductCode: '',
    LicenseType: 'Enterprise',
    MaxUsers: 100,
    BillingCycle: 'Annual',
    StartDate: new Date().toISOString().split('T')[0],
    ExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    Description: '',
    EnabledModules: ['HRM', 'CRM', 'Inventory'],
    IsDisabled: false
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulated Refresh
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Company Products list refreshed successfully');
    }, 400);
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.CompanyName.toLowerCase().includes(q) ||
        item.ProductName.toLowerCase().includes(q) ||
        item.CompanyProductCode.toLowerCase().includes(q) ||
        (item.Description && item.Description.toLowerCase().includes(q)) ||
        item.LicenseType.toLowerCase().includes(q);

      const matchesCompany = companyFilter === 'ALL' || String(item.CompanyId) === String(companyFilter);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !item.IsDisabled) ||
        (statusFilter === 'DISABLED' && item.IsDisabled);
      const matchesLicense = licenseFilter === 'ALL' || item.LicenseType === licenseFilter;

      return matchesSearch && matchesCompany && matchesStatus && matchesLicense;
    });
  }, [items, searchQuery, companyFilter, statusFilter, licenseFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((p) => !p.IsDisabled).length;
    const disabled = total - active;
    const uniqueCompanies = new Set(items.map((p) => p.CompanyId)).size;
    const totalAllocatedUsers = items.reduce((sum, p) => sum + (Number(p.MaxUsers) || 0), 0);
    return { total, active, disabled, uniqueCompanies, totalAllocatedUsers };
  }, [items]);

  // Toggle Single Status
  const handleToggleStatus = (record) => {
    const newStatus = !record.IsDisabled;
    setItems((prev) =>
      prev.map((it) =>
        it.id === record.id
          ? {
              ...it,
              IsDisabled: newStatus,
              status: newStatus ? 'Inactive' : 'Active'
            }
          : it
      )
    );
    showToast(`${record.ProductName} mapping is now ${newStatus ? 'Disabled' : 'Active'}`);
  };

  // Select all checkbox handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkEnable = () => {
    setItems((prev) =>
      prev.map((it) =>
        selectedIds.includes(it.id) ? { ...it, IsDisabled: false, status: 'Active' } : it
      )
    );
    showToast(`Enabled ${selectedIds.length} selected company products`);
    setSelectedIds([]);
  };

  const handleBulkDisable = () => {
    setItems((prev) =>
      prev.map((it) =>
        selectedIds.includes(it.id) ? { ...it, IsDisabled: true, status: 'Inactive' } : it
      )
    );
    showToast(`Disabled ${selectedIds.length} selected company products`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((it) => !selectedIds.includes(it.id)));
    showToast(`Removed ${selectedIds.length} company products`);
    setSelectedIds([]);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.CompanyId) errors.CompanyId = 'Company is required';
    if (!formData.ProductId) errors.ProductId = 'Product is required';
    if (!formData.CompanyProductCode.trim()) errors.CompanyProductCode = 'Company Product Code is required';
    if (!formData.MaxUsers || formData.MaxUsers <= 0) errors.MaxUsers = 'Valid user capacity is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData(initialForm);
    setFormErrors({});
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      CompanyId: rec.CompanyId,
      ProductId: rec.ProductId,
      CompanyProductCode: rec.CompanyProductCode,
      LicenseType: rec.LicenseType || 'Enterprise',
      MaxUsers: rec.MaxUsers || 100,
      BillingCycle: rec.BillingCycle || 'Annual',
      StartDate: rec.StartDate || '',
      ExpiryDate: rec.ExpiryDate || '',
      Description: rec.Description || '',
      EnabledModules: rec.EnabledModules || [],
      IsDisabled: rec.IsDisabled
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  // Open View Modal
  const openViewModal = (rec) => {
    setSelectedRecord(rec);
    setIsViewOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (rec) => {
    setSelectedRecord(rec);
    setIsDeleteOpen(true);
  };

  // Submit Add
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const company = AVAILABLE_COMPANIES.find((c) => String(c.id) === String(formData.CompanyId));
    const product = AVAILABLE_PRODUCTS.find((p) => String(p.id) === String(formData.ProductId));

    const newEntry = {
      id: Date.now(),
      CompanyProductId: Date.now(),
      CompanyId: Number(formData.CompanyId),
      CompanyName: company?.name || 'Selected Company',
      CompanyCode: company?.code || 'CMP',
      ProductId: Number(formData.ProductId),
      ProductName: product?.name || 'Selected Product',
      ProductCode: product?.code || 'PRD',
      CompanyProductCode: formData.CompanyProductCode,
      LicenseType: formData.LicenseType,
      MaxUsers: Number(formData.MaxUsers),
      ActiveUsers: 0,
      BillingCycle: formData.BillingCycle,
      StartDate: formData.StartDate,
      ExpiryDate: formData.ExpiryDate,
      Description: formData.Description,
      EnabledModules: formData.EnabledModules,
      status: formData.IsDisabled ? 'Inactive' : 'Active',
      IsDisabled: formData.IsDisabled,
      CreatedOn: new Date().toISOString(),
      CreatedByUserName: 'current_user',
      UpdatedByUserName: 'current_user'
    };

    setItems((prev) => [newEntry, ...prev]);
    setIsAddOpen(false);
    showToast('New Company Product mapped successfully!');
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const company = AVAILABLE_COMPANIES.find((c) => String(c.id) === String(formData.CompanyId));
    const product = AVAILABLE_PRODUCTS.find((p) => String(p.id) === String(formData.ProductId));

    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedRecord.id
          ? {
              ...it,
              CompanyId: Number(formData.CompanyId),
              CompanyName: company?.name || it.CompanyName,
              CompanyCode: company?.code || it.CompanyCode,
              ProductId: Number(formData.ProductId),
              ProductName: product?.name || it.ProductName,
              ProductCode: product?.code || it.ProductCode,
              CompanyProductCode: formData.CompanyProductCode,
              LicenseType: formData.LicenseType,
              MaxUsers: Number(formData.MaxUsers),
              BillingCycle: formData.BillingCycle,
              StartDate: formData.StartDate,
              ExpiryDate: formData.ExpiryDate,
              Description: formData.Description,
              EnabledModules: formData.EnabledModules,
              IsDisabled: formData.IsDisabled,
              status: formData.IsDisabled ? 'Inactive' : 'Active',
              UpdatedByUserName: 'current_user'
            }
          : it
      )
    );
    setIsEditOpen(false);
    showToast('Company Product updated successfully!');
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedRecord) return;
    setItems((prev) => prev.filter((it) => it.id !== selectedRecord.id));
    setIsDeleteOpen(false);
    showToast(`Removed mapping for ${selectedRecord.ProductName}`);
    setSelectedRecord(null);
  };

  const toggleModuleSelection = (modName) => {
    setFormData((prev) => {
      const exists = prev.EnabledModules.includes(modName);
      return {
        ...prev,
        EnabledModules: exists
          ? prev.EnabledModules.filter((m) => m !== modName)
          : [...prev.EnabledModules, modName]
      };
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Company Product Management"
        description="Assign, configure, and monitor software products and subscriptions mapped to client companies."
        breadcrumbs={[
          { label: 'Master', path: '/master' },
          { label: 'Company Product', path: '/master/company-products' }
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              disabled={loading}
              className={loading ? 'animate-spin' : ''}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddModal}
            >
              Add Company Product
            </Button>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Products Mapped
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {stats.total}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Across all clients</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Deployments
              </p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
                {stats.active}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Operational & provisioned</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Inactive Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Disabled / Paused
              </p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
                {stats.disabled}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Expired or pending review</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Unique Companies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Assigned Companies
              </p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5">
                {stats.uniqueCompanies}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">{stats.totalAllocatedUsers} user seats allowed</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {/* Toolbar & Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search company, product, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            {/* Quick Filters & View Switcher */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Company Filter */}
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Companies</option>
                {AVAILABLE_COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active ({stats.active})</option>
                <option value="DISABLED">Disabled ({stats.disabled})</option>
              </select>

              {/* License Tier Filter */}
              <select
                value={licenseFilter}
                onChange={(e) => setLicenseFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All License Tiers</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Professional">Professional</option>
                <option value="Starter">Starter</option>
                <option value="Custom">Custom</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-lg flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkEnable} className="h-7 text-xs">
                  Enable
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDisable} className="h-7 text-xs">
                  Disable
                </Button>
                <Button size="sm" variant="danger" onClick={handleBulkDelete} className="h-7 text-xs">
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content View: Table or Grid */}
        {filteredData.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto text-slate-400">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              No Company Products Found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No records match your search or active filters. Try adjusting your query or create a new mapping.
            </p>
            <Button size="sm" variant="primary" icon={Plus} onClick={openAddModal}>
              Add First Mapping
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded-sm border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 w-16"># ID</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 hidden md:table-cell">Product Code</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Tier / Plan</th>
                  <th className="py-3 px-4 hidden lg:table-cell">User Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredData.map((row) => {
                  const isChecked = selectedIds.includes(row.id);
                  const isRowDisabled = row.IsDisabled;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isRowDisabled ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(row.id)}
                          className="rounded-sm border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-slate-400">
                        #{row.CompanyProductId}
                      </td>

                      {/* Company */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-teal-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {row.CompanyCode || 'CO'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {row.CompanyName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Code: {row.CompanyCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {row.ProductName}
                            </span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                              {row.ProductCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4 hidden md:table-cell font-mono text-slate-600 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {row.CompanyProductCode}
                        </span>
                      </td>

                      {/* License Tier */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.LicenseType === 'Enterprise'
                              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : row.LicenseType === 'Professional'
                              ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {row.LicenseType}
                        </span>
                      </td>

                      {/* Users Capacity */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{row.ActiveUsers} active</span>
                            <span className="font-bold">{row.MaxUsers} max</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((row.ActiveUsers / (row.MaxUsers || 1)) * 100)
                                )}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status + Toggle */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!row.IsDisabled}
                            onChange={() => handleToggleStatus(row)}
                            size="sm"
                          />
                          <span
                            className={`text-[11px] font-bold ${
                              !row.IsDisabled
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {!row.IsDisabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            icon={Eye}
                            size="sm"
                            variant="ghost"
                            onClick={() => openViewModal(row)}
                            title="View details"
                          />
                          <IconButton
                            icon={Edit2}
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(row)}
                            title="Edit mapping"
                          />
                          <IconButton
                            icon={Trash2}
                            size="sm"
                            variant="ghost"
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            onClick={() => openDeleteModal(row)}
                            title="Remove mapping"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View Mode */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((row) => (
              <div
                key={row.id}
                className={`bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5 hover:shadow-md transition-all ${
                  row.IsDisabled ? 'opacity-60' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-xs shrink-0">
                      {row.CompanyCode || 'CO'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {row.CompanyName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {row.CompanyProductCode}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!row.IsDisabled}
                    onChange={() => handleToggleStatus(row)}
                    size="sm"
                  />
                </div>

                {/* Product Badge */}
                <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Product
                    </span>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary dark:text-indigo-300 px-1.5 py-0.2 rounded">
                      {row.LicenseType}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {row.ProductName}
                  </p>
                </div>

                {/* Modules Tags */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Enabled Modules
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {row.EnabledModules?.slice(0, 3).map((m) => (
                      <span
                        key={m}
                        className="text-[9px] font-semibold bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300"
                      >
                        {m}
                      </span>
                    ))}
                    {row.EnabledModules?.length > 3 && (
                      <span className="text-[9px] font-bold bg-teal-100 dark:bg-teal-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                        +{row.EnabledModules.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* User Capacity Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Active: {row.ActiveUsers}</span>
                    <span className="font-bold">Cap: {row.MaxUsers} Users</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((row.ActiveUsers / (row.MaxUsers || 1)) * 100)
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Cycle: {row.BillingCycle}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconButton
                      icon={Eye}
                      size="sm"
                      variant="ghost"
                      onClick={() => openViewModal(row)}
                      title="View"
                    />
                    <IconButton
                      icon={Edit2}
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(row)}
                      title="Edit"
                    />
                    <IconButton
                      icon={Trash2}
                      size="sm"
                      variant="ghost"
                      className="text-rose-500 hover:text-rose-700"
                      onClick={() => openDeleteModal(row)}
                      title="Delete"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. ADD MODAL                                              */}
      {/* ========================================================= */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Company Product"
          size="lg"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={Boolean(sessionCompanyId)}
                  value={formData.CompanyId || (sessionCompanyId ? String(sessionCompanyId) : '')}
                  onChange={(e) => {
                    const compId = e.target.value;
                    const comp = AVAILABLE_COMPANIES.find((c) => String(c.id) === String(compId));
                    setFormData((f) => ({
                      ...f,
                      CompanyId: compId,
                      CompanyProductCode: comp ? `${comp.code}-PRD-${Math.floor(100 + Math.random() * 900)}` : f.CompanyProductCode
                    }));
                  }}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${sessionCompanyId ? 'opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  <option value="">— Select Company —</option>
                  {AVAILABLE_COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                  {sessionCompanyId && !AVAILABLE_COMPANIES.some(c => String(c.id) === String(sessionCompanyId)) && (
                    <option value={String(sessionCompanyId)}>
                      {sessionCompanyName || `Company #${sessionCompanyId}`}
                    </option>
                  )}
                </select>
                {formErrors.CompanyId && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.CompanyId}</p>
                )}
              </div>

              {/* Product */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.ProductId}
                  onChange={(e) => setFormData((f) => ({ ...f, ProductId: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">— Select Base Product —</option>
                  {AVAILABLE_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
                {formErrors.ProductId && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.ProductId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Company Product Code */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Product Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. VGT-ERP-01"
                  value={formData.CompanyProductCode}
                  onChange={(e) => setFormData((f) => ({ ...f, CompanyProductCode: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                />
                {formErrors.CompanyProductCode && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.CompanyProductCode}</p>
                )}
              </div>

              {/* License Tier */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  License Tier
                </label>
                <select
                  value={formData.LicenseType}
                  onChange={(e) => setFormData((f) => ({ ...f, LicenseType: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Enterprise">Enterprise (Full Modules)</option>
                  <option value="Professional">Professional</option>
                  <option value="Starter">Starter</option>
                  <option value="Custom">Custom Scope</option>
                </select>
              </div>

              {/* Max Users */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User Seat Capacity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.MaxUsers}
                  onChange={(e) => setFormData((f) => ({ ...f, MaxUsers: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20"
                />
                {formErrors.MaxUsers && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.MaxUsers}</p>
                )}
              </div>
            </div>

            {/* Dates & Billing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={formData.BillingCycle}
                  onChange={(e) => setFormData((f) => ({ ...f, BillingCycle: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                  <option value="Multi-Year">Multi-Year</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.StartDate}
                  onChange={(e) => setFormData((f) => ({ ...f, StartDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expiry / Renewal Date
                </label>
                <input
                  type="date"
                  value={formData.ExpiryDate}
                  onChange={(e) => setFormData((f) => ({ ...f, ExpiryDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Enabled Modules Checklist */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Authorized Feature Modules
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg max-h-36 overflow-y-auto">
                {AVAILABLE_MODULES.map((mod) => {
                  const isChecked = formData.EnabledModules.includes(mod);
                  return (
                    <label
                      key={mod}
                      onClick={() => toggleModuleSelection(mod)}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-[11px] truncate">{mod}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deployment Description & Notes
              </label>
              <textarea
                rows={2}
                placeholder="Scope of work, SLA terms, or custom notes..."
                value={formData.Description}
                onChange={(e) => setFormData((f) => ({ ...f, Description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Enable Immediate Access
                </span>
                <span className="text-[10px] text-slate-400">
                  Allow users in this company to log in and use assigned product modules.
                </span>
              </div>
              <Switch
                checked={!formData.IsDisabled}
                onChange={(val) => setFormData((f) => ({ ...f, IsDisabled: !val }))}
                size="md"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Company Product
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT MODAL                                             */}
      {/* ========================================================= */}
      {isEditOpen && selectedRecord && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Company Product #${selectedRecord.CompanyProductId}`}
          size="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company
                </label>
                <select
                  disabled={Boolean(sessionCompanyId)}
                  value={formData.CompanyId || (sessionCompanyId ? String(sessionCompanyId) : '')}
                  onChange={(e) => setFormData((f) => ({ ...f, CompanyId: e.target.value }))}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white ${sessionCompanyId ? 'opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  {AVAILABLE_COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                  {sessionCompanyId && !AVAILABLE_COMPANIES.some(c => String(c.id) === String(sessionCompanyId)) && (
                    <option value={String(sessionCompanyId)}>
                      {sessionCompanyName || `Company #${sessionCompanyId}`}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product
                </label>
                <select
                  value={formData.ProductId}
                  onChange={(e) => setFormData((f) => ({ ...f, ProductId: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {AVAILABLE_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Product Code
                </label>
                <input
                  type="text"
                  value={formData.CompanyProductCode}
                  onChange={(e) => setFormData((f) => ({ ...f, CompanyProductCode: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  License Tier
                </label>
                <select
                  value={formData.LicenseType}
                  onChange={(e) => setFormData((f) => ({ ...f, LicenseType: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Professional">Professional</option>
                  <option value="Starter">Starter</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seat Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.MaxUsers}
                  onChange={(e) => setFormData((f) => ({ ...f, MaxUsers: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={formData.BillingCycle}
                  onChange={(e) => setFormData((f) => ({ ...f, BillingCycle: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                  <option value="Multi-Year">Multi-Year</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.StartDate}
                  onChange={(e) => setFormData((f) => ({ ...f, StartDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Renewal / Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.ExpiryDate}
                  onChange={(e) => setFormData((f) => ({ ...f, ExpiryDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.Description}
                onChange={(e) => setFormData((f) => ({ ...f, Description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Product Active Status
                </span>
                <span className="text-[10px] text-slate-400">
                  Toggle to immediately pause or enable customer access.
                </span>
              </div>
              <Switch
                checked={!formData.IsDisabled}
                onChange={(val) => setFormData((f) => ({ ...f, IsDisabled: !val }))}
                size="md"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 3. VIEW DETAILS MODAL                                     */}
      {/* ========================================================= */}
      {isViewOpen && selectedRecord && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Company Product Details"
          size="md"
        >
          <div className="space-y-4 text-xs">
            {/* Header Hero */}
            <div className="p-4 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Mapping #{selectedRecord.CompanyProductId}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedRecord.ProductName}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Assigned to: <strong className="text-slate-900 dark:text-white">{selectedRecord.CompanyName}</strong>
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  !selectedRecord.IsDisabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                {!selectedRecord.IsDisabled ? 'Active' : 'Disabled'}
              </span>
            </div>

            {/* Grid Attributes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-400 font-medium block">Company Code</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                  {selectedRecord.CompanyCode}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-400 font-medium block">Company Product Code</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                  {selectedRecord.CompanyProductCode}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-400 font-medium block">License Tier</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedRecord.LicenseType}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-400 font-medium block">User Capacity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedRecord.ActiveUsers} / {selectedRecord.MaxUsers} Seats
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-400 font-medium block">Billing Cycle</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedRecord.BillingCycle}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-400 font-medium block">Contract Renewal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedRecord.ExpiryDate || '—'}
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedRecord.Description && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1">
                <span className="text-slate-400 font-medium block">Scope / Description</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedRecord.Description}
                </p>
              </div>
            )}

            {/* Modules List */}
            {selectedRecord.EnabledModules && selectedRecord.EnabledModules.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-slate-400 font-medium block">Enabled Modules</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.EnabledModules.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 bg-indigo-50 dark:bg-teal-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded font-semibold text-[11px]"
                    >
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Audit */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>Created by: <strong>{selectedRecord.CreatedByUserName}</strong></span>
              <span>Updated by: <strong>{selectedRecord.UpdatedByUserName}</strong></span>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 4. DELETE CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      {isDeleteOpen && selectedRecord && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Remove Company Product Mapping"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2.5 text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Are you sure you want to remove this mapping?</p>
                <p className="text-[11px] mt-0.5">
                  This will detach <strong>{selectedRecord.ProductName}</strong> from{' '}
                  <strong>{selectedRecord.CompanyName}</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
