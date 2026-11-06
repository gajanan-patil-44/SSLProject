// src/pages/WorkManagement/components/UpdateTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button, FormField, Input, Textarea, Select } from '../../../components/ui/index';
import { CheckCircle2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useERPStore } from '../../../store/useERPStore';

export default function UpdateTaskModal({ isOpen, onClose, task, onTaskUpdate }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = useERPStore((state) => state.showToast);

  useEffect(() => {
    if (task) {
      setProgress(task.progress !== undefined ? task.progress : 0);
      setStatus(task.status || 'In Progress');
      setRemarks(task.remarks || '');
    }
  }, [task]);

  if (!task) return null;

  const handleProgressChange = (val) => {
    if (val === '') {
      setProgress('');
      return;
    }
    const cleanStr = String(val).replace(/\D/g, '').slice(0, 3);
    const parsed = parseInt(cleanStr, 10);
    const num = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
    setProgress(num);
    if (num === 100 && status !== 'Completed') {
      setStatus('Completed');
    } else if (num < 100 && status === 'Completed') {
      setStatus('In Progress');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (onTaskUpdate) {
        await onTaskUpdate(task.id, {
          progress: Number(progress),
          status,
          remarks: remarks.trim()
        });
      }
      showToast(`Task ${task.id} updated successfully!`, 'success');
      onClose();
    } catch (err) {
      showToast('Failed to update task progress.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Task — ${task.id}`}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={handleSubmit}
            disabled={loading}
          >
            Save Progress
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title & Meta Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {task.projectName}
          </span>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {task.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
            <span>Due: {task.dueDate}</span>
            <span>•</span>
            <span>Priority: <strong className="text-slate-700 dark:text-slate-300">{task.priority}</strong></span>
          </div>
        </div>

        {/* Progress Slider & Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Task Completion Progress
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{progress}%</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => handleProgressChange(e.target.value)}
              className="flex-1 accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <Input
              type="number"
              min="0"
              max="100"
              value={progress}
              onKeyDown={(e) => {
                if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => handleProgressChange(e.target.value)}
              className="w-20 text-center text-xs font-bold"
            />
          </div>

          {/* Visual gradient bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500'
              }`}
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Status Dropdown */}
        <FormField label="Task Status" required>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-2xs"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </FormField>

        {/* Progress Remarks */}
        <FormField label="Progress Remarks / Challenges" helpText="Summarize recent developments, completed sub-tasks, or blockers (max 300 chars).">
          <Textarea
            rows={3}
            value={remarks}
            maxLength={300}
            onChange={(e) => setRemarks(e.target.value.slice(0, 300))}
            placeholder="e.g. Unit tests implemented for form controllers. Ready for PR review."
            className="w-full text-xs"
          />
        </FormField>
      </form>
    </Modal>
  );
}

