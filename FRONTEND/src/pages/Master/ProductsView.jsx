// src/pages/Master/ProductsView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  Boxes,
  ShieldCheck,
  AlertCircle,
  Tag
} from 'lucide-react';
import { productService } from '../../services/productService';
import { Modal } from '../../components/ui/Modal';
import { Badge, Button, Input, PageHeader } from '../../components/ui/index';

export default function ProductsView() {
  // Data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DISABLED'

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  /**
   * Fetch products from API:
   * Endpoint: POST /verp-service/productCreation/getProduct
   * Payload: { "flagId": 1 }
   */
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts();
      let productList = [];
      
      if (response && Array.isArray(response.data)) {
        productList = response.data;
      } else if (Array.isArray(response)) {
        productList = response;
      }

      setProducts(productList);
    } catch (err) {
      setError(err?.message || 'Failed to fetch products. Please ensure the backend service is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtered product records
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const id = String(item.ProductId ?? item.id ?? '');
      const code = (item.ProductCode || item.productCode || '').toLowerCase();
      const name = (item.ProductName || item.productName || '').toLowerCase();
      const desc = (item.Description || item.description || '').toLowerCase();
      const user = (item.RequestUserName || item.UpdatedByUserName || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        code.includes(query) ||
        name.includes(query) ||
        desc.includes(query) ||
        user.includes(query);

      const isDisabled = item.IsDisabled === true || item.status === 'Inactive' || item.status === 'Disabled';
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !isDisabled) ||
        (statusFilter === 'DISABLED' && isDisabled);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(
      (p) => p.IsDisabled !== true && p.status !== 'Inactive' && p.status !== 'Disabled'
    ).length;
    const disabled = total - active;
    return { total, active, disabled };
  }, [products]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Products Management"
        description="View and manage business software products and enterprise modules."
        breadcrumbs={[
          { label: 'Master', path: '/master' },
          { label: 'Products', path: '/master/products' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadProducts}
              disabled={loading}
              className={loading ? 'animate-spin' : ''}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Products
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {loading ? '—' : stats.total}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Registered in system</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Products
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {loading ? '—' : stats.active}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Available for deployment</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Disabled Products
            </p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {loading ? '—' : stats.disabled}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Decommissioned / Inactive</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Failed to Load Products</h4>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={loadProducts}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product code, name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">All Status ({products.length})</option>
              <option value="ACTIVE">Active ({stats.active})</option>
              <option value="DISABLED">Disabled ({stats.disabled})</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16"># ID</th>
                <th className="py-3.5 px-4 w-36">Product Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Description</th>
                <th className="py-3.5 px-4 hidden lg:table-cell w-44">Created On</th>
                <th className="py-3.5 px-4 hidden xl:table-cell w-32">Created By</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="py-4 px-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div></td>
                    <td className="py-4 px-4"><div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="py-4 px-4 hidden md:table-cell"><div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="py-4 px-4 hidden lg:table-cell"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="py-4 px-4 hidden xl:table-cell"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="py-4 px-4 text-center"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        No products found
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {searchQuery
                          ? `No product matched "${searchQuery}". Try a different search term.`
                          : 'There are currently no products registered in the system.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const id = prod.ProductId ?? prod.id;
                  const code = prod.ProductCode || prod.productCode || '—';
                  const name = prod.ProductName || prod.productName || '—';
                  const desc = prod.Description || prod.description || '—';
                  const createdOn = prod.CreatedOn || prod.createdOn;
                  const requestUser = prod.RequestUserName || prod.UpdatedByUserName || 'System';
                  const isDisabled = prod.IsDisabled === true || prod.status === 'Inactive' || prod.status === 'Disabled';

                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        #{id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 dark:text-slate-400 max-w-xs truncate" title={desc}>
                        {desc}
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(createdOn)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden xl:table-cell text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[100px]">{requestUser}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isDisabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3 h-3" />
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsViewModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="View Product Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-200">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{products.length}</strong> products
          </span>
          <span>API: /verp-service/productCreation/getProduct</span>
        </div>
      </div>

      {/* View Details Modal */}
      {isViewModalOpen && selectedProduct && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Product Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedProduct.ProductName || selectedProduct.productName}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    {selectedProduct.ProductCode || selectedProduct.productCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Product ID: #{selectedProduct.ProductId ?? selectedProduct.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-1">Status</span>
                {selectedProduct.IsDisabled ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                    <XCircle className="w-3.5 h-3.5" /> Disabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-1">Created By</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedProduct.RequestUserName || ''}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-1">Created On</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedProduct.CreatedOn)}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-1">Last Updated</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedProduct.UpdatedOn)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="text-slate-400 block mb-1">Description</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedProduct.Description || selectedProduct.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
