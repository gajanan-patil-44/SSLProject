// src/pages/WorkManagement/components/ReviewReportModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button, Textarea, Badge } from '../../../components/ui/index';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Building2,
  Calendar,
  MessageSquare,
  Send,
  HelpCircle
} from 'lucide-react';
import { useERPStore } from '../../../store/useERPStore';

export default function ReviewReportModal({ isOpen, onClose, report, onReviewSubmit }) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = useERPStore((state) => state.showToast);

  useEffect(() => {
    if (report) {
      setComments(report.reviewComments || '');
    }
  }, [report]);

  if (!report) return null;

  const entries = Array.isArray(report.entries) ? report.entries : [];

  const handleAction = async (status) => {
    if (status === 'Clarification Requested' && !comments.trim()) {
      showToast('Please specify clarification instructions in the review comments.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (onReviewSubmit) {
        await onReviewSubmit(report.id || report.reportId, status, comments.trim());
      }
      showToast(
        status === 'Reviewed'
          ? `Report ${report.reportId || report.id} marked as Reviewed!`
          : `Clarification requested for report ${report.reportId || report.id}`,
        'success'
      );
      onClose();
    } catch (e) {
      showToast('Failed to update report review status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Work Update — ${report.reportId || report.id}`}
      size="xl"
      actions={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={HelpCircle}
              onClick={() => handleAction('Clarification Requested')}
              disabled={loading}
              className="!text-amber-600 hover:!bg-amber-50 dark:!text-amber-400 dark:hover:!bg-amber-950/30 !border-amber-200 dark:!border-amber-800"
            >
              Request Clarification
            </Button>
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleAction('Reviewed')}
              disabled={loading}
            >
              Mark as Reviewed
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Employee & Meta Info Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-slate-50/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/40 border border-indigo-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-indigo-500/20">
              {report.employeeName ? report.employeeName.slice(0, 2).toUpperCase() : 'EM'}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{report.employeeName}</h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {report.department} • ID: {report.employeeId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {report.workDate}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 font-bold">
              <Clock className="w-4 h-4" />
              {report.totalHours} hrs Total
            </span>
          </div>
        </div>

        {/* Overall Daily Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Employee Overall Summary
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {report.overallSummary || 'No summary submitted.'}
          </p>
        </div>

        {/* Entries List Preview */}
        <div className="space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Logged Activities ({entries.length})
          </span>
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {entries.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{entry.category}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">{entry.project}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{entry.hours} hrs</span>
                    <Badge variant={entry.status === 'Completed' ? 'success' : entry.status === 'Blocked' ? 'danger' : 'primary'}>
                      {entry.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-normal">{entry.description}</p>
                {entry.challenges && (
                  <p className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                    ⚠️ Blocker: {entry.challenges}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Review Comments Box */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Manager Review Feedback & Comments
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Visible to the employee upon submission</span>
          </label>
          <Textarea
            rows={3}
            value={comments}
            maxLength={500}
            onChange={(e) => setComments(e.target.value.slice(0, 500))}
            placeholder="e.g. Excellent execution on the UI refactor. Please ensure documentation is updated..."
            className="w-full text-xs"
          />
        </div>
      </div>
    </Modal>
  );
}

