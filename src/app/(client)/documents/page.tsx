"use client";

import Link from "next/link";
import {
  FileText, UserCheck, Briefcase, Award, ShieldCheck, CreditCard, FileSignature,
  Receipt, ShoppingCart, Truck, Contact, FileImage, IdCard, ScrollText, Stamp, KeyRound,
} from "lucide-react";

const categories = [
  {
    title: "HR Documents",
    desc: "Employee & job related documents",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    items: [
      { label: "Offer Letter", href: "/documents/offer-letter", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
      { label: "Joining Letter", href: "/documents/joining-letter", icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-100" },
      { label: "Appointment Letter", href: "/documents/appointment-letter", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100" },
      { label: "Experience Letter", href: "/documents/experience-letter", icon: Award, color: "text-emerald-600", bg: "bg-emerald-100" },
      { label: "Relieving Letter", href: "/documents/relieving-letter", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-100" },
    ],
  },
  {
    title: "Business Documents",
    desc: "Daily business paperwork",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    items: [
      { label: "Quotation", href: "/documents/quotation", icon: FileSignature, color: "text-emerald-600", bg: "bg-emerald-100" },
      { label: "Payment Receipt", href: "/documents/payment-receipt", icon: Receipt, color: "text-amber-600", bg: "bg-amber-100" },
      { label: "Purchase Order", href: "/documents/purchase-order", icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-100" },
      { label: "Delivery Challan", href: "/documents/delivery-challan", icon: Truck, color: "text-cyan-600", bg: "bg-cyan-100" },
    ],
  },
  {
    title: "Branding Documents",
    desc: "Company branding material",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    items: [
      { label: "Visiting Card", href: "/documents/visiting-card", icon: Contact, color: "text-violet-600", bg: "bg-violet-100" },
      { label: "Letterhead", href: "/documents/letterhead", icon: FileImage, color: "text-pink-600", bg: "bg-pink-100" },
      { label: "ID Card", href: "/documents/id-card", icon: IdCard, color: "text-rose-600", bg: "bg-rose-100" },
    ],
  },
  {
    title: "Legal Documents",
    desc: "Agreements & authorization",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    items: [
      { label: "Service Agreement", href: "/documents/service-agreement", icon: ScrollText, color: "text-amber-600", bg: "bg-amber-100" },
      { label: "NOC Letter", href: "/documents/noc-letter", icon: Stamp, color: "text-orange-600", bg: "bg-orange-100" },
      { label: "Authorization Letter", href: "/documents/authorization-letter", icon: KeyRound, color: "text-red-600", bg: "bg-red-100" },
    ],
  },
];

export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Generate professional business documents, HR letters, branding materials & more</p>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => (
          <div key={cat.title}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${cat.color}`} />
              <div>
                <h2 className="text-lg font-bold text-gray-900">{cat.title}</h2>
                <p className="text-sm text-gray-500">{cat.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cat.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${item.bg} group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">Click to create →</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
