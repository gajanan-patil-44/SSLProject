// src/data/mockData.js

export const mockDepartments = [
  { id: 1, name: "Engineering", code: "ENG", head: "Evelyn Hayes", employeesCount: 489 },
  { id: 2, name: "Marketing", code: "MKT", head: "Maria Garcia", employeesCount: 282 },
  { id: 3, name: "Finance", code: "FIN", head: "Daniel Roberts", employeesCount: 231 },
  { id: 4, name: "Sales", code: "SLS", head: "Thomas Mervin", employeesCount: 180 },
  { id: 5, name: "HR", code: "HRM", head: "Regina Bryant", employeesCount: 103 }
];

export const mockDesignations = [
  { id: 1, title: "Senior Developer", department: "Engineering", level: "L3" },
  { id: 2, title: "Product Manager", department: "Engineering", level: "L4" },
  { id: 3, title: "UX Designer", department: "Marketing", level: "L2" },
  { id: 4, title: "Android Developer", department: "Engineering", level: "L2" },
  { id: 5, title: "HR Generalist", department: "HR", level: "L1" },
  { id: 6, title: "Financial Analyst", department: "Finance", level: "L3" },
  { id: 7, title: "Account Executive", department: "Sales", level: "L2" }
];

export const mockEmployees = [
  {
    id: "EMP-001",
    name: "Evelyn Hayes",
    email: "evelyn.hayes@vishvin-erp.com",
    phone: "+1 (555) 019-2831",
    department: "Engineering",
    designation: "Product Manager",
    joiningDate: "2021-03-15",
    status: "Active",
    salary: 95000,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-002",
    name: "Emily Carter",
    email: "emily.carter@vishvin-erp.com",
    phone: "+1 (555) 021-9988",
    department: "Engineering",
    designation: "Android Developer",
    joiningDate: "2022-06-01",
    status: "Active",
    salary: 82000,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-003",
    name: "Daniel Roberts",
    email: "daniel.roberts@vishvin-erp.com",
    phone: "+1 (555) 035-7712",
    department: "Finance",
    designation: "Financial Analyst",
    joiningDate: "2020-01-10",
    status: "Active",
    salary: 90000,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-004",
    name: "Alex Thompson",
    email: "alex.t@vishvin-erp.com",
    phone: "+1 (555) 041-3344",
    department: "Engineering",
    designation: "Senior Developer",
    joiningDate: "2019-11-20",
    status: "Active",
    salary: 110000,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-005",
    name: "Maria Garcia",
    email: "maria.g@vishvin-erp.com",
    phone: "+1 (555) 055-1212",
    department: "Marketing",
    designation: "UX Designer",
    joiningDate: "2023-01-15",
    status: "Active",
    salary: 75000,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-006",
    name: "Thomas Mervin",
    email: "thomas.m@vishvin-erp.com",
    phone: "+1 (555) 077-8899",
    department: "Sales",
    designation: "Account Executive",
    joiningDate: "2022-09-10",
    status: "Active",
    salary: 68000,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-007",
    name: "Regina Bryant",
    email: "regina.b@vishvin-erp.com",
    phone: "+1 (555) 088-2233",
    department: "HR",
    designation: "HR Generalist",
    joiningDate: "2022-02-18",
    status: "Active",
    salary: 65000,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-008",
    name: "Marcus Vance",
    email: "marcus.v@vishvin-erp.com",
    phone: "+1 (555) 099-4455",
    department: "Engineering",
    designation: "Senior Developer",
    joiningDate: "2021-08-01",
    status: "Active",
    salary: 105000,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-009",
    name: "Sarah Jenkins",
    email: "sarah.j@vishvin-erp.com",
    phone: "+1 (555) 111-2233",
    department: "Marketing",
    designation: "Marketing Specialist",
    joiningDate: "2023-04-10",
    status: "Active",
    salary: 62000,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-010",
    name: "Michael Chang",
    email: "michael.c@vishvin-erp.com",
    phone: "+1 (555) 222-3344",
    department: "Finance",
    designation: "Finance Manager",
    joiningDate: "2018-05-12",
    status: "Active",
    salary: 115000,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-011",
    name: "Linda Watson",
    email: "linda.w@vishvin-erp.com",
    phone: "+1 (555) 333-4455",
    department: "HR",
    designation: "HR Manager",
    joiningDate: "2017-09-01",
    status: "Active",
    salary: 92000,
    avatar: "https://images.unsplash.com/photo-1534751516642-a131ffd107fd?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-012",
    name: "David Miller",
    email: "david.m@vishvin-erp.com",
    phone: "+1 (555) 444-5566",
    department: "Sales",
    designation: "Sales Manager",
    joiningDate: "2020-10-15",
    status: "Inactive",
    salary: 88000,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
  }
];

