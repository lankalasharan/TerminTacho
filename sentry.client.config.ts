import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development
  
  // Session Replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of errors
  replaysSessionSampleRate: 0.1, // Capture 10% of all sessions
  
  // Set environment
  environment: process.env.NODE_ENV,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === "production",
});
