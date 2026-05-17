import type { TemplateDef } from "./DocGenerator";

export const hrTemplates: TemplateDef[] = [
  { id: "corporate", name: "Corporate Blue", colors: { primary: "#1e40af", secondary: "#3b82f6", accent: "#dbeafe", bg: "#f8fafc" } },
  { id: "modern", name: "Modern Dark", colors: { primary: "#0f172a", secondary: "#334155", accent: "#e2e8f0", bg: "#ffffff" } },
  { id: "elegant", name: "Elegant Green", colors: { primary: "#065f46", secondary: "#10b981", accent: "#d1fae5", bg: "#f0fdf4" } },
  { id: "minimal", name: "Minimal Gray", colors: { primary: "#374151", secondary: "#6b7280", accent: "#f3f4f6", bg: "#ffffff" } },
];

export const businessTemplates: TemplateDef[] = [
  { id: "professional", name: "Professional Blue", colors: { primary: "#1e3a5f", secondary: "#2563eb", accent: "#dbeafe", bg: "#f8fafc" } },
  { id: "warm", name: "Warm Orange", colors: { primary: "#7c2d12", secondary: "#ea580c", accent: "#fed7aa", bg: "#fff7ed" } },
  { id: "fresh", name: "Fresh Teal", colors: { primary: "#134e4a", secondary: "#14b8a6", accent: "#ccfbf1", bg: "#f0fdfa" } },
  { id: "classic", name: "Classic Dark", colors: { primary: "#18181b", secondary: "#3f3f46", accent: "#e4e4e7", bg: "#fafafa" } },
];

export const brandingTemplates: TemplateDef[] = [
  { id: "luxury", name: "Black & Gold", colors: { primary: "#0a0a0a", secondary: "#1a1a1a", accent: "#c9a84c", bg: "#ffffff" } },
  { id: "modern", name: "Modern Gradient", colors: { primary: "#4f46e5", secondary: "#7c3aed", accent: "#c4b5fd", bg: "#faf5ff" } },
  { id: "corporate", name: "Corporate", colors: { primary: "#1e40af", secondary: "#2563eb", accent: "#93c5fd", bg: "#eff6ff" } },
  { id: "minimal", name: "Minimal Clean", colors: { primary: "#18181b", secondary: "#52525b", accent: "#d4d4d8", bg: "#ffffff" } },
];

export const legalTemplates: TemplateDef[] = [
  { id: "formal", name: "Formal Blue", colors: { primary: "#1e3a5f", secondary: "#1e40af", accent: "#dbeafe", bg: "#f8fafc" } },
  { id: "classic", name: "Classic Black", colors: { primary: "#111827", secondary: "#374151", accent: "#e5e7eb", bg: "#ffffff" } },
  { id: "legal", name: "Legal Green", colors: { primary: "#14532d", secondary: "#15803d", accent: "#bbf7d0", bg: "#f0fdf4" } },
  { id: "modern", name: "Modern Gray", colors: { primary: "#27272a", secondary: "#52525b", accent: "#e4e4e7", bg: "#fafafa" } },
];

export function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
