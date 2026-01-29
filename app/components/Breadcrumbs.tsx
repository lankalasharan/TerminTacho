"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { label, href };
    }),
  ];

  return (
    <nav 
      aria-label="Breadcrumb"
      style={{
        padding: "12px 20px",
        background: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "14px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <ol style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}>
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {index > 0 && <span style={{ color: "#d1d5db" }}>/</span>}
              {index === breadcrumbItems.length - 1 ? (
                <span style={{ color: "#6b7280", fontWeight: 600 }}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  style={{
                    color: "#667eea",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#764ba2"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#667eea"}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
