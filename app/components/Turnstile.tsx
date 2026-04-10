"use client";

import { useEffect, useRef } from "react";

type TurnstileWidgetProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string | number;
      remove: (widgetId: string | number) => void;
      reset?: (widgetId: string | number) => void;
    };
  }
}

export default function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | number | null>(null);

  // Keep latest callback refs so the effect never needs to re-run when the
  // parent re-renders with new inline function references.
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current !== null) return;
      if (!window.turnstile) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          if (!cancelled) onVerifyRef.current(token);
        },
        "expired-callback": () => {
          if (!cancelled) {
            onVerifyRef.current("");
            onExpireRef.current?.();
          }
        },
        "error-callback": () => {
          if (!cancelled) {
            onVerifyRef.current("");
            onErrorRef.current?.();
          }
        },
      });
    };

    const ensureScript = () => {
      if (document.querySelector("script[data-turnstile]")) {
        renderWidget();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      script.onload = renderWidget;
      document.body.appendChild(script);
    };

    ensureScript();

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]); // only re-run when siteKey itself changes

  return <div ref={containerRef} />;
}
