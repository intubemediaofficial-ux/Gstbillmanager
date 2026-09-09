"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Printer, Download, Share2, Mail, ArrowLeft, Loader2, FileText, CreditCard } from "lucide-react";
import type { Invoice, BusinessSettings } from "@/lib/gst-types";
import { INVOICE_TYPE_LABELS } from "@/lib/gst-types";
import { formatCurrency, formatDate, numberToWords } from "@/lib/gst-utils";
import { ClassicTemplate, MinimalTemplate, CorporateTemplate } from "@/components/InvoiceTemplates";

function InvoiceViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const adminUserId = searchParams.get("userId");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const invoiceRef = useRef<HTMLDivElement>(null);
  const autoPdf = searchParams.get("auto") === "pdf";

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current || !id) return;
    didFetch.current = true;
    const invoiceUrl = adminUserId
      ? `/api/invoices?id=${id}&adminUserId=${adminUserId}`
      : `/api/invoices?id=${id}`;
    Promise.all([
      fetch(invoiceUrl).then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()).catch(() => ({ id: "" })),
      adminUserId ? Promise.resolve({ data: [] }) : fetch("/api/firms").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([iRes, sRes, meRes, fRes]) => {
      const inv = iRes.data || null;
      // Fill fields missing from the stored firm snapshot (e.g. accountHolder
      // added later) from the live firm record, so older invoices pick up new
      // firm details without needing to be re-edited.
      if (inv?.firm) {
        const live = (fRes.data || []).find((f: { id: string; accountHolder?: string }) => f.id === inv.firm.id);
        if (live?.accountHolder && !inv.firm.accountHolder) inv.firm.accountHolder = live.accountHolder;
      }
      setInvoice(inv);
      setSettings(sRes.data || null);
      setCurrentUserId(adminUserId || meRes.id || "");
    }).finally(() => setLoading(false));
  }, [id, adminUserId]);

  // Auto-download PDF when ?auto=pdf is set (for bulk download)
  const autoPdfTriggered = useRef(false);
  useEffect(() => {
    if (autoPdf && invoice && !loading && invoiceRef.current && !autoPdfTriggered.current) {
      autoPdfTriggered.current = true;
      setTimeout(() => { handlePDF(); }, 500);
    }
  });

  const handlePrint = () => window.print();

  const handlePDF = async () => {
    if (!invoice || !invoiceRef.current) return;
    setPdfLoading(true);
    try {
      const { elementToPdf } = await import("@/lib/pdf-utils");
      const custName = invoice.customer.name.replace(/[^a-zA-Z0-9\u0900-\u097F\u0600-\u06FF ]/g, "").trim().replace(/\s+/g, "_");
      await elementToPdf(invoiceRef.current, `${invoice.invoiceNumber.replace(/[\/\s]/g, "_")}_${custName}.pdf`);
    } catch {
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!invoice) return;
    const text = `*${invoice.firm?.name || "GST Bill Manager"}*\n\n📄 Invoice: *${invoice.invoiceNumber}*\n👤 Customer: ${invoice.customer.name}\n💰 Amount: *${formatCurrency(invoice.grandTotal)}*\n📅 Date: ${formatDate(invoice.date)}\n\n🔗 View Invoice: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = () => {
    if (!invoice) return;
    const subject = `Invoice ${invoice.invoiceNumber} - ${invoice.firm?.name || settings?.companyName || "GST Bill"}`;
    const body = `Dear ${invoice.customer.name},\n\nPlease find the invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.grandTotal)}\nDate: ${formatDate(invoice.date)}\nDue Date: ${invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}\n\nView Invoice: ${window.location.href}\n\nThank you for your business.\n\n${invoice.firm?.name || settings?.companyName || ""}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handlePaymentLink = () => {
    if (!invoice) return;
    const firmName = invoice.firm?.name || settings?.companyName || "Business";
    const balance = invoice.grandTotal - (invoice.amountPaid || 0);
    const upiId = settings?.bankName ? `${settings.bankName}@upi` : "";
    if (upiId) {
      const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(firmName)}&am=${balance.toFixed(2)}&tn=${encodeURIComponent(`Payment for Invoice ${invoice.invoiceNumber}`)}&cu=INR`;
      const text = `*${firmName}*\n\n📄 Invoice: *${invoice.invoiceNumber}*\n💰 Amount Due: *${formatCurrency(balance)}*\n\n💳 Pay via UPI:\n${upiLink}\n\nOr scan the QR code on the invoice.`;
      window.open(`https://wa.me/${invoice.customer.phone || ""}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      const accHolder = invoice.firm?.accountHolder || settings?.accountHolder || "";
      const text = `*${firmName}*\n\n📄 Invoice: *${invoice.invoiceNumber}*\n💰 Amount Due: *${formatCurrency(balance)}*\n\n🏦 Bank Details:\n${accHolder ? `A/c Holder: ${accHolder}\n` : ""}Bank: ${invoice.firm?.bankName || settings?.bankName || ""}\nA/C: ${invoice.firm?.accountNumber || settings?.accountNumber || ""}\nIFSC: ${invoice.firm?.ifscCode || settings?.ifscCode || ""}\n\nPlease pay and share the reference number.`;
      window.open(`https://wa.me/${invoice.customer.phone || ""}?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleWord = async () => {
    if (!invoice || !invoiceRef.current) return;
    setWordLoading(true);
    try {
      // Helper: convert image URL to base64
      const imgToBase64 = async (src: string): Promise<string> => {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = src; });
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 200;
          canvas.height = img.naturalHeight || 200;
          const ctx = canvas.getContext("2d");
          if (ctx) { ctx.drawImage(img, 0, 0); return canvas.toDataURL("image/png"); }
        } catch { /* fallback */ }
        try {
          const resp = await fetch(src);
          const blob = await resp.blob();
          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch { return src; }
      };

      // Get base64 images
      const logoB64 = firmLogo ? await imgToBase64(firmLogo) : "";
      const sigB64 = invoice.signature?.imageData ? await imgToBase64(invoice.signature.imageData) : "";
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://gstbillmanager.com/verify?id=${invoice.id}&uid=${invoice.userId}`)}`;
      const qrB64 = await imgToBase64(qrUrl);

      // Build items rows
      const itemRows = invoice.items.map((item, idx) => {
        const itemTax = item.cgst + item.sgst + item.igst;
        const lineTotal = item.amount + itemTax;
        const bgColor = idx % 2 === 0 ? "#ffffff" : "#f8fafd";
        let row = `<tr>`;
        row += `<td style="padding:8px 6px;text-align:center;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${idx + 1}</td>`;
        row += `<td style="padding:8px 6px;border:1px solid #e2e8f0;font-weight:600;font-size:11px;background-color:${bgColor};">${item.description}</td>`;
        if (cv.hsn) row += `<td style="padding:8px 6px;text-align:center;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${item.hsn || ""}</td>`;
        if (cv.qty) row += `<td style="padding:8px 6px;text-align:center;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${item.qty}${cv.unit ? ` ${item.unit}` : ""}</td>`;
        if (cv.rate) row += `<td style="padding:8px 6px;text-align:right;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${formatCurrency(item.rate)}</td>`;
        if (cv.taxableAmount) row += `<td style="padding:8px 6px;text-align:right;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${formatCurrency(item.amount)}</td>`;
        if (cv.gstRate) {
          if (!invoice.isInterState) {
            row += `<td style="padding:8px 6px;text-align:center;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${item.gstRate / 2}%</td>`;
            row += `<td style="padding:8px 6px;text-align:center;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${item.gstRate / 2}%</td>`;
          } else {
            row += `<td style="padding:8px 6px;text-align:center;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${item.gstRate}%</td>`;
          }
        }
        row += `<td style="padding:8px 6px;text-align:right;border:1px solid #e2e8f0;font-size:11px;background-color:${bgColor};">${formatCurrency(itemTax)}</td>`;
        row += `<td style="padding:8px 6px;text-align:right;border:1px solid #e2e8f0;font-weight:700;font-size:11px;background-color:${bgColor};">${formatCurrency(lineTotal)}</td>`;
        row += `</tr>`;
        return row;
      }).join("");

      // Build table header columns
      let headerCols = `<td style="padding:8px 4px;text-align:center;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">Sr</td>`;
      headerCols += `<td style="padding:8px 4px;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">Description</td>`;
      if (cv.hsn) headerCols += `<td style="padding:8px 4px;text-align:center;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">HSN</td>`;
      if (cv.qty) headerCols += `<td style="padding:8px 4px;text-align:center;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">Qty</td>`;
      if (cv.rate) headerCols += `<td style="padding:8px 4px;text-align:right;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">Rate</td>`;
      if (cv.taxableAmount) headerCols += `<td style="padding:8px 4px;text-align:right;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">Amount</td>`;
      if (cv.gstRate) {
        if (!invoice.isInterState) {
          headerCols += `<td style="padding:8px 4px;text-align:center;background-color:#122a4e;color:white;font-weight:700;font-size:9px;border:1px solid #0a1628;">CGST%</td>`;
          headerCols += `<td style="padding:8px 4px;text-align:center;background-color:#122a4e;color:white;font-weight:700;font-size:9px;border:1px solid #0a1628;">SGST%</td>`;
        } else {
          headerCols += `<td style="padding:8px 4px;text-align:center;background-color:#122a4e;color:white;font-weight:700;font-size:9px;border:1px solid #0a1628;">IGST%</td>`;
        }
      }
      headerCols += `<td style="padding:8px 4px;text-align:right;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">Tax ₹</td>`;
      headerCols += `<td style="padding:8px 4px;text-align:right;background-color:#122a4e;color:white;font-weight:700;font-size:10px;border:1px solid #0a1628;">Total ₹</td>`;

      // GST totals
      let gstTotals = "";
      if (firmIsGst && cv.gstRate) {
        if (!invoice.isInterState) {
          gstTotals = `<tr><td colspan="2" style="padding:6px 16px;text-align:right;font-weight:600;color:#666;font-size:12px;border-bottom:1px solid #e5e7eb;">CGST @ ${invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 0}%</td><td style="padding:6px 16px;text-align:right;font-weight:700;font-size:12px;border-bottom:1px solid #e5e7eb;">${formatCurrency(invoice.totalCgst)}</td></tr>
          <tr><td colspan="2" style="padding:6px 16px;text-align:right;font-weight:600;color:#666;font-size:12px;border-bottom:1px solid #e5e7eb;">SGST @ ${invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 0}%</td><td style="padding:6px 16px;text-align:right;font-weight:700;font-size:12px;border-bottom:1px solid #e5e7eb;">${formatCurrency(invoice.totalSgst)}</td></tr>`;
        } else {
          gstTotals = `<tr><td colspan="2" style="padding:6px 16px;text-align:right;font-weight:600;color:#666;font-size:12px;border-bottom:1px solid #e5e7eb;">IGST @ ${invoice.items[0]?.gstRate || 0}%</td><td style="padding:6px 16px;text-align:right;font-weight:700;font-size:12px;border-bottom:1px solid #e5e7eb;">${formatCurrency(invoice.totalIgst)}</td></tr>`;
        }
      }

      // Badge helper - creates a simple inline badge (no nested table to avoid breaking table-layout:fixed)
      const sectionTitle = (_letter: string, _color: string, title: string, bg: string = "#ffffff") => `<p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#122a4e;text-transform:uppercase;letter-spacing:2px;background-color:${bg};">${title}</p>`;

      // Seller details rows (explicit white backgrounds for Word compatibility)
      const wCell = "background-color:#ffffff;word-wrap:break-word;word-break:break-word;";
      let sellerRows = `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;white-space:nowrap;${wCell}">Name</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;font-weight:700;color:#111;font-size:13px;${wCell}">${firmName}</td></tr>`;
      if (firmAddress) sellerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">Address</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#333;font-size:12px;${wCell}">${firmAddress}${firmCity ? `, ${firmCity}` : ""}${firmState ? `, ${firmState}` : ""}, India</td></tr>`;
      if (firmGstin) sellerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">GSTIN</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#222;font-weight:600;font-size:12px;${wCell}">${firmGstin}</td></tr>`;
      if (firmPan) sellerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">PAN</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#222;font-weight:600;font-size:12px;${wCell}">${firmPan}</td></tr>`;
      if (firmPhone) sellerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">Contact</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#333;font-size:12px;${wCell}">${firmPhone}</td></tr>`;
      if (firmEmail) sellerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">Email</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#333;font-size:12px;${wCell}">${firmEmail}</td></tr>`;

      // Buyer details rows (explicit white backgrounds for Word compatibility)
      let buyerRows = `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;white-space:nowrap;${wCell}">Name</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;font-weight:700;color:#111;font-size:13px;${wCell}">${invoice.customer.name}</td></tr>`;
      if (invoice.customer.address) buyerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">Address</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#333;font-size:12px;${wCell}">${invoice.customer.address}${invoice.customer.city ? `, ${invoice.customer.city}` : ""}${invoice.customer.state ? `, ${invoice.customer.state}` : ""}, India</td></tr>`;
      if (invoice.customer.gstin) buyerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">GSTIN</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#222;font-weight:600;font-size:12px;${wCell}">${invoice.customer.gstin}</td></tr>`;
      if (invoice.customer.gstin && invoice.customer.gstin.length >= 12) buyerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">PAN</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#222;font-weight:600;font-size:12px;${wCell}">${invoice.customer.gstin.substring(2, 12)}</td></tr>`;
      if (invoice.customer.state) buyerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">State</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#333;font-size:12px;${wCell}">${invoice.customer.state}${invoice.customer.stateCode ? ` (${invoice.customer.stateCode})` : ""}</td></tr>`;
      if (invoice.customer.phone) buyerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">Contact</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#333;font-size:12px;${wCell}">${invoice.customer.phone}</td></tr>`;
      if (invoice.customer.email) buyerRows += `<tr><td style="padding:4px 0;font-weight:600;color:#555;font-size:12px;${wCell}">Email</td><td style="padding:4px 6px;color:#aaa;${wCell}">:</td><td style="padding:4px 0;color:#333;font-size:12px;${wCell}">${invoice.customer.email}</td></tr>`;

      // Terms or QR middle section
      let middleSection = "";
      if (firmIsGst && cv.gstRate) {
        const termsLines = invoice.terms ? invoice.terms.split("\n").map(l => `<li style="margin-bottom:4px;">${l}</li>`).join("") : `<li style="margin-bottom:4px;">Goods once sold will not be taken back.</li><li style="margin-bottom:4px;">Please make payment within the due date.</li><li style="margin-bottom:4px;">Interest @ 18% p.a. on overdue payments.</li>`;
        middleSection = `<td width="34%" style="width:6.2cm;padding:14px 16px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;vertical-align:top;background-color:#ffffff;">
          <p style="font-weight:700;font-size:10px;color:#122a4e;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px 0;">Terms &amp; Notes</p>
          <ul style="font-size:11px;color:#555;padding-left:16px;margin:0;line-height:1.6;">${termsLines}</ul>
        </td>`;
      } else {
        middleSection = `<td width="34%" style="width:6.2cm;padding:14px 16px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;vertical-align:top;text-align:center;background-color:#ffffff;">
          ${sectionTitle("Q", "#10b981", "QR Code")}
          <img src="${qrB64}" width="80" height="80" style="margin:8px auto;" />
          <p style="font-size:9px;color:#888;margin:4px 0 0 0;">Scan to verify &amp; download</p>
        </td>`;
      }

      // Payment details
      const accHolder = invoice.firm?.accountHolder || settings?.accountHolder || "";
      const bankName = invoice.firm?.bankName || settings?.bankName || "";
      const accNo = invoice.firm?.accountNumber || settings?.accountNumber || "";
      const ifsc = invoice.firm?.ifscCode || settings?.ifscCode || "";
      const branch = invoice.firm?.branchName || settings?.branchName || "";

      // Logo HTML
      const logoHtml = logoB64
        ? `<img src="${logoB64}" width="60" height="60" style="display:block;" />`
        : `<div style="width:50px;height:50px;background-color:#c9a84c;color:#0a1628;font-size:24px;font-weight:700;text-align:center;line-height:50px;font-family:Georgia,serif;">${firmName.charAt(0)}</div>`;

      // Build complete Word HTML
      const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
