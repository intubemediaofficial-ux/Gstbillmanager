import { kv } from "@vercel/kv";
import { getSession } from "@/lib/session";
import type { BusinessSettings } from "@/lib/gst-types";

const defaultSettings: BusinessSettings = {
  companyName: "",
  address: "",
  city: "",
  state: "",
  stateCode: "",
  pincode: "",
  gstin: "",
  pan: "",
  phone: "",
  email: "",
  invoicePrefix: "INV/2024-25/",
  lastInvoiceNumber: 0,
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  termsAndConditions: "",
  signatureText: "",
};

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const key = `gst_settings:${session.id}`;
  const settings: BusinessSettings | null = await kv.get(key);
  return Response.json({ data: settings || defaultSettings });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const key = `gst_settings:${session.id}`;
    const existing: BusinessSettings | null = await kv.get(key);
    const updated = { ...(existing || defaultSettings), ...body };
    if (updated.gstin) updated.gstin = updated.gstin.toUpperCase();
    if (updated.pan) updated.pan = updated.pan.toUpperCase();
    await kv.set(key, updated);
    return Response.json({ success: true, data: updated });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
