// src/pages/WorkManagement/ProjectTaskTrackerView.jsx
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
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FolderKanban,
  User,
  SlidersHorizontal,
  Edit,
  Eye,
  Calendar
} from 'lucide-react';
import { getAllTasks, INITIAL_PROJECTS, updateTaskProgress } from './workManagementData';
import UpdateTaskModal from './components/UpdateTaskModal';

export default function ProjectTaskTrackerView() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(getAllTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedTask, setSelectedTask] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const reloadData = () => {
    setTasks(getAllTasks());
  };

  // KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const metrics = useMemo(() => {
    const total = tasks.length;
    const notStarted = tasks.filter((t) => t.status === 'Not Started').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const overdue = tasks.filter((t) => t.status !== 'Completed' && t.dueDate < todayStr).length;

    return { total, notStarted, inProgress, overdue };
  }, [tasks, todayStr]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const searchMatch =
        !searchTerm.trim() ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.projectName?.toLowerCase().includes(searchTerm.toLowerCase());

      const projectMatch =
        projectFilter === 'All' ||
        String(t.projectId) === String(projectFilter) ||
        t.projectName?.toLowerCase() === projectFilter.toLowerCase();

      const statusMatch =
        statusFilter === 'All' ||
        t.status?.toLowerCase() === statusFilter.toLowerCase();

      return searchMatch && projectMatch && statusMatch;
    });
  }, [tasks, searchTerm, projectFilter, statusFilter]);

  const handleTaskUpdate = (taskId, data) => {
    const updated = updateTaskProgress(taskId, data);
    setTasks(updated);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge variant="danger">High</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="neutral">Low</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="primary">In Progress</Badge>;
      case 'Under Review':
        return <Badge variant="info">Under Review</Badge>;
      case 'Blocked':
        return <Badge variant="danger">Blocked</Badge>;
      case 'Not Started':
      default:
        return <Badge variant="neutral">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Task Tracker"
        description="Cross-project consolidated matrix tracking sprint allocations, progress velocity, overdue milestones, and team bottlenecks."
        badge="Sprint Matrix"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Task Tracker' }
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/work-management/task-assignment')}
          >
            Assign New Task
          </Button>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={metrics.total}
          badgeText="All projects"
          badgeVariant="primary"
          icon={Kanban}
          iconColorClass="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
          description="Cumulative sprint tickets"
        />
        <StatCard
          title="Not Started"
          value={metrics.notStarted}
          badgeText="Queued"
          badgeVariant="neutral"
          icon={Clock}
          iconColorClass="bg-gradient-to-tr from-slate-500 to-slate-700 text-white shadow-md shadow-slate-500/30"
          description="Awaiting kickoff"
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgress}
          badgeText="Active execution"
          badgeVariant="success"
          icon={CheckCircle2}
          iconColorClass="bg-gradient-to-tr from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/30"
          description="Under active engineering"
        />
        <StatCard
          title="Overdue"
          value={metrics.overdue}
          badgeText={metrics.overdue > 0 ? "Requires action" : "Zero overdue"}
          badgeVariant={metrics.overdue > 0 ? "danger" : "success"}
          icon={AlertCircle}
          iconColorClass="bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30"
          description="Exceeded scheduled target date"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white/95 dark:bg-slate-900/95 p-4 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur-md">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by ID, title, assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9.5 text-xs font-medium"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-9.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="All">All Projects</option>
            {INITIAL_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {(searchTerm || projectFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setProjectFilter('All');
                setStatusFilter('All');
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

      {/* Table Matrix */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-md shadow-slate-200/40 dark:shadow-black/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-slate-100/95 via-indigo-50/60 to-purple-50/40 dark:from-slate-800/90 dark:via-indigo-950/60 dark:to-slate-800/90">
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Task ID
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Task Title
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Project
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Assigned To
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Priority
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Start Date
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Due Date
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Progress (%)
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
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <Kanban className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No project tasks found.</p>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = task.status !== 'Completed' && task.dueDate < todayStr;
                return (
                  <tr
                    key={task.id}
                    className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/30 hover:to-indigo-50/50 dark:hover:bg-gradient-to-r dark:hover:from-indigo-950/30 dark:hover:via-purple-950/20 dark:hover:to-indigo-950/30 transition-all text-xs"
                  >
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {task.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {task.title}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {task.projectName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        {task.assignedToName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {task.startDate}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                        {task.dueDate} {isOverdue && '⚠️'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 w-32 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-700 dark:text-slate-200">{task.progress}%</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              task.progress === 100
                                ? 'bg-emerald-500'
                                : task.progress > 50
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsUpdateOpen(true);
                        }}
                        className="text-xs !py-1 !px-2.5"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <UpdateTaskModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        task={selectedTask}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}

