"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "employeeName", label: "Employee Name", required: true, placeholder: "Full name" },
  { name: "employeeId", label: "Employee ID", placeholder: "e.g. EMP-001" },
  { name: "designation", label: "Designation", required: true, placeholder: "e.g. Software Engineer" },
  { name: "department", label: "Department", required: true, placeholder: "e.g. Engineering" },
  { name: "joiningDate", label: "Joining Date", type: "date", required: true },
  { name: "reportingManager", label: "Reporting Manager", placeholder: "Manager name" },
  { name: "location", label: "Work Location", placeholder: "e.g. Mumbai Office" },
  { name: "salary", label: "Monthly CTC (₹)", type: "number", placeholder: "e.g. 50000" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm" }}>
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "32px 40px", color: "white" }}>
        <div style={{ fontSize: "28px", fontWeight: 800 }}>{companyName}</div>
        {companyAddress && <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>{companyAddress}</div>}
      </div>
      <div style={{ background: c.accent, padding: "14px 40px", borderBottom: `3px solid ${c.primary}` }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: c.primary, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Joining Letter</h2>
      </div>
      <div style={{ padding: "32px 40px", fontSize: "13.5px", lineHeight: "1.8", color: "#1f2937" }}>
        <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>Date: {formatDate(data.joiningDate)}</p>
        <p>Dear <strong>{data.employeeName || "___________"}</strong>,</p>
        <p>With reference to your application and the subsequent discussions, we are pleased to confirm your appointment as <strong>{data.designation || "___________"}</strong> in the <strong>{data.department || "___________"}</strong> department at <strong>{companyName}</strong>.</p>

        <div style={{ background: c.accent, borderRadius: "8px", padding: "20px", margin: "20px 0", borderLeft: `4px solid ${c.primary}` }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginBottom: "12px" }}>Joining Details</h3>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <tbody>
              {data.employeeId && <tr><td style={{ padding: "6px 0", fontWeight: 600, width: "40%", color: "#4b5563" }}>Employee ID</td><td>{data.employeeId}</td></tr>}
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Designation</td><td>{data.designation}</td></tr>
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Department</td><td>{data.department}</td></tr>
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Date of Joining</td><td>{formatDate(data.joiningDate)}</td></tr>
              {data.reportingManager && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Reporting To</td><td>{data.reportingManager}</td></tr>}
              {data.location && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Work Location</td><td>{data.location}</td></tr>}
              {data.salary && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Monthly CTC</td><td style={{ fontWeight: 700, color: c.primary }}>₹{parseInt(data.salary).toLocaleString("en-IN")}</td></tr>}
            </tbody>
          </table>
        </div>

        <p>You are requested to report to <strong>{data.reportingManager || "your reporting manager"}</strong> at <strong>{data.location || "the office"}</strong> on <strong>{formatDate(data.joiningDate)}</strong>.</p>
        <p>Please bring the following documents on the day of joining:</p>
        <ul style={{ paddingLeft: "20px", fontSize: "12.5px", color: "#4b5563" }}>
          <li>Original educational certificates for verification</li>
          <li>Experience/Relieving letter from previous employer</li>
          <li>2 passport size photographs</li>
          <li>PAN Card, Aadhaar Card copy</li>
          <li>Bank account details for salary processing</li>
        </ul>
        <p style={{ marginTop: "16px" }}>We welcome you to our team and look forward to a successful professional journey together.</p>
        <p>Best Regards,</p>
        <div style={{ marginTop: "50px", borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
          <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary }}>Authorized Signatory</p>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>{companyName}</p>
        </div>
      </div>
    </div>
  );
}

export default function JoiningLetterPage() {
  return <DocGenerator title="Joining Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
