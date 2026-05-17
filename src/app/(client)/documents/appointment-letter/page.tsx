"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "employeeName", label: "Employee Name", required: true, placeholder: "Full name" },
  { name: "fatherName", label: "Father's Name", placeholder: "Father's name" },
  { name: "designation", label: "Position / Designation", required: true, placeholder: "e.g. Senior Developer" },
  { name: "department", label: "Department", placeholder: "e.g. Technology" },
  { name: "salary", label: "Monthly CTC (₹)", type: "number", required: true, placeholder: "e.g. 60000" },
  { name: "probation", label: "Probation Period", type: "select", options: ["3 Months", "6 Months", "1 Year"] },
  { name: "joiningDate", label: "Date of Appointment", type: "date", required: true },
  { name: "workTiming", label: "Office Timing", placeholder: "e.g. 9:30 AM - 6:30 PM" },
  { name: "location", label: "Work Location", placeholder: "e.g. Raipur, CG" },
  { name: "noticePeriod", label: "Notice Period", type: "select", options: ["15 Days", "1 Month", "2 Months", "3 Months"] },
  { name: "terms", label: "Additional Terms", type: "textarea", half: false, placeholder: "Any special clauses..." },
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
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: c.primary, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Letter of Appointment</h2>
      </div>
      <div style={{ padding: "32px 40px", fontSize: "13.5px", lineHeight: "1.8", color: "#1f2937" }}>
        <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>Date: {formatDate(data.joiningDate)}</p>
        <p>Dear <strong>{data.employeeName || "___________"}</strong>,</p>
        {data.fatherName && <p style={{ fontSize: "12.5px", color: "#6b7280" }}>S/o / D/o: {data.fatherName}</p>}

        <p>We are pleased to appoint you as <strong>{data.designation || "___________"}</strong>{data.department ? ` in the ${data.department} department` : ""} at <strong>{companyName}</strong>, effective from <strong>{formatDate(data.joiningDate)}</strong>.</p>

        <div style={{ background: c.accent, borderRadius: "8px", padding: "20px", margin: "20px 0", borderLeft: `4px solid ${c.primary}` }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginBottom: "12px" }}>Appointment Details</h3>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <tbody>
              <tr><td style={{ padding: "6px 0", fontWeight: 600, width: "40%", color: "#4b5563" }}>Position</td><td>{data.designation}</td></tr>
              {data.department && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Department</td><td>{data.department}</td></tr>}
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Monthly CTC</td><td style={{ fontWeight: 700, color: c.primary }}>₹{parseInt(data.salary || "0").toLocaleString("en-IN")}</td></tr>
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Annual CTC</td><td style={{ fontWeight: 700, color: c.primary }}>₹{(parseInt(data.salary || "0") * 12).toLocaleString("en-IN")}</td></tr>
              {data.probation && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Probation Period</td><td>{data.probation}</td></tr>}
              {data.workTiming && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Office Hours</td><td>{data.workTiming}</td></tr>}
              {data.location && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Location</td><td>{data.location}</td></tr>}
              {data.noticePeriod && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Notice Period</td><td>{data.noticePeriod}</td></tr>}
            </tbody>
          </table>
        </div>

        <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary }}>Terms & Conditions:</h3>
        <ol style={{ paddingLeft: "20px", fontSize: "12.5px", color: "#4b5563" }}>
          <li>You will be on probation for {data.probation || "6 Months"} from the date of joining.</li>
          <li>During probation, either party may terminate employment with {data.noticePeriod || "1 Month"} prior written notice.</li>
          <li>After confirmation, termination requires {data.noticePeriod || "1 Month"} notice from either side.</li>
          <li>You shall not disclose any confidential information of the company during or after employment.</li>
          <li>You will abide by all company rules, regulations, and policies.</li>
          <li>Your employment is subject to satisfactory verification of your credentials.</li>
          {data.terms && <li>{data.terms}</li>}
        </ol>

        <p style={{ marginTop: "16px" }}>Please sign and return the duplicate copy of this letter as a token of your acceptance of the above terms and conditions.</p>
        <p>Congratulations and welcome to the team!</p>

        <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary }}>For {companyName}</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Authorized Signatory</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: "2px solid #9ca3af", width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 600, fontSize: "13px" }}>Employee Acceptance</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>Date: _______________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentLetterPage() {
  return <DocGenerator title="Appointment Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
