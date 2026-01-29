"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Logo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href="/"
      className="logo-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        opacity: isHovered ? "0.9" : "1",
        transition: "all 0.2s ease",
        background: "transparent",
        minHeight: "44px",
      }}
    >
      <Image
        src="/logo.png"
        alt="TerminTacho"
        width={180}
        height={45}
        priority
        style={{
          width: "auto",
          height: "40px",
          maxWidth: "180px",
          minWidth: "100px",
          background: "transparent",
          objectFit: "contain",
        }}
      />
    </Link>
  );
}
