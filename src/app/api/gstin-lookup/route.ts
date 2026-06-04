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

  const stateCode = gstin.substring(0, 2);
  const pan = gstin.substring(2, 12);
  const stateName = INDIAN_STATES[stateCode] || "";

  // Try multiple free sources
  // Source 1: Sandbox.co.in public search (if API key configured)
  const sandboxKey = process.env.SANDBOX_API_KEY || "";
  if (sandboxKey) {
    try {
      const res = await fetch(
        `https://api.sandbox.co.in/gst/compliance/public/gstin/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": sandboxKey,
            "x-api-version": "1.0",
          },
          body: JSON.stringify({ gstin }),
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.gstin) {
          const d = json.data;
          const addr = d.pradr?.addr || {};
          const fullAddress = [addr.bno, addr.bnm, addr.flno, addr.st, addr.loc].filter(Boolean).join(", ");
          return Response.json({
            data: {
              name: d.tradeNam || d.lgnm || "",
              address: fullAddress,
              city: addr.dst || addr.loc || addr.city || "",
              state: addr.stcd || stateName,
              stateCode,
              pincode: addr.pncd || "",
              pan,
              status: d.sts || "Active",
              businessType: d.ctb || "",
            } as GstinData,
          });
        }
      }
    } catch {
      // continue to next source
    }
  }

  // Source 2: MasterIndia free tier (if API key configured)
  const masterIndiaKey = process.env.MASTERINDIA_API_KEY || "";
  if (masterIndiaKey) {
    try {
      const res = await fetch(
        `https://commonapi.mastersindia.co/commonapis/searchgstin?gstin=${gstin}`,
        {
          headers: {
            "Authorization": `Bearer ${masterIndiaKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.gstin) {
          const d = json.data;
          const addr = d.pradr?.addr || {};
          const fullAddress = [addr.bno, addr.bnm, addr.flno, addr.st, addr.loc].filter(Boolean).join(", ");
          return Response.json({
            data: {
              name: d.tradeNam || d.lgnm || "",
              address: fullAddress,
              city: addr.dst || addr.loc || addr.city || "",
              state: addr.stcd || stateName,
              stateCode,
              pincode: addr.pncd || "",
              pan,
              status: d.sts || "Active",
              businessType: d.ctb || "",
            } as GstinData,
          });
        }
      }
    } catch {
      // continue to fallback
    }
  }

  // Source 3: Try free public endpoint (no auth needed)
  try {
    const res = await fetch(
      `https://sheet.best/api/sheets/1bO5Dq-VhHOlMiYU1ooE3IkZ8a4LNidvqCyaGnTrcQ4w/gstin/${gstin}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        if (row.name || row.tradeName) {
          return Response.json({
            data: {
              name: row.name || row.tradeName || "",
              address: row.address || "",
              city: row.city || "",
              state: row.state || stateName,
              stateCode: row.stateCode || stateCode,
              pincode: row.pincode || "",
              pan,
              status: row.status || "Active",
              businessType: row.businessType || "",
            } as GstinData,
          });
        }
      }
    }
  } catch {
    // fallback below
  }

  // Fallback: extract what we can algorithmically from the GSTIN
  // PAN 4th char tells entity type: C=Company, P=Person, H=HUF, F=Firm, A=AOP, T=Trust
  const entityChar = pan.charAt(3);
  const entityTypes: Record<string, string> = {
    C: "Company", P: "Individual", H: "HUF", F: "Partnership Firm",
    A: "AOP/BOI", T: "Trust", B: "Body of Individuals",
    L: "Local Authority", J: "Artificial Juridical Person", G: "Government",
  };
  const businessType = entityTypes[entityChar] || "";

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
      businessType,
    } as GstinData,
    partial: true,
    message: "Only State & PAN extracted from GSTIN. For full auto-fill, configure SANDBOX_API_KEY or MASTERINDIA_API_KEY in environment variables.",
  });
}
