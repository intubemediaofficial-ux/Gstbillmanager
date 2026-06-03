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
  { name: "department", label: "Department", placeholder: "e.g. Engineering" },
  { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
  { name: "lastDate", label: "Last Working Date", type: "date", required: true },
  { name: "resignDate", label: "Date of Resignation", type: "date" },
  { name: "hrName", label: "Authorized Person", placeholder: "HR / Director name" },
  { name: "hrDesignation", label: "Designation", placeholder: "e.g. HR Manager" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state, firm?.pincode].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";
  const companyPhone = firm?.phone || "";
  const companyEmail = firm?.email || "";
  const refNo = `RL-${new Date().getFullYear()}-${String(Math.random()).slice(2, 10).toUpperCase()}`;

  const headingStyle = { fontSize: "13.5px", fontWeight: 700 as const, color: c.primary, marginBottom: "8px", marginTop: "20px" };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm", position: "relative" }}>
      {assets.letterhead && <img src={assets.letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}

      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 40px", color: "white" }}>
        <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
        {companyAddress && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.85 }}>{companyAddress}</div>}
        <div style={{ fontSize: "10.5px", marginTop: "2px", opacity: 0.75 }}>
          {companyPhone && `Ph: ${companyPhone}`}{companyEmail && ` | ${companyEmail}`}{companyGstin && ` | GST: ${companyGstin}`}
        </div>
      </div>

      <div style={{ height: "3px", background: `linear-gradient(90deg, ${c.primary}, #e53e3e, ${c.secondary})` }} />

      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 40px", fontSize: "11px", color: "#6b7280" }}>
        <span>Ref: {refNo}</span>
        <span>Date: {formatDate(data.lastDate) || formatDate("")}</span>
      </div>

      <div style={{ textAlign: "center", padding: "0 40px 16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: c.primary, letterSpacing: "4px", textTransform: "uppercase", margin: 0, textDecoration: "underline", textUnderlineOffset: "6px" }}>Relieving Letter</h2>
      </div>

      <div style={{ padding: "8px 40px 32px", fontSize: "12.5px", lineHeight: "1.9", color: "#1f2937" }}>
        <p>Dear <strong style={{ color: c.primary }}>{data.employeeName || "___________"}</strong>,</p>
        {data.fatherName && <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>S/o / D/o: {data.fatherName}</p>}

        <p style={{ marginTop: "12px" }}>
          This is to inform you that your resignation{data.resignDate ? `, submitted on ${formatDate(data.resignDate)},` : ""} has been duly accepted. You are hereby relieved from your duties at <strong>{companyName}</strong> effective <strong>{formatDate(data.lastDate)}</strong>.
        </p>

        {/* Employment Details */}
        <h3 style={headingStyle}>Employment Details</h3>
        <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", border: `1px solid ${c.primary}20` }}>
          <thead>
            <tr style={{ background: c.primary, color: "white" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, width: "40%" }}>Particulars</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Employee Name</td><td style={{ padding: "7px 12px" }}>{data.employeeName}</td></tr>
            {data.employeeId && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Employee ID</td><td style={{ padding: "7px 12px" }}>{data.employeeId}</td></tr>}
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Designation</td><td style={{ padding: "7px 12px" }}>{data.designation}</td></tr>
            {data.department && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Department</td><td style={{ padding: "7px 12px" }}>{data.department}</td></tr>}
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Date of Joining</td><td style={{ padding: "7px 12px" }}>{formatDate(data.joiningDate)}</td></tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Last Working Date</td><td style={{ padding: "7px 12px" }}>{formatDate(data.lastDate)}</td></tr>
            {data.resignDate && <tr><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Resignation Date</td><td style={{ padding: "7px 12px" }}>{formatDate(data.resignDate)}</td></tr>}
          </tbody>
        </table>

        {/* Clearance */}
        <h3 style={headingStyle}>Clearance & Settlement</h3>
        <p style={{ fontSize: "12px", color: "#374151", marginBottom: "8px" }}>We hereby confirm that:</p>
        <ul style={{ paddingLeft: "20px", fontSize: "12px", color: "#374151", lineHeight: "1.9", margin: "8px 0" }}>
          <li>All dues and full & final settlement have been cleared. There are no pending financial obligations from either side.</li>
          <li>All company property including laptop, ID card, access cards, keys, and any other assets have been duly returned.</li>
          <li>The employee has completed the required knowledge transfer and handover process to the satisfaction of the reporting authority.</li>
          <li>All access credentials, email accounts, and system access have been deactivated as per company policy.</li>
          <li>The employee has signed the Non-Disclosure Agreement undertaking and is bound by its terms even after separation.</li>
        </ul>

        {/* Obligations */}
        <h3 style={headingStyle}>Post-Employment Obligations</h3>
        <ul style={{ paddingLeft: "20px", fontSize: "12px", color: "#374151", lineHeight: "1.9", margin: "8px 0" }}>
          <li>You shall continue to maintain confidentiality of all company information, trade secrets, and client data as per the NDA signed at the time of joining.</li>
          <li>You shall not solicit any employees or clients of the company for a period of 6 months from the date of relieving.</li>
          <li>Any proprietary material, documents, or data in your possession must be destroyed or returned immediately.</li>
        </ul>

        <p style={{ marginTop: "20px", fontSize: "12px", color: "#374151" }}>
          We appreciate your contributions during your tenure with <strong>{companyName}</strong> and wish you all the very best in your future professional endeavors.
        </p>
        <p style={{ fontSize: "12px", color: "#374151", marginTop: "8px" }}>
          This letter is issued on request for the purpose of records and future employment reference.
        </p>

        {/* Signature */}
        <div style={{ marginTop: "50px" }}>
          <p style={{ fontSize: "12px", margin: "0 0 30px" }}>For & on behalf of <strong style={{ color: c.primary }}>{companyName}</strong></p>
          {assets.signature && <img src={assets.signature} alt="Signature" style={{ height: "50px", objectFit: "contain", marginBottom: "4px" }} />}
          <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary, margin: "0 0 2px" }}>{data.hrName || "Authorized Signatory"}</p>
            <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{data.hrDesignation || "HR Manager"}</p>
            <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{companyName}</p>
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

export default function RelievingLetterPage() {
  return <DocGenerator title="Relieving Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
