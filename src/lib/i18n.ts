export type Language = "en" | "hi" | "bn" | "gu" | "mr" | "ta" | "te" | "kn" | "ml" | "pa" | "ur" | "or" | "as";

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "hi", label: "हिन्दी", flag: "HI" },
  { code: "bn", label: "বাংলা", flag: "BN" },
  { code: "gu", label: "ગુજરાતી", flag: "GU" },
  { code: "mr", label: "मराठी", flag: "MR" },
  { code: "ta", label: "தமிழ்", flag: "TA" },
  { code: "te", label: "తెలుగు", flag: "TE" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "KN" },
  { code: "ml", label: "മലയാളം", flag: "ML" },
  { code: "pa", label: "ਪੰਜਾਬੀ", flag: "PA" },
  { code: "ur", label: "اردو", flag: "UR" },
  { code: "or", label: "ଓଡ଼ିଆ", flag: "OR" },
  { code: "as", label: "অসমীয়া", flag: "AS" },
];

type TranslationMap = Record<string, string>;

const en: TranslationMap = {
  "nav.dashboard": "Dashboard", "nav.my_firms": "My Firms", "nav.customers": "Bill To (Parties)", "nav.products": "Products",
  "nav.create_invoice": "Create Invoice", "nav.invoices": "Invoices", "nav.quotations": "Quotations",
  "nav.credit_notes": "Credit Notes", "nav.debit_notes": "Debit Notes", "nav.purchase_bills": "Purchase Bills",
  "nav.recurring_invoices": "Recurring Invoices", "nav.party_ledger": "Party Ledger", "nav.expenses": "Expenses",
  "nav.profit_loss": "Profit & Loss", "nav.bill_manager": "Bill Manager", "nav.aging_report": "Aging Report",
  "nav.party_rates": "Party Rates", "nav.bulk_import": "Bulk Import", "nav.reports": "Reports",
  "nav.employees": "Employees", "nav.salary_slips": "Salary Slips", "nav.attendance": "Attendance",
  "nav.gstr_reports": "GSTR Reports", "nav.gstr_2b": "GSTR-2B Reconciliation",
  "nav.leads": "Leads & Enquiries", "nav.follow_ups": "Follow-up Reminders", "nav.email_templates": "Email Templates",
  "nav.greeting_cards": "Greeting Cards", "nav.documents": "Documents", "nav.document_history": "Document History",
  "nav.settings": "Settings", "nav.inventory": "Inventory", "nav.eway_bills": "E-Way Bills",
  "nav.barcode_scanner": "Barcode Scanner", "nav.pos_receipt": "POS Receipt", "nav.customer_portal": "Customer Portal", "nav.business_card": "Business Card", "nav.cash_book": "Cash Book",
  "common.save": "Save", "common.cancel": "Cancel", "common.delete": "Delete", "common.edit": "Edit", "common.add": "Add",
  "common.search": "Search", "common.filter": "Filter", "common.download": "Download", "common.upload": "Upload",
  "common.loading": "Loading...", "common.no_data": "No data found", "common.total": "Total",
  "common.status": "Status", "common.date": "Date", "common.amount": "Amount", "common.actions": "Actions",
  "common.name": "Name", "common.phone": "Phone", "common.email": "Email", "common.address": "Address",
  "common.all": "All", "common.paid": "Paid", "common.unpaid": "Unpaid", "common.draft": "Draft", "common.sent": "Sent",
  "common.logout": "Logout",
  "dashboard.total_invoices": "Total Invoices", "dashboard.total_revenue": "Total Revenue",
  "dashboard.pending_amount": "Pending Amount", "dashboard.total_customers": "Total Customers",
  "dashboard.recent_invoices": "Recent Invoices",
  "invoice.invoice_number": "Invoice Number", "invoice.customer": "Customer", "invoice.grand_total": "Grand Total",
  "invoice.tax_amount": "Tax Amount", "invoice.subtotal": "Subtotal", "invoice.due_date": "Due Date",
  "invoice.create_new": "Create New Invoice",
};

