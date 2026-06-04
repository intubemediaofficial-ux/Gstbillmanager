import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin-*", "/invoice-view"],
      },
    ],
    sitemap: "https://gstbillmanager.com/sitemap.xml",
  };
}
