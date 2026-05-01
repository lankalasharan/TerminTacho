export default function PrivacyPolicy() {
  return (
    <main className="tt-section">
      <div className="tt-container" style={{ maxWidth: "900px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "16px", color: "var(--tt-text)" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: "14px", color: "var(--tt-muted)", marginBottom: "40px" }}>
          Last Updated: April 1, 2026
        </p>

        <div style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--tt-text-strong)" }}>
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            1. Introduction
          </h2>
          <p>
            TerminTacho ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, in compliance with the EU General Data Protection Regulation (GDPR).
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            2. Data Controller
          </h2>
          <p>
            The data controller responsible for your personal data is:<br/>
            Sharan Kumar Reddy Lankala<br/>
            Augartenstraße 38, 76137 Karlsruhe<br/>
            Email: termintacho@gmail.com<br/>
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            3. Information We Collect
          </h2>
          
          <h3 style={{ fontSize: "20px", fontWeight: 600, marginTop: "24px", marginBottom: "12px", color: "var(--tt-text)" }}>
            3.1 Personal Data You Provide
          </h3>
          <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
            <li><strong>Authentication Data:</strong> Email address and OAuth provider account information (Google)</li>
            <li><strong>Timeline Reports:</strong> Processing office, process type, submission dates, decision dates, status. Reports are linked to your account internally for fraud prevention and duplicate detection, but are <strong>never publicly displayed with your identity</strong> (pseudonymous processing per GDPR Art. 4(5)).</li>
            <li><strong>Reviews:</strong> Ratings, review content, optional title and process type</li>
            <li><strong>Contact Form:</strong> Name, email address, subject, message content</li>
            <li><strong>Newsletter:</strong> Email address and verification token for double opt-in</li>
          </ul>

          <h3 style={{ fontSize: "20px", fontWeight: 600, marginTop: "24px", marginBottom: "12px", color: "var(--tt-text)" }}>
            3.2 Automatically Collected Data
          </h3>
          <ul style={{ paddingLeft: "24px" }}>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clickstream data (only if analytics consent is given)</li>
            <li><strong>Security Data:</strong> CAPTCHA verification tokens and related security signals (Turnstile)</li>
            <li><strong>Cookies & Similar Storage:</strong> Session and authentication data, consent preference, analytics identifiers (see Cookie Policy)</li>
            <li><strong>Consent Logs:</strong> Cookie consent choice, timestamp, masked IP, user agent</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            4. Legal Basis for Processing (GDPR Art. 6)
          </h2>
          <p>We process your personal data based on:</p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li><strong>Consent (Art. 6(1)(a)):</strong> Analytics cookies, newsletter subscription, optional cookies</li>
            <li><strong>Contract / Pre-Contractual Steps (Art. 6(1)(b)):</strong> Account access, authentication, user requests, and transactional service emails directly related to your own submitted data (e.g. reminders to update a pending timeline you submitted)</li>
            <li><strong>Legitimate Interest (Art. 6(1)(f)):</strong> Security, fraud prevention, abuse protection, and service improvement</li>
            <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> Compliance with German and EU law</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            5. How We Use Your Information
          </h2>
          <ul style={{ paddingLeft: "24px" }}>
            <li>To provide and maintain our service</li>
            <li>To authenticate users and prevent abuse</li>
            <li>To display aggregated, anonymous processing time statistics</li>
            <li>To respond to your inquiries and support requests</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
            <li>To send you transactional service emails directly related to data you have submitted — for example, to remind you to update or close a timeline you submitted while it remains pending. These emails are sent on the basis of contract performance (Art. 6(1)(b) GDPR) and are not marketing communications. You may delete your account at any time to stop receiving them.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            6. Data Retention
          </h2>
          <ul style={{ paddingLeft: "24px" }}>
            <li><strong>Account & Authentication Data:</strong> Kept while your account is active or as required to provide the service</li>
            <li><strong>Reports & Reviews:</strong> Retained for community statistics and integrity, or anonymized where possible</li>
            <li><strong>Contact & Newsletter Data:</strong> Kept only as long as necessary to respond or maintain your subscription</li>
            <li><strong>Security & Consent Logs:</strong> Kept for compliance, fraud prevention, and audit purposes</li>
            <li><strong>General Rule:</strong> We review and delete or anonymize data when it is no longer needed for the purposes described above or when required by law</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            7. Your GDPR Rights
          </h2>
          <p>Under GDPR, you have the following rights:</p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data</li>
            <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate data</li>
            <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data ("right to be forgotten")</li>
            <li><strong>Right to Restriction (Art. 18):</strong> Limit how we use your data</li>
            <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a machine-readable format</li>
            <li><strong>Right to Object (Art. 21):</strong> Object to data processing</li>
            <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Withdraw consent at any time</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            To exercise these rights, contact us at termintacho@gmail.com
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            8. Data Sharing and Third Parties
          </h2>
          <p>We may share your data with:</p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li><strong>OAuth Providers:</strong> Google (authentication only)</li>
            <li><strong>Analytics:</strong> Google Analytics (only with consent)</li>
            <li><strong>Error & Performance Monitoring:</strong> Sentry (to diagnose errors and improve stability)</li>
            <li><strong>Security / Anti-Abuse:</strong> Cloudflare Turnstile (CAPTCHA protection)</li>
            <li><strong>Email Delivery:</strong> Resend (transactional and verification emails)</li>
            <li><strong>Database Provider:</strong> Supabase (data processing agreement in place)
            </li>
            <li><strong>Hosting Provider:</strong> Website hosting and infrastructure providers used to operate TerminTacho</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            We do not sell your personal data to third parties.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            9. International Data Transfers
          </h2>
          <p>
            Some of our providers may process data outside the EU/EEA. We ensure appropriate safeguards through:
          </p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li>EU Standard Contractual Clauses (SCCs)</li>
            <li>EU-US Data Privacy Framework (where applicable)</li>
            <li>Adequacy decisions by the EU Commission</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            10. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data, including:
          </p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure database with access controls</li>
            <li>Regular security audits</li>
            <li>Password hashing and secure authentication</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            11. Children's Privacy
          </h2>
          <p>
            Our service is not directed to individuals under 16 years of age. We do not knowingly collect personal data from children. If we discover that a child has provided us with personal data, we will delete it immediately.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            12. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be reflected on this page with an updated "Last Updated" date.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            13. Contact & Complaints
          </h2>
          <p>
            For privacy-related questions or to exercise your rights, contact us at:<br/>
            Email: termintacho@gmail.com<br/>
            <br/>
            You also have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>
        </div>
      </div>
    </main>
  );
}

