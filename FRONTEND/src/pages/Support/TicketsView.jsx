// src/pages/Support/TicketsView.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/ui/DataTable';
import {
  PageHeader,
  Card,
  Button,
  Avatar,
  StatusBadge,
  Badge,
  Input,
  IconButton
} from '../../components/ui/index';
import { Eye, ArrowLeft, Send, User, MessageSquare, AlertCircle, Clock } from 'lucide-react';

export default function TicketsView() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Conversation thread for selected ticket
  const [thread, setThread] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [notesList, setNotesList] = useState([]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getTickets();
      setTickets(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openTicketDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setThread([
      { id: 1, sender: ticket.customer, role: 'Client', text: `Hi team, we are facing an issue with ticket topic: ${ticket.subject}. Please assist.`, time: '2 hours ago' },
      { id: 2, sender: 'Linda Watson', role: 'Support Agent', text: "Hello! We have received your query. Our engineering team is currently investigating. We will update you shortly.", time: '1 hour ago' }
    ]);
    setNotesList([
      { text: "Investigated POS database lock logs. Locker looks fine, checking regional CDN settings.", author: "Marcus (DevOps)", time: "30m ago" }
    ]);
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'Andrew Admin',
      role: 'Support Agent',
      text: replyMessage,
      time: 'Just now'
    };
    setThread(prev => [...prev, newMsg]);
    setReplyMessage('');
    
    // Simulate updating ticket status to in-progress
    if (selectedTicket.status === 'Open') {
      const updated = { ...selectedTicket, status: 'In Progress' };
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated : t));
      api.updateTicket(selectedTicket.id, { status: 'In Progress' });
    }
  };

  const handleAddNote = () => {
    if (!internalNote.trim()) return;
    setNotesList(prev => [
      ...prev,
      { text: internalNote, author: 'Andrew Admin (Admin)', time: 'Just now' }
    ]);
    setInternalNote('');
  };

  const updateTicketPriority = async (id, priority) => {
    const updated = { ...selectedTicket, priority };
    setSelectedTicket(updated);
    setTickets(prev => prev.map(t => t.id === id ? updated : t));
    await api.updateTicket(id, { priority });
  };

  const updateTicketStatus = async (id, status) => {
    const updated = { ...selectedTicket, status };
    setSelectedTicket(updated);
    setTickets(prev => prev.map(t => t.id === id ? updated : t));
    await api.updateTicket(id, { status });
  };

  const columns = [
    { id: 'id', header: 'Ticket ID', accessorKey: 'id', key: 'id' },
    { id: 'customer', header: 'Customer', accessorKey: 'customer', key: 'customer', cell: ({ row }) => <span className="font-bold">{row.original.customer}</span> },
    { id: 'subject', header: 'Subject', accessorKey: 'subject', key: 'subject' },
    { id: 'assignedAgent', header: 'Assigned Agent', accessorKey: 'assignedAgent', key: 'assignedAgent' },
    { id: 'SLA', header: 'SLA Limit', accessorKey: 'SLA', key: 'SLA', cell: ({ row }) => <span className="text-red-500 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> {row.original.SLA}</span> },
    { id: 'priority', header: 'Priority', accessorKey: 'priority', key: 'priority', cell: ({ row }) => <Badge variant={row.original.priority === 'Urgent' ? 'danger' : row.original.priority === 'High' ? 'warning' : 'neutral'}>{row.original.priority}</Badge> },
    { id: 'status', header: 'Status', accessorKey: 'status', key: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Ticket Details — ${selectedTicket.id}`}
          description={selectedTicket.subject}
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Tickets Portal', href: '/support/tickets' },
            { label: selectedTicket.id }
          ]}
          actions={
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setSelectedTicket(null)}>
              Back to Tickets
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main conversation area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="flex flex-col h-[400px] justify-between p-5">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {thread.map((msg) => {
                  const isAgent = msg.role === 'Support Agent';
                  return (
                    <div key={msg.id} className={`flex gap-3 text-xs items-start ${isAgent ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border shrink-0 ${isAgent ? 'bg-secondary/15 text-secondary' : 'bg-slate-100'}`}>
                        {msg.sender[0]}
                      </div>
                      <div className={`flex flex-col gap-1 max-w-[70%] ${isAgent ? 'items-end' : ''}`}>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span className="font-bold text-slate-805 dark:text-slate-200">{msg.sender}</span>
                          <span>({msg.role})</span>
                          <span>•</span>
                          <span>{msg.time}</span>
                        </div>
                        <div className={`p-3 rounded-lg leading-relaxed ${isAgent ? 'bg-secondary text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-800 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Reply Area */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex gap-2">
                <Input
                  type="text"
                  placeholder="Type reply message to client..."
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  className="flex-1 h-9"
                />
                <Button variant="secondary" size="sm" icon={Send} onClick={handleSendReply}>
                  Send
                </Button>
              </div>
            </Card>

            {/* Internal Notes Panel */}
            <Card className="p-5 space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Internal Collaboration Notes</span>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add secret notes visible to support staff only..."
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  className="flex-1 h-9"
                />
                <Button variant="outline" size="sm" onClick={handleAddNote}>
                  Post Note
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                {notesList.map((note, idx) => (
                  <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex justify-between gap-4">
                    <p className="text-slate-650 dark:text-slate-400 leading-relaxed"><span className="font-bold">{note.author}:</span> {note.text}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{note.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Ticket metadata sidebar */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-2">Ticket Info</span>
              
              <div className="space-y-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">CLIENT</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedTicket.customer}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">ASSIGNED OWNER</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedTicket.assignedAgent}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-slate-400">TICKET PRIORITY</span>
                  <div className="flex gap-2.5">
                    {['Urgent', 'High', 'Medium', 'Low'].map(p => (
                      <button
                        key={p}
                        onClick={() => updateTicketPriority(selectedTicket.id, p)}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${selectedTicket.priority === p ? 'bg-danger text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-550'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-slate-400">TICKET STATUS</span>
                  <div className="flex gap-2.5">
                    {['Open', 'In Progress', 'Closed'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateTicketStatus(selectedTicket.id, s)}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${selectedTicket.status === s ? 'bg-secondary text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-550'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-red-500">
                  <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> SLA Breach Deadline:</span>
                  <span className="font-bold">{selectedTicket.SLA}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets Portal"
        description="Monitor corporate client technical support tickets, SLA deadlines and assignees."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Support', href: '/support/messages' }, { label: 'Tickets' }]}
      />

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          onRefresh={loadTickets}
          onViewClick={openTicketDetail}
          searchPlaceholder="Search support tickets..."
        />
      </Card>
    </div>
  );
}
