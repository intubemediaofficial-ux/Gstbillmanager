"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Printer, Download, Share2, Mail, ArrowLeft } from "lucide-react";
import type { Invoice, BusinessSettings } from "@/lib/gst-types";
import { INVOICE_TYPE_LABELS } from "@/lib/gst-types";
import { formatCurrency, formatDate, numberToWords } from "@/lib/gst-utils";

function InvoiceViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const adminUserId = searchParams.get("userId");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

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
    ]).then(([iRes, sRes]) => {
      setInvoice(iRes.data || null);
      setSettings(sRes.data || null);
    }).finally(() => setLoading(false));
  }, [id, adminUserId]);

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    if (!invoice) return;
    const text = `Invoice ${invoice.invoiceNumber}\nCustomer: ${invoice.customer.name}\nAmount: ${formatCurrency(invoice.grandTotal)}\nDate: ${formatDate(invoice.date)}\n\nView: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = () => {
    if (!invoice) return;
    const subject = `Invoice ${invoice.invoiceNumber} - ${invoice.firm?.name || settings?.companyName || "GST Bill"}`;
    const body = `Dear ${invoice.customer.name},\n\nPlease find the invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.grandTotal)}\nDate: ${formatDate(invoice.date)}\nDue Date: ${invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}\n\nThank you for your business.\n\n${invoice.firm?.name || settings?.companyName || ""}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
  const hasLetterhead = !!invoice.letterhead;

  const colCount = invoice.isInterState ? 8 : 9;

  return (
    <div>
      {/* Action Bar - hidden when printing */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleWhatsApp} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={handleEmail} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Mail className="w-4 h-4" /> Email
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Indian Tally-Style Tax Invoice */}
      <div className="bg-white max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 relative" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        {/* Letterhead background */}
        {hasLetterhead && (
          <div className="absolute inset-0 z-0 print:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={invoice.letterhead} alt="Letterhead" className="w-full h-full object-cover opacity-15 print:opacity-20" />
          </div>
        )}

        <div className="relative z-10 border-2 border-black">
          {/* Company Header */}
          <div className="border-b-2 border-black px-4 py-3 text-center">
            <h1 className="text-xl font-bold uppercase tracking-wide">{firmName}</h1>
            {firmAddress && <p className="text-xs mt-0.5">{firmAddress}{firmCity ? `, ${firmCity}` : ""}{firmState ? `, ${firmState}` : ""}</p>}
            <div className="flex justify-center gap-6 mt-1 text-xs">
              {firmGstin && <span><strong>GSTIN:</strong> {firmGstin}</span>}
              {firmPan && <span><strong>PAN:</strong> {firmPan}</span>}
              {firmPhone && <span><strong>Ph:</strong> {firmPhone}</span>}
              {firmEmail && <span><strong>Email:</strong> {firmEmail}</span>}
            </div>
          </div>

          {/* Invoice Title */}
          <div className="border-b-2 border-black py-1 text-center bg-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-widest">{INVOICE_TYPE_LABELS[invoice.invoiceType]}</h2>
          </div>

          {/* Invoice Meta + Bill To - side by side */}
          <div className="grid grid-cols-2 border-b-2 border-black text-xs">
            {/* Left: Bill To */}
            <div className="border-r-2 border-black p-3">
              <p className="font-bold text-[10px] uppercase text-gray-500 mb-1">Bill To / Ship To</p>
              <p className="font-bold text-sm">{invoice.customer.name}</p>
              {invoice.customer.address && <p>{invoice.customer.address}</p>}
              {(invoice.customer.city || invoice.customer.state) && <p>{invoice.customer.city}{invoice.customer.city && invoice.customer.state ? ", " : ""}{invoice.customer.state}</p>}
              {invoice.customer.gstin && <p className="mt-1"><strong>GSTIN:</strong> {invoice.customer.gstin}</p>}
              {invoice.customer.stateCode && <p><strong>State Code:</strong> {invoice.customer.stateCode}</p>}
            </div>
            {/* Right: Invoice Details */}
            <div className="p-3">
              <div className="grid grid-cols-2 gap-y-1">
                <p><strong>Invoice No:</strong></p><p className="text-right font-semibold">{invoice.invoiceNumber}</p>
                <p><strong>Date:</strong></p><p className="text-right">{formatDate(invoice.date)}</p>
                {invoice.dueDate && <><p><strong>Due Date:</strong></p><p className="text-right">{formatDate(invoice.dueDate)}</p></>}
                {invoice.isInterState !== undefined && <><p><strong>Supply Type:</strong></p><p className="text-right">{invoice.isInterState ? "Inter-State" : "Intra-State"}</p></>}
                {invoice.gstMode && <><p><strong>GST Mode:</strong></p><p className="text-right capitalize">{invoice.gstMode === "include" ? "Inclusive" : "Exclusive"}</p></>}
              </div>
            </div>
          </div>

          {/* Items Table - Tally Style */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b-2 border-r border-black p-2 text-center w-8">S.No.</th>
                <th className="border-b-2 border-r border-black p-2 text-left">Particulars</th>
                <th className="border-b-2 border-r border-black p-2 text-center w-20">HSN/SAC</th>
                <th className="border-b-2 border-r border-black p-2 text-center w-12">Qty</th>
                <th className="border-b-2 border-r border-black p-2 text-right w-20">Rate</th>
                <th className="border-b-2 border-r border-black p-2 text-right w-20">Amount</th>
                {!invoice.isInterState ? (
                  <>
                    <th className="border-b-2 border-r border-black p-2 text-right w-20">CGST</th>
                    <th className="border-b-2 border-r border-black p-2 text-right w-20">SGST</th>
                  </>
                ) : (
                  <th className="border-b-2 border-r border-black p-2 text-right w-20">IGST</th>
                )}
                <th className="border-b-2 border-black p-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => {
                const itemTotal = item.amount + item.cgst + item.sgst + item.igst;
                return (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="border-r border-gray-300 p-2 text-center">{idx + 1}</td>
                    <td className="border-r border-gray-300 p-2">{item.description}</td>
                    <td className="border-r border-gray-300 p-2 text-center font-mono">{item.hsn}</td>
                    <td className="border-r border-gray-300 p-2 text-center">{item.qty} {item.unit}</td>
                    <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(item.amount)}</td>
                    {!invoice.isInterState ? (
                      <>
                        <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(item.cgst)}</td>
                        <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(item.sgst)}</td>
                      </>
                    ) : (
                      <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(item.igst)}</td>
                    )}
                    <td className="p-2 text-right font-semibold">{formatCurrency(itemTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {/* Subtotal row */}
              <tr className="border-t-2 border-black bg-gray-50">
                <td colSpan={5} className="border-r border-black p-2 text-right font-bold">Subtotal</td>
                <td className="border-r border-black p-2 text-right font-bold">{formatCurrency(invoice.subtotal)}</td>
                {!invoice.isInterState ? (
                  <>
                    <td className="border-r border-black p-2 text-right font-bold">{formatCurrency(invoice.totalCgst)}</td>
                    <td className="border-r border-black p-2 text-right font-bold">{formatCurrency(invoice.totalSgst)}</td>
                  </>
                ) : (
                  <td className="border-r border-black p-2 text-right font-bold">{formatCurrency(invoice.totalIgst)}</td>
                )}
                <td className="p-2 text-right font-bold">{formatCurrency(invoice.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>

          {/* GST Summary Table */}
          <div className="border-t-2 border-black">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b border-r border-black p-1.5 text-center">HSN/SAC</th>
                  <th className="border-b border-r border-black p-1.5 text-right">Taxable Value</th>
                  {!invoice.isInterState ? (
                    <>
                      <th className="border-b border-r border-black p-1.5 text-center" colSpan={2}>CGST</th>
                      <th className="border-b border-r border-black p-1.5 text-center" colSpan={2}>SGST</th>
                    </>
                  ) : (
                    <th className="border-b border-r border-black p-1.5 text-center" colSpan={2}>IGST</th>
                  )}
                  <th className="border-b border-black p-1.5 text-right">Total Tax</th>
                </tr>
                {!invoice.isInterState ? (
                  <tr className="bg-gray-50 text-[10px]">
                    <th className="border-b border-r border-black p-1"></th>
                    <th className="border-b border-r border-black p-1"></th>
                    <th className="border-b border-r border-black p-1 text-center">Rate</th>
                    <th className="border-b border-r border-black p-1 text-right">Amount</th>
                    <th className="border-b border-r border-black p-1 text-center">Rate</th>
                    <th className="border-b border-r border-black p-1 text-right">Amount</th>
                    <th className="border-b border-black p-1"></th>
                  </tr>
                ) : (
                  <tr className="bg-gray-50 text-[10px]">
                    <th className="border-b border-r border-black p-1"></th>
                    <th className="border-b border-r border-black p-1"></th>
                    <th className="border-b border-r border-black p-1 text-center">Rate</th>
                    <th className="border-b border-r border-black p-1 text-right">Amount</th>
                    <th className="border-b border-black p-1"></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="border-r border-gray-300 p-1.5 text-center font-mono">{item.hsn}</td>
                    <td className="border-r border-gray-300 p-1.5 text-right">{formatCurrency(item.amount)}</td>
                    {!invoice.isInterState ? (
                      <>
                        <td className="border-r border-gray-300 p-1.5 text-center">{item.gstRate / 2}%</td>
                        <td className="border-r border-gray-300 p-1.5 text-right">{formatCurrency(item.cgst)}</td>
                        <td className="border-r border-gray-300 p-1.5 text-center">{item.gstRate / 2}%</td>
                        <td className="border-r border-gray-300 p-1.5 text-right">{formatCurrency(item.sgst)}</td>
                      </>
                    ) : (
                      <>
                        <td className="border-r border-gray-300 p-1.5 text-center">{item.gstRate}%</td>
                        <td className="border-r border-gray-300 p-1.5 text-right">{formatCurrency(item.igst)}</td>
                      </>
                    )}
                    <td className="p-1.5 text-right font-semibold">{formatCurrency(item.cgst + item.sgst + item.igst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand Total Row */}
          <div className="border-t-2 border-black bg-gray-100 px-4 py-2 flex justify-between items-center">
            <span className="text-sm font-bold">Grand Total</span>
            <span className="text-lg font-bold">{formatCurrency(invoice.grandTotal)}</span>
          </div>

          {/* Amount in Words */}
          <div className="border-t-2 border-black px-4 py-2">
            <p className="text-xs"><strong>Amount in Words:</strong> {numberToWords(invoice.grandTotal)}</p>
          </div>

          {/* Bank Details + Signature - side by side */}
          <div className="grid grid-cols-2 border-t-2 border-black text-xs">
            {/* Left: Bank Details */}
            <div className="border-r-2 border-black p-3">
              <p className="font-bold text-[10px] uppercase text-gray-500 mb-1">Bank Details</p>
              {(invoice.firm?.bankName || settings?.bankName) ? (
                <div className="space-y-0.5">
                  <p><strong>Bank:</strong> {invoice.firm?.bankName || settings?.bankName}</p>
                  <p><strong>A/C No:</strong> {invoice.firm?.accountNumber || settings?.accountNumber}</p>
                  <p><strong>IFSC:</strong> {invoice.firm?.ifscCode || settings?.ifscCode}</p>
                  {(invoice.firm?.branchName || settings?.branchName) && <p><strong>Branch:</strong> {invoice.firm?.branchName || settings?.branchName}</p>}
                </div>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
              {/* Notes */}
              {invoice.notes && (
                <div className="mt-3 pt-2 border-t border-gray-300">
                  <p className="font-bold text-[10px] uppercase text-gray-500 mb-0.5">Notes</p>
                  <p className="whitespace-pre-line text-gray-700">{invoice.notes}</p>
                </div>
              )}
              {/* Terms */}
              {invoice.terms && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="font-bold text-[10px] uppercase text-gray-500 mb-0.5">Terms & Conditions</p>
                  <p className="whitespace-pre-line text-gray-700">{invoice.terms}</p>
                </div>
              )}
            </div>

            {/* Right: Signature */}
            <div className="p-3 flex flex-col justify-between">
              <div className="text-right">
                <p className="font-bold text-[10px] uppercase text-gray-500 mb-1">For {firmName}</p>
              </div>
              <div className="text-right mt-auto pt-8">
                {invoice.signature ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={invoice.signature.imageData} alt={invoice.signature.directorName} className="h-14 w-auto object-contain ml-auto" />
                    <p className="font-semibold mt-1 text-sm">{invoice.signature.directorName}</p>
                    <p className="text-[10px] text-gray-500">Authorized Signatory</p>
                  </>
                ) : (invoice.firm?.signatureText || settings?.signatureText) ? (
                  <>
                    <p className="font-semibold mt-8 text-sm">{invoice.firm?.signatureText || settings?.signatureText}</p>
                    <p className="text-[10px] text-gray-500">Authorized Signatory</p>
                  </>
                ) : (
                  <p className="text-[10px] text-gray-500 mt-8">Authorized Signatory</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black px-4 py-1.5 text-center text-[10px] text-gray-500">
            This is a computer-generated invoice. {colCount > 0 ? "" : ""}
          </div>
        </div>
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
