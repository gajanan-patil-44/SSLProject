// src/pages/CRM/PipelineView.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Avatar,
  IconButton
} from '../../components/ui/index';
import { Plus, DollarSign, RefreshCw, MoveRight } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { DynamicForm } from '../../components/ui/DynamicForm';

const PIPELINE_STAGES = [
  { id: 'Lead', label: 'New Lead', color: 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-800 dark:text-slate-300' },
  { id: 'Prospect', label: 'Qualified', color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 text-blue-800' },
  { id: 'Proposal', label: 'Proposal Sent', color: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 text-purple-800' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 text-orange-850' },
  { id: 'Won', label: 'Won Deal 🎉', color: 'bg-green-50 dark:bg-green-950/20 border-green-200 text-green-800' },
  { id: 'Lost', label: 'Lost Deal ❌', color: 'bg-red-50 dark:bg-red-950/20 border-red-200 text-red-800' }
];

export default function PipelineView() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await api.getContacts();
      
      // Initialize some stages to demonstrate pipeline
      const mapped = res.map((c, idx) => {
        const stages = ['Lead', 'Prospect', 'Proposal', 'Negotiation', 'Won'];
        return {
          ...c,
          stage: c.stage || stages[idx % stages.length],
          value: (idx + 1) * 15000 // mock deal value
        };
      });
      setContacts(mapped || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // crucial to allow dropping
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId) return;

    setContacts(prev => prev.map(c => c.id === cardId ? { ...c, stage: targetStage } : c));
    
    // Simulate updating backend cache
    try {
      await api.createContact({ id: cardId, stage: targetStage });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDeal = async (data) => {
    const newDeal = {
      name: data.name,
      company: data.company,
      email: data.email,
      stage: 'Lead',
      value: Number(data.value || 10000)
    };
    try {
      const res = await api.createContact(newDeal);
      setContacts(prev => [{ ...res, value: newDeal.value }, ...prev]);
      setIsAddOpen(false);
      alert("Deal registered in pipeline!");
    } catch (e) {
      console.error(e);
    }
  };

  // Move via click for touch/accessibility fallback
  const moveDeal = (dealId, currentStage) => {
    const stages = PIPELINE_STAGES.map(s => s.id);
    const currIdx = stages.indexOf(currentStage);
    const nextIdx = (currIdx + 1) % stages.length;
    const nextStage = stages[nextIdx];
    
    setContacts(prev => prev.map(c => c.id === dealId ? { ...c, stage: nextStage } : c));
  };

  const formFields = [
    { key: "name", label: "Contact Name", type: "text", required: true },
    { key: "company", label: "Company", type: "text", required: true },
    { key: "email", label: "Email Address", type: "email", required: true },
    { key: "value", label: "Deal Value ($)", type: "number", required: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Deal Pipeline"
        description="Drag and drop deal cards to transition leads between pipeline stages."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'CRM', href: '/crm/contacts' }, { label: 'Pipeline' }]}
        actions={
          <div className="flex gap-2">
            <IconButton icon={RefreshCw} size="sm" onClick={loadContacts} className={loading ? "animate-spin" : ""} />
            <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
              Add Deal
            </Button>
          </div>
        }
      />

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = contacts.filter(c => c.stage === stage.id);
          const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-3 min-w-[200px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{stage.label}</span>
                  <span className="text-[10px] text-slate-400 font-bold">${totalValue.toLocaleString()}</span>
                </div>
                <Badge variant="primary" className="text-[10px] px-1.5 py-0.2">{stageDeals.length}</Badge>
              </div>

              {/* Cards List */}
              <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                {stageDeals.length === 0 ? (
                  <div className="text-[10px] text-slate-405 text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    Drag deals here
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:shadow-xs p-3 rounded-lg cursor-grab active:cursor-grabbing text-xs space-y-2.5 transition-all select-none"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{deal.company}</span>
                        <IconButton
                          icon={MoveRight}
                          size="sm"
                          variant="ghost"
                          onClick={() => moveDeal(deal.id, deal.stage)}
                          title="Move to next stage"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{deal.name}</span>
                        <span className="font-bold text-slate-900 dark:text-teal-400">${(deal.value || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Onboard Deal in Pipeline"
          size="lg"
        >
          <DynamicForm
            fields={formFields}
            onSubmit={handleCreateDeal}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
