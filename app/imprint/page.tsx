export default function Imprint() {
  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 20px" }}>
      <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "16px", color: "#1a1a1a" }}>
        Impressum (Imprint)
      </h1>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "40px" }}>
        Legal Disclosure as required by German law (§5 TMG)
      </p>

      <div style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151" }}>
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            Information According to § 5 TMG
          </h2>
          <div style={{ padding: "24px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <p style={{ marginBottom: "16px" }}>
              <strong>Operator / Publisher:</strong><br/>
              [Your Full Legal Name or Company Name]<br/>
              [Street Address]<br/>
              [Postal Code] [City]<br/>
              Germany
            </p>
            
            <p style={{ marginBottom: "16px" }}>
              <strong>Contact:</strong><br/>
              Email: [your-email@termintacho.com]<br/>
              Phone: [Your Phone Number]
            </p>

            <p style={{ marginBottom: "16px" }}>
              <strong>Represented by:</strong><br/>
              [Name of Legal Representative]
            </p>

            {/* Uncomment if applicable */}
            {/* <p style={{ marginBottom: "16px" }}>
              <strong>Commercial Register:</strong><br/>
              Register Court: [Court Name]<br/>
              Registration Number: [HRB/HRA Number]
            </p> */}

            {/* <p style={{ marginBottom: "16px" }}>
              <strong>VAT ID:</strong><br/>
              VAT Identification Number according to §27a UStG: [DE123456789]
            </p> */}

            <p style={{ fontSize: "14px", color: "#ef4444", marginTop: "24px" }}>
              ⚠️ <strong>Important:</strong> Please update all bracketed [...] information with your actual details before going live!
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            Responsible for Content (§ 55 Abs. 2 RStV)
          </h2>
          <p>
            [Your Full Name]<br/>
            [Same Address as Above]
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            Dispute Resolution
          </h2>
          <p>
            The European Commission provides a platform for online dispute resolution (ODR): 
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", marginLeft: "4px" }}>
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p style={{ marginTop: "16px" }}>
            Our email address can be found above in the imprint.
          </p>
          <p style={{ marginTop: "16px" }}>
            We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            Liability for Content
          </h2>
          <p>
            As a service provider, we are responsible for our own content on these pages in accordance with § 7 Para.1 TMG (German Telemedia Act) and general laws. However, according to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
          </p>
          <p style={{ marginTop: "16px" }}>
            Obligations to remove or block the use of information under general laws remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific legal violation. Upon becoming aware of such violations, we will remove this content immediately.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            Liability for Links
          </h2>
          <p>
            Our website contains links to external third-party websites over whose content we have no control. Therefore, we cannot assume any liability for this external content. The respective provider or operator of the pages is always responsible for the content of the linked pages.
          </p>
          <p style={{ marginTop: "16px" }}>
            The linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognizable at the time of linking. However, permanent monitoring of the content of the linked pages is not reasonable without concrete evidence of a legal violation. Upon becoming aware of legal violations, we will remove such links immediately.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            Copyright
          </h2>
          <p>
            The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, editing, distribution, and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.
          </p>
          <p style={{ marginTop: "16px" }}>
            Downloads and copies of this site are only permitted for private, non-commercial use. Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is marked as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. Upon becoming aware of legal violations, we will remove such content immediately.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>
            User-Generated Content Disclaimer
          </h2>
          <p>
            TerminTacho is a crowdsourced platform where users submit anonymous processing time information. The information provided by users is not verified and should not be considered official or legally binding. We are not responsible for the accuracy, completeness, or reliability of user-submitted data.
          </p>
          <p style={{ marginTop: "16px" }}>
            All processing times displayed are estimates based on community reports and may not reflect actual processing times at German government offices.
          </p>
        </section>
      </div>
    </main>
  );
}
