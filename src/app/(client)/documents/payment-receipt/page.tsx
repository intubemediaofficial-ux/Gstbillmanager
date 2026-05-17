"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { businessTemplates, formatDate } from "@/components/documents/doc-templates";
import { formatCurrency } from "@/lib/gst-utils";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "receiptNo", label: "Receipt Number", required: true, placeholder: "e.g. REC-001" },
  { name: "customerName", label: "Customer / Party Name", required: true, placeholder: "Customer name" },
  { name: "customerAddress", label: "Address", type: "textarea", half: false, placeholder: "Customer address" },
  { name: "amount", label: "Amount (₹)", type: "number", required: true, placeholder: "e.g. 50000" },
  { name: "amountWords", label: "Amount in Words", placeholder: "e.g. Fifty Thousand Only" },
  { name: "paymentDate", label: "Payment Date", type: "date", required: true },
  { name: "paymentMode", label: "Payment Mode", type: "select", options: ["Cash", "UPI", "Bank Transfer (NEFT/RTGS)", "Cheque", "Credit Card", "Debit Card", "Online Payment"] },
  { name: "invoiceRef", label: "Invoice Reference", placeholder: "e.g. INV-2025-001" },
  { name: "chequeNo", label: "Cheque / Transaction No.", placeholder: "If applicable" },
  { name: "remarks", label: "Remarks", type: "textarea", half: false, placeholder: "Any additional notes..." },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";
  const amount = parseInt(data.amount || "0");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 36px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
            {companyAddress && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.8 }}>{companyAddress}</div>}
            {companyGstin && <div style={{ fontSize: "11px", opacity: 0.7 }}>GSTIN: {companyGstin}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "2px" }}>PAYMENT RECEIPT</div>
            <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>#{data.receiptNo || "---"}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 36px", fontSize: "13.5px", lineHeight: "1.8", color: "#1f2937" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Received From</div>
            <div style={{ fontSize: "15px", fontWeight: 700 }}>{data.customerName || "-"}</div>
            {data.customerAddress && <div style={{ fontSize: "12px", color: "#6b7280" }}>{data.customerAddress}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Date: {formatDate(data.paymentDate)}</div>
            {data.invoiceRef && <div style={{ fontSize: "12px", color: "#6b7280" }}>Ref: {data.invoiceRef}</div>}
          </div>
        </div>

        {/* Amount Box */}
        <div style={{ background: c.accent, borderRadius: "12px", padding: "24px", borderLeft: `5px solid ${c.primary}`, margin: "20px 0" }}>
          <div style={{ fontSize: "12px", color: c.primary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>Amount Received</div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: c.primary }}>{formatCurrency(amount)}</div>
          {data.amountWords && <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "4px", fontStyle: "italic" }}>({data.amountWords})</div>}
        </div>

        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "20px", margin: "20px 0" }}>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <tbody>
              <tr><td style={{ padding: "8px 0", fontWeight: 600, width: "35%", color: "#4b5563" }}>Receipt No.</td><td style={{ padding: "8px 0" }}>{data.receiptNo}</td></tr>
              <tr><td style={{ padding: "8px 0", fontWeight: 600, color: "#4b5563" }}>Payment Date</td><td style={{ padding: "8px 0" }}>{formatDate(data.paymentDate)}</td></tr>
              <tr><td style={{ padding: "8px 0", fontWeight: 600, color: "#4b5563" }}>Payment Mode</td><td style={{ padding: "8px 0" }}>{data.paymentMode || "Cash"}</td></tr>
              {data.chequeNo && <tr><td style={{ padding: "8px 0", fontWeight: 600, color: "#4b5563" }}>Transaction / Cheque No.</td><td style={{ padding: "8px 0" }}>{data.chequeNo}</td></tr>}
              {data.invoiceRef && <tr><td style={{ padding: "8px 0", fontWeight: 600, color: "#4b5563" }}>Against Invoice</td><td style={{ padding: "8px 0" }}>{data.invoiceRef}</td></tr>}
            </tbody>
          </table>
        </div>

        {/* PAID Stamp */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <span style={{ display: "inline-block", border: `3px solid ${c.primary}`, borderRadius: "8px", padding: "8px 32px", fontSize: "24px", fontWeight: 800, color: c.primary, letterSpacing: "6px", transform: "rotate(-5deg)", opacity: 0.8 }}>PAID</span>
        </div>

        {data.remarks && <p style={{ fontSize: "12px", color: "#6b7280" }}><strong>Remarks:</strong> {data.remarks}</p>}

        <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ borderTop: "2px solid #d1d5db", width: "180px", paddingTop: "8px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Receiver&apos;s Signature</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "180px", paddingTop: "8px", textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", color: c.primary }}>For {companyName}</p>
              <p style={{ fontSize: "11px", color: "#6b7280" }}>Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReceiptPage() {
  return <DocGenerator title="Payment Receipt" fields={fields} templates={businessTemplates} renderDoc={renderDoc} />;
}
