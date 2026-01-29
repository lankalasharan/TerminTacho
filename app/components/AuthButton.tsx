"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        style={{
          padding: "10px 18px",
          background: "transparent",
          color: "#667eea",
          border: "2px solid #667eea",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#667eea";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#667eea";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      style={{
        padding: "10px 18px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.2)";
      }}
    >
      Sign In
    </button>
  );
}
