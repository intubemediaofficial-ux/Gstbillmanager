"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Download, ChevronDown, ChevronRight, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Invoice, Customer } from "@/lib/gst-types";
import { formatCurrency, formatDate } from "@/lib/gst-utils";

interface PartyAccount {
  customer: Customer;
  invoices: Invoice[];
  totalSales: number;
  totalReceived: number;
  balance: number;
  creditNotes: number;
  debitNotes: number;
}

export default function PartyLedgerPage() {
  const [accounts, setAccounts] = useState<PartyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "receivable" | "settled">("all");

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([cRes, iRes]) => {
      const customers: Customer[] = cRes.data || [];
      const invoices: Invoice[] = iRes.data || [];
      const accs: PartyAccount[] = customers.map((c) => {
        const custInvoices = invoices.filter((i) => i.customer.id === c.id);
        const salesInvoices = custInvoices.filter((i) => i.invoiceType === "tax_invoice" || i.invoiceType === "bill_of_supply" || i.invoiceType === "export_invoice");
        const creditNotes = custInvoices.filter((i) => i.invoiceType === "credit_note");
        const debitNotes = custInvoices.filter((i) => i.invoiceType === "debit_note");
        const totalSales = salesInvoices.reduce((s, i) => s + i.grandTotal, 0) + debitNotes.reduce((s, i) => s + i.grandTotal, 0);
        const totalReceived = salesInvoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
        const totalCreditNotes = creditNotes.reduce((s, i) => s + i.grandTotal, 0);
        return {
          customer: c,
          invoices: custInvoices,
          totalSales,
          totalReceived,
          balance: totalSales - totalReceived - totalCreditNotes,
          creditNotes: totalCreditNotes,
          debitNotes: debitNotes.reduce((s, i) => s + i.grandTotal, 0),
        };
      }).filter((a) => a.invoices.length > 0);
      accs.sort((a, b) => b.balance - a.balance);
      setAccounts(accs);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = accounts.filter((a) => {
    const matchSearch = a.customer.name.toLowerCase().includes(search.toLowerCase()) || (a.customer.gstin || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "receivable" && a.balance > 0) || (filter === "settled" && a.balance <= 0);
    return matchSearch && matchFilter;
  });

  const totalReceivable = filtered.reduce((s, a) => s + Math.max(0, a.balance), 0);
  const totalSales = filtered.reduce((s, a) => s + a.totalSales, 0);
  const totalReceived = filtered.reduce((s, a) => s + a.totalReceived, 0);

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const data = filtered.map((a) => ({
      "Party Name": a.customer.name, "GSTIN": a.customer.gstin || "", "Phone": a.customer.phone || "", "City": a.customer.city || "",
      "Total Sales": a.totalSales, "Amount Received": a.totalReceived, "Credit Notes": a.creditNotes,
      "Balance Due": a.balance, "Invoices Count": a.invoices.length,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Party Ledger");
    // Detail sheet
    const detailData = filtered.flatMap((a) => a.invoices.map((i) => ({
      "Party": a.customer.name, "Invoice #": i.invoiceNumber, "Type": i.invoiceType, "Date": i.date,
      "Amount": i.grandTotal, "Paid": i.amountPaid || 0, "Balance": i.grandTotal - (i.amountPaid || 0), "Status": i.status,
    })));
    const ws2 = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, ws2, "Transactions");
    XLSX.writeFile(wb, "Party_Ledger.xlsx");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="w-6 h-6" /> Party Ledger (खाता बही)</h1>
          <p className="text-sm text-gray-500 mt-1">Complete account of every customer — sales, payments, balance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Parties</p>
          <p className="text-2xl font-bold mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Sales</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500 font-medium">Total Received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-red-200 bg-red-50">
          <p className="text-xs text-red-600 font-medium">Total Receivable (बाकी)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalReceivable)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search party name or GSTIN..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "receivable" | "settled")} className="px-3 py-2 border rounded-lg text-sm">
          <option value="all">All Parties</option>
          <option value="receivable">With Balance Due</option>
          <option value="settled">Fully Settled</option>
        </select>
        <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">
          <Download className="w-3.5 h-3.5" /> Download Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const isExpanded = expandedId === a.customer.id;
            return (
              <div key={a.customer.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : a.customer.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{a.customer.name}</p>
                      <p className="text-xs text-gray-500">{a.customer.gstin || a.customer.phone || a.customer.city || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right shrink-0">
                    <div>
                      <p className="text-xs text-gray-400">Sales</p>
                      <p className="font-medium text-sm">{formatCurrency(a.totalSales)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Received</p>
                      <p className="font-medium text-sm text-green-600">{formatCurrency(a.totalReceived)}</p>
                    </div>
                    <div className="min-w-[100px]">
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className={`font-bold text-sm ${a.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {a.balance > 0 ? `${formatCurrency(a.balance)} बाकी` : "Settled"}
                      </p>
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    <table className="w-full text-xs mt-3">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 font-medium">Invoice #</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-left p-2 font-medium">Date</th>
                          <th className="text-right p-2 font-medium">Amount</th>
                          <th className="text-right p-2 font-medium">Paid</th>
                          <th className="text-right p-2 font-medium">Balance</th>
                          <th className="text-left p-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.invoices.sort((x, y) => y.date.localeCompare(x.date)).map((inv) => (
                          <tr key={inv.id} className="border-t">
                            <td className="p-2 font-mono">{inv.invoiceNumber}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                inv.invoiceType === "credit_note" ? "bg-rose-100 text-rose-700" :
                                inv.invoiceType === "debit_note" ? "bg-amber-100 text-amber-700" :
                                inv.invoiceType === "purchase_bill" ? "bg-teal-100 text-teal-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                                {inv.invoiceType === "credit_note" ? "CR" : inv.invoiceType === "debit_note" ? "DR" : inv.invoiceType === "purchase_bill" ? "PUR" : "INV"}
                              </span>
                            </td>
                            <td className="p-2 text-gray-500">{formatDate(inv.date)}</td>
                            <td className="p-2 text-right font-medium">
                              {inv.invoiceType === "credit_note" ? (
                                <span className="text-rose-600 flex items-center justify-end gap-0.5"><ArrowDownRight className="w-3 h-3" />{formatCurrency(inv.grandTotal)}</span>
                              ) : (
                                <span className="flex items-center justify-end gap-0.5"><ArrowUpRight className="w-3 h-3 text-blue-500" />{formatCurrency(inv.grandTotal)}</span>
                              )}
                            </td>
                            <td className="p-2 text-right text-green-600">{formatCurrency(inv.amountPaid || 0)}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(inv.grandTotal - (inv.amountPaid || 0))}</td>
                            <td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              inv.status === "paid" ? "bg-green-100 text-green-700" : inv.status === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                            }`}>{inv.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {a.creditNotes > 0 && <p className="text-xs text-rose-500 mt-2">Credit Notes: -{formatCurrency(a.creditNotes)}</p>}
                    {a.debitNotes > 0 && <p className="text-xs text-amber-500">Debit Notes: +{formatCurrency(a.debitNotes)}</p>}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-400">No party accounts found. Create invoices to see party ledger.</div>}
        </div>
      )}
    </div>
  );
}
