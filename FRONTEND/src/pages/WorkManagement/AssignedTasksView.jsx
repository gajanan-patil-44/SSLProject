// src/pages/WorkManagement/AssignedTasksView.jsx
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
  CheckSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Edit,
  Eye,
  RefreshCw,
  FolderKanban,
  User,
  TrendingUp
} from 'lucide-react';
import { getAllTasks, INITIAL_PROJECTS, updateTaskProgress } from './workManagementData';
import UpdateTaskModal from './components/UpdateTaskModal';
import { Modal } from '../../components/ui/Modal';

export default function AssignedTasksView() {
  const [tasks, setTasks] = useState(getAllTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const reloadData = () => {
    setTasks(getAllTasks());
  };

  // KPIs
  const metrics = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    // Due this week: due in next 7 days or overdue
    const dueThisWeek = tasks.filter((t) => t.status !== 'Completed').length;

    return { total, inProgress, dueThisWeek, completed };
  }, [tasks]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const searchMatch =
        !searchTerm.trim() ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleUpdateClick = (task) => {
    setSelectedTask(task);
    setIsUpdateOpen(true);
  };

  const handleViewClick = (task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const handleTaskUpdateSubmit = (taskId, data) => {
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
        title="My Assigned Tasks"
        description="Track all tasks delegated to you, update percentage progress, review assignment priorities, and report blockers."
        badge="Task Workspace"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Assigned Tasks' }
        ]}
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={metrics.total}
          badgeText="Active pool"
          badgeVariant="primary"
          icon={CheckSquare}
          iconColorClass="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
          description="Assigned directly to you"
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgress}
          badgeText="Ongoing"
          badgeVariant="primary"
          icon={TrendingUp}
          iconColorClass="bg-gradient-to-tr from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/30"
          description="Active sprint tasks"
        />
        <StatCard
          title="Due This Week"
          value={metrics.dueThisWeek}
          badgeText="High focus"
          badgeVariant="warning"
          icon={Calendar}
          iconColorClass="bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30"
          description="Deadlines nearing within 7 days"
        />
        <StatCard
          title="Completed"
          value={metrics.completed}
          badgeText="Done"
          badgeVariant="success"
          icon={CheckCircle2}
          iconColorClass="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30"
          description="Verified deliverables"
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
              placeholder="Search tasks, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9.5 text-xs font-medium"
            />
          </div>

          {/* Project Dropdown */}
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

          {/* Status Dropdown */}
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
            title="Refresh tasks"
          />
        </div>
      </div>

      {/* Tasks Data Table */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-md shadow-slate-200/40 dark:shadow-black/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-r from-slate-100/95 via-indigo-50/60 to-purple-50/40 dark:from-slate-800/90 dark:via-indigo-950/60 dark:to-slate-800/90">
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Task ID
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Task Title / Description
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Project
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Assigned By
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Priority
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Due Date
              </th>
              <th className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Progress
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
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <CheckSquare className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No assigned tasks match your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/30 hover:to-indigo-50/50 dark:hover:bg-gradient-to-r dark:hover:from-indigo-950/30 dark:hover:via-purple-950/20 dark:hover:to-indigo-950/30 transition-all text-xs"
                >
                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {task.id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                      {task.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {task.description}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {task.projectName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {task.assignedByName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {task.dueDate}
                  </td>
                  <td className="py-3.5 px-4 w-32">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{task.progress}%</span>
                      </div>
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleUpdateClick(task)}
                        className="text-xs !py-1 !px-2.5"
                      >
                        Update
                      </Button>
                      <IconButton
                        icon={Eye}
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewClick(task)}
                        title="View details"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Update Task Modal */}
      <UpdateTaskModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        task={selectedTask}
        onTaskUpdate={handleTaskUpdateSubmit}
      />

      {/* View Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Task Details — ${selectedTask.id}`}
          size="md"
          actions={
            <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {selectedTask.projectName} • {selectedTask.taskType}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                {selectedTask.title}
              </h3>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Description:</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedTask.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Priority</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTask.priority}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Status</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTask.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Start Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTask.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Due Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTask.dueDate}</span>
              </div>
            </div>

            {selectedTask.remarks && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Progress Remarks:</span>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{selectedTask.remarks}"
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