export const mockProducts = [
  {
    id: "PROD-001",
    name: "iPhone 15 Pro Max",
    sku: "IPH15PM-256-GR",
    category: "Smartphones",
    brand: "Apple",
    price: 1199,
    stock: 45,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80",
    description: "Apple iPhone 15 Pro Max with titanium chassis, 256GB storage, Natural Titanium."
  },
  {
    id: "PROD-002",
    name: "MacBook Pro 16 M3 Max",
    sku: "MBP16M3M-48-1T",
    category: "Laptops",
    brand: "Apple",
    price: 3499,
    stock: 12,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&auto=format&fit=crop&q=80",
    description: "MacBook Pro 16-inch with M3 Max chip, 48GB RAM, 1TB SSD, Space Black."
  },
  {
    id: "PROD-003",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SAMS24U-512-TI",
    category: "Smartphones",
    brand: "Samsung",
    price: 1299,
    stock: 5,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80",
    description: "Samsung Galaxy S24 Ultra with AI capabilities, 512GB, Titanium Gray."
  },
  {
    id: "PROD-004",
    name: "Dell XPS 15 9530",
    sku: "DELLXPS15-i9-32",
    category: "Laptops",
    brand: "Dell",
    price: 2199,
    stock: 0,
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150&auto=format&fit=crop&q=80",
    description: "Dell XPS 15 laptop with Intel Core i9, 32GB RAM, NVIDIA RTX 4060."
  },
  {
    id: "PROD-005",
    name: "Sony WH-1000XM5",
    sku: "SONY-WHXM5-B",
    category: "Audio",
    brand: "Sony",
    price: 399,
    stock: 85,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80",
    description: "Wireless noise-canceling headphones, Sony WH-1000XM5 in Black."
  },
  {
    id: "PROD-006",
    name: "Logitech MX Master 3S",
    sku: "LOGI-MX3S-GR",
    category: "Accessories",
    brand: "Logitech",
    price: 99,
    stock: 120,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80",
    description: "Performance wireless ergonomic mouse, graphite color."
  },
  {
    id: "PROD-007",
    name: "iPad Pro 11-inch M4",
    sku: "IPADP11M4-256-S",
    category: "Tablets",
    brand: "Apple",
    price: 999,
    stock: 18,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150&auto=format&fit=crop&q=80",
    description: "Apple iPad Pro 11-inch M4 chip, OLED Screen, 256GB, Silver."
  },
  {
    id: "PROD-008",
    name: "Asus ROG Zephyrus G14",
    sku: "ASUS-G14-RTX4070",
    category: "Laptops",
    brand: "Asus",
    price: 1599,
    stock: 8,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150&auto=format&fit=crop&q=80",
    description: "ROG Zephyrus G14 gaming laptop, AMD Ryzen 9, RTX 4070, Eclipse Gray."
  },
  {
    id: "PROD-009",
    name: "Keychron Q1 Pro Keyboard",
    sku: "KEYCH-Q1P-RGB",
    category: "Accessories",
    brand: "Keychron",
    price: 199,
    stock: 35,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80",
    description: "Keychron Q1 Pro QMK/VIA wireless custom mechanical keyboard, brown switches."
  },
  {
    id: "PROD-010",
    name: "LG UltraFine 27GP950",
    sku: "LG-27GP950-B",
    category: "Monitors",
    brand: "LG",
    price: 799,
    stock: 4,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&auto=format&fit=crop&q=80",
    description: "27-inch UltraGear UHD 4K Nano IPS 144Hz Gaming Monitor."
  }
];

