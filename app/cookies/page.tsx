export default function CookiePolicy() {
  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 20px" }}>
      <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "16px", color: "#1a1a1a" }}>
        Cookie Policy
      </h1>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "40px" }}>
        Last Updated: January 25, 2026
      </p>

      <div style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151" }}>
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, making your next visit easier and the site more useful to you.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            2. How We Use Cookies
          </h2>
          <p>TerminTacho uses cookies for the following purposes:</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" }}>
            2.1 Essential Cookies (Required)
          </h3>
          <p>
            These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions you make, such as logging in.
          </p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li><strong>Session Cookies:</strong> Keep you logged in during your visit</li>
            <li><strong>Authentication Cookies:</strong> Verify your identity (via NextAuth.js)</li>
            <li><strong>CSRF Protection:</strong> Prevent cross-site request forgery attacks</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            <strong>Duration:</strong> Session cookies (deleted when browser closes)<br/>
            <strong>Legal Basis:</strong> GDPR Art. 6(1)(f) - Legitimate Interest
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" }}>
            2.2 Functional Cookies (Optional)
          </h3>
          <p>
            These cookies enable enhanced functionality and personalization, such as remembering your preferences.
          </p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li><strong>Preference Cookies:</strong> Remember your filter selections</li>
            <li><strong>Language Cookies:</strong> Remember your language preference</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            <strong>Duration:</strong> Up to 1 year<br/>
            <strong>Legal Basis:</strong> GDPR Art. 6(1)(a) - Consent
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" }}>
            2.3 Analytics Cookies (Optional)
          </h3>
          <p>
            These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
          </p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li><strong>Usage Analytics:</strong> Pages visited, time on site, navigation patterns</li>
            <li><strong>Performance Metrics:</strong> Page load times, errors</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            <strong>Duration:</strong> Up to 2 years<br/>
            <strong>Legal Basis:</strong> GDPR Art. 6(1)(a) - Consent
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            3. Third-Party Cookies
          </h2>
          <p>We may use third-party services that set their own cookies:</p>
          <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
            <li><strong>Google OAuth:</strong> Authentication (if you sign in with Google)</li>
            <li><strong>Facebook OAuth:</strong> Authentication (if you sign in with Facebook)</li>
          </ul>
          <p style={{ marginTop: "16px" }}>
            These third parties have their own privacy policies. We recommend reviewing them:
          </p>
          <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
            <li>Google Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" style={{ color: "#667eea" }}>https://policies.google.com/privacy</a></li>
            <li>Facebook Data Policy: <a href="https://www.facebook.com/policy.php" target="_blank" style={{ color: "#667eea" }}>https://www.facebook.com/policy.php</a></li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            4. Managing Cookies
          </h2>
          <p>You can control and manage cookies in several ways:</p>
          
          <h3 style={{ fontSize: "20px", fontWeight: 600, marginTop: "24px", marginBottom: "12px", color: "#1a1a1a" }}>
            Browser Settings
          </h3>
          <p>Most browsers allow you to:</p>
          <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
            <li>View what cookies are stored and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from specific websites</li>
            <li>Block all cookies</li>
            <li>Delete all cookies when you close your browser</li>
          </ul>

          <h3 style={{ fontSize: "20px", fontWeight: 600, marginTop: "24px", marginBottom: "12px", color: "#1a1a1a" }}>
            Browser-Specific Instructions
          </h3>
          <ul style={{ paddingLeft: "24px" }}>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>

          <p style={{ marginTop: "16px", padding: "16px", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fde047" }}>
            ⚠️ <strong>Note:</strong> Blocking all cookies may prevent you from using certain features of our website, including the ability to sign in.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            5. Cookie Consent
          </h2>
          <p>
            When you first visit TerminTacho, we will ask for your consent to use non-essential cookies. You can change your cookie preferences at any time by clicking the "Cookie Settings" link in the footer.
          </p>
          <p style={{ marginTop: "16px" }}>
            Essential cookies do not require consent under GDPR as they are necessary for the website to function.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            6. Updates to This Policy
          </h2>
          <p>
            We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            7. Contact Us
          </h2>
          <p>
            If you have questions about our use of cookies, please contact us at:<br/>
            Email: [your-email@termintacho.com]
          </p>
        </section>
      </div>
    </main>
  );
}
