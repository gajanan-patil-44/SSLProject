// src/pages/HRM/LeaveView.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  StatusBadge,
  StatCard
} from '../../components/ui/index';
import { Check, X, CalendarRange, Plus } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { DynamicForm } from '../../components/ui/DynamicForm';
import { useERPStore } from '../../store/useERPStore';

export default function LeaveView() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaves();
      setLeaves(res || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.approveLeave(id);
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
      useERPStore.getState().showToast("Leave request approved successfully!", "success");
    } catch (e) {
      useERPStore.getState().showToast(e?.message || "Failed to approve leave request.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectLeave(id);
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
      useERPStore.getState().showToast("Leave request rejected.", "warning");
    } catch (e) {
      useERPStore.getState().showToast(e?.message || "Failed to reject leave request.", "error");
    }
  };

  const handleCreateLeave = async (data) => {
    try {
      const req = {
        employeeId: "EMP-001",
        name: "Andrew Admin",
        days: 3,
        ...data
      };
      const res = await api.createLeaveRequest(req);
      setLeaves(prev => [res, ...prev]);
      setIsAddOpen(false);
      useERPStore.getState().showToast(res?.message || "Leave request submitted successfully!", "success");
    } catch (e) {
      useERPStore.getState().showToast(e?.message || "Failed to submit leave request.", "error");
    }
  };

  const columns = [
    { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
    { id: 'name', header: 'Employee', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { id: 'type', header: 'Leave Type', accessorKey: 'type', key: 'type' },
    { id: 'days', header: 'Days', accessorKey: 'days', key: 'days', cell: ({ row }) => <span className="font-semibold text-slate-800 dark:text-slate-100">{row.original.days} Days</span> },
    { id: 'startDate', header: 'Start Date', accessorKey: 'startDate', key: 'startDate' },
    { id: 'endDate', header: 'End Date', accessorKey: 'endDate', key: 'endDate' },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      header: 'Review Actions',
      cell: ({ row }) => {
        if (row.original.status === 'Pending') {
          return (
            <div className="flex items-center gap-1.5 justify-end">
              <Button
                variant="success"
                size="sm"
                icon={Check}
                onClick={() => handleApprove(row.original.id)}
                className="px-2 py-1 text-[11px] h-7"
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={X}
                onClick={() => handleReject(row.original.id)}
                className="px-2 py-1 text-[11px] h-7"
              >
                Reject
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-slate-400 font-semibold">Done</span>;
      }
    }
  ];

  const formFields = [
    { key: "type", label: "Leave Type", type: "select", required: true, options: [
      { value: "Sick Leave", label: "Sick Leave" },
      { value: "Casual Leave", label: "Casual Leave" },
      { value: "Annual Leave", label: "Annual Leave" },
      { value: "Maternity Leave", label: "Maternity Leave" }
    ]},
    { key: "startDate", label: "Start Date", type: "date", required: true },
    { key: "endDate", label: "End Date", type: "date", required: true },
    { key: "reason", label: "Reason", type: "textarea", required: true, gridSpan: "col-span-2", placeholder: "Explain reason for leave..." }
  ];

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Dashboard"
        description="Review time-off requests, balances, and annual calendars."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'HRM', href: '/hrm/employees' }, { label: 'Leave' }]}
        actions={
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
            Request Leave
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Requests" value={pendingCount} badgeText="Action Required" badgeVariant="warning" icon={CalendarRange} description="Awaiting Manager review" />
        <StatCard title="Approved Absences" value={approvedCount} badgeText="Active" badgeVariant="success" icon={Check} description="Total approved this year" />
        <StatCard title="Holiday Calendar" value="12 Days" badgeText="Next: Oct 12" badgeVariant="primary" icon={CalendarRange} description="Corporate public holidays" />
      </div>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={leaves}
          loading={loading}
          onRefresh={loadLeaves}
          searchPlaceholder="Search leave requests by employee name..."
        />
      </Card>

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Submit Leave Request"
          size="lg"
        >
          <DynamicForm
            fields={formFields}
            onSubmit={handleCreateLeave}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