const hi: TranslationMap = {
  "nav.dashboard": "डैशबोर्ड", "nav.my_firms": "मेरी फर्में", "nav.customers": "पार्टी (बिल टू)", "nav.products": "प्रोडक्ट",
  "nav.create_invoice": "बिल बनाएं", "nav.invoices": "बिल / इनवॉइस", "nav.quotations": "कोटेशन",
  "nav.credit_notes": "क्रेडिट नोट", "nav.debit_notes": "डेबिट नोट", "nav.purchase_bills": "खरीदारी बिल",
  "nav.recurring_invoices": "रिकरिंग बिल", "nav.party_ledger": "खाता बही", "nav.expenses": "खर्चे",
  "nav.profit_loss": "लाभ और हानि", "nav.bill_manager": "बिल मैनेजर", "nav.aging_report": "बकाया रिपोर्ट",
  "nav.party_rates": "पार्टी रेट", "nav.bulk_import": "बल्क इम्पोर्ट", "nav.reports": "रिपोर्ट्स",
  "nav.employees": "कर्मचारी", "nav.salary_slips": "सैलरी स्लिप", "nav.attendance": "हाज़िरी",
  "nav.gstr_reports": "जीएसटीआर रिपोर्ट", "nav.gstr_2b": "GSTR-2B मिलान",
  "nav.leads": "लीड्स और पूछताछ", "nav.follow_ups": "फॉलो-अप रिमाइंडर", "nav.email_templates": "ईमेल टेम्पलेट",
  "nav.greeting_cards": "बधाई कार्ड", "nav.documents": "दस्तावेज़", "nav.document_history": "दस्तावेज़ इतिहास",
  "nav.settings": "सेटिंग्स", "nav.inventory": "स्टॉक", "nav.eway_bills": "ई-वे बिल",
  "nav.barcode_scanner": "बारकोड स्कैनर", "nav.pos_receipt": "POS रसीद", "nav.customer_portal": "ग्राहक पोर्टल", "nav.business_card": "विजिटिंग कार्ड", "nav.cash_book": "रोज़नामचा",
  "common.save": "सेव करें", "common.cancel": "रद्द करें", "common.delete": "हटाएं", "common.edit": "संपादित करें", "common.add": "जोड़ें",
  "common.search": "खोजें", "common.filter": "फ़िल्टर", "common.download": "डाउनलोड", "common.upload": "अपलोड",
  "common.loading": "लोड हो रहा है...", "common.no_data": "कोई डेटा नहीं मिला", "common.total": "कुल",
  "common.status": "स्थिति", "common.date": "तारीख", "common.amount": "राशि", "common.actions": "कार्यवाही",
  "common.name": "नाम", "common.phone": "फ़ोन", "common.email": "ईमेल", "common.address": "पता",
  "common.all": "सभी", "common.paid": "भुगतान हो गया", "common.unpaid": "बकाया", "common.draft": "ड्राफ्ट", "common.sent": "भेजा गया",
  "common.logout": "लॉगआउट",
  "dashboard.total_invoices": "कुल बिल", "dashboard.total_revenue": "कुल आय",
  "dashboard.pending_amount": "बकाया राशि", "dashboard.total_customers": "कुल पार्टी",
  "dashboard.recent_invoices": "हाल के बिल",
  "invoice.invoice_number": "बिल नंबर", "invoice.customer": "पार्टी", "invoice.grand_total": "कुल राशि",
  "invoice.tax_amount": "टैक्स राशि", "invoice.subtotal": "उप-कुल", "invoice.due_date": "अंतिम तारीख",
  "invoice.create_new": "नया बिल बनाएं",
};

