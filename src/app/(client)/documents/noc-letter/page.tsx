"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { legalTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "recipientName", label: "Issued To (Person Name)", required: true, placeholder: "Full name" },
  { name: "designation", label: "Designation", placeholder: "e.g. Employee / Partner" },
  { name: "purpose", label: "Purpose of NOC", required: true, type: "select", options: ["Employment", "Business", "Travel", "Property", "Vehicle Transfer", "Education", "Bank Account", "General"] },
  { name: "details", label: "NOC Details", type: "textarea", half: false, required: true, placeholder: "Describe the specific purpose and any conditions..." },
  { name: "issueDate", label: "Issue Date", type: "date", required: true },
  { name: "validTill", label: "Valid Till (if applicable)", type: "date" },
  { name: "signatoryName", label: "Signatory Name", placeholder: "Authorized person name" },
  { name: "signatoryDesignation", label: "Signatory Designation", placeholder: "e.g. Director / Manager" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 36px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
            {companyAddress && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.8 }}>{companyAddress}</div>}
            {companyGstin && <div style={{ fontSize: "11px", opacity: 0.7 }}>GSTIN: {companyGstin}</div>}
          </div>
        </div>
      </div>
      <div style={{ background: c.accent, padding: "14px 36px", borderBottom: `3px solid ${c.primary}` }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: c.primary, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>No Objection Certificate</h2>
      </div>
      <div style={{ padding: "28px 36px", fontSize: "13.5px", lineHeight: "1.9", color: "#1f2937" }}>
        <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>Date: {formatDate(data.issueDate)}</p>
        <p style={{ fontSize: "14px", fontWeight: 600 }}>To Whom It May Concern,</p>

        <p>This is to certify that <strong>{companyName}</strong> has no objection to <strong>{data.recipientName || "___________"}</strong>
          {data.designation ? ` (${data.designation})` : ""} for the purpose of <strong>{data.purpose || "___________"}</strong>.</p>

        <div style={{ background: c.accent, borderRadius: "8px", padding: "20px", margin: "20px 0", borderLeft: `4px solid ${c.primary}` }}>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "13px" }}>{data.details || "-"}</p>
        </div>

        {data.validTill && <p>This NOC is valid till <strong>{formatDate(data.validTill)}</strong>.</p>}

        <p>This certificate is issued on request and does not hold the company liable for any claims or disputes arising from the above.</p>

        <div style={{ marginTop: "60px" }}>
          <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary }}>{data.signatoryName || "Authorized Signatory"}</p>
            {data.signatoryDesignation && <p style={{ fontSize: "12px", color: "#6b7280" }}>{data.signatoryDesignation}</p>}
            <p style={{ fontSize: "12px", color: "#6b7280" }}>{companyName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NOCLetterPage() {
  return <DocGenerator title="NOC Letter" fields={fields} templates={legalTemplates} renderDoc={renderDoc} />;
}
