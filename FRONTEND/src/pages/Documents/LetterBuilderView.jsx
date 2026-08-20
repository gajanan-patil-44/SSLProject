import React, { useState, useRef, useEffect } from 'react';
import { PageHeader, Card, Button } from '../../components/ui/index';
import { Printer, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, MousePointerClick, Settings2, FileText, Image as ImageIcon, GripHorizontal, Award, Briefcase, Minus, Type } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 bg-red-50 text-red-500"><h1 className="text-2xl font-bold mb-4">React Crash Error</h1><pre className="whitespace-pre-wrap font-mono text-sm">{this.state.error?.toString()}</pre><pre className="whitespace-pre-wrap font-mono text-xs mt-4">{this.state.error?.stack}</pre></div>;
    }
    return this.props.children;
  }
}

// ----------------------------------------------------------------------
// DRAGGABLE WRAPPER
// ----------------------------------------------------------------------
const DraggableWrapper = ({ id, activeId, position, onPositionChange, onDelete, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !e.target.closest('.drag-handle')) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startPos.current = { ...position };
    startMouse.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      onPositionChange(id, {
        x: startPos.current.x + dx,
        y: startPos.current.y + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, id, onPositionChange]);

  const isActive = activeId === id;

  return (
    <div 
      ref={dragRef}
      className={`absolute group transition-shadow rounded-md p-2 -m-2 ${isActive ? 'ring-2 ring-primary/40 bg-primary/5 z-20' : 'hover:ring-1 hover:ring-primary/20 hover:bg-primary/5 z-10'} print:ring-0 print:bg-transparent print:p-0 print:m-0`}
      style={{ left: position.x, top: position.y }}
    >
      <div 
        className={`drag-handle absolute -top-3 -left-3 w-6 h-6 bg-white border border-slate-300 rounded shadow-sm flex items-center justify-center cursor-move text-slate-400 hover:text-primary hover:border-primary opacity-0 transition-opacity print:hidden z-30 ${isActive || isDragging ? 'opacity-100' : 'group-hover:opacity-100'}`}
        onMouseDown={handleMouseDown}
        title="Drag to move"
      >
        <GripHorizontal className="w-3 h-3" />
      </div>
      
      {isActive && (
        <>
          <div className="absolute -top-5 left-4 text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-t print:hidden">{id.split('-')[0]}</div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="absolute -top-3 -right-3 w-6 h-6 bg-red-50 text-red-500 border border-red-200 rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors z-30 print:hidden" title="Delete Component">
             &times;
          </button>
        </>
      )}
      
      <div className={isDragging ? 'pointer-events-none' : ''}>
         {children}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// EDITABLE COMPONENTS
// ----------------------------------------------------------------------
const InlineEditable = ({ id, onFocus, value, onChange, className, tagName = 'div', placeholder = 'Click to edit...' }) => {
  const Tag = tagName;
  const elRef = useRef(null);
  
  const handleBlur = () => {
    if(elRef.current) onChange(elRef.current.innerHTML);
  };

  return (
    <Tag 
      ref={elRef}
      contentEditable 
      suppressContentEditableWarning 
      onFocus={() => onFocus(id)}
      onBlur={handleBlur} 
      className={`${className} outline-none cursor-text min-h-[1em] min-w-[2em] empty:before:content-[attr(placeholder)] empty:before:text-slate-300 empty:before:pointer-events-none custom-editor resizable-content`}
      placeholder={placeholder}
      dangerouslySetInnerHTML={{__html: value}}
      style={{ whiteSpace: 'pre-wrap', overflow: 'hidden' }}
    />
  );
};

const ImageUploader = ({ id, label = "Add Image", image, imageSize, onUpload, onFocus }) => {
  const fileInputRef = useRef(null);
  const isHeaderFooter = id === 'header' || id === 'footer';
  
  return (
    <div className="cursor-pointer resizable-content relative group" style={{ overflow: 'hidden', minWidth: '50px', minHeight: '50px', width: isHeaderFooter ? '800px' : `${Math.max(120, imageSize * 1.5)}px`, height: `${imageSize}px` }} onClick={(e) => { e.stopPropagation(); onFocus(id); }}>
       {image ? (
          <img src={image} alt={label} className={`object-contain ${isHeaderFooter ? 'w-full h-full object-cover' : 'w-full h-full'}`} />
       ) : (
          <div className="border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col gap-2 items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded print:hidden w-full h-full text-center p-2">
             <ImageIcon className="w-6 h-6 opacity-50" />
             {label}
          </div>
       )}
       <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="absolute inset-0 bg-slate-900/60 text-white flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex print:hidden backdrop-blur-sm">
          <ImageIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{image ? 'Change' : 'Upload'}</span>
       </button>
       <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, id)} />
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN VIEW
// ----------------------------------------------------------------------
export default function LetterBuilderView() {
  const [activeId, setActiveId] = useState(null);

  const [formData, setFormData] = useState({
    logo: '',
    logoSize: 80,
    header: '',
    headerSize: 100,
    footer: '',
    footerSize: 100,
    fontFamily: 'font-sans',
    fontSize: 14,
    companyName: 'Company Name',
    contactInfo: '123-456-7890<br/>hello@company.com<br/>www.company.com',
    date: new Date().toISOString().split('T')[0],
    recipient: 'Mark Henry<br/>Managing Director<br/>4560 Deer Ridge Drive<br/>Morristown, NJ 07960',
    subject: 'Offer Letter',
    content: 'Dear Sir,<br/><br/>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.<br/><br/>It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.<br/><br/>We are excited about the possibility of you joining our team.',
    signature: 'Sincerely,<br/><br/><strong>Oliver Weber</strong><br/>General Manager'
  });

  const [visibleComponents, setVisibleComponents] = useState([
    'logo', 'companyName', 'contactInfo', 'date', 'recipient', 'subject', 'content', 'signature'
  ]);

  const availableComponents = [
    { id: 'logo', label: 'Company Logo', icon: ImageIcon },
    { id: 'header', label: 'Header Design', icon: ImageIcon },
    { id: 'footer', label: 'Footer Design', icon: ImageIcon },
    { id: 'companyName', label: 'Company Name', icon: FileText },
    { id: 'contactInfo', label: 'Contact Details', icon: FileText },
    { id: 'date', label: 'Date', icon: FileText },
    { id: 'recipient', label: 'Recipient Info', icon: FileText },
    { id: 'subject', label: 'Subject Line', icon: FileText },
    { id: 'content', label: 'Letter Body', icon: FileText },
    { id: 'signature', label: 'Signature Block', icon: FileText },
    { id: 'divider', label: 'Divider Line', icon: Minus, isMulti: true },
    { id: 'textblock', label: 'Text Block', icon: Type, isMulti: true },
  ];

  const [positions, setPositions] = useState({
    logo: { x: 48, y: 48 },
    header: { x: 0, y: 0 },
    footer: { x: 0, y: 950 },
    companyName: { x: 48, y: 150 },
    contactInfo: { x: 600, y: 48 },
    date: { x: 48, y: 220 },
    recipient: { x: 48, y: 270 },
    subject: { x: 48, y: 380 },
    content: { x: 48, y: 430 },
    signature: { x: 48, y: 800 }
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-editor') && !e.target.closest('.sidebar-panel') && !e.target.closest('.global-toolbar') && !e.target.closest('.group')) {
        setActiveId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePositionChange = (id, newPos) => {
    setPositions(prev => ({ ...prev, [id]: newPos }));
  };

  const handleImageUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleInputChange(id, reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleComponent = (comp) => {
    if (comp.isMulti) {
      const newId = `${comp.id}-${Date.now()}`;
      setPositions(prev => ({ ...prev, [newId]: { x: 100, y: 100 } }));
      if (comp.id === 'textblock') {
         setFormData(prev => ({ ...prev, [newId]: 'New Text Block' }));
      }
      setVisibleComponents(prev => [...prev, newId]);
      setActiveId(newId);
    } else {
      setVisibleComponents(prev => 
        prev.includes(comp.id) ? prev.filter(c => c !== comp.id) : [...prev, comp.id]
      );
    }
  };

  const handleDragStart = (e, comp) => {
    e.dataTransfer.setData('componentId', comp.id);
    e.dataTransfer.setData('isMulti', comp.isMulti ? 'true' : 'false');
  };

  const removeComponent = (id) => {
    setVisibleComponents(prev => prev.filter(c => c !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const baseId = e.dataTransfer.getData('componentId');
    const isMulti = e.dataTransfer.getData('isMulti') === 'true';
    
    if (baseId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, e.clientX - rect.left - 20);
      const y = Math.max(0, e.clientY - rect.top - 20);
      
      if (isMulti) {
         const newId = `${baseId}-${Date.now()}`;
         setPositions(prev => ({ ...prev, [newId]: { x, y } }));
         if (baseId === 'textblock') {
            setFormData(prev => ({ ...prev, [newId]: 'New Text Block' }));
         }
         setVisibleComponents(prev => [...prev, newId]);
         setActiveId(newId);
      } else if (!visibleComponents.includes(baseId)) {
         let finalX = x;
         let finalY = y;
         if (baseId === 'header') {
            finalX = 0;
            finalY = 0;
         } else if (baseId === 'footer') {
            finalX = 0;
            finalY = 950;
         }
         
         setPositions(prev => ({ ...prev, [baseId]: { x: finalX, y: finalY } }));
         setVisibleComponents(prev => [...prev, baseId]);
         setActiveId(baseId);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePrint = () => {
    setActiveId(null);
    setTimeout(() => window.print(), 100);
  };

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
  };

  const activeLabel = activeId === 'logo' ? 'Company Logo'
    : activeId === 'header' ? 'Header Design'
    : activeId === 'footer' ? 'Footer Design'
    : activeId === 'companyName' ? 'Company Name'
    : activeId === 'contactInfo' ? 'Contact Details'
    : activeId === 'date' ? 'Date'
    : activeId === 'recipient' ? 'Recipient Info'
    : activeId === 'subject' ? 'Subject Line'
    : activeId === 'content' ? 'Letter Body'
    : activeId === 'signature' ? 'Signature Block'
    : activeId?.startsWith('divider') ? 'Divider Line'
    : activeId?.startsWith('textblock') ? 'Text Block'
    : 'Unknown Component';

  return (
    <ErrorBoundary>
    <div className="space-y-6 print:m-0 print:p-0 print:bg-white print:block min-h-screen">
      <div className="print:hidden">
        <PageHeader
          title="Letter Builder (Drag & Drop)"
          description="Drag the handle to move components anywhere on the page. Click text to edit."
          breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Documents' }, { label: 'Letter Builder' }]}
          actions={
            <Button icon={Printer} onClick={handlePrint} variant="primary">
              Print / Save as PDF
            </Button>
          }
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-180px)] print:h-auto print:block">
        
        {/* Settings Panel */}
        <div className="w-full xl:w-[320px] shrink-0 flex flex-col h-full print:hidden space-y-4 sidebar-panel overflow-y-auto">

          <Card className="p-5 bg-slate-50 dark:bg-slate-900/40 shrink-0 flex-1 border-primary/20 flex flex-col">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
               <MousePointerClick className="w-4 h-4 text-primary" /> Components
             </h3>

             <div className="grid grid-cols-2 gap-2 mb-6">
               {availableComponents.map(comp => {
                 const isVisible = !comp.isMulti && visibleComponents.includes(comp.id);
                 return (
                   <div 
                     key={comp.id}
                     draggable={!isVisible}
                     onDragStart={(e) => handleDragStart(e, comp)}
                     onClick={() => toggleComponent(comp)}
                     className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${isVisible ? 'bg-primary/5 border-primary/20 text-primary opacity-60 cursor-pointer' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-sm cursor-grab active:cursor-grabbing text-slate-700 dark:text-slate-300'}`}
                     title={isVisible ? "Click to hide" : "Drag to canvas or click to add"}
                   >
                     <comp.icon className="w-5 h-5 mb-1.5 opacity-70" />
                     <span className="text-[10px] font-bold uppercase tracking-wider">{comp.label}</span>
                   </div>
                 )
               })}
             </div>

             {['logo', 'header', 'footer'].includes(activeId) && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                   <div className="font-bold text-sm text-primary mb-4">Edit {activeLabel}</div>
                   <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image Size</label>
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{formData[`${activeId}Size`]}px</span>
                     </div>
                     <input type="range" min="30" max="600" value={formData[`${activeId}Size`]} onChange={(e) => handleInputChange(`${activeId}Size`, e.target.value)} className="w-full accent-primary mt-2" />
                   </div>
                </div>
             )}

             {activeId && !['logo', 'header', 'footer'].includes(activeId) && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      Editing: <strong className="text-primary">{activeLabel}</strong>
                      <div className="text-xs text-slate-400 mt-2">Use the floating toolbar to format text. Drag edges to resize.</div>
                   </div>
                </div>
             )}

             <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6">
                <div>
                   <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                     <Settings2 className="w-3 h-3" /> Global Settings
                   </label>
                   
                   <div className="mb-4">
                     <label className="block text-xs font-semibold text-slate-600 mb-1.5">Document Font Style</label>
                     <div className="flex bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <button onClick={() => handleInputChange('fontFamily', 'font-sans')} className={`flex-1 px-2 py-1.5 text-xs transition-colors ${formData.fontFamily === 'font-sans' ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>Modern</button>
                        <button onClick={() => handleInputChange('fontFamily', 'font-serif')} className={`flex-1 px-2 py-1.5 text-xs font-serif transition-colors border-x border-slate-200 dark:border-slate-700 ${formData.fontFamily === 'font-serif' ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>Classic</button>
                        <button onClick={() => handleInputChange('fontFamily', 'font-mono')} className={`flex-1 px-2 py-1.5 text-xs font-mono transition-colors ${formData.fontFamily === 'font-mono' ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>Tech</button>
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-600">Global Text Size</label>
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{formData.fontSize}px</span>
                     </div>
                     <input type="range" min="10" max="24" value={formData.fontSize} onChange={(e) => handleInputChange('fontSize', e.target.value)} className="w-full accent-primary mt-2" />
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Live Editable Document Panel */}
        <div className="flex-1 h-full overflow-y-auto bg-slate-200/50 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center print:p-0 print:bg-white print:border-none print:shadow-none print:h-auto print:overflow-visible print:block print:w-full relative" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          
          {/* Universal Floating Toolbar */}
          <div className={`global-toolbar sticky top-0 mb-6 bg-slate-900 text-white rounded-full shadow-2xl p-1.5 flex items-center gap-1 z-50 print:hidden transition-all duration-300 mx-auto transform ${activeId && activeId !== 'logo' ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'}`}>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full font-bold flex items-center justify-center" title="Bold"><Bold className="w-4 h-4"/></button>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full italic font-serif flex items-center justify-center" title="Italic"><Italic className="w-4 h-4"/></button>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('underline'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full underline flex items-center justify-center" title="Underline"><Underline className="w-4 h-4"/></button>
             <div className="w-px h-5 bg-slate-700 mx-2"></div>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full flex items-center justify-center" title="Align Left"><AlignLeft className="w-4 h-4"/></button>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full flex items-center justify-center" title="Align Center"><AlignCenter className="w-4 h-4"/></button>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyRight'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full flex items-center justify-center" title="Align Right"><AlignRight className="w-4 h-4"/></button>
             <div className="w-px h-5 bg-slate-700 mx-2"></div>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full flex items-center justify-center" title="Bullet List"><List className="w-4 h-4"/></button>
             <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }} className="p-2 hover:bg-slate-700 hover:text-primary transition-colors rounded-full flex items-center justify-center text-xs" title="Numbered List"><ListOrdered className="w-4 h-4"/></button>
          </div>

          {/* Absolute Canvas Document Sheet */}
          <div 
             onDrop={handleDrop}
             onDragOver={handleDragOver}
             className={`bg-white border border-slate-200 shadow-lg w-[800px] min-h-[1056px] print:border-none print:shadow-none print:m-0 print:w-full print:max-w-none text-slate-800 relative transition-colors ${formData.fontFamily}`} 
             style={{ width: '800px', minHeight: '1056px', fontSize: `${formData.fontSize}px` }}
          >
             
             {visibleComponents.includes('header') && (
             <DraggableWrapper id="header" activeId={activeId} position={positions.header} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <ImageUploader id="header" label="Add Header Image" onFocus={setActiveId} image={formData.header} imageSize={formData.headerSize} onUpload={handleImageUpload} />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('footer') && (
             <DraggableWrapper id="footer" activeId={activeId} position={positions.footer} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <ImageUploader id="footer" label="Add Footer Image" onFocus={setActiveId} image={formData.footer} imageSize={formData.footerSize} onUpload={handleImageUpload} />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('logo') && (
             <DraggableWrapper id="logo" activeId={activeId} position={positions.logo} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <ImageUploader id="logo" label="Add Logo" onFocus={setActiveId} image={formData.logo} imageSize={formData.logoSize} onUpload={handleImageUpload} />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('companyName') && (
             <DraggableWrapper id="companyName" activeId={activeId} position={positions.companyName} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <InlineEditable id="companyName" onFocus={setActiveId} tagName="h1" className="text-[2em] font-black leading-tight" value={formData.companyName} onChange={v => handleInputChange('companyName', v)} placeholder="Company Name" />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('contactInfo') && (
             <DraggableWrapper id="contactInfo" activeId={activeId} position={positions.contactInfo} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <InlineEditable id="contactInfo" onFocus={setActiveId} className="text-[0.9em] text-slate-700 min-w-[150px]" value={formData.contactInfo} onChange={v => handleInputChange('contactInfo', v)} placeholder="Contact Info" />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('date') && (
             <DraggableWrapper id="date" activeId={activeId} position={positions.date} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <InlineEditable id="date" onFocus={setActiveId} className="font-medium" value={formData.date} onChange={v => handleInputChange('date', v)} placeholder="Date" />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('recipient') && (
             <DraggableWrapper id="recipient" activeId={activeId} position={positions.recipient} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <InlineEditable id="recipient" onFocus={setActiveId} className="min-w-[200px]" value={formData.recipient} onChange={v => handleInputChange('recipient', v)} placeholder="Recipient Name and Address" />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('subject') && (
             <DraggableWrapper id="subject" activeId={activeId} position={positions.subject} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <InlineEditable id="subject" onFocus={setActiveId} tagName="h2" className="text-[1.2em] font-bold underline min-w-[200px]" value={formData.subject} onChange={v => handleInputChange('subject', v)} placeholder="Subject" />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('content') && (
             <DraggableWrapper id="content" activeId={activeId} position={positions.content} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <InlineEditable id="content" onFocus={setActiveId} className="min-w-[400px] max-w-[700px] min-h-[100px]" value={formData.content} onChange={v => handleInputChange('content', v)} placeholder="Type your letter content here..." />
             </DraggableWrapper>
             )}

             {visibleComponents.includes('signature') && (
             <DraggableWrapper id="signature" activeId={activeId} position={positions.signature} onPositionChange={handlePositionChange} onDelete={removeComponent}>
               <InlineEditable id="signature" onFocus={setActiveId} className="min-w-[200px]" value={formData.signature} onChange={v => handleInputChange('signature', v)} placeholder="Signature block" />
             </DraggableWrapper>
             )}

             {visibleComponents.filter(id => id.startsWith('divider-')).map(id => (
               <DraggableWrapper key={id} id={id} activeId={activeId} position={positions[id] || {x: 100, y: 100}} onPositionChange={handlePositionChange} onDelete={removeComponent}>
                 <div className="flex items-center min-w-[50px] min-h-[10px] resizable-content overflow-hidden cursor-pointer px-2" style={{ width: '400px' }} onClick={(e) => { e.stopPropagation(); setActiveId(id); }}>
                   <div className="w-full border-t-[3px] border-slate-800"></div>
                 </div>
               </DraggableWrapper>
             ))}

             {visibleComponents.filter(id => id.startsWith('textblock-')).map(id => (
               <DraggableWrapper key={id} id={id} activeId={activeId} position={positions[id] || {x: 100, y: 100}} onPositionChange={handlePositionChange} onDelete={removeComponent}>
                 <InlineEditable id={id} onFocus={setActiveId} className="min-w-[150px] min-h-[30px]" value={formData[id] || ''} onChange={v => handleInputChange(id, v)} placeholder="Type here..." />
               </DraggableWrapper>
             ))}

             <style dangerouslySetInnerHTML={{__html: `
               .custom-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
               .custom-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
               .custom-editor b, .custom-editor strong { font-weight: bold; }
               .custom-editor i, .custom-editor em { font-style: italic; }
               .custom-editor u { text-decoration: underline; }
               
               .resizable-content { resize: none; }
               .group:hover .resizable-content, .ring-2 .resizable-content { resize: both; }
             `}} />
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
