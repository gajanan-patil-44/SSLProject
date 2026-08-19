// src/pages/Help/HelpView.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader, Card, Button, Timeline, Badge, Input } from '../../components/ui/index';
import { BookOpen, Search, Milestone, ChevronRight, HelpCircle } from 'lucide-react';

export default function HelpView() {
  const { pathname } = useLocation();
  const [docSearch, setDocSearch] = useState('');

  const isChangelog = pathname.includes('/changelog');
  const isMultilevel = pathname.includes('/multilevel');

  // Filtered documentation articles
  const articles = [
    { title: "Onboarding employees guide", desc: "Step-by-step instructions for HR coordinators to complete onboard files.", category: "HRM" },
    { title: "POS cash register checkout troubleshooting", desc: "Resetting database connections on touch-screen cashier terminals.", category: "POS" },
    { title: "AWS migration roadmap", desc: "Milestones for serverless S3 deployment configuration protocols.", category: "Infrastructure" }
  ].filter(art => art.title.toLowerCase().includes(docSearch.toLowerCase()) || art.desc.toLowerCase().includes(docSearch.toLowerCase()));

  // 1. Changelog Timeline View
  if (isChangelog) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Changelog & History"
          description="Track active version releases, updates and security hotfixes."
          breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Help', href: '/help/docs' }, { label: 'Changelog' }]}
        />

        <Card className="max-w-3xl mx-auto p-6">
          <Timeline
            items={[
              { id: 1, content: "Released Version 2.0.4 - Introduced dynamic page engines & Zustand shell cache store.", dateText: "August 17, 2026", iconBg: "bg-teal-500/10 text-teal-650" },
              { id: 2, content: "Released Version 2.0.0 - Upgraded layout to React 19 + Tailwind v4 build system.", dateText: "August 01, 2026", iconBg: "bg-teal-500/10 text-teal-650" },
              { id: 3, content: "Released Version 1.5.0 - Integrated drag-and-drop sales pipeline and touch cashier POS.", dateText: "July 12, 2026", iconBg: "bg-slate-100 text-slate-500" }
            ]}
          />
        </Card>
      </div>
    );
  }

  // 2. Multi Level Navigation demonstration
  if (isMultilevel) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Multi Level Nav — ${pathname.split('/').pop()}`}
          description="Demonstration of nested route parameters."
          breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Help' }, { label: 'Multi Level' }]}
        />
        <Card className="p-5">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Nested URL Target Parameter:</h4>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 border rounded-lg mt-3 font-mono text-xs">
            {pathname}
          </div>
          <p className="text-xs text-slate-500 mt-2">The sidebar configuration maps multi-level children structures seamlessly.</p>
        </Card>
      </div>
    );
  }

  // 3. Standard Help / Documentation Article View
  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base & Documentation"
        description="Search setup guides, microservices configurations, and manual booklets."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Help', href: '/help/docs' }, { label: 'Docs' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar categories */}
        <Card className="p-4 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Categories</span>
          <div className="space-y-1 text-xs font-semibold text-slate-550 dark:text-slate-400">
            <button className="w-full text-left py-1.5 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-secondary bg-secondary/5 font-bold flex items-center justify-between">
              <span>All Guides</span> <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button className="w-full text-left py-1.5 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between">
              <span>HRM Modules</span> <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button className="w-full text-left py-1.5 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between">
              <span>POS Settings</span> <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* Articles List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search help topics..."
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((art, idx) => (
              <Card key={idx} className="p-4 flex flex-col justify-between h-40">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="primary" className="text-[9px]">{art.category}</Badge>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{art.title}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{art.desc}</p>
                </div>
                <button className="text-xs font-bold text-secondary text-left flex items-center gap-0.5 hover:underline cursor-pointer pt-3">
                  Read article <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
