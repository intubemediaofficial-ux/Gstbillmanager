"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef, DocAssets } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "employeeName", label: "Employee Name", required: true, placeholder: "Full name" },
  { name: "fatherName", label: "Father's Name", placeholder: "Father's name" },
  { name: "employeeId", label: "Employee ID", placeholder: "e.g. EMP-001" },
  { name: "designation", label: "Designation", required: true, placeholder: "e.g. Software Engineer" },
  { name: "department", label: "Department", required: true, placeholder: "e.g. Engineering" },
  { name: "joiningDate", label: "Joining Date", type: "date", required: true },
  { name: "reportingManager", label: "Reporting Manager", placeholder: "Manager name" },
  { name: "location", label: "Work Location", placeholder: "e.g. Mumbai Office" },
  { name: "salary", label: "Monthly CTC (₹)", type: "number", placeholder: "e.g. 50000" },
  { name: "workTiming", label: "Work Timing", placeholder: "e.g. 9:30 AM - 6:30 PM" },
  { name: "probation", label: "Probation Period", type: "select", options: ["1 Month", "3 Months", "6 Months"] },
  { name: "noticePeriod", label: "Notice Period", type: "select", options: ["7 Days", "15 Days", "1 Month", "2 Months"] },
  { name: "hrName", label: "HR / Authorized Person", placeholder: "HR name" },
  { name: "hrDesignation", label: "HR Designation", placeholder: "e.g. HR Manager" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state, firm?.pincode].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";
  const companyPhone = firm?.phone || "";
  const companyEmail = firm?.email || "";
  const refNo = `JL-${new Date().getFullYear()}-${String(Math.random()).slice(2, 10).toUpperCase()}`;

  const sectionStyle = { marginTop: "20px" };
  const headingStyle = { fontSize: "13.5px", fontWeight: 700 as const, color: c.primary, marginBottom: "8px" };
  const bulletStyle = { paddingLeft: "20px", fontSize: "12px", color: "#374151", lineHeight: "1.9", margin: "8px 0" };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm", position: "relative" }}>
      {assets.letterhead && <img src={assets.letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 40px", color: "white" }}>
        <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
        {companyAddress && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.85 }}>{companyAddress}</div>}
        <div style={{ fontSize: "10.5px", marginTop: "2px", opacity: 0.75 }}>
          {companyPhone && `Ph: ${companyPhone}`}{companyEmail && ` | ${companyEmail}`}{companyGstin && ` | GST: ${companyGstin}`}
        </div>
      </div>

      <div style={{ height: "3px", background: `linear-gradient(90deg, ${c.primary}, #e53e3e, ${c.secondary})` }} />

      {/* Ref + Date */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 40px", fontSize: "11px", color: "#6b7280" }}>
        <span>Ref: {refNo}</span>
        <span>Date: {formatDate(data.joiningDate) || formatDate("")}</span>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", padding: "0 40px 16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: c.primary, letterSpacing: "4px", textTransform: "uppercase", margin: 0, textDecoration: "underline", textUnderlineOffset: "6px" }}>Joining Letter</h2>
      </div>

      {/* Body */}
      <div style={{ padding: "8px 40px 32px", fontSize: "12.5px", lineHeight: "1.8", color: "#1f2937" }}>
        <p>Dear <strong style={{ color: c.primary }}>{data.employeeName || "___________"}</strong>,</p>
        {data.fatherName && <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>S/o / D/o: {data.fatherName}</p>}

        <p style={{ marginTop: "12px" }}>
          With reference to your application and the subsequent discussions, we are pleased to confirm your joining as <strong>{data.designation || "___________"}</strong> in the <strong>{data.department || "___________"}</strong> department at <strong>{companyName}</strong>, effective from <strong>{formatDate(data.joiningDate)}</strong>.
        </p>

        {/* 1. Joining Details */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>1. Employment Details</h3>
          <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", border: `1px solid ${c.primary}20` }}>
            <thead>
              <tr style={{ background: c.primary, color: "white" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, width: "40%" }}>Particulars</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.employeeId && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Employee ID</td><td style={{ padding: "7px 12px" }}>{data.employeeId}</td></tr>}
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Designation</td><td style={{ padding: "7px 12px" }}>{data.designation}</td></tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Department</td><td style={{ padding: "7px 12px" }}>{data.department}</td></tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Date of Joining</td><td style={{ padding: "7px 12px" }}>{formatDate(data.joiningDate)}</td></tr>
              {data.reportingManager && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Reporting To</td><td style={{ padding: "7px 12px" }}>{data.reportingManager}</td></tr>}
              {data.location && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Work Location</td><td style={{ padding: "7px 12px" }}>{data.location}</td></tr>}
              {data.workTiming && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Work Timing</td><td style={{ padding: "7px 12px" }}>{data.workTiming}</td></tr>}
              {data.salary && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Monthly CTC</td><td style={{ padding: "7px 12px", fontWeight: 700, color: c.primary }}>₹{parseInt(data.salary).toLocaleString("en-IN")}</td></tr>}
              {data.probation && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Probation Period</td><td style={{ padding: "7px 12px" }}>{data.probation}</td></tr>}
              {data.noticePeriod && <tr><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Notice Period</td><td style={{ padding: "7px 12px" }}>{data.noticePeriod}</td></tr>}
            </tbody>
          </table>
        </div>

        {/* 2. Reporting Instructions */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>2. Reporting Instructions</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            You are requested to report to <strong>{data.reportingManager || "your reporting manager"}</strong> at <strong>{data.location || "the office"}</strong> on <strong>{formatDate(data.joiningDate)}</strong> at {data.workTiming || "the designated time"}.
          </p>
        </div>

        {/* 3. Documents Required */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>3. Documents Required on Joining</h3>
          <p style={{ fontSize: "12px", color: "#374151", marginBottom: "6px" }}>Please bring the following original documents on the day of joining:</p>
          <ul style={bulletStyle}>
            <li>Original educational certificates and mark sheets for verification</li>
            <li>Experience/Relieving letter from previous employer (if applicable)</li>
            <li>Last 3 months salary slips from previous employer (if applicable)</li>
            <li>2 passport-size photographs (white background)</li>
            <li>Aadhaar Card (original + photocopy)</li>
            <li>PAN Card (original + photocopy)</li>
            <li>Bank account details (passbook/cancelled cheque) for salary processing</li>
            <li>Medical fitness certificate (if applicable)</li>
          </ul>
        </div>

        {/* 4. Terms of Employment */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>4. Terms of Employment</h3>
          <ul style={bulletStyle}>
            <li>You will be on probation for <strong>{data.probation || "6 Months"}</strong> from the date of joining. Confirmation will be subject to satisfactory performance.</li>
            <li>During probation, either party may terminate employment with <strong>{data.noticePeriod || "7 Days"}</strong> notice or salary in lieu thereof.</li>
            <li>After confirmation, termination requires <strong>{data.noticePeriod || "1 Month"}</strong> written notice from either side.</li>
            <li>You shall maintain strict confidentiality of all company information, trade secrets, and client data.</li>
            <li>You shall not engage in any other employment, business, or freelancing activity without prior written approval.</li>
            <li>Company reserves the right to transfer you to any department, project, or location as per business needs.</li>
          </ul>
        </div>

        {/* 5. Code of Conduct */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>5. Code of Conduct</h3>
          <ul style={bulletStyle}>
            <li>Maintain professional behaviour and adhere to all workplace policies and guidelines.</li>
            <li>Follow the prescribed work schedule and obtain prior written approval for any leave.</li>
            <li>Complete all assigned tasks within stipulated deadlines with quality standards.</li>
            <li>Treat colleagues, clients, and stakeholders with respect and integrity.</li>
            <li>Use of personal mobile phones during working hours shall be restricted to break periods.</li>
            <li>Any misconduct, insubordination, or policy violation may lead to disciplinary action including termination.</li>
          </ul>
        </div>

        <p style={{ marginTop: "20px", fontSize: "12px" }}>
          We welcome you to our team and look forward to a successful and rewarding professional journey together.
        </p>

        {/* Signature */}
        <div style={{ marginTop: "40px" }}>
          <p style={{ fontSize: "12px" }}>For & on behalf of <strong style={{ color: c.primary }}>{companyName}</strong>.</p>
          <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
            <div>
              {assets.signature && <img src={assets.signature} alt="Signature" style={{ height: "50px", objectFit: "contain", marginBottom: "4px" }} />}
              <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary, margin: "0 0 2px" }}>{data.hrName || "Authorized Signatory"}</p>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{data.hrDesignation || "HR Manager"}</p>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{companyName}</p>
              </div>
            </div>
            <div>
              <div style={{ borderTop: "2px solid #9ca3af", width: "200px", paddingTop: "8px" }}>
                <p style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 2px" }}>Employee Acceptance</p>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Signature: _______________</p>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0" }}>Date: _______________</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "10px 40px", color: "white", fontSize: "10px", textAlign: "center", opacity: 0.9 }}>
        {companyName}{companyAddress && ` | ${companyAddress}`}{companyPhone && ` | Ph: ${companyPhone}`}{companyGstin && ` | GST: ${companyGstin}`}
      </div>
    </div>
  );
}

export default function JoiningLetterPage() {
  return <DocGenerator title="Joining Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
