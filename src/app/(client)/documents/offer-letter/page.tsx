"use client";

import DocGenerator from "@/components/documents/DocGenerator";
import type { FieldDef, TemplateDef, DocAssets } from "@/components/documents/DocGenerator";
import { hrTemplates, formatDate } from "@/components/documents/doc-templates";
import type { Firm } from "@/lib/gst-types";

const fields: FieldDef[] = [
  { name: "candidateName", label: "Candidate Name", required: true, placeholder: "Full name" },
  { name: "fatherName", label: "Father's Name", placeholder: "Father's name" },
  { name: "mobile", label: "Mobile", placeholder: "Phone number" },
  { name: "email", label: "Email", placeholder: "Email address" },
  { name: "address", label: "Address", type: "textarea", half: false, placeholder: "Full address" },
  { name: "designation", label: "Designation / Position", required: true, placeholder: "e.g. Graphic Design Training" },
  { name: "department", label: "Department", placeholder: "e.g. Design" },
  { name: "salary", label: "Monthly Stipend / Salary (₹)", type: "number", placeholder: "e.g. 15000" },
  { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
  { name: "duration", label: "Duration", placeholder: "e.g. 30 Days / 6 Months / 1 Year" },
  { name: "workTiming", label: "Work Timing", placeholder: "e.g. 10:00 AM - 6:00 PM" },
  { name: "modeOfWork", label: "Mode of Work", type: "select", options: ["Office", "Remote", "Hybrid"] },
  { name: "weeklyOff", label: "Weekly Off", placeholder: "e.g. 2 day(s) per week" },
  { name: "paidLeaves", label: "Paid Leaves", placeholder: "e.g. 2 per month" },
  { name: "probationDays", label: "Probation Period (Days)", placeholder: "e.g. 7" },
  { name: "noticeDays", label: "Notice Period (Days)", placeholder: "e.g. 7" },
  { name: "hrName", label: "HR / Authorized Person Name", placeholder: "HR name" },
  { name: "hrDesignation", label: "HR Designation", placeholder: "e.g. Managing Director" },
];

function renderDoc(data: Record<string, string>, template: TemplateDef, firm: Firm | null, assets: DocAssets) {
  const c = template.colors;
  const companyName = firm?.name || "Your Company Name";
  const companyAddress = [firm?.address, firm?.city, firm?.state, firm?.pincode].filter(Boolean).join(", ");
  const companyGstin = firm?.gstin || "";
  const companyPhone = firm?.phone || "";
  const companyEmail = firm?.email || "";
  const refNo = `OL-${new Date().getFullYear()}-${String(Math.random()).slice(2, 12).toUpperCase().slice(0, 8)}`;

  const sectionStyle = { marginTop: "22px" };
  const headingStyle = { fontSize: "13.5px", fontWeight: 700 as const, color: c.primary, marginBottom: "8px" };
  const bulletStyle = { paddingLeft: "20px", fontSize: "12px", color: "#374151", lineHeight: "1.9", margin: "8px 0" };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: c.bg, minHeight: "297mm", padding: "0", position: "relative" }}>
      {assets.letterhead && <img src={assets.letterhead} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "28px 40px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "1px" }}>{companyName}</div>
            {companyAddress && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.85 }}>{companyAddress}</div>}
            <div style={{ fontSize: "10.5px", marginTop: "2px", opacity: 0.75 }}>
              {companyPhone && `Ph: ${companyPhone}`}{companyEmail && ` | ${companyEmail}`}{companyGstin && ` | GST: ${companyGstin}`}
            </div>
          </div>
        </div>
      </div>

      {/* Red line */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${c.primary}, #e53e3e, ${c.secondary})` }} />

      {/* Ref + Date */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 40px", fontSize: "11px", color: "#6b7280" }}>
        <span>Ref: {refNo}</span>
        <span>Date: {formatDate(data.joiningDate) || formatDate("")}</span>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", padding: "0 40px 16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: c.primary, letterSpacing: "4px", textTransform: "uppercase", margin: 0, textDecoration: "underline", textUnderlineOffset: "6px" }}>Offer Letter</h2>
      </div>

      {/* Body */}
      <div style={{ padding: "8px 40px 32px", fontSize: "12.5px", lineHeight: "1.8", color: "#1f2937" }}>
        <p>Dear <strong style={{ color: c.primary }}>{data.candidateName || "___________"}</strong>,</p>

        <p style={{ marginTop: "12px" }}>
          With reference to your application and subsequent interactions, we are pleased to offer you a position at <strong>{companyName}</strong> for the <strong style={{ color: c.primary }}>{data.designation || "___________"}</strong> program. This offer is subject to the following terms and conditions outlined below.
        </p>

        {/* 1. Position Details */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>1. Position Details</h3>
          <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", border: `1px solid ${c.primary}20` }}>
            <thead>
              <tr style={{ background: c.primary, color: "white" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, width: "40%" }}>Particulars</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Program / Position</td><td style={{ padding: "7px 12px" }}>{data.designation || "-"}</td></tr>
              {data.duration && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Duration</td><td style={{ padding: "7px 12px" }}>{data.duration}</td></tr>}
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Date of Joining</td><td style={{ padding: "7px 12px" }}>{formatDate(data.joiningDate) || "-"}</td></tr>
              {data.workTiming && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Work Timing</td><td style={{ padding: "7px 12px" }}>{data.workTiming}</td></tr>}
              {data.modeOfWork && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Mode of Work</td><td style={{ padding: "7px 12px" }}>{data.modeOfWork}</td></tr>}
              {data.salary && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Monthly Stipend / Salary</td><td style={{ padding: "7px 12px", fontWeight: 700, color: c.primary }}>₹{parseInt(data.salary).toLocaleString("en-IN")}/month</td></tr>}
              {data.weeklyOff && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Weekly Off</td><td style={{ padding: "7px 12px" }}>{data.weeklyOff}</td></tr>}
              {data.paidLeaves && <tr style={{ borderBottom: "1px solid #e5e7eb" }}><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Paid Leaves</td><td style={{ padding: "7px 12px" }}>{data.paidLeaves}</td></tr>}
              <tr><td style={{ padding: "7px 12px", fontWeight: 600, color: "#4b5563" }}>Payment Type</td><td style={{ padding: "7px 12px" }}>Monthly</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. Reporting & Probation */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>2. Reporting & Probation</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            You shall report to your designated Team Leader on the date of joining. The first <strong>{data.probationDays || "7"} working days</strong> shall constitute a probationary period during which your performance, punctuality, and conduct will be evaluated. Upon successful completion of probation, a minimum written notice of <strong>{data.noticeDays || "7"} days</strong> shall be required from either party for separation.
          </p>
        </div>

        {/* 3. Code of Conduct */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>3. Code of Conduct</h3>
          <p style={{ fontSize: "12px", color: "#374151", marginBottom: "6px" }}>You are expected to:</p>
          <ul style={bulletStyle}>
            <li>Maintain professional behaviour and adhere to all workplace policies and guidelines.</li>
            <li>Follow the prescribed work schedule and obtain prior written approval for any leave.</li>
            <li>Complete all assigned tasks within stipulated deadlines with a quality-first approach.</li>
            <li>Treat colleagues, clients, and all stakeholders with respect, dignity, and integrity.</li>
            <li>Refrain from any activity that may bring disrepute to the organization or its brand.</li>
          </ul>
        </div>

        {/* 4. Confidentiality & Non-Disclosure */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>4. Confidentiality & Non-Disclosure Agreement</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            During the tenure and even after the conclusion of this employment, you shall not disclose, share, or make use of any proprietary information, trade secrets, client data, business strategies, or any other confidential material belonging to <strong>{companyName}</strong> or its clients, partners, and associates without obtaining prior written consent from the management. Any violation of this clause may result in immediate termination and appropriate legal action as deemed necessary.
          </p>
        </div>

        {/* 5. Intellectual Property Rights */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>5. Intellectual Property Rights</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            Any and all work product, including but not limited to code, designs, content, documentation, creative output, research findings, or any other deliverables produced during the course of this employment shall be the sole and exclusive intellectual property of <strong>{companyName}</strong>. You hereby agree to irrevocably assign all rights, title, and interest in such work to the company without any additional consideration.
          </p>
        </div>

        {/* 6. Termination & Separation */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>6. Termination & Separation</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            The company reserves the right to terminate this employment at any time in the event of misconduct, breach of confidentiality, unsatisfactory performance, violation of company policies, or any behaviour detrimental to the organization. You may also choose to resign by providing a minimum of <strong>{data.noticeDays || "7"} days</strong> written notice to the reporting authority. All company property, access credentials, and confidential materials must be returned upon separation.
          </p>
        </div>

        {/* 7. General Terms & Conditions */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>7. General Terms & Conditions</h3>
          <ul style={bulletStyle}>
            <li>This offer is contingent upon successful verification of your educational qualifications, identity documents, and any other credentials as may be required.</li>
            <li>The company reserves the right to assign you to any project, team, or department as per prevailing business requirements and organizational needs.</li>
            <li>Use of personal mobile phones during working hours shall be restricted to designated break periods only.</li>
            <li>You shall not engage in any freelancing, part-time employment, or competing business activity during the period of this employment.</li>
            <li>Any disputes arising out of or in connection with this offer shall be subject to the exclusive jurisdiction of the courts in {firm?.city || "the company location"}, {firm?.state || "India"}.</li>
          </ul>
        </div>

        {/* 8. Acceptance */}
        <div style={sectionStyle}>
          <h3 style={headingStyle}>8. Acceptance</h3>
          <p style={{ fontSize: "12px", color: "#374151" }}>
            Please confirm your acceptance of this offer by reporting at the office on the above-mentioned date of joining along with the following documents: <strong>Aadhar Card, PAN Card (if applicable), two passport-size photographs, all relevant educational certificates</strong>, and a <strong>signed copy of this offer letter</strong>.
          </p>
          <p style={{ fontSize: "12px", color: "#374151", marginTop: "10px" }}>
            We look forward to your valuable association with <strong>{companyName}</strong> and wish you a highly productive and rewarding experience with us.
          </p>
        </div>

        {/* Signature */}
        <div style={{ marginTop: "40px" }}>
          <p style={{ fontSize: "12px", color: "#374151" }}>For & on behalf of <strong style={{ color: c.primary }}>{companyName}</strong>.</p>
          <div style={{ marginTop: "40px" }}>
            {assets.signature && <img src={assets.signature} alt="Signature" style={{ height: "50px", objectFit: "contain", marginBottom: "4px" }} />}
            <div style={{ borderTop: `2px solid ${c.primary}`, width: "200px", paddingTop: "8px" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", color: c.primary, margin: "0 0 2px" }}>{data.hrName || "Authorized Signatory"}</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{data.hrDesignation || "Director"}</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{companyName}</p>
            </div>
          </div>
        </div>

        {/* Candidate Acceptance */}
        <div style={{ marginTop: "40px", borderTop: "1px dashed #d1d5db", paddingTop: "20px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: c.primary, textDecoration: "underline", textUnderlineOffset: "4px" }}>Candidate&apos;s Acceptance</h3>
          <p style={{ fontSize: "12px", color: "#374151", marginTop: "8px" }}>
            I, <strong>{data.candidateName || "___________"}</strong>, hereby accept the above-mentioned terms and conditions and agree to abide by all policies, rules, and regulations of <strong>{companyName}</strong> during the course of my employment.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", fontSize: "12px", color: "#4b5563" }}>
            <div>Signature: _________________________</div>
            <div>Date: _________________________</div>
          </div>
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#4b5563" }}>
            Name: {data.candidateName || "___________"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, padding: "10px 40px", color: "white", fontSize: "10px", textAlign: "center", opacity: 0.9 }}>
        {companyName}{companyAddress && ` | ${companyAddress}`}{companyPhone && ` | Ph: ${companyPhone}`}{companyEmail && ` | ${companyEmail}`}{companyGstin && ` | GST: ${companyGstin}`}
      </div>
    </div>
  );
}

export default function OfferLetterPage() {
  return <DocGenerator title="Offer Letter" fields={fields} templates={hrTemplates} renderDoc={renderDoc} />;
}
