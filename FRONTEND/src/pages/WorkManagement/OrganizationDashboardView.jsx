// src/pages/WorkManagement/OrganizationDashboardView.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  StatCard,
  Card,
  Button,
  Badge
} from '../../components/ui/index';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ListTodo,
  AlertTriangle,
  Building2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Hourglass,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip
} from 'recharts';
import {
  getAllReports,
  getAllTasks,
  getAllTeamMembers,
  INITIAL_DEPARTMENTS
} from './workManagementData';
import { useERPStore } from '../../store/useERPStore';

export default function OrganizationDashboardView() {
  const navigate = useNavigate();
  const showToast = useERPStore((state) => state.showToast);

  const reports = getAllReports();
  const tasks = getAllTasks();
  const team = getAllTeamMembers();

  // KPIs
  const totalEmployees = 148;
  const reportsSubmitted = 132;
  const complianceRate = Math.round((reportsSubmitted / totalEmployees) * 100);
  const activitiesLogged = 486;
  const blockedActivities = 8;

  // Department-wise Submission Widget Data
  const deptSubmissions = [
    { department: 'Engineering', submitted: 48, total: 52, percentage: 92, color: 'from-indigo-600 to-violet-600' },
    { department: 'Product', submitted: 18, total: 20, percentage: 90, color: 'from-purple-600 to-pink-600' },
    { department: 'QA / Testing', submitted: 22, total: 24, percentage: 91, color: 'from-cyan-600 to-teal-600' },
    { department: 'Design', submitted: 14, total: 16, percentage: 88, color: 'from-blue-600 to-indigo-600' },
    { department: 'Operations', submitted: 15, total: 18, percentage: 83, color: 'from-emerald-600 to-teal-600' },
    { department: 'Sales & Marketing', submitted: 10, total: 12, percentage: 83, color: 'from-amber-500 to-orange-500' },
    { department: 'HR & Finance', submitted: 5, total: 6, percentage: 83, color: 'from-rose-500 to-red-600' }
  ];

  // Activity Status Overview Donut data
  const activityBreakdown = [
    { name: 'Completed', value: 340, color: '#10b981' },
    { name: 'In Progress', value: 122, color: '#6366f1' },
    { name: 'Blocked', value: 24, color: '#ef4444' }
  ];

  // Management Attention Items
  const attentionItems = [
    {
      id: 1,
      type: 'Blocked Task',
      severity: 'Critical',
      title: 'Database connection pool timeout on Billing Cluster',
      department: 'Operations',
      assignee: 'Karthik Raja',
      timeAgo: 'Reported 3h ago',
      actionText: 'Resolve Blocker',
      route: '/work-management/project-tasks'
    },
    {
      id: 2,
      type: 'Pending Review',
      severity: 'High',
      title: 'Daily Update #WR-2026-104 requires parameter verification',
      department: 'Engineering',
      assignee: 'Pooja Sharma',
      timeAgo: 'Submitted 6h ago',
      actionText: 'Open Review',
      route: '/work-management/review'
    },
    {
      id: 3,
      type: 'Overdue Report',
      severity: 'Medium',
      title: '7 team members in Operations have not lodged daily logs',
      department: 'Operations',
      assignee: 'Operations Team Lead',
      timeAgo: 'SLA Exceeded by 2h',
      actionText: 'Send Nudge',
      route: '/work-management/team-updates'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Dashboard"
        description="Executive management overview of organizational reporting compliance, activity completion velocity, and operational blocker triage."
        badge="Executive Overview"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Org Dashboard' }
        ]}
      />

      {/* Top Management KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          badgeText="Active Roster"
          badgeVariant="primary"
          icon={Users}
          iconColorClass="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
          description="Across 8 operating divisions"
        />
        <StatCard
          title="Reports Submitted"
          value={`${reportsSubmitted} (${complianceRate}%)`}
          badgeText="High compliance"
          badgeVariant="success"
          icon={FileCheck}
          iconColorClass="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30"
          description="Daily updates lodged today"
        />
        <StatCard
          title="Activities Logged"
          value={activitiesLogged}
          badgeText="4.1 avg/staff"
          badgeVariant="primary"
          icon={ListTodo}
          iconColorClass="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30"
          description="Productive activities tracked"
        />
        <StatCard
          title="Blocked Activities"
          value={blockedActivities}
          badgeText={blockedActivities > 0 ? "Needs triage" : "Zero blockers"}
          badgeVariant={blockedActivities > 0 ? "danger" : "success"}
          icon={AlertTriangle}
          iconColorClass="bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30"
          description="Impacting delivery timelines"
        />
      </div>

      {/* Middle Grid: Department Submission Bars (7 cols) + Activity Status Donut (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Department-wise Submission Widget */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Department-wise Submission Compliance
                </h3>
                <p className="text-[11px] text-slate-400">Horizontal compliance breakdown against target headcounts</p>
              </div>
              <Badge variant="success">89.2% Overall</Badge>
            </div>

            <div className="space-y-3.5 flex-1 justify-center flex flex-col">
              {deptSubmissions.map((dept) => (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">
                      {dept.department}
                    </span>
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      {dept.submitted} / {dept.total} ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${dept.color} transition-all duration-500`}
                      style={{ width: `${dept.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Goal: 95% compliance by 7:00 PM</span>
              <button
                onClick={() => navigate('/work-management/team-updates')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Full Team Roster <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        </div>

        {/* Activity Status Overview Donut Widget */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Activity Status Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">Total 486 activities logged across all reports</p>
              </div>
              <Badge variant="primary">Live</Badge>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
              <div className="w-40 h-40 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityBreakdown}
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {activityBreakdown.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">486</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Completed:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">340 (70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0"></span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">In Progress:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">122 (25%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Blocked:</span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">24 (5%)</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Delivery Velocity: +14% vs previous week</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">On Track</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid: Department Snapshot + Management Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Department Snapshot Table (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Department Snapshot Matrix
              </h3>
              <Badge variant="neutral">Today</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-2">Department</th>
                    <th className="py-2 text-center">Staff</th>
                    <th className="py-2 text-center">Logged</th>
                    <th className="py-2 text-center">Pending</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {deptSubmissions.slice(0, 5).map((d) => (
                    <tr key={d.department} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold text-slate-700 dark:text-slate-200">{d.department}</td>
                      <td className="py-2.5 text-center font-semibold text-slate-500">{d.total}</td>
                      <td className="py-2.5 text-center font-black text-emerald-600 dark:text-emerald-400">{d.submitted}</td>
                      <td className="py-2.5 text-center font-bold text-amber-500">{d.total - d.submitted}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.percentage >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200'}`}>
                          {d.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Management Attention (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Management Attention Required
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200">
                {attentionItems.length} Urgent
              </span>
            </div>

            <div className="space-y-2.5">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                        {item.type}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.department}</span>
                      <span className="text-[10px] text-slate-400">({item.timeAgo})</span>
                    </div>
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Owner: {item.assignee}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(item.route)}
                    className="shrink-0 text-xs !py-1 !px-2.5 hover:!border-indigo-500 hover:!text-indigo-600"
                  >
                    {item.actionText}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

