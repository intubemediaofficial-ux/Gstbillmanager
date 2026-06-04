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

  // Source 1: GSTVerify.co.in (₹0.10/call, cheapest option)
  const gstVerifyKey = process.env.GSTVERIFY_API_KEY || "";
  if (gstVerifyKey) {
    try {
      const res = await fetch(
        `https://gstverify.co.in/api/v1/verify/${gstin}`,
        {
          headers: { "X-API-Key": gstVerifyKey },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          // Extract city and pincode from address string
          const addressStr = d.address || "";
          const pincodeMatch = addressStr.match(/(\d{6})/);
          const pincode = pincodeMatch ? pincodeMatch[1] : "";

          return Response.json({
            data: {
              name: d.trade_name || d.legal_name || "",
              address: addressStr,
              city: "",
              state: d.state || stateName,
              stateCode,
              pincode,
              pan: d.pan || pan,
              status: d.status || "Active",
              businessType: d.constitution || d.taxpayer_type || "",
            } as GstinData,
          });
        }
      }
    } catch {
      // continue to next source
    }
  }

  // Source 2: Sandbox.co.in (if configured)
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
      // continue to fallback
    }
  }

  // Fallback: extract what we can algorithmically from the GSTIN
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
    message: "Only State & PAN extracted. Add GSTVERIFY_API_KEY in Vercel env for full auto-fill (₹0.10/call at gstverify.co.in).",
  });
}
