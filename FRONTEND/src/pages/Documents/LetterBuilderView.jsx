import React, { useState, useRef, useEffect } from 'react';
import { PageHeader, Card, Button } from '../../components/ui/index';
import { Printer, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, MousePointerClick, Settings2, FileText, Image as ImageIcon, GripHorizontal } from 'lucide-react';

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
const DraggableWrapper = ({ id, activeId, position, onPositionChange, children }) => {
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
      
      {isActive && <div className="absolute -top-5 left-4 text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-t print:hidden">{id}</div>}
      
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
      className={`${className} outline-none cursor-text min-h-[1em] min-w-[2em] empty:before:content-[attr(placeholder)] empty:before:text-slate-300 empty:before:pointer-events-none custom-editor`}
      placeholder={placeholder}
      dangerouslySetInnerHTML={{__html: value}}
      style={{ whiteSpace: 'pre-wrap' }}
    />
  );
};

const LogoUploader = ({ logo, logoSize, onUpload, onFocus }) => {
  const fileInputRef = useRef(null);
  return (
    <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onFocus('logo'); }}>
       {logo ? (
          <img src={logo} alt="Logo" className="object-contain hover:opacity-80 transition-opacity" style={{ maxHeight: `${logoSize}px` }} onClick={() => fileInputRef.current?.click()} />
       ) : (
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 hover:border-primary bg-slate-50 hover:bg-primary/5 flex flex-col gap-2 items-center justify-center text-slate-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-colors print:hidden" style={{ height: `${logoSize}px`, width: `${Math.max(120, logoSize * 1.5)}px` }}>
             <ImageIcon className="w-6 h-6 opacity-50" />
             Add Logo
          </div>
       )}
       <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
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

  const [positions, setPositions] = useState({
    logo: { x: 48, y: 48 },
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleInputChange('logo', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    setActiveId(null);
    setTimeout(() => window.print(), 100);
  };

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
  };

  const activeLabel = activeId === 'logo' ? 'Company Logo' 
    : activeId === 'companyName' ? 'Company Name'
    : activeId === 'contactInfo' ? 'Contact Details'
    : activeId === 'date' ? 'Date'
    : activeId === 'recipient' ? 'Recipient Info'
    : activeId === 'subject' ? 'Subject Line'
    : activeId === 'content' ? 'Letter Body'
    : activeId === 'signature' ? 'Signature Block'
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
        <div className="w-full xl:w-[320px] shrink-0 flex flex-col h-full print:hidden space-y-4 sidebar-panel">
          <Card className="p-5 bg-slate-50 dark:bg-slate-900/40 shrink-0 flex-1 border-primary/20 flex flex-col">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
               <MousePointerClick className="w-4 h-4 text-primary" /> Active Component
             </h3>

             {!activeId && (
                <div className="text-sm text-slate-500 bg-white dark:bg-slate-800 p-6 rounded-lg text-center border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-slate-300 mb-2" />
                  No component selected.<br/>Click anywhere on the document to edit its properties, or grab a handle to move it.
                </div>
             )}

             {activeId === 'logo' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-3 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <div className="font-bold text-sm text-primary">Company Logo</div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo Size</label>
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{formData.logoSize}px</span>
                     </div>
                     <input type="range" min="30" max="250" value={formData.logoSize} onChange={(e) => handleInputChange('logoSize', e.target.value)} className="w-full accent-primary mt-2" />
                   </div>
                   
                   <div className="text-xs text-slate-500 text-center pt-4">
                     Click the logo on the document again to upload a new image.
                   </div>
                </div>
             )}

             {activeId && activeId !== 'logo' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-3 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="font-bold text-sm text-primary">{activeLabel}</div>
                   </div>

                   <div className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      You are editing the <strong>{activeLabel}</strong>. 
                      <br/><br/>
                      Use the floating toolbar above the document to apply Bold, Italic, Lists, or Alignment to this block.
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
          <div className={`bg-white border border-slate-200 shadow-lg w-[800px] min-h-[1056px] print:border-none print:shadow-none print:m-0 print:w-full print:max-w-none text-slate-800 relative overflow-hidden transition-colors ${formData.fontFamily}`} style={{ width: '800px', minHeight: '1056px', fontSize: `${formData.fontSize}px` }}>
             
             <DraggableWrapper id="logo" activeId={activeId} position={positions.logo} onPositionChange={handlePositionChange}>
               <LogoUploader onFocus={setActiveId} logo={formData.logo} logoSize={formData.logoSize} onUpload={handleLogoUpload} />
             </DraggableWrapper>

             <DraggableWrapper id="companyName" activeId={activeId} position={positions.companyName} onPositionChange={handlePositionChange}>
               <InlineEditable id="companyName" onFocus={setActiveId} tagName="h1" className="text-[2em] font-black leading-tight" value={formData.companyName} onChange={v => handleInputChange('companyName', v)} placeholder="Company Name" />
             </DraggableWrapper>

             <DraggableWrapper id="contactInfo" activeId={activeId} position={positions.contactInfo} onPositionChange={handlePositionChange}>
               <InlineEditable id="contactInfo" onFocus={setActiveId} className="text-[0.9em] text-slate-700 min-w-[150px]" value={formData.contactInfo} onChange={v => handleInputChange('contactInfo', v)} placeholder="Contact Info" />
             </DraggableWrapper>

             <DraggableWrapper id="date" activeId={activeId} position={positions.date} onPositionChange={handlePositionChange}>
               <InlineEditable id="date" onFocus={setActiveId} className="font-medium" value={formData.date} onChange={v => handleInputChange('date', v)} placeholder="Date" />
             </DraggableWrapper>

             <DraggableWrapper id="recipient" activeId={activeId} position={positions.recipient} onPositionChange={handlePositionChange}>
               <InlineEditable id="recipient" onFocus={setActiveId} className="min-w-[200px]" value={formData.recipient} onChange={v => handleInputChange('recipient', v)} placeholder="Recipient Name and Address" />
             </DraggableWrapper>

             <DraggableWrapper id="subject" activeId={activeId} position={positions.subject} onPositionChange={handlePositionChange}>
               <InlineEditable id="subject" onFocus={setActiveId} tagName="h2" className="text-[1.2em] font-bold underline min-w-[200px]" value={formData.subject} onChange={v => handleInputChange('subject', v)} placeholder="Subject" />
             </DraggableWrapper>

             <DraggableWrapper id="content" activeId={activeId} position={positions.content} onPositionChange={handlePositionChange}>
               <InlineEditable id="content" onFocus={setActiveId} className="min-w-[400px] max-w-[700px] min-h-[100px]" value={formData.content} onChange={v => handleInputChange('content', v)} placeholder="Type your letter content here..." />
             </DraggableWrapper>

             <DraggableWrapper id="signature" activeId={activeId} position={positions.signature} onPositionChange={handlePositionChange}>
               <InlineEditable id="signature" onFocus={setActiveId} className="min-w-[200px]" value={formData.signature} onChange={v => handleInputChange('signature', v)} placeholder="Signature block" />
             </DraggableWrapper>

             <style dangerouslySetInnerHTML={{__html: `
               .custom-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
               .custom-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
               .custom-editor b, .custom-editor strong { font-weight: bold; }
               .custom-editor i, .custom-editor em { font-style: italic; }
               .custom-editor u { text-decoration: underline; }
             `}} />
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
