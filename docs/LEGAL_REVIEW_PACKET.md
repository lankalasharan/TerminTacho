# Legal Review Packet (Germany)

## 1) Project Overview
- Project name: TerminTacho
- Website URL: [add URL]
- Staging URL (if any): [add URL]
- Intended business model: [describe briefly]
- Target audience/region: Germany / EU
- Launch status: [planning | live | beta]

## 2) Controller Details (Data Controller)
- Name: Sharan Kumar Reddy Lankala
- Address: Augartenstrasse 38, 76137 Karlsruhe
- Email (controller contact): termintacho@gmail.com
- Phone (if used publicly): [add phone or remove]

## 3) Legal Pages (Current)
- Impressum: /imprint
- Privacy Policy: /privacy
- Cookie Policy: /cookies
- Terms of Service: /terms

## 4) Data Processing Summary (Plain Language)
### 4.1 Authentication / Accounts
- Providers: Email link, Google OAuth, Facebook OAuth
- Data: email address, provider account ID, profile name/image (if provided)

### 4.2 User Submissions
- Timeline reports (pseudonymous — linked to account internally for fraud prevention, never publicly attributed)
- Reviews/ratings and text content
- Contact form messages
- Newsletter sign-ups (double opt-in)

### 4.3 Analytics & Monitoring
- Google Analytics (GA4) - consent-based
- Sentry error/performance monitoring (client gated by consent; server/edge enabled)

### 4.4 Security / Anti-Abuse
- Cloudflare Turnstile CAPTCHA
- Rate limiting, fraud detection

## 5) Third-Party Processors
- Google (Analytics, OAuth)
- Facebook (OAuth)
- Sentry (error/performance monitoring)
- Cloudflare (Turnstile)
- Resend (email delivery)
- Supabase (database)
- Hosting provider: To be confirmed at launch

## 6) Cookies / Consent
- Cookie consent banner: accept/decline optional cookies
- Analytics only loads after consent
- Cookie settings link in footer

## 7) Retention & Deletion (Implemented)
- Contact submissions: delete after 24 months
- Consent logs: delete after 12 months
- Review IP addresses: anonymize after 30 days
- Newsletter verification tokens: delete after 30 days
- Cleanup job endpoint: POST /api/maintenance/retention (cron)

## 8) Data Transfers (International)
- Some providers may process data outside the EU/EEA
- Safeguards: SCCs / EU-US Data Privacy Framework (where applicable)

## 9) Security Measures
- TLS/HTTPS
- CAPTCHA for abuse prevention
- Rate limiting
- Access control for restricted data

## 10) Questions for Legal Review
1) Are the current legal pages sufficient and compliant for a private individual operating a website in Germany?
2) Do we need additional disclosures for analytics, Sentry, or Turnstile?
3) Is the consent flow adequate (accept/decline only) given our cookie usage?
4) Do we need a Data Processing Agreement (DPA) or additional contracts with any providers?
5) Are the retention periods and cleanup routine appropriate?
6) Are there any risks of Abmahnung based on the current setup?

## 11) Evidence / Links
- Website URL: [add]
- Screenshots of cookie banner and legal footer links: [attach]
- List of environment variables used for third parties: [attach if needed]

## 12) Notes
- Please confirm whether the hosting provider disclosure is acceptable as "to be confirmed" before launch.
- We can update all legal pages quickly based on recommendations.
