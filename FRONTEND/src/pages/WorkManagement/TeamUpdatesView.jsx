// src/pages/WorkManagement/TeamUpdatesView.jsx
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
  Users,
  CheckCircle2,
  AlertCircle,
  Bell,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Building2,
  Clock,
  Send,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import {
  getAllReports,
  getAllTeamMembers,
  INITIAL_DEPARTMENTS
} from './workManagementData';
import WorkUpdateDetailsModal from './components/WorkUpdateDetailsModal';
import { useERPStore } from '../../store/useERPStore';

export default function TeamUpdatesView() {
  const showToast = useERPStore((state) => state.showToast);
  const [reports] = useState(getAllReports);
  const [teamMembers] = useState(getAllTeamMembers);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Reminders sent tracking
  const [remindedMap, setRemindedMap] = useState({});

  // Merge team members with today's reports
  const todayStr = new Date().toISOString().split('T')[0];
  const complianceData = useMemo(() => {
    return teamMembers.map((member) => {
      // Find latest report for this member
      const memberReport = reports.find(
        (r) => r.employeeId === member.employeeId || r.employeeName === member.name
      );

      const hasSubmitted = !!memberReport;
      const entries = memberReport?.entries || [];
      const hours = memberReport?.totalHours || 0;
      const completedCount = entries.filter((e) => e.status === 'Completed').length;
      const inProgressCount = entries.filter((e) => e.status === 'In Progress').length;
      const blockedCount = entries.filter((e) => e.status === 'Blocked').length;

      return {
        ...member,
        hasSubmitted,
        report: memberReport,
        entriesCount: entries.length,
        hours,
        completedCount,
        inProgressCount,
        blockedCount,
        submissionStatus: hasSubmitted ? 'Submitted' : 'Not Submitted'
      };
    });
  }, [teamMembers, reports]);

  // KPIs
  const metrics = useMemo(() => {
    const totalMembers = complianceData.length;
    const submitted = complianceData.filter((m) => m.hasSubmitted).length;
    const notSubmitted = totalMembers - submitted;
    const blockedCount = complianceData.reduce((acc, m) => acc + m.blockedCount, 0);

    return { totalMembers, submitted, notSubmitted, blockedCount };
  }, [complianceData]);

  // Filtering
  const filteredData = useMemo(() => {
    return complianceData.filter((item) => {
      const searchMatch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase());

      const deptMatch =
        departmentFilter === 'All' ||
        item.department.toLowerCase() === departmentFilter.toLowerCase();

      const statusMatch =
        statusFilter === 'All' ||
        (statusFilter === 'Blocked' && item.blockedCount > 0) ||
        (statusFilter === 'Submitted' && item.hasSubmitted) ||
        (statusFilter === 'Not Submitted' && !item.hasSubmitted);

      return searchMatch && deptMatch && statusMatch;
    });
  }, [complianceData, searchTerm, departmentFilter, statusFilter]);

  const handleRemind = (employee) => {
    setRemindedMap((prev) => ({ ...prev, [employee.id]: true }));
    showToast(`Instant reminder sent to ${employee.name} (${employee.email})`, 'success');
  };

  const handleViewReport = (report) => {
    if (!report) {
      showToast('This employee has not submitted a daily update yet today.', 'warning');
      return;
    }
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team / Department Updates"
        description="Monitor daily reporting compliance across all departments, track submission rates, identify blockers, and send instant nudge reminders."
        badge="Manager Compliance Hub"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Team Updates' }
        ]}
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Members"
          value={metrics.totalMembers}
          badgeText="Active staff"
          badgeVariant="primary"
          icon={Users}
          iconColorClass="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
          description="Total monitored employees"
        />
        <StatCard
          title="Submitted Today"
          value={metrics.submitted}
          badgeText={`${Math.round((metrics.submitted / (metrics.totalMembers || 1)) * 100)}% Compliance`}
          badgeVariant="success"
          icon={CheckCircle2}
          iconColorClass="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30"
          description="Reports lodged for today"
        />
        <StatCard
          title="Not Submitted"
          value={metrics.notSubmitted}
          badgeText="Pending action"
          badgeVariant={metrics.notSubmitted > 0 ? "warning" : "success"}
          icon={Clock}
          iconColorClass="bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30"
          description="Nudge reminder required"
        />
        <StatCard
          title="Blocked Activities"
          value={metrics.blockedCount}
          badgeText={metrics.blockedCount > 0 ? "Critical attention" : "All clear"}
          badgeVariant={metrics.blockedCount > 0 ? "danger" : "success"}
          icon={AlertTriangle}
          iconColorClass="bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30"
          description="Impediments flagged by team"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white/95 dark:bg-slate-900/95 p-4 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur-md">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search member, ID, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9.5 text-xs font-medium"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="All">All Departments</option>
            {INITIAL_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Not Submitted">Not Submitted</option>
            <option value="Blocked">Has Blockers</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {(searchTerm || departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Compliance Data Table */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-md shadow-slate-200/40 dark:shadow-black/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-slate-100/95 via-indigo-50/60 to-purple-50/40 dark:from-slate-800/90 dark:via-indigo-950/60 dark:to-slate-800/90">
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Employee
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Department
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center">
                Work Entries
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center">
                Hours
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center">
                Completed
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center">
                In Progress
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center">
                Blocked
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Submission Status
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 text-right pr-6">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <Users className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No team members match your filters.</p>
                </td>
              </tr>
            ) : (
              filteredData.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/30 hover:to-indigo-50/50 dark:hover:bg-gradient-to-r dark:hover:from-indigo-950/30 dark:hover:via-purple-950/20 dark:hover:to-indigo-950/30 transition-all text-xs"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {emp.employeeId} • {emp.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                    {emp.department}
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-100">
                    {emp.entriesCount}
                  </td>

                  <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                    {emp.hours}h
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {emp.completedCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {emp.inProgressCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {emp.blockedCount > 0 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                        {emp.blockedCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold">0</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {emp.hasSubmitted ? (
                      <Badge variant="success">Submitted</Badge>
                    ) : (
                      <Badge variant="danger">Not Submitted</Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      {emp.hasSubmitted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleViewReport(emp.report)}
                          className="text-xs !py-1 !px-2.5"
                        >
                          View
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Bell}
                          disabled={remindedMap[emp.id]}
                          onClick={() => handleRemind(emp)}
                          className={`text-xs !py-1 !px-2.5 ${remindedMap[emp.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {remindedMap[emp.id] ? 'Reminded' : 'Remind'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <WorkUpdateDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}

