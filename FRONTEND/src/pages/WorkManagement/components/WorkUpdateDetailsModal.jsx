// src/pages/WorkManagement/components/WorkUpdateDetailsModal.jsx
import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge, Button } from '../../../components/ui/index';
import {
  Calendar,
  Clock,
  User,
  Building2,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  MessageSquare,
  FileText
} from 'lucide-react';

export default function WorkUpdateDetailsModal({ isOpen, onClose, report, onReviewClick }) {
  if (!report) return null;

  const entries = Array.isArray(report.entries) ? report.entries : [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      case 'Pending Review':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'Clarification Requested':
        return <Badge variant="info">Clarification Requested</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="primary">In Progress</Badge>;
      case 'Blocked':
        return <Badge variant="danger">Blocked</Badge>;
      default:
        return <Badge variant="neutral">{status || 'Draft'}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Work Update Details — ${report.reportId || report.id}`}
      size="xl"
      actions={
        <div className="flex items-center gap-2">
          {onReviewClick && report.reviewStatus !== 'Reviewed' && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => {
                onClose();
                onReviewClick(report);
              }}
            >
              Review Report
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-slate-50/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/40 border border-indigo-100/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employee</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">{report.employeeName}</span>
              <span className="text-[10px] text-slate-400 block">{report.employeeId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{report.department}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work Date</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{report.workDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Hours</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{report.totalHours} hrs</span>
            </div>
          </div>
        </div>

        {/* Overall Daily Summary */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Overall Daily Summary</span>
            <span className="ml-auto">{getStatusBadge(report.reviewStatus)}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {report.overallSummary || 'No overall summary provided.'}
          </p>
        </div>

        {/* Timeline of Work Entries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <span>Logged Activities Timeline</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                {entries.length} Entries
              </span>
            </h4>
          </div>

          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                No activity entries recorded for this report.
              </div>
            ) : (
              entries.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="relative p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-indigo-300 transition-all space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-[10px] font-extrabold shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        {entry.category}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                        {entry.project}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {entry.hours} hrs
                      </span>
                      {getStatusBadge(entry.status)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {entry.description}
                  </p>

                  {entry.challenges && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Challenges / Blockers: </span>
                        <span>{entry.challenges}</span>
                      </div>
                    </div>
                  )}

                  {entry.remarks && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">
                      Remarks: {entry.remarks}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manager Review Comments Section */}
        {report.reviewComments && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/70 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Reviewer Comments & Feedback
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                By {report.reviewedBy || 'Manager'} • {report.reviewedOn || ''}
              </span>
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
              "{report.reviewComments}"
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