export const mockCategories = [
  { id: 1, name: "Smartphones", productsCount: 14, status: "Active" },
  { id: 2, name: "Laptops", productsCount: 8, status: "Active" },
  { id: 3, name: "Audio", productsCount: 22, status: "Active" },
  { id: 4, name: "Accessories", productsCount: 45, status: "Active" },
  { id: 5, name: "Tablets", productsCount: 9, status: "Active" },
  { id: 6, name: "Monitors", productsCount: 12, status: "Active" }
];

export const mockBrands = [
  { id: 1, name: "Apple", origin: "USA", status: "Active" },
  { id: 2, name: "Samsung", origin: "South Korea", status: "Active" },
  { id: 3, name: "Dell", origin: "USA", status: "Active" },
  { id: 4, name: "Logitech", origin: "Switzerland", status: "Active" },
  { id: 5, name: "Sony", origin: "Japan", status: "Active" }
];

export const mockUnits = [
  { id: 1, name: "Piece", abbreviation: "pcs", status: "Active" },
  { id: 2, name: "Box", abbreviation: "box", status: "Active" },
  { id: 3, name: "Kilogram", abbreviation: "kg", status: "Active" },
  { id: 4, name: "Meter", abbreviation: "m", status: "Active" }
];

export const mockSuppliers = [
  { id: "SUP-01", name: "Apex Tech Distributors", contact: "John Davis", email: "john@apextech.com", phone: "+1 800-555-0199", city: "New York" },
  { id: "SUP-02", name: "Global Logistics Corp", contact: "Sarah Miller", email: "smiller@globallog.com", phone: "+1 800-555-0210", city: "Chicago" },
  { id: "SUP-03", name: "Pinnacle Hardware Inc", contact: "Mark Benson", email: "mark@pinnacle.com", phone: "+1 888-555-3211", city: "San Francisco" },
  { id: "SUP-04", name: "Vertex Electronics Ltd", contact: "Jane Wang", email: "j.wang@vertex.co.uk", phone: "+44 20-7946-0929", city: "London" }
];

export const mockCustomers = [
  {
    id: "CUST-001",
    name: "Acme Corporation",
    email: "billing@acme.com",
    phone: "+1 (555) 432-1090",
    company: "Acme Corp",
    status: "Active",
    revenue: 45000,
    country: "USA"
  },
  {
    id: "CUST-002",
    name: "Wayne Enterprises",
    email: "procure@wayne.com",
    phone: "+1 (555) 789-3211",
    company: "Wayne Ent.",
    status: "Active",
    revenue: 125000,
    country: "USA"
  },
  {
    id: "CUST-003",
    name: "Stark Industries",
    email: "accounting@stark.com",
    phone: "+1 (555) 890-4411",
    company: "Stark Ind.",
    status: "Active",
    revenue: 350000,
    country: "USA"
  },
  {
    id: "CUST-004",
    name: "Globex Corporation",
    email: "info@globex.org",
    phone: "+1 (555) 123-9876",
    company: "Globex Org",
    status: "Inactive",
    revenue: 0,
    country: "Canada"
  },
  {
    id: "CUST-005",
    name: "Initech",
    email: "peter@initech.com",
    phone: "+1 (555) 345-6789",
    company: "Initech LLC",
    status: "Active",
    revenue: 18000,
    country: "USA"
  },
  {
    id: "CUST-006",
    name: "Umbrella Corporation",
    email: "contact@umbrella.com",
    phone: "+1 (555) 666-0000",
    company: "Umbrella Corp",
    status: "Active",
    revenue: 85000,
    country: "Germany"
  },
  {
    id: "CUST-007",
    name: "Cyberdyne Systems",
    email: "support@cyberdyne.com",
    phone: "+1 (555) 800-1997",
    company: "Cyberdyne Co",
    status: "Active",
    revenue: 95000,
    country: "Japan"
  },
  {
    id: "CUST-008",
    name: "Tyrell Corporation",
    email: "replicants@tyrell.com",
    phone: "+1 (555) 201-9201",
    company: "Tyrell Corp",
    status: "Active",
    revenue: 150000,
    country: "USA"
  },
  {
    id: "CUST-009",
    name: "Hooli Inc",
    email: "gavin@hooli.xyz",
    phone: "+1 (555) 999-8888",
    company: "Hooli",
    status: "Active",
    revenue: 210000,
    country: "USA"
  },
  {
    id: "CUST-010",
    name: "Veer Logistics",
    email: "shipping@veer.in",
    phone: "+91 22-2435-0912",
    company: "Veer India",
    status: "Active",
    revenue: 35000,
    country: "India"
  }
];

