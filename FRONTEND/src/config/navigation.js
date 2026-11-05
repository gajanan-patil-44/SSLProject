export const navigationConfig = [
  {
    title: "MASTER",
    items: [
      {
        label: "Companies",
        icon: "Building",
        path: "/master/companies"
      },
      {
        label: "Company Master",
        icon: "Building2",
        path: "/master/company-master"
      },
      {
        label: "Location Type Master",
        icon: "MapPin",
        path: "/master/location-type-master"
      },
      {
        label: "Location Master",
        icon: "Globe",
        path: "/master/location-master"
      },
      {
        label: "Products",
        icon: "Package",
        path: "/master/products"
      },
      {
        label: "Company Product",
        icon: "Boxes",
        path: "/master/company-products"
      },
      {
        label: "Projects",
        icon: "Folder",
        path: "/master/projects"
      },
      {
        label: "Designations",
        icon: "UserBadge",
        path: "/master/designations"
      },
      {
        label: "Roles & Permissions",
        icon: "ShieldCheck",
        path: "/master/roles"
      },
      {
        label: "User Creation",
        icon: "UserPlus",
        path: "/master/user-creation"
      },
      {
        label: "Manage Users",
        icon: "Users",
        path: "/master/manage-users"
      },
      {
        label: "Manage Page",
        icon: "Layers",
        path: "/master/manage-page"
      },
      {
        label: "Material Categories Creation",
        icon: "Tags",
        path: "/master/material-category"
      },
      {
        label: "Material Sub Category",
        icon: "Tag",
        path: "/master/material-sub-category"
      },
      {
        label: "Material Creation",
        icon: "Package",
        path: "/master/item-creation"
      },
      {
        label: "Vendor Management",
        icon: "Store",
        path: "/master/vendor-management"
      },
      {
        label: "Department",
        icon: "Building2",
        path: "/master/department"
      },
      {
        label: "GST Creation",
        icon: "Receipt",
        path: "/master/gst-creation"
      }
    ]
  },
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        icon: "LayoutDashboard",
        path: "/dashboard"
      },
      {
        label: "Applications",
        icon: "Grid",
        path: "/applications",
        badge: "New"
      },
      {
        label: "Layouts",
        icon: "Layers",
        path: "/layouts"
      }
    ]
  },
  {
    title: "DOCUMENTS",
    items: [
      {
        label: "Letter Builder",
        icon: "FileSignature",
        path: "/documents/letter-builder",
        badge: "New"
      }
    ]
  },
  {
    title: "INVENTORY",
    items: [
      {
        label: "Products",
        icon: "Package",
        path: "/inventory/products"
      },
      {
        label: "Categories",
        icon: "Tags",
        path: "/inventory/categories"
      },
      {
        label: "Brands",
        icon: "Award",
        path: "/inventory/brands"
      },
      {
        label: "Units",
        icon: "Scale",
        path: "/inventory/units"
      },
      {
        label: "Inventory",
        icon: "Archive",
        path: "/inventory/inventory"
      },
      {
        label: "Suppliers",
        icon: "Truck",
        path: "/inventory/suppliers"
      },
      {
        label: "Warehouse",
        icon: "Home",
        path: "/inventory/warehouse"
      },
      {
        label: "Stock",
        icon: "BarChart3",
        path: "/inventory/stock"
      },
      {
        label: "Inventory Analytics",
        icon: "TrendingUp",
        path: "/inventory/analytics"
      }
    ]
  },
  {
    title: "SALES",
    items: [
      {
        label: "Customers",
        icon: "Users",
        path: "/sales/customers"
      },
      {
        label: "Sales Orders",
        icon: "FileSpreadsheet",
        path: "/sales/orders"
      },
      {
        label: "Recurring Invoices",
        icon: "RefreshCw",
        path: "/sales/recurring-invoices"
      },
      {
        label: "Invoice Templates",
        icon: "LayoutTemplate",
        path: "/sales/invoice-templates"
      },
      {
        label: "Credit Notes",
        icon: "FileMinus",
        path: "/sales/credit-notes"
      },
      {
        label: "Sales Quotes",
        icon: "FileText",
        path: "/sales/quotes"
      },
      {
        label: "Cash Sales",
        icon: "DollarSign",
        path: "/sales/cash-sales"
      },
      {
        label: "Refunds",
        icon: "Undo2",
        path: "/sales/refunds"
      },
      {
        label: "Delivery Notes",
        icon: "ClipboardCheck",
        path: "/sales/delivery-notes"
      },
      {
        label: "Sales Analytics",
        icon: "LineChart",
        path: "/sales/analytics"
      }
    ]
  },
  {
    title: "PURCHASE",
    items: [
      {
        label: "Purchases",
        icon: "ShoppingBag",
        path: "/purchase/purchases"
      },
      {
        label: "Purchase Orders",
        icon: "FileEdit",
        path: "/purchase/orders"
      },
      {
        label: "Purchase Return",
        icon: "CornerUpLeft",
        path: "/purchase/return"
      },
      {
        label: "Vendors",
        icon: "UserCheck",
        path: "/purchase/vendors"
      },
      {
        label: "Procurement Analytics",
        icon: "PieChart",
        path: "/purchase/analytics"
      }
    ]
  },
  {
    title: "FINANCE",
    items: [
      {
        label: "Expenses",
        icon: "Wallet",
        path: "/finance/expenses"
      },
      {
        label: "Expense Category",
        icon: "FolderTree",
        path: "/finance/expense-category"
      },
      {
        label: "Payments",
        icon: "Receipt",
        path: "/finance/payments"
      },
      {
        label: "Cashflow",
        icon: "ArrowUpDown",
        path: "/finance/cashflow"
      },
      {
        label: "Budgeting",
        icon: "Calculator",
        path: "/finance/budgeting"
      },
      {
        label: "Taxes",
        icon: "Percent",
        path: "/finance/taxes"
      },
      {
        label: "Reports",
        icon: "FilePieChart",
        path: "/finance/reports",
        children: [
          { label: "Profit & Loss", path: "/finance/reports/profit-loss" },
          { label: "Balance Sheet", path: "/finance/reports/balance-sheet" }
        ]
      }
    ]
  },
  {
    title: "HRM",
    items: [
      {
        label: "Employees",
        icon: "UserSquare2",
        path: "/hrm/employees"
      },
      {
        label: "Departments",
        icon: "Building2",
        path: "/hrm/departments"
      },
      {
        label: "Designations / Roles",
        icon: "ShieldAlert",
        path: "/hrm/designations"
      },
      {
        label: "Attendance",
        icon: "CalendarDays",
        path: "/hrm/attendance"
      },
      {
        label: "Leave",
        icon: "CalendarRange",
        path: "/hrm/leave",
        badge: "7 Pending"
      },
      {
        label: "Holidays",
        icon: "CalendarHeart",
        path: "/hrm/holidays"
      },
      {
        label: "Payroll",
        icon: "Coins",
        path: "/hrm/payroll"
      },
      {
        label: "Recruitment",
        icon: "Briefcase",
        path: "/hrm/recruitment"
      },
      {
        label: "Performance & Appraisal",
        icon: "Award",
        path: "/hrm/performance"
      },
      {
        label: "Training & Development",
        icon: "GraduationCap",
        path: "/hrm/training"
      },
      {
        label: "HR Analytics",
        icon: "TrendingUp",
        path: "/hrm/analytics"
      }
    ]
  },
  {
    title: "CRM",
    items: [
      {
        label: "Contacts",
        icon: "Contact",
        path: "/crm/contacts"
      },
      {
        label: "Leads",
        icon: "UserPlus2",
        path: "/crm/leads"
      },
      {
        label: "Deals",
        icon: "Handshake",
        path: "/crm/deals"
      },
      {
        label: "Pipeline",
        icon: "GitFork",
        path: "/crm/pipeline"
      },
      {
        label: "Campaigns",
        icon: "Megaphone",
        path: "/crm/campaigns"
      },
      {
        label: "Customer Feedback",
        icon: "MessageSquare",
        path: "/crm/feedback"
      },
      {
        label: "Customer Analytics",
        icon: "BarChart",
        path: "/crm/analytics"
      }
    ]
  },
  {
    title: "PROJECTS",
    items: [
      {
        label: "Projects",
        icon: "FolderOpen",
        path: "/projects/projects"
      },
      {
        label: "Tasks",
        icon: "CheckSquare",
        path: "/projects/tasks"
      },
      {
        label: "Timesheet",
        icon: "Clock",
        path: "/projects/timesheet"
      },
      {
        label: "Milestones",
        icon: "Flag",
        path: "/projects/milestones"
      },
      {
        label: "Resource Allocation",
        icon: "UserCog",
        path: "/projects/resource-allocation"
      },
      {
        label: "Project Analytics",
        icon: "Edit",
        path: "/projects/analytics"
      }
    ]
  },
  {
    title: "POS",
    items: [
      {
        label: "POS",
        icon: "Monitor",
        path: "/pos/pos"
      },
      {
        label: "POS Orders",
        icon: "Layers",
        path: "/pos/orders"
      },
      {
        label: "Barcode Print",
        icon: "Scan",
        path: "/pos/barcode"
      },
      {
        label: "QR Code Print",
        icon: "QrCode",
        path: "/pos/qrcode"
      },
      {
        label: "Print Settings",
        icon: "Printer",
        path: "/pos/settings"
      }
    ]
  },
  {
    title: "ASSETS",
    items: [
      {
        label: "Asset Register",
        icon: "BookOpen",
        path: "/assets/register"
      },
      {
        label: "Assignments",
        icon: "UserMinus",
        path: "/assets/assignments"
      },
      {
        label: "Depreciation",
        icon: "TrendingDown",
        path: "/assets/depreciation"
      },
      {
        label: "Maintenance",
        icon: "Wrench",
        path: "/assets/maintenance"
      },
      {
        label: "Disposal",
        icon: "Trash2",
        path: "/assets/disposal"
      },
      {
        label: "Asset Analytics",
        icon: "ClipboardList",
        path: "/assets/analytics"
      }
    ]
  },
  {
    title: "DOCUMENTS",
    items: [
      {
        label: "Document Repository",
        icon: "FolderHeart",
        path: "/documents/repository"
      },
      {
        label: "Policies & Manuals",
        icon: "BookTemplate",
        path: "/documents/policies"
      },
      {
        label: "Compliance Docs",
        icon: "ShieldCheck",
        path: "/documents/compliance"
      },
      {
        label: "Document Workflows",
        icon: "Workflow",
        path: "/documents/workflows"
      }
    ]
  },
  {
    title: "SUPPORT",
    items: [
      {
        label: "Contact Messages",
        icon: "MailQuestion",
        path: "/support/messages"
      },
      {
        label: "Tickets",
        icon: "Ticket",
        path: "/support/tickets",
        badge: "New"
      },
      {
        label: "Knowledge Base",
        icon: "HelpCircle",
        path: "/support/kb"
      },
      {
        label: "SLA Management",
        icon: "Activity",
        path: "/support/sla"
      }
    ]
  },
  {
    title: "MEMBERSHIP",
    items: [
      {
        label: "Membership Plans",
        icon: "Gem",
        path: "/membership/plans"
      },
      {
        label: "Membership Addons",
        icon: "Boxes",
        path: "/membership/addons"
      },
      {
        label: "Transactions",
        icon: "Banknote",
        path: "/membership/transactions"
      }
    ]
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "User Management",
        icon: "UsersRound",
        path: "/system/users"
      },
      {
        label: "Roles & Permissions",
        icon: "ShieldAlert",
        path: "/system/roles"
      },
      {
        label: "Delete Requests",
        icon: "UserX",
        path: "/system/delete-requests"
      },
      {
        label: "Settings",
        icon: "Settings",
        path: "/system/settings",
        children: [
          { label: "Company Settings", path: "/system/settings/company" },
          { label: "Localization", path: "/system/settings/localization" },
          { label: "Notification Settings", path: "/system/settings/notifications" }
        ]
      }
    ]
  },
  {
    title: "PAGES",
    items: [
      {
        label: "Authentication",
        icon: "Lock",
        path: "/pages/auth",
        children: [
          { label: "Login", path: "/pages/auth/login" },
          { label: "Register", path: "/pages/auth/register" },
          { label: "Forgot Password", path: "/pages/auth/forgot-password" },
          { label: "Reset Password", path: "/pages/auth/reset-password" },
          { label: "OTP Verification", path: "/pages/auth/otp" }
        ]
      },
      {
        label: "Error Pages",
        icon: "AlertCircle",
        path: "/pages/error",
        children: [
          { label: "404 Not Found", path: "/pages/error/404" },
          { label: "403 Forbidden", path: "/pages/error/403" },
          { label: "500 Server Error", path: "/pages/error/500" },
          { label: "Maintenance", path: "/pages/error/maintenance" },
          { label: "Coming Soon", path: "/pages/error/coming-soon" }
        ]
      },
      {
        label: "Utilities",
        icon: "Sparkles",
        path: "/pages/utilities"
      }
    ]
  },
  {
    title: "UI INTERFACE",
    items: [
      {
        label: "Base UI",
        icon: "Component",
        path: "/ui/base"
      },
      {
        label: "Advanced UI",
        icon: "Boxes",
        path: "/ui/advanced"
      },
      {
        label: "Forms",
        icon: "TextCursorInput",
        path: "/ui/forms"
      },
      {
        label: "Tables",
        icon: "Grid3X3",
        path: "/ui/tables"
      },
      {
        label: "Charts",
        icon: "AreaChart",
        path: "/ui/charts"
      },
      {
        label: "Icons",
        icon: "Smile",
        path: "/ui/icons"
      }
    ]
  },
  {
    title: "HELP",
    items: [
      {
        label: "Documentation",
        icon: "FileHeart",
        path: "/help/docs"
      },
      {
        label: "Changelog",
        icon: "Milestone",
        path: "/help/changelog"
      },
      {
        label: "Multi Level",
        icon: "Menu",
        path: "/help/multilevel",
        children: [
          {
            label: "Level 2.1",
            path: "/help/multilevel/2-1"
          },
          {
            label: "Level 2.2",
            path: "/help/multilevel/2-2"
          }
        ]
      }
    ]
  },
  {
    title: "WORK MANAGEMENT",
    items: [
      {
        label: "My Daily Work Update",
        icon: "CalendarCheck",
        path: "/work-management/daily-update",
        badge: "Daily"
      },
      {
        label: "My Work History",
        icon: "History",
        path: "/work-management/work-history"
      },
      {
        label: "My Assigned Tasks",
        icon: "CheckSquare",
        path: "/work-management/assigned-tasks"
      },
      {
        label: "Task Assignment",
        icon: "UserPlus",
        path: "/work-management/task-assignment"
      },
      {
        label: "Project Task Tracker",
        icon: "Kanban",
        path: "/work-management/project-tasks"
      },
      {
        label: "Team / Dept Updates",
        icon: "Users",
        path: "/work-management/team-updates"
      },
      {
        label: "Work Update Review",
        icon: "ClipboardCheck",
        path: "/work-management/review"
      },
      {
        label: "Organization Dashboard",
        icon: "LayoutDashboard",
        path: "/work-management/dashboard"
      },
      {
        label: "Work Reports & Analytics",
        icon: "BarChart3",
        path: "/work-management/analytics"
      }
    ]
  }
];
