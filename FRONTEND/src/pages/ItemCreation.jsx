import React, { useState, useEffect } from 'react';
import {
  PageHeader,
  Button,
  StatusBadge,
  Input,
  Switch
} from '../components/ui/index';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Box,
  Tag,
  Barcode,
  Calendar,
  User,
  Package,
  Layers,
  ClipboardList,
  Percent,
  FileText,
  FileCheck,
  Scale
} from 'lucide-react';
import { useERPStore } from '../store/useERPStore';
import { itemCreationService } from '../services';

export default function ItemCreation() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  // Derived current user details dynamically from store
  const currentUserName = currentUser?.loginName || currentUser?.name || currentUser?.userName || '';
  const currentUserId = currentUser?.UserId || currentUser?.EmployeeId || currentUser?.id || currentUser?.userId || null;

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // All 6 Dropdowns (FlagIds 2 to 7) loaded dynamically from API
  const [dropdowns, setDropdowns] = useState({
    categories: [],    // FlagId: 2
    subCategories: [], // FlagId: 3
    uoms: [],          // FlagId: 4
    gstTypes: [],      // FlagId: 5
    gstRates: [],      // FlagId: 6
    fileTypes: []      // FlagId: 7
  });

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    categoryId: '',
    categoryName: '',
    subCategoryId: '',
    subCategoryName: '',
    code: '',
    name: '',
    brand: '',
    model: '',
    uomId: '',
    uomName: '',
    gstTypeId: '',
    gstTypeName: '',
    gstRateId: '',
    gstPercentage: '',
    fileTypeId: null,
    fileTypeName: '',
    hsnSac: '',
    warrantyYears: '',
    description: '',
    userName: currentUserName,
    status: 'Active',
    createdBy: '',
    createdAt: ''
  });

  // Fetch all 6 dropdowns dynamically from /verp-service/material/dropdown (FlagIds 2 to 7)
  const fetchAllDropdowns = async () => {
    try {
      const data = await itemCreationService.getAllDropdowns();
      setDropdowns(data);
      if (data.fileTypes && data.fileTypes.length > 0) {
        setFormData(prev => ({
          ...prev,
          fileTypeId: prev.fileTypeId ?? data.fileTypes[0].id,
          fileTypeName: prev.fileTypeName || data.fileTypes[0].name
        }));
      }
    } catch (error) {
      console.error("Failed to load dropdowns:", error);
    }
  };

  // Fetch all materials from /verp-service/material/view (FlagId: 1)
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await itemCreationService.getItems();
      setItems(data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      showToast('Failed to load materials', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchAllDropdowns();
  }, []);

  const handleOpenModal = async (item = null, mode = 'create') => {
    await fetchAllDropdowns();
    setIsViewing(mode === 'view');

    if (item) {
      setIsEditing(mode === 'edit');
      setFormData({
        id: item.id,
        categoryId: item.categoryId || '',
        categoryName: item.category || '',
        subCategoryId: item.subCategoryId || '',
        subCategoryName: item.subCategory || '',
        code: item.code || '',
        name: item.name || '',
        brand: item.brand || '',
        model: item.model || '',
        uomId: item.uomId || '',
        uomName: item.uom || '',
        gstTypeId: item.gstTypeId || '',
        gstTypeName: item.gstTypeName || '',
        gstRateId: item.gstRateId || '',
        gstPercentage: item.gstPercentage || '',
        fileTypeId: item.fileTypeId ? Number(item.fileTypeId) : (dropdowns.fileTypes?.[0]?.id ?? null),
        fileTypeName: item.fileTypeName || (dropdowns.fileTypes?.[0]?.name ?? ''),
        hsnSac: item.hsnSac || '',
        warrantyYears: item.warrantyYears || '',
        description: item.description || '',
        userName: item.userName || item.createdBy || currentUserName,
        status: item.status || 'Active',
        createdBy: item.createdBy || item.userName || currentUserName,
        createdAt: item.createdAt || '',
        updatedBy: item.updatedBy || (item.raw?.UpdatedByUserName || (item.raw?.UpdatedByUserId ? `User #${item.raw?.UpdatedByUserId}` : '')),
        updatedAt: item.updatedAt || (item.raw?.UpdatedAt ? new Date(item.raw.UpdatedAt).toLocaleDateString('en-GB') : '')
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        categoryId: '',
        categoryName: '',
        subCategoryId: '',
        subCategoryName: '',
        code: '',
        name: '',
        brand: '',
        model: '',
        uomId: '',
        uomName: '',
        gstTypeId: '',
        gstTypeName: '',
        gstRateId: '',
        gstPercentage: '',
        fileTypeId: dropdowns.fileTypes?.[0]?.id ?? null,
        fileTypeName: dropdowns.fileTypes?.[0]?.name ?? '',
        hsnSac: '',
        warrantyYears: '',
        description: '',
        userName: currentUserName,
        status: 'Active',
        createdBy: currentUserName,
        createdAt: '',
        updatedBy: '',
        updatedAt: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewing(false);
  };

  // Dropdown Change Handlers
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selected = dropdowns.categories.find(c => String(c.id) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      categoryId: selectedId,
      categoryName: selected ? selected.name : '',
      subCategoryId: '',
      subCategoryName: ''
    }));
  };

  const handleSubCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selected = dropdowns.subCategories.find(sc => String(sc.id) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      subCategoryId: selectedId,
      subCategoryName: selected ? selected.name : ''
    }));
  };

  const handleUOMChange = (e) => {
    const selectedId = e.target.value;
    const selected = dropdowns.uoms.find(u => String(u.id) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      uomId: selectedId,
      uomName: selected ? selected.name : ''
    }));
  };

  const handleGSTTypeChange = (e) => {
    const selectedId = e.target.value;
    const selected = dropdowns.gstTypes.find(g => String(g.GSTTypeId) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      gstTypeId: selectedId,
      gstTypeName: selected ? selected.GSTTypeName : '',
      gstRateId: '',
      gstPercentage: ''
    }));
  };

  const handleGSTRateChange = (e) => {
    const selectedId = e.target.value;
    const selected = dropdowns.gstRates.find(r => String(r.id) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      gstRateId: selectedId,
      gstPercentage: selected ? selected.percentage : ''
    }));
  };

  const handleFileTypeChange = (e) => {
    const selectedId = Number(e.target.value);
    const selected = dropdowns.fileTypes.find(f => Number(f.id) === selectedId);
    setFormData(prev => ({
      ...prev,
      fileTypeId: 4,
      fileTypeName: selected ? selected.name : 'Material'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const now = new Date().toISOString();

      if (isEditing) {
        const payload = {
          FlagId: 9,
          MaterialId: Number(formData.id),
          MaterialName: formData.name,
          MaterialCode: formData.code,
          MaterialCategoryTypeId: Number(formData.categoryId),
          MaterialSubCategoryTypeId: Number(formData.subCategoryId),
          MaterialBrandName: formData.brand || '',
          ModelNo: formData.model || '',
          UOMId: Number(formData.uomId),
          GSTTypeId: Number(formData.gstTypeId),
          GSTRateId: Number(formData.gstRateId),
          HSNSAC: formData.hsnSac || '',
          WarrantyYears: Number(formData.warrantyYears) || 0,
          DescriptionSpecification: formData.description || '',
          CreatedByUserId: formData.createdByUserId ? Number(formData.createdByUserId) : (currentUserId ? Number(currentUserId) : undefined),
          UpdatedByUserId: currentUserId ? Number(currentUserId) : undefined,
          UpdatedAt: now,
          FileTypeIds: selectedFile ? Number(formData.fileTypeId || dropdowns.fileTypes?.[0]?.id) : undefined,
          file: selectedFile
        };

        const response = await itemCreationService.updateItem(payload);
        if (response && (response.status === 'success' || response.success)) {
          showToast(response.message || 'Material updated successfully', 'success');
          await fetchItems();
        } else {
          throw new Error(response?.message || 'Failed to update material');
        }
      } else {
        const payload = {
          FlagId: 8,
          MaterialName: formData.name,
          MaterialCode: formData.code,
          MaterialCategoryTypeId: Number(formData.categoryId),
          MaterialSubCategoryTypeId: Number(formData.subCategoryId),
          MaterialBrandName: formData.brand || '',
          ModelNo: formData.model || '',
          UOMId: Number(formData.uomId),
          GSTTypeId: Number(formData.gstTypeId),
          GSTRateId: Number(formData.gstRateId),
          HSNSAC: formData.hsnSac || '',
          WarrantyYears: Number(formData.warrantyYears) || 0,
          DescriptionSpecification: formData.description || '',
          CreatedByUserId: currentUserId ? Number(currentUserId) : undefined,
          UpdatedByUserId: currentUserId ? Number(currentUserId) : undefined,
          UpdatedAt: now,
          FileTypeIds: selectedFile ? Number(formData.fileTypeId || dropdowns.fileTypes?.[0]?.id) : undefined,
          file: selectedFile
        };

        const response = await itemCreationService.createItem(payload);
        if (response && (response.status === 'success' || response.success)) {
          showToast(response.message || 'Material created successfully', 'success');
          await fetchItems();
        } else {
          throw new Error(response?.message || 'Failed to create material');
        }
      }
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to submit material:", error);
      showToast(error?.message || 'Failed to save material', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item, explicitChecked = undefined) => {
    // Current disabled state
    const currentlyDisabled = item.isDisabled !== undefined 
      ? Boolean(item.isDisabled) 
      : (item.status === 'Inactive' || item.status === 'Disabled');

    // Toggle to opposite state
    const newIsDisabled = typeof explicitChecked === 'boolean' 
      ? !explicitChecked 
      : !currentlyDisabled;

    const newStatus = newIsDisabled ? 'Inactive' : 'Active';

    // Optimistic UI update
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, status: newStatus, isDisabled: newIsDisabled } : i
    ));

    try {
      const payload = {
        FlagId: 10,
        MaterialId: item.id,
        IsDisabled: newIsDisabled,
        UpdatedByUserId: currentUserId ? Number(currentUserId) : undefined,
        UpdatedAt: new Date().toISOString()
      };

      const response = await itemCreationService.toggleStatus(payload);
      if (response && (response.status === 'success' || response.success)) {
        showToast(response.message || `Material ${newStatus === 'Active' ? 'activated' : 'disabled'} successfully`, 'success');
      } else {
        throw new Error(response?.message || 'Status update failed');
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert if API fails
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: item.status, isDisabled: item.isDisabled } : i
      ));
      showToast(error?.message || 'Failed to update status', 'error');
    }
  };

  // Filter sub-categories by selected category (FlagId: 3)
  const availableSubCategories = formData.categoryId
    ? dropdowns.subCategories.filter(sc => String(sc.categoryId) === String(formData.categoryId))
    : dropdowns.subCategories;

  // Filter GST Rates by selected GST Type (FlagId: 6 filtered by FlagId: 5)
  const availableGSTRates = formData.gstTypeId
    ? dropdowns.gstRates.filter(r => String(r.gstTypeId) === String(formData.gstTypeId))
    : dropdowns.gstRates;

  const filteredData = items.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.subCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.userName || item.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'CODE',
      accessorKey: 'code',
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{row.original.code || '—'}</span>
      )
    },
    {
      header: 'MATERIAL / ITEM NAME',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-100">{row.original.name}</span>
          </div>
          {(row.original.brand || row.original.model) && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-6 pt-0.5">
              {row.original.brand && <span className="font-medium text-slate-700 dark:text-slate-300">{row.original.brand}</span>}
              {row.original.brand && row.original.model && <span>•</span>}
              {row.original.model && <span>{row.original.model}</span>}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'CATEGORY',
      accessorKey: 'category',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
            {row.original.category || '—'}
          </span>
        </div>
      )
    },
    {
      header: 'SUB CATEGORY',
      accessorKey: 'subCategory',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-600 dark:text-slate-400 text-xs">
            {row.original.subCategory || '—'}
          </span>
        </div>
      )
    },
    {
      header: 'UOM',
      accessorKey: 'uom',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {row.original.uom || '—'}
        </span>
      )
    },
    {
      header: 'GST',
      accessorKey: 'gstTypeName',
      cell: ({ row }) => (
        row.original.gstTypeName ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <Percent className="w-3 h-3 text-emerald-500" />
            {row.original.gstTypeName} {row.original.gstPercentage ? `(${row.original.gstPercentage}%)` : ''}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )
      )
    },
    {
      header: 'STATUS',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      header: 'CREATED AT',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
          <Calendar className="w-3 h-3" />
          {row.original.createdAt}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Items"
        description="Manage system material items, classifications, taxations and configurations."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Master', path: '/master' },
          { label: 'Item Creation', path: '/master/item-creation' }
        ]}
      />

      {/* Modern ERP DataTable Component */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search by material code, name, category, brand..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenModal(null, 'create')}
        onEditClick={(row) => handleOpenModal(row, 'edit')}
        onViewClick={(row) => handleOpenModal(row, 'view')}
        onToggleStatusClick={handleToggleStatus}
        onRefresh={fetchItems}
        hideExport
      />

      {/* Create / Edit / View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewing ? 'View Material Item' : (isEditing ? 'Edit Material Item' : 'Create Material Item')}
        icon={Package}
        size="xl"
        actions={
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <Button variant="secondary" onClick={handleCloseModal} className="flex-1 sm:flex-none">
              {isViewing ? 'Close' : 'Cancel'}
            </Button>
            {!isViewing && (
              <Button 
                variant="primary" 
                type="submit" 
                form="item-creation-form"
                disabled={submitting}
                className="flex-1 sm:flex-none"
              >
                {submitting ? 'Saving...' : (isEditing ? 'Update Material' : 'Create Material')}
              </Button>
            )}
          </div>
        }
      >
        <form id="item-creation-form" onSubmit={handleSubmit} className="space-y-5">
          {!isViewing && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>Fields marked with an asterisk (<span className="text-rose-500 font-bold">*</span>) are mandatory.</span>
            </div>
          )}

          {/* Section 1: Classification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <Tag className="w-3.5 h-3.5 text-primary" />
              Material Classification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Material Category {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <select
                    required
                    disabled={isViewing}
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select Material Category</option>
                    {dropdowns.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.code ? `(${cat.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Sub Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Material Sub Category {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <select
                    required
                    disabled={isViewing}
                    value={formData.subCategoryId}
                    onChange={handleSubCategoryChange}
                    className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select Material Sub Category</option>
                    {availableSubCategories.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name} {sc.code ? `(${sc.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Material Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <Package className="w-3.5 h-3.5 text-primary" />
              Material Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Material Code {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <Input 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. MAT001"
                  disabled={isViewing}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Material Name {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. HP Laptop"
                  disabled={isViewing}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Brand Name
                </label>
                <Input 
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. HP"
                  disabled={isViewing}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Model Number
                </label>
                <Input 
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. Latitude 5450"
                  disabled={isViewing}
                />
              </div>

              {/* UOM */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Unit of Measurement (UOM)
                </label>
                <div className="relative">
                  <select
                    disabled={isViewing}
                    value={formData.uomId}
                    onChange={handleUOMChange}
                    className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select UOM</option>
                    {dropdowns.uoms.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.code ? `(${u.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Warranty */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Warranty (Years)
                </label>
                <Input 
                  type="number"
                  step="0.5"
                  value={formData.warrantyYears}
                  onChange={(e) => setFormData({ ...formData, warrantyYears: e.target.value })}
                  placeholder="e.g. 3.0"
                  disabled={isViewing}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tax & Document Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <Percent className="w-3.5 h-3.5 text-primary" />
              Tax & Document Compliance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* GST Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  GST Type
                </label>
                <div className="relative">
                  <select
                    disabled={isViewing}
                    value={formData.gstTypeId}
                    onChange={handleGSTTypeChange}
                    className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select GST Type</option>
                    {dropdowns.gstTypes.map((g) => (
                      <option key={g.GSTTypeId} value={g.GSTTypeId}>
                        {g.GSTTypeName} {g.GSTTypeFullName ? `(${g.GSTTypeFullName})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* GST Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  GST Rate
                </label>
                <div className="relative">
                  <select
                    disabled={isViewing}
                    value={formData.gstRateId}
                    onChange={handleGSTRateChange}
                    className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select GST Rate</option>
                    {availableGSTRates.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.percentage}% {r.gstTypeName ? `(${r.gstTypeName})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* HSN/SAC */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  HSN / SAC Code
                </label>
                <Input 
                  value={formData.hsnSac}
                  onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                  placeholder="e.g. 84713010"
                  disabled={isViewing}
                />
              </div>

              {/* Attach Document (Loaded dynamically from API) */}
              <div className="space-y-2 sm:col-span-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Attach {dropdowns.fileTypes?.[0]?.name ? `${dropdowns.fileTypes[0].name} Document` : 'Document'}
                    </label>
                  </div>
                  {dropdowns.fileTypes?.[0]?.name && (
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      File Type: {dropdowns.fileTypes[0].name}
                    </span>
                  )}
                </div>
                {dropdowns.fileTypes?.[0]?.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {dropdowns.fileTypes[0].description} (.pdf, .jpg, .jpeg, .png, .webp)
                  </p>
                )}

                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    disabled={isViewing}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full h-10 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 cursor-pointer"
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg px-3 py-2">
                    <span className="font-medium truncate flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      Attached: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    {!isViewing && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-slate-400 hover:text-red-500 font-bold px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-2"
                        title="Remove attached file"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <ClipboardList className="w-3.5 h-3.5 text-primary" />
              Specifications & Notes
            </h4>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Specification / Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter specifications..."
                disabled={isViewing}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 resize-none"
              />
            </div>
          </div>

          {/* View Mode Extra Details */}
          {isViewing && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Status
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <StatusBadge status={formData.status} />
                </div>
              </div>

              {formData.createdAt && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Created At
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      value={formData.createdAt}
                      disabled={true}
                      className="pl-9 cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              )}

              {formData.updatedAt && formData.updatedAt !== '—' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Updated At
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      value={formData.updatedAt}
                      disabled={true}
                      className="pl-9 cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              )}

              {formData.updatedBy && formData.updatedBy !== '—' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Updated By
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      value={formData.updatedBy}
                      disabled={true}
                      className="pl-9 cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