const bn: TranslationMap = {
  "nav.dashboard": "ড্যাশবোর্ড", "nav.my_firms": "আমার ফার্ম", "nav.customers": "পার্টি (বিল টু)", "nav.products": "পণ্য",
  "nav.create_invoice": "বিল তৈরি করুন", "nav.invoices": "বিল / ইনভয়েস", "nav.quotations": "কোটেশন",
  "nav.credit_notes": "ক্রেডিট নোট", "nav.debit_notes": "ডেবিট নোট", "nav.purchase_bills": "ক্রয় বিল",
  "nav.recurring_invoices": "রিকারিং বিল", "nav.party_ledger": "খাতা বই", "nav.expenses": "খরচ",
  "nav.profit_loss": "লাভ ও ক্ষতি", "nav.bill_manager": "বিল ম্যানেজার", "nav.aging_report": "বকেয়া রিপোর্ট",
  "nav.party_rates": "পার্টি রেট", "nav.bulk_import": "বাল্ক ইম্পোর্ট", "nav.reports": "রিপোর্ট",
  "nav.employees": "কর্মচারী", "nav.salary_slips": "বেতন স্লিপ", "nav.attendance": "উপস্থিতি",
  "nav.gstr_reports": "জিএসটিআর রিপোর্ট", "nav.gstr_2b": "GSTR-2B মিলান",
  "nav.leads": "লিড ও জিজ্ঞাসা", "nav.follow_ups": "ফলো-আপ রিমাইন্ডার", "nav.email_templates": "ইমেল টেম্পলেট",
  "nav.greeting_cards": "শুভেচ্ছা কার্ড", "nav.documents": "নথি", "nav.document_history": "নথি ইতিহাস",
  "nav.settings": "সেটিংস", "nav.inventory": "স্টক", "nav.eway_bills": "ই-ওয়ে বিল",
  "nav.barcode_scanner": "বারকোড স্ক্যানার", "nav.pos_receipt": "POS রসিদ", "nav.customer_portal": "গ্রাহক পোর্টাল", "nav.business_card": "ভিজিটিং কার্ড", "nav.cash_book": "ক্যাশ বুক",
  "common.save": "সংরক্ষণ", "common.cancel": "বাতিল", "common.delete": "মুছুন", "common.edit": "সম্পাদনা", "common.add": "যোগ করুন",
  "common.search": "অনুসন্ধান", "common.filter": "ফিল্টার", "common.download": "ডাউনলোড", "common.upload": "আপলোড",
  "common.loading": "লোড হচ্ছে...", "common.no_data": "কোনো তথ্য পাওয়া যায়নি", "common.total": "মোট",
  "common.status": "অবস্থা", "common.date": "তারিখ", "common.amount": "পরিমাণ", "common.actions": "কার্যক্রম",
  "common.name": "নাম", "common.phone": "ফোন", "common.email": "ইমেল", "common.address": "ঠিকানা",
  "common.all": "সব", "common.paid": "পরিশোধিত", "common.unpaid": "বকেয়া", "common.draft": "খসড়া", "common.sent": "পাঠানো",
  "common.logout": "লগআউট",
  "dashboard.total_invoices": "মোট বিল", "dashboard.total_revenue": "মোট আয়",
  "dashboard.pending_amount": "বকেয়া পরিমাণ", "dashboard.total_customers": "মোট পার্টি",
  "dashboard.recent_invoices": "সাম্প্রতিক বিল",
  "invoice.invoice_number": "বিল নম্বর", "invoice.customer": "পার্টি", "invoice.grand_total": "মোট",
  "invoice.tax_amount": "ট্যাক্স", "invoice.subtotal": "উপ-মোট", "invoice.due_date": "শেষ তারিখ",
  "invoice.create_new": "নতুন বিল তৈরি",
};

const gu: TranslationMap = {
  "nav.dashboard": "ડેશબોર્ડ", "nav.my_firms": "મારી ફર્મ", "nav.customers": "પાર્ટી (બિલ ટુ)", "nav.products": "પ્રોડક્ટ",
  "nav.create_invoice": "બિલ બનાવો", "nav.invoices": "બિલ / ઇન્વોઇસ", "nav.quotations": "કોટેશન",
  "nav.credit_notes": "ક્રેડિટ નોટ", "nav.debit_notes": "ડેબિટ નોટ", "nav.purchase_bills": "ખરીદી બિલ",
  "nav.recurring_invoices": "રિકરિંગ બિલ", "nav.party_ledger": "ખાતા વહી", "nav.expenses": "ખર્ચ",
  "nav.profit_loss": "નફો અને નુકસાન", "nav.bill_manager": "બિલ મેનેજર", "nav.aging_report": "બાકી રિપોર્ટ",
  "nav.party_rates": "પાર્ટી રેટ", "nav.bulk_import": "બલ્ક ઇમ્પોર્ટ", "nav.reports": "રિપોર્ટ",
  "nav.employees": "કર્મચારી", "nav.salary_slips": "પગાર સ્લિપ", "nav.attendance": "હાજરી",
  "nav.gstr_reports": "GSTR રિપોર્ટ", "nav.gstr_2b": "GSTR-2B મેળ",
  "nav.leads": "લીડ્સ", "nav.follow_ups": "ફોલો-અપ", "nav.email_templates": "ઇમેલ ટેમ્પલેટ",
  "nav.greeting_cards": "શુભેચ્છા કાર્ડ", "nav.documents": "દસ્તાવેજ", "nav.document_history": "દસ્તાવેજ ઇતિહાસ",
  "nav.settings": "સેટિંગ્સ", "nav.inventory": "સ્ટોક", "nav.eway_bills": "ઇ-વે બિલ",
  "nav.barcode_scanner": "બારકોડ સ્કેનર", "nav.pos_receipt": "POS રસીદ", "nav.customer_portal": "ગ્રાહક પોર્ટલ", "nav.business_card": "વિઝિટિંગ કાર્ડ", "nav.cash_book": "કેશ બુક",
  "common.save": "સાચવો", "common.cancel": "રદ કરો", "common.delete": "કાઢી નાખો", "common.edit": "સંપાદિત", "common.add": "ઉમેરો",
  "common.search": "શોધો", "common.filter": "ફિલ્ટર", "common.download": "ડાઉનલોડ", "common.upload": "અપલોડ",
  "common.loading": "લોડ થઈ રહ્યું છે...", "common.no_data": "કોઈ ડેટા મળ્યો નથી", "common.total": "કુલ",
  "common.logout": "લૉગઆઉટ",
  "dashboard.total_invoices": "કુલ બિલ", "dashboard.total_revenue": "કુલ આવક",
  "invoice.invoice_number": "બિલ નંબર", "invoice.create_new": "નવું બિલ બનાવો",
};

