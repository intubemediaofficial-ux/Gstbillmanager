// ── User & Auth ──
export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // bcrypt hash
  role: "admin" | "client";
  phone?: string;
  createdAt: string;
  active: boolean;
}

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
}

// ── Customer (B2B Party) ──
export interface Customer {
  id: string;
  userId: string; // owner client
  isGst: boolean;
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  createdAt: string;
}

// ── Product / Service Catalog ──
export interface Product {
  id: string;
  userId: string;
  name: string;
  hsn: string;
  unit: string;
  rate: number;
  gstRate: number;
  type: "goods" | "service";
  description?: string;
}

// ── Invoice Item ──
export interface InvoiceItem {
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
}

// ── Invoice ──
export type InvoiceType =
  | "tax_invoice"
  | "bill_of_supply"
  | "credit_note"
  | "debit_note"
  | "proforma"
  | "quotation"
  | "delivery_challan";

export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "cancelled" | "overdue";

export interface Invoice {
  id: string;
  userId: string; // creator
  invoiceNumber: string;
  invoiceType: InvoiceType;
  referenceInvoiceId?: string; // for credit/debit notes
  referenceInvoiceNumber?: string;
  date: string;
  dueDate: string;
  firm?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    gstin: string;
    pan: string;
    phone: string;
    email: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    signatureText: string;
  };
  customer: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    gstin: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  grandTotal: number;
  amountPaid: number;
  isInterState: boolean;
  notes: string;
  terms: string;
  gstMode?: "exclude" | "include";
  signature?: {
    id: string;
    directorName: string;
    imageData: string;
  };
  letterhead?: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Business Settings (per client) ──
export interface BusinessSettings {
  companyName: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  logo?: string;
  invoicePrefix: string;
  lastInvoiceNumber: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  termsAndConditions: string;
  signatureText: string;
}

// ── Director Signature ──
export interface Signature {
  id: string;
  userId: string;
  firmId: string;
  directorName: string;
  imageData: string; // base64 data URL
  createdAt: string;
}

// ── My Firm (Seller Company) ──
export interface Firm {
  id: string;
  userId: string;
  isGst: boolean;
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  hsnCode: string;
  signatureText: string;
  letterhead: string;
  createdAt: string;
}

// ── Indian States ──
export const INDIAN_STATES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu",
  "26": "Dadra & Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh",
};

export const GST_RATES = [0, 5, 12, 18, 28];

export const UNITS = [
  "PCS", "NOS", "KG", "GM", "LTR", "ML", "MTR", "CM",
  "SQF", "SQM", "BOX", "BAG", "BTL", "SET", "PAR",
  "DOZ", "QTL", "TON", "UNT", "HRS", "DAY", "MON",
];

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  tax_invoice: "Tax Invoice",
  bill_of_supply: "Bill of Supply",
  credit_note: "Credit Note",
  debit_note: "Debit Note",
  proforma: "Proforma Invoice",
  quotation: "Quotation / Estimate",
  delivery_challan: "Delivery Challan",
};

// ── HSN/SAC Code Library ──
export interface HsnEntry {
  code: string;
  category: string;
  description: string;
  gstRate: number;
}

export const HSN_LIBRARY: HsnEntry[] = [
  // Services (SAC Codes)
  { code: "998361", category: "Music & Entertainment", description: "Music production, distribution, entertainment services", gstRate: 18 },
  { code: "998314", category: "Digital Media", description: "Digital content, media publishing, online platforms", gstRate: 18 },
  { code: "998313", category: "Advertising & Marketing", description: "Advertising agency services, marketing campaigns", gstRate: 18 },
  { code: "998311", category: "IT & Software", description: "IT consulting, software development, SaaS", gstRate: 18 },
  { code: "998312", category: "Web Development", description: "Website design, web hosting, domain services", gstRate: 18 },
  { code: "998231", category: "Management Consulting", description: "Business consulting, advisory, management services", gstRate: 18 },
  { code: "998212", category: "Accounting & Taxation", description: "CA services, tax filing, bookkeeping, audit", gstRate: 18 },
  { code: "998211", category: "Legal Services", description: "Legal advisory, documentation, compliance", gstRate: 18 },
  { code: "997212", category: "Renting / Real Estate", description: "Commercial property rent, co-working space", gstRate: 18 },
  { code: "996311", category: "Restaurant / Food", description: "Restaurant services, catering, food delivery", gstRate: 5 },
  { code: "996411", category: "Transport / Logistics", description: "Goods transport, courier, freight, logistics", gstRate: 18 },
  { code: "999210", category: "Education & Training", description: "Coaching, training, workshops, certifications", gstRate: 18 },
  { code: "998599", category: "Support Services", description: "Office support, staffing, HR, maintenance", gstRate: 18 },
  { code: "998511", category: "Photography & Video", description: "Photography, videography, post-production", gstRate: 18 },
  { code: "998396", category: "Event Management", description: "Event planning, conferences, exhibitions", gstRate: 18 },
  { code: "998315", category: "Graphic Design", description: "Graphic design, branding, print design", gstRate: 18 },
  { code: "998319", category: "Content Writing", description: "Copywriting, content creation, blogging, SEO", gstRate: 18 },
  { code: "998316", category: "Social Media", description: "Social media management, influencer marketing", gstRate: 18 },
  { code: "9996", category: "YouTube / Recreational, Cultural & Sporting", description: "YouTube channels, content creators, recreational, cultural, sporting services", gstRate: 18 },
  { code: "999611", category: "Sound Recording", description: "Sound recording, music recording studio services", gstRate: 18 },
  { code: "999612", category: "Film / TV / Radio Production", description: "Motion picture, videotape, television, radio programme production", gstRate: 18 },
  { code: "999613", category: "Audiovisual Post-Production", description: "Audiovisual editing, dubbing, subtitling, post-production", gstRate: 18 },
  { code: "999614", category: "Film Distribution & Projection", description: "Motion picture distribution, projection, cinema services", gstRate: 18 },
  { code: "999631", category: "Performing Arts", description: "Live performing arts events, concerts, stage shows", gstRate: 18 },
  { code: "999659", category: "Sports & Recreation", description: "Sports facility, gym, fitness, recreation services", gstRate: 18 },
  // Goods (HSN Codes)
  { code: "8471", category: "Computers & Laptops", description: "Computers, laptops, tablets, data processing machines", gstRate: 18 },
  { code: "8517", category: "Mobile Phones", description: "Mobile phones, smartphones, telecom equipment", gstRate: 18 },
  { code: "4901", category: "Printed Books", description: "Books, newspapers, printed materials", gstRate: 0 },
  { code: "6109", category: "Clothing / T-shirts", description: "T-shirts, singlets, undergarments, knitwear", gstRate: 5 },
  { code: "9403", category: "Furniture", description: "Office furniture, chairs, desks, shelves", gstRate: 18 },
  { code: "3304", category: "Cosmetics", description: "Beauty products, skincare, makeup", gstRate: 28 },
  { code: "0402", category: "Dairy Products", description: "Milk, cream, cheese, butter", gstRate: 5 },
  { code: "1006", category: "Rice", description: "Rice, paddy, husked rice", gstRate: 5 },
  { code: "8528", category: "Television / Monitors", description: "TV, monitors, display equipment", gstRate: 18 },
  { code: "7108", category: "Gold / Jewellery", description: "Gold, silver, precious metals, jewellery", gstRate: 3 },
];
