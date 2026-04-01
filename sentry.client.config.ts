import * as Sentry from "@sentry/nextjs";

const isBrowser = typeof window !== "undefined";
const consentAccepted =
  isBrowser && window.localStorage.getItem("cookie-consent") === "accepted";
const sentryEnabled =
  consentAccepted &&
  process.env.NODE_ENV === "production" &&
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
const replaySampleRate = consentAccepted ? 1.0 : 0.0;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: consentAccepted ? 1.0 : 0.0,

  // Session Replay (enabled only after consent)
  replaysOnErrorSampleRate: replaySampleRate,
  replaysSessionSampleRate: replaySampleRate,

  // Set environment
  environment: process.env.NODE_ENV,

  // Only enable after consent in production
  enabled: sentryEnabled,
});
