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

  const placeOfSupply = invoice.customer.state
    ? `${invoice.customer.state}${invoice.customer.stateCode ? ` (${invoice.customer.stateCode})` : ""}`
    : "";

  return (
    <div>
      {/* Action Bar */}
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

      {/* Professional Blue GST Invoice */}
      <div className="bg-white max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 relative" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        {/* Letterhead background */}
        {hasLetterhead && (
          <div className="absolute inset-0 z-0 print:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={invoice.letterhead} alt="Letterhead" className="w-full h-full object-cover opacity-15 print:opacity-20" />
          </div>
        )}

        <div className="relative z-10 border border-gray-300">
          {/* ═══ HEADER ═══ */}
          <div className="bg-[#1a3a6b] text-white px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center text-2xl font-bold">
                {firmName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide uppercase">{firmName}</h1>
                <p className="text-blue-200 text-sm mt-0.5">{INVOICE_TYPE_LABELS[invoice.invoiceType]}</p>
              </div>
            </div>
            <div className="bg-white/10 border border-white/30 px-3 py-1.5 rounded text-xs font-semibold tracking-wide uppercase">
              Original for Recipient
            </div>
          </div>

          {/* ═══ SELLER + INVOICE DETAILS ═══ */}
          <div className="grid grid-cols-5 border-b border-gray-300">
            {/* Seller Details - 3 cols */}
            <div className="col-span-3 p-5 border-r border-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-[#1a3a6b] rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">S</span>
                </div>
                <h3 className="text-xs font-bold uppercase text-[#1a3a6b] tracking-wider">Seller / Supplier Details</h3>
              </div>
              <table className="text-xs">
                <tbody>
                  <tr><td className="pr-3 py-0.5 font-semibold text-gray-600 whitespace-nowrap">Company Name</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 font-semibold text-gray-900">{firmName}</td></tr>
                  {firmAddress && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">Address</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700">{firmAddress}{firmCity ? `, ${firmCity}` : ""}{firmState ? ` - ${firmState}` : ""}, India</td></tr>}
                  {firmGstin && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">GSTIN</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700 font-mono">{firmGstin}</td></tr>}
                  {firmPan && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">PAN</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700 font-mono">{firmPan}</td></tr>}
                  {firmState && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">State</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700">{firmState}</td></tr>}
                  {firmPhone && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">Contact</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700">{firmPhone}</td></tr>}
                  {firmEmail && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">Email</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700">{firmEmail}</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Invoice Details - 2 cols */}
            <div className="col-span-2 p-5 bg-[#e8eef7]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-[#1a3a6b] rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">I</span>
                </div>
                <h3 className="text-xs font-bold uppercase text-[#1a3a6b] tracking-wider">Invoice Details</h3>
              </div>
              <table className="text-xs w-full">
                <tbody>
                  <tr><td className="pr-3 py-1 font-semibold text-gray-600">Invoice No.</td><td className="px-2 text-gray-400">:</td><td className="py-1 font-bold text-gray-900">{invoice.invoiceNumber}</td></tr>
                  <tr><td className="pr-3 py-1 font-semibold text-gray-600">Invoice Date</td><td className="px-2 text-gray-400">:</td><td className="py-1 text-gray-700">{formatDate(invoice.date)}</td></tr>
                  {invoice.dueDate && <tr><td className="pr-3 py-1 font-semibold text-gray-600">Due Date</td><td className="px-2 text-gray-400">:</td><td className="py-1 text-gray-700">{formatDate(invoice.dueDate)}</td></tr>}
                  {placeOfSupply && <tr><td className="pr-3 py-1 font-semibold text-gray-600">Place of Supply</td><td className="px-2 text-gray-400">:</td><td className="py-1 text-gray-700">{placeOfSupply}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══ BILL TO ═══ */}
          <div className="p-5 border-b border-gray-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-[#1a3a6b] rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">B</span>
              </div>
              <h3 className="text-xs font-bold uppercase text-[#1a3a6b] tracking-wider">Bill To</h3>
            </div>
            <table className="text-xs">
              <tbody>
                <tr><td className="pr-3 py-0.5 font-semibold text-gray-600 whitespace-nowrap">Customer Name</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 font-semibold text-gray-900">{invoice.customer.name}</td></tr>
                {invoice.customer.address && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">Address</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700">{invoice.customer.address}{invoice.customer.city ? `, ${invoice.customer.city}` : ""}{invoice.customer.state ? `, ${invoice.customer.state}` : ""}, India</td></tr>}
                {invoice.customer.gstin && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">GSTIN</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700 font-mono">{invoice.customer.gstin}</td></tr>}
                {invoice.customer.state && <tr><td className="pr-3 py-0.5 font-semibold text-gray-600">State</td><td className="px-2 text-gray-400">:</td><td className="py-0.5 text-gray-700">{invoice.customer.state}{invoice.customer.stateCode ? ` (${invoice.customer.stateCode})` : ""}</td></tr>}

              </tbody>
            </table>
          </div>

          {/* ═══ ITEMS TABLE ═══ */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#1a3a6b] text-white">
                  <th className="p-2.5 text-center border-r border-blue-800 w-10" rowSpan={2}>Sr. No.</th>
                  <th className="p-2.5 text-left border-r border-blue-800" rowSpan={2}>Description of Goods / Services</th>
                  <th className="p-2.5 text-center border-r border-blue-800 w-20" rowSpan={2}>HSN / SAC</th>
                  <th className="p-2.5 text-center border-r border-blue-800 w-14" rowSpan={2}>Qty</th>
                  <th className="p-2.5 text-right border-r border-blue-800 w-20" rowSpan={2}>Rate (₹)</th>
                  <th className="p-2.5 text-right border-r border-blue-800 w-24" rowSpan={2}>Taxable Value (₹)</th>
                  {!invoice.isInterState ? (
                    <>
                      <th className="p-1.5 text-center border-r border-blue-800" colSpan={2}>TAX (%)</th>
                    </>
                  ) : (
                    <th className="p-1.5 text-center border-r border-blue-800">TAX (%)</th>
                  )}
                  <th className="p-2.5 text-right border-r border-blue-800 w-24" rowSpan={2}>Tax Amount (₹)</th>
                  <th className="p-2.5 text-right w-24" rowSpan={2}>Line Total (₹)</th>
                </tr>
                <tr className="bg-[#1a3a6b] text-white text-[10px]">
                  {!invoice.isInterState ? (
                    <>
                      <th className="p-1.5 text-center border-r border-blue-800 w-12">CGST</th>
                      <th className="p-1.5 text-center border-r border-blue-800 w-12">SGST</th>
                    </>
                  ) : (
                    <th className="p-1.5 text-center border-r border-blue-800 w-12">IGST</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => {
                  const itemTax = item.cgst + item.sgst + item.igst;
                  const lineTotal = item.amount + itemTax;
                  return (
                    <tr key={idx} className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="p-2.5 text-center border-r border-gray-200 font-medium">{idx + 1}</td>
                      <td className="p-2.5 border-r border-gray-200 font-medium text-gray-900">{item.description}</td>
                      <td className="p-2.5 text-center border-r border-gray-200 font-mono text-gray-600">{item.hsn}</td>
                      <td className="p-2.5 text-center border-r border-gray-200">{item.qty} {item.unit}</td>
                      <td className="p-2.5 text-right border-r border-gray-200">{formatCurrency(item.rate)}</td>
                      <td className="p-2.5 text-right border-r border-gray-200">{formatCurrency(item.amount)}</td>
                      {!invoice.isInterState ? (
                        <>
                          <td className="p-2.5 text-center border-r border-gray-200">{item.gstRate / 2}%</td>
                          <td className="p-2.5 text-center border-r border-gray-200">{item.gstRate / 2}%</td>
                        </>
                      ) : (
                        <td className="p-2.5 text-center border-r border-gray-200">{item.gstRate}%</td>
                      )}
                      <td className="p-2.5 text-right border-r border-gray-200 text-xs leading-relaxed">
                        {formatCurrency(itemTax)}
                        {!invoice.isInterState ? (
                          <span className="block text-[10px] text-gray-500">(CGST {formatCurrency(item.cgst)}<br/>SGT {formatCurrency(item.sgst)})</span>
                        ) : (
                          <span className="block text-[10px] text-gray-500">(IGST)</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-bold">{formatCurrency(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ═══ TOTALS ═══ */}
          <div className="border-t border-gray-300">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-2.5 text-right font-semibold text-gray-600" colSpan={2}>Subtotal (Taxable Value)</td>
                  <td className="p-2.5 text-right font-bold w-32">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                {!invoice.isInterState ? (
                  <>
                    <tr className="border-b border-gray-200">
                      <td className="p-2.5 text-right font-semibold text-gray-600" colSpan={2}>CGST @ {invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 0}%</td>
                      <td className="p-2.5 text-right font-bold w-32">{formatCurrency(invoice.totalCgst)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2.5 text-right font-semibold text-gray-600" colSpan={2}>SGST @ {invoice.items[0]?.gstRate ? invoice.items[0].gstRate / 2 : 0}%</td>
                      <td className="p-2.5 text-right font-bold w-32">{formatCurrency(invoice.totalSgst)}</td>
                    </tr>
                  </>
                ) : (
                  <tr className="border-b border-gray-200">
                    <td className="p-2.5 text-right font-semibold text-gray-600" colSpan={2}>IGST @ {invoice.items[0]?.gstRate || 0}%</td>
                    <td className="p-2.5 text-right font-bold w-32">{formatCurrency(invoice.totalIgst)}</td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* ═══ GRAND TOTAL + AMOUNT IN WORDS ═══ */}
          <div className="flex border-t-2 border-[#1a3a6b]">
            <div className="flex-1 p-3 bg-[#e8eef7]">
              <p className="text-[10px] font-bold text-[#1a3a6b] uppercase">Amount in Words:</p>
              <p className="text-xs font-semibold text-[#1a3a6b] italic mt-0.5">{numberToWords(invoice.grandTotal)}</p>
            </div>
            <div className="bg-[#1a3a6b] text-white px-6 py-3 flex items-center gap-4">
              <span className="text-sm font-bold uppercase">Grand Total (₹)</span>
              <span className="text-2xl font-bold">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>

          {/* ═══ BOTTOM: PAYMENT + TERMS + SIGNATURE ═══ */}
          <div className="grid grid-cols-3 border-t border-gray-300 text-xs">
            {/* Payment Details */}
            <div className="p-4 border-r border-gray-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-[#1a3a6b] rounded flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">₹</span>
                </div>
                <h4 className="font-bold uppercase text-[#1a3a6b] text-[10px] tracking-wider">Payment Details</h4>
              </div>
              {(invoice.firm?.bankName || settings?.bankName) ? (
                <table className="text-xs">
                  <tbody>
                    <tr><td className="pr-2 py-0.5 font-semibold text-gray-600">Bank Name</td><td className="px-1 text-gray-400">:</td><td className="py-0.5">{invoice.firm?.bankName || settings?.bankName}</td></tr>
                    <tr><td className="pr-2 py-0.5 font-semibold text-gray-600">A/C No.</td><td className="px-1 text-gray-400">:</td><td className="py-0.5 font-mono">{invoice.firm?.accountNumber || settings?.accountNumber}</td></tr>
                    <tr><td className="pr-2 py-0.5 font-semibold text-gray-600">IFSC Code</td><td className="px-1 text-gray-400">:</td><td className="py-0.5 font-mono">{invoice.firm?.ifscCode || settings?.ifscCode}</td></tr>
                    {(invoice.firm?.branchName || settings?.branchName) && <tr><td className="pr-2 py-0.5 font-semibold text-gray-600">Branch</td><td className="px-1 text-gray-400">:</td><td className="py-0.5">{invoice.firm?.branchName || settings?.branchName}</td></tr>}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 italic">Not provided</p>
              )}
            </div>

            {/* Terms & Notes */}
            <div className="p-4 border-r border-gray-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-[#1a3a6b] rounded flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">T</span>
                </div>
                <h4 className="font-bold uppercase text-[#1a3a6b] text-[10px] tracking-wider">Terms & Notes</h4>
              </div>
              <ul className="text-[10px] text-gray-600 space-y-1 list-disc pl-3">
                {invoice.terms ? (
                  invoice.terms.split("\n").map((line, i) => <li key={i}>{line}</li>)
                ) : (
                  <>
                    <li>Goods once sold will not be taken back.</li>
                    <li>Please make payment within the due date.</li>
                    <li>Interest @ 18% p.a. will be charged on overdue payments.</li>
                  </>
                )}
              </ul>
              {invoice.notes && (
                <p className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-600">{invoice.notes}</p>
              )}
            </div>

            {/* Authorized Signatory */}
            <div className="p-4 flex flex-col items-center justify-between">
              <h4 className="font-bold uppercase text-[#1a3a6b] text-[10px] tracking-wider">Authorized Signatory</h4>
              <div className="flex-1 flex items-center justify-center py-2">
                {invoice.signature ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={invoice.signature.imageData} alt={invoice.signature.directorName} className="h-16 w-auto object-contain" />
                  </>
                ) : (
                  <div className="w-full border-b border-dotted border-gray-400 mt-8" />
                )}
              </div>
              <div className="text-center">
                {invoice.signature?.directorName && (
                  <p className="font-semibold text-xs">{invoice.signature.directorName}</p>
                )}
                {(invoice.firm?.signatureText || settings?.signatureText) && !invoice.signature?.directorName && (
                  <p className="font-semibold text-xs">{invoice.firm?.signatureText || settings?.signatureText}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-0.5">For {firmName}</p>
                <p className="text-[10px] text-gray-500 italic">Authorized Signatory</p>
              </div>
            </div>
          </div>

          {/* ═══ FOOTER ═══ */}
          <div className="bg-[#1a3a6b] text-white text-center py-2 text-[10px] font-medium tracking-wide">
            This is a Computer Generated Invoice &nbsp;&bull;&nbsp; E. &amp; O.E.
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
