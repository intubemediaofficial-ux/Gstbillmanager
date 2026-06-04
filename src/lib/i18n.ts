export type Language = "en" | "hi";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.my_firms": "My Firms",
    "nav.customers": "Bill To (Parties)",
    "nav.products": "Products",
    "nav.create_invoice": "Create Invoice",
    "nav.invoices": "Invoices",
    "nav.quotations": "Quotations",
    "nav.credit_notes": "Credit Notes",
    "nav.debit_notes": "Debit Notes",
    "nav.purchase_bills": "Purchase Bills",
    "nav.recurring_invoices": "Recurring Invoices",
    "nav.party_ledger": "Party Ledger",
    "nav.expenses": "Expenses",
    "nav.profit_loss": "Profit & Loss",
    "nav.bill_manager": "Bill Manager",
    "nav.aging_report": "Aging Report",
    "nav.party_rates": "Party Rates",
    "nav.bulk_import": "Bulk Import",
    "nav.reports": "Reports",
    "nav.employees": "Employees",
    "nav.salary_slips": "Salary Slips",
    "nav.attendance": "Attendance",
    "nav.gstr_reports": "GSTR Reports",
    "nav.gstr_2b": "GSTR-2B Reconciliation",
    "nav.leads": "Leads & Enquiries",
    "nav.follow_ups": "Follow-up Reminders",
    "nav.email_templates": "Email Templates",
    "nav.greeting_cards": "Greeting Cards",
    "nav.documents": "Documents",
    "nav.document_history": "Document History",
    "nav.settings": "Settings",
    "nav.inventory": "Inventory",
    "nav.eway_bills": "E-Way Bills",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.loading": "Loading...",
    "common.no_data": "No data found",
    "common.total": "Total",
    "common.status": "Status",
    "common.date": "Date",
    "common.amount": "Amount",
    "common.actions": "Actions",
    "common.name": "Name",
    "common.phone": "Phone",
    "common.email": "Email",
    "common.address": "Address",
    "common.all": "All",
    "common.paid": "Paid",
    "common.unpaid": "Unpaid",
    "common.draft": "Draft",
    "common.sent": "Sent",
    "common.logout": "Logout",

    // Dashboard
    "dashboard.total_invoices": "Total Invoices",
    "dashboard.total_revenue": "Total Revenue",
    "dashboard.pending_amount": "Pending Amount",
    "dashboard.total_customers": "Total Customers",
    "dashboard.recent_invoices": "Recent Invoices",

    // Invoice
    "invoice.invoice_number": "Invoice Number",
    "invoice.customer": "Customer",
    "invoice.grand_total": "Grand Total",
    "invoice.tax_amount": "Tax Amount",
    "invoice.subtotal": "Subtotal",
    "invoice.due_date": "Due Date",
    "invoice.create_new": "Create New Invoice",
  },
  hi: {
    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.my_firms": "मेरी फर्में",
    "nav.customers": "पार्टी (बिल टू)",
    "nav.products": "प्रोडक्ट",
    "nav.create_invoice": "बिल बनाएं",
    "nav.invoices": "बिल / इनवॉइस",
    "nav.quotations": "कोटेशन",
    "nav.credit_notes": "क्रेडिट नोट",
    "nav.debit_notes": "डेबिट नोट",
    "nav.purchase_bills": "खरीदारी बिल",
    "nav.recurring_invoices": "रिकरिंग बिल",
    "nav.party_ledger": "खाता बही",
    "nav.expenses": "खर्चे",
    "nav.profit_loss": "लाभ और हानि",
    "nav.bill_manager": "बिल मैनेजर",
    "nav.aging_report": "बकाया रिपोर्ट",
    "nav.party_rates": "पार्टी रेट",
    "nav.bulk_import": "बल्क इम्पोर्ट",
    "nav.reports": "रिपोर्ट्स",
    "nav.employees": "कर्मचारी",
    "nav.salary_slips": "सैलरी स्लिप",
    "nav.attendance": "हाज़िरी",
    "nav.gstr_reports": "जीएसटीआर रिपोर्ट",
    "nav.gstr_2b": "GSTR-2B मिलान",
    "nav.leads": "लीड्स और पूछताछ",
    "nav.follow_ups": "फॉलो-अप रिमाइंडर",
    "nav.email_templates": "ईमेल टेम्पलेट",
    "nav.greeting_cards": "बधाई कार्ड",
    "nav.documents": "दस्तावेज़",
    "nav.document_history": "दस्तावेज़ इतिहास",
    "nav.settings": "सेटिंग्स",
    "nav.inventory": "स्टॉक",
    "nav.eway_bills": "ई-वे बिल",

    // Common
    "common.save": "सेव करें",
    "common.cancel": "रद्द करें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.add": "जोड़ें",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर",
    "common.download": "डाउनलोड",
    "common.upload": "अपलोड",
    "common.loading": "लोड हो रहा है...",
    "common.no_data": "कोई डेटा नहीं मिला",
    "common.total": "कुल",
    "common.status": "स्थिति",
    "common.date": "तारीख",
    "common.amount": "राशि",
    "common.actions": "कार्यवाही",
    "common.name": "नाम",
    "common.phone": "फ़ोन",
    "common.email": "ईमेल",
    "common.address": "पता",
    "common.all": "सभी",
    "common.paid": "भुगतान हो गया",
    "common.unpaid": "बकाया",
    "common.draft": "ड्राफ्ट",
    "common.sent": "भेजा गया",
    "common.logout": "लॉगआउट",

    // Dashboard
    "dashboard.total_invoices": "कुल बिल",
    "dashboard.total_revenue": "कुल आय",
    "dashboard.pending_amount": "बकाया राशि",
    "dashboard.total_customers": "कुल पार्टी",
    "dashboard.recent_invoices": "हाल के बिल",

    // Invoice
    "invoice.invoice_number": "बिल नंबर",
    "invoice.customer": "पार्टी",
    "invoice.grand_total": "कुल राशि",
    "invoice.tax_amount": "टैक्स राशि",
    "invoice.subtotal": "उप-कुल",
    "invoice.due_date": "अंतिम तारीख",
    "invoice.create_new": "नया बिल बनाएं",
  },
};

export function t(key: string, lang: Language = "en"): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

export function getLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("app_language") as Language) || "en";
}

export function setLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("app_language", lang);
  window.dispatchEvent(new Event("languagechange"));
}
