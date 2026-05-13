import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { Firm } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const firms: Firm[] = (await kv.get(`firms_${session.id}`)) || [];
  return Response.json({ data: firms });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const firms: Firm[] = (await kv.get(`firms_${session.id}`)) || [];

    if (action === "create") {
      const firm: Firm = {
        id: generateId(),
        userId: session.id,
        isGst: body.isGst !== false,
        name: body.name || "",
        address: body.address || "",
        city: body.city || "",
        state: body.state || "",
        stateCode: body.stateCode || "",
        pincode: body.pincode || "",
        gstin: body.gstin || "",
        pan: body.pan || "",
        phone: body.phone || "",
        email: body.email || "",
        bankName: body.bankName || "",
        accountNumber: body.accountNumber || "",
        ifscCode: body.ifscCode || "",
        branchName: body.branchName || "",
        hsnCode: body.hsnCode || "",
        signatureText: body.signatureText || "",
        letterhead: body.letterhead || "",
        createdAt: new Date().toISOString(),
      };
      firms.push(firm);
      await kv.set(`firms_${session.id}`, firms);
      return Response.json({ success: true, data: firm });
    }

    if (action === "update") {
      const idx = firms.findIndex((f) => f.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      if (body.isGst !== undefined) firms[idx].isGst = body.isGst;
      if (body.name !== undefined) firms[idx].name = body.name;
      if (body.address !== undefined) firms[idx].address = body.address;
      if (body.city !== undefined) firms[idx].city = body.city;
      if (body.state !== undefined) firms[idx].state = body.state;
      if (body.stateCode !== undefined) firms[idx].stateCode = body.stateCode;
      if (body.pincode !== undefined) firms[idx].pincode = body.pincode;
      if (body.gstin !== undefined) firms[idx].gstin = body.gstin;
      if (body.pan !== undefined) firms[idx].pan = body.pan;
      if (body.phone !== undefined) firms[idx].phone = body.phone;
      if (body.email !== undefined) firms[idx].email = body.email;
      if (body.bankName !== undefined) firms[idx].bankName = body.bankName;
      if (body.accountNumber !== undefined) firms[idx].accountNumber = body.accountNumber;
      if (body.ifscCode !== undefined) firms[idx].ifscCode = body.ifscCode;
      if (body.branchName !== undefined) firms[idx].branchName = body.branchName;
      if (body.hsnCode !== undefined) firms[idx].hsnCode = body.hsnCode;
      if (body.signatureText !== undefined) firms[idx].signatureText = body.signatureText;
      if (body.letterhead !== undefined) firms[idx].letterhead = body.letterhead;
      await kv.set(`firms_${session.id}`, firms);
      return Response.json({ success: true, data: firms[idx] });
    }

    if (action === "delete") {
      const filtered = firms.filter((f) => f.id !== body.id);
      await kv.set(`firms_${session.id}`, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
