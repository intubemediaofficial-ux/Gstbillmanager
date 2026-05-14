import { INDIAN_STATES } from "@/lib/gst-types";

interface GstinData {
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  pan: string;
  status: string;
  businessType: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gstin = searchParams.get("gstin")?.toUpperCase() || "";

  if (!gstin || gstin.length !== 15) {
    return Response.json({ error: "Invalid GSTIN (must be 15 characters)" }, { status: 400 });
  }

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(gstin)) {
    return Response.json({ error: "Invalid GSTIN format" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://sheet.best/api/sheets/1bO5Dq-VhHOlMiYU1ooE3IkZ8a4LNidvqCyaGnTrcQ4w/gstin/${gstin}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        return Response.json({
          data: {
            name: row.name || row.tradeName || "",
            address: row.address || "",
            city: row.city || "",
            state: row.state || "",
            stateCode: row.stateCode || gstin.substring(0, 2),
            pincode: row.pincode || "",
            pan: gstin.substring(2, 12),
            status: row.status || "Active",
            businessType: row.businessType || "",
          } as GstinData,
        });
      }
    }
  } catch {
    // fallback below
  }

  // Fallback: extract what we can from the GSTIN itself
  const stateCode = gstin.substring(0, 2);
  const pan = gstin.substring(2, 12);
  const stateName = INDIAN_STATES[stateCode] || "";

  return Response.json({
    data: {
      name: "",
      address: "",
      city: "",
      state: stateName,
      stateCode,
      pincode: "",
      pan,
      status: "",
      businessType: "",
    } as GstinData,
    partial: true,
  });
}
