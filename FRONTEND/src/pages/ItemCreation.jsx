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
  Scale,
  ExternalLink,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { BASE_URL } from '../routes/apiRoutes';
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
  const [existingFiles, setExistingFiles] = useState([]);
  const [viewingFileId, setViewingFileId] = useState(null);

  // Modal In-View Document Tabs State
  const [activeModalTab, setActiveModalTab] = useState('details'); // 'details' | 'document'
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewCache, setPreviewCache] = useState({});

  // Image Viewer Controls State (Zoom, Rotate, Pan)
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCurrentImage, setIsCurrentImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Helper: check if file is an image format
  const isImageFile = (fileName = '', previewUrl = '', fileObj = null) => {
    const extTarget = (fileName || fileObj?.filePath || fileObj?.fileName || previewUrl || '').toLowerCase();
    const isExtImage = extTarget.includes('.jpg') || extTarget.includes('.jpeg') || extTarget.includes('.png') || extTarget.includes('.webp') || extTarget.includes('.gif') || extTarget.includes('.svg');
    if (isExtImage) return true;
    if (typeof previewUrl === 'string' && previewUrl.startsWith('data:image/')) return true;
    return false;
  };

  // Image manipulation handlers
  const handleZoomIn = () => {
    setImageZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4.0));
  };

  const handleZoomOut = () => {
    setImageZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.25));
  };

  const handleRotateRight = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateLeft = () => {
    setImageRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleResetImage = () => {
    setImageZoom(1);
    setImageRotation(0);
    setImagePosition({ x: 0, y: 0 });
    setIsDraggingImage(false);
    setImageLoadError(false);
  };

  const handleMouseDown = (e) => {
    if (imageZoom > 1) {
      e.preventDefault();
      setIsDraggingImage(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingImage && imageZoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  const handleDoubleClick = () => {
    if (imageZoom === 1) {
      setImageZoom(2);
    } else {
      handleResetImage();
    }
  };

  // Safely construct document URL
  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path;
    }
    const cleanBase = BASE_URL ? BASE_URL.replace(/\/+$/, '') : '';
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return cleanBase ? `${cleanBase}/${cleanPath}` : `/${cleanPath}`;
  };

  // In-modal Document Preview Loader using /verp-service/material/view-file
  const loadDocumentPreview = async (file) => {
    if (!file) return;
    setSelectedPreviewFile(file);
    handleResetImage();

    // If cached blob URL exists, reuse it immediately
    if (file.id && previewCache[file.id]) {
      const cached = previewCache[file.id];
      const url = typeof cached === 'string' ? cached : cached.url;
      const isImg = typeof cached === 'object' && cached.isImage !== undefined ? cached.isImage : isImageFile(file.fileName, url, file);
      setDocumentPreviewUrl(url);
      setIsCurrentImage(Boolean(isImg));
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    if (!file.id) {
      if (file.filePath) {
        const url = getFileUrl(file.filePath);
        setDocumentPreviewUrl(url);
        setIsCurrentImage(isImageFile(file.fileName, url, file));
        setPreviewError(null);
      } else {
        setPreviewError('Document file ID is missing.');
      }
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const res = await itemCreationService.viewFile(file.id);

      // Binary blob response (PDF, Image, etc.)
      if (res instanceof Blob) {
        const isBlobImg = res.type?.startsWith('image/') || isImageFile(file.fileName, file.filePath, file);
        const blobUrl = URL.createObjectURL(res);
        setPreviewCache((prev) => ({ ...prev, [file.id]: { url: blobUrl, isImage: isBlobImg } }));
        setDocumentPreviewUrl(blobUrl);
        setIsCurrentImage(Boolean(isBlobImg));
      } else if (res && typeof res === 'object') {
        const item = Array.isArray(res.data) ? res.data[0] : (res.data || res);
        const path = item?.FilePath || item?.FilePatch || item?.filePath || item?.filePatch || item?.url || item?.fileUrl;
        const base64 = item?.base64 || item?.fileData || item?.content;

        if (base64) {
          setDocumentPreviewUrl(base64);
          setIsCurrentImage(isImageFile(file.fileName, base64, file));
        } else if (path) {
          const finalUrl = getFileUrl(path);
          setDocumentPreviewUrl(finalUrl);
          setIsCurrentImage(isImageFile(path, finalUrl, file));
        } else if (file.filePath) {
          const finalUrl = getFileUrl(file.filePath);
          setDocumentPreviewUrl(finalUrl);
          setIsCurrentImage(isImageFile(file.filePath, finalUrl, file));
        } else {
          setPreviewError('Document content could not be located in server response.');
        }
      } else {
        if (file.filePath) {
          const finalUrl = getFileUrl(file.filePath);
          setDocumentPreviewUrl(finalUrl);
          setIsCurrentImage(isImageFile(file.filePath, finalUrl, file));
        } else {
          setPreviewError('Unexpected response while retrieving document.');
        }
      }
    } catch (err) {
      console.error('Error loading document preview:', err);
      if (file.filePath) {
        const finalUrl = getFileUrl(file.filePath);
        setDocumentPreviewUrl(finalUrl);
        setIsCurrentImage(isImageFile(file.filePath, finalUrl, file));
      } else {
        setPreviewError(err?.message || 'Failed to load document preview.');
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  // View File Action: switches tab to 'document' and loads preview right inside modal
  const handleViewFile = (file) => {
    if (!file) return;
    setActiveModalTab('document');
    loadDocumentPreview(file);
  };

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
    setActiveModalTab('details');
    setSelectedFile(null);
    setSelectedPreviewFile(null);
    setDocumentPreviewUrl(null);
    setPreviewError(null);

    if (item) {
      setIsEditing(mode === 'edit');
      const itemFiles = Array.isArray(item.files) && item.files.length > 0
        ? item.files
        : (Array.isArray(item.raw?.Files) ? item.raw.Files.map(f => {
            const rawPath = f.FilePatch || f.FilePath || '';
            const path = rawPath ? rawPath.replace(/\\/g, '/') : '';
            const name = path ? path.split('/').pop() : 'Material Document';
            return {
              id: f.MaterialFileId,
              fileTypeId: f.FileTypeId,
              filePath: path,
              fileName: name
            };
          }) : []);
      setExistingFiles(itemFiles);
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
      setExistingFiles([]);
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
    setIsEditing(false);
    setActiveModalTab('details');
    setSelectedFile(null);
    setExistingFiles([]);
    setSelectedPreviewFile(null);
    setDocumentPreviewUrl(null);
    setPreviewError(null);
    setIsCurrentImage(false);
    handleResetImage();
    // Cleanup cached object URLs to prevent memory leaks
    Object.values(previewCache).forEach((item) => {
      const url = typeof item === 'string' ? item : item?.url;
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      }
    });
    setPreviewCache({});
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
        title="Material Creation"
        description="Manage system materials, classifications, taxations and configurations."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Master', path: '/master' },
          { label: 'Material Creation', path: '/master/item-creation' }
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
        title={
          isViewing
            ? (activeModalTab === 'document' ? 'View Material Document' : 'View Material')
            : (isEditing ? 'Edit Material' : 'Create Material')
        }
        icon={Package}
        size="xl"
        actions={
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            {activeModalTab === 'document' ? (
              <>
                <Button variant="secondary" onClick={() => setActiveModalTab('details')} className="flex-1 sm:flex-none">
                  Back to Details
                </Button>
                <Button variant="primary" onClick={handleCloseModal} className="flex-1 sm:flex-none">
                  Close
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        }
      >
        {/* Top Tab Bar (Shown in View mode or when files exist in Edit mode) */}
        {(isViewing || (isEditing && existingFiles.length > 0)) && (
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveModalTab('details')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  activeModalTab === 'details'
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Material Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModalTab('document');
                  if (existingFiles.length > 0 && !selectedPreviewFile) {
                    loadDocumentPreview(existingFiles[0]);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  activeModalTab === 'document'
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Document</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeModalTab === 'document'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {existingFiles.length}
                </span>
              </button>
            </div>

            {/* Quick Material Info Badge */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate max-w-[300px]">
              {formData.code ? `${formData.code} — ${formData.name || ''}` : ''}
            </div>
          </div>
        )}

        {/* Tab 1: Material Details Form */}
        {activeModalTab === 'details' && (
          <form id="item-creation-form" onSubmit={handleSubmit} className="space-y-3">
          {/* Top Compact Info Bar */}
          {!isViewing && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span>Fields marked with <span className="text-rose-500 font-bold">*</span> are mandatory.</span>
              {/* <span className="text-[10px] uppercase font-semibold text-primary">All specifications auto-saved</span> */}
            </div>
          )}

          {/* Card 1: Material Details (4-column compact grid) */}
          <div className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-primary" />
              <span>Material Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Category Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Category {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <select
                    required
                    disabled={isViewing}
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full h-8.5 px-2.5 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select Category</option>
                    {dropdowns.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.code ? `(${cat.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Sub Category Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Sub Category {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <select
                    required
                    disabled={isViewing}
                    value={formData.subCategoryId}
                    onChange={handleSubCategoryChange}
                    className="w-full h-8.5 px-2.5 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select Sub Category</option>
                    {availableSubCategories.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name} {sc.code ? `(${sc.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Material Code */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Material Code {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <input 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. MAT001"
                  disabled={isViewing}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                />
              </div>

              {/* Material Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Material Name {!isViewing && <span className="text-rose-500">*</span>}
                </label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Copper Wire"
                  disabled={isViewing}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                />
              </div>

              {/* Brand Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Brand Name
                </label>
                <input 
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Polycab"
                  disabled={isViewing}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                />
              </div>

              {/* Model Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Model Number
                </label>
                <input 
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. CW-102"
                  disabled={isViewing}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                />
              </div>

              {/* UOM */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Unit of Measurement (UOM)
                </label>
                <div className="relative">
                  <select
                    disabled={isViewing}
                    value={formData.uomId}
                    onChange={handleUOMChange}
                    className="w-full h-8.5 px-2.5 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select UOM</option>
                    {dropdowns.uoms.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.code ? `(${u.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Warranty */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Warranty (Years)
                </label>
                <input 
                  type="number"
                  step="0.5"
                  value={formData.warrantyYears}
                  onChange={(e) => setFormData({ ...formData, warrantyYears: e.target.value })}
                  placeholder="e.g. 1.0"
                  disabled={isViewing}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Compliance, Document & Specifications */}
          <div className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5 text-primary" />
              <span>Tax, Document & Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* GST Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  GST Type
                </label>
                <div className="relative">
                  <select
                    disabled={isViewing}
                    value={formData.gstTypeId}
                    onChange={handleGSTTypeChange}
                    className="w-full h-8.5 px-2.5 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select GST Type</option>
                    {dropdowns.gstTypes.map((gt) => (
                      <option key={gt.GSTTypeId} value={gt.GSTTypeId}>
                        {gt.GSTTypeName}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* GST Rate */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  GST Rate
                </label>
                <div className="relative">
                  <select
                    disabled={isViewing}
                    value={formData.gstRateId}
                    onChange={handleGSTRateChange}
                    className="w-full h-8.5 px-2.5 pr-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800 appearance-none truncate"
                  >
                    <option value="">Select GST Rate</option>
                    {availableGSTRates.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.percentage}% {r.gstTypeName ? `(${r.gstTypeName})` : ''}
                      </option>
                    ))}
                  </select>
                  {!isViewing && (
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* HSN/SAC */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  HSN / SAC Code
                </label>
                <input 
                  value={formData.hsnSac}
                  onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                  placeholder="e.g. 84713010"
                  disabled={isViewing}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Status
                </label>
                {isViewing ? (
                  <div className="h-8.5 flex items-center">
                    <StatusBadge status={formData.status} />
                  </div>
                ) : (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-8.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                )}
              </div>

              {/* Material Document (spans 2 cols) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Material Document
                </label>
                {isViewing ? (
                  existingFiles.length > 0 ? (
                    <div className="space-y-1">
                      {existingFiles.map((file, idx) => {
                        const fileUrl = getFileUrl(file.filePath);
                        return (
                          <div
                            key={file.id || idx}
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-8.5"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11px]" title={file.fileName}>
                                {file.fileName || 'Material Document'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleViewFile(file)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-white text-[10px] font-semibold hover:bg-primary/90 shrink-0 cursor-pointer transition-colors"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              <span>View Document</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-8.5 flex items-center px-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-[11px] text-slate-400">
                      <span>No document attached</span>
                    </div>
                  )
                ) : (
                  <div className="space-y-1">
                    {existingFiles.length > 0 && (
                      <div className="flex items-center justify-between gap-1 text-[11px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        <span className="truncate flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <FileText className="w-3 h-3 text-primary shrink-0" />
                          Current: {existingFiles[0].fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleViewFile(existingFiles[0])}
                          className="text-primary hover:underline font-medium shrink-0 flex items-center gap-0.5 text-[10px] cursor-pointer"
                        >
                          View Document
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full h-8.5 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] text-slate-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary cursor-pointer"
                    />
                    {selectedFile && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 px-2 py-0.5 rounded">
                        <span className="truncate flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-slate-400 hover:text-red-500 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Specification / Description (spans 2 cols) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                  Specification / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter specifications..."
                  disabled={isViewing}
                  className="w-full h-8.5 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800 resize-none"
                />
              </div>
            </div>
          </div>

          {/* View Mode Compact Audit Bar */}
          {isViewing && (formData.createdAt || formData.updatedAt) && (
            <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Created: <strong className="text-slate-700 dark:text-slate-300">{formData.createdAt || '—'}</strong> {formData.createdBy ? `by ${formData.createdBy}` : ''}</span>
              </div>
              {formData.updatedAt && formData.updatedAt !== '—' && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Updated: <strong className="text-slate-700 dark:text-slate-300">{formData.updatedAt}</strong> {formData.updatedBy ? `by ${formData.updatedBy}` : ''}</span>
                </div>
              )}
            </div>
          )}
        </form>
        )}

        {/* Tab 2: Embedded Document Viewer */}
        {activeModalTab === 'document' && (() => {
          const isImageTarget = Boolean(isCurrentImage || isImageFile(selectedPreviewFile?.fileName || '', documentPreviewUrl, selectedPreviewFile));

          return (
            <div className="space-y-2.5">
              {/* Document Viewer Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  {existingFiles.length > 1 ? (
                    <select
                      value={selectedPreviewFile?.id || existingFiles[0]?.id}
                      onChange={(e) => {
                        const f = existingFiles.find((x) => String(x.id) === String(e.target.value));
                        if (f) loadDocumentPreview(f);
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 max-w-[260px] truncate"
                    >
                      {existingFiles.map((f, idx) => (
                        <option key={f.id || idx} value={f.id}>
                          {f.fileName || `Document ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[280px] sm:max-w-[340px]" title={selectedPreviewFile?.fileName || existingFiles[0]?.fileName}>
                      {selectedPreviewFile?.fileName || existingFiles[0]?.fileName || 'Material Document'}
                    </span>
                  )}
                </div>

                {/* Action Buttons & Image Controls */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* Image Controls in Toolbar */}
                  {isImageTarget && documentPreviewUrl && !previewLoading && (
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={imageZoom <= 0.25}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer transition-colors"
                        title="Zoom Out (-25%)"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetImage}
                        className="px-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 min-w-[38px] text-center hover:text-primary cursor-pointer"
                        title="Click to reset zoom (100%)"
                      >
                        {Math.round(imageZoom * 100)}%
                      </button>
                      <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={imageZoom >= 4}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer transition-colors"
                        title="Zoom In (+25%)"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                      <button
                        type="button"
                        onClick={handleRotateLeft}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                        title="Rotate Counter-Clockwise (-90°)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRotateRight}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                        title="Rotate Clockwise (+90°)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                      <button
                        type="button"
                        onClick={handleResetImage}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                        title="Reset Zoom & Rotation"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => selectedPreviewFile && loadDocumentPreview(selectedPreviewFile)}
                    disabled={previewLoading || !selectedPreviewFile}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer transition-colors"
                    title="Reload Document"
                  >
                    <RefreshCw className={`w-3 h-3 ${previewLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  {documentPreviewUrl && (
                    <a
                      href={documentPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open in New Tab</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Document Frame / Canvas */}
              <div className="relative w-full h-[460px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 overflow-hidden flex items-center justify-center">
                {previewLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 text-slate-500">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-medium">Retrieving document preview...</span>
                  </div>
                ) : previewError ? (
                  <div className="flex flex-col items-center justify-center gap-2 p-4 text-center max-w-md">
                    <AlertCircle className="w-9 h-9 text-rose-500" />
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{previewError}</p>
                    <button
                      type="button"
                      onClick={() => selectedPreviewFile && loadDocumentPreview(selectedPreviewFile)}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 cursor-pointer"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : existingFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400 p-4">
                    <FileText className="w-10 h-10 stroke-[1.5]" />
                    <p className="text-xs font-medium">No document attached to this material</p>
                  </div>
                ) : documentPreviewUrl ? (
                  isImageTarget ? (
                    <div
                      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950/5 dark:bg-slate-950/50 select-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onDoubleClick={handleDoubleClick}
                      style={{ cursor: imageZoom > 1 ? (isDraggingImage ? 'grabbing' : 'grab') : 'default' }}
                    >
                      {/* Floating Bottom Controls Pill */}
                      <div
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 dark:bg-slate-800/95 text-white backdrop-blur-md shadow-xl border border-white/10 text-xs transition-opacity hover:opacity-100 opacity-90"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Zoom Out */}
                        <button
                          type="button"
                          onClick={handleZoomOut}
                          disabled={imageZoom <= 0.25}
                          className="p-1 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Zoom Out (-25%)"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>

                        {/* Zoom Percentage */}
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="px-1.5 py-0.5 text-[11px] font-semibold text-slate-200 hover:text-white rounded hover:bg-white/10 cursor-pointer min-w-[42px] text-center"
                          title="Click to reset zoom (100%)"
                        >
                          {Math.round(imageZoom * 100)}%
                        </button>

                        {/* Zoom In */}
                        <button
                          type="button"
                          onClick={handleZoomIn}
                          disabled={imageZoom >= 4.0}
                          className="p-1 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Zoom In (+25%)"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" />

                        {/* Rotate Left */}
                        <button
                          type="button"
                          onClick={handleRotateLeft}
                          className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                          title="Rotate Counter-Clockwise (-90°)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Rotate Right */}
                        <button
                          type="button"
                          onClick={handleRotateRight}
                          className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                          title="Rotate Clockwise (+90°)"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" />

                        {/* Reset */}
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors text-[10px] font-semibold cursor-pointer"
                          title="Reset Zoom & Rotation"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* Transformed Image Container */}
                      <div
                        className={`transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full ${isDraggingImage ? 'pointer-events-none' : ''}`}
                        style={{
                          transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageZoom}) rotate(${imageRotation}deg)`,
                          transformOrigin: 'center center'
                        }}
                      >
                        {imageLoadError ? (
                          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center max-w-sm bg-white/70 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              Image could not be rendered
                            </p>
                            <p className="text-[11px] text-slate-400 break-all">
                              {selectedPreviewFile?.fileName || 'Document'}
                            </p>
                          </div>
                        ) : (
                          <img
                            src={documentPreviewUrl}
                            alt={selectedPreviewFile?.fileName || 'Material Document'}
                            className="max-h-[420px] max-w-full object-contain rounded-md shadow-sm pointer-events-none select-none"
                            draggable={false}
                            onError={() => setImageLoadError(true)}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={documentPreviewUrl}
                      title={selectedPreviewFile?.fileName || 'Document Preview'}
                      className="w-full h-full border-0 rounded-xl bg-white"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <FileText className="w-8 h-8" />
                    <span className="text-xs">No preview available</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
