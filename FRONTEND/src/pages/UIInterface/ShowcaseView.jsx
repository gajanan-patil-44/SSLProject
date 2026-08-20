// src/pages/UIInterface/ShowcaseView.jsx
import React, { useState } from 'react';
import {
  PageHeader,
  Card,
  Button,
  IconButton,
  Badge,
  StatusBadge,
  Alert,
  ProgressBar,
  Timeline,
  Avatar,
  AvatarGroup,
  Tooltip
} from '../../components/ui/index';
import { Tabs } from '../../components/ui/Tabs';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { DynamicForm } from '../../components/ui/DynamicForm';
import { DataTable } from '../../components/ui/DataTable';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip
} from 'recharts';
import * as Icons from 'lucide-react';
import { HelpCircle, Trash2, Edit, Eye, Plus, Check } from 'lucide-react';

export default function ShowcaseView() {
  const [activeTab, setActiveTab] = useState('base');
  
  // Dialog simulation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const chartData = [
    { name: 'Jan', Sales: 400, Expense: 240 },
    { name: 'Feb', Sales: 300, Expense: 139 },
    { name: 'Mar', Sales: 600, Expense: 380 },
    { name: 'Apr', Sales: 278, Expense: 390 },
    { name: 'May', Sales: 189, Expense: 480 },
    { name: 'Jun', Sales: 389, Expense: 220 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="UI Design System Showcase"
        description="Verify typography, button triggers, alerts, tabs, dynamic forms, data tables, and Recharts."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'UI Interface' }]}
      />

      <Tabs
        tabs={[
          { id: 'base', label: 'Base UI Primitives' },
          { id: 'advanced', label: 'Advanced UI Dialogs' },
          { id: 'forms', label: 'Forms Engine' },
          { id: 'tables', label: 'Table Showcase' },
          { id: 'charts', label: 'Charts Engine' },
          { id: 'icons', label: 'Lucide Line Icons' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* 1. Base UI Primitives */}
      {activeTab === 'base' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Buttons */}
          <Card className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Button Variations</h4>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="primary" size="sm" icon={Plus}>Small</Button>
              <Button variant="secondary" size="md" icon={Check}>Medium</Button>
              <Button variant="outline" size="lg" icon={HelpCircle}>Large</Button>
            </div>
          </Card>

          {/* Badges */}
          <Card className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Badges & Statuses</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="Active" />
              <StatusBadge status="Late" />
              <StatusBadge status="Absent" />
              <StatusBadge status="Pending" />
              <StatusBadge status="Delivered" />
              <StatusBadge status="Cancelled" />
            </div>
          </Card>

          {/* Alerts */}
          <Card className="space-y-4 md:col-span-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Alert Feedback Banners</h4>
            <div className="space-y-3">
              <Alert variant="info" title="Information Update">Vishvin ERP templates initialized successfully.</Alert>
              <Alert variant="success" title="Success Notification">Payment of $1,248.00 was recorded to ledger.</Alert>
              <Alert variant="warning" title="Warning threshold exceeded">Stock limits for product iPhone 15 is under 10.</Alert>
              <Alert variant="danger" title="SLA Breach Alert">Ticket #TC-8291 has breached response SLA deadline.</Alert>
            </div>
          </Card>

          {/* Avatars */}
          <Card className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Avatars and Group stacking</h4>
            <div className="flex items-center gap-4">
              <Avatar name="Alex Thompson" size="sm" />
              <Avatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" name="Emily Carter" size="md" />
              <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" name="Daniel Roberts" size="lg" />
            </div>
            <AvatarGroup>
              <Avatar name="Alex Thompson" />
              <Avatar name="Emily Carter" />
              <Avatar name="Daniel Roberts" />
              <Avatar name="Sarah Jenkins" />
              <Avatar name="Michael Chang" />
            </AvatarGroup>
          </Card>

          {/* Tooltips & Progress */}
          <Card className="space-y-5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tooltips & Progress Bars</h4>
            <div className="flex gap-4">
              <Tooltip content="Helper information tooltip" position="top">
                <Button variant="outline" size="sm">Hover Me (Top)</Button>
              </Tooltip>
              <Tooltip content="Sidebar collapsed menu title" position="right">
                <Button variant="outline" size="sm">Hover Me (Right)</Button>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 block">Upload progress (72%)</span>
              <ProgressBar value={72} color="bg-secondary" />
              <ProgressBar value={45} color="bg-red-500" size="sm" />
            </div>
          </Card>
        </div>
      )}

      {/* 2. Advanced UI */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <Card className="space-y-4 lg:col-span-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Modal Dialog Triggers</h4>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>Open Showcase Modal</Button>
              <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>Trigger Confirm Dialog</Button>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Operations Timeline</h4>
            <Timeline
              items={[
                { id: 1, content: "Created new lead entry Acme Corp in", target: "Sales Pipeline", dateText: "10 mins ago" },
                { id: 2, content: "Payroll transaction payout disbursed to", target: "1,196 employees", dateText: "1 hour ago" },
                { id: 3, content: "SLA ticket escalated for client", target: "Stark Industries", dateText: "3 hours ago" }
              ]}
            />
          </Card>
        </div>
      )}

      {/* 3. Forms Engine */}
      {activeTab === 'forms' && (
        <Card className="max-w-3xl mx-auto p-6 animate-fade-in">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Form Controls Preview</h4>
          <DynamicForm
            fields={[
              { key: "username", label: "Username / Handle", type: "text", required: true, placeholder: "e.g. andrew_vishvin" },
              { key: "email", label: "Email Address", type: "email", required: true, placeholder: "e.g. andrew@vishvin.com" },
              { key: "status", label: "Role Status", type: "select", options: [
                { value: "Admin", label: "Admin" },
                { value: "Moderator", label: "Moderator" }
              ]},
              { key: "terms", label: "I accept license agreements", type: "checkbox", required: true }
            ]}
            onSubmit={(data) => alert(JSON.stringify(data))}
          />
        </Card>
      )}

      {/* 4. Table Showcase */}
      {activeTab === 'tables' && (
        <Card className="p-4 animate-fade-in">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">DataTable Showcase</h4>
          <DataTable
            columns={[
              { id: 'id', header: 'ID', accessorKey: 'id', key: 'id' },
              { id: 'name', header: 'Name', accessorKey: 'name', key: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
              { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
            ]}
            data={[
              { id: "A-01", name: "Falcon LLP integration", status: "Active" },
              { id: "A-02", name: "Vishvin Corp POS setup", status: "Pending" },
              { id: "A-03", name: "AWS S3 file bucket link", status: "Cancelled" }
            ]}
            onViewClick={(row) => alert(JSON.stringify(row))}
            searchPlaceholder="Search mock rows..."
          />
        </Card>
      )}

      {/* 5. Charts Engine */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Area Chart */}
          <Card className="h-[300px] flex flex-col">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">Area Chart</span>
            <div className="flex-grow min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -25 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="Sales" stroke="#0d9488" fill="#0d9488" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar Chart */}
          <Card className="h-[300px] flex flex-col">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">Bar Chart</span>
            <div className="flex-grow min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -25 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <ChartTooltip />
                  <Bar dataKey="Sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* 6. Icons list */}
      {activeTab === 'icons' && (
        <Card className="p-6 animate-fade-in">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Lucide Line Icons List</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {[
              { name: "LayoutDashboard", icon: Icons.LayoutDashboard },
              { name: "Users", icon: Icons.Users },
              { name: "Coins", icon: Icons.Coins },
              { name: "ShoppingBag", icon: Icons.ShoppingBag },
              { name: "Settings", icon: Icons.Settings },
              { name: "Lock", icon: Icons.Lock },
              { name: "AlertCircle", icon: Icons.AlertCircle },
              { name: "HelpCircle", icon: Icons.HelpCircle },
              { name: "CalendarDays", icon: Icons.CalendarDays },
              { name: "Clock", icon: Icons.Clock },
              { name: "SlidersHorizontal", icon: Icons.SlidersHorizontal },
              { name: "Sliders", icon: Icons.Sliders }
            ].map((ico, idx) => (
              <div key={idx} className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 bg-slate-50/50 dark:bg-slate-900/40 text-slate-650 dark:text-slate-400">
                <ico.icon className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                <span className="text-[10px] text-center truncate w-full">{ico.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Interactive Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Showcase Interactive Modal"
        size="md"
        actions={
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        }
      >
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          This modal is keyboard accessible (closing via ESC) and wraps custom sizing parameters, clean visual dividers, and theme overlays.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          alert("Confirmed delete action simulated!");
        }}
        title="Confirm deletion?"
        message="Are you sure you want to delete this resource record? All references will be discarded."
      />
    </div>
  );
}
