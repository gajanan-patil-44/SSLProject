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

import { materialCategoryTypeService } from '../services';

export default function MaterialCategoryCreation() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    name: '',
    status: 'Active'
  });

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await materialCategoryTypeService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (item = null, mode = 'create') => {
    setIsViewing(mode === 'view');
    
    if (item) {
      setIsEditing(mode === 'edit');
      setFormData({
        id: item.id,
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const userName = currentUser?.loginName || currentUser?.name || currentUser?.userName || '';
    
    try {
      if (isEditing) {
        const payload = {
          flagId: 3,
          MaterialCategoryTypeId: formData.id,
          MaterialCategoryTypeName: formData.name,
          MaterialCategoryTypeCode: formData.code,
          UpdatedByUserName: userName
        };
        
        console.log('Update Payload:', payload);
        const response = await materialCategoryTypeService.updateCategory(payload);
        
        if (response && response.status === 'success') {
          await fetchCategories();
        }
      } else {
        const payload = {
          flagId: 2,
          MaterialCategoryTypeName: formData.name,
          MaterialCategoryTypeCode: formData.code,
          IsDisabled: formData.status === 'Inactive',
          CreatedByUserName: userName
        };
        
        console.log('Create Payload:', payload);
        const response = await materialCategoryTypeService.createCategory(payload);
        
        if (response && response.status === 'success') {
          await fetchCategories();
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
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const response = await materialCategoryTypeService.deleteCategory(id);
      if (response && response.status === 'success') {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleToggleStatus = async (item, checked) => {
    const newStatus = checked ? 'Active' : 'Inactive';
    
    // Optimistic UI update
    setCategories(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: newStatus } : i
    ));

    try {
      const userName = currentUser?.loginName || currentUser?.name || currentUser?.userName || '';
      const payload = {
        flagId: 4,
        IsDisabled: !checked,
        UpdatedByUserName: userName,
        MaterialCategoryTypeId: item.id
      };
      
      const response = await materialCategoryTypeService.toggleStatus(payload);
      
      if (!response || response.status !== 'success') {
        throw new Error('Status update failed');
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert if API fails
      setCategories(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: item.status } : i
      ));
      showToast('Failed to update status', 'error');
    }
  };

  const filteredData = categories.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [

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
        title="Manage Categories"
        description="Manage system material categories, configurations and access permissions."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Master', path: '/master' },
          { label: 'Manage Category', path: '/master/material-category' }
        ]}
      />

      {/* Modern ERP DataTable Component */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search by category name, code..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenModal(null, 'create')}
        onEditClick={(row) => handleOpenModal(row, 'edit')}
        onViewClick={(row) => handleOpenModal(row, 'view')}
        onToggleStatusClick={(row) => handleToggleStatus(row, row.status !== 'Active')}
        onRefresh={fetchCategories}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewing ? 'View Category' : (isEditing ? 'Edit Category' : 'Create Category')}
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
                {isEditing ? 'Update Category' : 'Create Category'}
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
              Category Code {!isViewing && <span className="text-rose-500">*</span>}
            </label>
            <Input 
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Enter Category Code"
              disabled={isViewing}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Category Name {!isViewing && <span className="text-rose-500">*</span>}
            </label>
            <Input 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter Category Name"
              disabled={isViewing}
            />
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
