import React, { useState, useEffect } from 'react';
import {
  PageHeader,
  Button,
  StatusBadge,
  Input
} from '../../components/ui/index';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import {
  Edit,
  Eye
} from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { vendorService } from '../../services/vendorService';
import { validatePhone, validateEmail, validateName, validateCode, validateGSTIN } from '../../utils/validators';

export default function VendorManagementView() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);
  const currentUserName = currentUser?.loginName || currentUser?.name || '';
  const currentUserId = currentUser?.UserId || currentUser?.EmployeeId || currentUser?.id || currentUser?.userId;

  // Data State
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dropdown States
  const [vendorTypes, setVendorTypes] = useState([]);
  const [vendorFileTypes, setVendorFileTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Form State matching exact backend payload
  const initialFormState = {
    id: null,
    vendorCode: '',
    vendorName: '',
    vendorTypeId: '',
    vendorTypeName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstNumber: '',
    city: '',
    vendorAddress1: '',
    vendorAddress2: '',
    remarks: '',
    bankName: '',
    accountHolderName: '',
    ifscCode: '',
    files: [],
    selectedFileTypeId: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Field-level validator for all vendor fields
  const validateField = (name, value, currentFormData = formData) => {
    switch (name) {
      case 'vendorCode': {
        const err = validateCode(value, 'Vendor Code', true);
        return err || '';
      }
      case 'vendorName': {
        const val = (value || '').trim();
        if (!val) return 'Vendor Name is required';
        if (val.length < 2) return 'Min 2 characters';
        if (val.length > 150) return 'Max 150 characters';
        return '';
      }
      case 'vendorTypeId': {
        if (!value) return 'Vendor Type is required';
        return '';
      }
      case 'contactPerson': {
        const err = validateName(value, 'Contact Person', false, 2, 80);
        return err || '';
      }
      case 'phone': {
        const err = validatePhone(value, 'Phone number', false);
        return err || '';
      }
      case 'email': {
        const err = validateEmail(value, 'Email', false);
        return err || '';
      }
      case 'city': {
        const err = validateName(value, 'City', false, 2, 50);
        return err || '';
      }
      case 'gstNumber': {
        const err = validateGSTIN(value, 'GSTIN', false);
        return err || '';
      }
      case 'vendorAddress1': {
        const val = (value || '').trim();
        if (val) {
          if (val.length < 3) return 'Min 3 characters';
          if (val.length > 200) return 'Max 200 characters';
        }
        return '';
      }
      case 'vendorAddress2': {
        const val = (value || '').trim();
        if (val) {
          if (val.length < 2) return 'Min 2 characters';
          if (val.length > 200) return 'Max 200 characters';
        }
        return '';
      }
      case 'remarks': {
        const val = (value || '').trim();
        if (val && val.length > 250) {
          return 'Max 250 characters';
        }
        return '';
      }
      case 'bankName': {
        const val = (value || '').trim();
        if (val) {
          if (val.length < 2) return 'Min 2 characters';
          if (val.length > 80) return 'Max 80 characters';
          if (!/^[a-zA-Z\s.&-]+$/.test(val)) return 'Letters only';
        }
        return '';
      }
      case 'accountHolderName': {
        const val = (value || '').trim();
        if (val) {
          if (val.length < 2) return 'Min 2 characters';
          if (val.length > 80) return 'Max 80 characters';
          if (!/^[a-zA-Z\s.&-]+$/.test(val)) return 'Letters only';
        }
        return '';
      }
      case 'ifscCode': {
        const val = (value || '').trim().toUpperCase();
        if (val) {
          if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(val)) {
            return 'Invalid 11-char IFSC';
          }
        }
        return '';
      }
      default:
        return '';
    }
  };

  // Validation Rules for all fields
  const validateForm = () => {
    const errs = {};
    const allFields = [
      'vendorCode',
      'vendorName',
      'vendorTypeId',
      'contactPerson',
      'phone',
      'email',
      'city',
      'gstNumber',
      'vendorAddress1',
      'vendorAddress2',
      'remarks',
      'bankName',
      'accountHolderName',
      'ifscCode'
    ];

    allFields.forEach((f) => {
      const err = validateField(f, formData[f], formData);
      if (err) errs[f] = err;
    });

    return errs;
  };

  // Immediate validation handler on change
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const err = validateField(field, value, { ...formData, [field]: value });
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }
  };

  // Immediate validation handler on blur
  const handleFieldBlur = (field) => {
    const err = validateField(field, formData[field], formData);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  // Load Vendors
  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load Dropdowns (FlagId: 2 -> Vendor Types, FlagId: 3 -> Vendor File Types)
  const loadDropdowns = async () => {
    setLoadingDropdowns(true);
    try {
      const [types, fileTypes] = await Promise.all([
        vendorService.getVendorTypes(),
        vendorService.getVendorFileTypes()
      ]);
      setVendorTypes(Array.isArray(types) ? types : []);
      setVendorFileTypes(Array.isArray(fileTypes) ? fileTypes : []);
    } catch (err) {
      console.error('Failed to load vendor dropdowns:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    loadVendors();
    loadDropdowns();
  }, []);

  // Open Handlers
  const handleOpenAdd = () => {
    setIsEditing(false);
    setIsViewing(false);
    setErrors({});
    setFormData({ ...initialFormState });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor) => {
    setIsEditing(true);
    setIsViewing(false);
    setSelectedVendor(vendor);

    const matchedType = vendorTypes.find(
      (vt) => String(vt.id) === String(vendor.vendorTypeId || vendor.VendorTypeId) ||
              String(vt.VendorTypeId) === String(vendor.vendorTypeId || vendor.VendorTypeId) ||
              (vt.name && (vt.name.toLowerCase() === (vendor.vendorTypeName || vendor.category)?.toLowerCase()))
    );

    const initialFiles = Array.isArray(vendor.Files)
      ? vendor.Files
      : (Array.isArray(vendor.files) ? vendor.files : (Array.isArray(vendor.raw?.Files) ? vendor.raw.Files : []));

    setFormData({
      ...initialFormState,
      ...vendor,
      vendorTypeId: matchedType ? (matchedType.VendorTypeId ?? matchedType.id) : (vendor.vendorTypeId || vendor.VendorTypeId || ''),
      vendorTypeName: matchedType ? (matchedType.VendorTypeName ?? matchedType.name) : (vendor.vendorTypeName || vendor.category || ''),
      vendorAddress1: vendor.vendorAddress1 || vendor.VendorAddress1 || vendor.address || '',
      vendorAddress2: vendor.vendorAddress2 || vendor.VendorAddress2 || '',
      accountHolderName: vendor.accountHolderName || vendor.AccountHolderName || '',
      remarks: vendor.remarks || vendor.Remarks || '',
      files: initialFiles,
      selectedFileTypeId: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenView = (vendor) => {
    setSelectedVendor(vendor);
    setIsViewing(true);
  };

  // Toggle Status
  const handleToggleStatus = async (vendor) => {
    try {
      const res = await vendorService.toggleStatus(vendor, vendor.status);
      showToast(`Vendor marked as ${res.nextStatus}`, 'success');
      loadVendors();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run complete form validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const fieldNames = {
        vendorCode: 'Vendor Code',
        vendorName: 'Vendor Business Name',
        vendorTypeId: 'Vendor Type',
        contactPerson: 'Contact Person',
        phone: 'Phone / Mobile',
        email: 'Email Address',
        city: 'City',
        gstNumber: 'GSTIN / Tax ID',
        vendorAddress1: 'Address Line 1',
        vendorAddress2: 'Address Line 2',
        remarks: 'Remarks',
        bankName: 'Bank Name',
        accountHolderName: 'Account Holder Name',
        ifscCode: 'IFSC Code'
      };
      const firstField = Object.keys(validationErrors)[0];
      const firstMsg = validationErrors[firstField];
      showToast(`${fieldNames[firstField] || firstField}: ${firstMsg}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        VendorId: formData.id || formData.VendorId,
        VendorName: formData.vendorName,
        VendorCode: formData.vendorCode || '',
        VendorTypeId: formData.vendorTypeId ? Number(formData.vendorTypeId) : undefined,
        VendorTypeName: formData.vendorTypeName || '',
        ContactPerson: formData.contactPerson || '',
        MobileNumber: formData.phone || '',
        Email: formData.email || '',
        GSTINUINNumber: formData.gstNumber || '',
        City: formData.city || '',
        BankName: formData.bankName || '',
        AccountHolderName: formData.accountHolderName || '',
        IFSCCode: formData.ifscCode || '',
        VendorAddress1: formData.vendorAddress1 || '',
        VendorAddress2: formData.vendorAddress2 || '',
        Remarks: formData.remarks || '',
        CreatedByUserId: currentUserId ? Number(currentUserId) : undefined,
        UpdatedByUserId: currentUserId ? Number(currentUserId) : undefined,
        Files: formData.files || []
      };

      if (isEditing) {
        await vendorService.updateVendor(payload);
        showToast('Vendor updated successfully', 'success');
      } else {
        await vendorService.addVendor({
          ...payload,
          CreatedByUserName: currentUserName
        });
        showToast('Vendor created successfully', 'success');
      }
      setIsModalOpen(false);
      loadVendors();
    } catch {
      showToast('Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns
  const columns = [
    {
      id: 'id',
      header: '#',
      accessorKey: 'id',
      key: 'id'
    },
    {
      id: 'vendorCode',
      header: 'Vendor Code',
      accessorKey: 'vendorCode',
      key: 'vendorCode',
      cell: ({ row }) => (
        <span className="font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-mono">
          {row.original.vendorCode || row.original.VendorCode || '—'}
        </span>
      )
    },
    {
      id: 'vendorName',
      header: 'Vendor Name',
      accessorKey: 'vendorName',
      key: 'vendorName',
      cell: ({ row }) => {
        const name = row.original.vendorName || row.original.VendorName || row.original.CompanyName || '';
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {name ? name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                {name || '—'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {row.original.email || row.original.Email || '—'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      id: 'category',
      header: 'Vendor Type',
      accessorKey: 'category',
      key: 'category',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.original.vendorTypeName || row.original.VendorTypeName || '—'}
        </span>
      )
    },
    {
      id: 'contactPerson',
      header: 'Contact Person',
      accessorKey: 'contactPerson',
      key: 'contactPerson',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs">
            {row.original.contactPerson || row.original.ContactPerson || '—'}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {row.original.phone || row.original.MobileNumber || row.original.Phone || '—'}
          </span>
        </div>
      )
    },
    {
      id: 'gstNumber',
      header: 'GSTIN / UIN',
      accessorKey: 'gstNumber',
      key: 'gstNumber',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {row.original.gstNumber || row.original.GSTINUINNumber || row.original.GSTNumber || '—'}
        </span>
      )
    },
    {
      id: 'city',
      header: 'City',
      accessorKey: 'city',
      key: 'city',
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.original.city || row.original.City || '—'}
        </span>
      )
    },
    {
      id: 'bankDetails',
      header: 'Bank Details',
      key: 'bankDetails',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs">
            {row.original.bankName || row.original.BankName || '—'}
          </span>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            {row.original.ifscCode || row.original.IFSCCode || ''}
          </span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      key: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status || row.original.Status} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Vendor Management"
        description="Maintain authorized suppliers, vendor codes, GST identities, and banking details."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Master', href: '/master/companies' },
          { label: 'Vendor Management' }
        ]}
      />

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={vendors}
        loading={loading}
        onRefresh={loadVendors}
        onAddClick={handleOpenAdd}
        onViewClick={handleOpenView}
        onEditClick={handleOpenEdit}
        onToggleStatusClick={handleToggleStatus}
        searchPlaceholder="Search vendors..."
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditing ? `Edit Vendor: ${formData.vendorName}` : 'Add New Vendor'}
          size="2xl"
          className="max-w-5xl"
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                type="submit"
                form="vendor-modal-form"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Vendor'}
              </Button>
            </>
          }
        >
          <form id="vendor-modal-form" onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* LEFT COLUMN: Identification, Contact, Location */}
              <div className="lg:col-span-7 space-y-2.5">
                {/* 1. Identification & Contact */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    1. Basic Identification
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Vendor Code <span className="text-rose-500">*</span>
                        </label>
                        {errors.vendorCode && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[110px]" title={errors.vendorCode}>
                            {errors.vendorCode}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.vendorCode}
                        onChange={(e) => handleFieldChange('vendorCode', e.target.value)}
                        onBlur={() => handleFieldBlur('vendorCode')}
                        placeholder="e.g. VEN001"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg font-mono ${errors.vendorCode ? '!border-rose-400 !focus:ring-rose-400/20' : ''}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Vendor Business Name <span className="text-rose-500">*</span>
                        </label>
                        {errors.vendorName && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[130px]" title={errors.vendorName}>
                            {errors.vendorName}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.vendorName}
                        onChange={(e) => handleFieldChange('vendorName', e.target.value)}
                        onBlur={() => handleFieldBlur('vendorName')}
                        placeholder="e.g. Acme Industrial Supplies Ltd"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.vendorName ? '!border-rose-400 !focus:ring-rose-400/20' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Vendor Type <span className="text-rose-500">*</span>
                        </label>
                        {errors.vendorTypeId && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[90px]" title={errors.vendorTypeId}>
                            {errors.vendorTypeId}
                          </span>
                        )}
                      </div>
                      <select
                        value={formData.vendorTypeId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const found = vendorTypes.find((vt) => String(vt.id || vt.VendorTypeId) === String(selectedId));
                          setFormData((prev) => ({
                            ...prev,
                            vendorTypeId: selectedId,
                            vendorTypeName: found ? (found.name || found.VendorTypeName) : ''
                          }));
                          if (errors.vendorTypeId) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.vendorTypeId;
                              return next;
                            });
                          }
                        }}
                        onBlur={() => handleFieldBlur('vendorTypeId')}
                        className={`w-full h-8 px-2.5 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 ${errors.vendorTypeId ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'}`}
                      >
                        <option value="">Select Vendor Type...</option>
                        {vendorTypes.map((vt) => (
                          <option key={vt.id || vt.VendorTypeId} value={vt.id || vt.VendorTypeId}>
                            {vt.name || vt.VendorTypeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Contact Person
                        </label>
                        {errors.contactPerson && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[90px]" title={errors.contactPerson}>
                            {errors.contactPerson}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.contactPerson}
                        onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                        onBlur={() => handleFieldBlur('contactPerson')}
                        placeholder="e.g. Ramesh Chandra"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.contactPerson ? '!border-rose-400' : ''}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Phone / Mobile
                        </label>
                        {errors.phone && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[110px]" title={errors.phone}>
                            {errors.phone}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        onBlur={() => handleFieldBlur('phone')}
                        placeholder="e.g. 9876543210"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.phone ? '!border-rose-400' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Contact & Address */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    2. Contact & Address Details
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Email Address
                        </label>
                        {errors.email && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[90px]" title={errors.email}>
                            {errors.email}
                          </span>
                        )}
                      </div>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        placeholder="contact@vendor.com"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.email ? '!border-rose-400' : ''}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          City
                        </label>
                        {errors.city && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[90px]" title={errors.city}>
                            {errors.city}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        onBlur={() => handleFieldBlur('city')}
                        placeholder="e.g. Bengaluru"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.city ? '!border-rose-400' : ''}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          GSTIN / Tax ID
                        </label>
                        {errors.gstNumber && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[110px]" title={errors.gstNumber}>
                            {errors.gstNumber}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.gstNumber}
                        onChange={(e) => handleFieldChange('gstNumber', e.target.value.toUpperCase())}
                        onBlur={() => handleFieldBlur('gstNumber')}
                        placeholder="29ABCDE1234F1Z5"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg font-mono uppercase ${errors.gstNumber ? '!border-rose-400' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Address Line 1
                        </label>
                        {errors.vendorAddress1 && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[90px]" title={errors.vendorAddress1}>
                            {errors.vendorAddress1}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.vendorAddress1}
                        onChange={(e) => handleFieldChange('vendorAddress1', e.target.value)}
                        onBlur={() => handleFieldBlur('vendorAddress1')}
                        placeholder="No. 10, Main Road"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.vendorAddress1 ? '!border-rose-400' : ''}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Address Line 2
                        </label>
                        {errors.vendorAddress2 && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[90px]" title={errors.vendorAddress2}>
                            {errors.vendorAddress2}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.vendorAddress2}
                        onChange={(e) => handleFieldChange('vendorAddress2', e.target.value)}
                        onBlur={() => handleFieldBlur('vendorAddress2')}
                        placeholder="Area / Landmark"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.vendorAddress2 ? '!border-rose-400' : ''}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Remarks / Notes
                        </label>
                        {errors.remarks && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[90px]" title={errors.remarks}>
                            {errors.remarks}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.remarks}
                        onChange={(e) => handleFieldChange('remarks', e.target.value)}
                        onBlur={() => handleFieldBlur('remarks')}
                        placeholder="e.g. Regular supplier"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.remarks ? '!border-rose-400' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Bank Details & Documents */}
              <div className="lg:col-span-5 space-y-2.5">
                {/* 3. Bank Settlement */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    3. Banking Settlement
                  </h4>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Bank Name
                      </label>
                      {errors.bankName && (
                        <span className="text-[10px] font-medium text-rose-500 truncate max-w-[120px]" title={errors.bankName}>
                          {errors.bankName}
                        </span>
                      )}
                    </div>
                    <Input
                      value={formData.bankName}
                      onChange={(e) => handleFieldChange('bankName', e.target.value)}
                      onBlur={() => handleFieldBlur('bankName')}
                      placeholder="e.g. HDFC Bank"
                      className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.bankName ? '!border-rose-400' : ''}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Account Holder Name
                        </label>
                        {errors.accountHolderName && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[100px]" title={errors.accountHolderName}>
                            {errors.accountHolderName}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.accountHolderName}
                        onChange={(e) => handleFieldChange('accountHolderName', e.target.value)}
                        onBlur={() => handleFieldBlur('accountHolderName')}
                        placeholder="e.g. ABC Suppliers"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg ${errors.accountHolderName ? '!border-rose-400' : ''}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          IFSC Code
                        </label>
                        {errors.ifscCode && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[110px]" title={errors.ifscCode}>
                            {errors.ifscCode}
                          </span>
                        )}
                      </div>
                      <Input
                        value={formData.ifscCode}
                        onChange={(e) => handleFieldChange('ifscCode', e.target.value.toUpperCase())}
                        onBlur={() => handleFieldBlur('ifscCode')}
                        placeholder="HDFC0001234"
                        className={`h-8 py-1 px-2.5 text-xs rounded-lg font-mono uppercase ${errors.ifscCode ? '!border-rose-400' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Documents & File Types */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      4. Documents & Attachments
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Vendor File Type
                        </label>
                        {errors.selectedFileTypeId && (
                          <span className="text-[10px] font-medium text-rose-500 truncate max-w-[100px]" title={errors.selectedFileTypeId}>
                            {errors.selectedFileTypeId}
                          </span>
                        )}
                      </div>
                      <select
                        value={formData.selectedFileTypeId}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, selectedFileTypeId: e.target.value }));
                          if (errors.selectedFileTypeId) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.selectedFileTypeId;
                              return next;
                            });
                          }
                        }}
                        onBlur={() => handleFieldBlur('selectedFileTypeId')}
                        className={`w-full h-8 px-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 ${errors.selectedFileTypeId ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'}`}
                      >
                        <option value="">Select Document Type...</option>
                        {vendorFileTypes.map((ft) => (
                          <option key={ft.id || ft.VendorFileTypeId} value={ft.id || ft.VendorFileTypeId}>
                            {ft.name || ft.VendorFileTypeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Choose Document
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validation 1: Document Type must be selected
                          if (!formData.selectedFileTypeId) {
                            setErrors(prev => ({ ...prev, selectedFileTypeId: 'Select type first' }));
                            showToast('Please select a Document Type before choosing a file', 'error');
                            e.target.value = '';
                            return;
                          }

                          // Validation 2: Max file size 10MB
                          if (file.size > 10 * 1024 * 1024) {
                            showToast('File size must not exceed 10 MB', 'error');
                            e.target.value = '';
                            return;
                          }

                          // Validation 3: Allowed file extensions
                          const ext = file.name.split('.').pop()?.toLowerCase() || '';
                          if (!['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'].includes(ext)) {
                            showToast('Only PDF, JPG, PNG, and DOC files are allowed', 'error');
                            e.target.value = '';
                            return;
                          }

                          const fileTypeObj = vendorFileTypes.find(
                            ft => String(ft.id || ft.VendorFileTypeId) === String(formData.selectedFileTypeId)
                          );
                          const newFile = {
                            id: Date.now(),
                            VendorFileTypeId: formData.selectedFileTypeId ? Number(formData.selectedFileTypeId) : null,
                            VendorFileTypeName: fileTypeObj ? (fileTypeObj.name || fileTypeObj.VendorFileTypeName) : '',
                            FileName: file.name,
                            fileInstance: file,
                            fileSize: (file.size / 1024).toFixed(1) + ' KB'
                          };
                          setFormData({
                            ...formData,
                            files: [...(formData.files || []), newFile]
                          });
                          e.target.value = '';
                        }}
                        className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                      />
                    </div>
                  </div>

                  {/* Attached Files Tags */}
                  {formData.files && formData.files.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pt-1">
                      {formData.files.map((fItem, fIdx) => (
                        <span
                          key={fItem.id || fIdx}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-indigo-700 dark:text-indigo-300"
                        >
                          <span className="font-medium truncate max-w-[120px]" title={fItem.FileName || fItem.fileName}>
                            {fItem.VendorFileTypeName ? `${fItem.VendorFileTypeName}: ` : ''}{fItem.FileName || fItem.fileName}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, files: formData.files.filter((_, i) => i !== fIdx) })}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-0.5 cursor-pointer"
                            title="Remove attachment"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No documents attached yet</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {isViewing && selectedVendor && (
        <Modal
          isOpen={isViewing}
          onClose={() => setIsViewing(false)}
          title={`Vendor Profile: ${selectedVendor.vendorName}`}
          size="md"
        >
          <div className="space-y-6 text-sm">
            {/* Top Identity Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedVendor.vendorName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedVendor.vendorName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      {selectedVendor.vendorCode}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-500">{selectedVendor.category}</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={selectedVendor.status} />
            </div>

            {/* Quick Grid Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block mb-1">Primary Contact</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedVendor.contactPerson || '—'}
                </p>
                <p className="text-slate-500 mt-0.5">{selectedVendor.phone || selectedVendor.mobileNumber || 'No phone'}</p>
                <p className="text-slate-500">{selectedVendor.email || 'No email'}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block mb-1">Tax & Remarks</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  GSTIN / UIN: {selectedVendor.gstNumber || '—'}
                </p>
                <p className="text-slate-500 mt-0.5">Remarks: {selectedVendor.remarks || '—'}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block mb-1">Banking Settlement</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedVendor.bankName || '—'}
                </p>
                {selectedVendor.accountHolderName && (
                  <p className="text-slate-500 mt-0.5">Holder: {selectedVendor.accountHolderName}</p>
                )}
                <p className="text-slate-500">IFSC: {selectedVendor.ifscCode || '—'}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block mb-1">Registered Address</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedVendor.vendorAddress1 || selectedVendor.address || '—'}
                </p>
                {selectedVendor.vendorAddress2 && (
                  <p className="text-slate-500 mt-0.5">{selectedVendor.vendorAddress2}</p>
                )}
                <p className="text-slate-500 mt-0.5">
                  City: {selectedVendor.city || '—'}
                </p>
              </div>
            </div>

            {/* Attached Documents if available */}
            {selectedVendor && ((Array.isArray(selectedVendor.Files) && selectedVendor.Files.length > 0) || (Array.isArray(selectedVendor.files) && selectedVendor.files.length > 0)) && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block mb-2 font-semibold text-xs">Attached Documents</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedVendor.Files || selectedVendor.files).map((f, i) => (
                    <div key={i} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {f.VendorFileTypeName || f.fileTypeName || 'Document'}
                      </span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[150px]">{f.FileName || f.fileName || 'Attachment'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit / Timestamp Footer info */}
            <div className="p-3 rounded-lg bg-slate-50/60 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>Created: {selectedVendor.createdAt || '—'}</span>
              <span>Updated: {selectedVendor.updatedAt || '—'}</span>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsViewing(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