@page { size: A4; margin: 10mm 12mm; }
body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #333; }
table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
td { vertical-align: top; }
p { margin: 0; }
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="width:18.6cm;border-collapse:collapse;background-color:#ffffff;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<!-- HEADER -->
<tr>
<td style="background-color:#122a4e;padding:18px 24px;">
<table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
<tr>
<td width="60" style="width:60px;vertical-align:middle;background-color:#122a4e;">${logoHtml}</td>
<td style="vertical-align:middle;padding-left:14px;background-color:#122a4e;">
<p style="margin:0;font-size:24px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:2px;font-family:Georgia,serif;">${firmName}</p>
<p style="margin:6px 0 0 0;font-size:12px;font-weight:600;color:#c9a84c;text-transform:uppercase;letter-spacing:2px;">${INVOICE_TYPE_LABELS[invoice.invoiceType]}</p>
</td>
<td style="text-align:right;vertical-align:middle;background-color:#122a4e;">
<table style="border-collapse:collapse;margin-left:auto;"><tr><td style="border:2px solid #c9a84c;padding:6px 14px;color:#c9a84c;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;background-color:#122a4e;">Original for Recipient</td></tr></table>
</td>
</tr>
</table>
</td>
</tr>

<!-- SELLER + INVOICE DETAILS -->
<tr>
<td style="padding:0;background-color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" style="width:18.6cm;border-collapse:collapse;table-layout:fixed;">
<colgroup><col width="60%" style="width:11.2cm;" /><col width="40%" style="width:7.4cm;" /></colgroup>
<tr>
<td width="60%" style="width:11.2cm;padding:16px 24px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background-color:#ffffff;vertical-align:top;">
${sectionTitle("S", "#3b82f6", "Seller")}
<table style="border-collapse:collapse;table-layout:fixed;width:9.5cm;"><colgroup><col style="width:2cm;" /><col style="width:0.5cm;" /><col style="width:7cm;" /></colgroup><tbody>${sellerRows}</tbody></table>
</td>
<td width="40%" style="width:7.4cm;padding:16px 24px;background-color:#f0f4fa;border-bottom:1px solid #e2e8f0;vertical-align:top;">
${sectionTitle("I", "#3b82f6", "Invoice Details", "#f0f4fa")}
<table style="border-collapse:collapse;table-layout:fixed;width:5.5cm;"><colgroup><col style="width:2.5cm;" /><col style="width:0.5cm;" /><col style="width:2.5cm;" /></colgroup>
<tr><td style="padding:5px 0;font-weight:600;color:#555;font-size:12px;background-color:#f0f4fa;">Invoice No.</td><td style="padding:5px 8px;color:#aaa;background-color:#f0f4fa;">:</td><td style="padding:5px 0;font-weight:700;color:#111;font-size:14px;background-color:#f0f4fa;">${invoice.invoiceNumber}</td></tr>
<tr><td style="padding:5px 0;font-weight:600;color:#555;font-size:12px;background-color:#f0f4fa;">Invoice Date</td><td style="padding:5px 8px;color:#aaa;background-color:#f0f4fa;">:</td><td style="padding:5px 0;color:#333;font-size:12px;background-color:#f0f4fa;">${formatDate(invoice.date)}</td></tr>
${invoice.dueDate ? `<tr><td style="padding:5px 0;font-weight:600;color:#555;font-size:12px;background-color:#f0f4fa;">Due Date</td><td style="padding:5px 8px;color:#aaa;background-color:#f0f4fa;">:</td><td style="padding:5px 0;color:#333;font-size:12px;background-color:#f0f4fa;">${formatDate(invoice.dueDate)}</td></tr>` : ""}
${placeOfSupply ? `<tr><td style="padding:5px 0;font-weight:600;color:#555;font-size:12px;background-color:#f0f4fa;">Place of Supply</td><td style="padding:5px 8px;color:#aaa;background-color:#f0f4fa;">:</td><td style="padding:5px 0;color:#333;font-size:12px;background-color:#f0f4fa;">${placeOfSupply}</td></tr>` : ""}
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- BUYER -->
<tr>
<td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;background-color:#ffffff;">
${sectionTitle("B", "#3b82f6", "Buyer")}
<table style="border-collapse:collapse;table-layout:fixed;width:16cm;"><colgroup><col style="width:2cm;" /><col style="width:0.5cm;" /><col style="width:13.5cm;" /></colgroup><tbody>${buyerRows}</tbody></table>
</td>
</tr>