const mr: TranslationMap = {
  "nav.dashboard": "डॅशबोर्ड", "nav.my_firms": "माझ्या फर्म", "nav.customers": "पार्टी (बिल टू)", "nav.products": "उत्पादने",
  "nav.create_invoice": "बिल तयार करा", "nav.invoices": "बिल / इनव्हॉइस", "nav.quotations": "कोटेशन",
  "nav.credit_notes": "क्रेडिट नोट", "nav.debit_notes": "डेबिट नोट", "nav.purchase_bills": "खरेदी बिल",
  "nav.recurring_invoices": "रिकरिंग बिल", "nav.party_ledger": "खाते वही", "nav.expenses": "खर्च",
  "nav.profit_loss": "नफा आणि तोटा", "nav.bill_manager": "बिल व्यवस्थापक", "nav.aging_report": "थकबाकी अहवाल",
  "nav.party_rates": "पार्टी दर", "nav.bulk_import": "बल्क इम्पोर्ट", "nav.reports": "अहवाल",
  "nav.employees": "कर्मचारी", "nav.salary_slips": "पगार स्लिप", "nav.attendance": "हजेरी",
  "nav.gstr_reports": "GSTR अहवाल", "nav.gstr_2b": "GSTR-2B जुळणी",
  "nav.leads": "लीड्स", "nav.follow_ups": "फॉलो-अप", "nav.email_templates": "ईमेल टेम्पलेट",
  "nav.greeting_cards": "शुभेच्छा पत्रिका", "nav.documents": "कागदपत्रे", "nav.document_history": "कागदपत्रे इतिहास",
  "nav.settings": "सेटिंग्ज", "nav.inventory": "स्टॉक", "nav.eway_bills": "ई-वे बिल",
  "nav.barcode_scanner": "बारकोड स्कॅनर", "nav.pos_receipt": "POS पावती", "nav.customer_portal": "ग्राहक पोर्टल", "nav.business_card": "व्हिजिटिंग कार्ड", "nav.cash_book": "रोखपाल",
  "common.save": "जतन करा", "common.cancel": "रद्द करा", "common.delete": "हटवा", "common.edit": "संपादित करा", "common.add": "जोडा",
  "common.search": "शोधा", "common.filter": "फिल्टर", "common.download": "डाउनलोड", "common.upload": "अपलोड",
  "common.loading": "लोड होत आहे...", "common.no_data": "कोणताही डेटा सापडला नाही", "common.total": "एकूण",
  "common.logout": "लॉगआउट",
  "dashboard.total_invoices": "एकूण बिले", "dashboard.total_revenue": "एकूण महसूल",
  "invoice.invoice_number": "बिल क्रमांक", "invoice.create_new": "नवीन बिल तयार करा",
};

