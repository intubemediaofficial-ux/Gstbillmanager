"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { legalTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "authorizedPerson", label: "Authorized Person Name", required: true, placeholder: "Person being authorized" },
  { name: "authorizedDesignation", label: "Authorized Person Designation", placeholder: "e.g. Manager" },
  { name: "idType", label: "ID Proof Type", type: "select", options: ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID"] },
  { name: "idNumber", label: "ID Number", placeholder: "ID proof number" },
  { name: "purpose", label: "Purpose of Authorization", type: "textarea", half: false, required: true, placeholder: "Describe what the person is authorized to do..." },
  { name: "validFrom", label: "Valid From", type: "date", required: true },
  { name: "validTill", label: "Valid Till", type: "date" },
  { name: "authorizerName", label: "Authorizer Name", required: true, placeholder: "Person giving authorization" },
  { name: "authorizerDesignation", label: "Authorizer Designation", placeholder: "e.g. Director / CEO" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 36px", color: "white" }}>
        <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
        {companyAddress && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.8 }}>{companyAddress}</div>}
        {companyGstin && <div style={{ fontSize: "11px", opacity: 0.7 }}>GSTIN: {companyGstin}</div>}
      </div>
      <div style={{ background: c.accent, padding: "14px 36px", borderBottom: `3px solid ${c.primary}` }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: c.primary, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Letter of Authorization</h2>
      </div>
      <div style={{ padding: "28px 36px", fontSize: "13.5px", lineHeight: "1.9", color: "#1f2937" }}>
        <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>Date: {formatDate(data.validFrom)}</p>
        <p style={{ fontSize: "14px", fontWeight: 600 }}>To Whom It May Concern,</p>

        <p>I, <strong>{data.authorizerName || "___________"}</strong>
          {data.authorizerDesignation ? `, ${data.authorizerDesignation}` : ""} of <strong>{companyName}</strong>, hereby authorize <strong>{data.authorizedPerson || "___________"}</strong>
          {data.authorizedDesignation ? ` (${data.authorizedDesignation})` : ""} to act on behalf of the company for the following purpose:</p>

        <div style={{ background: c.accent, borderRadius: "8px", padding: "20px", margin: "20px 0", borderLeft: `4px solid ${c.primary}` }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: c.primary, marginBottom: "8px" }}>Purpose of Authorization</h3>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "13px" }}>{data.purpose || "-"}</p>
        </div>

        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "16px", margin: "16px 0" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: c.primary, marginBottom: "8px" }}>Authorized Person Details</h3>
          <table style={{ fontSize: "12px" }}>
            <tbody>
              <tr><td style={{ padding: "4px 16px 4px 0", fontWeight: 600, color: "#4b5563" }}>Name</td><td>{data.authorizedPerson}</td></tr>
              {data.authorizedDesignation && <tr><td style={{ padding: "4px 16px 4px 0", fontWeight: 600, color: "#4b5563" }}>Designation</td><td>{data.authorizedDesignation}</td></tr>}
              {data.idType && <tr><td style={{ padding: "4px 16px 4px 0", fontWeight: 600, color: "#4b5563" }}>ID Proof</td><td>{data.idType}</td></tr>}
              {data.idNumber && <tr><td style={{ padding: "4px 16px 4px 0", fontWeight: 600, color: "#4b5563" }}>ID Number</td><td>{data.idNumber}</td></tr>}
            </tbody>
          </table>
        </div>

        <p>This authorization is valid from <strong>{formatDate(data.validFrom)}</strong>{data.validTill ? ` to <strong>${formatDate(data.validTill)}</strong>` : " until further notice"}.</p>

        <p>The authorized person is empowered to sign documents, represent the company, and take necessary actions as specified above.</p>

        <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary }}>{data.authorizerName || "Authorizer"}</p>
              {data.authorizerDesignation && <p style={{ fontSize: "12px", color: "#6b7280" }}>{data.authorizerDesignation}</p>}
              <p style={{ fontSize: "12px", color: "#6b7280" }}>{companyName}</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: "2px solid #9ca3af", width: "200px", paddingTop: "8px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Company Seal / Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthorizationLetterPage() {
  return <DocGenerator title="Authorization Letter" fields={fields} templates={legalTemplates} renderDoc={renderDoc} />;
}
