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
        display: "inline-block",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        opacity: isHovered ? "0.9" : "1",
        transition: "all 0.2s ease",
      }}
    >
      <Image
        src="/logo.png"
        alt="TerminTacho"
        width={300}
        height={80}
        priority
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "300px",
          minWidth: "200px",
        }}
      />
    </Link>
  );
}
