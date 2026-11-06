// src/pages/WorkManagement/WorkUpdateReviewView.jsx
import React, { useState, useMemo } from 'react';
import {
  PageHeader,
  StatCard,
  Card,
  Button,
  Input,
  Badge,
  IconButton
} from '../../components/ui/index';
import {
  ClipboardCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Search,
  Filter,
  Eye,
  RefreshCw,
  User,
  Building2,
  Calendar,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { getAllReports, updateReportReview } from './workManagementData';
import ReviewReportModal from './components/ReviewReportModal';
import WorkUpdateDetailsModal from './components/WorkUpdateDetailsModal';
import PaginationControls from '../../components/ui/PaginationControls';

export default function WorkUpdateReviewView() {
  const [reports, setReports] = useState(getAllReports);
  const [activeTab, setActiveTab] = useState('Pending Review'); // 'Pending Review' | 'Clarification' | 'Reviewed'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const reloadData = () => {
    setReports(getAllReports());
  };

  // KPIs
  const metrics = useMemo(() => {
    const awaitingReview = reports.filter((r) => r.reviewStatus === 'Pending Review').length;
    const reviewedToday = reports.filter((r) => r.reviewStatus === 'Reviewed').length;
    const clarificationRequested = reports.filter((r) => r.reviewStatus === 'Clarification Requested').length;
    const overdueSubmissions = 2; // e.g. Reports overdue by SLA > 24h

    return { awaitingReview, reviewedToday, clarificationRequested, overdueSubmissions };
  }, [reports]);

  // Tab Filtering
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab check
      let matchesTab = false;
      if (activeTab === 'Pending Review') {
        matchesTab = r.reviewStatus === 'Pending Review';
      } else if (activeTab === 'Clarification') {
        matchesTab = r.reviewStatus === 'Clarification Requested';
      } else if (activeTab === 'Reviewed') {
        matchesTab = r.reviewStatus === 'Reviewed';
      }

      // Search check
      const matchesSearch =
        !searchTerm.trim() ||
        r.reportId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.project?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [reports, activeTab, searchTerm]);

  const handleOpenReview = (report) => {
    setSelectedReport(report);
    setIsReviewModalOpen(true);
  };

  const handleOpenDetails = (report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleReviewSubmit = (reportId, status, comments) => {
    const updated = updateReportReview(reportId, status, comments);
    setReports(updated);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Update Review"
        description="Managerial verification queue for reviewing submitted daily employee reports, approving productive hours, and requesting scope clarifications."
        badge="Manager Evaluation Desk"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Work Update Review' }
        ]}
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Awaiting Review"
          value={metrics.awaitingReview}
          badgeText="Queue priority"
          badgeVariant="warning"
          icon={ClipboardCheck}
          iconColorClass="bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30"
          description="Reports pending manager signoff"
        />
        <StatCard
          title="Reviewed Today"
          value={metrics.reviewedToday}
          badgeText="Verified"
          badgeVariant="success"
          icon={CheckCircle2}
          iconColorClass="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30"
          description="Approved daily work bundles"
        />
        <StatCard
          title="Clarification Requested"
          value={metrics.clarificationRequested}
          badgeText="Awaiting employee"
          badgeVariant="primary"
          icon={HelpCircle}
          iconColorClass="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30"
          description="Action pending by staff"
        />
        <StatCard
          title="Overdue Submissions"
          value={metrics.overdueSubmissions}
          badgeText="Exceeded SLA"
          badgeVariant="danger"
          icon={Clock}
          iconColorClass="bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30"
          description="Past 24h review threshold"
        />
      </div>

      {/* Navigation Tabs Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('Pending Review')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'Pending Review'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Pending Review</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {metrics.awaitingReview}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Clarification')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'Clarification'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 ring-1 ring-white/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Clarification Requested</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {metrics.clarificationRequested}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Reviewed')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'Reviewed'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-1 ring-white/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Reviewed & Approved</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {metrics.reviewedToday}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search report, employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs font-medium"
          />
        </div>
      </div>

      {/* Review Data Table */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-md shadow-slate-200/40 dark:shadow-black/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-slate-100/95 via-indigo-50/60 to-purple-50/40 dark:from-slate-800/90 dark:via-indigo-950/60 dark:to-slate-800/90">
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Report ID
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Employee
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Department
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Work Date
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center">
                Activities
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center">
                Hours
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Submitted On
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Status
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-right pr-6">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <ClipboardCheck className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No reports found under "{activeTab}".</p>
                </td>
              </tr>
            ) : (
              filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((report) => (
                <tr
                  key={report.id || report.reportId}
                  className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/30 hover:to-indigo-50/50 dark:hover:bg-gradient-to-r dark:hover:from-indigo-950/30 dark:hover:via-purple-950/20 dark:hover:to-indigo-950/30 transition-all text-xs"
                >
                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {report.reportId || report.id}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                      {report.employeeName}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {report.employeeId}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {report.department}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {report.workDate}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {report.entries?.length || 0}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white whitespace-nowrap">
                    {report.totalHours} hrs
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {report.submittedOn}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant={
                        report.reviewStatus === 'Reviewed'
                          ? 'success'
                          : report.reviewStatus === 'Clarification Requested'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {report.reviewStatus}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={report.reviewStatus === 'Reviewed' ? 'outline' : 'primary'}
                        size="sm"
                        icon={report.reviewStatus === 'Reviewed' ? Eye : CheckCircle2}
                        onClick={() => {
                          if (report.reviewStatus === 'Reviewed') {
                            handleOpenDetails(report);
                          } else {
                            handleOpenReview(report);
                          }
                        }}
                        className="text-xs !py-1 !px-2.5"
                      >
                        {report.reviewStatus === 'Reviewed' ? 'View' : 'Review'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredReports.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Review Modal */}
      <ReviewReportModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        report={selectedReport}
        onReviewSubmit={handleReviewSubmit}
      />

      {/* Details Modal */}
      <WorkUpdateDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        report={selectedReport}
        onReviewClick={handleOpenReview}
      />
    </div>
  );
}

