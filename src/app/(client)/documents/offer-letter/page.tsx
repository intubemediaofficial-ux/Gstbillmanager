"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "candidateName", label: "Candidate Name", required: true, placeholder: "Full name" },
  { name: "fatherName", label: "Father's Name", placeholder: "Father's name" },
  { name: "mobile", label: "Mobile", placeholder: "Phone number" },
  { name: "email", label: "Email", placeholder: "Email address" },
  { name: "address", label: "Address", type: "textarea", half: false, placeholder: "Full address" },
  { name: "designation", label: "Designation", required: true, placeholder: "e.g. Software Engineer" },
  { name: "department", label: "Department", placeholder: "e.g. Engineering" },
  { name: "salary", label: "Monthly Salary (₹)", type: "number", placeholder: "e.g. 50000" },
  { name: "joiningDate", label: "Joining Date", type: "date", required: true },
  { name: "workTiming", label: "Work Timing", placeholder: "e.g. 10:00 AM - 7:00 PM" },
  { name: "hrName", label: "HR / Authorized Person Name", placeholder: "HR name" },
  { name: "terms", label: "Additional Terms", type: "textarea", half: false, placeholder: "Any extra terms..." },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: c.bg, minHeight: "297mm", padding: "0" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "32px 40px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "1px" }}>{companyName}</div>
            {companyAddress && <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>{companyAddress}</div>}
            {companyGstin && <div style={{ fontSize: "11px", marginTop: "2px", opacity: 0.7 }}>GSTIN: {companyGstin}</div>}
          </div>
          <div style={{ fontSize: "11px", textAlign: "right", opacity: 0.9 }}>
            <div>Date: {formatDate(data.joiningDate)}</div>
            <div>Ref: OL/{new Date().getFullYear()}/{String(Math.floor(Math.random() * 9000) + 1000)}</div>
          </div>
        </div>
      </div>

      {/* Title Bar */}
      <div style={{ background: c.accent, padding: "14px 40px", borderBottom: `3px solid ${c.primary}` }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: c.primary, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Offer Letter</h2>
      </div>

      {/* Body */}
      <div style={{ padding: "32px 40px", fontSize: "13.5px", lineHeight: "1.8", color: "#1f2937" }}>
        <p>Dear <strong>{data.candidateName || "___________"}</strong>,</p>

        <p style={{ marginTop: "16px" }}>
          We are pleased to offer you the position of <strong>{data.designation || "___________"}</strong>
          {data.department ? ` in the ${data.department} department` : ""} at <strong>{companyName}</strong>.
          {data.joiningDate ? ` Your expected date of joining is <strong>${formatDate(data.joiningDate)}</strong>.` : ""}
        </p>

        <div style={{ background: c.accent, borderRadius: "8px", padding: "20px", margin: "20px 0", borderLeft: `4px solid ${c.primary}` }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginBottom: "12px" }}>Employment Details</h3>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <tbody>
              <tr><td style={{ padding: "6px 0", fontWeight: 600, width: "40%", color: "#4b5563" }}>Designation</td><td style={{ padding: "6px 0" }}>{data.designation || "-"}</td></tr>
              {data.department && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Department</td><td style={{ padding: "6px 0" }}>{data.department}</td></tr>}
              {data.salary && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Monthly CTC</td><td style={{ padding: "6px 0", fontWeight: 700, color: c.primary }}>₹{parseInt(data.salary).toLocaleString("en-IN")}</td></tr>}
              {data.workTiming && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Work Timing</td><td style={{ padding: "6px 0" }}>{data.workTiming}</td></tr>}
              {data.joiningDate && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Date of Joining</td><td style={{ padding: "6px 0" }}>{formatDate(data.joiningDate)}</td></tr>}
            </tbody>
          </table>
        </div>

        {data.fatherName && <p><strong>Father&apos;s Name:</strong> {data.fatherName}</p>}
        {data.address && <p><strong>Address:</strong> {data.address}</p>}
        {data.mobile && <p><strong>Contact:</strong> {data.mobile}{data.email ? ` | ${data.email}` : ""}</p>}

        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginBottom: "8px" }}>Terms & Conditions:</h3>
          <ul style={{ paddingLeft: "20px", fontSize: "12.5px", color: "#4b5563" }}>
            <li>This offer is subject to verification of your documents and qualifications.</li>
            <li>You will be on probation for a period of 6 months from the date of joining.</li>
            <li>During probation, either party may terminate with 15 days notice.</li>
            <li>You are required to maintain confidentiality of company information.</li>
            {data.terms && <li>{data.terms}</li>}
          </ul>
        </div>

        <p style={{ marginTop: "24px" }}>
          We look forward to your joining and a mutually rewarding association. Please sign and return a copy of this letter as your acceptance.
        </p>

        <p style={{ marginTop: "8px" }}>Warm Regards,</p>

        {/* Signature Area */}
        <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary }}>{data.hrName || "Authorized Signatory"}</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>{companyName}</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: "2px solid #9ca3af", width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 600, fontSize: "13px", color: "#4b5563" }}>Candidate Acceptance</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Date: _______________</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "12px 40px", color: "white", fontSize: "10px", textAlign: "center", opacity: 0.9, marginTop: "auto" }}>
        This is a computer-generated document. | {companyName} {companyGstin ? `| GSTIN: ${companyGstin}` : ""}
      </div>
    </div>
  );
}

export default function OfferLetterPage() {
  return <DocGenerator title="Offer Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