export const mockSalesOrders = [
  { id: "SO-001", customer: "Stark Industries", date: "2026-08-10", amount: 4899, status: "Delivered", method: "Wire Transfer" },
  { id: "SO-002", customer: "Wayne Enterprises", date: "2026-08-12", amount: 12500, status: "Processing", method: "Credit Card" },
  { id: "SO-003", customer: "Acme Corporation", date: "2026-08-14", amount: 2398, status: "Shipped", method: "ACH" },
  { id: "SO-004", customer: "Initech", date: "2026-08-15", amount: 999, status: "Pending", method: "Credit Card" },
  { id: "SO-005", customer: "Tyrell Corporation", date: "2026-08-16", amount: 8900, status: "Pending", method: "Wire Transfer" },
  { id: "SO-006", customer: "Hooli Inc", date: "2026-08-17", amount: 1599, status: "Paid", method: "PayPal" },
  { id: "SO-007", customer: "Cyberdyne Systems", date: "2026-08-17", amount: 2499, status: "Paid", method: "Wire Transfer" }
];

export const mockInvoices = [
  { id: "INV-2026-001", customer: "Wayne Enterprises", date: "2026-08-01", dueDate: "2026-08-31", amount: 12500, status: "Paid" },
  { id: "INV-2026-002", customer: "Stark Industries", date: "2026-08-03", dueDate: "2026-09-03", amount: 4899, status: "Paid" },
  { id: "INV-2026-003", customer: "Initech", date: "2026-08-05", dueDate: "2026-09-05", amount: 999, status: "Unpaid" },
  { id: "INV-2026-004", customer: "Globex Corporation", date: "2026-08-08", dueDate: "2026-08-20", amount: 1800, status: "Overdue" },
  { id: "INV-2026-005", customer: "Cyberdyne Systems", date: "2026-08-10", dueDate: "2026-09-10", amount: 2499, status: "Paid" },
  { id: "INV-2026-006", customer: "Hooli Inc", date: "2026-08-12", dueDate: "2026-09-12", amount: 1599, status: "Unpaid" },
  { id: "INV-2026-007", customer: "Umbrella Corporation", date: "2026-08-15", dueDate: "2026-09-15", amount: 4500, status: "Unpaid" }
];

export const mockPurchases = [
  { id: "PO-2026-001", vendor: "Apex Tech Distributors", date: "2026-08-02", amount: 45000, status: "Completed" },
  { id: "PO-2026-002", vendor: "Pinnacle Hardware Inc", date: "2026-08-05", amount: 15400, status: "Completed" },
  { id: "PO-2026-003", vendor: "Vertex Electronics Ltd", date: "2026-08-10", amount: 22800, status: "Pending" },
  { id: "PO-2026-004", vendor: "Global Logistics Corp", date: "2026-08-14", amount: 3500, status: "Cancelled" }
];

export const mockExpenses = [
  { id: "EXP-01", title: "AWS Cloud Infrastructure", category: "Hosting", amount: 3450, date: "2026-08-01", status: "Approved", method: "Credit Card" },
  { id: "EXP-02", title: "Office Rent - HQ", category: "Rent", amount: 8000, date: "2026-08-01", status: "Approved", method: "ACH" },
  { id: "EXP-03", title: "GitHub Enterprise Licensing", category: "SaaS Tools", amount: 1500, date: "2026-08-05", status: "Approved", method: "Credit Card" },
  { id: "EXP-04", title: "Catering for Q3 Planning", category: "Meals & Entertainment", amount: 650, date: "2026-08-08", status: "Pending", method: "Debit Card" },
  { id: "EXP-05", title: "Business Travel - London Flight", category: "Travel", amount: 1200, date: "2026-08-12", status: "Approved", method: "Credit Card" },
  { id: "EXP-06", title: "Marketing Ad Campaign - Google Ads", category: "Advertising", amount: 5000, date: "2026-08-15", status: "Pending", method: "Wire Transfer" }
];