const ta: TranslationMap = {
  "nav.dashboard": "டாஷ்போர்டு", "nav.my_firms": "எனது நிறுவனங்கள்", "nav.customers": "வாடிக்கையாளர்", "nav.products": "பொருட்கள்",
  "nav.create_invoice": "பில் உருவாக்கு", "nav.invoices": "பில்கள்", "nav.quotations": "மேற்கோள்",
  "nav.credit_notes": "கடன் குறிப்பு", "nav.debit_notes": "பற்று குறிப்பு", "nav.purchase_bills": "கொள்முதல் பில்",
  "nav.recurring_invoices": "தொடர் பில்", "nav.party_ledger": "கணக்கு புத்தகம்", "nav.expenses": "செலவுகள்",
  "nav.profit_loss": "லாபம் மற்றும் நஷ்டம்", "nav.bill_manager": "பில் மேலாளர்", "nav.aging_report": "நிலுவை அறிக்கை",
  "nav.party_rates": "வாடிக்கையாளர் விலை", "nav.bulk_import": "மொத்த இறக்குமதி", "nav.reports": "அறிக்கைகள்",
  "nav.employees": "ஊழியர்கள்", "nav.salary_slips": "சம்பள சீட்டு", "nav.attendance": "வருகை",
  "nav.gstr_reports": "GSTR அறிக்கை", "nav.gstr_2b": "GSTR-2B ஒப்பீடு",
  "nav.leads": "லீட்கள்", "nav.follow_ups": "பின்தொடர்", "nav.email_templates": "மின்னஞ்சல் வார்ப்புரு",
  "nav.greeting_cards": "வாழ்த்து அட்டை", "nav.documents": "ஆவணங்கள்", "nav.document_history": "ஆவண வரலாறு",
  "nav.settings": "அமைப்புகள்", "nav.inventory": "சரக்கு", "nav.eway_bills": "ஈ-வே பில்",
  "nav.barcode_scanner": "பார்கோடு ஸ்கேனர்", "nav.pos_receipt": "POS ரசீது", "nav.customer_portal": "வாடிக்கையாளர் போர்ட்டல்", "nav.business_card": "விசிட்டிங் கார்டு", "nav.cash_book": "கேஷ் புக்",
  "common.save": "சேமி", "common.cancel": "ரத்து", "common.delete": "நீக்கு", "common.edit": "திருத்து", "common.add": "சேர்",
  "common.search": "தேடு", "common.download": "பதிவிறக்கு", "common.upload": "பதிவேற்று",
  "common.loading": "ஏற்றுகிறது...", "common.no_data": "தரவு இல்லை", "common.total": "மொத்தம்",
  "common.logout": "வெளியேறு",
  "dashboard.total_invoices": "மொத்த பில்கள்", "dashboard.total_revenue": "மொத்த வருவாய்",
  "invoice.invoice_number": "பில் எண்", "invoice.create_new": "புதிய பில் உருவாக்கு",
};

const te: TranslationMap = {
  "nav.dashboard": "డాష్‌బోర్డ్", "nav.my_firms": "నా సంస్థలు", "nav.customers": "పార్టీ (బిల్ టు)", "nav.products": "ఉత్పత్తులు",
  "nav.create_invoice": "బిల్ సృష్టించు", "nav.invoices": "బిల్లులు", "nav.quotations": "కోటేషన్",
  "nav.credit_notes": "క్రెడిట్ నోట్", "nav.debit_notes": "డెబిట్ నోట్", "nav.purchase_bills": "కొనుగోలు బిల్లు",
  "nav.party_ledger": "ఖాతా పుస్తకం", "nav.expenses": "ఖర్చులు",
  "nav.profit_loss": "లాభనష్టాలు", "nav.reports": "నివేదికలు",
  "nav.employees": "ఉద్యోగులు", "nav.salary_slips": "జీతం స్లిప్",
  "nav.settings": "సెట్టింగ్‌లు", "nav.inventory": "స్టాక్",
  "common.save": "సేవ్", "common.cancel": "రద్దు", "common.delete": "తొలగించు",
  "common.search": "వెతుకు", "common.total": "మొత్తం", "common.logout": "లాగ్ అవుట్",
  "dashboard.total_invoices": "మొత్తం బిల్లులు", "invoice.invoice_number": "బిల్ నంబర్",
};

