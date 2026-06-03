"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef, DocAssets } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "employeeName", label: "Employee Name", required: true, placeholder: "Full name" },
  { name: "fatherName", label: "Father's Name", placeholder: "Father's name" },
  { name: "employeeId", label: "Employee ID", placeholder: "e.g. EMP-001" },
  { name: "designation", label: "Designation", required: true, placeholder: "e.g. Senior Developer" },
  { name: "department", label: "Department", placeholder: "e.g. Technology" },
  { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
  { name: "lastDate", label: "Last Working Date", type: "date", required: true },
  { name: "salary", label: "Last Drawn CTC (₹/month)", type: "number", placeholder: "e.g. 60000" },
  { name: "performance", label: "Performance Rating", type: "select", options: ["Outstanding", "Excellent", "Very Good", "Good", "Satisfactory"] },
  { name: "responsibilities", label: "Key Responsibilities", type: "textarea", half: false, placeholder: "Brief description of duties performed..." },
  { name: "remarks", label: "Additional Remarks", type: "textarea", half: false, placeholder: "Any specific achievements..." },
  { name: "hrName", label: "Authorized Person", placeholder: "HR / Director name" },
  { name: "hrDesignation", label: "Designation", placeholder: "e.g. Managing Director" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state, firm?.pincode].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";
  const companyPhone = firm?.phone || "";
  const companyEmail = firm?.email || "";
  const refNo = `EXP-${new Date().getFullYear()}-${String(Math.random()).slice(2, 10).toUpperCase()}`;

  const perfText: Record<string, string> = {
    Outstanding: "demonstrated outstanding performance, exceptional dedication, and remarkable leadership qualities",
    Excellent: "consistently delivered excellent results, showed strong commitment, and exceeded expectations in all assigned responsibilities",
    "Very Good": "shown very good professional abilities, maintained high standards, and contributed significantly to team objectives",
    Good: "performed duties with diligence, maintained good professional standards, and been a reliable team member",
    Satisfactory: "fulfilled assigned responsibilities satisfactorily and shown adequate professional conduct",
  };

  const headingStyle = { fontSize: "13.5px", fontWeight: 700 as const, color: c.primary, marginBottom: "8px", marginTop: "20px" };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm", position: "relative" }}>
      {assets.letterhead && <img src={assets.letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}

      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 40px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "26px", fontWeight: 800 }}>{companyName}</div>
            {companyAddress && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.85 }}>{companyAddress}</div>}
            <div style={{ fontSize: "10.5px", marginTop: "2px", opacity: 0.75 }}>
              {companyPhone && `Ph: ${companyPhone}`}{companyEmail && ` | ${companyEmail}`}{companyGstin && ` | GST: ${companyGstin}`}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "3px", background: `linear-gradient(90deg, ${c.primary}, #e53e3e, ${c.secondary})` }} />

      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 40px", fontSize: "11px", color: "#6b7280" }}>
        <span>Ref: {refNo}</span>
        <span>Date: {formatDate("")}</span>
      </div>

      <div style={{ textAlign: "center", padding: "0 40px 16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: c.primary, letterSpacing: "4px", textTransform: "uppercase", margin: 0, textDecoration: "underline", textUnderlineOffset: "6px" }}>Experience Certificate</h2>
      </div>

      <div style={{ padding: "8px 40px 32px", fontSize: "12.5px", lineHeight: "1.9", color: "#1f2937" }}>
        <p style={{ fontSize: "14px", fontWeight: 600 }}>To Whom It May Concern,</p>

        <p style={{ marginTop: "14px" }}>
          This is to certify that <strong style={{ color: c.primary }}>{data.employeeName || "___________"}</strong>
          {data.fatherName ? `, S/o / D/o ${data.fatherName},` : ""}
          {data.employeeId ? ` (Employee ID: ${data.employeeId})` : ""} was employed with
          <strong> {companyName}</strong> as <strong>{data.designation || "___________"}</strong>
          {data.department ? ` in the ${data.department} department` : ""} from
          <strong> {formatDate(data.joiningDate)}</strong> to <strong>{formatDate(data.lastDate)}</strong>.
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
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Period of Service</td><td style={{ padding: "7px 12px" }}>{formatDate(data.joiningDate)} to {formatDate(data.lastDate)}</td></tr>
            {data.salary && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Last Drawn CTC</td><td style={{ padding: "7px 12px", fontWeight: 700, color: c.primary }}>₹{parseInt(data.salary).toLocaleString("en-IN")}/month</td></tr>}
            {data.performance && <tr><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Performance Rating</td><td style={{ padding: "7px 12px", fontWeight: 700, color: c.primary }}>{data.performance}</td></tr>}
          </tbody>
        </table>

        {/* Performance */}
        <h3 style={headingStyle}>Performance & Conduct</h3>
        <p style={{ fontSize: "12px", color: "#374151" }}>
          During the tenure with us, <strong>{data.employeeName?.split(" ")[0] || "the employee"}</strong> has {perfText[data.performance || "Good"] || perfText.Good}. Their conduct and behaviour with colleagues, seniors, and clients has been commendable throughout the employment period.
        </p>

        {/* Responsibilities */}
        {data.responsibilities && (
          <>
            <h3 style={headingStyle}>Key Responsibilities</h3>
            <p style={{ fontSize: "12px", color: "#374151" }}>{data.responsibilities}</p>
          </>
        )}

        {/* Additional Remarks */}
        {data.remarks && (
          <>
            <h3 style={headingStyle}>Remarks</h3>
            <p style={{ fontSize: "12px", color: "#374151" }}>{data.remarks}</p>
          </>
        )}

        {/* Separation */}
        <h3 style={headingStyle}>Separation Details</h3>
        <p style={{ fontSize: "12px", color: "#374151" }}>
          {data.employeeName?.split(" ")[0] || "The employee"} has been relieved from duties on <strong>{formatDate(data.lastDate)}</strong> after completing all formalities including proper handover, return of company assets, and clearance of all dues. There are no pending obligations from either side.
        </p>

        {/* Wishes */}
        <p style={{ marginTop: "20px", fontSize: "12px", color: "#374151" }}>
          We wish <strong>{data.employeeName?.split(" ")[0] || "them"}</strong> all the very best in future professional endeavors. We highly recommend {data.employeeName?.split(" ")[0] || "them"} for any position commensurate with their skills and experience.
        </p>

        <p style={{ fontSize: "12px", color: "#374151", marginTop: "8px" }}>
          This certificate is issued on request and without any prejudice, for whatever purpose it may serve.
        </p>

        {/* Signature */}
        <div style={{ marginTop: "50px" }}>
          <p style={{ fontSize: "12px", margin: "0 0 30px" }}>For & on behalf of <strong style={{ color: c.primary }}>{companyName}</strong></p>
          {assets.signature && <img src={assets.signature} alt="Signature" style={{ height: "50px", objectFit: "contain", marginBottom: "4px" }} />}
          <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary, margin: "0 0 2px" }}>{data.hrName || "Authorized Signatory"}</p>
            <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{data.hrDesignation || "Director"}</p>
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

export default function ExperienceLetterPage() {
  return <DocGenerator title="Experience Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