export const mockExpenseCategories = [
  { id: 1, name: "Hosting", code: "HST", budgetLimit: 10000, spentAmount: 8450 },
  { id: 2, name: "Rent", code: "RNT", budgetLimit: 8000, spentAmount: 8000 },
  { id: 3, name: "SaaS Tools", code: "SAS", budgetLimit: 5000, spentAmount: 3200 },
  { id: 4, name: "Meals & Entertainment", code: "MEL", budgetLimit: 2000, spentAmount: 950 },
  { id: 5, name: "Travel", code: "TRV", budgetLimit: 6000, spentAmount: 4200 },
  { id: 6, name: "Advertising", code: "ADV", budgetLimit: 15000, spentAmount: 11000 }
];

export const mockAttendance = [
  { employeeId: "EMP-001", name: "Evelyn Hayes", date: "2026-08-17", clockIn: "08:52 AM", clockOut: "05:30 PM", status: "Present" },
  { employeeId: "EMP-002", name: "Emily Carter", date: "2026-08-17", clockIn: "09:15 AM", clockOut: "06:00 PM", status: "Late" },
  { employeeId: "EMP-003", name: "Daniel Roberts", date: "2026-08-17", clockIn: "09:00 AM", clockOut: "05:00 PM", status: "Present" },
  { employeeId: "EMP-004", name: "Alex Thompson", date: "2026-08-17", clockIn: "08:45 AM", clockOut: "05:15 PM", status: "Present" },
  { employeeId: "EMP-005", name: "Maria Garcia", date: "2026-08-17", clockIn: "--:--", clockOut: "--:--", status: "Absent" },
  { employeeId: "EMP-006", name: "Thomas Mervin", date: "2026-08-17", clockIn: "09:05 AM", clockOut: "05:30 PM", status: "Remote" },
  { employeeId: "EMP-007", name: "Regina Bryant", date: "2026-08-17", clockIn: "08:58 AM", clockOut: "05:00 PM", status: "Present" },
  { employeeId: "EMP-008", name: "Marcus Vance", date: "2026-08-17", clockIn: "09:35 AM", clockOut: "06:30 PM", status: "Late" },
  { employeeId: "EMP-009", name: "Sarah Jenkins", date: "2026-08-17", clockIn: "09:00 AM", clockOut: "05:00 PM", status: "Remote" },
  { employeeId: "EMP-010", name: "Michael Chang", date: "2026-08-17", clockIn: "--:--", clockOut: "--:--", status: "Absent" }
];

export const mockLeaves = [
  { id: "LV-101", employeeId: "EMP-005", name: "Maria Garcia", type: "Sick Leave", startDate: "2026-08-17", endDate: "2026-08-18", days: 2, status: "Pending", reason: "Medical emergency - high fever." },
  { id: "LV-102", employeeId: "EMP-010", name: "Michael Chang", type: "Casual Leave", startDate: "2026-08-17", endDate: "2026-08-20", days: 4, status: "Pending", reason: "Personal family business." },
  { id: "LV-103", employeeId: "EMP-002", name: "Emily Carter", type: "Maternity Leave", startDate: "2026-09-01", endDate: "2026-11-30", days: 90, status: "Approved", reason: "Expecting baby." },
  { id: "LV-104", employeeId: "EMP-007", name: "Regina Bryant", type: "Annual Leave", startDate: "2026-08-25", endDate: "2026-09-01", days: 7, status: "Approved", reason: "Summer vacation." },
  { id: "LV-105", employeeId: "EMP-006", name: "Thomas Mervin", type: "Sick Leave", startDate: "2026-08-05", endDate: "2026-08-06", days: 2, status: "Rejected", reason: "Check-up was routine." }
];

export const mockPayroll = [
  { id: "PAY-001", employeeId: "EMP-001", name: "Evelyn Hayes", month: "July 2026", baseSalary: 7916.67, bonus: 500.00, deduction: 150.00, netSalary: 8266.67, status: "Paid" },
  { id: "PAY-002", employeeId: "EMP-002", name: "Emily Carter", month: "July 2026", baseSalary: 6833.33, bonus: 0.00, deduction: 100.00, netSalary: 6733.33, status: "Paid" },
  { id: "PAY-003", employeeId: "EMP-003", name: "Daniel Roberts", month: "July 2026", baseSalary: 7500.00, bonus: 1000.00, deduction: 200.00, netSalary: 8300.00, status: "Paid" },
  { id: "PAY-004", employeeId: "EMP-004", name: "Alex Thompson", month: "July 2026", baseSalary: 9166.67, bonus: 1500.00, deduction: 300.00, netSalary: 10366.67, status: "Paid" },
  { id: "PAY-005", employeeId: "EMP-005", name: "Maria Garcia", month: "July 2026", baseSalary: 6250.00, bonus: 200.00, deduction: 80.00, netSalary: 6370.00, status: "Paid" },
  { id: "PAY-006", employeeId: "EMP-006", name: "Thomas Mervin", month: "July 2026", baseSalary: 5666.67, bonus: 800.00, deduction: 120.00, netSalary: 6346.67, status: "Pending" }
];

