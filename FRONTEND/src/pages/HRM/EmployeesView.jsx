// src/pages/HRM/EmployeesView.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { DataTable } from '../../components/ui/DataTable';
import {
  PageHeader,
  Card,
  Button,
  Avatar,
  StatusBadge,
  Badge,
  Timeline,
  ProgressBar
} from '../../components/ui/index';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { DynamicForm } from '../../components/ui/DynamicForm';
import { Eye, Edit, Trash2, ArrowLeft, Plus, Check, X, ShieldAlert, Award } from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';

export default function EmployeesView() {
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Load employees
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (location.search.includes('add=true') || location.state?.openAdd) {
      setIsAddOpen(true);
    }
  }, [location]);

  const handleCreateEmployee = async (data) => {
    try {
      const newEmp = await api.createEmployee(data);
      setEmployees(prev => [newEmp, ...prev]);
      setIsAddOpen(false);
      useERPStore.getState().showToast("Employee registered successfully!", "success");
    } catch (e) {
      useERPStore.getState().showToast(e?.message || "Failed to register employee.", "error");
    }
  };

  const handleEditEmployee = async (data) => {
    try {
      const updated = await api.createEmployee({ ...editEmp, ...data });
      setEmployees(prev => prev.map(e => e.id === editEmp.id ? updated : e));
      setIsEditOpen(false);
      setEditEmp(null);
      useERPStore.getState().showToast("Employee updated successfully!", "success");
    } catch (e) {
      useERPStore.getState().showToast(e?.message || "Failed to update employee.", "error");
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (window.confirm(`Are you sure you want to delete ${emp.name}?`)) {
      try {
        await api.deleteEmployee(emp.id);
        setEmployees(prev => prev.filter(e => e.id !== emp.id));
        useERPStore.getState().showToast("Employee deleted successfully!", "success");
      } catch (e) {
        useERPStore.getState().showToast(e?.message || "Failed to delete employee.", "error");
      }
    }
  };

  const columns = [
    {
      id: 'id',
      header: 'Employee ID',
      accessorKey: 'id',
      key: 'id'
    },
    {
      id: 'name',
      header: 'Employee',
      accessorKey: 'name',
      key: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.original.avatar} name={row.original.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span>
            <span className="text-[10px] text-slate-400">{row.original.email}</span>
          </div>
        </div>
      )
    },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      key: 'department'
    },
    {
      id: 'designation',
      header: 'Designation',
      accessorKey: 'designation',
      key: 'designation'
    },
    {
      id: 'joiningDate',
      header: 'Joining Date',
      accessorKey: 'joiningDate',
      key: 'joiningDate'
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      key: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    }
  ];

  const formFields = [
    { key: "name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Evelyn Hayes" },
    { key: "email", label: "Corporate Email", type: "email", required: true, placeholder: "e.g. evelyn@vishvin-erp.com" },
    { key: "phone", label: "Phone Number", type: "text", required: true, placeholder: "+1 (555) 000-0000" },
    { key: "department", label: "Department", type: "select", required: true, options: [
      { value: "Engineering", label: "Engineering" },
      { value: "Marketing", label: "Marketing" },
      { value: "Finance", label: "Finance" },
      { value: "Sales", label: "Sales" },
      { value: "HR", label: "HR" }
    ]},
    { key: "designation", label: "Designation", type: "select", required: true, options: [
      { value: "Senior Developer", label: "Senior Developer" },
      { value: "Product Manager", label: "Product Manager" },
      { value: "UX Designer", label: "UX Designer" },
      { value: "Android Developer", label: "Android Developer" },
      { value: "Financial Analyst", label: "Financial Analyst" },
      { value: "HR Generalist", label: "HR Generalist" }
    ]},
    { key: "salary", label: "Monthly Gross Salary ($)", type: "number", required: true, placeholder: "e.g. 5000" }
  ];

  if (selectedEmp) {
    return (
      <div className="space-y-6">
        {/* Back and Page Header */}
        <PageHeader
          title={selectedEmp.name}
          description={`${selectedEmp.designation} — ${selectedEmp.department}`}
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Employees', href: '/hrm/employees' },
            { label: selectedEmp.name }
          ]}
          actions={
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setSelectedEmp(null)}>
              Back to Directory
            </Button>
          }
        />

        {/* Tab Selection */}
        <Tabs
          tabs={[
            { id: 'profile', label: 'Overview Profile' },
            { id: 'personal', label: 'Personal Information' },
            { id: 'attendance', label: 'Attendance logs' },
            { id: 'leave', label: 'Leave balance' },
            { id: 'payroll', label: 'Payroll history' },
            { id: 'activity', label: 'Activity Feed' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-4"
        />

        {/* Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card className="flex flex-col md:flex-row items-center gap-6 p-6">
                  <Avatar src={selectedEmp.avatar} name={selectedEmp.name} size="xl" className="w-24 h-24" />
                  <div className="flex-1 text-center md:text-left space-y-1.5">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedEmp.name}</h3>
                    <p className="text-sm font-semibold text-slate-500">{selectedEmp.designation} • {selectedEmp.department}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                      <StatusBadge status={selectedEmp.status} />
                      <Badge variant="secondary">Joined {selectedEmp.joiningDate}</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Employment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                    <div>
                      <span className="text-slate-400 block mb-0.5">CONTRACT SALARY</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">${(selectedEmp.salary || 0).toLocaleString()} / year</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">LINE MANAGER</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Andrew Admin</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">EMAIL</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedEmp.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">PHONE</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedEmp.phone || 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'personal' && (
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Personal Records</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block mb-0.5">EMERGENCY CONTACT</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Sarah Hayes (Spouse)</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">RELATION PHONE</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">+1 (555) 018-9921</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">HOME ADDRESS</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">128 Operations Dr, Suite 50, California, USA</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">TAX ID / SSN</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">XXX-XX-9281</p>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'attendance' && (
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Punch Logs (August 2026)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-bold">August 17, 2026</p>
                      <span className="text-slate-400 text-[10px]">Punch-in: 08:52 AM • Punch-out: 05:30 PM</span>
                    </div>
                    <Badge variant="success">Present</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-bold">August 16, 2026</p>
                      <span className="text-slate-400 text-[10px]">Punch-in: 09:00 AM • Punch-out: 05:00 PM</span>
                    </div>
                    <Badge variant="success">Present</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-bold">August 15, 2026</p>
                      <span className="text-slate-400 text-[10px]">Punch-in: 09:12 AM • Punch-out: 05:45 PM</span>
                    </div>
                    <Badge variant="warning">Late</Badge>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'leave' && (
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Leave Balance & Requests</h4>
                <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
                  <div className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg">
                    <span className="text-lg font-black block">15</span>
                    <span className="text-[10px] text-slate-500">Annual Balance</span>
                  </div>
                  <div className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg">
                    <span className="text-lg font-black block">02</span>
                    <span className="text-[10px] text-slate-500">Sick Leave Remaining</span>
                  </div>
                  <div className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg">
                    <span className="text-lg font-black block">00</span>
                    <span className="text-[10px] text-slate-500">Unpaid Taken</span>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'payroll' && (
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Payslip Disbursals</h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="py-2">Month</th>
                        <th className="py-2">Base Salary</th>
                        <th className="py-2">Bonus</th>
                        <th className="py-2">Net Salary</th>
                        <th className="py-2 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-3 font-bold">July 2026</td>
                        <td className="py-3">${(selectedEmp.salary / 12).toFixed(2)}</td>
                        <td className="py-3">$250.00</td>
                        <td className="py-3 font-bold">${((selectedEmp.salary / 12) + 250).toFixed(2)}</td>
                        <td className="py-3 text-right"><span className="text-secondary font-bold hover:underline cursor-pointer">PDF</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-bold">June 2026</td>
                        <td className="py-3">${(selectedEmp.salary / 12).toFixed(2)}</td>
                        <td className="py-3">$0.00</td>
                        <td className="py-3 font-bold">${(selectedEmp.salary / 12).toFixed(2)}</td>
                        <td className="py-3 text-right"><span className="text-secondary font-bold hover:underline cursor-pointer">PDF</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'activity' && (
              <Card className="p-6">
                <Timeline
                  items={[
                    { id: 1, content: "Employee credentials activated by", target: "Andrew Admin", dateText: "August 17, 2026" },
                    { id: 2, content: "Completed orientation and training by HR", target: "Linda Watson", dateText: "August 10, 2026" }
                  ]}
                />
              </Card>
            )}
          </div>

          {/* Quick Metrics Side Card */}
          <div className="space-y-6">
            <Card className="text-center py-6 flex flex-col items-center gap-4">
              <div className="p-3 bg-secondary/10 text-secondary rounded-full">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-bold text-slate-805 dark:text-slate-50">Operational Rating</h5>
                <p className="text-xs text-slate-400 mt-1">Calculated via appraisal goals</p>
              </div>
              <div className="w-full flex items-center justify-between text-xs px-2">
                <span>Core KPIs:</span>
                <span className="font-bold text-slate-900 dark:text-white">96%</span>
              </div>
              <ProgressBar value={96} color="bg-secondary" size="sm" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees Directory"
        description="Search, filter and organize team profiles, pay metrics, and roles."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Employees' }]}
        actions={
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add Employee
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        onRefresh={loadEmployees}
        onViewClick={(row) => setSelectedEmp(row)}
        onEditClick={(row) => {
          setEditEmp(row);
          setIsEditOpen(true);
        }}
        onDeleteClick={handleDeleteEmployee}
        searchPlaceholder="Search employees..."
      />

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Onboard New Employee"
          size="lg"
        >
          <DynamicForm
            fields={formFields}
            onSubmit={handleCreateEmployee}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      )}

      {isEditOpen && editEmp && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditEmp(null);
          }}
          title={`Edit Employee: ${editEmp.name}`}
          size="lg"
        >
          <DynamicForm
            fields={formFields}
            defaultValues={editEmp}
            onSubmit={handleEditEmployee}
            onCancel={() => {
              setIsEditOpen(false);
              setEditEmp(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
