"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef, DocAssets } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "employeeName", label: "Employee Name", required: true, placeholder: "Full name" },
  { name: "fatherName", label: "Father's Name", placeholder: "Father's name" },
  { name: "designation", label: "Position / Designation", required: true, placeholder: "e.g. Senior Developer" },
  { name: "department", label: "Department", placeholder: "e.g. Technology" },
  { name: "salary", label: "Monthly CTC (₹)", type: "number", required: true, placeholder: "e.g. 60000" },
  { name: "probation", label: "Probation Period", type: "select", options: ["1 Month", "3 Months", "6 Months", "1 Year"] },
  { name: "joiningDate", label: "Date of Appointment", type: "date", required: true },
  { name: "workTiming", label: "Office Timing", placeholder: "e.g. 9:30 AM - 6:30 PM" },
  { name: "location", label: "Work Location", placeholder: "e.g. Jaipur, Rajasthan" },
  { name: "noticePeriod", label: "Notice Period", type: "select", options: ["7 Days", "15 Days", "1 Month", "2 Months", "3 Months"] },
  { name: "weeklyOff", label: "Weekly Off", placeholder: "e.g. Sunday (1 day per week)" },
  { name: "paidLeaves", label: "Paid Leaves / Year", placeholder: "e.g. 12 per year" },
  { name: "hrName", label: "HR / Authorized Person", placeholder: "HR name" },
  { name: "hrDesignation", label: "HR Designation", placeholder: "e.g. Managing Director" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state, firm?.pincode].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";
  const companyPhone = firm?.phone || "";
  const companyEmail = firm?.email || "";
  const refNo = `AL-${new Date().getFullYear()}-${String(Math.random()).slice(2, 10).toUpperCase()}`;

  const sectionStyle = { marginTop: "20px" };
  const headingStyle = { fontSize: "13.5px", fontWeight: 700 as const, color: c.primary, marginBottom: "8px" };
  const bulletStyle = { paddingLeft: "20px", fontSize: "12px", color: "#374151", lineHeight: "1.9", margin: "8px 0" };

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
        <span>Date: {formatDate(data.joiningDate) || formatDate("")}</span>
      </div>

      <div style={{ textAlign: "center", padding: "0 40px 16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: c.primary, letterSpacing: "4px", textTransform: "uppercase", margin: 0, textDecoration: "underline", textUnderlineOffset: "6px" }}>Letter of Appointment</h2>
      </div>

      <div style={{ padding: "8px 40px 32px", fontSize: "12.5px", lineHeight: "1.8", color: "#1f2937" }}>
        <p>Dear <strong style={{ color: c.primary }}>{data.employeeName || "___________"}</strong>,</p>
        {data.fatherName && <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>S/o / D/o: {data.fatherName}</p>}

        <p style={{ marginTop: "12px" }}>
          We are pleased to appoint you as <strong>{data.designation || "___________"}</strong>{data.department ? ` in the ${data.department} department` : ""} at <strong>{companyName}</strong>, effective from <strong>{formatDate(data.joiningDate)}</strong>. Your appointment is subject to the following terms and conditions:
        </p>

        {/* 1. Appointment Details */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>1. Appointment Details</h3>
          <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", border: `1px solid ${c.primary}20` }}>
            <thead>
              <tr style={{ background: c.primary, color: "white" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, width: "40%" }}>Particulars</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Position</td><td style={{ padding: "7px 12px" }}>{data.designation}</td></tr>
              {data.department && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Department</td><td style={{ padding: "7px 12px" }}>{data.department}</td></tr>}
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Monthly CTC</td><td style={{ padding: "7px 12px", fontWeight: 700, color: c.primary }}>₹{parseInt(data.salary || "0").toLocaleString("en-IN")}</td></tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Annual CTC</td><td style={{ padding: "7px 12px", fontWeight: 700, color: c.primary }}>₹{(parseInt(data.salary || "0") * 12).toLocaleString("en-IN")}</td></tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Date of Joining</td><td style={{ padding: "7px 12px" }}>{formatDate(data.joiningDate)}</td></tr>
              {data.workTiming && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Office Hours</td><td style={{ padding: "7px 12px" }}>{data.workTiming}</td></tr>}
              {data.location && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Work Location</td><td style={{ padding: "7px 12px" }}>{data.location}</td></tr>}
              {data.probation && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Probation Period</td><td style={{ padding: "7px 12px" }}>{data.probation}</td></tr>}
              {data.noticePeriod && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Notice Period</td><td style={{ padding: "7px 12px" }}>{data.noticePeriod}</td></tr>}
              {data.weeklyOff && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Weekly Off</td><td style={{ padding: "7px 12px" }}>{data.weeklyOff}</td></tr>}
              {data.paidLeaves && <tr><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Paid Leaves</td><td style={{ padding: "7px 12px" }}>{data.paidLeaves}</td></tr>}
            </tbody>
          </table>
        </div>

        {/* 2. Probation & Confirmation */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>2. Probation & Confirmation</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            You will be on probation for <strong>{data.probation || "6 Months"}</strong> from the date of joining. During this period, your performance, punctuality, and conduct will be evaluated. Confirmation is subject to satisfactory performance review. During probation, either party may terminate with <strong>{data.noticePeriod || "15 Days"}</strong> notice or salary in lieu thereof.
          </p>
        </div>

        {/* 3. Compensation & Benefits */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>3. Compensation & Benefits</h3>
          <ul style={bulletStyle}>
            <li>Your monthly CTC shall be <strong>₹{parseInt(data.salary || "0").toLocaleString("en-IN")}</strong> (Annual: ₹{(parseInt(data.salary || "0") * 12).toLocaleString("en-IN")}), subject to applicable statutory deductions (PF, ESI, Professional Tax, TDS).</li>
            <li>Salary shall be credited to your bank account by the 7th of every succeeding month.</li>
            <li>Annual increments and bonuses are discretionary and based on individual/company performance.</li>
            {data.paidLeaves && <li>You are entitled to {data.paidLeaves} paid leaves. Unused leaves shall lapse at year-end unless company policy permits carry-forward.</li>}
          </ul>
        </div>

        {/* 4. Confidentiality & Non-Disclosure */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>4. Confidentiality & Non-Disclosure</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            During and after your employment, you shall not disclose, share, or make use of any proprietary information, trade secrets, client data, business strategies, or confidential material belonging to <strong>{companyName}</strong> or its clients without prior written consent. Violation may result in immediate termination and legal action.
          </p>
        </div>

        {/* 5. Intellectual Property */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>5. Intellectual Property Rights</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            All work product, including code, designs, content, documentation, and deliverables produced during employment shall be the sole intellectual property of <strong>{companyName}</strong>. You agree to irrevocably assign all rights, title, and interest in such work to the company.
          </p>
        </div>

        {/* 6. Termination */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>6. Termination & Separation</h3>
          <ul style={bulletStyle}>
            <li>After confirmation, either party may terminate with <strong>{data.noticePeriod || "1 Month"}</strong> written notice or salary in lieu.</li>
            <li>Company may terminate immediately without notice in case of misconduct, fraud, breach of confidentiality, or insubordination.</li>
            <li>All company property, ID cards, laptops, access credentials must be returned upon separation.</li>
            <li>Full and final settlement shall be processed within 45 days of last working day.</li>
          </ul>
        </div>

        {/* 7. General Terms */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>7. General Terms & Conditions</h3>
          <ul style={bulletStyle}>
            <li>This appointment is contingent upon verification of educational qualifications, identity documents, and background check.</li>
            <li>Company reserves the right to transfer you to any department, project, or location as per business needs.</li>
            <li>You shall not engage in any freelancing, part-time employment, or competing business activity during employment.</li>
            <li>Use of personal mobile phones during working hours restricted to break periods only.</li>
            <li>Any disputes shall be subject to exclusive jurisdiction of courts in {firm?.city || "the company location"}, {firm?.state || "India"}.</li>
          </ul>
        </div>

        {/* 8. Acceptance */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>8. Acceptance</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            Please sign and return the duplicate copy of this letter as a token of your acceptance. Bring original documents for verification on joining: <strong>Aadhaar, PAN, educational certificates, 2 photographs, bank details</strong>.
          </p>
          <p style={{ fontSize: "12px", color: "#374151", marginTop: "8px" }}>Congratulations and welcome to the team!</p>
        </div>

        {/* Signature */}
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "12px", margin: "0 0 30px" }}>For & on behalf of <strong style={{ color: c.primary }}>{companyName}</strong></p>
            {assets.signature && <img src={assets.signature} alt="Signature" style={{ height: "50px", objectFit: "contain", marginBottom: "4px" }} />}
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary, margin: "0 0 2px" }}>{data.hrName || "Authorized Signatory"}</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{data.hrDesignation || "Director"}</p>
            </div>
          </div>
          <div>
            <p style={{ fontSize: "12px", margin: "0 0 30px", fontWeight: 600 }}>Employee Acceptance</p>
            <div style={{ borderTop: "2px solid #9ca3af", width: "200px", paddingTop: "8px" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Signature: _______________</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "6px 0 0" }}>Name: {data.employeeName || "___________"}</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0" }}>Date: _______________</p>
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

export default function AppointmentLetterPage() {
  return <DocGenerator title="Appointment Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
