// src/pages/ModuleRegistry.jsx
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { DynamicListPage, DynamicFormPage, DynamicDetailPage } from '../components/ui/DynamicPageEngine';
import { api } from '../services/api';
import { Button, StatusBadge, Badge, Card, StatCard } from '../components/ui/index';
import { Modal } from '../components/ui/Modal';
import { CalendarRange, Coins, TrendingUp, Wallet, QrCode } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  BarChart,
  Bar
} from 'recharts';

export function ModuleRenderer() {
  const { module, subpage } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Track add modal open states for local-action simulation
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Find current route configuration with hyphen-to-underscore normalization
  const rawKey = path.split('/').filter(Boolean).join('_');
  const normalizedKey = rawKey.replace(/-/g, '_');
  let config = registryConfigs[rawKey] || registryConfigs[normalizedKey];

  if (!config) {
    // If route matches an analytics/dashboard view, show a generic analytics dashboard
    if (path.endsWith('/analytics') || path.endsWith('/dashboard')) {
      return <GenericAnalyticsDashboard title={path.split('/').slice(-2)[0].toUpperCase().replace(/-/g, ' ') + " Analytics"} />;
    }
    
    // Auto-generate rich fallback configuration with realistic business records
    const segments = path.split('/').filter(Boolean);
    const moduleName = segments[0] ? segments[0].toUpperCase() : 'MODULE';
    const subName = segments[segments.length - 1]
      ? segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Management';
    
    config = {
      title: `${subName}`,
      description: `Manage, monitor, and configure ${subName.toLowerCase()} within the ${moduleName} enterprise vertical.`,
      apiFetch: async () => [
        { id: `${moduleName.slice(0, 3)}-001`, name: `${subName} Master Entry Alpha`, category: "Primary", status: "Active", date: "2026-08-17", assigned: "Andrew Admin" },
        { id: `${moduleName.slice(0, 3)}-002`, name: `${subName} Master Entry Beta`, category: "Standard", status: "Active", date: "2026-08-16", assigned: "Linda Watson" },
        { id: `${moduleName.slice(0, 3)}-003`, name: `${subName} Master Entry Gamma`, category: "Enterprise", status: "Pending", date: "2026-08-15", assigned: "Evelyn Hayes" },
        { id: `${moduleName.slice(0, 3)}-004`, name: `${subName} Master Entry Delta`, category: "Internal", status: "Inactive", date: "2026-08-14", assigned: "Alex Thompson" }
      ],
      columns: [
        { id: 'id', header: 'Reference ID', accessorKey: 'id', key: 'id' },
        { id: 'name', header: `${subName} Name`, accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span> },
        { id: 'category', header: 'Category', accessorKey: 'category', key: 'category' },
        { id: 'assigned', header: 'Assigned To', accessorKey: 'assigned', key: 'assigned' },
        { id: 'date', header: 'Created Date', accessorKey: 'date', key: 'date' },
        { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
      ],
      formFields: [
        { key: "name", label: `${subName} Name`, type: "text", required: true },
        { key: "category", label: "Category", type: "text", required: true },
        { key: "assigned", label: "Assigned Person", type: "text" }
      ]
    };
  }

  const handleAddClick = () => {
    setIsAddOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (config.apiCreate) {
      await config.apiCreate(data);
      alert("Record added successfully!");
      setIsAddOpen(false);
      window.location.reload(); // reload to refresh cache
    } else {
      alert("Local action simulated! Input: " + JSON.stringify(data));
      setIsAddOpen(false);
    }
  };

  const handleEditSubmit = async (data) => {
    if (config.apiCreate && selectedRecord) {
      const recordId = selectedRecord.id || selectedRecord.sku || selectedRecord.key;
      await config.apiCreate({ ...selectedRecord, ...data, id: recordId });
      alert("Record updated successfully!");
      setIsEditOpen(false);
      window.location.reload();
    } else {
      alert("Record updated successfully!");
      setIsEditOpen(false);
    }
  };

  // Guarantee form fields are always populated for Add and Edit modals
  const activeFormFields = (config.formFields && config.formFields.length > 0)
    ? config.formFields
    : (selectedRecord
        ? Object.keys(selectedRecord)
            .filter(k => k !== 'id' && k !== 'actions' && k !== 'action' && k !== 'avatar' && k !== 'image' && typeof selectedRecord[k] !== 'object')
            .map(k => ({
              key: k,
              label: k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              type: k.toLowerCase().includes('date') ? 'date'
                  : k.toLowerCase().includes('status') ? 'select'
                  : typeof selectedRecord[k] === 'number' ? 'number'
                  : 'text',
              options: k.toLowerCase().includes('status') ? [
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Inactive', label: 'Inactive' }
              ] : undefined,
              required: true
            }))
        : (config.columns || [])
            .filter(c => c.id !== 'actions' && c.id !== 'id' && c.key !== 'id' && c.id !== 'action')
            .map(c => ({
              key: c.accessorKey || c.id || c.key,
              label: typeof c.header === 'string' ? c.header : (c.accessorKey || c.id || 'Field').replace(/([A-Z])/g, ' $1').replace(/_/g, ' '),
              type: (c.accessorKey || '').toLowerCase().includes('date') ? 'date'
                  : (c.accessorKey || '').toLowerCase().includes('status') ? 'select'
                  : 'text',
              options: (c.accessorKey || '').toLowerCase().includes('status') ? [
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Inactive', label: 'Inactive' }
              ] : undefined,
              required: true
            }))
      );

  return (
    <>
      <DynamicListPage
        title={config.title}
        description={config.description}
        columns={config.columns}
        fetchDataFn={config.apiFetch}
        deleteDataFn={config.apiDelete}
        onAddClick={handleAddClick}
        onViewClick={(row) => {
          setSelectedRecord(row);
          setIsViewOpen(true);
        }}
        onEditClick={(row) => {
          setSelectedRecord(row);
          setIsEditOpen(true);
        }}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: config.title }]}
      />

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title={`Add New ${config.title.endsWith('ies') ? config.title.slice(0, -3) + 'y' : config.title.slice(0, -1)}`}
          size="lg"
        >
          <DynamicFormPage
            title=""
            fields={activeFormFields}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      )}

      {isViewOpen && selectedRecord && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedRecord(null);
          }}
          title={`${config.title.endsWith('ies') ? config.title.slice(0, -3) + 'y' : config.title.slice(0, -1)} Details`}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {Object.entries(selectedRecord).map(([key, val]) => {
                if (typeof val === 'object' || key === 'image' || key === 'id' || key === 'avatar') return null;
                return (
                  <div key={key} className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-400 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{String(val)}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-105 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isEditOpen && selectedRecord && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedRecord(null);
          }}
          title={`Edit ${config.title.endsWith('ies') ? config.title.slice(0, -3) + 'y' : config.title.slice(0, -1)}`}
          size="lg"
        >
          <DynamicFormPage
            title=""
            fields={activeFormFields}
            defaultValues={selectedRecord}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}

// ==========================================
// Generic Analytics Dashboard Component
// ==========================================
function GenericAnalyticsDashboard({ title }) {
  const chartData = [
    { name: 'Mon', Revenue: 4000, Expenses: 2400 },
    { name: 'Tue', Revenue: 3000, Expenses: 1398 },
    { name: 'Wed', Revenue: 2000, Expenses: 9800 },
    { name: 'Thu', Revenue: 2780, Expenses: 3908 },
    { name: 'Fri', Revenue: 1890, Expenses: 4800 },
    { name: 'Sat', Revenue: 2390, Expenses: 3800 },
    { name: 'Sun', Revenue: 3490, Expenses: 4300 }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">Cross-module reporting intelligence.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Overall Growth" value="+24.8%" badgeText="MoM" badgeVariant="success" icon={TrendingUp} description="Compared to last quarter" />
        <StatCard title="Transactions" value="1,842" badgeText="+4.8%" icon={Coins} description="Processed this week" />
        <StatCard title="Active Invoices" value="$45,800" badgeText="Pending" icon={Wallet} description="Average value $2,400" />
        <StatCard title="SLA Completion" value="98.4%" badgeText="Target 95%" icon={CalendarRange} description="Response times optimized" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="h-[320px] flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Financial Flow Trend</span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ChartTooltip />
                <Area type="monotone" dataKey="Revenue" stroke="#0d9488" fill="#0d9488" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="h-[320px] flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Conversion Rate Dynamics</span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <ChartTooltip />
                <Bar dataKey="Revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

const registryConfigs = {
  master_companies: {
    title: "Companies",
    description: "Manage registered companies in the system.",
    apiFetch: async () => [
      { id: 1, companyCode: "VISHVIN", companyName: "Vishvin Technologies", email: "info@vishvin.com", phone: "9999999999", status: "Active" },
      { id: 2, companyCode: "ABCORP", companyName: "ABC Corporation", email: "contact@abccorp.com", phone: "8888888888", status: "Active" },
      { id: 3, companyCode: "INFOSYS", companyName: "Infosys Limited", email: "info@infosys.com", phone: "080-12345678", status: "Active" },
      { id: 4, companyCode: "TCS", companyName: "Tata Consultancy Services", email: "info@tcs.com", phone: "022-12345678", status: "Inactive" },
      { id: 5, companyCode: "WIPRO", companyName: "Wipro Limited", email: "info@wipro.com", phone: "080-87654321", status: "Active" }
    ],
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'companyCode', header: 'Company Code', accessorKey: 'companyCode', key: 'companyCode' },
      { id: 'companyName', header: 'Company Name', accessorKey: 'companyName', key: 'companyName', cell: ({ row }) => <span className="font-bold">{row.original.companyName}</span> },
      { id: 'email', header: 'Email', accessorKey: 'email', key: 'email' },
      { id: 'phone', header: 'Phone Number', accessorKey: 'phone', key: 'phone' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "companyCode", label: "Company Code", type: "text", required: true, placeholder: "Enter company code" },
      { key: "companyName", label: "Company Name", type: "text", required: true, placeholder: "Enter company name" },
      { key: "email", label: "Email", type: "email", placeholder: "Enter email" },
      { key: "phone", label: "Phone Number", type: "text", placeholder: "Enter phone number" },
      { key: "address", label: "Address", type: "text", placeholder: "Enter address" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" }
      ]}
    ]
  },
  master_products: {
    title: "Products",
    description: "Manage registered products in the system.",
    apiFetch: async () => [
      { id: 1, productCode: "DMS", productName: "Document Management System", description: "Application for document management", status: "Active" },
      { id: 2, productCode: "PDMS", productName: "Project Data Management System", description: "Project data management application", status: "Active" },
      { id: 3, productCode: "WFMS", productName: "Workforce Management System", description: "Workforce & field operations", status: "Active" },
      { id: 4, productCode: "AMS", productName: "Asset Management System", description: "Asset tracking and management", status: "Active" },
      { id: 5, productCode: "MRS", productName: "Material Requisition System", description: "Material request and tracking", status: "Inactive" }
    ],
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'productCode', header: 'Product Code', accessorKey: 'productCode', key: 'productCode' },
      { id: 'productName', header: 'Product Name', accessorKey: 'productName', key: 'productName', cell: ({ row }) => <span className="font-bold">{row.original.productName}</span> },
      { id: 'description', header: 'Description', accessorKey: 'description', key: 'description' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "productCode", label: "Product Code", type: "text", required: true, placeholder: "Enter product code" },
      { key: "productName", label: "Product Name", type: "text", required: true, placeholder: "Enter product name" },
      { key: "description", label: "Description", type: "text", placeholder: "Enter description" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" }
      ]}
    ]
  },
  master_company_products: {
    title: "Company Products",
    description: "Assign products to companies.",
    apiFetch: async () => [
      { id: 1, company: "Vishvin Technologies", product: "DMS", status: "Active", createdOn: "12/05/2024" },
      { id: 2, company: "Vishvin Technologies", product: "PDMS", status: "Active", createdOn: "13/05/2024" },
      { id: 3, company: "ABC Corporation", product: "WFMS", status: "Active", createdOn: "14/05/2024" },
      { id: 4, company: "TCS", product: "AMS", status: "Active", createdOn: "15/05/2024" },
      { id: 5, company: "Infosys Limited", product: "MRS", status: "Inactive", createdOn: "16/05/2024" }
    ],
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'company', header: 'Company', accessorKey: 'company', key: 'company', cell: ({ row }) => <span className="font-bold">{row.original.company}</span> },
      { id: 'product', header: 'Product', accessorKey: 'product', key: 'product' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: 'createdOn', header: 'Created On', accessorKey: 'createdOn', key: 'createdOn' }
    ],
    formFields: [
      { key: "company", label: "Company", type: "select", required: true, options: [
        { value: "Vishvin Technologies", label: "Vishvin Technologies" },
        { value: "ABC Corporation", label: "ABC Corporation" },
        { value: "Infosys Limited", label: "Infosys Limited" },
        { value: "TCS", label: "TCS" }
      ]},
      { key: "product", label: "Product", type: "select", required: true, options: [
        { value: "DMS", label: "DMS" },
        { value: "PDMS", label: "PDMS" },
        { value: "WFMS", label: "WFMS" },
        { value: "AMS", label: "AMS" }
      ]},
      { key: "status", label: "Status", type: "select", options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" }
      ]}
    ]
  },
  master_projects: {
    title: "Projects",
    description: "Manage projects under company product assignments.",
    apiFetch: async () => [
      { id: 1, projectCode: "UMS-KA", projectName: "DMS Karnataka", company: "Vishvin Technologies", product: "DMS", status: "Active" },
      { id: 2, projectCode: "DMS-BLR", projectName: "DMS Bangalore", company: "Vishvin Technologies", product: "DMS", status: "Active" },
      { id: 3, projectCode: "DMS-MYS", projectName: "DMS Mysore", company: "Vishvin Technologies", product: "DMS", status: "Active" },
      { id: 4, projectCode: "PDMS-KA", projectName: "PDMS Karnataka", company: "Vishvin Technologies", product: "PDMS", status: "Active" },
      { id: 5, projectCode: "WFMS-KA", projectName: "WFMS Karnataka", company: "ABC Corporation", product: "WFMS", status: "Active" }
    ],
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'projectCode', header: 'Project Code', accessorKey: 'projectCode', key: 'projectCode' },
      { id: 'projectName', header: 'Project Name', accessorKey: 'projectName', key: 'projectName', cell: ({ row }) => <span className="font-bold">{row.original.projectName}</span> },
      { id: 'company', header: 'Company', accessorKey: 'company', key: 'company' },
      { id: 'product', header: 'Product', accessorKey: 'product', key: 'product' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "companyProduct", label: "Company Product", type: "select", required: true, options: [
        { value: "Vishvin Technologies - DMS", label: "Vishvin Technologies - DMS" },
        { value: "Vishvin Technologies - PDMS", label: "Vishvin Technologies - PDMS" },
        { value: "ABC Corporation - WFMS", label: "ABC Corporation - WFMS" }
      ]},
      { key: "projectCode", label: "Project Code", type: "text", required: true, placeholder: "Enter project code" },
      { key: "projectName", label: "Project Name", type: "text", required: true, placeholder: "Enter project name" },
      { key: "description", label: "Description", type: "text", placeholder: "Enter description" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" }
      ]}
    ]
  },
  applications: {
    title: "ERP Integrated Applications",
    description: "Manage and launch active ERP core system modules.",
    apiFetch: async () => [
      { id: "APP-01", name: "Human Resource Management (HRM)", status: "Active", link: "/hrm/employees" },
      { id: "APP-02", name: "Customer Relationship Management (CRM)", status: "Active", link: "/crm/pipeline" },
      { id: "APP-03", name: "Point of Sale (POS)", status: "Active", link: "/pos/pos" },
      { id: "APP-04", name: "Asset Register & Depreciation", status: "Active", link: "/assets/register" }
    ],
    columns: [
      { id: 'id', header: 'App ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'Application Module', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: 'action', header: 'Launcher', cell: ({ row }) => <a href={row.original.link} className="text-secondary font-bold hover:underline">Launch App</a> }
    ],
    formFields: []
  },
  layouts: {
    title: "System View Layouts",
    description: "Toggle default, compact, dark mode or standard shell layouts.",
    apiFetch: async () => [
      { id: "LAY-01", name: "Standard Desktop Layout", status: "Active" },
      { id: "LAY-02", name: "Sidebar Collapsed Layout", status: "Inactive" },
      { id: "LAY-03", name: "Responsive Mobile Drawer", status: "Inactive" }
    ],
    columns: [
      { id: 'id', header: 'Layout ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'Layout Configuration Name', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: []
  },
  // Inventory configurations
  inventory_products: {
    title: "Products Catalog",
    description: "Manage catalog products, SKUs, pricing, and stock levels.",
    apiFetch: api.getProducts,
    apiDelete: api.deleteProduct,
    apiCreate: api.createProduct,
    columns: [
      { id: 'sku', header: 'SKU', accessorKey: 'sku', key: 'sku' },
      {
        id: 'name',
        header: 'Product Name',
        accessorKey: 'name',
        key: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.image && <img src={row.original.image} alt={row.original.name} className="w-8 h-8 rounded-md object-cover border border-slate-100 dark:border-slate-800" />}
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span>
              <span className="text-[10px] text-slate-400">{row.original.category}</span>
            </div>
          </div>
        )
      },
      { id: 'brand', header: 'Brand', accessorKey: 'brand', key: 'brand' },
      {
        id: 'price',
        header: 'Price',
        accessorKey: 'price',
        key: 'price',
        cell: ({ row }) => <span>${(row.original.price || 0).toLocaleString()}</span>
      },
      { id: 'stock', header: 'Stock Available', accessorKey: 'stock', key: 'stock' },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        key: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />
      }
    ],
    formFields: [
      { key: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. iPad Pro M4" },
      { key: "sku", label: "SKU Code", type: "text", required: true, placeholder: "e.g. IPAD-M4-256" },
      { key: "category", label: "Category", type: "select", required: true, options: [
        { value: "Smartphones", label: "Smartphones" },
        { value: "Laptops", label: "Laptops" },
        { value: "Audio", label: "Audio" },
        { value: "Accessories", label: "Accessories" }
      ]},
      { key: "brand", label: "Brand", type: "text", required: true, placeholder: "e.g. Apple" },
      { key: "price", label: "Unit Price ($)", type: "number", required: true, placeholder: "e.g. 999" },
      { key: "stock", label: "Opening Stock", type: "number", required: true, placeholder: "e.g. 50" },
      { key: "description", label: "Description", type: "textarea", gridSpan: "col-span-2", placeholder: "Enter product specification details..." }
    ]
  },
  inventory_categories: {
    title: "Categories",
    description: "Manage product categories and groupings.",
    apiFetch: api.getCategories,
    columns: [
      { id: 'name', header: 'Category Name', accessorKey: 'name', key: 'name' },
      { id: 'productsCount', header: 'Products Assigned', accessorKey: 'productsCount', key: 'productsCount' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Category Name", type: "text", required: true }
    ]
  },
  inventory_brands: {
    title: "Brands",
    description: "Manage manufacturers and product brands.",
    apiFetch: api.getBrands,
    columns: [
      { id: 'name', header: 'Brand Name', accessorKey: 'name', key: 'name' },
      { id: 'origin', header: 'Country of Origin', accessorKey: 'origin', key: 'origin' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Brand Name", type: "text", required: true },
      { key: "origin", label: "Country of Origin", type: "text" }
    ]
  },
  inventory_units: {
    title: "Product Units",
    description: "Manage inventory measurement units.",
    apiFetch: api.getUnits,
    columns: [
      { id: 'name', header: 'Unit Name', accessorKey: 'name', key: 'name' },
      { id: 'abbreviation', header: 'Abbr.', accessorKey: 'abbreviation', key: 'abbreviation' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Unit Name", type: "text", required: true },
      { key: "abbreviation", label: "Abbreviation", type: "text", required: true }
    ]
  },
  inventory_suppliers: {
    title: "Suppliers Directory",
    description: "Manage global procurement suppliers.",
    apiFetch: api.getSuppliers,
    columns: [
      { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'Supplier Name', accessorKey: 'name', key: 'name' },
      { id: 'contact', header: 'Contact Person', accessorKey: 'contact', key: 'contact' },
      { id: 'email', header: 'Email', accessorKey: 'email', key: 'email' },
      { id: 'phone', header: 'Phone', accessorKey: 'phone', key: 'phone' }
    ],
    formFields: [
      { key: "name", label: "Supplier Name", type: "text", required: true },
      { key: "contact", label: "Contact Person", type: "text" },
      { key: "email", label: "Email Address", type: "email" },
      { key: "phone", label: "Phone Number", type: "text" }
    ]
  },

  // Sales configurations
  sales_customers: {
    title: "Customers Directory",
    description: "Enterprise CRM client list and revenue logs.",
    apiFetch: api.getCustomers,
    apiCreate: api.createCustomer,
    columns: [
      { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'Client Name', accessorKey: 'name', key: 'name' },
      { id: 'company', header: 'Company Name', accessorKey: 'company', key: 'company' },
      { id: 'email', header: 'Email', accessorKey: 'email', key: 'email' },
      { id: 'revenue', header: 'Revenue ($)', accessorKey: 'revenue', key: 'revenue', cell: ({ row }) => <span>${(row.original.revenue || 0).toLocaleString()}</span> },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "company", label: "Company", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "country", label: "Country", type: "text" }
    ]
  },
  sales_orders: {
    title: "Sales Orders",
    description: "Track transaction processing and shipments.",
    apiFetch: api.getSalesOrders,
    apiCreate: api.createSalesOrder,
    columns: [
      { id: 'id', header: 'Order ID', accessorKey: 'id', key: 'id' },
      { id: 'customer', header: 'Customer', accessorKey: 'customer', key: 'customer' },
      { id: 'date', header: 'Order Date', accessorKey: 'date', key: 'date' },
      { id: 'amount', header: 'Amount ($)', accessorKey: 'amount', key: 'amount', cell: ({ row }) => <span>${(row.original.amount || 0).toLocaleString()}</span> },
      { id: 'method', header: 'Payment Method', accessorKey: 'method', key: 'method' },
      { id: 'status', header: 'Shipment Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "customer", label: "Customer Name", type: "text", required: true },
      { key: "amount", label: "Total Amount ($)", type: "number", required: true },
      { key: "method", label: "Payment Method", type: "select", options: [
        { value: "Credit Card", label: "Credit Card" },
        { value: "Wire Transfer", label: "Wire Transfer" },
        { value: "ACH", label: "ACH" }
      ]}
    ]
  },
  sales_recurring_invoices: {
    title: "Recurring Invoices",
    description: "Automated recurring templates and billing schedules.",
    apiFetch: api.getInvoices,
    columns: [
      { id: 'id', header: 'Template ID', accessorKey: 'id', key: 'id' },
      { id: 'customer', header: 'Billing Customer', accessorKey: 'customer', key: 'customer' },
      { id: 'dueDate', header: 'Next Bill Date', accessorKey: 'dueDate', key: 'dueDate' },
      { id: 'amount', header: 'Recurring Payout ($)', accessorKey: 'amount', key: 'amount', cell: ({ row }) => <span>${(row.original.amount || 0).toLocaleString()}</span> },
      { id: 'status', header: 'Billing Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "customer", label: "Customer Name", type: "text", required: true },
      { key: "amount", label: "Billing Value ($)", type: "number", required: true }
    ]
  },

  // Finance configurations
  finance_expenses: {
    title: "Expense Ledger",
    description: "Register hosting, SaaS licenses, office space rent, and travel expenses.",
    apiFetch: api.getExpenses,
    apiCreate: api.createExpense,
    columns: [
      { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
      { id: 'title', header: 'Expense Description', accessorKey: 'title', key: 'title' },
      { id: 'category', header: 'Category', accessorKey: 'category', key: 'category' },
      { id: 'date', header: 'Date', accessorKey: 'date', key: 'date' },
      { id: 'amount', header: 'Amount ($)', accessorKey: 'amount', key: 'amount', cell: ({ row }) => <span className="font-bold text-red-500">-${(row.original.amount || 0).toLocaleString()}</span> },
      { id: 'method', header: 'Payment Method', accessorKey: 'method', key: 'method' },
      { id: 'status', header: 'Approval', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "title", label: "Description", type: "text", required: true, placeholder: "e.g. AWS Billing August" },
      { key: "category", label: "Category", type: "select", options: [
        { value: "Hosting", label: "Hosting" },
        { value: "Rent", label: "Rent" },
        { value: "SaaS Tools", label: "SaaS Tools" },
        { value: "Travel", label: "Travel" }
      ]},
      { key: "amount", label: "Amount ($)", type: "number", required: true },
      { key: "method", label: "Payment Mode", type: "select", options: [
        { value: "Credit Card", label: "Credit Card" },
        { value: "Debit Card", label: "Debit Card" },
        { value: "ACH", label: "ACH" }
      ]}
    ]
  },
  finance_expense_category: {
    title: "Expense Categories",
    description: "Configure budget thresholds per operations vertical.",
    apiFetch: api.getExpenseCategories,
    columns: [
      { id: 'name', header: 'Category Name', accessorKey: 'name', key: 'name' },
      { id: 'code', header: 'Dept. Code', accessorKey: 'code', key: 'code' },
      { id: 'budgetLimit', header: 'Monthly Budget Limit ($)', accessorKey: 'budgetLimit', key: 'budgetLimit', cell: ({ row }) => <span>${(row.original.budgetLimit || 0).toLocaleString()}</span> },
      { id: 'spentAmount', header: 'Spent Amount ($)', accessorKey: 'spentAmount', key: 'spentAmount', cell: ({ row }) => <span>${(row.original.spentAmount || 0).toLocaleString()}</span> }
    ],
    formFields: [
      { key: "name", label: "Category Name", type: "text", required: true },
      { key: "budgetLimit", label: "Budget Limit ($)", type: "number", required: true }
    ]
  },

  // Projects Configurations
  projects_projects: {
    title: "Projects Portfolio",
    description: "Manage key engineering, POS visual, and migration projects.",
    apiFetch: api.getProjects,
    apiCreate: api.createProject,
    columns: [
      { id: 'id', header: 'Project ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'Project Name', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span> },
      { id: 'dueDate', header: 'Deadline', accessorKey: 'dueDate', key: 'dueDate' },
      { id: 'budget', header: 'Budget ($)', accessorKey: 'budget', key: 'budget', cell: ({ row }) => <span>${(row.original.budget || 0).toLocaleString()}</span> },
      { id: 'progress', header: 'Progress', accessorKey: 'progress', key: 'progress', cell: ({ row }) => <span>{row.original.progress}%</span> },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Project Name", type: "text", required: true },
      { key: "dueDate", label: "Due Date", type: "date", required: true },
      { key: "budget", label: "Budget ($)", type: "number", required: true },
      { key: "description", label: "Scope & Description", type: "textarea", gridSpan: "col-span-2" }
    ]
  },

  // Assets Configurations
  assets_register: {
    title: "Asset Register",
    description: "Configure corporate hardware, electronics, and depreciation values.",
    apiFetch: api.getAssets,
    apiCreate: api.createAsset,
    columns: [
      { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'Asset Name', accessorKey: 'name', key: 'name' },
      { id: 'category', header: 'Category', accessorKey: 'category', key: 'category' },
      { id: 'purchaseCost', header: 'Purchase Cost ($)', accessorKey: 'purchaseCost', key: 'purchaseCost', cell: ({ row }) => <span>${(row.original.purchaseCost || 0).toLocaleString()}</span> },
      { id: 'currentValue', header: 'Book Value ($)', accessorKey: 'currentValue', key: 'currentValue', cell: ({ row }) => <span>${(row.original.currentValue || 0).toLocaleString()}</span> },
      { id: 'assignedTo', header: 'Assignee', accessorKey: 'assignedTo', key: 'assignedTo' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Asset Name", type: "text", required: true },
      { key: "category", label: "Category", type: "text", required: true },
      { key: "purchaseCost", label: "Cost ($)", type: "number", required: true },
      { key: "salvageValue", label: "Salvage Cost ($)", type: "number", required: true },
      { key: "usefulLife", label: "Useful Life (Years)", type: "number", required: true },
      { key: "depreciationMethod", label: "Depr. Method", type: "select", options: [
        { value: "Straight Line", label: "Straight Line" },
        { value: "Double Declining", label: "Double Declining" }
      ]}
    ]
  },

  // Documents configurations
  documents_repository: {
    title: "Document Repository",
    description: "Store workspace templates, assets, manuals, and compliance documentation.",
    apiFetch: async () => [
      { id: "DOC-01", name: "Vishvin ERP Design Tokens.pdf", category: "Design System", owner: "Evelyn Hayes", version: "v2.4", updated: "2026-08-10", status: "Active" },
      { id: "DOC-02", name: "Q3 Operations Playbook.docx", category: "Standard Operating Manuals", owner: "Linda Watson", version: "v1.1", updated: "2026-08-12", status: "Active" },
      { id: "DOC-03", name: "GDPR Compliance Checklist.xlsx", category: "Compliance Docs", owner: "Daniel Roberts", version: "v3.0", updated: "2026-08-15", status: "Pending" }
    ],
    columns: [
      { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'Document Title', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-semibold text-slate-805 dark:text-slate-300">{row.original.name}</span> },
      { id: 'category', header: 'Category', accessorKey: 'category', key: 'category' },
      { id: 'owner', header: 'Owner', accessorKey: 'owner', key: 'owner' },
      { id: 'version', header: 'Ver.', accessorKey: 'version', key: 'version' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Document Name", type: "text", required: true },
      { key: "category", label: "Category", type: "select", options: [
        { value: "Design System", label: "Design System" },
        { value: "Standard Operating Manuals", label: "Standard Operating Manuals" },
        { value: "Compliance Docs", label: "Compliance Docs" }
      ]}
    ]
  },

  // System Configurations
  system_users: {
    title: "User Management",
    description: "Manage system access and authentication profiles.",
    apiFetch: async () => [
      { id: "USR-01", name: "Andrew Admin", email: "andrew@vishvin-erp.com", role: "Administrator", status: "Active", lastLogin: "Just now" },
      { id: "USR-02", name: "Linda Watson", email: "linda.w@vishvin-erp.com", role: "HR Manager", status: "Active", lastLogin: "5 mins ago" },
      { id: "USR-03", name: "Evelyn Hayes", email: "evelyn@vishvin-erp.com", role: "Product Owner", status: "Active", lastLogin: "2 hours ago" },
      { id: "USR-04", name: "Sarah Jenkins", email: "sarah.j@vishvin-erp.com", role: "Staff Member", status: "Inactive", lastLogin: "2 days ago" }
    ],
    columns: [
      { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
      { id: 'name', header: 'User Profile Name', accessorKey: 'name', key: 'name' },
      { id: 'email', header: 'Email Address', accessorKey: 'email', key: 'email' },
      { id: 'role', header: 'Role Assigned', accessorKey: 'role', key: 'role' },
      { id: 'lastLogin', header: 'Last Activity', accessorKey: 'lastLogin', key: 'lastLogin' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "email", label: "Email Address", type: "email", required: true },
      { key: "role", label: "Role", type: "select", options: [
        { value: "Administrator", label: "Administrator" },
        { value: "HR Manager", label: "HR Manager" },
        { value: "Finance Manager", label: "Finance Manager" },
        { value: "Staff Member", label: "Staff Member" }
      ]}
    ]
  },

  system_roles: {
    title: "Roles & Permissions Matrix",
    description: "Define enterprise RBAC authorization roles, access privilege tiers, and security scopes.",
    apiFetch: async () => [
      { id: "ROLE-01", roleName: "Super Administrator", description: "Full unrestricted access across all vertical modules and databases", permissionsCount: "All Permissions (Full)", usersCount: 3, status: "Active" },
      { id: "ROLE-02", roleName: "HR Director / Manager", description: "Read/Write permissions on Employees, Payroll, Recruitment, and Leaves", permissionsCount: "HRM & Analytics (Read/Write)", usersCount: 8, status: "Active" },
      { id: "ROLE-03", roleName: "Finance & Accounting Lead", description: "Full ledger audits, cashflow controls, invoicing and expense approvals", permissionsCount: "Finance & POS (Read/Write)", usersCount: 6, status: "Active" },
      { id: "ROLE-04", roleName: "Inventory & Warehouse Supervisor", description: "Stock transfers, barcode generation, inventory logging, PO dispatch", permissionsCount: "Inventory & Purchases (Full)", usersCount: 14, status: "Active" },
      { id: "ROLE-05", roleName: "Standard Staff Member", description: "Self-service time-tracking, leave requests, and departmental ticket submissions", permissionsCount: "Standard User (Limited)", usersCount: 42, status: "Active" }
    ],
    columns: [
      { id: 'id', header: 'Role ID', accessorKey: 'id', key: 'id' },
      { id: 'roleName', header: 'Role Title', accessorKey: 'roleName', key: 'roleName', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.roleName}</span> },
      { id: 'description', header: 'Access Description', accessorKey: 'description', key: 'description' },
      { id: 'permissionsCount', header: 'Permission Scope', accessorKey: 'permissionsCount', key: 'permissionsCount', cell: ({ row }) => <Badge variant="secondary">{row.original.permissionsCount}</Badge> },
      { id: 'usersCount', header: 'Assigned Users', accessorKey: 'usersCount', key: 'usersCount', cell: ({ row }) => <span className="font-bold">{row.original.usersCount} users</span> },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "roleName", label: "Role Title / Name", type: "text", required: true, placeholder: "e.g. Finance Auditor" },
      { key: "description", label: "Permission Description", type: "text", required: true, placeholder: "e.g. Ledger read access and expense approvals" },
      { key: "permissionsCount", label: "Permission Scope Tier", type: "select", required: true, options: [
        { value: "All Permissions (Full)", label: "All Permissions (Full)" },
        { value: "HRM & Analytics (Read/Write)", label: "HRM & Analytics (Read/Write)" },
        { value: "Finance & POS (Read/Write)", label: "Finance & POS (Read/Write)" },
        { value: "Inventory & Purchases (Full)", label: "Inventory & Purchases (Full)" },
        { value: "Standard User (Limited)", label: "Standard User (Limited)" }
      ]},
      { key: "status", label: "Role Status", type: "select", required: true, options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" }
      ]}
    ]
  },

  system_delete_requests: {
    title: "Account Deletion & Data Privacy Requests",
    description: "Process GDPR/CCPA user data deletion requests and employee record expunges.",
    apiFetch: async () => [
      { id: "DEL-01", requestedBy: "David Miller", email: "david.m@vishvin-erp.com", reason: "Resignation & Separation Processed", requestedDate: "2026-08-14", status: "Pending" },
      { id: "DEL-02", requestedBy: "Sarah Jenkins (Old Account)", email: "sarah.j.legacy@vishvin-erp.com", reason: "Duplicate user profile cleanup", requestedDate: "2026-08-10", status: "Approved" }
    ],
    columns: [
      { id: 'id', header: 'Request ID', accessorKey: 'id', key: 'id' },
      { id: 'requestedBy', header: 'User Requester', accessorKey: 'requestedBy', key: 'requestedBy', cell: ({ row }) => <span className="font-bold">{row.original.requestedBy}</span> },
      { id: 'email', header: 'Account Email', accessorKey: 'email', key: 'email' },
      { id: 'reason', header: 'Deletion Justification', accessorKey: 'reason', key: 'reason' },
      { id: 'requestedDate', header: 'Requested Date', accessorKey: 'requestedDate', key: 'requestedDate' },
      { id: 'status', header: 'Approval Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "requestedBy", label: "User Requester Name", type: "text", required: true },
      { key: "email", label: "Account Email", type: "email", required: true },
      { key: "reason", label: "Deletion Reason", type: "text", required: true },
      { key: "status", label: "Approval Decision", type: "select", options: [
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" }
      ]}
    ]
  }
};

// Fallback/Redirect mappings to group simple list views
registryConfigs.system_roles_permissions = registryConfigs.system_roles;
registryConfigs.system_permissions = registryConfigs.system_roles;
registryConfigs.inventory_inventory = registryConfigs.inventory_products;
registryConfigs.inventory_stock = registryConfigs.inventory_products;
registryConfigs.inventory_warehouse = {
  title: "Warehouses Registry",
  description: "Track logistical storage hubs and item counts.",
  apiFetch: api.getSuppliers,
  columns: [
    { id: 'id', header: 'Hub ID', accessorKey: 'id', key: 'id' },
    { id: 'name', header: 'Warehouse Location', accessorKey: 'name', key: 'name' },
    { id: 'contact', header: 'Hub Manager', accessorKey: 'contact', key: 'contact' },
    { id: 'city', header: 'Location City', accessorKey: 'city', key: 'city' }
  ],
  formFields: [
    { key: "name", label: "Warehouse Name", type: "text", required: true },
    { key: "contact", label: "Hub Manager", type: "text" },
    { key: "city", label: "City", type: "text" }
  ]
};

registryConfigs.sales_invoice_templates = registryConfigs.sales_recurring_invoices;
registryConfigs.sales_credit_notes = registryConfigs.sales_recurring_invoices;
registryConfigs.sales_quotes = registryConfigs.sales_orders;
registryConfigs.sales_cash_sales = registryConfigs.sales_orders;
registryConfigs.sales_refunds = registryConfigs.sales_orders;
registryConfigs.sales_delivery_notes = registryConfigs.sales_orders;

registryConfigs.purchase_purchases = {
  title: "Vendor Purchases ledger",
  description: "Configure billing transactions with supply merchants.",
  apiFetch: api.getPurchases,
  columns: [
    { id: 'id', header: 'Purchase Order ID', accessorKey: 'id', key: 'id' },
    { id: 'vendor', header: 'Supply Merchant', accessorKey: 'vendor', key: 'vendor' },
    { id: 'date', header: 'Date', accessorKey: 'date', key: 'date' },
    { id: 'amount', header: 'Billing Total ($)', accessorKey: 'amount', key: 'amount', cell: ({ row }) => <span>${(row.original.amount || 0).toLocaleString()}</span> },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "vendor", label: "Vendor Name", type: "text", required: true },
    { key: "amount", label: "Order Cost ($)", type: "number", required: true }
  ]
};

registryConfigs.purchase_orders = registryConfigs.purchase_purchases;
registryConfigs.purchase_return = registryConfigs.purchase_purchases;
registryConfigs.purchase_vendors = registryConfigs.inventory_suppliers;

registryConfigs.finance_payments = registryConfigs.sales_orders;
registryConfigs.finance_cashflow = registryConfigs.finance_expenses;
registryConfigs.finance_budgeting = registryConfigs.finance_expense_category;
registryConfigs.finance_taxes = registryConfigs.finance_expense_category;

registryConfigs.hrm_departments = {
  title: "Corporate Departments",
  description: "Company division structures and employee volumes.",
  apiFetch: api.getDepartments,
  apiCreate: api.createDepartment,
  columns: [
    { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
    { id: 'name', header: 'Division Title', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span> },
    { id: 'code', header: 'Division Code', accessorKey: 'code', key: 'code' },
    { id: 'head', header: 'Manager / Division Head', accessorKey: 'head', key: 'head' },
    { id: 'employeesCount', header: 'Staff Strength', accessorKey: 'employeesCount', key: 'employeesCount' }
  ],
  formFields: [
    { key: "name", label: "Department Name", type: "text", required: true },
    { key: "code", label: "Department Code", type: "text", required: true },
    { key: "head", label: "Division Head", type: "text", required: true }
  ]
};

registryConfigs.hrm_designations = {
  title: "Corporate Designations",
  description: "Organization structural roles and operational hierarchy levels.",
  apiFetch: api.getDesignations,
  apiCreate: api.createDesignation,
  columns: [
    { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
    { id: 'title', header: 'Designation Role', accessorKey: 'title', key: 'title', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.title}</span> },
    { id: 'department', header: 'Department Domain', accessorKey: 'department', key: 'department' },
    { id: 'level', header: 'Hierarchy Grade', accessorKey: 'level', key: 'level' }
  ],
  formFields: [
    { key: "title", label: "Designation Title", type: "text", required: true },
    { key: "department", label: "Department Domain", type: "select", options: [
      { value: "Engineering", label: "Engineering" },
      { value: "Marketing", label: "Marketing" },
      { value: "Finance", label: "Finance" },
      { value: "Sales", label: "Sales" },
      { value: "HR", label: "HR" }
    ]},
    { key: "level", label: "Hierarchy Grade (e.g. L1)", type: "text", required: true }
  ]
};

registryConfigs.projects_tasks = {
  title: "Portfolio Taskboard",
  description: "Scrutinize engineering milestones, visual templates and tasks.",
  apiFetch: api.getTasks,
  apiCreate: api.createTask,
  columns: [
    { id: 'id', header: 'Task ID', accessorKey: 'id', key: 'id' },
    { id: 'title', header: 'Task Specification', accessorKey: 'title', key: 'title', cell: ({ row }) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.original.title}</span> },
    { id: 'project', header: 'Project Link', accessorKey: 'project', key: 'project' },
    { id: 'assignee', header: 'Task Owner', accessorKey: 'assignee', key: 'assignee' },
    { id: 'dueDate', header: 'Deadline Date', accessorKey: 'dueDate', key: 'dueDate' },
    { id: 'priority', header: 'Priority Alert', accessorKey: 'priority', key: 'priority', cell: ({ row }) => <Badge variant={row.original.priority === 'High' ? 'danger' : 'neutral'}>{row.original.priority}</Badge> },
    { id: 'status', header: 'Progress Stage', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "title", label: "Task Title", type: "text", required: true },
    { key: "project", label: "Associated Project", type: "select", options: [
      { value: "Vishvin ERP Core Architecture", label: "Vishvin ERP Core Architecture" },
      { value: "POS Touch Screen Interface", label: "POS Touch Screen Interface" },
      { value: "AWS Serverless Migration", label: "AWS Serverless Migration" }
    ]},
    { key: "assignee", label: "Assignee Name", type: "text", required: true },
    { key: "dueDate", label: "Deadline", type: "date", required: true },
    { key: "priority", label: "Priority", type: "select", options: [
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" }
    ]}
  ]
};

registryConfigs.projects_timesheet = {
  title: "Timesheets",
  description: "Track employee billable hours log sheets.",
  apiFetch: async () => [
    { id: "TS-01", employee: "Alex Thompson", project: "Vishvin ERP Core Architecture", hours: 40, date: "2026-08-17", status: "Approved" },
    { id: "TS-02", employee: "Emily Carter", project: "POS Touch Screen Interface", hours: 35, date: "2026-08-17", status: "Pending" }
  ],
  columns: [
    { id: 'id', header: 'TS ID', accessorKey: 'id', key: 'id' },
    { id: 'employee', header: 'Staff Member', accessorKey: 'employee', key: 'employee' },
    { id: 'project', header: 'Project Link', accessorKey: 'project', key: 'project' },
    { id: 'hours', header: 'Billable Hours', accessorKey: 'hours', key: 'hours' },
    { id: 'date', header: 'Log Date', accessorKey: 'date', key: 'date' },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "employee", label: "Employee Name", type: "text", required: true },
    { key: "hours", label: "Hours logged", type: "number", required: true }
  ]
};

registryConfigs.projects_milestones = registryConfigs.projects_tasks;
registryConfigs.projects_resource_allocation = registryConfigs.projects_timesheet;

registryConfigs.assets_assignments = registryConfigs.assets_register;
registryConfigs.assets_depreciation = {
  title: "Asset Depreciation Ledger",
  description: "Calculate straight-line and double-declining book values.",
  apiFetch: api.getAssets,
  columns: [
    { id: 'name', header: 'Asset Name', accessorKey: 'name', key: 'name' },
    { id: 'purchaseCost', header: 'Purchase Value ($)', accessorKey: 'purchaseCost', key: 'purchaseCost', cell: ({ row }) => <span>${row.original.purchaseCost}</span> },
    { id: 'salvageValue', header: 'Salvage Value ($)', accessorKey: 'salvageValue', key: 'salvageValue', cell: ({ row }) => <span>${row.original.salvageValue}</span> },
    { id: 'usefulLife', header: 'Useful Life (Years)', accessorKey: 'usefulLife', key: 'usefulLife' },
    { id: 'depreciationMethod', header: 'Method', accessorKey: 'depreciationMethod', key: 'depreciationMethod' },
    { id: 'currentValue', header: 'Current Book Value ($)', accessorKey: 'currentValue', key: 'currentValue', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-100">${row.original.currentValue}</span> }
  ]
};
registryConfigs.assets_maintenance = registryConfigs.assets_register;
registryConfigs.assets_disposal = registryConfigs.assets_register;

registryConfigs.documents_policies = registryConfigs.documents_repository;
registryConfigs.documents_compliance = registryConfigs.documents_repository;
registryConfigs.documents_workflows = registryConfigs.documents_repository;

registryConfigs.support_messages = {
  title: "Contact Messages",
  description: "Review public portal contact feedback submissions.",
  apiFetch: async () => [
    { id: 1, sender: "Tony Stark", email: "tony@stark.com", message: "Need bulk enterprise quotation for Vishvin ERP licences.", date: "2026-08-17" },
    { id: 2, sender: "Bruce Wayne", email: "bruce@wayne.com", message: "Portal integration query regarding timesheet CSV exports.", date: "2026-08-16" }
  ],
  columns: [
    { id: 'sender', header: 'Sender', accessorKey: 'sender', key: 'sender' },
    { id: 'email', header: 'Email Address', accessorKey: 'email', key: 'email' },
    { id: 'message', header: 'Message Details', accessorKey: 'message', key: 'message' },
    { id: 'date', header: 'Date', accessorKey: 'date', key: 'date' }
  ]
};

registryConfigs.support_kb = {
  title: "Knowledge Base",
  description: "Browse administrative workflows, setup guides, and manuals.",
  apiFetch: async () => [
    { id: 1, topic: "Vite Configuration Guide", category: "Development", author: "Alex Thompson", views: 245 },
    { id: 2, topic: "Payroll Tax Deductions FAQ", category: "Finance", author: "Daniel Roberts", views: 180 }
  ],
  columns: [
    { id: 'topic', header: 'FAQ Topic', accessorKey: 'topic', key: 'topic', cell: ({ row }) => <span className="font-bold text-secondary">{row.original.topic}</span> },
    { id: 'category', header: 'Category', accessorKey: 'category', key: 'category' },
    { id: 'author', header: 'Author', accessorKey: 'author', key: 'author' },
    { id: 'views', header: 'Views Count', accessorKey: 'views', key: 'views' }
  ]
};

registryConfigs.support_sla = registryConfigs.support_kb;

registryConfigs.membership_plans = {
  title: "Membership Subscription Plans",
  description: "Configure billing details and limits for corporate accounts.",
  apiFetch: api.getMembershipPlans,
  columns: [
    { id: 'name', header: 'Plan Tier', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span> },
    { id: 'price', header: 'Pricing Rate ($)', accessorKey: 'price', key: 'price', cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">${row.original.price} / {row.original.period}</span> },
    { id: 'features', header: 'Features Details', accessorKey: 'features', key: 'features', cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.features?.join(', ')}</span> },
    { id: 'activeMembers', header: 'Active Subscribers', accessorKey: 'activeMembers', key: 'activeMembers' }
  ]
};

registryConfigs.membership_addons = registryConfigs.membership_plans;
registryConfigs.membership_transactions = {
  title: "Membership Billing Transactions",
  description: "Review subscription renewals, AWS bills, and sales deposits.",
  apiFetch: api.getTransactions,
  columns: [
    { id: 'id', header: 'Transaction ID', accessorKey: 'id', key: 'id' },
    { id: 'description', header: 'Description / Line Item', accessorKey: 'description', key: 'description' },
    { id: 'amount', header: 'Net Amount ($)', accessorKey: 'amount', key: 'amount', cell: ({ row }) => (
      <span className={row.original.amount < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
        {row.original.amount < 0 ? '-' : '+'}${Math.abs(row.original.amount).toLocaleString()}
      </span>
    )},
    { id: 'date', header: 'Post Date', accessorKey: 'date', key: 'date' },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ]
};

registryConfigs.system_roles = {
  title: "Roles & Permissions Matrix",
  description: "Inspect operations access control mapping.",
  apiFetch: async () => [
    { module: "Users Account Control", admin: "View, Create, Edit, Delete", staff: "View Only", hr: "None" },
    { module: "Employees Database", admin: "View, Create, Edit, Delete", staff: "View Only", hr: "View, Create, Edit, Delete" },
    { module: "Payroll Run Processing", admin: "View, Process, Approve", staff: "None", hr: "View, Process, Approve" }
  ],
  columns: [
    { id: 'module', header: 'System Module', accessorKey: 'module', key: 'module', cell: ({ row }) => <span className="font-bold">{row.original.module}</span> },
    { id: 'admin', header: 'Admin Level', accessorKey: 'admin', key: 'admin' },
    { id: 'staff', header: 'Staff Level', accessorKey: 'staff', key: 'staff' },
    { id: 'hr', header: 'HR Level', accessorKey: 'hr', key: 'hr' }
  ]
};

registryConfigs.system_delete_requests = registryConfigs.system_users;

registryConfigs.crm_contacts = {
  title: "CRM Contacts Directory",
  description: "Manage client relations leads and stages.",
  apiFetch: api.getContacts,
  apiCreate: api.createContact,
  columns: [
    { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
    { id: 'name', header: 'Contact Person', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { id: 'company', header: 'Company Name', accessorKey: 'company', key: 'company' },
    { id: 'email', header: 'Email Address', accessorKey: 'email', key: 'email' },
    { id: 'phone', header: 'Phone', accessorKey: 'phone', key: 'phone' },
    { id: 'stage', header: 'Pipeline Stage', accessorKey: 'stage', key: 'stage', cell: ({ row }) => <StatusBadge status={row.original.stage} /> }
  ],
  formFields: [
    { key: "name", label: "Full Name", type: "text", required: true },
    { key: "company", label: "Company", type: "text", required: true },
    { key: "email", label: "Email Address", type: "email", required: true },
    { key: "phone", label: "Phone", type: "text" }
  ]
};

registryConfigs.crm_leads = registryConfigs.crm_contacts;
registryConfigs.crm_deals = registryConfigs.crm_contacts;
registryConfigs.crm_campaigns = {
  title: "Marketing Campaigns",
  description: "Configure newsletters, Google ads budgets and targets.",
  apiFetch: async () => [
    { name: "Google AdWords Q3", channel: "Search Ads", budget: 5000, conversion: "3.4%", status: "Active" },
    { name: "SaaS Product Newsletter", channel: "Email", budget: 1200, conversion: "12.8%", status: "Completed" }
  ],
  columns: [
    { id: 'name', header: 'Campaign Title', accessorKey: 'name', key: 'name' },
    { id: 'channel', header: 'Platform Channel', accessorKey: 'channel', key: 'channel' },
    { id: 'budget', header: 'Budget Limit ($)', accessorKey: 'budget', key: 'budget', cell: ({ row }) => <span>${row.original.budget}</span> },
    { id: 'conversion', header: 'Conversion Rate', accessorKey: 'conversion', key: 'conversion' },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "name", label: "Campaign Name", type: "text", required: true },
    { key: "channel", label: "Channel Platform", type: "text" },
    { key: "budget", label: "Budget ($)", type: "number", required: true }
  ]
};

registryConfigs.crm_feedback = {
  title: "Customer Feedback Log",
  description: "Browse surveys and customer satisfaction levels.",
  apiFetch: async () => [
    { client: "Stark Industries", score: "9/10", remarks: "Great cloud ERP portal.", date: "2026-08-15" },
    { client: "Wayne Enterprises", score: "8/10", remarks: "Solid uptime, would like CSV custom exports.", date: "2026-08-16" }
  ],
  columns: [
    { id: 'client', header: 'Client', accessorKey: 'client', key: 'client', cell: ({ row }) => <span className="font-bold">{row.original.client}</span> },
    { id: 'score', header: 'NPS Score', accessorKey: 'score', key: 'score', cell: ({ row }) => <Badge variant="success">{row.original.score}</Badge> },
    { id: 'remarks', header: 'Survey Feedback Remarks', accessorKey: 'remarks', key: 'remarks' },
    { id: 'date', header: 'Date', accessorKey: 'date', key: 'date' }
  ]
};

// ==========================================
// ADDITIONAL HRM MODULE CONFIGURATIONS
// ==========================================
registryConfigs.hrm_holidays = {
  title: "Public & Corporate Holidays",
  description: "Configure annual holiday calendar, operational shutdowns, and optional holidays.",
  apiFetch: async () => [
    { id: "HOL-01", name: "New Year's Day", date: "2026-01-01", day: "Thursday", type: "National Holiday", status: "Past" },
    { id: "HOL-02", name: "Labor Day", date: "2026-05-01", day: "Friday", type: "Public Holiday", status: "Past" },
    { id: "HOL-03", name: "Independence Day", date: "2026-07-04", day: "Saturday", type: "National Holiday", status: "Past" },
    { id: "HOL-04", name: "Thanksgiving Day", date: "2026-11-26", day: "Thursday", type: "Public Holiday", status: "Upcoming" },
    { id: "HOL-05", name: "Christmas Day", date: "2026-12-25", day: "Friday", type: "National Holiday", status: "Upcoming" }
  ],
  columns: [
    { id: 'id', header: 'Holiday ID', accessorKey: 'id', key: 'id' },
    { id: 'name', header: 'Holiday Occasion', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span> },
    { id: 'date', header: 'Date', accessorKey: 'date', key: 'date' },
    { id: 'day', header: 'Day of Week', accessorKey: 'day', key: 'day' },
    { id: 'type', header: 'Holiday Type', accessorKey: 'type', key: 'type', cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge> },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "name", label: "Holiday Title", type: "text", required: true },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "type", label: "Holiday Type", type: "select", options: [
      { value: "National Holiday", label: "National Holiday" },
      { value: "Public Holiday", label: "Public Holiday" },
      { value: "Optional Holiday", label: "Optional Holiday" }
    ]}
  ]
};

registryConfigs.hrm_payroll = {
  title: "Payroll Management",
  description: "Review monthly payroll batches, disbursement schedules, and net salary distributions.",
  apiFetch: async () => [
    { id: "PAY-2026-08", month: "August 2026", employeesCount: 1284, totalAmount: 1248000, payDate: "2026-08-31", status: "Processing" },
    { id: "PAY-2026-07", month: "July 2026", employeesCount: 1272, totalAmount: 1230000, payDate: "2026-07-31", status: "Paid" },
    { id: "PAY-2026-06", month: "June 2026", employeesCount: 1260, totalAmount: 1215000, payDate: "2026-06-30", status: "Paid" },
    { id: "PAY-2026-05", month: "May 2026", employeesCount: 1245, totalAmount: 1198000, payDate: "2026-05-31", status: "Paid" }
  ],
  columns: [
    { id: 'id', header: 'Batch ID', accessorKey: 'id', key: 'id' },
    { id: 'month', header: 'Pay Period', accessorKey: 'month', key: 'month', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.month}</span> },
    { id: 'employeesCount', header: 'Staff Count', accessorKey: 'employeesCount', key: 'employeesCount' },
    { id: 'totalAmount', header: 'Disbursement Total ($)', accessorKey: 'totalAmount', key: 'totalAmount', cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">${(row.original.totalAmount || 0).toLocaleString()}</span> },
    { id: 'payDate', header: 'Disbursement Date', accessorKey: 'payDate', key: 'payDate' },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "month", label: "Pay Period Month", type: "text", required: true, placeholder: "e.g. September 2026" },
    { key: "payDate", label: "Disbursement Date", type: "date", required: true },
    { key: "totalAmount", label: "Estimated Batch Budget ($)", type: "number", required: true }
  ]
};

registryConfigs.hrm_recruitment = {
  title: "Recruitment & Job Openings",
  description: "Track candidate pipelines, job vacancies, and active interview rounds.",
  apiFetch: async () => [
    { id: "JOB-01", title: "Senior iOS Developer", department: "Engineering", vacancies: 2, applicants: 47, stage: "Interview", status: "Active" },
    { id: "JOB-02", title: "Junior PHP Developer", department: "Engineering", vacancies: 3, applicants: 28, stage: "Screening", status: "Active" },
    { id: "JOB-03", title: "Lead Product Designer", department: "Design", vacancies: 1, applicants: 34, stage: "Shortlist", status: "Active" },
    { id: "JOB-04", title: "Financial Analyst", department: "Finance", vacancies: 1, applicants: 19, stage: "Offer Released", status: "Pending" }
  ],
  columns: [
    { id: 'id', header: 'Job ID', accessorKey: 'id', key: 'id' },
    { id: 'title', header: 'Designation Role', accessorKey: 'title', key: 'title', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.title}</span> },
    { id: 'department', header: 'Department', accessorKey: 'department', key: 'department' },
    { id: 'vacancies', header: 'Openings', accessorKey: 'vacancies', key: 'vacancies' },
    { id: 'applicants', header: 'Applicants', accessorKey: 'applicants', key: 'applicants', cell: ({ row }) => <span className="font-bold text-secondary">{row.original.applicants}</span> },
    { id: 'stage', header: 'Current Phase', accessorKey: 'stage', key: 'stage', cell: ({ row }) => <Badge variant="primary">{row.original.stage}</Badge> },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "title", label: "Job Title", type: "text", required: true },
    { key: "department", label: "Department", type: "select", options: [
      { value: "Engineering", label: "Engineering" },
      { value: "Design", label: "Design" },
      { value: "Marketing", label: "Marketing" },
      { value: "Finance", label: "Finance" },
      { value: "HR", label: "HR" }
    ]},
    { key: "vacancies", label: "Number of Openings", type: "number", required: true }
  ]
};

registryConfigs.hrm_performance = {
  title: "Performance & Appraisal Review",
  description: "Quarterly performance reviews, employee appraisal ratings, and KPI targets.",
  apiFetch: async () => [
    { id: "APP-01", employee: "Alex Thompson", designation: "Senior Developer", cycle: "Q2 2026", rating: "4.8 / 5.0", status: "Approved", reviewer: "Andrew Admin" },
    { id: "APP-02", employee: "Maria Garcia", designation: "UX Designer", cycle: "Q2 2026", rating: "4.6 / 5.0", status: "Approved", reviewer: "Linda Watson" },
    { id: "APP-03", employee: "Evelyn Hayes", designation: "Product Manager", cycle: "Q2 2026", rating: "4.9 / 5.0", status: "Approved", reviewer: "Andrew Admin" },
    { id: "APP-04", employee: "Daniel Roberts", designation: "Graphic Designer", cycle: "Q2 2026", rating: "4.3 / 5.0", status: "Pending", reviewer: "Linda Watson" }
  ],
  columns: [
    { id: 'id', header: 'Review ID', accessorKey: 'id', key: 'id' },
    { id: 'employee', header: 'Staff Member', accessorKey: 'employee', key: 'employee', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.employee}</span> },
    { id: 'designation', header: 'Role', accessorKey: 'designation', key: 'designation' },
    { id: 'cycle', header: 'Review Cycle', accessorKey: 'cycle', key: 'cycle' },
    { id: 'rating', header: 'Score Rating', accessorKey: 'rating', key: 'rating', cell: ({ row }) => <span className="font-bold text-emerald-500">{row.original.rating}</span> },
    { id: 'reviewer', header: 'Appraiser', accessorKey: 'reviewer', key: 'reviewer' },
    { id: 'status', header: 'Appraisal Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "employee", label: "Employee Name", type: "text", required: true },
    { key: "cycle", label: "Review Period (e.g. Q3 2026)", type: "text", required: true },
    { key: "rating", label: "Appraisal Score (1-5)", type: "number", required: true }
  ]
};

registryConfigs.hrm_training = {
  title: "Training & Skill Development",
  description: "Corporate training programs, skill workshops, and certification enrollments.",
  apiFetch: async () => [
    { id: "TRN-01", title: "Enterprise React 19 & Architecture", trainer: "Alex Thompson", enrolled: 18, completion: "92%", duration: "4 Weeks", status: "Active" },
    { id: "TRN-02", title: "Cybersecurity & Data Privacy (GDPR)", trainer: "External Specialist", enrolled: 45, completion: "100%", duration: "1 Week", status: "Completed" },
    { id: "TRN-03", title: "Agile Scrum Leadership", trainer: "Evelyn Hayes", enrolled: 12, completion: "65%", duration: "2 Weeks", status: "Active" },
    { id: "TRN-04", title: "Financial Modeling & Forecasting", trainer: "Daniel Roberts", enrolled: 8, completion: "30%", duration: "3 Weeks", status: "Active" }
  ],
  columns: [
    { id: 'id', header: 'Course ID', accessorKey: 'id', key: 'id' },
    { id: 'title', header: 'Course Program', accessorKey: 'title', key: 'title', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.title}</span> },
    { id: 'trainer', header: 'Instructor', accessorKey: 'trainer', key: 'trainer' },
    { id: 'enrolled', header: 'Enrolled Staff', accessorKey: 'enrolled', key: 'enrolled' },
    { id: 'completion', header: 'Avg Completion', accessorKey: 'completion', key: 'completion', cell: ({ row }) => <span className="font-bold text-secondary">{row.original.completion}</span> },
    { id: 'duration', header: 'Program Length', accessorKey: 'duration', key: 'duration' },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "title", label: "Course Name", type: "text", required: true },
    { key: "trainer", label: "Trainer / Instructor", type: "text", required: true },
    { key: "duration", label: "Duration", type: "text", required: true }
  ]
};

// ==========================================
// ADDITIONAL POS MODULE CONFIGURATIONS
// ==========================================
registryConfigs.pos_orders = {
  title: "POS Register Orders",
  description: "Track retail checkout receipts, payment modes, and cashier transactions.",
  apiFetch: async () => [
    { id: "POS-9801", cashier: "Andrew Admin", date: "2026-08-17 14:22", itemsCount: 3, total: 2497.00, method: "Credit Card", status: "Paid" },
    { id: "POS-9802", cashier: "Andrew Admin", date: "2026-08-17 13:45", itemsCount: 1, total: 399.00, method: "Cash", status: "Paid" },
    { id: "POS-9803", cashier: "Linda Watson", date: "2026-08-17 12:10", itemsCount: 5, total: 1199.00, method: "Digital Wallet", status: "Paid" },
    { id: "POS-9804", cashier: "Andrew Admin", date: "2026-08-17 11:30", itemsCount: 2, total: 198.00, method: "Credit Card", status: "Refunded" }
  ],
  columns: [
    { id: 'id', header: 'Receipt ID', accessorKey: 'id', key: 'id' },
    { id: 'cashier', header: 'Cashier', accessorKey: 'cashier', key: 'cashier' },
    { id: 'date', header: 'Timestamp', accessorKey: 'date', key: 'date' },
    { id: 'itemsCount', header: 'Items Sold', accessorKey: 'itemsCount', key: 'itemsCount' },
    { id: 'total', header: 'Order Total ($)', accessorKey: 'total', key: 'total', cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">${(row.original.total || 0).toLocaleString()}</span> },
    { id: 'method', header: 'Payment Method', accessorKey: 'method', key: 'method' },
    { id: 'status', header: 'Order Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "cashier", label: "Cashier Name", type: "text", required: true },
    { key: "total", label: "Amount ($)", type: "number", required: true }
  ]
};

registryConfigs.pos_barcode = {
  title: "Barcode Printing & Generation",
  description: "Generate Code-128 and EAN-13 barcode labels for inventory products.",
  apiFetch: async () => [
    { sku: "IPH15PM-256-GR", name: "iPhone 15 Pro Max", format: "Code-128", printCopies: 50, status: "Ready" },
    { sku: "MBP16M3M-48-1T", name: "MacBook Pro 16 M3 Max", format: "Code-128", printCopies: 20, status: "Ready" },
    { sku: "SAMS24U-512-TI", name: "Samsung Galaxy S24 Ultra", format: "EAN-13", printCopies: 35, status: "Ready" },
    { sku: "SONY-WHXM5-B", name: "Sony WH-1000XM5", format: "Code-128", printCopies: 100, status: "Ready" }
  ],
  columns: [
    { id: 'sku', header: 'Product SKU', accessorKey: 'sku', key: 'sku' },
    { id: 'name', header: 'Product Name', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span> },
    { id: 'format', header: 'Barcode Symbology', accessorKey: 'format', key: 'format', cell: ({ row }) => <Badge variant="secondary">{row.original.format}</Badge> },
    { id: 'printCopies', header: 'Batch Print Quantity', accessorKey: 'printCopies', key: 'printCopies' },
    { id: 'status', header: 'Label Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "sku", label: "Product SKU", type: "text", required: true },
    { key: "format", label: "Barcode Format", type: "select", options: [
      { value: "Code-128", label: "Code-128 (Standard)" },
      { value: "EAN-13", label: "EAN-13 (Retail)" },
      { value: "UPC-A", label: "UPC-A" }
    ]},
    { key: "printCopies", label: "Copies to Print", type: "number", required: true }
  ]
};

registryConfigs.pos_qrcode = {
  title: "QR Code Printing & Digital Catalogs",
  description: "Manage product quick-scan landing URLs and digital shelf labels.",
  apiFetch: async () => [
    { sku: "IPH15PM-256-GR", name: "iPhone 15 Pro Max", qrUrl: "https://vishvin-erp.com/products/IPH15PM", scans: 342, status: "Active" },
    { sku: "MBP16M3M-48-1T", name: "MacBook Pro 16 M3 Max", qrUrl: "https://vishvin-erp.com/products/MBP16M3M", scans: 198, status: "Active" },
    { sku: "SAMS24U-512-TI", name: "Samsung Galaxy S24 Ultra", qrUrl: "https://vishvin-erp.com/products/SAMS24U", scans: 254, status: "Active" }
  ],
  columns: [
    { id: 'sku', header: 'Product SKU', accessorKey: 'sku', key: 'sku' },
    { id: 'name', header: 'Product Name', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span> },
    { id: 'qrUrl', header: 'Target QR URL', accessorKey: 'qrUrl', key: 'qrUrl', cell: ({ row }) => <span className="text-secondary font-medium">{row.original.qrUrl}</span> },
    { id: 'scans', header: 'Total Scans', accessorKey: 'scans', key: 'scans' },
    { id: 'status', header: 'QR Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "sku", label: "Product SKU", type: "text", required: true },
    { key: "qrUrl", label: "Target Destination URL", type: "text", required: true }
  ]
};

registryConfigs.pos_settings = {
  title: "POS Terminal & Hardware Settings",
  description: "Configure receipt thermal printers, barcode scanners, and cash drawers.",
  apiFetch: async () => [
    { terminalId: "TERM-01", station: "Main Floor Terminal", printer: "Epson TM-T88VI (USB)", drawer: "Auto-Kick Enabled", taxRate: "8.5%", status: "Online" },
    { terminalId: "TERM-02", station: "Express Checkout Lane", printer: "Star Micronics TSP143 (Ethernet)", drawer: "Auto-Kick Enabled", taxRate: "8.5%", status: "Online" },
    { terminalId: "TERM-03", station: "Mobile Tablet POS", printer: "Bluetooth Thermal 58mm", drawer: "Manual", taxRate: "8.5%", status: "Offline" }
  ],
  columns: [
    { id: 'terminalId', header: 'Terminal ID', accessorKey: 'terminalId', key: 'terminalId' },
    { id: 'station', header: 'Register Station', accessorKey: 'station', key: 'station', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.station}</span> },
    { id: 'printer', header: 'Thermal Printer Device', accessorKey: 'printer', key: 'printer' },
    { id: 'drawer', header: 'Cash Drawer Protocol', accessorKey: 'drawer', key: 'drawer' },
    { id: 'taxRate', header: 'Sales Tax Rate', accessorKey: 'taxRate', key: 'taxRate' },
    { id: 'status', header: 'Connection', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "terminalId", label: "Terminal Identifier", type: "text", required: true },
    { key: "station", label: "Station Name", type: "text", required: true },
    { key: "printer", label: "Thermal Printer Model", type: "text", required: true }
  ]
};

// ==========================================
// FINANCE FINANCIAL REPORTS
// ==========================================
registryConfigs.finance_reports = {
  title: "Financial Statements & Ledgers",
  description: "Comprehensive financial accounting statements, revenue balance audits, and ledger metrics.",
  apiFetch: async () => [
    { id: "REP-01", reportName: "Profit & Loss Statement (P&L)", period: "Q2 2026", auditor: "Daniel Roberts", netTotal: "$168,000", status: "Audited", path: "/finance/reports/profit-loss" },
    { id: "REP-02", reportName: "Consolidated Balance Sheet", period: "Q2 2026", auditor: "Daniel Roberts", netTotal: "$1,060,000", status: "Audited", path: "/finance/reports/balance-sheet" },
    { id: "REP-03", reportName: "Cashflow Reconciliation", period: "Monthly (July)", auditor: "Linda Watson", netTotal: "$485,000", status: "Audited", path: "/finance/cashflow" }
  ],
  columns: [
    { id: 'id', header: 'Report ID', accessorKey: 'id', key: 'id' },
    { id: 'reportName', header: 'Financial Statement Title', accessorKey: 'reportName', key: 'reportName', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.reportName}</span> },
    { id: 'period', header: 'Accounting Period', accessorKey: 'period', key: 'period' },
    { id: 'auditor', header: 'Audited By', accessorKey: 'auditor', key: 'auditor' },
    { id: 'netTotal', header: 'Net Balance ($)', accessorKey: 'netTotal', key: 'netTotal', cell: ({ row }) => <span className="font-bold text-teal-600 dark:text-teal-400">{row.original.netTotal}</span> },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: []
};

registryConfigs.finance_reports_profit_loss = {
  title: "Profit & Loss Financial Statement",
  description: "Quarterly income breakdown, cost of goods sold, operating expenses, and net profit margins.",
  apiFetch: async () => [
    { category: "Gross Sales & Service Revenue", q1: "$420,000", q2: "$485,000", q3: "$520,000", ytd: "$1,425,000", type: "Revenue" },
    { category: "Cost of Goods Sold (COGS)", q1: "$180,000", q2: "$205,000", q3: "$220,000", ytd: "$605,000", type: "Expense" },
    { category: "Operational Expenses (OpEx)", q1: "$95,000", q2: "$102,000", q3: "$110,000", ytd: "$307,000", type: "Expense" },
    { category: "Payroll & Salaries", q1: "$110,000", q2: "$115,000", q3: "$120,000", ytd: "$345,000", type: "Expense" },
    { category: "Net Operating Income (EBITDA)", q1: "$35,000", q2: "$63,000", q3: "$70,000", ytd: "$168,000", type: "Profit" }
  ],
  columns: [
    { id: 'category', header: 'Accounting Line Item', accessorKey: 'category', key: 'category', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.category}</span> },
    { id: 'q1', header: 'Q1 Results', accessorKey: 'q1', key: 'q1' },
    { id: 'q2', header: 'Q2 Results', accessorKey: 'q2', key: 'q2' },
    { id: 'q3', header: 'Q3 Results', accessorKey: 'q3', key: 'q3' },
    { id: 'ytd', header: 'YTD Cumulative Total', accessorKey: 'ytd', key: 'ytd', cell: ({ row }) => <span className="font-bold text-teal-600 dark:text-teal-400">{row.original.ytd}</span> }
  ],
  formFields: []
};

registryConfigs.finance_reports_balance_sheet = {
  title: "Balance Sheet & Solvency Ledger",
  description: "Audit current assets, capital property, liabilities, and retained shareholder equity.",
  apiFetch: async () => [
    { item: "Cash & Cash Equivalents", category: "Current Assets", bookValue: "$480,000", status: "Audited" },
    { item: "Accounts Receivable", category: "Current Assets", bookValue: "$210,000", status: "Audited" },
    { item: "Inventory Goods at Cost", category: "Current Assets", bookValue: "$340,000", status: "Audited" },
    { item: "Hardware & Office Equipment", category: "Non-Current Assets", bookValue: "$125,000", status: "Audited" },
    { item: "Accounts Payable", category: "Current Liabilities", bookValue: "$95,000", status: "Audited" },
    { item: "Retained Shareholder Equity", category: "Equity", bookValue: "$1,060,000", status: "Audited" }
  ],
  columns: [
    { id: 'item', header: 'Asset / Liability Item', accessorKey: 'item', key: 'item', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.item}</span> },
    { id: 'category', header: 'Accounting Classification', accessorKey: 'category', key: 'category', cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge> },
    { id: 'bookValue', header: 'Audited Value ($)', accessorKey: 'bookValue', key: 'bookValue', cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.bookValue}</span> },
    { id: 'status', header: 'Audit Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: []
};

// ==========================================
// SYSTEM ADMINISTRATION SETTINGS
// ==========================================
registryConfigs.system_settings = {
  title: "System & Core Settings",
  description: "Configure high-level ERP parameters, security policies, and administrative credentials.",
  apiFetch: async () => [
    { key: "System Environment", value: "Production Cloud (v2.6.4)", category: "Core", status: "Active" },
    { key: "API Gateway Protocol", value: "HTTPS / REST JSON", category: "Network", status: "Active" },
    { key: "Database Engine", value: "In-Memory Browser DB (LocalStorage Encrypted)", category: "Storage", status: "Active" },
    { key: "Session Idle Timeout", value: "30 Minutes", category: "Security", status: "Active" },
    { key: "Two-Factor Authentication", value: "Enforced for Admin Roles", category: "Security", status: "Active" }
  ],
  columns: [
    { id: 'key', header: 'Configuration Parameter', accessorKey: 'key', key: 'key', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.key}</span> },
    { id: 'value', header: 'Configured Value', accessorKey: 'value', key: 'value', cell: ({ row }) => <span className="font-medium text-secondary">{row.original.value}</span> },
    { id: 'category', header: 'Category', accessorKey: 'category', key: 'category' },
    { id: 'status', header: 'Operational Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "key", label: "Parameter Key", type: "text", required: true },
    { key: "value", label: "Parameter Value", type: "text", required: true }
  ]
};

registryConfigs.system_settings_company = {
  title: "Company & Organization Profile",
  description: "Manage legal entity registration details, branding logos, tax IDs, and official addresses.",
  apiFetch: async () => [
    { field: "Legal Business Entity", value: "Falcon LLP / Vishvin International Inc.", lastUpdated: "2026-08-01" },
    { field: "Corporate Tax Registration (EIN/VAT)", value: "US-98421048-TX", lastUpdated: "2026-08-01" },
    { field: "Official Headquarters", value: "100 Innovation Way, Suite 400, Austin, TX 78701", lastUpdated: "2026-08-01" },
    { field: "Primary Operations Email", value: "admin@vishvin-erp.com", lastUpdated: "2026-08-10" },
    { field: "Customer Support Hotline", value: "+1 (800) 555-0199", lastUpdated: "2026-08-10" }
  ],
  columns: [
    { id: 'field', header: 'Organization Attribute', accessorKey: 'field', key: 'field', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.field}</span> },
    { id: 'value', header: 'Registered Corporate Value', accessorKey: 'value', key: 'value', cell: ({ row }) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.original.value}</span> },
    { id: 'lastUpdated', header: 'Last Modified', accessorKey: 'lastUpdated', key: 'lastUpdated' }
  ],
  formFields: [
    { key: "field", label: "Profile Field", type: "text", required: true },
    { key: "value", label: "Profile Value", type: "text", required: true }
  ]
};

registryConfigs.system_settings_localization = {
  title: "Localization & Regional Formatting",
  description: "Configure default time zones, currency symbols, and datetime formats.",
  apiFetch: async () => [
    { setting: "Default Display Language", current: "English (United States - EN-US)", options: "EN, ES, FR, DE", status: "Active" },
    { setting: "Operational Time Zone", current: "America/Chicago (CST / UTC-6)", options: "UTC, EST, CST, PST, GMT, IST", status: "Active" },
    { setting: "Primary Base Currency", current: "USD ($ - United States Dollar)", options: "USD, EUR, GBP, JPY, CAD", status: "Active" },
    { setting: "Standard Date Presentation", current: "YYYY-MM-DD (2026-08-18)", options: "YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY", status: "Active" },
    { setting: "Financial Decimal Precision", current: "2 Decimals ($1,248.00)", options: "0, 2, 4 Decimals", status: "Active" }
  ],
  columns: [
    { id: 'setting', header: 'Localization Setting', accessorKey: 'setting', key: 'setting', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.setting}</span> },
    { id: 'current', header: 'Current Active Value', accessorKey: 'current', key: 'current', cell: ({ row }) => <span className="font-bold text-secondary">{row.original.current}</span> },
    { id: 'options', header: 'Supported Formats', accessorKey: 'options', key: 'options' },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "setting", label: "Setting Name", type: "text", required: true },
    { key: "current", label: "Active Format Value", type: "text", required: true }
  ]
};