<!-- ITEMS TABLE -->
<tr>
<td style="padding:0;background-color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" style="width:18.6cm;border-collapse:collapse;table-layout:fixed;">
<tr>${headerCols}</tr>
${itemRows}
</table>
</td>
</tr>

<!-- SUBTOTAL + GST -->
<tr>
<td style="padding:0;background-color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" style="width:18.6cm;border-collapse:collapse;">
<tr style="background-color:#fafafa;"><td colspan="2" style="padding:10px 24px;text-align:right;font-weight:600;color:#555;font-size:12px;border-bottom:1px solid #e2e8f0;background-color:#fafafa;">Subtotal (Taxable Value)</td><td style="padding:10px 24px;text-align:right;font-weight:700;font-size:14px;border-bottom:1px solid #e2e8f0;width:160px;background-color:#fafafa;">${formatCurrency(invoice.subtotal)}</td></tr>
${gstTotals}
</table>
</td>
</tr>

<!-- GRAND TOTAL -->
<tr>
<td style="padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="width:18.6cm;border-collapse:collapse;table-layout:fixed;">
<colgroup><col width="55%" style="width:10.2cm;" /><col width="45%" style="width:8.4cm;" /></colgroup>
<tr>
<td width="55%" style="width:10.2cm;padding:14px 24px;background-color:#f0f4fa;border-top:2px solid #122a4e;vertical-align:top;">
<p style="margin:0 0 4px 0;font-size:10px;font-weight:700;color:#122a4e;text-transform:uppercase;letter-spacing:1px;">Amount in Words</p>
<p style="margin:0;font-size:14px;font-weight:600;font-style:italic;color:#122a4e;">${numberToWords(invoice.grandTotal)}</p>
</td>
<td width="45%" style="width:8.4cm;padding:14px 24px;background-color:#122a4e;text-align:right;border-top:2px solid #122a4e;vertical-align:middle;">
<p style="margin:0;"><span style="font-size:12px;font-weight:700;color:#c9a84c;text-transform:uppercase;letter-spacing:1px;">Grand Total&nbsp;&nbsp;</span><span style="font-size:26px;font-weight:800;color:#ffffff;">${formatCurrency(invoice.grandTotal)}</span></p>
</td>
</tr>
</table>
</td>
</tr>

