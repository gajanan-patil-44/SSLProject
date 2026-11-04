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
  ClipboardList
} from 'lucide-react';
import { useERPStore } from '../store/useERPStore';

import { materialSubCategoryTypeService } from '../services';
import { validateCode } from '../utils/validators';

export default function MaterialSubCategoryCreation() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  // State
  const [subCategories, setSubCategories] = useState([]);
  const [categoryDropdown, setCategoryDropdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    category: '', 
    code: '',
    name: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!formData.category) {
      errs.category = 'Material Category selection is required';
    }

    const codeErr = validateCode(formData.code, 'Material Sub Category Code', true);
    if (codeErr) errs.code = codeErr;

    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) {
      errs.name = 'Material Sub Category Name is required';
    } else if (trimmedName.length < 2) {
      errs.name = 'Material Sub Category Name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      errs.name = 'Material Sub Category Name cannot exceed 100 characters';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Fetch dropdown values (only when modal opens)
  const fetchCategoryDropdown = async () => {
    if (categoryDropdown.length > 0) return; // Don't fetch if already fetched
    try {
      const data = await materialSubCategoryTypeService.getCategoryDropdown();
      setCategoryDropdown(data);
    } catch (error) {
      console.error("Failed to fetch dropdown:", error);
    }
  };

  // Fetch all sub categories
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const data = await materialSubCategoryTypeService.getSubCategories();
      setSubCategories(data);
    } catch (error) {
      console.error("Failed to fetch sub categories:", error);
      showToast('Failed to load sub categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const handleOpenModal = async (item = null, mode = 'create') => {
    // Fetch dropdown before opening the modal
    await fetchCategoryDropdown();
    
    setIsViewing(mode === 'view');
    setFormErrors({});
    
    if (item) {
      setIsEditing(mode === 'edit');
      // Map back to form state
      const matchedCategory = categoryDropdown.find(c => c.MaterialCategoryTypeName === item.category);
      setFormData({
        id: item.id,
        category: matchedCategory ? matchedCategory.MaterialCategoryTypeId : '',
        code: item.code,
        name: item.name,
        status: item.status,
        createdBy: item.createdBy,
        createdAt: item.createdAt
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        category: '',
        code: '',
        name: '',
        status: 'Active',
        createdBy: '',
        createdAt: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewing(false);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the validation errors.', 'error');
      return;
    }
    setSubmitting(true);
    
    const userName = currentUser?.loginName || currentUser?.name || currentUser?.userName || '';
    
    try {
      if (isEditing) {
        const payload = {
          FlagId: 4,
          MaterialSubCategoryTypeId: formData.id,
          MaterialCategoryTypeId: Number(formData.category),
          MaterialSubCategoryTypeName: formData.name,
          MaterialSubCategoryTypeCode: formData.code,
          UpdatedByUserName: userName
        };
        
        console.log('Update Payload:', payload);
        const response = await materialSubCategoryTypeService.updateSubCategory(payload);
        
        if (response && response.status === 'success') {
          await fetchSubCategories();
        }
      } else {
        const payload = {
          FlagId: 2,
          MaterialCategoryTypeId: Number(formData.category),
          MaterialSubCategoryTypeName: formData.name,
          MaterialSubCategoryTypeCode: formData.code,
          CreatedByUserName: userName
        };
        
        console.log('Create Payload:', payload);
        const response = await materialSubCategoryTypeService.createSubCategory(payload);
        
        if (response && response.status === 'success') {
          await fetchSubCategories();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this material sub category?");
    if (!confirmDelete) return;

    try {
      const response = await materialSubCategoryTypeService.deleteSubCategory(id);
      if (response && response.status === 'success') {
        await fetchSubCategories();
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleToggleStatus = async (item, checked) => {
    const newStatus = checked ? 'Active' : 'Inactive';
    
    // Optimistic UI update
    setSubCategories(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: newStatus } : i
    ));

    try {
      const response = await materialSubCategoryTypeService.toggleStatus(item.id, !checked);
      
      if (!response || response.status !== 'success') {
        throw new Error('Status update failed');
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert if API fails
      setSubCategories(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: item.status } : i
      ));
      showToast('Failed to update status', 'error');
    }
  };

  const filteredData = subCategories.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'CATEGORY', 
      accessorKey: 'category',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-slate-900 dark:text-white">{row.original.category}</span>
        </div>
      )
    },
    { 
      header: 'CODE', 
      accessorKey: 'code',
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{row.original.code}</span>
      )
    },
    { 
      header: 'NAME', 
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">{row.original.name}</span>
        </div>
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
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <Calendar className="w-3 h-3" />
          {row.original.createdAt}
        </div>
      )
    },
    { 
      header: 'CREATED BY', 
      accessorKey: 'createdBy',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <User className="w-3 h-3" />
          {row.original.createdBy}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Sub Categories"
        description="Manage system material sub categories, configurations and access permissions."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Master', path: '/master' },
          { label: 'Material Sub Category', path: '/master/material-sub-category' }
        ]}
      />

      {/* Modern ERP DataTable Component */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search by material sub category name, code..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenModal(null, 'create')}
        onEditClick={(row) => handleOpenModal(row, 'edit')}
        onViewClick={(row) => handleOpenModal(row, 'view')}
        onToggleStatusClick={(row) => handleToggleStatus(row, row.status !== 'Active')}
        onRefresh={fetchSubCategories}
        hideExport
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewing ? 'View Material Sub Category' : (isEditing ? 'Edit Material Sub Category' : 'Create Material Sub Category')}
        icon={ClipboardList}
        maxWidth="lg"
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleCloseModal}
            >
              Close
            </Button>
            {!isViewing && (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={submitting}
              >
                {isEditing ? 'Update Material Sub Category' : 'Create Material Sub Category'}
              </Button>
            )}
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isViewing && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Please fill mandatory information below <span className="text-rose-500 font-bold">*</span>
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Material Category {!isViewing && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                }}
                disabled={isViewing}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${
                  formErrors.category ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600'
                } ${isViewing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
              >
                <option value="" disabled>Select Material Category</option>
                {categoryDropdown.map(cat => (
                  <option key={cat.MaterialCategoryTypeId} value={cat.MaterialCategoryTypeId}>
                    {cat.MaterialCategoryTypeName}
                  </option>
                ))}
              </select>
              {!isViewing && (
                <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
            {formErrors.category && (
              <span className="text-[11px] text-rose-500 font-medium block">{formErrors.category}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Material Sub Category Code {!isViewing && <span className="text-rose-500">*</span>}
            </label>
            <Input 
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value });
                if (formErrors.code) setFormErrors({ ...formErrors, code: '' });
              }}
              placeholder="e.g. SUB-001"
              disabled={isViewing}
              className={formErrors.code ? 'border-rose-400 focus:border-rose-500' : ''}
            />
            {formErrors.code && (
              <span className="text-[11px] text-rose-500 font-medium block">{formErrors.code}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Material Sub Category Name {!isViewing && <span className="text-rose-500">*</span>}
            </label>
            <Input 
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              placeholder="e.g. Transformers & Power"
              disabled={isViewing}
              className={formErrors.name ? 'border-rose-400 focus:border-rose-500' : ''}
            />
            {formErrors.name && (
              <span className="text-[11px] text-rose-500 font-medium block">{formErrors.name}</span>
            )}
          </div>

          {isViewing && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Status
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <StatusBadge status={formData.status} />
                </div>
              </div>

              {formData.createdBy && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Created By
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      value={formData.createdBy}
                      disabled={true}
                      className="pl-9 cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              )}

              {formData.createdAt && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
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
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}
