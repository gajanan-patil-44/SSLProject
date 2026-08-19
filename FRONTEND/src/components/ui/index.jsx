// src/components/ui/index.jsx
import React, { forwardRef } from 'react';

// ==========================================
// Button Component
// ==========================================
export const Button = forwardRef(({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost', 'success'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-light text-white focus:ring-slate-900 border border-transparent shadow-sm',
    secondary: 'bg-secondary hover:bg-teal-800 text-white focus:ring-teal-700 border border-transparent shadow-sm',
    outline: 'border border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 focus:ring-slate-400',
    danger: 'bg-danger hover:bg-red-700 text-white focus:ring-red-600 border border-transparent shadow-sm',
    success: 'bg-success hover:bg-green-700 text-white focus:ring-green-650 border border-transparent shadow-sm'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
});

// ==========================================
// IconButton Component
// ==========================================
export const IconButton = forwardRef(({
  icon: Icon,
  variant = 'outline',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 cursor-pointer';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-light text-white',
    secondary: 'bg-secondary hover:bg-teal-800 text-white',
    outline: 'border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
  };

  const sizes = {
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-9 h-9',
    lg: 'p-2.5 w-11 h-11'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5'
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
});

// ==========================================
// Input / Form Field Components
// ==========================================
export const FormField = ({ label, error, helpText, className = '', children }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      {children}
      {helpText && !error && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{helpText}</span>
      )}
      {error && (
        <span className="text-[11px] text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};

export const Input = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all disabled:opacity-50 disabled:bg-slate-50 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all disabled:opacity-50 disabled:bg-slate-50 min-h-[80px] ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef(({ options = [], className = '', error, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all disabled:opacity-50 disabled:bg-slate-50 cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

// ==========================================
// Checkbox & Radio
// ==========================================
export const Checkbox = forwardRef(({ label, className = '', ...props }, ref) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-400 select-none ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-secondary focus:ring-secondary cursor-pointer"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
});

export const Radio = forwardRef(({ label, className = '', ...props }, ref) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-400 select-none ${className}`}>
      <input
        ref={ref}
        type="radio"
        className="w-4 h-4 border-slate-300 dark:border-slate-800 text-secondary focus:ring-secondary cursor-pointer"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
});

export const Switch = forwardRef(({ label, className = '', checked, onChange, ...props }, ref) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer text-sm text-slate-700 dark:text-slate-400 select-none ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
      </div>
      {label && <span>{label}</span>}
    </label>
  );
});

// ==========================================
// Badge / StatusBadge Component
// ==========================================
export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-primary/10 text-primary dark:bg-slate-900/50 dark:text-slate-200 border-primary/20',
    secondary: 'bg-secondary/15 text-secondary dark:bg-teal-950/20 dark:text-teal-400 border-secondary/20',
    success: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-900/50',
    warning: 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
    danger: 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-450 border-red-200 dark:border-red-900/50',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    Active: 'success',
    Paid: 'success',
    Delivered: 'success',
    Completed: 'success',
    Hired: 'success',
    Present: 'success',
    Remote: 'info',
    Done: 'success',
    Processing: 'warning',
    Shipped: 'info',
    Offer: 'info',
    Pending: 'warning',
    Late: 'warning',
    Unpaid: 'warning',
    Open: 'primary',
    Maintenance: 'warning',
    Inactive: 'neutral',
    Cancelled: 'danger',
    Rejected: 'danger',
    Absent: 'danger',
    Disposed: 'neutral',
    Closed: 'neutral',
    Out: 'danger',
    Todo: 'neutral',
    New: 'primary',
    Screening: 'info',
    Interview: 'warning'
  };
  return <Badge variant={map[status] || 'neutral'}>{status}</Badge>;
};

// ==========================================
// Card & StatCard Components
// ==========================================
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs transition-all duration-150 p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  badgeText,
  badgeVariant = 'secondary',
  icon: Icon,
  iconColorClass = 'text-primary bg-slate-100 dark:bg-slate-800 dark:text-slate-200',
  description,
  className = '',
  onClick
}) => {
  return (
    <Card className={`flex flex-col justify-between hover:shadow-sm transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</span>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconColorClass}`}>
            <Icon className="w-5 h-5 shrink-0" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs">
        {badgeText && (
          <Badge variant={badgeVariant} className="font-semibold px-1.5 py-0.5 rounded-md">
            {badgeText}
          </Badge>
        )}
        {description && (
          <span className="text-slate-500 dark:text-slate-400 font-medium">{description}</span>
        )}
      </div>
    </Card>
  );
};

// ==========================================
// Avatar / AvatarGroup
// ==========================================
export const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const getInitials = (n) => {
    return n.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`relative shrink-0 inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold overflow-hidden border border-white dark:border-slate-900 ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export const AvatarGroup = ({ children, max = 4, className = '' }) => {
  const items = React.Children.toArray(children);
  const visible = items.slice(0, max);
  const remaining = items.length - max;

  return (
    <div className={`flex items-center -space-x-2.5 overflow-hidden ${className}`}>
      {visible}
      {remaining > 0 && (
        <div className="relative shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-700 text-[11px] font-bold text-slate-800 dark:text-slate-200 border-2 border-white dark:border-slate-900 select-none">
          +{remaining}
        </div>
      )}
    </div>
  );
};

// ==========================================
// Alert Component
// ==========================================
export const Alert = ({ children, title, variant = 'info', icon: Icon, onClose, className = '' }) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    success: 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/50',
    warning: 'bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
    danger: 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/50'
  };

  return (
    <div className={`p-4 border rounded-xl flex gap-3 ${styles[variant]} ${className}`} role="alert">
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <div className="flex-1 text-sm">
        {title && <h5 className="font-bold mb-1">{title}</h5>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer shrink-0">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ==========================================
// Progress Bar
// ==========================================
export const ProgressBar = ({ value = 0, max = 100, color = 'bg-secondary', size = 'md' }) => {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };
  return (
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightStyles[size]}`}>
      <div className={`${color} h-full transition-all duration-300 rounded-full`} style={{ width: `${percent}%` }}></div>
    </div>
  );
};

// ==========================================
// Timeline / ActivityFeed
// ==========================================
export const Timeline = ({ items = [] }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, idx) => (
          <li key={item.id || idx}>
            <div className="relative pb-8">
              {idx !== items.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${item.iconBg || 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {item.icon ? <item.icon className="w-4 h-4" /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {item.content}{' '}
                      {item.target && (
                        <a href={item.targetLink || '#'} className="font-semibold text-slate-900 dark:text-slate-100 hover:underline">
                          {item.target}
                        </a>
                      )}
                    </p>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-slate-500 dark:text-slate-500 font-medium">
                    <time dateTime={item.datetime}>{item.dateText}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ==========================================
// Tooltip Component
// ==========================================
export const Tooltip = ({ children, content, position = 'top' }) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute z-50 hidden group-hover:block px-2.5 py-1.5 text-xs text-white bg-slate-900 rounded-md shadow-lg whitespace-nowrap ${positions[position]}`}>
        {content}
      </div>
    </div>
  );
};
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex items-center">
            {idx > 0 && (
              <svg className="w-3 h-3 text-slate-400 mx-1 md:mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              <a href={item.href} className="hover:text-slate-800 dark:hover:text-slate-200">
                {item.label}
              </a>
            ) : (
              <span className="text-slate-700 dark:text-slate-300 font-bold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
export const PageHeader = ({ title, description, actions, breadcrumbs }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-200/80 dark:border-slate-800/80 mb-6 gap-4">
      <div className="flex flex-col gap-1.5">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight m-0">{title}</h1>
        {description && <p className="text-sm text-slate-500 dark:text-slate-405 m-0 leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
export const SectionHeader = ({ title, description, actions }) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{title}</h3>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
