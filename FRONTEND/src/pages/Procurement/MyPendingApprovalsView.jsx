// src/pages/Procurement/MyPendingApprovalsView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Eye,
  Calendar,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { procurementPRService } from './procurementData';
import PRDetailModal, { PriorityBadge } from './components/PRDetailModal';
import PaginationControls from '../../components/ui/PaginationControls';

export default function MyPendingApprovalsView() {
  const navigate = useNavigate();

  const [pendingPRs, setPendingPRs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPR, setSelectedPR] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load pending approvals (only 'Pending Approval' and 'Forwarded')
  const loadPendingList = () => {
    const list = procurementPRService.getPendingApprovals();
    setPendingPRs(list);
  };

  useEffect(() => {
    loadPendingList();

    const handleUpdate = () => {
      loadPendingList();
    };

    window.addEventListener('vtpl_pr_updated', handleUpdate);
    return () => {
      window.removeEventListener('vtpl_pr_updated', handleUpdate);
    };
  }, []);

  // Filter by search (Requirement Number, Requested By, Project)
  const filteredPending = useMemo(() => {
    if (!searchTerm.trim()) return pendingPRs;
    const term = searchTerm.toLowerCase();

    return pendingPRs.filter((pr) => {
      const reqMatch = (pr.requirementNo || '').toLowerCase().includes(term);
      const requesterMatch = (pr.requestedBy || '').toLowerCase().includes(term);
      const projectMatch = (pr.project || '').toLowerCase().includes(term);
      return reqMatch || requesterMatch || projectMatch;
    });
  }, [pendingPRs, searchTerm]);

  // Open PR Modal in Approval Mode
  const handleOpenApprovalModal = (pr) => {
    setSelectedPR(pr);
    setIsModalOpen(true);
  };

  // Re-fetch after action completed
  const handleActionCompleted = () => {
    loadPendingList();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            My Pending Approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and action Purchase Requisitions pending approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadPendingList}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Card Header & Search bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pending Approval List
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing <span className="font-bold text-amber-600 dark:text-amber-400">{filteredPending.length}</span> matching requisition{filteredPending.length === 1 ? '' : 's'} awaiting review
            </p>
          </div>

          <div className="relative min-w-[280px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search PR..."
              className="w-full h-10 pl-9 pr-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Pending Approval Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Sl No</th>
                <th className="py-3 px-4">Requirement No</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPending.length > 0 ? (
                filteredPending.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((pr, idx) => {
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                  return (
                  <tr
                    key={pr.id}
                    className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition cursor-pointer"
                    onClick={() => handleOpenApprovalModal(pr)}
                  >
                    <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                      {rowNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {pr.requirementNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {pr.requestedBy}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {pr.designation || pr.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {pr.project}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={pr.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {pr.requiredDate}
                    </td>
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenApprovalModal(pr)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2f73d9] hover:bg-blue-700 transition flex items-center gap-1.5 mx-auto shadow-sm"
                        title="Review and action PR"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );})
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/70" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        All caught up! No pending approvals.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        There are currently no purchase requisitions requiring your action.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredPending.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* PR Detail Modal with Approval Actions */}
      <PRDetailModal
        pr={selectedPR}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isApprovalMode={true}
        onActionCompleted={handleActionCompleted}
      />
    </div>
  );
}

