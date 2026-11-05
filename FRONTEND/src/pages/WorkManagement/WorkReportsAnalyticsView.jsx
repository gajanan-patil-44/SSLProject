// src/pages/WorkManagement/WorkReportsAnalyticsView.jsx
import React, { useState, useMemo } from 'react';
import {
  PageHeader,
  StatCard,
  Card,
  Button,
  Badge,
  Input
} from '../../components/ui/index';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid
} from 'recharts';
import { INITIAL_DEPARTMENTS, INITIAL_PROJECTS } from './workManagementData';
import { useERPStore } from '../../store/useERPStore';

export default function WorkReportsAnalyticsView() {
  const showToast = useERPStore((state) => state.showToast);

  const [period, setPeriod] = useState('Current Week');
  const [department, setDepartment] = useState('All');
  const [project, setProject] = useState('All');
  const [reportType, setReportType] = useState('Daily Summary');

  // KPIs
  const metrics = {
    reportsSubmitted: 842,
    complianceRate: 94.6,
    totalHoursLogged: '6,736h',
    avgHoursPerDay: '7.9h'
  };

  // Daily Submission Trend (Bar chart data)
  const dailyTrend = [
    { day: 'Mon', reports: 138, hours: 1104, compliance: 93 },
    { day: 'Tue', reports: 142, hours: 1136, compliance: 96 },
    { day: 'Wed', reports: 140, hours: 1120, compliance: 95 },
    { day: 'Thu', reports: 144, hours: 1152, compliance: 97 },
    { day: 'Fri', reports: 139, hours: 1112, compliance: 94 },
    { day: 'Sat', reports: 82, hours: 656, compliance: 85 },
    { day: 'Sun', reports: 57, hours: 456, compliance: 78 }
  ];

  // Work Status Distribution percentages
  const statusPercentages = {
    completed: 68,
    inProgress: 26,
    blocked: 6
  };

  // Department-wise Work Summary Table Matrix
  const deptMatrix = [
    {
      department: 'Engineering',
      employees: 52,
      reports: 254,
      submissionRate: 97.2,
      hoursLogged: 2032,
      completed: 184,
      blocked: 4
    },
    {
      department: 'Product',
      employees: 20,
      reports: 98,
      submissionRate: 98.0,
      hoursLogged: 784,
      completed: 72,
      blocked: 1
    },
    {
      department: 'QA / Testing',
      employees: 24,
      reports: 116,
      submissionRate: 96.6,
      hoursLogged: 928,
      completed: 90,
      blocked: 2
    },
    {
      department: 'Design',
      employees: 16,
      reports: 76,
      submissionRate: 95.0,
      hoursLogged: 608,
      completed: 58,
      blocked: 0
    },
    {
      department: 'Operations',
      employees: 18,
      reports: 84,
      submissionRate: 93.3,
      hoursLogged: 672,
      completed: 60,
      blocked: 3
    },
    {
      department: 'Sales & Marketing',
      employees: 12,
      reports: 58,
      submissionRate: 96.6,
      hoursLogged: 464,
      completed: 45,
      blocked: 1
    },
    {
      department: 'HR & Finance',
      employees: 6,
      reports: 28,
      submissionRate: 93.3,
      hoursLogged: 224,
      completed: 24,
      blocked: 0
    }
  ];

  const handleExportCSV = () => {
    const headers = ['Department', 'Employees', 'Reports Submitted', 'Compliance %', 'Hours Logged', 'Completed Activities', 'Blocked Activities'];
    const rows = deptMatrix.map((d) => [
      `"${d.department}"`,
      d.employees,
      d.reports,
      `${d.submissionRate}%`,
      `${d.hoursLogged} hrs`,
      d.completed,
      d.blocked
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `work_reports_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics summary exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Reports & Analytics"
        description="Enterprise business intelligence and multi-department telemetry on work execution velocity, SLA adherence, and team time expenditure."
        badge="BI & Telemetry"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Analytics' }
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export to CSV
          </Button>
        }
      />

      {/* Filter Control Bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 p-4 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="Current Week">Current Week</option>
              <option value="Current Month">Current Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Quarter">Last Quarter</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Department:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Departments</option>
              {INITIAL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Project:</span>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Projects</option>
              {INITIAL_PROJECTS.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Type:</span>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="Daily Summary">Daily Summary</option>
              <option value="Detailed Activity Breakdown">Detailed Activity Breakdown</option>
              <option value="Compliance Matrix">Compliance Matrix</option>
            </select>
          </div>
        </div>

        <Badge variant="primary">{period}</Badge>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reports Submitted"
          value={metrics.reportsSubmitted}
          badgeText="+18.4% MoM"
          badgeVariant="success"
          icon={BarChart3}
          iconColorClass="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
          description="Total reports logged in period"
        />
        <StatCard
          title="Submission Compliance"
          value={`${metrics.complianceRate}%`}
          badgeText="SLA Exceeded"
          badgeVariant="success"
          icon={CheckCircle2}
          iconColorClass="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30"
          description="Target 95.0% adherence"
        />
        <StatCard
          title="Total Hours Logged"
          value={metrics.totalHoursLogged}
          badgeText="Cumulative"
          badgeVariant="primary"
          icon={Clock}
          iconColorClass="bg-gradient-to-tr from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/30"
          description="Verified productive time"
        />
        <StatCard
          title="Average Hours/Day"
          value={metrics.avgHoursPerDay}
          badgeText="Healthy band"
          badgeVariant="success"
          icon={TrendingUp}
          iconColorClass="bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30"
          description="Benchmark standard 8.0h"
        />
      </div>

      {/* Middle Grid: Daily Submission Trend (8 cols) + Work Status Distribution (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Daily Submission Trend Bar Chart */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Daily Submission & Hours Trend
                </h3>
                <p className="text-[11px] text-slate-400">Reports submitted by day of the week</p>
              </div>
              <Badge variant="success">Current Sprint</Badge>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="reports" fill="#6366f1" radius={[6, 6, 0, 0]} name="Reports Submitted" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Peak submission hour: 6:15 PM – 6:45 PM IST</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">96.8% Weekday Average</span>
            </div>
          </Card>
        </div>

        {/* Work Status Distribution Bars */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Work Status Distribution
                </h3>
                <p className="text-[11px] text-slate-400">Total activities percentage breakdown</p>
              </div>
            </div>

            <div className="space-y-4 flex-1 justify-center flex flex-col">
              {/* Completed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Completed Activities
                  </span>
                  <span className="text-slate-800 dark:text-slate-100">{statusPercentages.completed}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${statusPercentages.completed}%` }}
                  ></div>
                </div>
              </div>

              {/* In Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    In Progress
                  </span>
                  <span className="text-slate-800 dark:text-slate-100">{statusPercentages.inProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    style={{ width: `${statusPercentages.inProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Blocked */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Blocked / Impeded
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">{statusPercentages.blocked}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-600"
                    style={{ width: `${statusPercentages.blocked}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300">
              💡 94% of recorded activities are proceeding without external blockages.
            </div>
          </Card>
        </div>
      </div>

      {/* Department-wise Work Summary Table Matrix */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Department-wise Work Summary Table
            </h3>
            <p className="text-[11px] text-slate-400">Consolidated reporting matrix by business unit</p>
          </div>
          <Badge variant="primary">{deptMatrix.length} Departments</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-slate-100/95 via-indigo-50/60 to-purple-50/40 dark:from-slate-800/90 dark:via-indigo-950/60 dark:to-slate-800/90">
                <th className="py-3 px-4 font-extrabold uppercase text-slate-700 dark:text-slate-200">
                  Department
                </th>
                <th className="py-3 px-4 font-extrabold uppercase text-slate-700 dark:text-slate-200 text-center">
                  Employees
                </th>
                <th className="py-3 px-4 font-extrabold uppercase text-slate-700 dark:text-slate-200 text-center">
                  Reports Logged
                </th>
                <th className="py-3 px-4 font-extrabold uppercase text-slate-700 dark:text-slate-200 text-center">
                  Submission %
                </th>
                <th className="py-3 px-4 font-extrabold uppercase text-slate-700 dark:text-slate-200 text-center">
                  Hours Logged
                </th>
                <th className="py-3 px-4 font-extrabold uppercase text-slate-700 dark:text-slate-200 text-center">
                  Completed Activities
                </th>
                <th className="py-3 px-4 font-extrabold uppercase text-slate-700 dark:text-slate-200 text-center">
                  Blocked Activities
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {deptMatrix.map((item) => (
                <tr
                  key={item.department}
                  className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  <td className="py-3 px-4 font-extrabold text-slate-800 dark:text-slate-100">
                    {item.department}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-600 dark:text-slate-300">
                    {item.employees}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-100">
                    {item.reports}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {item.submissionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-black text-slate-900 dark:text-white">
                    {item.hoursLogged} hrs
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.completed}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.blocked > 0 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                        {item.blocked}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

