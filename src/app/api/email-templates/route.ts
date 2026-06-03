import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { EmailTemplate } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

const DEFAULT_TEMPLATES: Omit<EmailTemplate, "id" | "userId" | "createdAt">[] = [
  {
    name: "Invoice Sent",
    subject: "Invoice #{invoiceNumber} from {firmName}",
    body: "Dear {customerName},\n\nPlease find attached Invoice #{invoiceNumber} dated {date} for an amount of {amount}.\n\nPayment is due by {dueDate}.\n\nBank Details:\nBank: {bankName}\nAccount: {accountNumber}\nIFSC: {ifscCode}\n\nThank you for your business!\n\nRegards,\n{firmName}",
    type: "invoice",
    isDefault: true,
  },
  {
    name: "Payment Reminder",
    subject: "Payment Reminder - Invoice #{invoiceNumber}",
    body: "Dear {customerName},\n\nThis is a friendly reminder that Invoice #{invoiceNumber} for {amount} is pending payment.\n\nDue Date: {dueDate}\nBalance: {balance}\n\nPlease make the payment at your earliest convenience.\n\nRegards,\n{firmName}",
    type: "reminder",
    isDefault: true,
  },
  {
    name: "Quotation",
    subject: "Quotation from {firmName}",
    body: "Dear {customerName},\n\nThank you for your enquiry. Please find our quotation for the requested items/services.\n\nQuotation Amount: {amount}\nValid Until: {validDate}\n\nPlease feel free to reach out for any queries.\n\nRegards,\n{firmName}",
    type: "quotation",
    isDefault: true,
  },
  {
    name: "Payment Receipt",
    subject: "Payment Receipt - {firmName}",
    body: "Dear {customerName},\n\nWe confirm receipt of your payment of {amount} against Invoice #{invoiceNumber}.\n\nPayment Date: {date}\nPayment Mode: {paymentMode}\n\nThank you!\n\nRegards,\n{firmName}",
    type: "receipt",
    isDefault: true,
  },
  {
    name: "Welcome",
    subject: "Welcome to {firmName}!",
    body: "Dear {customerName},\n\nWelcome! We are delighted to have you as our customer.\n\nIf you need any assistance, please don't hesitate to contact us.\n\nRegards,\n{firmName}",
    type: "welcome",
    isDefault: true,
  },
];

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  let data: EmailTemplate[] = (await kv.get(`gst_email_templates:${lookupUserId}`)) || [];

  if (data.length === 0) {
    data = DEFAULT_TEMPLATES.map((t) => ({
      ...t,
      id: generateId(),
      userId: lookupUserId,
      createdAt: new Date().toISOString(),
    }));
    await kv.set(`gst_email_templates:${lookupUserId}`, data);
  }

  return Response.json({ data });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_email_templates:${userId}`;
    const items: EmailTemplate[] = (await kv.get(key)) || [];

    if (action === "create") {
      const template: EmailTemplate = {
        id: generateId(),
        userId,
        name: body.name || "",
        subject: body.subject || "",
        body: body.body || "",
        type: body.type || "custom",
        isDefault: false,
        createdAt: new Date().toISOString(),
      };
      items.push(template);
      await kv.set(key, items);
      return Response.json({ success: true, data: template });
    }

    if (action === "update") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      items[idx] = { ...items[idx], name: body.name || items[idx].name, subject: body.subject || items[idx].subject, body: body.body || items[idx].body, type: body.type || items[idx].type };
      await kv.set(key, items);
      return Response.json({ success: true, data: items[idx] });
    }

    if (action === "delete") {
      const filtered = items.filter((i) => i.id !== body.id);
      await kv.set(key, filtered);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
