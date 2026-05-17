"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef, DocAssets } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "employeeName", label: "Employee Name", required: true, placeholder: "Full name" },
  { name: "employeeId", label: "Employee ID", placeholder: "e.g. EMP-001" },
  { name: "designation", label: "Designation", required: true, placeholder: "e.g. Senior Developer" },
  { name: "department", label: "Department", placeholder: "e.g. Technology" },
  { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
  { name: "lastDate", label: "Last Working Date", type: "date", required: true },
  { name: "performance", label: "Performance Rating", type: "select", options: ["Outstanding", "Excellent", "Very Good", "Good", "Satisfactory"] },
  { name: "remarks", label: "Additional Remarks", type: "textarea", half: false, placeholder: "Any specific achievements or remarks..." },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";

  const perfText: Record<string, string> = {
    Outstanding: "demonstrated outstanding performance, exceptional dedication, and remarkable leadership qualities",
    Excellent: "consistently delivered excellent results, showed strong commitment, and exceeded expectations",
    "Very Good": "shown very good professional abilities, maintained high standards, and contributed significantly",
    Good: "performed duties with diligence, maintained good professional standards, and been a reliable team member",
    Satisfactory: "fulfilled assigned responsibilities satisfactorily and shown adequate professional conduct",
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: c.bg, minHeight: "297mm", position: "relative" }}>
      {assets.letterhead && <img src={assets.letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "32px 40px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>{companyName}</div>
            {companyAddress && <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>{companyAddress}</div>}
            {companyGstin && <div style={{ fontSize: "11px", marginTop: "2px", opacity: 0.7 }}>GSTIN: {companyGstin}</div>}
          </div>
        </div>
      </div>
      <div style={{ background: c.accent, padding: "14px 40px", borderBottom: `3px solid ${c.primary}` }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: c.primary, letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Experience Certificate</h2>
      </div>
      <div style={{ padding: "32px 40px", fontSize: "13.5px", lineHeight: "1.9", color: "#1f2937" }}>
        <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>Date: {formatDate("")}</p>
        <p style={{ fontSize: "14px", fontWeight: 600 }}>To Whom It May Concern,</p>

        <p>This is to certify that <strong>{data.employeeName || "___________"}</strong>
          {data.employeeId ? ` (Employee ID: ${data.employeeId})` : ""} was employed with
          <strong> {companyName}</strong> as <strong>{data.designation || "___________"}</strong>
          {data.department ? ` in the ${data.department} department` : ""} from
          <strong> {formatDate(data.joiningDate)}</strong> to <strong>{formatDate(data.lastDate)}</strong>.
        </p>

        <p>During the tenure with us, {data.employeeName?.split(" ")[0] || "the employee"} has {perfText[data.performance || "Good"] || perfText.Good}.</p>

        <div style={{ background: c.accent, borderRadius: "8px", padding: "20px", margin: "24px 0", borderLeft: `4px solid ${c.primary}` }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: c.primary, marginBottom: "12px" }}>Employment Summary</h3>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <tbody>
              <tr><td style={{ padding: "6px 0", fontWeight: 600, width: "40%", color: "#4b5563" }}>Name</td><td>{data.employeeName}</td></tr>
              {data.employeeId && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Employee ID</td><td>{data.employeeId}</td></tr>}
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Designation</td><td>{data.designation}</td></tr>
              {data.department && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Department</td><td>{data.department}</td></tr>}
              <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Period</td><td>{formatDate(data.joiningDate)} to {formatDate(data.lastDate)}</td></tr>
              {data.performance && <tr><td style={{ padding: "6px 0", fontWeight: 600, color: "#4b5563" }}>Performance</td><td style={{ fontWeight: 700, color: c.primary }}>{data.performance}</td></tr>}
            </tbody>
          </table>
        </div>

        {data.remarks && <p>{data.remarks}</p>}

        <p>We wish {data.employeeName?.split(" ")[0] || "them"} all the best in future endeavors.</p>
        <p>This certificate is issued on request for whatever purpose it may serve.</p>

        <div style={{ marginTop: "60px" }}>
          {assets.signature && <img src={assets.signature} alt="Signature" style={{ height: "50px", objectFit: "contain", marginBottom: "4px" }} />}
          <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary }}>For {companyName}</p>
            <p style={{ fontSize: "12px", color: "#6b7280" }}>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceLetterPage() {
  return <DocGenerator title="Experience Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
