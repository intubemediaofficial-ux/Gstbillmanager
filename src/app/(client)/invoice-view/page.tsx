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

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current || !id) return;
    didFetch.current = true;
    Promise.all([
      fetch(`/api/invoices?id=${id}`).then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([iRes, sRes]) => {
      setInvoice(iRes.data || null);
      setSettings(sRes.data || null);
    }).finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    if (!invoice) return;
    const text = `Invoice ${invoice.invoiceNumber}\nCustomer: ${invoice.customer.name}\nAmount: ${formatCurrency(invoice.grandTotal)}\nDate: ${formatDate(invoice.date)}\n\nView: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = () => {
    if (!invoice) return;
    const subject = `Invoice ${invoice.invoiceNumber} - ${settings?.companyName || "GST Bill"}`;
    const body = `Dear ${invoice.customer.name},\n\nPlease find the invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.grandTotal)}\nDate: ${formatDate(invoice.date)}\nDue Date: ${invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}\n\nThank you for your business.\n\n${settings?.companyName || ""}`;
    window.open(`mailto:${invoice.customer.gstin ? "" : ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
  if (!invoice) return <div className="text-center py-20 text-gray-400">Invoice not found</div>;

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

      {/* Invoice Template */}
      <div className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.firm?.name || settings?.companyName || "Your Company"}</h1>
            <p className="text-sm text-gray-500 mt-1">{invoice.firm?.address || settings?.address}</p>
            <p className="text-sm text-gray-500">{invoice.firm?.city || settings?.city}, {invoice.firm?.state || settings?.state} {invoice.firm ? "" : settings?.pincode}</p>
            {(invoice.firm?.gstin || settings?.gstin) && <p className="text-sm mt-1"><span className="font-medium">GSTIN:</span> {invoice.firm?.gstin || settings?.gstin}</p>}
            {(invoice.firm?.phone || settings?.phone) && <p className="text-sm text-gray-500">Ph: {invoice.firm?.phone || settings?.phone}</p>}
            {invoice.firm?.email && <p className="text-sm text-gray-500">Email: {invoice.firm.email}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-indigo-600">{INVOICE_TYPE_LABELS[invoice.invoiceType]}</h2>
            <p className="text-sm mt-1"><span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}</p>
            <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(invoice.date)}</p>
            {invoice.dueDate && <p className="text-sm"><span className="font-medium">Due:</span> {formatDate(invoice.dueDate)}</p>}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">Bill To</h3>
          <p className="font-semibold">{invoice.customer.name}</p>
          <p className="text-sm text-gray-600">{invoice.customer.address}</p>
          <p className="text-sm text-gray-600">{invoice.customer.city}, {invoice.customer.state}</p>
          {invoice.customer.gstin && <p className="text-sm"><span className="font-medium">GSTIN:</span> {invoice.customer.gstin}</p>}
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-indigo-50">
              <th className="text-left p-2.5 font-semibold">#</th>
              <th className="text-left p-2.5 font-semibold">Description</th>
              <th className="text-left p-2.5 font-semibold">HSN</th>
              <th className="text-right p-2.5 font-semibold">Qty</th>
              <th className="text-right p-2.5 font-semibold">Rate</th>
              <th className="text-right p-2.5 font-semibold">GST%</th>
              {!invoice.isInterState ? (
                <>
                  <th className="text-right p-2.5 font-semibold">CGST</th>
                  <th className="text-right p-2.5 font-semibold">SGST</th>
                </>
              ) : (
                <th className="text-right p-2.5 font-semibold">IGST</th>
              )}
              <th className="text-right p-2.5 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => {
              const itemTotal = item.amount + item.cgst + item.sgst + item.igst;
              return (
                <tr key={idx} className="border-b">
                  <td className="p-2.5 text-gray-500">{idx + 1}</td>
                  <td className="p-2.5">{item.description}</td>
                  <td className="p-2.5 font-mono text-xs">{item.hsn}</td>
                  <td className="p-2.5 text-right">{item.qty} {item.unit}</td>
                  <td className="p-2.5 text-right">{formatCurrency(item.rate)}</td>
                  <td className="p-2.5 text-right">{item.gstRate}%</td>
                  {!invoice.isInterState ? (
                    <>
                      <td className="p-2.5 text-right">{formatCurrency(item.cgst)}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.sgst)}</td>
                    </>
                  ) : (
                    <td className="p-2.5 text-right">{formatCurrency(item.igst)}</td>
                  )}
                  <td className="p-2.5 text-right font-medium">{formatCurrency(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-1.5 text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            {!invoice.isInterState ? (
              <>
                <div className="flex justify-between py-1.5 text-sm"><span className="text-gray-500">CGST</span><span>{formatCurrency(invoice.totalCgst)}</span></div>
                <div className="flex justify-between py-1.5 text-sm"><span className="text-gray-500">SGST</span><span>{formatCurrency(invoice.totalSgst)}</span></div>
              </>
            ) : (
              <div className="flex justify-between py-1.5 text-sm"><span className="text-gray-500">IGST</span><span>{formatCurrency(invoice.totalIgst)}</span></div>
            )}
            <div className="flex justify-between py-2.5 border-t-2 border-indigo-600 font-bold text-lg mt-2">
              <span>Grand Total</span><span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Amount in Words</p>
          <p className="font-medium text-sm">{numberToWords(invoice.grandTotal)}</p>
        </div>

        {/* Bank & Terms */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          {(invoice.firm?.bankName || settings?.bankName) && (
            <div>
              <h4 className="font-semibold mb-1">Bank Details</h4>
              <p>Bank: {invoice.firm?.bankName || settings?.bankName}</p>
              <p>A/C: {invoice.firm?.accountNumber || settings?.accountNumber}</p>
              <p>IFSC: {invoice.firm?.ifscCode || settings?.ifscCode}</p>
              {(invoice.firm?.branchName || settings?.branchName) && <p>Branch: {invoice.firm?.branchName || settings?.branchName}</p>}
            </div>
          )}
          <div>
            {invoice.terms && (
              <>
                <h4 className="font-semibold mb-1">Terms & Conditions</h4>
                <p className="text-gray-600 whitespace-pre-line">{invoice.terms}</p>
              </>
            )}
            <div className="mt-8 text-right">
              {invoice.signature ? (
                <>
                  <p className="text-xs text-gray-400">Authorized Signatory</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={invoice.signature.imageData} alt={invoice.signature.directorName} className="h-16 w-auto object-contain ml-auto mt-2" />
                  <p className="font-semibold mt-1">{invoice.signature.directorName}</p>
                </>
              ) : (invoice.firm?.signatureText || settings?.signatureText) ? (
                <>
                  <p className="text-xs text-gray-400">Authorized Signatory</p>
                  <p className="font-semibold mt-4">{invoice.firm?.signatureText || settings?.signatureText}</p>
                </>
              ) : null}
            </div>
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
