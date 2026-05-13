"use client";

import { useState, useEffect, useRef } from "react";
import AdminSidebar from "./AdminSidebar";
import ClientSidebar from "./ClientSidebar";

export default function SmartSidebar() {
  const [role, setRole] = useState<"admin" | "client" | null>(null);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setRole(data.user?.role || "client"))
      .catch(() => setRole("client"));
  }, []);

  if (!role) return null;
  return role === "admin" ? <AdminSidebar /> : <ClientSidebar />;
}
