"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BlogPostMeta = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
};

// Static fallback posts (shown until DB posts are available)
const staticPosts: BlogPostMeta[] = [
  {
    id: "complete-guide-blue-card",
    slug: "complete-guide-blue-card",
    title: "Complete Guide to Getting the EU Blue Card in Germany",
    excerpt: "Everything you need to know about applying for the EU Blue Card, from eligibility requirements to processing times.",
    publishedAt: "2026-01-20",
    category: "Visa Guides",
    readTime: "8 min read",
  },
  {
    id: "auslanderbehorde-appointment-tips",
    slug: "auslanderbehorde-appointment-tips",
    title: "10 Tips for Your Ausländerbehörde Appointment",
    excerpt: "Make your appointment at the foreigners office smooth and stress-free with these expert tips.",
    publishedAt: "2026-01-15",
    category: "Tips & Tricks",
    readTime: "5 min read",
  },
  {
    id: "processing-times-explained",
    slug: "processing-times-explained",
    title: "Understanding Processing Times: What Really Affects Them?",
    excerpt: "Learn what factors influence processing times at different German immigration offices.",
    publishedAt: "2026-01-10",
    category: "Analysis",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
  const [dbPosts, setDbPosts] = useState<BlogPostMeta[]>([]);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          setDbPosts(data.posts);
        }
      })
      .catch(() => {});
  }, []);

  const allPosts = dbPosts.length > 0
    ? [...dbPosts, ...staticPosts]
    : staticPosts;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 16px" }}>
      <section className="tt-hero" style={{ padding: "64px 0 48px" }}>
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            Blog
          </div>
          <h1 className="tt-hero-title">Guides and updates.</h1>
          <p className="tt-hero-subtitle">
            Expert tips and insights to help you navigate German bureaucracy with confidence.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <div style={{
        display: "grid",
        gap: "24px",
      }}>
        {allPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{
              textDecoration: "none",
              background: "white",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid var(--tt-surface-muted)",
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
                background: "var(--tt-primary-strong)",
                color: "white",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
              }}>
                {post.category}
              </span>
              <span style={{
                padding: "4px 12px",
                background: "var(--tt-surface-muted)",
                color: "var(--tt-text-muted)",
                borderRadius: "6px",
                fontSize: "13px",
              }}>
                {post.readTime}
              </span>
            </div>

            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--tt-text)",
              marginBottom: "12px",
              lineHeight: 1.3,
            }}>
              {post.title}
            </h2>

            <p style={{
              fontSize: "16px",
              color: "var(--tt-text-muted)",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}>
              {post.excerpt}
            </p>

            <div style={{
              fontSize: "14px",
              color: "var(--tt-muted)",
            }}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
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
        background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
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
            color: "var(--tt-primary-strong)",
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

