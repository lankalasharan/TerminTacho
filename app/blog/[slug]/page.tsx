"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

// This will be replaced with database/CMS content later
const blogPosts: Record<string, any> = {
  "complete-guide-blue-card": {
    title: "Complete Guide to Getting the EU Blue Card in Germany",
    date: "2026-01-20",
    category: "Visa Guides",
    readTime: "8 min read",
    content: `
      <h2>What is the EU Blue Card?</h2>
      <p>The EU Blue Card is a work and residence permit for highly qualified non-EU citizens. It allows you to live and work in Germany and travel freely within the Schengen Area.</p>
      
      <h2>Eligibility Requirements</h2>
      <ul>
        <li>University degree (Bachelor's or higher)</li>
        <li>Job offer from a German employer</li>
        <li>Minimum salary threshold (€45,300 per year in 2026)</li>
        <li>For shortage occupations: €41,042 per year</li>
      </ul>
      
      <h2>Required Documents</h2>
      <ul>
        <li>Valid passport</li>
        <li>University degree certificates</li>
        <li>Employment contract</li>
        <li>Proof of health insurance</li>
        <li>Biometric photos</li>
      </ul>
      
      <h2>Processing Time</h2>
      <p>According to our data, the average processing time for EU Blue Card applications is 6-12 weeks, but this varies significantly by city and office.</p>
      
      <p><strong>Want to see real processing times?</strong> Check our <a href="/">interactive timeline tool</a> to see actual user-reported processing times for your city.</p>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Apply as early as possible - some offices are booked months in advance</li>
        <li>Have all documents translated by certified translators</li>
        <li>Bring original documents and copies</li>
        <li>Consider using our <a href="/submit">timeline tracker</a> to help others</li>
      </ul>
    `,
  },
  "auslanderbehorde-appointment-tips": {
    title: "10 Tips for Your Ausländerbehörde Appointment",
    date: "2026-01-15",
    category: "Tips & Tricks",
    readTime: "5 min read",
    content: `
      <h2>1. Arrive Early</h2>
      <p>Plan to arrive at least 15 minutes before your appointment. German offices are strict about punctuality.</p>
      
      <h2>2. Bring ALL Required Documents</h2>
      <p>Missing even one document can delay your case by weeks or months. Check the office's website and bring extras.</p>
      
      <h2>3. Have Copies Ready</h2>
      <p>Bring copies of everything. Some offices make copies, but many don't.</p>
      
      <h2>4. Passport Photos</h2>
      <p>Bring biometric passport photos (35x45mm). You'll need them for your residence permit.</p>
      
      <h2>5. Speak German (If Possible)</h2>
      <p>While many officers speak English, basic German phrases show effort and can help communication.</p>
      
      <h2>6. Be Patient and Polite</h2>
      <p>Officers handle hundreds of cases. Being polite and patient goes a long way.</p>
      
      <h2>7. Know Your Case Officer's Name</h2>
      <p>For follow-ups, having the officer's name helps ensure continuity.</p>
      
      <h2>8. Check Processing Times</h2>
      <p>Use <a href="/">TerminTacho</a> to see real processing times in your city and set realistic expectations.</p>
      
      <h2>9. Bring Cash</h2>
      <p>Many offices don't accept cards. Bring enough cash for fees (usually €50-€100).</p>
      
      <h2>10. Take Notes</h2>
      <p>Write down any additional documents requested or next steps. It's easy to forget details after the appointment.</p>
    `,
  },
  "processing-times-explained": {
    title: "Understanding Processing Times: What Really Affects Them?",
    date: "2026-01-10",
    category: "Analysis",
    readTime: "6 min read",
    content: `
      <h2>Why Processing Times Vary So Much</h2>
      <p>If you've used our <a href="/">timeline tool</a>, you've seen that processing times can range from 2 weeks to 6 months. Here's why.</p>
      
      <h2>Location Matters</h2>
      <p>Berlin processes 100,000+ applications per year. Small city offices might process only 5,000. This affects staffing and wait times.</p>
      
      <h2>Application Type</h2>
      <p>Different visa types have different processing requirements:</p>
      <ul>
        <li>Blue Card: 4-12 weeks average</li>
        <li>Family Reunion: 8-16 weeks average</li>
        <li>Student Visa: 4-8 weeks average</li>
        <li>Permanent Residence: 12-24 weeks average</li>
      </ul>
      
      <h2>Seasonal Variations</h2>
      <p>September-October sees huge spikes (university semester starts). Summer months are often faster.</p>
      
      <h2>Document Completeness</h2>
      <p>Missing documents can add 4-8 weeks to your processing time. Always bring everything on the first visit.</p>
      
      <h2>Our Data Shows</h2>
      <p>Based on user submissions to TerminTacho:</p>
      <ul>
        <li>Munich: Fastest average (6.2 weeks)</li>
        <li>Berlin: Slowest average (14.8 weeks)</li>
        <li>Online submissions: 20% faster than in-person</li>
        <li>Complete documentation: 30% faster processing</li>
      </ul>
      
      <p><strong>Help improve our data:</strong> <a href="/submit">Submit your timeline</a> to help others in your city!</p>
    `,
  },
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Back Link */}
      <Link
        href="/blog"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--tt-primary-strong)",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "24px",
        }}
      >
        ← Back to Blog
      </Link>

      {/* Article Header */}
      <article>
        <header style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
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

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800,
            marginBottom: "16px",
            color: "var(--tt-text)",
            lineHeight: 1.2,
          }}>
            {post.title}
          </h1>

          <div style={{
            fontSize: "14px",
            color: "var(--tt-muted)",
          }}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Article Content */}
        <div
          style={{
            fontSize: "18px",
            lineHeight: 1.8,
            color: "var(--tt-text-strong)",
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="blog-content"
        />
      </article>

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
          Found this helpful?
        </h3>
        <p style={{ fontSize: "16px", marginBottom: "20px", opacity: 0.9 }}>
          Help others by sharing your processing timeline
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
        >
          Submit Your Timeline
        </Link>
      </div>

      <style jsx global>{`
        .blog-content h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 32px 0 16px;
          color: var(--tt-text);
        }
        .blog-content h3 {
          font-size: 22px;
          font-weight: 700;
          margin: 24px 0 12px;
          color: var(--tt-text);
        }
        .blog-content p {
          margin-bottom: 20px;
        }
        .blog-content ul, .blog-content ol {
          margin: 20px 0;
          padding-left: 24px;
        }
        .blog-content li {
          margin-bottom: 12px;
        }
        .blog-content a {
          color: var(--tt-primary-strong);
          text-decoration: underline;
        }
        .blog-content a:hover {
          color: var(--tt-primary);
        }
        .blog-content strong {
          font-weight: 700;
          color: var(--tt-text);
        }
      `}</style>
    </div>
  );
}

