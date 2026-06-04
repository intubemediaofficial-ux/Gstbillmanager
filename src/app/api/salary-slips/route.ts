import { kv } from "@/lib/kv";
import { getSession } from "@/lib/session";
import type { SalarySlip, Expense } from "@/lib/gst-types";
import { generateId } from "@/lib/gst-utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adminUserId = searchParams.get("adminUserId");
  const lookupUserId = (adminUserId && session.role === "admin") ? adminUserId : session.id;

  const data: SalarySlip[] = (await kv.get(`gst_salaryslips:${lookupUserId}`)) || [];
  const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return Response.json({ data: sorted });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const userId = session.id;
    const key = `gst_salaryslips:${userId}`;
    const items: SalarySlip[] = (await kv.get(key)) || [];

    if (action === "create") {
      const basic = Number(body.basicSalary) || 0;
      const hra = Number(body.hra) || 0;
      const conveyance = Number(body.conveyance) || 0;
      const medical = Number(body.medicalAllowance) || 0;
      const special = Number(body.specialAllowance) || 0;
      const otherAllow = Number(body.otherAllowances) || 0;
      const gross = basic + hra + conveyance + medical + special + otherAllow;

      const pf = Number(body.pf) || 0;
      const esi = Number(body.esi) || 0;
      const pt = Number(body.professionalTax) || 0;
      const tds = Number(body.tds) || 0;
      const otherDed = Number(body.otherDeductions) || 0;
      const totalDed = pf + esi + pt + tds + otherDed;

      const slip: SalarySlip = {
        id: generateId(),
        userId,
        employeeId: body.employeeId || "",
        employeeName: body.employeeName || "",
        empCode: body.empCode || "",
        department: body.department || "",
        designation: body.designation || "",
        month: body.month || new Date().toISOString().slice(0, 7),
        basicSalary: basic,
        hra,
        conveyance,
        medicalAllowance: medical,
        specialAllowance: special,
        otherAllowances: otherAllow,
        grossSalary: gross,
        pf,
        esi,
        professionalTax: pt,
        tds,
        otherDeductions: otherDed,
        totalDeductions: totalDed,
        netSalary: gross - totalDed,
        paymentDate: body.paymentDate || new Date().toISOString().split("T")[0],
        paymentMode: body.paymentMode || "bank_transfer",
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        referenceNumber: body.referenceNumber || "",
        firmId: body.firmId || "",
        status: body.status || "draft",
        createdAt: new Date().toISOString(),
      };
      items.push(slip);
      await kv.set(key, items);
      return Response.json({ success: true, data: slip });
    }

    if (action === "update_status") {
      const idx = items.findIndex((i) => i.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      const newStatus = body.status || "paid";
      const wasNotPaid = items[idx].status !== "paid";
      items[idx].status = newStatus;
      await kv.set(key, items);

      // Auto-add to expenses when marked as paid
      if (newStatus === "paid" && wasNotPaid) {
        const slip = items[idx];
        const expKey = `gst_expenses:${userId}`;
        const expenses: Expense[] = (await kv.get(expKey)) || [];
        const expense: Expense = {
          id: generateId(),
          userId,
          date: slip.paymentDate || new Date().toISOString().split("T")[0],
          category: "salary",
          customCategory: "",
          description: `Salary - ${slip.employeeName} (${slip.month})`,
          amount: slip.netSalary,
          gstAmount: 0,
          totalAmount: slip.netSalary,
          paymentMode: (slip.paymentMode as Expense["paymentMode"]) || "bank_transfer",
          vendorName: slip.employeeName,
          billNumber: slip.id,
          notes: `Auto-added from salary slip. Gross: ${slip.grossSalary}, Deductions: ${slip.totalDeductions}`,
          createdAt: new Date().toISOString(),
        };
        expenses.push(expense);
        await kv.set(expKey, expenses);
      }

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
