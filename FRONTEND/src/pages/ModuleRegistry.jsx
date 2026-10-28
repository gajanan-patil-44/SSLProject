// src/pages/ModuleRegistry.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { DynamicListPage, DynamicFormPage } from '../components/ui/DynamicPageEngine';
import { api } from '../services/api';
import { useERPStore } from '../store/useERPStore';
import { Button, StatusBadge, Card, StatCard } from '../components/ui/index';
import { Modal } from '../components/ui/Modal';
import { CalendarRange, Coins, TrendingUp, Wallet } from 'lucide-react';
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
                <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
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

export const registryConfigs = {
  // 1. Companies Master
  master_companies: {
    title: "Companies",
    description: "Manage registered companies in the system.",
    apiFetch: async () => {
      const res = await api.company.getCompanies();
      const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return items.map((c, idx) => {
        const isDisabled = c.IsDisabled === true || c.status === 'Inactive' || c.status === 'Disabled';
        const isEnabled = !isDisabled;
        const createdOnDate = c.CreatedOn || c.CreatedAt || c.createdOn;
        let formattedDate = '—';
        if (createdOnDate) {
          try {
            const d = new Date(createdOnDate);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            }
          } catch { }
        }
        return {
          id: c.CompanyId ?? (idx + 1),
          CompanyId: c.CompanyId ?? (idx + 1),
          companyCode: c.CompanyCode || c.companyCode || '',
          CompanyCode: c.CompanyCode || c.companyCode || '',
          companyName: c.CompanyName || c.companyName || '',
          CompanyName: c.CompanyName || c.companyName || '',
          email: c.Email || c.email || '—',
          Email: c.Email || c.email || '',
          phone: c.PhoneNumber || c.phone || '—',
          PhoneNumber: c.PhoneNumber || c.phone || '',
          address: c.Address || c.address || '—',
          Address: c.Address || c.address || '',
          requestUserName: c.RequestUserName || c.CreatedByUserName || '—',
          status: isDisabled ? "Inactive" : "Active",
          IsDisabled: Boolean(isDisabled),
          isEnabled: isEnabled,
          createdOn: formattedDate,
          CreatedOn: createdOnDate,
          raw: c
        };
      });
    },
    apiCreate: async (formData) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';

      const payload = {
        flagId: 2,
        CompanyName: formData.CompanyName || formData.companyName || '',
        CompanyCode: formData.CompanyCode || formData.companyCode || '',
        CreatedByUserName: userName,
        UpdatedByUserName: userName,
        IsDisabled: false,
        Email: formData.Email || formData.email || '',
        PhoneNumber: formData.PhoneNumber || formData.phone || '',
        Address: formData.Address || formData.address || ''
      };

      return await api.company.addCompany(payload);
    },
    apiUpdate: async (formData) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';
      const companyId = Number(formData.CompanyId ?? formData.id);

      const payload = {
        flagId: 3,
        CompanyId: companyId,
        CompanyName: formData.CompanyName || formData.companyName || '',
        CompanyCode: formData.CompanyCode || formData.companyCode || '',
        UpdatedByUserName: userName,
        Email: formData.Email || formData.email || '',
        PhoneNumber: formData.PhoneNumber || formData.phone || '',
        Address: formData.Address || formData.address || ''
      };

      return await api.company.updateCompany(payload);
    },
    apiToggleStatus: async (record, newIsDisabled) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';
      const companyId = Number(record.CompanyId ?? record.id);

      const statusPayload = {
        flagId: 4,
        CompanyId: companyId,
        IsDisabled: Boolean(newIsDisabled),
        UpdatedByUserName: userName
      };
      return await api.company.toggleCompanyStatus(statusPayload);
    },
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'companyCode', header: 'Company Code', accessorKey: 'companyCode', key: 'companyCode', cell: ({ row }) => <span className="font-semibold text-primary">{row.original.companyCode}</span> },
      { id: 'companyName', header: 'Company Name', accessorKey: 'companyName', key: 'companyName', cell: ({ row }) => <span className="font-bold">{row.original.companyName}</span> },
      { id: 'email', header: 'Email', accessorKey: 'email', key: 'email' },
      { id: 'phone', header: 'Phone Number', accessorKey: 'phone', key: 'phone' },
      { id: 'address', header: 'Address', accessorKey: 'address', key: 'address' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "CompanyCode", label: "Company Code", type: "text", required: true, placeholder: "e.g. GSL" },
      { key: "CompanyName", label: "Company Name", type: "text", required: true, placeholder: "e.g. Global Solutions" },
      { key: "Email", label: "Email", type: "email", placeholder: "e.g. contact@globalsolutions.com" },
      { key: "PhoneNumber", label: "Phone Number", type: "text", placeholder: "e.g. 9876543210" },
      { key: "Address", label: "Address", type: "textarea", placeholder: "e.g. Hyderabad, Telangana" }
    ],
    addFormFields: [
      { key: "CompanyCode", label: "Company Code", type: "text", required: true, placeholder: "e.g. GSL" },
      { key: "CompanyName", label: "Company Name", type: "text", required: true, placeholder: "e.g. Global Solutions" },
      { key: "Email", label: "Email", type: "email", placeholder: "e.g. contact@globalsolutions.com" },
      { key: "PhoneNumber", label: "Phone Number", type: "text", placeholder: "e.g. 9876543210" },
      { key: "Address", label: "Address", type: "textarea", placeholder: "e.g. Hyderabad, Telangana" }
    ],
    editFormFields: [
      { key: "CompanyCode", label: "Company Code", type: "text", required: true, placeholder: "e.g. GSL" },
      { key: "CompanyName", label: "Company Name", type: "text", required: true, placeholder: "e.g. Global Solutions" },
      { key: "Email", label: "Email", type: "email", placeholder: "e.g. contact@globalsolutions.com" },
      { key: "PhoneNumber", label: "Phone Number", type: "text", placeholder: "e.g. 9876543210" },
      { key: "Address", label: "Address", type: "textarea", placeholder: "e.g. Hyderabad, Telangana" }
    ]
  },

  // 2. Products Master
  master_products: {
    title: "Products",
    description: "Manage registered products in the system.",
    apiFetch: async () => {
      const res = await api.product.getProducts();
      const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return items.map((p) => {
        const isDisabled = p.IsDisabled === true || p.status === 'Inactive' || p.status === 'Disabled';
        const isEnabled = !isDisabled;
        return {
          id: p.ProductId ?? p.id,
          ProductId: p.ProductId ?? p.id,
          ProductCode: p.ProductCode || p.productCode || '',
          ProductName: p.ProductName || p.productName || '',
          ProductDescription: p.Description || p.description || p.ProductDescription || '',
          productCode: p.ProductCode || p.productCode || '',
          productName: p.ProductName || p.productName || '',
          description: p.Description || p.description || p.ProductDescription || '',
          status: isDisabled ? "Inactive" : "Active",
          IsDisabled: Boolean(isDisabled),
          isEnabled: isEnabled,
          raw: p
        };
      });
    },
    apiCreate: async (formData) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';

      const payload = {
        flagId: 2,
        ProductCode: formData.ProductCode || formData.productCode || '',
        ProductName: formData.ProductName || formData.productName || '',
        ProductDescription: formData.ProductDescription || formData.description || formData.Description || '',
        IsDisabled: false,
        CreatedByUserName: userName,
        UpdatedByUserName: userName
      };

      return await api.product.addProduct(payload);
    },
    apiUpdate: async (formData) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';
      const productId = Number(formData.ProductId ?? formData.id);

      const updatePayload = {
        flagId: 3,
        ProductId: productId,
        ProductCode: formData.ProductCode || formData.productCode || '',
        ProductName: formData.ProductName || formData.productName || '',
        ProductDescription: formData.ProductDescription || formData.description || formData.Description || '',
        UpdatedByUserName: userName
      };
      return await api.product.updateProduct(updatePayload);
    },
    apiToggleStatus: async (record, newIsDisabled) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';
      const productId = Number(record.ProductId ?? record.id);

      const statusPayload = {
        flagId: 4,
        ProductId: productId,
        IsDisabled: Boolean(newIsDisabled),
        UpdatedByUserName: userName
      };
      return await api.product.toggleProductStatus(statusPayload);
    },
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'productCode', header: 'Product Code', accessorKey: 'productCode', key: 'productCode', cell: ({ row }) => <span className="font-semibold text-primary">{row.original.productCode}</span> },
      { id: 'productName', header: 'Product Name', accessorKey: 'productName', key: 'productName', cell: ({ row }) => <span className="font-bold">{row.original.productName}</span> },
      { id: 'description', header: 'Description', accessorKey: 'description', key: 'description' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "ProductCode", label: "Product Code", type: "text", required: true, placeholder: "e.g. ERP-CORE" },
      { key: "ProductName", label: "Product Name", type: "text", required: true, placeholder: "e.g. Vishvin ERP Core Suite" },
      { key: "ProductDescription", label: "Description", type: "textarea", placeholder: "e.g. Enterprise Operations Engine" }
    ],
    addFormFields: [
      { key: "ProductCode", label: "Product Code", type: "text", required: true, placeholder: "e.g. ERP-CORE" },
      { key: "ProductName", label: "Product Name", type: "text", required: true, placeholder: "e.g. Vishvin ERP Core Suite" },
      { key: "ProductDescription", label: "Description", type: "textarea", placeholder: "e.g. Enterprise Operations Engine" }
    ],
    editFormFields: [
      { key: "ProductCode", label: "Product Code", type: "text", required: true, placeholder: "e.g. ERP-CORE" },
      { key: "ProductName", label: "Product Name", type: "text", required: true, placeholder: "e.g. Vishvin ERP Core Suite" },
      { key: "ProductDescription", label: "Description", type: "textarea", placeholder: "e.g. Enterprise Operations Engine" }
    ]
  },

  // 3. Company Products Master
  master_company_products: {
    title: "Company Products",
    description: "Manage registered company products and software assignments.",
    apiFetch: async () => {
      try {
        const [res, compRes, prodRes] = await Promise.all([
          api.companyProduct.getCompanyProducts(1),
          api.companyProduct.getCompaniesDropdown().catch(() => ({ data: [] })),
          api.companyProduct.getProductsDropdown().catch(() => ({ data: [] }))
        ]);
        const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const compList = Array.isArray(compRes?.data) ? compRes.data : (Array.isArray(compRes) ? compRes : []);
        const prodList = Array.isArray(prodRes?.data) ? prodRes.data : (Array.isArray(prodRes) ? prodRes : []);

        return items.map((cp, idx) => {
          const isDisabled = cp.IsDisabled === true || cp.status === 'Inactive' || cp.status === 'Disabled';
          const isEnabled = !isDisabled;
          const createdOnDate = cp.CreatedAt || cp.CreatedOn || cp.createdAt || cp.createdOn;
          let formattedDate = '—';
          if (createdOnDate) {
            try {
              const d = new Date(createdOnDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
              }
            } catch {}
          }

          const compMatch = compList.find(c => 
            (c.CompanyName && (c.CompanyName === cp.CompanyName || c.CompanyName === cp.companyName)) ||
            (c.CompanyId && (Number(c.CompanyId) === Number(cp.CompanyId || cp.companyId)))
          );
          const prodMatch = prodList.find(p => 
            (p.ProductName && (p.ProductName === cp.ProductName || p.ProductName === cp.productName)) ||
            (p.ProductId && (Number(p.ProductId) === Number(cp.ProductId || cp.productId)))
          );

          const companyId = cp.CompanyId ?? compMatch?.CompanyId;
          const productId = cp.ProductId ?? prodMatch?.ProductId;

          return {
            id: cp.CompanyProductId ?? (idx + 1),
            CompanyProductId: cp.CompanyProductId ?? (idx + 1),
            CompanyId: companyId !== undefined ? Number(companyId) : '',
            ProductId: productId !== undefined ? Number(productId) : '',
            companyName: cp.CompanyName || cp.companyName || '—',
            CompanyName: cp.CompanyName || cp.companyName || '',
            productName: cp.ProductName || cp.productName || '—',
            ProductName: cp.ProductName || cp.productName || '',
            companyProductCode: cp.CompanyProductCode || cp.companyProductCode || cp.ProductCode || '—',
            createdOn: formattedDate,
            CreatedOn: createdOnDate,
            status: isDisabled ? "Inactive" : "Active",
            IsDisabled: Boolean(isDisabled),
            isEnabled: isEnabled,
            raw: cp
          };
        });
      } catch (err) {
        return [];
      }
    },
    fetchDropdowns: async (mode = 'add', record = null) => {
      let companyOptions = [];
      let productOptions = [];

      try {
        const [compRes, prodRes] = await Promise.all([
          api.companyProduct.getCompaniesDropdown(),
          api.companyProduct.getProductsDropdown()
        ]);

        const compList = Array.isArray(compRes?.data) ? compRes.data : (Array.isArray(compRes) ? compRes : []);
        const prodList = Array.isArray(prodRes?.data) ? prodRes.data : (Array.isArray(prodRes) ? prodRes : []);

        companyOptions = compList.map((c) => ({
          value: Number(c.CompanyId),
          label: c.CompanyName
        }));

        productOptions = prodList.map((p) => ({
          value: Number(p.ProductId),
          label: p.ProductName
        }));
      } catch (err) {
      }

      return [
        {
          key: "CompanyId",
          label: "Company Name",
          type: "select",
          required: true,
          options: companyOptions,
          placeholder: "Select Company Name"
        },
        {
          key: "ProductId",
          label: "Product Name",
          type: "select",
          required: true,
          options: productOptions,
          placeholder: "Select Product Name"
        }
      ];
    },
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { 
        id: 'companyName', 
        header: 'Company Name', 
        accessorKey: 'companyName', 
        key: 'companyName', 
        cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-white">{row.original.companyName}</span> 
      },
      { 
        id: 'productName', 
        header: 'Product Name', 
        accessorKey: 'productName', 
        key: 'productName', 
        cell: ({ row }) => <span className="font-semibold text-primary">{row.original.productName}</span> 
      },
      { 
        id: 'createdOn', 
        header: 'Created On', 
        accessorKey: 'createdOn', 
        key: 'createdOn',
        cell: ({ row }) => <span className="text-slate-500 dark:text-slate-400 text-xs">{row.original.createdOn}</span>
      },
      { 
        id: 'status', 
        header: 'Status', 
        accessorKey: 'status', 
        key: 'status', 
        cell: ({ row }) => <StatusBadge status={row.original.status} /> 
      }
    ],
    formFields: [
      { key: "CompanyId", label: "Company Name", type: "select", required: true, options: [], placeholder: "Select Company Name" },
      { key: "ProductId", label: "Product Name", type: "select", required: true, options: [], placeholder: "Select Product Name" }
    ],
    apiCreate: async (formData) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';

      const payload = {
        FlagId: 3,
        CompanyId: Number(formData.CompanyId),
        ProductId: Number(formData.ProductId),
        IsDisabled: Boolean(formData.IsDisabled) || false,
        CreatedByUserName: userName
      };

      return await api.companyProduct.addCompanyProduct(payload);
    },
    apiUpdate: async (formData) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';
      const companyProductId = Number(formData.CompanyProductId ?? formData.id);

      const payload = {
        FlagId: 3,
        CompanyProductId: companyProductId,
        CompanyId: Number(formData.CompanyId),
        ProductId: Number(formData.ProductId),
        IsDisabled: typeof formData.IsDisabled === 'boolean' ? formData.IsDisabled : false,
        UpdatedByUserName: userName
      };

      return await api.companyProduct.updateCompanyProduct(payload);
    },
    apiDelete: async (idOrRecord) => {
      const companyProductId = typeof idOrRecord === 'object' ? (idOrRecord.CompanyProductId ?? idOrRecord.id) : idOrRecord;
      return await api.companyProduct.deleteCompanyProduct(companyProductId);
    },
    apiToggleStatus: async (record, newIsDisabled) => {
      const companyProductId = Number(record.CompanyProductId ?? record.id);
      const payload = {
        FlagId: 1,
        CompanyProductId: companyProductId,
        IsDisabled: Boolean(newIsDisabled)
      };
      return await api.companyProduct.toggleCompanyProductStatus(payload);
    }
  },

  // 4. Projects Master
  master_projects: {
    title: "Projects",
    description: "Manage client projects and software assignments.",
    apiFetch: async () => {
      try {
        const [res, compRes] = await Promise.all([
          api.project.getProjects(),
          api.project.getCompanyProductsDropdown().catch(() => ({ data: [] }))
        ]);
        const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : (Array.isArray(res?.data?.data) ? res.data.data : []));
        const compList = Array.isArray(compRes?.data) ? compRes.data : (Array.isArray(compRes) ? compRes : (Array.isArray(compRes?.data?.data) ? compRes.data.data : []));

        return items.map((p, idx) => {
          const isDisabled = p.IsDisabled === true || p.status === 'Inactive' || p.status === 'Disabled';
          const isEnabled = !isDisabled;
          const matchedCp = compList.find(c => Number(c.CompanyProductId) === Number(p.CompanyProductId));
          const prodName = p.ProductName || matchedCp?.ProductName || '—';
          const compName = p.CompanyName || matchedCp?.CompanyName || '—';

          return {
            id: p.ProjectId ?? (idx + 1),
            ProjectId: p.ProjectId ?? (idx + 1),
            CompanyProductId: p.CompanyProductId !== undefined ? Number(p.CompanyProductId) : (matchedCp?.CompanyProductId ? Number(matchedCp.CompanyProductId) : ''),
            projectName: p.ProjectName || p.projectName || '—',
            ProjectName: p.ProjectName || p.projectName || '',
            projectCode: p.ProjectCode || p.projectCode || '—',
            ProjectCode: p.ProjectCode || p.projectCode || '',
            companyName: compName,
            CompanyName: compName === '—' ? '' : compName,
            productName: prodName,
            ProductName: prodName === '—' ? '' : prodName,
            description: p.Description || p.description || p.ProjectDescription || '—',
            Description: p.Description || p.description || p.ProjectDescription || '',
            status: isDisabled ? "Inactive" : "Active",
            IsDisabled: Boolean(isDisabled),
            isEnabled: isEnabled,
            raw: p
          };
        });
      } catch (err) {
        return [];
      }
    },
    fetchDropdowns: async (mode = 'add', record = null) => {
      let options = [];
      try {
        const res = mode === 'edit'
          ? await api.project.getCompanyProductsForEditDropdown()
          : await api.project.getCompanyProductsDropdown();

        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : (Array.isArray(res?.data?.data) ? res.data.data : []));

        options = list.map(cp => {
          const id = Number(cp.CompanyProductId || cp.id);
          const label = cp.CompanyName ? `${cp.CompanyName} - ${cp.ProductName}` : (cp.ProductName || `Company Product #${id}`);
          return {
            value: id,
            label: label
          };
        });
      } catch (err) {
      }

      return [
        {
          key: "CompanyProductId",
          label: "Company Product",
          type: "select",
          required: true,
          options: options,
          placeholder: "Select Company Product"
        },
        {
          key: "ProjectCode",
          label: "Project Code",
          type: "text",
          required: true,
          placeholder: "e.g. PRJ-CRM-01"
        },
        {
          key: "ProjectName",
          label: "Project Name",
          type: "text",
          required: true,
          placeholder: "e.g. Global CRM Implementation"
        },
        {
          key: "Description",
          label: "Description",
          type: "textarea",
          placeholder: "e.g. Detailed scope of project..."
        }
      ];
    },
    apiCreate: async (formData) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';
      const userId = Number(session?.UserId ?? userState?.UserId ?? userState?.id ?? 1);

      const payload = {
        flagId: 2,
        CompanyProductId: Number(formData.CompanyProductId),
        ProjectName: formData.ProjectName || formData.projectName || '',
        ProjectCode: formData.ProjectCode || formData.projectCode || '',
        IsDisabled: false,
        Description: formData.Description || formData.description || '',
        CreatedByUserId: userId,
        CreatedByUserName: userName
      };

      return await api.project.addProject(payload);
    },
    apiUpdate: async (formData) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';
      const userId = Number(session?.UserId ?? userState?.UserId ?? userState?.id ?? 1);
      const projectId = Number(formData.ProjectId ?? formData.id);

      const payload = {
        flagId: 2,
        ProjectId: projectId,
        CompanyProductId: Number(formData.CompanyProductId),
        ProjectName: formData.ProjectName || formData.projectName || '',
        ProjectCode: formData.ProjectCode || formData.projectCode || '',
        IsDisabled: typeof formData.IsDisabled === 'boolean' ? formData.IsDisabled : Boolean(formData.isDisabled),
        Description: formData.Description || formData.description || '',
        UpdatedByUserId: userId,
        UpdatedByUserName: userName,
        UpdateByUserName: userName
      };

      return await api.project.editProject(payload);
    },
    apiToggleStatus: async (record, newIsDisabled) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';
      const userId = Number(session?.UserId ?? userState?.UserId ?? userState?.id ?? 1);
      const projectId = Number(record.ProjectId ?? record.id);

      const payload = {
        flagId: 4,
        ProjectId: projectId,
        IsDisabled: Boolean(newIsDisabled),
        UpdatedByUserId: userId,
        UpdatedByUserName: userName,
        UpdateByUserName: userName
      };

      return await api.project.toggleProjectStatus(payload);
    },
    apiDelete: async (idOrRecord) => {
      const projectId = typeof idOrRecord === 'object' ? (idOrRecord.ProjectId ?? idOrRecord.id) : idOrRecord;
      return await api.project.deleteProject(projectId);
    },
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'projectCode', header: 'Project Code', accessorKey: 'projectCode', key: 'projectCode', cell: ({ row }) => <span className="font-semibold text-primary">{row.original.projectCode}</span> },
      { id: 'projectName', header: 'Project Name', accessorKey: 'projectName', key: 'projectName', cell: ({ row }) => <span className="font-bold">{row.original.projectName}</span> },
      { id: 'companyName', header: 'Company', accessorKey: 'companyName', key: 'companyName' },
      { id: 'productName', header: 'Product', accessorKey: 'productName', key: 'productName' },
      { id: 'description', header: 'Description', accessorKey: 'description', key: 'description' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "CompanyProductId", label: "Company Product", type: "select", required: true, options: [], placeholder: "Select Company Product" },
      { key: "ProjectCode", label: "Project Code", type: "text", required: true, placeholder: "e.g. PRJ-CRM-01" },
      { key: "ProjectName", label: "Project Name", type: "text", required: true, placeholder: "e.g. Global CRM Implementation" },
      { key: "Description", label: "Description", type: "textarea", placeholder: "e.g. Scope details..." }
    ]
  },

  // 5. Designations Master
  master_designations: {
    title: "Designations",
    description: "Manage job roles and company designation hierarchies.",
    apiFetch: async () => {
      const res = await api.designation.getDesignations();
      const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return items.map((d, idx) => {
        const isDisabled = d.IsDisabled === true || d.status === 'Inactive' || d.status === 'Disabled';
        const isEnabled = !isDisabled;
        return {
          id: d.CompanyDesignationId ?? (idx + 1),
          CompanyDesignationId: d.CompanyDesignationId ?? (idx + 1),
          CompanyId: d.CompanyId,
          designationName: d.DesignationName || '—',
          DesignationName: d.DesignationName || '',
          designationCode: d.DesignationCode || '—',
          DesignationCode: d.DesignationCode || '',
          companyName: d.CompanyName || '—',
          CompanyName: d.CompanyName || '',
          DesignationLevel: d.DesignationLevel !== undefined && d.DesignationLevel !== null ? d.DesignationLevel : '',
          CanBeReportingManager: d.CanBeReportingManager !== undefined ? Boolean(d.CanBeReportingManager) : true,
          status: isDisabled ? "Inactive" : "Active",
          IsDisabled: Boolean(isDisabled),
          isEnabled: isEnabled,
          raw: d
        };
      });
    },
    fetchDropdowns: async () => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userContext = useERPStore.getState().userContext;
      const displayRole = userState?.designation?.name || userContext?.roles?.[0]?.RoleName || userState?.role || 'User';
      const isSuperAdmin = displayRole.toLowerCase() === 'super admin' || displayRole.toLowerCase() === 'administrator';
      const userCompanyId = Number(userState?.CompanyId || userState?.companyId || userContext?.companies?.[0]?.CompanyId || session?.CompanyId);

      const res = await api.designation.getCompaniesDropdown();
      const companiesList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      let companyOptions = companiesList.map(c => ({
        value: Number(c.CompanyId),
        label: c.CompanyCode ? `${c.CompanyName} (${c.CompanyCode})` : c.CompanyName
      }));

      if (!isSuperAdmin && userCompanyId) {
        companyOptions = companyOptions.filter(c => c.value === userCompanyId);
      }

      const lockedCompanyName = (!isSuperAdmin && companyOptions.length > 0) ? companyOptions[0].label : "Select Company";

      return [
        {
          key: "CompanyId",
          label: "Company",
          type: "select",
          required: true,
          options: companyOptions,
          placeholder: lockedCompanyName,
          disabled: !isSuperAdmin,
          defaultValue: !isSuperAdmin ? userCompanyId : undefined
        },
        {
          key: "DesignationCode",
          label: "Designation Code",
          type: "text",
          required: true,
          placeholder: "e.g. DES-SE"
        },
        {
          key: "DesignationName",
          label: "Designation Name",
          type: "text",
          required: true,
          placeholder: "e.g. Software Engineer"
        },
        {
          key: "DesignationLevel",
          label: "Designation Level",
          type: "number",
          required: false,
          placeholder: "e.g. 1"
        },
        {
          key: "CanBeReportingManager",
          label: "Can Be Reporting Manager",
          type: "toggle",
          required: false,
          defaultValue: true,
          invertToggle: true
        }
      ];
    },
    apiCreate: async (formData) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userContext = useERPStore.getState().userContext;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';
      const userId = Number(session?.UserId ?? userState?.UserId ?? userState?.id ?? 1);
      const userCompanyId = Number(userState?.CompanyId || userState?.companyId || userContext?.companies?.[0]?.CompanyId || session?.CompanyId);

      const payload = {
        flagId: 2,
        CompanyId: Number(formData.CompanyId || userCompanyId),
        DesignationName: formData.DesignationName || formData.designationName || '',
        DesignationCode: formData.DesignationCode || formData.designationCode || '',
        DesignationLevel: formData.DesignationLevel ? parseInt(formData.DesignationLevel, 10) : 0,
        CanBeReportingManager: formData.CanBeReportingManager !== undefined ? Boolean(formData.CanBeReportingManager) : true,
        IsDisabled: false,
        Description: '',
        CreatedByUserName: userName,
        CreatedByUserId: userId
      };

      return await api.designation.addDesignation(payload);
    },
    apiUpdate: async (formData) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userContext = useERPStore.getState().userContext;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';
      const userId = Number(session?.UserId ?? userState?.UserId ?? userState?.id ?? 1);
      const userCompanyId = Number(userState?.CompanyId || userState?.companyId || userContext?.companies?.[0]?.CompanyId || session?.CompanyId);
      const companyDesignationId = Number(formData.CompanyDesignationId ?? formData.id);

      const payload = {
        flagId: 2,
        CompanyDesignationId: companyDesignationId,
        CompanyId: Number(formData.CompanyId || userCompanyId),
        DesignationName: formData.DesignationName || formData.designationName || '',
        DesignationCode: formData.DesignationCode || formData.designationCode || '',
        DesignationLevel: formData.DesignationLevel ? parseInt(formData.DesignationLevel, 10) : 0,
        CanBeReportingManager: formData.CanBeReportingManager !== undefined ? Boolean(formData.CanBeReportingManager) : true,
        IsDisabled: Boolean(formData.IsDisabled),
        Description: '',
        UpdateByUserName: userName,
        UpdatedByUserName: userName,
        UpdatedByUserId: userId
      };

      return await api.designation.editDesignation(payload);
    },
    apiToggleStatus: async (record, newIsDisabled) => {
      const userState = useERPStore.getState().user;
      const session = useERPStore.getState().session;
      const userName = userState?.loginName || userState?.LoginName || session?.LoginName || session?.loginName || userState?.EmployeeId || session?.EmployeeId || (typeof userState?.name === 'string' && userState.name !== 'Andrew' ? userState.name : '') || '';
      const userId = Number(session?.UserId ?? userState?.UserId ?? userState?.id ?? 1);
      const companyDesignationId = Number(record.CompanyDesignationId ?? record.id);

      const payload = {
        flagId: 4,
        CompanyDesignationId: companyDesignationId,
        IsDisabled: Boolean(newIsDisabled),
        UpdateByUserName: userName,
        UpdatedByUserName: userName,
        UpdatedByUserId: userId
      };

      return await api.designation.toggleDesignationStatus(payload);
    },
    apiDelete: async (idOrRecord) => {
      const companyDesignationId = typeof idOrRecord === 'object' ? (idOrRecord.CompanyDesignationId ?? idOrRecord.id) : idOrRecord;
      return await api.designation.deleteDesignation(companyDesignationId);
    },
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'designationCode', header: 'Designation Code', accessorKey: 'designationCode', key: 'designationCode', cell: ({ row }) => <span className="font-semibold text-primary">{row.original.designationCode}</span> },
      { id: 'designationName', header: 'Designation Name', accessorKey: 'designationName', key: 'designationName', cell: ({ row }) => <span className="font-bold">{row.original.designationName}</span> },
      { id: 'companyName', header: 'Company', accessorKey: 'companyName', key: 'companyName' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "CompanyId", label: "Company", type: "select", required: true, options: [], placeholder: "Select Company" },
      { key: "DesignationCode", label: "Designation Code", type: "text", required: true, placeholder: "e.g. DES-SE" },
      { key: "DesignationName", label: "Designation Name", type: "text", required: true, placeholder: "e.g. Software Engineer" },
      { key: "DesignationLevel", label: "Designation Level", type: "number", required: false, placeholder: "e.g. 1" },
      { key: "CanBeReportingManager", label: "Can Be Reporting Manager", type: "toggle", required: false, defaultValue: true, invertToggle: true }
    ]
  },

  // 6. Roles Master
  master_roles: {
    title: "Roles",
    description: "Manage system access roles and functional assignments.",
    apiFetch: async () => {
      const res = await api.role.getRoles();
      const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return items.map((r, idx) => {
        const isDisabled = r.IsDisabled === true || r.status === 'Inactive' || r.status === 'Disabled';
        const isEnabled = !isDisabled;
        return {
          id: r.RoleId ?? (idx + 1),
          RoleId: r.RoleId ?? (idx + 1),
          roleCode: r.Role_Code || r.RoleCode || r.roleCode || '',
          RoleCode: r.Role_Code || r.RoleCode || r.roleCode || '',
          roleName: r.RoleName || r.roleName || '',
          RoleName: r.RoleName || r.roleName || '',
          company: r.CompanyName || r.Company || 'Vishvin HQ',
          CompanyId: r.CompanyId,
          description: r.Description || r.RoleDescription || r.description || '',
          status: isDisabled ? "Inactive" : "Active",
          IsDisabled: Boolean(isDisabled),
          isEnabled: isEnabled,
          raw: r
        };
      });
    },
    apiCreate: async (formData) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';

      if (api.role.addRole) {
        return await api.role.addRole({
          CompanyId: Number(formData.CompanyId),
          RoleName: formData.roleName || formData.RoleName || '',
          Role_Code: formData.roleCode || formData.RoleCode || formData.Role_Code || '',
          Description: formData.description || formData.RoleDescription || formData.Description || '',
          CreatedByUserName: userName
        });
      }
    },
    apiUpdate: async (formData) => {
      const userState = useERPStore.getState().user;
      const userName = userState?.loginName || userState?.EmployeeId || (typeof userState?.name === 'string' ? userState.name : '') || '';
      const roleId = Number(formData.RoleId ?? formData.id);

      if (api.role.updateRole) {
        return await api.role.updateRole({
          RoleId: roleId,
          CompanyId: Number(formData.CompanyId),
          RoleName: formData.roleName || formData.RoleName || '',
          Role_Code: formData.roleCode || formData.RoleCode || formData.Role_Code || '',
          Description: formData.description || formData.RoleDescription || formData.Description || '',
          UpdatedByUserName: userName
        });
      }
    },
    apiToggleStatus: async (record, newIsDisabled) => {
      const roleId = Number(record.RoleId ?? record.id);
      if (api.role.updateRoleStatus) {
        return await api.role.updateRoleStatus(roleId, Boolean(newIsDisabled));
      }
    },
    apiDelete: async (idOrRecord) => {
      const roleId = typeof idOrRecord === 'object' ? (idOrRecord.RoleId ?? idOrRecord.id) : idOrRecord;
      return await api.role.deleteRole(roleId);
    },
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'roleCode', header: 'Role Code', accessorKey: 'roleCode', key: 'roleCode' },
      { id: 'roleName', header: 'Role Name', accessorKey: 'roleName', key: 'roleName', cell: ({ row }) => <span className="font-bold">{row.original.roleName}</span> },
      { id: 'company', header: 'Company', accessorKey: 'company', key: 'company' },
      { id: 'description', header: 'Description', accessorKey: 'description', key: 'description' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    fetchDropdowns: async () => {
      let companyOptions = [];
      try {
        const res = await api.role.getCompaniesForRole();
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        companyOptions = list.map(c => ({
          value: Number(c.CompanyId || c.id),
          label: c.CompanyName || c.name || `Company #${c.CompanyId || c.id}`
        }));
      } catch (err) {}
      
      return [
        {
          key: "CompanyId",
          label: "Company",
          type: "select",
          required: true,
          options: companyOptions,
          placeholder: "Select Company"
        },
        { key: "roleCode", label: "Role Code", type: "text", required: true, placeholder: "e.g. ROLE_MGR" },
        { key: "roleName", label: "Role Name", type: "text", required: true, placeholder: "e.g. Operations Manager" },
        { key: "description", label: "Description", type: "textarea", placeholder: "e.g. Manages core operations" }
      ];
    },
    formFields: [
      { key: "CompanyId", label: "Company", type: "select", required: true, options: [], placeholder: "Select Company" },
      { key: "roleCode", label: "Role Code", type: "text", required: true, placeholder: "e.g. ROLE_MGR" },
      { key: "roleName", label: "Role Name", type: "text", required: true, placeholder: "e.g. Operations Manager" },
      { key: "description", label: "Description", type: "textarea", placeholder: "e.g. Manages core operations" }
    ],
    addFormFields: [
      { key: "CompanyId", label: "Company", type: "select", required: true, options: [], placeholder: "Select Company" },
      { key: "roleCode", label: "Role Code", type: "text", required: true, placeholder: "e.g. ROLE_MGR" },
      { key: "roleName", label: "Role Name", type: "text", required: true, placeholder: "e.g. Operations Manager" },
      { key: "description", label: "Description", type: "textarea", placeholder: "e.g. Manages core operations" }
    ],
    editFormFields: [
      { key: "CompanyId", label: "Company", type: "select", required: true, options: [], placeholder: "Select Company" },
      { key: "roleCode", label: "Role Code", type: "text", required: true, placeholder: "e.g. ROLE_MGR" },
      { key: "roleName", label: "Role Name", type: "text", required: true, placeholder: "e.g. Operations Manager" },
      { key: "description", label: "Description", type: "textarea", placeholder: "e.g. Manages core operations" }
    ]
  },

  // 7. Vendor Management Master
  master_vendor_management: {
    title: "Vendor Management",
    description: "Manage suppliers, vendors, categories, and business credentials.",
    apiFetch: async () => {
      const res = await api.vendor.getVendors();
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      return items.map((v) => ({
        id: v.id ?? v.VendorId,
        vendorCode: v.vendorCode || v.VendorCode || '',
        vendorName: v.vendorName || v.VendorName || '',
        category: v.vendorTypeName || v.VendorTypeName || '',
        contactPerson: v.contactPerson || v.ContactPerson || '',
        email: v.email || v.Email || '',
        phone: v.phone || v.MobileNumber || v.Phone || '',
        gstNumber: v.gstNumber || v.GSTINUINNumber || v.GSTNumber || '',
        city: v.city || v.City || '',
        status: v.status || (v.IsDisabled ? 'Inactive' : 'Active'),
        raw: v
      }));
    },
    apiCreate: async (formData) => {
      return await api.vendor.addVendor(formData);
    },
    apiUpdate: async (formData) => {
      return await api.vendor.updateVendor(formData);
    },
    apiToggleStatus: async (record) => {
      return await api.vendor.toggleStatus(record, record.status);
    },
    columns: [
      { id: 'id', header: '#', accessorKey: 'id', key: 'id' },
      { id: 'vendorCode', header: 'Vendor Code', accessorKey: 'vendorCode', key: 'vendorCode' },
      { id: 'vendorName', header: 'Vendor Name', accessorKey: 'vendorName', key: 'vendorName' },
      { id: 'category', header: 'Vendor Type', accessorKey: 'category', key: 'category' },
      { id: 'contactPerson', header: 'Contact Person', accessorKey: 'contactPerson', key: 'contactPerson' },
      { id: 'gstNumber', header: 'GSTIN / UIN', accessorKey: 'gstNumber', key: 'gstNumber' },
      { id: 'city', header: 'City', accessorKey: 'city', key: 'city' },
      { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    formFields: [
      { key: "vendorCode", label: "Vendor Code", type: "text", required: true, placeholder: "e.g. VEN-001" },
      { key: "vendorName", label: "Vendor Name", type: "text", required: true, placeholder: "e.g. Acme Supplies Ltd" },
      { key: "contactPerson", label: "Contact Person", type: "text", placeholder: "e.g. Rajesh Sharma" },
      { key: "email", label: "Email Address", type: "email", placeholder: "e.g. contact@vendor.com" },
      { key: "phone", label: "Phone", type: "text", placeholder: "e.g. +91 9876543210" },
      { key: "gstNumber", label: "GSTIN / UIN", type: "text", placeholder: "e.g. 29ABCDE1234F1Z5" },
      { key: "city", label: "City", type: "text", placeholder: "e.g. Bengaluru" }
    ]
  }
};

// Aliases for real integrated backend modules
registryConfigs.companies = registryConfigs.master_companies;
registryConfigs.master_company = registryConfigs.master_companies;

registryConfigs.products = registryConfigs.master_products;
registryConfigs.products_products = registryConfigs.master_products;
registryConfigs.master_product = registryConfigs.master_products;

registryConfigs.company_products = registryConfigs.master_company_products;
registryConfigs.company_product = registryConfigs.master_company_products;
registryConfigs.master_company_product = registryConfigs.master_company_products;

registryConfigs.projects = registryConfigs.master_projects;
registryConfigs.master_project = registryConfigs.master_projects;
registryConfigs.projects_projects = registryConfigs.master_projects;

registryConfigs.designations = registryConfigs.master_designations;
registryConfigs.master_designation = registryConfigs.master_designations;
registryConfigs.hrm_designations = registryConfigs.master_designations;

registryConfigs.roles = registryConfigs.master_roles;
registryConfigs.master_role = registryConfigs.master_roles;
registryConfigs.system_roles = registryConfigs.master_roles;
registryConfigs.user_management_roles = registryConfigs.master_roles;

registryConfigs.vendor_management = registryConfigs.master_vendor_management;
registryConfigs.master_vendors = registryConfigs.master_vendor_management;
registryConfigs.vendors = registryConfigs.master_vendor_management;

export function ModuleRenderer() {
  const { module, subpage } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const showToast = useERPStore((state) => state.showToast);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dynamicFormFields, setDynamicFormFields] = useState(null);

  // Find current route configuration with hyphen-to-underscore normalization
  const config = useMemo(() => {
    const rawKey = path.split('/').filter(Boolean).join('_');
    const normalizedKey = rawKey.replace(/-/g, '_');
    return registryConfigs[rawKey] || registryConfigs[normalizedKey] || null;
  }, [path]);

  useEffect(() => {
    let isMounted = true;
    if (config?.fetchDropdowns) {
      config.fetchDropdowns(isEditOpen ? 'edit' : 'add', selectedRecord).then((fields) => {
        if (isMounted && fields && fields.length > 0) {
          setDynamicFormFields(fields);
        }
      }).catch((err) => {
      });
    } else {
      setDynamicFormFields(null);
    }
    return () => {
      isMounted = false;
    };
  }, [path, isAddOpen, isEditOpen, selectedRecord, config]);

  // If route matches an analytics/dashboard view, show a generic analytics dashboard
  if (path.endsWith('/analytics') || path.endsWith('/dashboard')) {
    return <GenericAnalyticsDashboard title={path.split('/').slice(-2)[0].toUpperCase().replace(/-/g, ' ') + " Analytics"} />;
  }

  if (!config) {
    const segments = path.split('/').filter(Boolean);
    const title = segments[segments.length - 1]
      ? segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Module';
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <CalendarRange className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500">
          This module is not yet connected to a live backend API endpoint.
        </p>
      </div>
    );
  }

  const handleAddClick = async () => {
    setSelectedRecord(null);
    if (config?.fetchDropdowns) {
      try {
        const fields = await config.fetchDropdowns('add', null);
        if (fields && fields.length > 0) {
          setDynamicFormFields(fields);
        }
      } catch (err) {
      }
    } else {
      setDynamicFormFields(null);
    }
    setIsAddOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (config?.apiCreate) {
      try {
        await config.apiCreate(data);
        setRefreshKey(prev => prev + 1);
        setIsAddOpen(false);
      } catch (err) {
        // Modal stays open so the user can change fields or cancel!
      }
    }
  };

  const handleEditSubmit = async (data) => {
    if (config?.apiUpdate && selectedRecord) {
      try {
        await config.apiUpdate({ ...selectedRecord, ...data });
        setRefreshKey(prev => prev + 1);
        setIsEditOpen(false);
        setSelectedRecord(null);
      } catch (err) {
        // Modal stays open so the user can change fields or cancel!
      }
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
              : (c.accessorKey || '').toLowerCase().includes('price') || (c.accessorKey || '').toLowerCase().includes('amount') || (c.accessorKey || '').toLowerCase().includes('qty') || (c.accessorKey || '').toLowerCase().includes('quantity') || (c.accessorKey || '').toLowerCase().includes('rate') ? 'number'
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

  const baseFormFields = (config.formFields && config.formFields.length > 0 ? config.formFields : activeFormFields);

  const activeAddFields = (dynamicFormFields && dynamicFormFields.length > 0)
    ? dynamicFormFields
    : ((config.addFormFields && config.addFormFields.length > 0) ? config.addFormFields : baseFormFields);

  const activeEditFields = (dynamicFormFields && dynamicFormFields.length > 0)
    ? dynamicFormFields
    : ((config.editFormFields && config.editFormFields.length > 0) ? config.editFormFields : baseFormFields);

  return (
    <>
      <DynamicListPage
        key={`list_${path}`}
        title={config.title}
        description={config.description}
        columns={config.columns}
        fetchDataFn={config.apiFetch}
        deleteDataFn={config.apiDelete}
        toggleStatusFn={config.apiToggleStatus}
        refreshKey={refreshKey}
        onAddClick={handleAddClick}
        onViewClick={(row) => {
          setSelectedRecord(row);
          setIsViewOpen(true);
        }}
        onEditClick={async (row) => {
          let editDefaults = { ...row };
          if (config?.fetchDropdowns) {
            try {
              const fields = await config.fetchDropdowns('edit', row);
              if (fields && fields.length > 0) {
                setDynamicFormFields(fields);
                fields.forEach(field => {
                  if (field.type === 'select' && field.options && field.options.length > 0) {
                    const existingVal = editDefaults[field.key];
                    const hasMatch = field.options.some(opt => Number(opt.value) === Number(existingVal) || String(opt.value) === String(existingVal));
                    if (!hasMatch) {
                      const labelKey = field.key.replace(/Id$/, 'Name');
                      const targetLabel = editDefaults[labelKey] || editDefaults[field.label] || editDefaults[field.key];
                      if (targetLabel) {
                        const matchedOpt = field.options.find(opt => String(opt.label).trim().toLowerCase() === String(targetLabel).trim().toLowerCase());
                        if (matchedOpt) {
                          editDefaults[field.key] = matchedOpt.value;
                        }
                      }
                    }
                  }
                });
              }
            } catch (err) {
            }
          } else {
            setDynamicFormFields(null);
          }
          setSelectedRecord(editDefaults);
          setIsEditOpen(true);
        }}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: config.title }]}
      />

      {isAddOpen && (
        <Modal
          key={`add_modal_${path}`}
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title={`Add New ${config.title.endsWith('ies') ? config.title.slice(0, -3) + 'y' : config.title.slice(0, -1)}`}
          size="lg"
        >
          <DynamicFormPage
            key={`add_form_${path}`}
            title=""
            fields={activeAddFields}
            defaultValues={activeAddFields.reduce((acc, field) => { if (field.defaultValue !== undefined) acc[field.key] = field.defaultValue; return acc; }, {})}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      )}

      {isViewOpen && selectedRecord && (
        <Modal
          key={`view_modal_${path}_${selectedRecord.id || selectedRecord.CompanyProductId || selectedRecord.ProductId || selectedRecord.CompanyId || 'view'}`}
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
              {(config.columns || [])
                .filter(c => c.id !== 'actions' && c.id !== 'id' && c.key !== 'id' && c.id !== 'action')
                .map(c => {
                  const key = c.accessorKey || c.id || c.key;
                  const label = typeof c.header === 'string' ? c.header : key.replace(/([A-Z])/g, ' $1');
                  const val = selectedRecord[key] ?? selectedRecord[key.charAt(0).toUpperCase() + key.slice(1)] ?? selectedRecord[key.toLowerCase()] ?? '—';
                  return (
                    <div key={key} className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-slate-400 capitalize font-medium">{label}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{String(val || '—')}</p>
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isEditOpen && selectedRecord && (
        <Modal
          key={`edit_modal_${path}_${selectedRecord.id || selectedRecord.CompanyProductId || selectedRecord.ProductId || selectedRecord.CompanyId || 'edit'}`}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedRecord(null);
          }}
          title={`Edit ${config.title.endsWith('ies') ? config.title.slice(0, -3) + 'y' : config.title.slice(0, -1)}`}
          size="lg"
        >
          <DynamicFormPage
            key={`edit_form_${path}_${selectedRecord.id || selectedRecord.CompanyProductId || selectedRecord.ProductId || selectedRecord.CompanyId || 'edit'}`}
            title=""
            fields={activeEditFields}
            defaultValues={{
              ...activeEditFields.reduce((acc, field) => { if (field.defaultValue !== undefined) acc[field.key] = field.defaultValue; return acc; }, {}),
              ...selectedRecord
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}

export default ModuleRenderer;