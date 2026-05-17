"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef, DocAssets } from "@/components/documents/DocGenerator";
import { legalTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "agreementType", label: "Agreement Type", type: "select", options: ["Service Agreement", "Freelance Agreement", "Vendor Agreement", "Consultancy Agreement", "Employment Contract"], required: true },
  { name: "partyName", label: "Second Party Name", required: true, placeholder: "Name of the other party" },
  { name: "partyAddress", label: "Second Party Address", type: "textarea", half: false, placeholder: "Full address" },
  { name: "startDate", label: "Start Date", type: "date", required: true },
  { name: "endDate", label: "End Date", type: "date" },
  { name: "value", label: "Agreement Value (₹)", type: "number", placeholder: "e.g. 100000" },
  { name: "scope", label: "Scope of Work", type: "textarea", half: false, required: true, placeholder: "Describe the services/work to be performed..." },
  { name: "paymentTerms", label: "Payment Terms", type: "textarea", half: false, placeholder: "e.g. 50% advance, 50% on completion" },
  { name: "additionalClauses", label: "Additional Clauses", type: "textarea", half: false, placeholder: "Any extra terms or conditions..." },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm", position: "relative" }}>
      {assets.letterhead && <img src={assets.letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 36px", color: "white" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" }}>{data.agreementType || "Service Agreement"}</div>
      </div>
      <div style={{ padding: "28px 36px", fontSize: "13px", lineHeight: "1.9", color: "#1f2937" }}>
        <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>Date: {formatDate(data.startDate)}</p>

        <p>This <strong>{data.agreementType || "Service Agreement"}</strong> (&quot;Agreement&quot;) is entered into on <strong>{formatDate(data.startDate)}</strong> by and between:</p>

        <div style={{ display: "flex", gap: "24px", margin: "20px 0" }}>
          <div style={{ flex: 1, background: c.accent, borderRadius: "8px", padding: "16px", borderLeft: `4px solid ${c.primary}` }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>First Party</div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{companyName}</div>
            {companyAddress && <div style={{ fontSize: "11px", color: "#6b7280" }}>{companyAddress}</div>}
          </div>
          <div style={{ flex: 1, background: c.accent, borderRadius: "8px", padding: "16px", borderLeft: `4px solid ${c.secondary}` }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: c.secondary, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Second Party</div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{data.partyName || "-"}</div>
            {data.partyAddress && <div style={{ fontSize: "11px", color: "#6b7280" }}>{data.partyAddress}</div>}
          </div>
        </div>

        <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginTop: "20px" }}>1. Scope of Work</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{data.scope || "-"}</p>

        {data.endDate && <><h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginTop: "16px" }}>2. Duration</h3><p>This agreement is effective from <strong>{formatDate(data.startDate)}</strong> to <strong>{formatDate(data.endDate)}</strong>.</p></>}

        {data.value && <><h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginTop: "16px" }}>3. Agreement Value</h3><p>The total value of this agreement is <strong>₹{parseInt(data.value).toLocaleString("en-IN")}</strong>.</p></>}

        {data.paymentTerms && <><h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginTop: "16px" }}>4. Payment Terms</h3><p style={{ whiteSpace: "pre-wrap" }}>{data.paymentTerms}</p></>}

        <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginTop: "16px" }}>5. General Terms</h3>
        <ol style={{ paddingLeft: "20px", fontSize: "12px", color: "#4b5563" }}>
          <li>Both parties agree to maintain confidentiality of all proprietary information.</li>
          <li>Either party may terminate this agreement with 30 days written notice.</li>
          <li>Any disputes shall be resolved through mutual discussion. If unresolved, disputes shall be subject to the jurisdiction of local courts.</li>
          <li>This agreement constitutes the entire understanding between the parties.</li>
        </ol>

        {data.additionalClauses && <><h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginTop: "16px" }}>6. Additional Clauses</h3><p style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>{data.additionalClauses}</p></>}

        <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", color: c.primary }}>First Party</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>{companyName}</p>
              <p style={{ fontSize: "11px", color: "#9ca3af" }}>Date: _______________</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: `2px solid ${c.secondary}`, width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", color: c.secondary }}>Second Party</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>{data.partyName || "-"}</p>
              <p style={{ fontSize: "11px", color: "#9ca3af" }}>Date: _______________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceAgreementPage() {
  return <DocGenerator title="Service Agreement" fields={fields} templates={legalTemplates} renderDoc={renderDoc} />;
}
