"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "employeeName", label: "Employee Name", required: true, placeholder: "Full name" },
  { name: "employeeId", label: "Employee ID", placeholder: "e.g. EMP-001" },
  { name: "designation", label: "Designation", required: true, placeholder: "e.g. Software Engineer" },
  { name: "department", label: "Department", placeholder: "e.g. Engineering" },
  { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
  { name: "lastDate", label: "Last Working Date", type: "date", required: true },
  { name: "resignDate", label: "Date of Resignation", type: "date" },
  { name: "remarks", label: "HR Remarks", type: "textarea", half: false, placeholder: "Any remarks..." },
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
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: c.primary, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Relieving Letter</h2>
      </div>
      <div style={{ padding: "32px 40px", fontSize: "13.5px", lineHeight: "1.9", color: "#1f2937" }}>
        <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>Date: {formatDate(data.lastDate)}</p>
        <p>Dear <strong>{data.employeeName || "___________"}</strong>,</p>

        <p>This is to inform you that your resignation{data.resignDate ? `, submitted on ${formatDate(data.resignDate)},` : ""} has been accepted, and you are hereby relieved from your duties at <strong>{companyName}</strong> effective <strong>{formatDate(data.lastDate)}</strong>.</p>

        <div style={{ background: c.accent, borderRadius: "8px", padding: "20px", margin: "24px 0", borderLeft: `4px solid ${c.primary}` }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginBottom: "12px" }}>Employment Details</h3>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <tbody>
              <tr><td style={{ padding: "6px 0", fontWeight: 600, width: "40%", color: "#4b5563" }}>Name</td><td>{data.employeeName}</td></tr>
              {data.employeeId && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Employee ID</td><td>{data.employeeId}</td></tr>}
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Designation</td><td>{data.designation}</td></tr>
              {data.department && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Department</td><td>{data.department}</td></tr>}
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Period of Service</td><td>{formatDate(data.joiningDate)} to {formatDate(data.lastDate)}</td></tr>
            </tbody>
          </table>
        </div>

        <p>We confirm that:</p>
        <ul style={{ paddingLeft: "20px", fontSize: "12.5px", color: "#4b5563" }}>
          <li>All dues have been cleared and there are no pending obligations from either side.</li>
          <li>All company property, documents, and assets have been returned.</li>
          <li>The employee has completed the required handover process.</li>
        </ul>

        {data.remarks && <p style={{ marginTop: "12px" }}>{data.remarks}</p>}

        <p>We appreciate your contributions during your tenure with us and wish you all the best in your future endeavors.</p>

        <div style={{ marginTop: "60px" }}>
          <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary }}>For {companyName}</p>
            <p style={{ fontSize: "12px", color: "#6b7280" }}>HR Department</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RelievingLetterPage() {
  return <DocGenerator title="Relieving Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
