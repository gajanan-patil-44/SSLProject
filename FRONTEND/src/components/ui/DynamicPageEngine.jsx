import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { PageHeader, Card, Button } from './index';
import { ConfirmDialog } from './Modal';
import { DynamicForm } from './DynamicForm';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';

// ==========================================
// 1. Dynamic List Page Engine
// ==========================================
export const DynamicListPage = ({
  title,
  description,
  columns = [],
  searchKey = '',
  searchPlaceholder = 'Search...',
  fetchDataFn,
  deleteDataFn,
  toggleStatusFn,
  onAddClick,
  onEditClick,
  onViewClick,
  onToggleStatusClick,
  actions,
  breadcrumbs,
  refreshKey
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    if (!fetchDataFn) return;
    setLoading(true);
    try {
      const res = await fetchDataFn();
      setData(res || []);
    } catch (e) {
      console.error("Failed to fetch dynamic data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fetchDataFn, refreshKey]);

  const handleToggleStatus = async (record) => {
    if (onToggleStatusClick) {
      return onToggleStatusClick(record);
    }
    if (toggleStatusFn) {
      try {
        const isDisabled = record.IsDisabled === true || record.status === 'Inactive' || record.status === 'Disabled';
        const newIsDisabled = !isDisabled;
        await toggleStatusFn(record, newIsDisabled);
        await loadData();
      } catch (e) {
        console.error("Failed to toggle status:", e);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecord || !deleteDataFn) return;
    setDeleteLoading(true);
    try {
      await deleteDataFn(deleteRecord);
      await loadData();
      setDeleteRecord(null);
    } catch (e) {
      console.error("Failed to delete record:", e);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onRefresh={loadData}
        onAddClick={onAddClick}
        onViewClick={onViewClick}
        onEditClick={onEditClick}
        onDeleteClick={deleteDataFn ? (row) => setDeleteRecord(row) : null}
        onToggleStatusClick={toggleStatusFn || onToggleStatusClick ? handleToggleStatus : null}
        searchPlaceholder={searchPlaceholder}
      />

      {deleteRecord && (
        <ConfirmDialog
          isOpen={!!deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
          title="Delete Record"
          message={`Are you sure you want to delete this record? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

// ==========================================
// 2. Dynamic Form Page Engine
// ==========================================
export const DynamicFormPage = ({
  title,
  description,
  fields = [],
  schema,
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  gridCols = 2,
  breadcrumbs
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          onCancel && (
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onCancel}>
              Back to List
            </Button>
          )
        }
      />

      <Card className="w-full">
        <DynamicForm
          fields={fields}
          schema={schema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
          gridCols={gridCols}
        />
      </Card>
    </div>
  );
};

// ==========================================
// 3. Dynamic Detail Page Engine
// ==========================================
export const DynamicDetailPage = ({
  title,
  description,
  data = {},
  sections = [], // Array of { title, fields: [{ label, key, type }] }
  onEditClick,
  onBackClick,
  breadcrumbs,
  actions,
  children
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            {onBackClick && (
              <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBackClick}>
                Back
              </Button>
            )}
            {onEditClick && (
              <Button variant="secondary" size="sm" icon={Edit} onClick={onEditClick}>
                Edit
              </Button>
            )}
            {actions}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section, sIdx) => (
            <Card key={sIdx} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">{field.label}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {field.type === 'currency'
                        ? `$${(data[field.key] || 0).toLocaleString()}`
                        : field.type === 'date'
                          ? new Date(data[field.key]).toLocaleDateString()
                          : String(data[field.key] !== undefined && data[field.key] !== null ? data[field.key] : 'N/A')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {children}
        </div>

        {/* Side Panel placeholder / Quick Metadata */}
        <div className="space-y-6">
          <Card className="text-center py-6 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-2xl text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {data.name ? data.name[0] : (data.id || 'ID')}
            </div>
            <div>
              <h4 className="font-bold text-slate-905 dark:text-slate-50">{data.name || title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-500">{data.id || 'No ID'}</p>
            </div>
            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{data.joiningDate || data.date || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{data.status || 'Active'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
