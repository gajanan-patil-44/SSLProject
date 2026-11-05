// src/pages/WorkManagement/DailyWorkUpdateView.jsx
import React, { useState, useMemo } from 'react';
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
  Calendar,
  Clock,
  Plus,
  Trash2,
  RotateCcw,
  Send,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  Building2,
  FileText,
  ListTodo,
  Check
} from 'lucide-react';
import {
  WORK_CATEGORIES,
  INITIAL_DEPARTMENTS,
  INITIAL_PROJECTS,
  saveReport
} from './workManagementData';
import { useERPStore } from '../../store/useERPStore';

export default function DailyWorkUpdateView() {
  const navigate = useNavigate();
  const showToast = useERPStore((state) => state.showToast);
  const user = useERPStore((state) => state.user);
  const session = useERPStore((state) => state.session);

  const employeeName = user?.name || user?.LoginName || session?.LoginName || 'Nithin T B';
  const employeeId = user?.EmployeeId || session?.EmployeeId || 'EMP-0101';

  // Primary form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [workDate, setWorkDate] = useState(todayStr);
  const [category, setCategory] = useState(WORK_CATEGORIES[0]);
  const [department, setDepartment] = useState(INITIAL_DEPARTMENTS[0]);
  const [projectId, setProjectId] = useState(INITIAL_PROJECTS[0].id);
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('2.0');
  const [status, setStatus] = useState('Completed');
  const [challenges, setChallenges] = useState('');
  const [remarks, setRemarks] = useState('');

  // Side Panel state: entries logged today & overall daily summary
  const [entries, setEntries] = useState([
    {
      id: 'TEMP-1',
      category: 'Development',
      department: 'Engineering',
      projectId: 1,
      project: 'ERP Cloud Suite',
      hours: 4.5,
      status: 'Completed',
      description: 'Built Work Management primary form controllers, dynamic hour calculation and responsive UI cards.',
      challenges: '',
      remarks: 'Validated against schema.'
    }
  ]);
  const [overallSummary, setOverallSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected project helper
  const selectedProject = useMemo(() => {
    return INITIAL_PROJECTS.find((p) => p.id === Number(projectId)) || INITIAL_PROJECTS[0];
  }, [projectId]);

  // Dynamic Total Hours Calculation
  const totalHours = useMemo(() => {
    return entries.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
  }, [entries]);

  const targetHours = 8.0;
  const hoursProgress = Math.min(100, Math.round((totalHours / targetHours) * 100));

  // Add Work Entry handler
  const handleAddEntry = (e) => {
    e?.preventDefault();
    if (!description.trim()) {
      showToast('Please enter a work description.', 'error');
      return;
    }
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      showToast('Please enter valid hours spent (> 0).', 'error');
      return;
    }

    const newEntry = {
      id: `ENT-${Date.now()}`,
      category,
      department,
      projectId: Number(projectId),
      project: selectedProject.name,
      hours: parsedHours,
      status,
      description: description.trim(),
      challenges: challenges.trim(),
      remarks: remarks.trim()
    };

    setEntries((prev) => [...prev, newEntry]);
    showToast(`Activity added: ${category} (${parsedHours}h)`, 'success');

    // Reset entry-level fields while keeping date & department
    setDescription('');
    setChallenges('');
    setRemarks('');
    setHours('1.5');
  };

  // Reset form handler
  const handleResetForm = () => {
    setDescription('');
    setChallenges('');
    setRemarks('');
    setHours('2.0');
    setStatus('Completed');
    setCategory(WORK_CATEGORIES[0]);
    showToast('Entry form reset.', 'info');
  };

  // Clear all entries
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all un-submitted work entries for today?')) {
      setEntries([]);
      setOverallSummary('');
      showToast('Today\'s entries cleared.', 'info');
    }
  };

  // Remove single entry
  const handleRemoveEntry = (id) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit full report bundle
  const handleSubmitReport = () => {
    if (entries.length === 0) {
      showToast('Please add at least one work entry before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    const newReport = {
      id: `WR-${Date.now().toString().slice(-6)}`,
      reportId: `WR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      employeeId,
      employeeName,
      department,
      workDate,
      totalHours: Number(totalHours.toFixed(2)),
      project: entries[0]?.project || selectedProject.name,
      submittedOn: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reviewStatus: 'Pending Review',
      reviewedBy: '',
      reviewedOn: '',
      reviewComments: '',
      overallSummary: overallSummary.trim() || `Daily report for ${workDate} covering ${entries.length} activities.`,
      entries: [...entries]
    };

    saveReport(newReport);
    setSubmitting(false);
    showToast(`Daily report ${newReport.reportId} submitted successfully!`, 'success');
    navigate('/work-management/work-history');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Daily Work Update"
        description="Log your daily activities, track recorded hours against daily target, and submit your verified update."
        badge="Employee Workspace"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Work Management' },
          { label: 'Daily Update' }
        ]}
      />

      {/* Main Grid: Left Primary Form (7 cols), Right Side Panel Tracker (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Primary Form Section */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"></div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Activity Entry Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fill in the details for each task or activity completed today.
                </p>
              </div>
              <Badge variant="primary">Step 1: Add Activities</Badge>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4.5">
              {/* Row 1: Date, Department, Project */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <FormField label="Work Date" required>
                  <Input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="text-xs font-semibold"
                  />
                </FormField>

                <FormField label="Department" required>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    {INITIAL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Project / Reference" required>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    {INITIAL_PROJECTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Row 2: Category, Hours Spent, Work Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <FormField label="Work Category" required>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    {WORK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Hours Spent" required helpText="e.g. 0.5, 1.5, 3.0, 4.0">
                  <Input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="16"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="text-xs font-semibold"
                    placeholder="2.0"
                  />
                </FormField>

                <FormField label="Work Status" required>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </FormField>
              </div>

              {/* Work Description */}
              <FormField label="Work Description" required helpText="Detail the deliverables, code changes, or milestones accomplished.">
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Developed the customer transaction ledger component and connected it with the backend ledger service..."
                  className="text-xs"
                />
              </FormField>

              {/* Challenges / Dependencies */}
              <FormField label="Challenges / Dependencies / Blockers" helpText="Mention any technical hurdles, missing approvals, or blockers.">
                <Textarea
                  rows={2}
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="e.g. Awaiting staging DB replication key from IT infrastructure team..."
                  className="text-xs"
                />
              </FormField>

              {/* Remarks */}
              <FormField label="Remarks / References" helpText="PR links, ticket IDs (e.g. #PR-402, #JIRA-128), or meeting notes.">
                <Input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. PR #149 approved by tech lead"
                  className="text-xs"
                />
              </FormField>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleResetForm}
                >
                  Reset Form
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Plus}
                  className="shadow-md shadow-indigo-500/25"
                >
                  Add Work Entry
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Side Panel (Today's Entries + Hours Tracker + Overall Summary) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Dynamically Updating Total Hours Tracker Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    Total Hours Tracker
                  </h4>
                  <span className="text-[11px] text-slate-400">Daily Target: 8.0 hrs</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {totalHours.toFixed(1)}
                  <span className="text-xs font-semibold text-slate-400 ml-1">/ 8.0h</span>
                </span>
                <span className={`block text-[10px] font-bold ${totalHours >= targetHours ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {totalHours >= targetHours ? '✓ Daily Goal Reached' : `${(targetHours - totalHours).toFixed(1)}h remaining`}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalHours >= targetHours
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500'
                }`}
                style={{ width: `${hoursProgress}%` }}
              ></div>
            </div>
          </Card>

          {/* Today's Work Entries List */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Today's Work Entries
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                  {entries.length}
                </span>
              </div>

              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Entries Scroll List */}
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {entries.length === 0 ? (
                <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                  <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No entries added yet today</p>
                  <p className="text-[11px] text-slate-400">Fill in the form on the left and click "Add Work Entry".</p>
                </div>
              ) : (
                entries.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 hover:border-indigo-300 transition-colors group relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{item.category}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{item.project}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-2xs">
                          {item.hours}h
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Blocked' ? 'danger' : 'primary'} className="text-[10px] px-2 py-0">
                        {item.status}
                      </Badge>
                      {item.challenges && (
                        <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                          ⚠️ Blocker
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Overall Daily Summary Section */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Overall Daily Summary</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional executive recap</span>
              </label>
              <Textarea
                rows={3}
                value={overallSummary}
                onChange={(e) => setOverallSummary(e.target.value)}
                placeholder="High-level recap for management: key accomplishments, overall sprint status, and planned work for tomorrow..."
                className="text-xs"
              />
            </div>

            {/* Submit Daily Report Button */}
            <Button
              type="button"
              variant="success"
              size="lg"
              icon={Send}
              onClick={handleSubmitReport}
              disabled={submitting || entries.length === 0}
              className="w-full shadow-lg shadow-emerald-500/20 font-extrabold"
            >
              Submit Daily Report ({totalHours.toFixed(1)} hrs)
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