const kn: TranslationMap = {
  "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "nav.my_firms": "ನನ್ನ ಸಂಸ್ಥೆಗಳು", "nav.customers": "ಪಾರ್ಟಿ (ಬಿಲ್ ಟು)", "nav.products": "ಉತ್ಪನ್ನಗಳು",
  "nav.create_invoice": "ಬಿಲ್ ರಚಿಸಿ", "nav.invoices": "ಬಿಲ್‌ಗಳು", "nav.quotations": "ಕೋಟೇಶನ್",
  "nav.credit_notes": "ಕ್ರೆಡಿಟ್ ನೋಟ್", "nav.debit_notes": "ಡೆಬಿಟ್ ನೋಟ್", "nav.purchase_bills": "ಖರೀದಿ ಬಿಲ್",
  "nav.party_ledger": "ಖಾತೆ ಪುಸ್ತಕ", "nav.expenses": "ಖರ್ಚುಗಳು",
  "nav.profit_loss": "ಲಾಭ ಮತ್ತು ನಷ್ಟ", "nav.reports": "ವರದಿಗಳು",
  "nav.employees": "ಉದ್ಯೋಗಿಗಳು", "nav.salary_slips": "ಸಂಬಳ ಚೀಟಿ",
  "nav.settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", "nav.inventory": "ಸ್ಟಾಕ್",
  "common.save": "ಉಳಿಸಿ", "common.cancel": "ರದ್ದುಮಾಡಿ", "common.delete": "ಅಳಿಸಿ",
  "common.search": "ಹುಡುಕಿ", "common.total": "ಒಟ್ಟು", "common.logout": "ಲಾಗ್ ಔಟ್",
  "dashboard.total_invoices": "ಒಟ್ಟು ಬಿಲ್‌ಗಳು", "invoice.invoice_number": "ಬಿಲ್ ಸಂಖ್ಯೆ",
};

const ml: TranslationMap = {
  "nav.dashboard": "ഡാഷ്‌ബോർഡ്", "nav.my_firms": "എന്റെ സ്ഥാപനങ്ങൾ", "nav.customers": "പാർട്ടി (ബിൽ ടു)", "nav.products": "ഉൽപ്പന്നങ്ങൾ",
  "nav.create_invoice": "ബിൽ ഉണ്ടാക്കുക", "nav.invoices": "ബില്ലുകൾ", "nav.quotations": "ക്വോട്ടേഷൻ",
  "nav.credit_notes": "ക്രെഡിറ്റ് നോട്ട്", "nav.debit_notes": "ഡെബിറ്റ് നോട്ട്", "nav.purchase_bills": "വാങ്ങൽ ബിൽ",
  "nav.party_ledger": "കണക്ക് പുസ്തകം", "nav.expenses": "ചെലവുകൾ",
  "nav.profit_loss": "ലാഭനഷ്ടം", "nav.reports": "റിപ്പോർട്ടുകൾ",
  "nav.employees": "ജീവനക്കാർ", "nav.salary_slips": "ശമ്പള സ്ലിപ്പ്",
  "nav.settings": "ക്രമീകരണങ്ങൾ", "nav.inventory": "സ്റ്റോക്ക്",
  "common.save": "സേവ്", "common.cancel": "റദ്ദാക്കുക", "common.delete": "ഇല്ലാതാക്കുക",
  "common.search": "തിരയുക", "common.total": "ആകെ", "common.logout": "ലോഗൗട്ട്",
  "dashboard.total_invoices": "ആകെ ബില്ലുകൾ", "invoice.invoice_number": "ബിൽ നമ്പർ",
};

const pa: TranslationMap = {
  "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ", "nav.my_firms": "ਮੇਰੀਆਂ ਫਰਮਾਂ", "nav.customers": "ਪਾਰਟੀ (ਬਿੱਲ ਟੂ)", "nav.products": "ਉਤਪਾਦ",
  "nav.create_invoice": "ਬਿੱਲ ਬਣਾਓ", "nav.invoices": "ਬਿੱਲ / ਇਨਵੋਇਸ", "nav.quotations": "ਕੋਟੇਸ਼ਨ",
  "nav.credit_notes": "ਕ੍ਰੈਡਿਟ ਨੋਟ", "nav.debit_notes": "ਡੈਬਿਟ ਨੋਟ", "nav.purchase_bills": "ਖਰੀਦ ਬਿੱਲ",
  "nav.party_ledger": "ਖਾਤਾ ਬਹੀ", "nav.expenses": "ਖਰਚੇ",
  "nav.profit_loss": "ਲਾਭ ਅਤੇ ਘਾਟਾ", "nav.reports": "ਰਿਪੋਰਟਾਂ",
  "nav.employees": "ਕਰਮਚਾਰੀ", "nav.salary_slips": "ਤਨਖਾਹ ਸਲਿੱਪ",
  "nav.settings": "ਸੈਟਿੰਗਾਂ", "nav.inventory": "ਸਟਾਕ",
  "common.save": "ਸੇਵ ਕਰੋ", "common.cancel": "ਰੱਦ ਕਰੋ", "common.delete": "ਮਿਟਾਓ",
  "common.search": "ਖੋਜੋ", "common.total": "ਕੁੱਲ", "common.logout": "ਲੌਗਆਊਟ",
  "dashboard.total_invoices": "ਕੁੱਲ ਬਿੱਲ", "invoice.invoice_number": "ਬਿੱਲ ਨੰਬਰ",
};

