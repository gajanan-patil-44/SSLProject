// src/pages/WorkManagement/WorkHistoryView.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText,
  ListTodo,
  Clock,
  Hourglass,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { getAllReports } from './workManagementData';
import WorkUpdateDetailsModal from './components/WorkUpdateDetailsModal';
import PaginationControls from '../../components/ui/PaginationControls';

export default function WorkHistoryView() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(getAllReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected report for modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const reloadData = () => {
    setReports(getAllReports());
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalReports = reports.length;
    const totalActivities = reports.reduce((acc, r) => acc + (r.entries ? r.entries.length : 0), 0);
    const totalHours = reports.reduce((acc, r) => acc + (Number(r.totalHours) || 0), 0);
    const awaitingReview = reports.filter((r) => r.reviewStatus === 'Pending Review' || r.reviewStatus === 'Clarification Requested').length;

    return {
      totalReports,
      totalActivities,
      totalHours: totalHours.toFixed(1),
      awaitingReview
    };
  }, [reports]);

  // Filtering
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search
      const searchMatch =
        !searchTerm.trim() ||
        r.reportId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.overallSummary?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      const statusMatch =
        statusFilter === 'All' ||
        r.reviewStatus?.toLowerCase() === statusFilter.toLowerCase();

      // Dates
      const fromMatch = !fromDate || r.workDate >= fromDate;
      const toMatch = !toDate || r.workDate <= toDate;

      return searchMatch && statusMatch && fromMatch && toMatch;
    });
  }, [reports, searchTerm, statusFilter, fromDate, toDate]);

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      case 'Pending Review':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'Clarification Requested':
        return <Badge variant="info">Clarification Requested</Badge>;
      default:
        return <Badge variant="neutral">{status || 'Submitted'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Work History"
        description="Comprehensive audit ledger of all submitted daily work updates, logged activities, review remarks, and manager sign-offs."
        badge="Activity Ledger"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Work History' }
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/work-management/daily-update')}
          >
            New Daily Update
          </Button>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reports Submitted"
          value={metrics.totalReports}
          badgeText="Completed"
          badgeVariant="success"
          icon={FileText}
          iconColorClass="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
          description="Lifetime daily reports logged"
        />
        <StatCard
          title="Activities Logged"
          value={metrics.totalActivities}
          badgeText="Task items"
          badgeVariant="primary"
          icon={ListTodo}
          iconColorClass="bg-gradient-to-tr from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/30"
          description="Total work units accomplished"
        />
        <StatCard
          title="Hours Recorded"
          value={`${metrics.totalHours}h`}
          badgeText="Productive"
          badgeVariant="success"
          icon={Clock}
          iconColorClass="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30"
          description="Billable & internal hours"
        />
        <StatCard
          title="Awaiting Review"
          value={metrics.awaitingReview}
          badgeText={metrics.awaitingReview > 0 ? "Pending" : "Up to date"}
          badgeVariant={metrics.awaitingReview > 0 ? "warning" : "success"}
          icon={Hourglass}
          iconColorClass="bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30"
          description="Reports in manager review queue"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white/95 dark:bg-slate-900/95 p-4 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur-md">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by ID, project, summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9.5 text-xs font-medium"
            />
          </div>

          {/* From Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">From:</span>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9.5 text-xs font-medium w-36"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">To:</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9.5 text-xs font-medium w-36"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="All">All Statuses</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Clarification Requested">Clarification Requested</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {(searchTerm || statusFilter !== 'All' || fromDate || toDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setFromDate('');
                setToDate('');
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          <IconButton
            icon={RefreshCw}
            size="sm"
            variant="outline"
            onClick={reloadData}
            title="Refresh list"
          />
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-md shadow-slate-200/40 dark:shadow-black/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-slate-100/95 via-indigo-50/60 to-purple-50/40 dark:from-slate-800/90 dark:via-indigo-950/60 dark:to-slate-800/90">
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Report ID
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Work Date
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Activities
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Hours
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Project / Work Area
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Submitted On
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Review Status
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-right pr-6">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <FileText className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No work reports match your filter criteria.</p>
                  <p className="text-[11px] text-slate-400">Try adjusting dates or search queries.</p>
                </td>
              </tr>
            ) : (
              filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((report) => (
                <tr
                  key={report.id || report.reportId}
                  className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/30 hover:to-indigo-50/50 dark:hover:bg-gradient-to-r dark:hover:from-indigo-950/30 dark:hover:via-purple-950/20 dark:hover:to-indigo-950/30 transition-all text-xs"
                >
                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {report.reportId || report.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                    {report.workDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <ListTodo className="w-3 h-3 text-indigo-500" />
                      {report.entries ? report.entries.length : 0} items
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    {report.totalHours} hrs
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    {report.project}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {report.submittedOn}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(report.reviewStatus)}
                  </td>
                  <td className="py-3.5 px-4 text-right pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewReport(report)}
                      className="hover:!border-indigo-400 hover:!text-indigo-600 text-xs"
                    >
                      View
                    </Button>
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

      {/* Details Modal */}
      <WorkUpdateDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}

