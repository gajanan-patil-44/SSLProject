// src/pages/WorkManagement/TaskAssignmentView.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  Button,
  FormField,
  Input,
  Textarea,
  Badge
} from '../../components/ui/index';
import {
  UserPlus,
  Send,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  UserCheck,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  INITIAL_PROJECTS,
  INITIAL_TEAM_MEMBERS,
  saveTask
} from './workManagementData';
import { useERPStore } from '../../store/useERPStore';

export default function TaskAssignmentView() {
  const navigate = useNavigate();
  const showToast = useERPStore((state) => state.showToast);
  const user = useERPStore((state) => state.user);
  const session = useERPStore((state) => state.session);

  const currentManagerName = user?.name || user?.LoginName || session?.LoginName || 'Andrew Miller (Tech Lead)';
  const currentManagerId = user?.UserId || 102;

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [projectId, setProjectId] = useState(INITIAL_PROJECTS[0].id);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState(INITIAL_TEAM_MEMBERS[0].id);
  const [priority, setPriority] = useState('High');
  const [taskType, setTaskType] = useState('Feature');
  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(nextWeekStr);
  const [submitting, setSubmitting] = useState(false);

  const handleReset = () => {
    setTaskTitle('');
    setTaskDescription('');
    setPriority('High');
    setTaskType('Feature');
    setStartDate(todayStr);
    setDueDate(nextWeekStr);
    showToast('Task form cleared.', 'info');
  };

  const handleAssignTask = (e) => {
    e?.preventDefault();
    if (!taskTitle.trim()) {
      showToast('Please provide a task title.', 'error');
      return;
    }
    if (!taskDescription.trim()) {
      showToast('Please enter task deliverables and description.', 'error');
      return;
    }
    if (startDate > dueDate) {
      showToast('Due date cannot precede the start date.', 'error');
      return;
    }

    setSubmitting(true);
    const assignedMember = INITIAL_TEAM_MEMBERS.find((m) => m.id === Number(assignedToId)) || INITIAL_TEAM_MEMBERS[0];
    const project = INITIAL_PROJECTS.find((p) => p.id === Number(projectId)) || INITIAL_PROJECTS[0];

    const newTask = {
      id: `TSK-${Math.floor(600 + Math.random() * 400)}`,
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      projectId: project.id,
      projectName: project.name,
      assignedToId: assignedMember.id,
      assignedToName: assignedMember.name,
      assignedById: currentManagerId,
      assignedByName: currentManagerName,
      priority,
      taskType,
      startDate,
      dueDate,
      progress: 0,
      status: 'Not Started',
      remarks: 'Task assigned by team lead.'
    };

    saveTask(newTask);
    setSubmitting(false);
    showToast(`Task ${newTask.id} assigned to ${assignedMember.name}!`, 'success');
    navigate('/work-management/project-tasks');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Assignment"
        description="Create, structure, prioritize, and allocate tasks across engineers, analysts, and designers."
        badge="Lead & Manager Workspace"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Task Assignment' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"></div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Task Allocation Form
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Define project scope, assignment metadata, and expected milestone date.
                </p>
              </div>
              <Badge variant="primary">Manager Dispatch</Badge>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-4.5">
              {/* Project & Task Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label="Project / Work Area" required>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    {INITIAL_PROJECTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Task Type" required>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    <option value="Feature">Feature Implementation</option>
                    <option value="Bug Fix">Bug Fix / Hotfix</option>
                    <option value="Code Review">Code Review & Architecture</option>
                    <option value="Testing & QA">Testing & QA Automation</option>
                    <option value="Tech Debt">Technical Debt Refactor</option>
                    <option value="Design">UX / UI Design Specification</option>
                    <option value="Documentation">Technical Documentation</option>
                  </select>
                </FormField>
              </div>

              {/* Task Title */}
              <FormField label="Task Title" required helpText="Brief, high-impact headline for the task (max 120 chars).">
                <Input
                  type="text"
                  value={taskTitle}
                  maxLength={120}
                  onChange={(e) => setTaskTitle(e.target.value.slice(0, 120))}
                  placeholder="e.g. Implement multi-tier approval workflow for expense reports"
                  className="text-xs font-semibold"
                />
              </FormField>

              {/* Task Description */}
              <FormField label="Task Description & Deliverables" required helpText="Specify acceptance criteria, API endpoints, or edge case considerations (max 1000 chars).">
                <Textarea
                  rows={4}
                  value={taskDescription}
                  maxLength={1000}
                  onChange={(e) => setTaskDescription(e.target.value.slice(0, 1000))}
                  placeholder="e.g. 1. Build client form with validation for amount and department. 2. Connect with /expense/submit API endpoint. 3. Handle rejected states gracefully..."
                  className="text-xs"
                />
              </FormField>

              {/* Assignee & Assigner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label="Assigned To (Employee)" required>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    {INITIAL_TEAM_MEMBERS.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} — {member.role} ({member.department})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Assigned By (Manager / Lead)" helpText="Auto-assigned based on your logged in account.">
                  <Input
                    type="text"
                    disabled
                    value={currentManagerName}
                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold cursor-not-allowed"
                  />
                </FormField>
              </div>

              {/* Priority & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <FormField label="Priority" required>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </FormField>

                <FormField label="Start Date" required>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs font-semibold"
                  />
                </FormField>

                <FormField label="Due Date" required>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-xs font-semibold"
                  />
                </FormField>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleReset}
                >
                  Reset
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Send}
                  disabled={submitting}
                  className="shadow-md shadow-indigo-500/25"
                >
                  Create & Assign Task
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side Panel: Assignment Guidelines: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 border-indigo-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Manager Assignment Guidelines
                </h4>
                <span className="text-[11px] text-slate-400">Best practices for effective sprint execution</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block">Clear Deliverables Definition</strong>
                  <span>Always specify explicit acceptance criteria and edge cases in the description so the engineer can start immediately without ambiguity.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block">Balanced Workload Allocation</strong>
                  <span>Avoid assigning more than 8.0 planned hours/day to an individual engineer to maintain velocity and prevent burnout.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block">Highlight Dependencies Early</strong>
                  <span>If this task requires external API credentials or design assets, flag them in the description and follow up before sprint kickoff.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block">Set Milestones & Review Schedule</strong>
                  <span>For tasks exceeding 3 days in duration, configure intermediate check-in checkpoints on the Project Task Tracker.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block">Prompt Clarification Response</strong>
                  <span>Monitor the Work Update Review screen daily and resolve blocked or clarification requests within 2 hours.</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