export const mockProjects = [
  {
    id: "PRJ-01",
    name: "Vishvin ERP Core Architecture",
    status: "In Progress",
    progress: 68,
    dueDate: "2026-10-31",
    budget: 150000,
    teamSize: 8,
    tasksCount: 42,
    description: "Re-platforming the legacy systems to a unified React cloud platform."
  },
  {
    id: "PRJ-02",
    name: "POS Touch Screen Interface",
    status: "In Progress",
    progress: 45,
    dueDate: "2026-11-15",
    budget: 65000,
    teamSize: 4,
    tasksCount: 20,
    description: "Developing custom point-of-sale screen interface optimized for tablets."
  },
  {
    id: "PRJ-03",
    name: "AWS Serverless Migration",
    status: "On Hold",
    progress: 85,
    dueDate: "2026-09-30",
    budget: 80000,
    teamSize: 5,
    tasksCount: 30,
    description: "Migrating the monolithic APIs to AWS Lambda and API Gateway."
  },
  {
    id: "PRJ-04",
    name: "Website Redesign & SEO",
    status: "Completed",
    progress: 100,
    dueDate: "2026-07-31",
    budget: 25000,
    teamSize: 3,
    tasksCount: 15,
    description: "Complete visual redesign and implementation of marketing SEO best practices."
  }
];

export const mockTasks = [
  { id: "TSK-101", title: "Setup Vite Boilerplate & Design Tokens", project: "Vishvin ERP Core Architecture", assignee: "Alex Thompson", priority: "High", status: "Done", dueDate: "2026-08-18" },
  { id: "TSK-102", title: "Create Responsive Sidebar & Layout Shell", project: "Vishvin ERP Core Architecture", assignee: "Evelyn Hayes", priority: "High", status: "In Progress", dueDate: "2026-08-20" },
  { id: "TSK-103", title: "Implement Dynamic Page Rendering Engine", project: "Vishvin ERP Core Architecture", assignee: "Emily Carter", priority: "Medium", status: "Todo", dueDate: "2026-08-25" },
  { id: "TSK-104", title: "POS Cart Logic & Payment State Integrations", project: "POS Touch Screen Interface", assignee: "Thomas Mervin", priority: "High", status: "In Progress", dueDate: "2026-08-28" },
  { id: "TSK-105", title: "Configure DynamoDB Local Schemas", project: "AWS Serverless Migration", assignee: "Marcus Vance", priority: "Low", status: "Todo", dueDate: "2026-09-10" }
];

export const mockTickets = [
  { id: "TC-8291", customer: "Stark Industries", subject: "SLA Penalty Query regarding downtime", priority: "Urgent", status: "Open", assignedAgent: "Linda Watson", createdDate: "2026-08-17", SLA: "2 Hours" },
  { id: "TC-8292", customer: "Wayne Enterprises", subject: "Cannot export payment ledger to CSV", priority: "High", status: "In Progress", assignedAgent: "Marcus Vance", createdDate: "2026-08-17", SLA: "8 Hours" },
  { id: "TC-8293", customer: "Acme Corporation", subject: "Invoice calculation error on POS terminal 2", priority: "Medium", status: "Open", assignedAgent: "Regina Bryant", createdDate: "2026-08-16", SLA: "24 Hours" },
  { id: "TC-8294", customer: "Initech", subject: "Forgot portal login password reset", priority: "Low", status: "Closed", assignedAgent: "Linda Watson", createdDate: "2026-08-15", SLA: "48 Hours" }
];