const ur: TranslationMap = {
  "nav.dashboard": "ڈیش بورڈ", "nav.my_firms": "میری فرمیں", "nav.customers": "پارٹی (بل ٹو)", "nav.products": "پروڈکٹ",
  "nav.create_invoice": "بل بنائیں", "nav.invoices": "بل / انوائس", "nav.quotations": "کوٹیشن",
  "nav.credit_notes": "کریڈٹ نوٹ", "nav.debit_notes": "ڈیبٹ نوٹ", "nav.purchase_bills": "خریداری بل",
  "nav.party_ledger": "کھاتا بہی", "nav.expenses": "اخراجات",
  "nav.profit_loss": "نفع اور نقصان", "nav.reports": "رپورٹیں",
  "nav.employees": "ملازمین", "nav.salary_slips": "تنخواہ سلپ",
  "nav.settings": "ترتیبات", "nav.inventory": "اسٹاک",
  "common.save": "محفوظ کریں", "common.cancel": "منسوخ", "common.delete": "حذف کریں",
  "common.search": "تلاش", "common.total": "کل", "common.logout": "لاگ آؤٹ",
  "dashboard.total_invoices": "کل بل", "invoice.invoice_number": "بل نمبر",
};

const or_lang: TranslationMap = {
  "nav.dashboard": "ଡ୍ୟାସବୋର୍ଡ", "nav.my_firms": "ମୋ ଫର୍ମ", "nav.customers": "ପାର୍ଟି", "nav.products": "ଉତ୍ପାଦ",
  "nav.create_invoice": "ବିଲ ତିଆରି କରନ୍ତୁ", "nav.invoices": "ବିଲ", "nav.quotations": "କୋଟେସନ",
  "nav.party_ledger": "ଖାତା ବହି", "nav.expenses": "ଖର୍ଚ୍ଚ",
  "nav.profit_loss": "ଲାଭ ଏବଂ କ୍ଷତି", "nav.reports": "ରିପୋର୍ଟ",
  "nav.employees": "କର୍ମଚାରୀ", "nav.settings": "ସେଟିଂସ",
  "common.save": "ସେଭ", "common.cancel": "ବାତିଲ", "common.total": "ମୋଟ", "common.logout": "ଲଗଆଉଟ",
  "dashboard.total_invoices": "ମୋଟ ବିଲ", "invoice.invoice_number": "ବିଲ ନମ୍ବର",
};

const as_lang: TranslationMap = {
  "nav.dashboard": "ডেশ্ববৰ্ড", "nav.my_firms": "মোৰ ফাৰ্ম", "nav.customers": "পাৰ্টি", "nav.products": "সামগ্ৰী",
  "nav.create_invoice": "বিল তৈয়াৰ কৰক", "nav.invoices": "বিল", "nav.quotations": "কোটেচন",
  "nav.party_ledger": "খাতা বহী", "nav.expenses": "খৰচ",
  "nav.profit_loss": "লাভ আৰু লোকচান", "nav.reports": "প্ৰতিবেদন",
  "nav.employees": "কৰ্মচাৰী", "nav.settings": "ছেটিংছ",
  "common.save": "সংৰক্ষণ", "common.cancel": "বাতিল", "common.total": "মুঠ", "common.logout": "লগ আউট",
  "dashboard.total_invoices": "মুঠ বিল", "invoice.invoice_number": "বিল নম্বৰ",
};

export const translations: Record<Language, TranslationMap> = {
  en, hi, bn, gu, mr, ta, te, kn, ml, pa, ur, or: or_lang, as: as_lang,
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
