export default function Imprint() {
  return (
    <main className="tt-section">
      <div className="tt-container" style={{ maxWidth: "900px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "16px", color: "var(--tt-text)" }}>
          Impressum
        </h1>
        <div style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--tt-text-strong)" }}>
          <section style={{ marginBottom: "28px" }}>
            <p style={{ margin: 0 }}>
              Sharan Kumar Reddy Lankala<br />
              Augartenstraße 38<br />
              76137 Karlsruhe
            </p>
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--tt-text)" }}>
              Kontakt
            </h2>
            <p style={{ margin: 0 }}>
              Telefon: +49 17645824615<br />
              E-Mail: termintacho@gmail.com
            </p>
          </section>

          <section style={{ marginBottom: "28px" }}>
            <p style={{ margin: 0 }}>
              Quelle: {" "}
              <a
                href="https://www.e-recht24.de"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--tt-primary-strong)" }}
              >
                https://www.e-recht24.de
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

