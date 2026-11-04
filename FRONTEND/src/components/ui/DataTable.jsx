// src/components/ui/DataTable.jsx
import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Edit,
  Grid3X3,
  KeyRound
} from 'lucide-react';
import { Button, IconButton, Input, Switch } from './index';
import { Dropdown, DropdownItem } from './Dropdown';

export const DataTable = ({
  columns,
  data = [],
  onAddClick,
  onViewClick,
  onEditClick,
  onChangePasswordClick,
  onDeleteClick,
  onToggleStatusClick,
  searchPlaceholder = "Search records...",
  searchKey = "",
  actions,
  bulkActions,
  loading = false,
  onRefresh,
  hideExport = false
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [density, setDensity] = useState('md'); // 'sm' | 'md' | 'lg'

  // Prepend Selection Column if bulk actions are enabled
  const tableColumns = useMemo(() => {
    const cols = [...columns];

    // Add actions column if handlers are provided
    if (onViewClick || onEditClick || onChangePasswordClick || onDeleteClick || onToggleStatusClick) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const rec = row.original;
          const isDisabled = rec.IsDisabled === true || rec.status === 'Inactive' || rec.status === 'Disabled';
          const isEnabled = rec.isEnabled !== undefined ? rec.isEnabled : !isDisabled;

          return (
            <div className="flex items-center justify-end gap-2">
              {onToggleStatusClick && (
                <div className="flex items-center mr-1" title={isEnabled ? "Active - Click to Disable" : "Disabled - Click to Enable"}>
                  <Switch
                    checked={isEnabled}
                    onChange={() => onToggleStatusClick(rec)}
                    size="sm"
                  />
                </div>
              )}
              {onViewClick && (
                <IconButton
                  icon={Eye}
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewClick(row.original)}
                  title="View details"
                />
              )}
              {onEditClick && (
                <IconButton
                  icon={Edit}
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditClick(row.original)}
                  title="Edit record"
                />
              )}
              {onChangePasswordClick && (
                <IconButton
                  icon={KeyRound}
                  size="sm"
                  variant="ghost"
                  onClick={() => onChangePasswordClick(row.original)}
                  title="Change Password"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                />
              )}
              {onDeleteClick && (
                <IconButton
                  icon={Trash2}
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDeleteClick(row.original)}
                  title="Delete record"
                />
              )}
            </div>
          );
        }
      });
    }
    return cols;
  }, [columns, onViewClick, onEditClick, onChangePasswordClick, onDeleteClick, onToggleStatusClick]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (data.length === 0) return;

    // Header row
    const headers = columns.filter(c => c.key).map(c => c.label || c.key);
    const keys = columns.filter(c => c.key).map(c => c.key);

    const csvRows = [headers.join(',')];

    // Content rows
    data.forEach(row => {
      const values = keys.map(key => {
        const val = row[key];
        const stringVal = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const densityStyles = {
    sm: 'py-2 px-3 text-xs',
    md: 'py-3.5 px-4 text-sm',
    lg: 'py-5 px-5 text-base'
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Refresh & Filters */}
          {onRefresh && (
            <IconButton
              icon={RefreshCw}
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className={loading ? "animate-spin" : ""}
              title="Refresh"
            />
          )}

          {/* Density Control */}
          <Dropdown
            align="left"
            trigger={
              <Button variant="outline" size="sm" icon={Grid3X3}>
                Density: {density.toUpperCase()}
              </Button>
            }
          >
            <DropdownItem onClick={() => setDensity('sm')}>Compact</DropdownItem>
            <DropdownItem onClick={() => setDensity('md')}>Standard</DropdownItem>
            <DropdownItem onClick={() => setDensity('lg')}>Relaxed</DropdownItem>
          </Dropdown>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <Dropdown
            trigger={
              <Button variant="outline" size="sm" icon={SlidersHorizontal}>
                Columns
              </Button>
            }
          >
            {table.getAllLeafColumns().map(column => {
              if (column.id === 'actions') return null;
              return (
                <div key={column.id} className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="rounded text-secondary focus:ring-secondary"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-400">{column.id}</span>
                </div>
              );
            })}
          </Dropdown>

          {/* Export CSV */}
          {!hideExport && (
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportCSV}>
              Export
            </Button>
          )}

          {/* Custom actions or Add New */}
          {actions}
          {onAddClick && (
            <Button variant="secondary" size="sm" icon={Plus} onClick={onAddClick}>
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Bulk actions banner */}
      {selectedRows.length > 0 && bulkActions && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fade-in dark:bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2 font-medium">
            <span>{selectedRows.length} records selected</span>
          </div>
          <div className="flex items-center gap-3">
            {bulkActions(selectedRows.map(r => r.original))}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-x-auto relative">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                {headerGroup.headers.map(header => {
                  return (
                    <th
                      key={header.id}
                      className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className={`flex items-center gap-1 ${header.column.id === 'actions' ? 'justify-end pr-2' : ''}`}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        {header.column.getIsSorted() === 'asc' && ' 🔼'}
                        {header.column.getIsSorted() === 'desc' && ' 🔽'}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={tableColumns.length} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                    <span className="text-xs font-semibold">Loading dataset records...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Grid3X3 className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-semibold">No records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => {
                const isSelected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-slate-50 dark:bg-slate-800/20' : ''}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={`${densityStyles[density]} font-medium text-slate-700 dark:text-slate-300`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && table.getRowModel().rows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-500 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold whitespace-nowrap">Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-semibold">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data.length
              )}{' '}
              of {data.length} records
            </span>
          </div>

          <div className="flex items-center gap-1 justify-center">
            <IconButton
              icon={ChevronsLeft}
              size="sm"
              variant="outline"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            />
            <IconButton
              icon={ChevronLeft}
              size="sm"
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            />
            <span className="px-3 py-1 font-semibold text-xs text-slate-700 dark:text-slate-300">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <IconButton
              icon={ChevronRight}
              size="sm"
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            />
            <IconButton
              icon={ChevronsRight}
              size="sm"
              variant="outline"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
