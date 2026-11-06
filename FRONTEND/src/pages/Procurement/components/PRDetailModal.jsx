// src/pages/Procurement/components/PRDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  User,
  Building2,
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Share2,
  Paperclip,
  Download,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { procurementPRService, fetchApproversList, DEFAULT_APPROVERS } from '../procurementData';
import { useERPStore } from '../../../store/useERPStore';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Pending Approval':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Pending Approval
        </span>
      );
    case 'Forwarded':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
          <Share2 className="w-3 h-3 text-blue-600" />
          Forwarded
        </span>
      );
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case 'PO Generated':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          PO Generated
        </span>
      );
    case 'Draft':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          <Clock className="w-3 h-3 text-slate-500" />
          Draft
        </span>
      );
  }
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || '').toLowerCase();
  if (p === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
        High
      </span>
    );
  }
  if (p === 'medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
      Low
    </span>
  );
};

export default function PRDetailModal({ pr, isOpen, onClose, isApprovalMode = false, onActionCompleted }) {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  const [approvers, setApprovers] = useState(DEFAULT_APPROVERS);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'forward' | null
  const [rejectReason, setRejectReason] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [forwardComment, setForwardComment] = useState('Forwarding for your approval.');
  const [approveComment, setApproveComment] = useState('Requisition reviewed and approved.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchApproversList().then((list) => {
        if (list && list.length > 0) setApprovers(list);
      });
      setActionType(null);
      setRejectReason('');
      setForwardComment('Forwarding for your approval.');
      setApproveComment('Requisition reviewed and approved.');
    }
  }, [isOpen]);

  if (!isOpen || !pr) return null;

  const loggedInActor = currentUser?.name || currentUser?.loginName || 'Praveen MD';
  const loggedInRole = currentUser?.role || currentUser?.designation?.name || 'Authorized Approver';

  // Handling Reject
  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      showToast('Please provide a rejection reason.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      procurementPRService.rejectPR(pr.id, loggedInActor, loggedInRole, rejectReason.trim());
      showToast(`PR ${pr.requirementNo} has been rejected.`, 'error');
      if (onActionCompleted) onActionCompleted('rejected', pr.id);
      onClose();
    } catch (e) {
      showToast(e.message || 'Failed to reject PR', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handling Forward
  const handleConfirmForward = () => {
    if (!forwardTo) {
      showToast('Please select an approver to forward to.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      procurementPRService.forwardPR(pr.id, loggedInActor, loggedInRole, forwardTo, forwardComment.trim());
      showToast(`PR ${pr.requirementNo} forwarded to ${forwardTo} successfully.`, 'info');
      if (onActionCompleted) onActionCompleted('forwarded', pr.id);
      onClose();
    } catch (e) {
      showToast(e.message || 'Failed to forward PR', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handling Approve
  const handleConfirmApprove = () => {
    setIsSubmitting(true);
    try {
      procurementPRService.approvePR(pr.id, loggedInActor, loggedInRole, approveComment.trim());
      showToast(`PR ${pr.requirementNo} has been approved successfully!`, 'success');
      if (onActionCompleted) onActionCompleted('approved', pr.id);
      onClose();
    } catch (e) {
      showToast(e.message || 'Failed to approve PR', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Purchase Requisition — {pr.requirementNo}
                </h3>
                <StatusBadge status={pr.status} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submitted on {pr.requestDate} for Project <strong className="text-slate-700 dark:text-slate-300">{pr.project}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* A. Requisition Details */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Requisition Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Requirement No</label>
                <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white text-xs">{pr.requirementNo}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Request Date</label>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{pr.requestDate}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Required Date</label>
                <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">{pr.requiredDate}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Requested By</label>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{pr.requestedBy}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Designation</label>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{pr.designation || '-'}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Department</label>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{pr.department || '-'}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Reporting To</label>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{pr.reportingTo || '-'}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Project</label>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">{pr.project}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Priority</label>
                <div className="mt-1">
                  <PriorityBadge priority={pr.priority} />
                </div>
              </div>
            </div>

            {/* Purpose / Justification */}
            <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Purpose / Justification
              </label>
              <p className="mt-1.5 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                {pr.purpose || 'No purpose or justification specified.'}
              </p>
            </div>
          </div>

          {/* B. Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Items ({pr.items?.length || 0})
              </span>
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 w-16 text-center">Sl No</th>
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4 w-28 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pr.items && pr.items.length > 0 ? (
                    pr.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-4 text-center font-medium text-slate-500">{it.slNo || idx + 1}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {it.itemName}
                          {it.uom && <span className="text-xs text-slate-400 ml-1.5 font-normal">({it.uom})</span>}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {it.qty}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-slate-400">
                        No items found in this requisition.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* C. Quotations */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Quotations ({pr.quotationsCount || pr.quotations?.length || 0})
              </h4>
            </div>
            {pr.quotations && pr.quotations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pr.quotations.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{q.vendor}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Ref: {q.quoteId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400 text-xs">{q.amount}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {pr.quotationsCount > 0
                  ? `${pr.quotationsCount} quotation(s) linked to this requirement.`
                  : '0 Quotations Linked.'}
              </p>
            )}
          </div>

          {/* D. Attachments */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              Attachments ({pr.attachments?.length || 0})
            </h4>
            {pr.attachments && pr.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pr.attachments.map((att, attIdx) => (
                  <div
                    key={attIdx}
                    className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200" title={att.name}>
                        {att.name}
                      </span>
                      {att.size && <span className="text-[10px] text-slate-400 flex-shrink-0">({att.size})</span>}
                    </div>
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer p-1" title="Download">
                      <Download className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">No attachments.</p>
            )}
          </div>

          {/* E. Approval History */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Approval History
            </h4>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {pr.approvalHistory && pr.approvalHistory.length > 0 ? (
                pr.approvalHistory.map((item, hIdx) => {
                  let badgeBg = 'bg-blue-600';
                  let icon = <CheckCircle2 className="w-3 h-3 text-white" />;
                  if (item.action === 'Rejected') {
                    badgeBg = 'bg-rose-600';
                    icon = <XCircle className="w-3 h-3 text-white" />;
                  } else if (item.action === 'Forwarded') {
                    badgeBg = 'bg-indigo-600';
                    icon = <Share2 className="w-3 h-3 text-white" />;
                  } else if (item.action === 'Approved') {
                    badgeBg = 'bg-emerald-600';
                    icon = <ShieldCheck className="w-3 h-3 text-white" />;
                  }

                  return (
                    <div key={hIdx} className="relative">
                      <div
                        className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ${badgeBg} flex items-center justify-center ring-4 ring-white dark:ring-slate-900`}
                      >
                        {icon}
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.actor} {item.designation ? `(${item.designation})` : ''}
                          </span>
                          <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.action === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.action === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : item.action === 'Forwarded'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {item.action}
                          </span>
                        </div>
                        {item.comments && (
                          <p className="text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">{item.comments}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No approval history recorded.</p>
              )}
            </div>
          </div>

          {/* Conditional Action Panels for Approver: Reject / Forward / Approve Dialogs */}
          {actionType === 'reject' && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                Provide Rejection Reason <span className="text-red-500">*</span>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Enter detailed reason for rejecting this purchase requisition..."
                className="w-full text-xs sm:text-sm p-3 rounded-lg border border-rose-300 dark:border-rose-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {actionType === 'forward' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-300 dark:border-blue-800 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                <Share2 className="w-4 h-4" />
                Forward Purchase Requisition
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Forward To <span className="text-red-500">*</span>
                </label>
                <select
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  className="w-full text-xs sm:text-sm h-10 px-3 rounded-lg border border-blue-300 dark:border-blue-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Approver --</option>
                  {approvers.map((appr) => (
                    <option key={appr.id} value={appr.name}>
                      {appr.name} - {appr.designation} ({appr.department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Comments</label>
                <textarea
                  value={forwardComment}
                  onChange={(e) => setForwardComment(e.target.value)}
                  rows={2}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-blue-300 dark:border-blue-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmForward}
                  disabled={isSubmitting || !forwardTo}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  Confirm Forward
                </button>
              </div>
            </div>
          )}

          {actionType === 'approve' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Confirm Requisition Approval
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Approval Comments</label>
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  rows={2}
                  placeholder="Optional approval notes..."
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-emerald-300 dark:border-emerald-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  Confirm Approve
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current Status: <span className="font-semibold text-slate-800 dark:text-slate-200">{pr.status}</span>
          </div>

          <div className="flex items-center gap-2">
            {isApprovalMode && !actionType && (pr.status === 'Pending Approval' || pr.status === 'Forwarded') && (
              <>
                <button
                  type="button"
                  onClick={() => setActionType('reject')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('forward')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Forward
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('approve')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

