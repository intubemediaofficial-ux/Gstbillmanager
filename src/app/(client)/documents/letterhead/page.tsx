"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { brandingTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "subject", label: "Subject / Title", required: true, placeholder: "Letter subject" },
  { name: "recipientName", label: "Recipient Name", placeholder: "To whom" },
  { name: "recipientAddress", label: "Recipient Address", type: "textarea", half: false, placeholder: "Address" },
  { name: "body", label: "Letter Body", type: "textarea", half: false, required: true, placeholder: "Type your letter content here..." },
  { name: "date", label: "Date", type: "date" },
  { name: "senderName", label: "Sender / Signatory Name", placeholder: "Your name" },
  { name: "senderDesignation", label: "Sender Designation", placeholder: "e.g. Director" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";
  const companyPhone = firm?.phone || "";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "white", minHeight: "297mm", position: "relative" }}>
      {/* Watermark */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-30deg)", fontSize: "80px", fontWeight: 800, color: c.primary, opacity: 0.03, letterSpacing: "10px", pointerEvents: "none" }}>
        {companyName}
      </div>

      {/* Header */}
      <div style={{ borderBottom: `3px solid ${c.primary}`, padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: c.primary, letterSpacing: "0.5px" }}>{companyName}</div>
          {companyAddress && <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>{companyAddress}</div>}
          <div style={{ fontSize: "11px", color: "#6b7280" }}>
            {companyGstin && <>GSTIN: {companyGstin}</>}
            {companyPhone && <> | Phone: {companyPhone}</>}
          </div>
        </div>
        <div style={{ width: "4px", height: "60px", background: `linear-gradient(to bottom, ${c.primary}, ${c.secondary})`, borderRadius: "2px" }} />
      </div>

      {/* Body */}
      <div style={{ padding: "32px 40px", fontSize: "13.5px", lineHeight: "1.9", color: "#1f2937", minHeight: "200mm" }}>
        <div style={{ textAlign: "right", fontSize: "12px", color: "#6b7280", marginBottom: "20px" }}>
          Date: {formatDate(data.date || "")}
        </div>

        {data.recipientName && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 600 }}>To,</div>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            {data.recipientAddress && <div style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "pre-wrap" }}>{data.recipientAddress}</div>}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <strong>Subject: {data.subject || "___________"}</strong>
        </div>

        <div style={{ whiteSpace: "pre-wrap" }}>{data.body || "Letter content..."}</div>

        <div style={{ marginTop: "60px" }}>
          <div style={{ marginBottom: "4px" }}>Yours sincerely,</div>
          <div style={{ marginTop: "40px" }}>
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "180px", paddingTop: "8px" }}>
              <div style={{ fontWeight: 700, color: c.primary }}>{data.senderName || "Authorized Signatory"}</div>
              {data.senderDesignation && <div style={{ fontSize: "12px", color: "#6b7280" }}>{data.senderDesignation}</div>}
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{companyName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: `3px solid ${c.primary}`, padding: "12px 40px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af" }}>
        <span>{companyName}</span>
        <span>{companyAddress}</span>
      </div>
    </div>
  );
}

export default function LetterheadPage() {
  return <DocGenerator title="Letterhead Generator" fields={fields} templates={brandingTemplates} renderDoc={renderDoc} />;
}
