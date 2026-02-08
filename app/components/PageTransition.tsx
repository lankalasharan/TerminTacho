"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <>
      <style>{`
        .page-transition {
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .page-transition.is-visible {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .page-transition,
          .page-transition.is-visible {
            transition: none;
          }
        }
      `}</style>
      <div key={pathname} className={`page-transition ${isVisible ? "is-visible" : ""}`}>
        {children}
      </div>
    </>
  );
}
