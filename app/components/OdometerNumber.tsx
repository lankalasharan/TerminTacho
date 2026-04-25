"use client";

import { useEffect, useRef, useState } from "react";

interface DigitSlotProps {
  digit: number;
  slotHeight: number;
  fontSize: number;
}

function DigitSlot({ digit, slotHeight, fontSize }: DigitSlotProps) {
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        height: `${slotHeight}px`,
        verticalAlign: "bottom",
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: `translateY(-${digit * slotHeight}px)`,
          transition: "transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "transform",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span
            key={d}
            aria-hidden={d !== digit ? "true" : undefined}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: `${slotHeight}px`,
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

interface OdometerNumberProps {
  /** The final value to count up to */
  value: number;
  /** Font size in px (slot height = fontSize * 1.25) */
  fontSize?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts in ms */
  delay?: number;
}

export default function OdometerNumber({
  value,
  fontSize = 48,
  duration = 2200,
  delay = 0,
}: OdometerNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const slotHeight = Math.round(fontSize * 1.25);

  useEffect(() => {
    if (value === 0) return;

    const startAfter = setTimeout(() => {
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic for a natural deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(value * eased);
        setDisplayValue(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(startAfter);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, delay]);

  // Pad displayValue to same digit count as the target so layout is stable
  const targetDigitCount = String(value).length;
  const paddedStr = String(displayValue).padStart(targetDigitCount, "0");
  const digits = paddedStr.split("").map(Number);

  return (
    <span
      role="img"
      aria-label={String(value)}
      style={{ display: "inline-flex", gap: "1px" }}
    >
      {digits.map((digit, i) => (
        <DigitSlot
          key={i}
          digit={digit}
          slotHeight={slotHeight}
          fontSize={fontSize}
        />
      ))}
    </span>
  );
}
