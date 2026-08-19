// src/pages/HRM/AttendanceView.jsx
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
import { CalendarDays, Clock, MapPin, Check, LogOut } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';

export default function AttendanceView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('--:--');
  const [checkOutTime, setCheckOutTime] = useState('--:--');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAttendance();
      setLogs(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleCheckIn = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(timeStr);
    setHasCheckedIn(true);
    
    // Add user check-in log to table
    const record = {
      employeeId: "EMP-001",
      name: "Andrew Admin",
      date: new Date().toISOString().split('T')[0],
      clockIn: timeStr,
      clockOut: "--:--",
      status: "Present"
    };
    
    try {
      await api.saveAttendanceRecord(record);
      setLogs(prev => [record, ...prev.filter(l => l.employeeId !== "EMP-001")]);
      alert(`Success! Checked-in at ${timeStr}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckOutTime(timeStr);
    
    const record = {
      employeeId: "EMP-001",
      name: "Andrew Admin",
      date: new Date().toISOString().split('T')[0],
      clockIn: checkInTime,
      clockOut: timeStr,
      status: "Present"
    };

    try {
      await api.saveAttendanceRecord(record);
      setLogs(prev => [record, ...prev.filter(l => l.employeeId !== "EMP-001")]);
      alert(`Success! Checked-out at ${timeStr}`);
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { id: 'employeeId', header: 'ID', accessorKey: 'employeeId', key: 'employeeId' },
    { id: 'name', header: 'Employee', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { id: 'date', header: 'Date', accessorKey: 'date', key: 'date' },
    { id: 'clockIn', header: 'Clock In', accessorKey: 'clockIn', key: 'clockIn', cell: ({ row }) => <span className="font-semibold text-teal-650">{row.original.clockIn}</span> },
    { id: 'clockOut', header: 'Clock Out', accessorKey: 'clockOut', key: 'clockOut', cell: ({ row }) => <span className="font-semibold text-slate-500">{row.original.clockOut}</span> },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Monitor staff check-in times, work modes (WFH, office), and logs."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'HRM', href: '/hrm/employees' }, { label: 'Attendance' }]}
      />

      {/* Top Section: Punch Panel & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Card */}
        <Card className="flex flex-col justify-between p-6 h-[200px]">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-4 h-4 text-secondary" /> Punch Terminal
            </h4>
            <div className="text-2xl font-bold mt-2">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <p className="text-xs text-slate-500 mt-1">IP: 192.168.1.144 (HQ Office)</p>
          </div>

          <div className="flex gap-3">
            {!hasCheckedIn ? (
              <Button variant="secondary" size="md" icon={Check} onClick={handleCheckIn} className="w-full">
                Check In
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-xs">
                  <span className="text-slate-400 font-medium">In:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{checkInTime}</p>
                </div>
                {checkOutTime === '--:--' ? (
                  <Button variant="danger" size="md" icon={LogOut} onClick={handleCheckOut} className="flex-1">
                    Check Out
                  </Button>
                ) : (
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-xs">
                    <span className="text-slate-400 font-medium">Out:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-300 mt-0.5">{checkOutTime}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard title="Present Today" value="8" badgeText="Live" badgeVariant="success" icon={Check} description="In-office headcount" />
          <StatCard title="Remote Working" value="2" badgeText="WFH" badgeVariant="secondary" icon={MapPin} description="Approved remote logs" />
        </div>
      </div>

      {/* Logs Table */}
      <Card className="p-4">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          onRefresh={loadLogs}
          searchPlaceholder="Search logs by employee ID or name..."
        />
      </Card>
    </div>
  );
}
