export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>
          TerminTacho 🇩🇪
        </h1>
        <p style={{ fontSize: 20, opacity: 0.8, lineHeight: 1.6, maxWidth: 700, margin: "0 auto" }}>
          Real processing times for German bureaucracy. Anonymous, crowdsourced timelines for visas, residence permits, and more.
        </p>
      </div>

      <div style={{ display: "grid", gap: 24, marginBottom: 60 }}>
        <div style={{ background: "#f9fafb", padding: 32, borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>😰 The Problem</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.7 }}>
            German authorities provide little to no information about real processing times. 
            Applicants are left in the dark, causing anxiety and making it impossible to plan their lives. 
            Official websites often show unrealistic estimates or no estimates at all.
          </p>
        </div>

        <div style={{ background: "#f0fdf4", padding: 32, borderRadius: 12, border: "1px solid #bbf7d0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>✨ The Solution</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.7 }}>
            TerminTacho collects real, anonymous timelines from actual applicants. 
            See how long others waited at your specific office, filter by process type, 
            and get realistic expectations. Submit your own experience to help others.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <a 
          href="/timelines"
          style={{ 
            display: "block",
            padding: 24, 
            background: "#2563eb", 
            color: "white", 
            textAlign: "center", 
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 18,
            fontWeight: 600,
            transition: "background 0.2s"
          }}
        >
          📊 Browse Timelines
        </a>
        <a 
          href="/submit"
          style={{ 
            display: "block",
            padding: 24, 
            background: "#16a34a", 
            color: "white", 
            textAlign: "center", 
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 18,
            fontWeight: 600,
            transition: "background 0.2s"
          }}
        >
          ➕ Submit Your Timeline
        </a>
      </div>

      <div style={{ marginTop: 60, padding: 24, background: "#fef3c7", borderRadius: 8, border: "1px solid #fde047" }}>
        <p style={{ fontSize: 14, opacity: 0.8, textAlign: "center", lineHeight: 1.6 }}>
          ⚠️ <strong>Disclaimer:</strong> This data is crowdsourced and not official. 
          Use it for general expectations only. Processing times vary by individual case.
        </p>
      </div>
    </main>
  );
}