export const mockAssets = [
  { id: "AST-001", name: "Office Workstation - iMac 27", category: "Hardware", purchaseCost: 2200, salvageValue: 200, usefulLife: 5, depreciationMethod: "Straight Line", purchaseDate: "2023-01-10", currentValue: 1400, status: "Active", assignedTo: "Alex Thompson" },
  { id: "AST-002", name: "Conference Room Projector 4K", category: "Electronics", purchaseCost: 1500, salvageValue: 100, usefulLife: 4, depreciationMethod: "Straight Line", purchaseDate: "2024-06-15", currentValue: 975, status: "Active", assignedTo: "Marketing Room" },
  { id: "AST-003", name: "Corporate Server Rack Dell", category: "Server Room", purchaseCost: 12000, salvageValue: 1200, usefulLife: 6, depreciationMethod: "Double Declining", purchaseDate: "2022-03-20", currentValue: 4500, status: "Maintenance", assignedTo: "IT Team" },
  { id: "AST-004", name: "Ergonomic Desk Chair Mesh", category: "Furniture", purchaseCost: 450, salvageValue: 50, usefulLife: 8, depreciationMethod: "Straight Line", purchaseDate: "2021-08-01", currentValue: 200, status: "Disposed", assignedTo: "None" }
];

export const mockCandidates = [
  { id: "CAN-01", name: "Alex Thompson", email: "alex.thomp@gmail.com", position: "Senior Developer", stage: "Interview", appliedDate: "2026-08-10", rating: 4.8, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" },
  { id: "CAN-02", name: "Maria Garcia", email: "mgarcia.ux@yahoo.com", position: "UX Designer", stage: "New", appliedDate: "2026-08-16", rating: 4.2, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
  { id: "CAN-03", name: "Thomas Mervin", email: "tmervin@outlook.com", position: "Senior Developer", stage: "Offer", appliedDate: "2026-08-05", rating: 4.9, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=80" },
  { id: "CAN-04", name: "Regina Bryant", email: "regina.bry@gmail.com", position: "Android Developer", stage: "Hired", appliedDate: "2026-07-28", rating: 4.7, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80" }
];

export const mockMembershipPlans = [
  { id: 1, name: "Starter Suite", price: 99, period: "month", features: ["Up to 10 Employees", "Core Inventory & Sales", "1 Warehouse Limit", "Basic HRM"], activeMembers: 145 },
  { id: 2, name: "Enterprise Pro", price: 299, period: "month", features: ["Unlimited Employees", "Advanced POS & Projects", "Multiple Warehouses", "Complete HRM & Payroll", "Dedicated API Portal"], activeMembers: 320 },
  { id: 3, name: "Global Conglomerate", price: 899, period: "month", features: ["Multi-Company Selector", "Advanced Asset Depreciation", "Custom Compliance Manuals", "SLA Heartbeat Monitoring", "Unlimited Invoicing"], activeMembers: 54 }
];

export const mockTransactions = [
  { id: "TRX-99881", description: "Subscription renewal - Stark Industries", amount: 899.00, date: "2026-08-17", type: "Income", status: "Completed" },
  { id: "TRX-99882", description: "AWS Billing payment - AWS Cloud", amount: -3450.00, date: "2026-08-16", type: "Expense", status: "Completed" },
  { id: "TRX-99883", description: "Hardware purchase - Dell Inc", amount: -8800.00, date: "2026-08-15", type: "Expense", status: "Pending" },
  { id: "TRX-99884", description: "Initech POS sales deposit", amount: 1540.00, date: "2026-08-15", type: "Income", status: "Completed" }
];

export const mockContacts = [
  { id: "CON-01", name: "Tony Stark", email: "tony@starkindustries.com", phone: "+1 212-555-0100", company: "Stark Industries", stage: "Lead" },
  { id: "CON-02", name: "Bruce Wayne", email: "bruce@wayneenterprises.com", phone: "+1  Gotham-0100", company: "Wayne Enterprises", stage: "Customer" },
  { id: "CON-03", name: "Peter Gibbons", email: "peter@initech.com", phone: "+1 512-555-2311", company: "Initech LLC", stage: "Prospect" },
  { id: "CON-04", name: "Gavin Belson", email: "gavin@hooli.xyz", phone: "+1 650-555-9000", company: "Hooli", stage: "Lead" }
];
