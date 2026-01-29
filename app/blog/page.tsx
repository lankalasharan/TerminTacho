import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - German Bureaucracy Tips & Guides",
  description: "Expert guides, tips, and updates about navigating German bureaucracy, visa applications, and residence permits.",
};

// This will be replaced with database/CMS content later
const blogPosts = [
  {
    id: "complete-guide-blue-card",
    title: "Complete Guide to Getting the EU Blue Card in Germany",
    excerpt: "Everything you need to know about applying for the EU Blue Card, from eligibility requirements to processing times.",
    date: "2026-01-20",
    category: "Visa Guides",
    readTime: "8 min read",
  },
  {
    id: "auslanderbehorde-appointment-tips",
    title: "10 Tips for Your Ausländerbehörde Appointment",
    excerpt: "Make your appointment at the foreigners office smooth and stress-free with these expert tips.",
    date: "2026-01-15",
    category: "Tips & Tricks",
    readTime: "5 min read",
  },
  {
    id: "processing-times-explained",
    title: "Understanding Processing Times: What Really Affects Them?",
    excerpt: "Learn what factors influence processing times at different German immigration offices.",
    date: "2026-01-10",
    category: "Analysis",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 800,
          marginBottom: "16px",
          color: "#1a1a1a",
          lineHeight: 1.2,
        }}>
          📝 Blog
        </h1>
        <p style={{
          fontSize: "18px",
          color: "#6b7280",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          Expert guides, tips, and updates about navigating German bureaucracy
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div style={{
        display: "grid",
        gap: "24px",
      }}>
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            style={{
              textDecoration: "none",
              background: "white",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f3f4f6",
              transition: "all 0.2s",
              display: "block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
          >
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
              <span style={{
                padding: "4px 12px",
                background: "#667eea",
                color: "white",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
              }}>
                {post.category}
              </span>
              <span style={{
                padding: "4px 12px",
                background: "#f3f4f6",
                color: "#6b7280",
                borderRadius: "6px",
                fontSize: "13px",
              }}>
                {post.readTime}
              </span>
            </div>

            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: "12px",
              lineHeight: 1.3,
            }}>
              {post.title}
            </h2>

            <p style={{
              fontSize: "16px",
              color: "#6b7280",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}>
              {post.excerpt}
            </p>

            <div style={{
              fontSize: "14px",
              color: "#9ca3af",
            }}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Box */}
      <div style={{
        marginTop: "48px",
        padding: "32px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        textAlign: "center",
        color: "white",
      }}>
        <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
          Have a story to share?
        </h3>
        <p style={{ fontSize: "16px", marginBottom: "20px", opacity: 0.9 }}>
          Help others by sharing your experience with German bureaucracy
        </p>
        <Link
          href="/submit"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "white",
            color: "#667eea",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Submit Your Timeline
        </Link>
      </div>
    </div>
  );
}