<!-- PAYMENT + TERMS/QR + SIGNATURE -->
<tr>
<td style="padding:0;background-color:#ffffff;border-top:1px solid #e2e8f0;">
<table width="100%" cellpadding="0" cellspacing="0" style="width:18.6cm;border-collapse:collapse;table-layout:fixed;">
<colgroup><col width="33%" style="width:6.2cm;" /><col width="34%" style="width:6.2cm;" /><col width="33%" style="width:6.2cm;" /></colgroup>
<tr>
<td width="33%" style="width:6.2cm;padding:14px 16px;border-right:1px solid #e2e8f0;vertical-align:top;background-color:#ffffff;">
${sectionTitle("₹", "#10b981", "Payment Details")}
${bankName ? `<table style="border-collapse:collapse;font-size:11px;table-layout:fixed;width:4.5cm;">
${accHolder ? `<tr><td style="padding:3px 0;font-weight:600;color:#555;background-color:#ffffff;">A/c Holder</td><td style="padding:3px 6px;color:#aaa;background-color:#ffffff;">:</td><td style="padding:3px 0;color:#222;background-color:#ffffff;">${accHolder}</td></tr>` : ""}
<tr><td style="padding:3px 0;font-weight:600;color:#555;background-color:#ffffff;">Bank</td><td style="padding:3px 6px;color:#aaa;background-color:#ffffff;">:</td><td style="padding:3px 0;color:#222;background-color:#ffffff;">${bankName}</td></tr>
<tr><td style="padding:3px 0;font-weight:600;color:#555;background-color:#ffffff;">A/C No.</td><td style="padding:3px 6px;color:#aaa;background-color:#ffffff;">:</td><td style="padding:3px 0;color:#222;background-color:#ffffff;">${accNo}</td></tr>
<tr><td style="padding:3px 0;font-weight:600;color:#555;background-color:#ffffff;">IFSC</td><td style="padding:3px 6px;color:#aaa;background-color:#ffffff;">:</td><td style="padding:3px 0;color:#222;background-color:#ffffff;">${ifsc}</td></tr>
${branch ? `<tr><td style="padding:3px 0;font-weight:600;color:#555;background-color:#ffffff;">Branch</td><td style="padding:3px 6px;color:#aaa;background-color:#ffffff;">:</td><td style="padding:3px 0;color:#333;background-color:#ffffff;">${branch}</td></tr>` : ""}
</table>` : `<p style="color:#999;font-style:italic;font-size:11px;">Not provided</p>`}
</td>
${middleSection}
<td width="33%" style="width:6.2cm;padding:14px 16px;border-left:1px solid #e2e8f0;vertical-align:top;text-align:center;background-color:#ffffff;">
<p style="font-weight:700;font-size:10px;color:#122a4e;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px 0;">Authorized Signatory</p>
${sigB64 ? `<img src="${sigB64}" width="130" height="65" style="margin:8px auto;display:block;" />` : `<p style="border-bottom:1px dashed #ccc;width:80%;margin:30px auto 10px auto;">&nbsp;</p>`}
<p style="font-weight:700;font-size:12px;color:#111;margin:8px 0 2px 0;">${invoice.signature?.directorName || invoice.firm?.signatureText || settings?.signatureText || ""}</p>
<p style="font-size:10px;color:#555;margin:2px 0;">For ${firmName}</p>
<p style="font-size:9px;color:#888;font-style:italic;margin:2px 0;">Authorized Signatory</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- E-INVOICE QR -->
<tr>
<td style="padding:10px 24px;background-color:#fafafa;border-top:1px solid #e2e8f0;">
<table style="width:100%;border-collapse:collapse;">
<tr>
<td style="width:60px;background-color:#fafafa;"><img src="${qrB64}" width="50" height="50" /></td>
<td style="padding-left:12px;vertical-align:middle;background-color:#fafafa;">
<p style="margin:0;font-size:10px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:1px;">E-Invoice QR Code</p>
<p style="margin:3px 0 0 0;font-size:9px;color:#888;">Scan to verify invoice details</p>
</td>
<td style="text-align:right;vertical-align:middle;font-size:9px;color:#888;background-color:#fafafa;">IRN: ${invoice.id.substring(0, 16).toUpperCase()}</td>
</tr>
</table>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background-color:#122a4e;padding:10px 24px;text-align:center;">
<p style="margin:0;font-size:10px;color:#ffffff;letter-spacing:1px;">This is a Computer Generated Invoice &nbsp;&bull;&nbsp; E. &amp; O.E.</p>
</td>
</tr>
</table>
</body>
</html>`;

      const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword" });
      const custName = invoice.customer.name.replace(/[^a-zA-Z0-9\u0900-\u097F\u0600-\u06FF ]/g, "").trim().replace(/\s+/g, "_");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber.replace(/[\/\s]/g, "_")}_${custName}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export failed:", err);
    } finally {
      setWordLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
  if (!invoice) return <div className="text-center py-20 text-gray-400">Invoice not found</div>;

  const firmName = invoice.firm?.name || settings?.companyName || "Your Company";
  const firmAddress = invoice.firm?.address || settings?.address || "";
  const firmCity = invoice.firm?.city || settings?.city || "";
  const firmState = invoice.firm?.state || settings?.state || "";
  const firmGstin = invoice.firm?.gstin || settings?.gstin || "";
  const firmPan = invoice.firm?.pan || settings?.pan || "";
  const firmPhone = invoice.firm?.phone || settings?.phone || "";
  const firmEmail = invoice.firm?.email || "";
  const firmLogo = invoice.firm?.logo || "";
  const firmIsGst = invoice.firm?.isGst !== false;
  const hasLetterhead = !!invoice.letterhead;

  const placeOfSupply = invoice.customer.state
    ? `${invoice.customer.state}${invoice.customer.stateCode ? ` (${invoice.customer.stateCode})` : ""}`
    : "";

  const cv = {
    hsn: invoice.columnVisibility?.hsn !== false,
    qty: invoice.columnVisibility?.qty !== false,
    rate: invoice.columnVisibility?.rate !== false,
    taxableAmount: invoice.columnVisibility?.taxableAmount !== false,
    gstRate: invoice.columnVisibility?.gstRate !== false,
    unit: invoice.columnVisibility?.unit !== false,
  };

  // Compute column widths that sum to exactly 100% to prevent flex/table misalignment
  const colW = (() => {
    const sr = 4, hsn = 8, qty = 6, rate = 10, amount = 11, tax = 9, total = 11;
    const cgstSgst = 12, igst = 7;
    let used = sr + tax + total;
    if (cv.hsn) used += hsn;
    if (cv.qty) used += qty;
    if (cv.rate) used += rate;
    if (cv.taxableAmount) used += amount;
    if (cv.gstRate) used += invoice.isInterState ? igst : cgstSgst;
    const desc = 100 - used;
    return {
      sr: `${sr}%`, desc: `${desc}%`, hsn: `${hsn}%`, qty: `${qty}%`,
      rate: `${rate}%`, amount: `${amount}%`, cgst: "6%", sgst: "6%",
      igst: `${igst}%`, tax: `${tax}%`, total: `${total}%`,
    };
  })();

  return (
    <div>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handlePaymentLink} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium shadow-sm">
            <CreditCard className="w-4 h-4" /> Pay Link
          </button>
          <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm">
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={handleEmail} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
            <Mail className="w-4 h-4" /> Email
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium shadow-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handlePDF} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm disabled:opacity-50">
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {pdfLoading ? "Generating..." : "PDF"}
          </button>
          <button onClick={handleWord} disabled={wordLoading} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium shadow-sm disabled:opacity-50">
            {wordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} {wordLoading ? "Generating..." : "Word"}
          </button>
        </div>
      </div>

      {/* Invoice Template */}
      <div ref={invoiceRef} className="bg-white max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 relative overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {(invoice.template === "classic") ? (
        <ClassicTemplate invoice={invoice} settings={settings} currentUserId={currentUserId} cv={cv} />
      ) : (invoice.template === "minimal") ? (
        <MinimalTemplate invoice={invoice} settings={settings} currentUserId={currentUserId} cv={cv} />
      ) : (invoice.template === "corporate") ? (
        <CorporateTemplate invoice={invoice} settings={settings} currentUserId={currentUserId} cv={cv} />
      ) : (
      <div className="relative overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        {/* Google Fonts */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Letterhead background */}
        {hasLetterhead && (
          <div className="absolute inset-0 z-0 print:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={invoice.letterhead} alt="Letterhead" className="w-full h-full object-cover opacity-15 print:opacity-20" />
          </div>
        )}

        <div className="relative z-10 border border-gray-200 shadow-lg">
          {/* ═══ HEADER ═══ */}
          <div className="text-white px-7 py-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0a1628 0%, #122a4e 40%, #1a3f6f 70%, #2a5298 100%)" }}>
            <div className="flex items-center gap-5">
              {firmLogo ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firmLogo} alt={firmName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "linear-gradient(135deg, #c9a84c 0%, #f0d78c 50%, #c9a84c 100%)", color: "#0a1628" }}>
                  {firmName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", letterSpacing: "3px" }}>{firmName}</h1>
                <p className="text-sm mt-1 font-medium tracking-widest uppercase" style={{ color: "#c9a84c" }}>{INVOICE_TYPE_LABELS[invoice.invoiceType]}</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-md text-xs font-bold tracking-widest uppercase" style={{ border: "1.5px solid #c9a84c", color: "#c9a84c", background: "rgba(201, 168, 76, 0.08)" }}>
              Original for Recipient
            </div>
          </div>

          {/* ═══ SELLER + INVOICE DETAILS ═══ */}
          <div className="grid grid-cols-5 border-b border-gray-200">
            {/* Seller Details - 3 cols */}
            <div className="col-span-3 px-7 py-5 border-r border-gray-200">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #122a4e, #1a3f6f)" }}>
                  <span className="text-white text-[10px] font-bold">S</span>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", color: "#122a4e" }}>Seller</h3>
              </div>
              <table className="text-[13px] leading-relaxed">
                <tbody>
                  <tr><td className="pr-4 py-1 font-semibold text-gray-500 whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>Name</td><td className="px-2 text-gray-300">:</td><td className="py-1 font-bold text-gray-900" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: "14px" }}>{firmName}</td></tr>
                  {firmAddress && <tr><td className="pr-4 py-1 font-semibold text-gray-500">Address</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700">{firmAddress}{firmCity ? `, ${firmCity}` : ""}{firmState ? ` - ${firmState}` : ""}, India</td></tr>}
                  {firmGstin && <tr><td className="pr-4 py-1 font-semibold text-gray-500">GSTIN</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-800 font-mono font-semibold tracking-wide">{firmGstin}</td></tr>}
                  {firmPan && <tr><td className="pr-4 py-1 font-semibold text-gray-500">PAN</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-800 font-mono font-semibold tracking-wide">{firmPan}</td></tr>}
                  {firmState && <tr><td className="pr-4 py-1 font-semibold text-gray-500">State</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700">{firmState}</td></tr>}
                  {firmPhone && <tr><td className="pr-4 py-1 font-semibold text-gray-500">Contact</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700 font-medium">{firmPhone}</td></tr>}
                  {firmEmail && <tr><td className="pr-4 py-1 font-semibold text-gray-500">Email</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700">{firmEmail}</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Invoice Details - 2 cols */}
            <div className="col-span-2 px-6 py-5" style={{ background: "linear-gradient(180deg, #f0f4fa 0%, #e4ebf5 100%)" }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #122a4e, #1a3f6f)" }}>
                  <span className="text-white text-[10px] font-bold">I</span>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", color: "#122a4e" }}>Invoice Details</h3>
              </div>
              <table className="text-[13px] w-full leading-relaxed">
                <tbody>
                  <tr><td className="pr-4 py-1.5 font-semibold text-gray-500">Invoice No.</td><td className="px-2 text-gray-300">:</td><td className="py-1.5 font-bold text-gray-900 text-[15px]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{invoice.invoiceNumber}</td></tr>
                  <tr><td className="pr-4 py-1.5 font-semibold text-gray-500">Invoice Date</td><td className="px-2 text-gray-300">:</td><td className="py-1.5 text-gray-700 font-medium">{formatDate(invoice.date)}</td></tr>
                  {invoice.dueDate && <tr><td className="pr-4 py-1.5 font-semibold text-gray-500">Due Date</td><td className="px-2 text-gray-300">:</td><td className="py-1.5 text-gray-700 font-medium">{formatDate(invoice.dueDate)}</td></tr>}
                  {placeOfSupply && <tr><td className="pr-4 py-1.5 font-semibold text-gray-500">Place of Supply</td><td className="px-2 text-gray-300">:</td><td className="py-1.5 text-gray-700 font-medium">{placeOfSupply}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══ BILL TO ═══ */}
          <div className="px-7 py-5 border-b border-gray-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #122a4e, #1a3f6f)" }}>
                <span className="text-white text-[10px] font-bold">B</span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", color: "#122a4e" }}>Buyer</h3>
            </div>
            <table className="text-[13px] leading-relaxed">
              <tbody>
                <tr><td className="pr-4 py-1 font-semibold text-gray-500 whitespace-nowrap">Name</td><td className="px-2 text-gray-300">:</td><td className="py-1 font-bold text-gray-900" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: "14px" }}>{invoice.customer.name}</td></tr>
                {invoice.customer.address && <tr><td className="pr-4 py-1 font-semibold text-gray-500">Address</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700">{invoice.customer.address}{invoice.customer.city ? `, ${invoice.customer.city}` : ""}{invoice.customer.state ? `, ${invoice.customer.state}` : ""}, India</td></tr>}
                {invoice.customer.gstin && <tr><td className="pr-4 py-1 font-semibold text-gray-500">GSTIN</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-800 font-mono font-semibold tracking-wide">{invoice.customer.gstin}</td></tr>}
                {invoice.customer.gstin && invoice.customer.gstin.length >= 12 && <tr><td className="pr-4 py-1 font-semibold text-gray-500">PAN</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-800 font-mono font-semibold tracking-wide">{invoice.customer.gstin.substring(2, 12)}</td></tr>}
                {invoice.customer.state && <tr><td className="pr-4 py-1 font-semibold text-gray-500">State</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700">{invoice.customer.state}{invoice.customer.stateCode ? ` (${invoice.customer.stateCode})` : ""}</td></tr>}
                {invoice.customer.phone && <tr><td className="pr-4 py-1 font-semibold text-gray-500">Contact</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700 font-medium">{invoice.customer.phone}</td></tr>}
                {invoice.customer.email && <tr><td className="pr-4 py-1 font-semibold text-gray-500">Email</td><td className="px-2 text-gray-300">:</td><td className="py-1 text-gray-700">{invoice.customer.email}</td></tr>}
              </tbody>
            </table>
          </div>

          {/* ═══ ITEMS TABLE ═══ */}
          <div>
            {/* Header row as div for html2canvas compatibility */}
            <div className="flex text-white text-[11px] font-bold uppercase" style={{ background: "#122a4e", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
              <div className="py-3 text-center" style={{ width: colW.sr, minWidth: colW.sr }}>Sr</div>
              <div className="py-3 px-1 text-left" style={{ width: colW.desc, minWidth: colW.desc }}>Description</div>
              {cv.hsn && <div className="py-3 text-center" style={{ width: colW.hsn, minWidth: colW.hsn }}>HSN</div>}
              {cv.qty && <div className="py-3 text-center" style={{ width: colW.qty, minWidth: colW.qty }}>Qty</div>}
              {cv.rate && <div className="py-3 text-right px-1" style={{ width: colW.rate, minWidth: colW.rate }}>Rate</div>}
              {cv.taxableAmount && <div className="py-3 text-right px-1" style={{ width: colW.amount, minWidth: colW.amount }}>Amount</div>}
              {cv.gstRate && (!invoice.isInterState ? (
                <>
                  <div className="py-3 text-center text-[10px]" style={{ width: colW.cgst, minWidth: colW.cgst }}>CGST%</div>
                  <div className="py-3 text-center text-[10px]" style={{ width: colW.sgst, minWidth: colW.sgst }}>SGST%</div>
                </>
              ) : (
                <div className="py-3 text-center text-[10px]" style={{ width: colW.igst, minWidth: colW.igst }}>IGST%</div>
              ))}
              <div className="py-3 text-right px-1" style={{ width: colW.tax, minWidth: colW.tax }}>Tax ₹</div>
              <div className="py-3 text-right pr-4" style={{ width: colW.total, minWidth: colW.total }}>Total ₹</div>
            </div>
            <table className="w-full text-[11px]" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", tableLayout: "fixed", borderCollapse: "collapse", borderSpacing: "0" }}>
              <colgroup>
                <col style={{ width: colW.sr }} />
                <col style={{ width: colW.desc }} />
                {cv.hsn && <col style={{ width: colW.hsn }} />}
                {cv.qty && <col style={{ width: colW.qty }} />}
                {cv.rate && <col style={{ width: colW.rate }} />}
                {cv.taxableAmount && <col style={{ width: colW.amount }} />}
                {cv.gstRate && (!invoice.isInterState ? (<><col style={{ width: colW.cgst }} /><col style={{ width: colW.sgst }} /></>) : (<col style={{ width: colW.igst }} />))}
                <col style={{ width: colW.tax }} />
                <col style={{ width: colW.total }} />
              </colgroup>
              <tbody>
                {invoice.items.map((item, idx) => {
                  const itemTax = item.cgst + item.sgst + item.igst;
                  const lineTotal = item.amount + itemTax;
                  return (
                    <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-[#f8fafd]"} hover:bg-blue-50/30 transition-colors`}>
                      <td className="px-1 py-2.5 text-center border-r border-gray-100 font-semibold text-gray-600 text-[10px]">{idx + 1}</td>
                      <td className="px-1.5 py-2.5 border-r border-gray-100 font-semibold text-gray-900 text-[11px] break-words overflow-hidden">{item.description}</td>
                      {cv.hsn && <td className="px-1 py-2.5 text-center border-r border-gray-100 font-mono text-gray-600 font-medium text-[10px] break-all">{item.hsn}</td>}
                      {cv.qty && <td className="px-1 py-2.5 text-center border-r border-gray-100 font-medium text-gray-700 text-[10px]">{item.qty}{cv.unit ? ` ${item.unit}` : ""}</td>}
                      {cv.rate && <td className="px-1 py-2.5 text-right border-r border-gray-100 font-medium text-gray-700 text-[10px]">{formatCurrency(item.rate)}</td>}
                      {cv.taxableAmount && <td className="px-1 py-2.5 text-right border-r border-gray-100 font-semibold text-gray-800 text-[10px]">{formatCurrency(item.amount)}</td>}
                      {cv.gstRate && (!invoice.isInterState ? (
                        <>
                          <td className="px-1 py-2.5 text-center border-r border-gray-100 font-medium text-gray-600 text-[10px]">{item.gstRate / 2}%</td>
                          <td className="px-1 py-2.5 text-center border-r border-gray-100 font-medium text-gray-600 text-[10px]">{item.gstRate / 2}%</td>
                        </>
                      ) : (
                        <td className="px-1 py-2.5 text-center border-r border-gray-100 font-medium text-gray-600 text-[10px]">{item.gstRate}%</td>
                      ))}
                      <td className="px-1 py-2.5 text-right border-r border-gray-100 font-semibold text-gray-800 text-[10px]">
                        {formatCurrency(itemTax)}
                      </td>
                      <td className="px-2 pr-5 py-2.5 text-right font-bold text-gray-900 text-[11px]">{formatCurrency(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ═══ TOTALS ═══ */}
          <div className="border-t border-gray-200">
            <table className="w-full text-[13px]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <tbody>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-6 py-3 text-right font-semibold text-gray-500 uppercase tracking-wide text-[12px]" colSpan={2}>Subtotal (Taxable Value)</td>
                  <td className="px-6 pr-8 py-3 text-right font-bold w-44 text-gray-800" style={{ fontSize: "14px" }}>{formatCurrency(invoice.subtotal)}</td>
                </tr>
                {firmIsGst && cv.gstRate && (!invoice.isInterState ? (
                  <>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-2.5 text-right font-semibold text-gray-500 text-[12px]" colSpan={2}>CGST @ {invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 0}%</td>
                      <td className="px-6 pr-8 py-2.5 text-right font-bold w-44 text-gray-700">{formatCurrency(invoice.totalCgst)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-2.5 text-right font-semibold text-gray-500 text-[12px]" colSpan={2}>SGST @ {invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 0}%</td>
                      <td className="px-6 pr-8 py-2.5 text-right font-bold w-44 text-gray-700">{formatCurrency(invoice.totalSgst)}</td>
                    </tr>
                  </>
                ) : (
                  <tr className="border-b border-gray-100">
                    <td className="px-6 py-2.5 text-right font-semibold text-gray-500 text-[12px]" colSpan={2}>IGST @ {invoice.items[0]?.gstRate || 0}%</td>
                    <td className="px-6 pr-8 py-2.5 text-right font-bold w-44 text-gray-700">{formatCurrency(invoice.totalIgst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ═══ GRAND TOTAL + AMOUNT IN WORDS ═══ */}
          <div className="flex border-t-2" style={{ borderColor: "#122a4e" }}>
            <div className="flex-1 px-7 py-4" style={{ background: "linear-gradient(135deg, #f0f4fa 0%, #e8eef7 100%)" }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#122a4e" }}>Amount in Words</p>
              <p className="text-sm font-semibold italic" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#122a4e", lineHeight: "1.5" }}>{numberToWords(invoice.grandTotal)}</p>
            </div>
            <div className="px-8 py-4 flex items-center gap-5" style={{ background: "linear-gradient(135deg, #0a1628 0%, #122a4e 50%, #1a3f6f 100%)" }}>
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#c9a84c", fontFamily: "'Outfit', 'Inter', sans-serif" }}>Grand Total</span>
              <span className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>

          {/* ═══ BOTTOM: PAYMENT + TERMS + SIGNATURE ═══ */}
          <div className="grid grid-cols-3 border-t border-gray-200 text-[13px]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Payment Details */}
            <div className="px-5 py-5 border-r border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #122a4e, #1a3f6f)" }}>
                  <span className="text-white text-[9px] font-bold">₹</span>
                </div>
                <h4 className="font-bold uppercase text-[11px] tracking-widest" style={{ color: "#122a4e", fontFamily: "'Outfit', 'Inter', sans-serif" }}>Payment Details</h4>
              </div>
              {(invoice.firm?.bankName || settings?.bankName) ? (
                <table className="text-[12px] leading-relaxed">
                  <tbody>
                    {(invoice.firm?.accountHolder || settings?.accountHolder) && <tr><td className="pr-2 py-0.5 font-semibold text-gray-500">A/c Holder</td><td className="px-1.5 text-gray-300">:</td><td className="py-0.5 font-medium text-gray-800">{invoice.firm?.accountHolder || settings?.accountHolder}</td></tr>}
                    <tr><td className="pr-2 py-0.5 font-semibold text-gray-500">Bank</td><td className="px-1.5 text-gray-300">:</td><td className="py-0.5 font-medium text-gray-800">{invoice.firm?.bankName || settings?.bankName}</td></tr>
                    <tr><td className="pr-2 py-0.5 font-semibold text-gray-500">A/C No.</td><td className="px-1.5 text-gray-300">:</td><td className="py-0.5 font-mono font-medium text-gray-800 tracking-wide">{invoice.firm?.accountNumber || settings?.accountNumber}</td></tr>
                    <tr><td className="pr-2 py-0.5 font-semibold text-gray-500">IFSC</td><td className="px-1.5 text-gray-300">:</td><td className="py-0.5 font-mono font-medium text-gray-800 tracking-wide">{invoice.firm?.ifscCode || settings?.ifscCode}</td></tr>
                    {(invoice.firm?.branchName || settings?.branchName) && <tr><td className="pr-2 py-0.5 font-semibold text-gray-500">Branch</td><td className="px-1.5 text-gray-300">:</td><td className="py-0.5 font-medium text-gray-700">{invoice.firm?.branchName || settings?.branchName}</td></tr>}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 italic text-[12px]">Not provided</p>
              )}
            </div>

            {/* Terms & Notes — only for GST firms */}
            {firmIsGst && cv.gstRate ? (
              <div className="px-5 py-5 border-r border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #122a4e, #1a3f6f)" }}>
                    <span className="text-white text-[9px] font-bold">T</span>
                  </div>
                  <h4 className="font-bold uppercase text-[11px] tracking-widest" style={{ color: "#122a4e", fontFamily: "'Outfit', 'Inter', sans-serif" }}>Terms & Notes</h4>
                </div>
                <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                  {invoice.terms ? (
                    invoice.terms.split("\n").map((line, i) => <li key={i}>{line}</li>)
                  ) : (
                    <>
                      <li>Goods once sold will not be taken back.</li>
                      <li>Please make payment within the due date.</li>
                      <li>Interest @ 18% p.a. on overdue payments.</li>
                    </>
                  )}
                </ul>
                {invoice.notes && (
                  <p className="mt-2.5 pt-2.5 border-t border-gray-200 text-[11px] text-gray-600 leading-relaxed">{invoice.notes}</p>
                )}
              </div>
            ) : (
              <div className="px-5 py-5 border-r border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #122a4e, #1a3f6f)" }}>
                    <span className="text-white text-[9px] font-bold">Q</span>
                  </div>
                  <h4 className="font-bold uppercase text-[11px] tracking-widest" style={{ color: "#122a4e", fontFamily: "'Outfit', 'Inter', sans-serif" }}>QR Code</h4>
                </div>
                <div className="flex items-center justify-center py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://gstbillmanager.com/verify?id=${invoice.id}&uid=${invoice.userId}`)}`}
                    alt="Invoice QR"
                    width={80}
                    height={80}
                    className="rounded"
                  />
                </div>
                <p className="text-[9px] text-gray-400 text-center mt-1">Scan to verify &amp; download</p>
              </div>
            )}

            {/* Authorized Signatory */}
            <div className="px-5 py-5 flex flex-col items-center justify-between">
              <h4 className="font-bold uppercase text-[11px] tracking-widest" style={{ color: "#122a4e", fontFamily: "'Outfit', 'Inter', sans-serif" }}>Authorized Signatory</h4>
              <div className="flex-1 flex items-center justify-center py-3">
                {invoice.signature ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={invoice.signature.imageData} alt={invoice.signature.directorName} className="h-20 w-auto object-contain" />
                  </>
                ) : (
                  <div className="w-full border-b-2 border-dotted border-gray-300 mt-8" />
                )}
              </div>
              <div className="text-center">
                {invoice.signature?.directorName && (
                  <p className="font-bold text-[13px] text-gray-900" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{invoice.signature.directorName}</p>
                )}
                {(invoice.firm?.signatureText || settings?.signatureText) && !invoice.signature?.directorName && (
                  <p className="font-bold text-[13px] text-gray-900" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{invoice.firm?.signatureText || settings?.signatureText}</p>
                )}
                <p className="text-[11px] text-gray-500 mt-1 font-medium">For {firmName}</p>
                <p className="text-[10px] text-gray-400 italic mt-0.5">Authorized Signatory</p>
              </div>
            </div>
          </div>

          {/* ═══ E-INVOICE QR CODE ═══ */}
          {(invoice.invoiceType === "tax_invoice" || !firmIsGst) && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://gstbillmanager.com/verify?id=${invoice.id}&uid=${invoice.userId}`)}`}
                  alt="E-Invoice QR"
                  width={70}
                  height={70}
                  className="rounded"
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">E-Invoice QR Code</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Scan to verify invoice details</p>
                </div>
              </div>
              <div className="text-right text-[9px] text-gray-400">
                <p>IRN: {invoice.id.substring(0, 16).toUpperCase()}</p>
              </div>
            </div>
          )}

          {/* ═══ FOOTER ═══ */}
          <div className="text-white text-center py-3 text-[11px] font-medium tracking-widest" style={{ background: "linear-gradient(135deg, #0a1628 0%, #122a4e 40%, #1a3f6f 70%, #2a5298 100%)" }}>
            This is a Computer Generated Invoice &nbsp;&bull;&nbsp; E. &amp; O.E.
          </div>
        </div>
      </div>
      )}
      </div>
    </div>
  );
}

export default function InvoiceViewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>}>
      <InvoiceViewContent />
    </Suspense>
  );
}
