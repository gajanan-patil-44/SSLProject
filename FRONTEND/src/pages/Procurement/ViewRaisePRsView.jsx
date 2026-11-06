// src/pages/Procurement/ViewRaisePRsView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Calendar,
  Filter,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { procurementPRService } from './procurementData';
import PRDetailModal, { StatusBadge, PriorityBadge } from './components/PRDetailModal';

export default function ViewRaisePRsView() {
  const navigate = useNavigate();

  const [prs, setPrs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPR, setSelectedPR] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load PRs and listen to reactive updates
  const loadPRs = () => {
    const list = procurementPRService.getAllPRs();
    setPrs(list);
  };

  useEffect(() => {
    loadPRs();

    const handleUpdate = () => {
      loadPRs();
    };

    window.addEventListener('vtpl_pr_updated', handleUpdate);
    return () => {
      window.removeEventListener('vtpl_pr_updated', handleUpdate);
    };
  }, []);

  // Filter & Search
  const filteredPRs = useMemo(() => {
    return prs.filter((pr) => {
      // Status filter
      if (statusFilter !== 'ALL' && pr.status !== statusFilter) {
        return false;
      }

      // Search term filter (Requirement Number, Project, Requested By, Status)
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const reqNoMatch = (pr.requirementNo || '').toLowerCase().includes(term);
      const projectMatch = (pr.project || '').toLowerCase().includes(term);
      const requesterMatch = (pr.requestedBy || '').toLowerCase().includes(term);
      const statusMatch = (pr.status || '').toLowerCase().includes(term);

      return reqNoMatch || projectMatch || requesterMatch || statusMatch;
    });
  }, [prs, searchTerm, statusFilter]);

  // Open PR Detail Modal
  const handleViewPR = (pr) => {
    setSelectedPR(pr);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-[#2f73d9]">
              <FileText className="w-6 h-6" />
            </span>
            View Raise PR's
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View all your raised Purchase Requisitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadPRs}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/raise-pr')}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#2f73d9] hover:bg-blue-700 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Raise New PR
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Card Header & Search Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              My Purchase Requisitions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredPRs.length}</span> matching record{filteredPRs.length === 1 ? '' : 's'} (Total: {prs.length})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Status Filter Tab Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Forwarded">Forwarded</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="PO Generated">PO Generated</option>
              <option value="Draft">Draft</option>
            </select>

            {/* Search Bar */}
            <div className="relative min-w-[260px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PR..."
                className="w-full h-10 pl-9 pr-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Purchase Requisition Listing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Sl No</th>
                <th className="py-3 px-4">Requirement No</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPRs.length > 0 ? (
                filteredPRs.map((pr, idx) => (
                  <tr
                    key={pr.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => handleViewPR(pr)}
                  >
                    <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {pr.requirementNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {pr.project}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={pr.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {pr.requiredDate}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {pr.requestedBy}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={pr.status} />
                    </td>
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleViewPR(pr)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition flex items-center gap-1 mx-auto"
                        title="View Requisition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <FolderOpen className="w-10 h-10 mb-2 opacity-60" />
                      <p className="text-sm font-semibold">No purchase requisitions found.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search criteria or create a new PR.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PR Detail Modal */}
      <PRDetailModal
        pr={selectedPR}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isApprovalMode={false}
      />
    </div>
  );
}

