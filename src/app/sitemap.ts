import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gstbillmanager.com";
  const now = new Date();

  const publicPages = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/login", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/verify", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const featurePages = [
    { path: "/dashboard", priority: 0.9 },
    { path: "/create-invoice", priority: 0.9 },
    { path: "/invoices", priority: 0.8 },
    { path: "/customers", priority: 0.8 },
    { path: "/products", priority: 0.8 },
    { path: "/my-firms", priority: 0.7 },
    { path: "/quotations", priority: 0.7 },
    { path: "/credit-notes", priority: 0.7 },
    { path: "/debit-notes", priority: 0.7 },
    { path: "/purchase-bills", priority: 0.7 },
    { path: "/expenses", priority: 0.7 },
    { path: "/inventory", priority: 0.7 },
    { path: "/barcode-scanner", priority: 0.7 },
    { path: "/business-card", priority: 0.7 },
    { path: "/cash-book", priority: 0.7 },
    { path: "/party-ledger", priority: 0.7 },
    { path: "/party-rates", priority: 0.6 },
    { path: "/pos-receipt", priority: 0.6 },
    { path: "/customer-portal", priority: 0.6 },
    { path: "/greeting-cards", priority: 0.6 },
    { path: "/gstr-reports", priority: 0.7 },
    { path: "/gstr-2b", priority: 0.6 },
    { path: "/eway-bills", priority: 0.6 },
    { path: "/bulk-import", priority: 0.5 },
    { path: "/recurring-invoices", priority: 0.6 },
    { path: "/reports", priority: 0.6 },
    { path: "/profit-loss", priority: 0.6 },
    { path: "/aging-report", priority: 0.5 },
    { path: "/employees", priority: 0.5 },
    { path: "/salary-slips", priority: 0.5 },
    { path: "/attendance", priority: 0.5 },
    { path: "/leads", priority: 0.5 },
    { path: "/follow-ups", priority: 0.5 },
    { path: "/email-templates", priority: 0.5 },
    { path: "/documents", priority: 0.7 },
    { path: "/document-history", priority: 0.5 },
    { path: "/bill-manager", priority: 0.6 },
    { path: "/settings", priority: 0.4 },
  ];

  const documentPages = [
    "/documents/offer-letter",
    "/documents/appointment-letter",
    "/documents/joining-letter",
    "/documents/experience-letter",
    "/documents/relieving-letter",
    "/documents/quotation",
    "/documents/purchase-order",
    "/documents/delivery-challan",
    "/documents/payment-receipt",
    "/documents/visiting-card",
    "/documents/id-card",
    "/documents/letterhead",
    "/documents/noc-letter",
    "/documents/authorization-letter",
    "/documents/service-agreement",
  ];

  return [
    ...publicPages.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...featurePages.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
    ...documentPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
