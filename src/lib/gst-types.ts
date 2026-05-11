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