registryConfigs.system_settings_notifications = {
  title: "Notification Gateways & Dispatch Channels",
  description: "Configure system alerts, automated SMTP mail relays, SMS gateways, and webhook notifications.",
  apiFetch: async () => [
    { channel: "SMTP Outbound Email Relay", provider: "SendGrid / AWS SES", trigger: "Leave Approvals, Payslip Dispatch, Invoices", status: "Connected" },
    { channel: "SMS Gateway Integration", provider: "Twilio API", trigger: "2FA Login OTP, Critical Server Alerts", status: "Connected" },
    { channel: "In-App Floating Toasts", provider: "Zustand Toast Dispatcher", trigger: "All User Actions & CRUD Updates", status: "Connected" },
    { channel: "Slack Operations Webhook", provider: "Slack Bot Webhook", trigger: "New Sales Orders > $5,000", status: "Connected" }
  ],
  columns: [
    { id: 'channel', header: 'Notification Channel', accessorKey: 'channel', key: 'channel', cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.channel}</span> },
    { id: 'provider', header: 'Service Provider / Gateway', accessorKey: 'provider', key: 'provider' },
    { id: 'trigger', header: 'Event Dispatch Trigger', accessorKey: 'trigger', key: 'trigger' },
    { id: 'status', header: 'Gateway Health', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ],
  formFields: [
    { key: "channel", label: "Gateway Channel", type: "text", required: true },
    { key: "provider", label: "Provider Service", type: "text", required: true }
  ]
};

registryConfigs.master_designations = registryConfigs.hrm_designations;
