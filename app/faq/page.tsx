"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Is TerminTacho really anonymous?",
    answer: "Yes, 100%. We don't store any personal information that can identify you. Authentication is only used to prevent spam and verify you're a real person. Your timeline reports are completely anonymous and cannot be traced back to you."
  },
  {
    question: "Why do I need to sign in?",
    answer: "We require authentication (via Google or Facebook) only to verify you're a real person and prevent spam or fake data. We don't store any of your personal data from these providers—only a random identifier for verification purposes."
  },
  {
    question: "How accurate are the processing times?",
    answer: "All processing times are real experiences submitted by people like you. They represent actual timelines, not official estimates. However, processing times can vary based on many factors, so use them as a general guideline, not a guarantee."
  },
  {
    question: "Which German cities are covered?",
    answer: "We currently have data from 74 German cities, including all major cities like Berlin, Munich, Hamburg, Frankfurt, Stuttgart, and Cologne. New cities are added as users submit reports. You can explore all cities on our interactive map."
  },
  {
    question: "What types of processes can I track?",
    answer: "We cover 47 different bureaucratic processes including visa applications, residence permits (Aufenthaltserlaubnis), Blue Card applications, citizenship, passport services, and more. If your process isn't listed, you can suggest it when submitting."
  },
  {
    question: "How do I submit my timeline?",
    answer: "Sign in with Google or Facebook, click 'Submit Timeline,' select your city and process type, enter your submission and decision dates, and choose your status. That's it! No personal details required."
  },
  {
    question: "Can I edit or delete my submission?",
    answer: "Since all submissions are anonymous, we cannot link them back to specific users. This means you cannot edit or delete submissions after they're posted. Please double-check your information before submitting."
  },
  {
    question: "Is this data official?",
    answer: "No. TerminTacho is a community-driven platform. This is not official government data. Processing times shown are crowdsourced estimates based on real user experiences. Always check official sources for authoritative information."
  },
  {
    question: "How is TerminTacho different from official processing times?",
    answer: "Official processing times are often outdated or overly optimistic. TerminTacho shows real experiences from real people who have gone through the process recently. You get a more realistic expectation of what to expect."
  },
  {
    question: "Is TerminTacho free?",
    answer: "Yes, completely free. TerminTacho is a community service to help people navigate German bureaucracy. There are no hidden fees, subscriptions, or premium features."
  },
  {
    question: "How can I trust the data?",
    answer: "We require authentication to submit data, which prevents spam and fake reports. While we can't verify every single timeline, the authentication requirement ensures that reports come from real people. Large discrepancies or suspicious patterns are monitored."
  },
  {
    question: "What does GDPR-compliant mean?",
    answer: "GDPR (General Data Protection Regulation) is EU privacy law. We're fully compliant—meaning we protect your privacy, don't sell your data, give you control over your information, and follow strict security practices. Check our Privacy Policy for full details."
  },
  {
    question: "Can I use this data for research or media?",
    answer: "The aggregated, anonymous statistics on TerminTacho can be referenced for research or media purposes. Please credit TerminTacho and link back to our website. For bulk data requests, contact us."
  },
  {
    question: "My city isn't listed. What should I do?",
    answer: "Contact us! We're always expanding coverage. If your city has a significant number of bureaucratic processes, we can add it to our database."
  },
  {
    question: "How often is the data updated?",
    answer: "Data is updated in real-time as users submit new reports. You always see the most recent community-submitted timelines."
  },
  {
    question: "Who runs TerminTacho?",
    answer: "TerminTacho is an independent project created to help people navigate German bureaucracy. See our Imprint page for legal information."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "60px 20px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: 800,
            marginBottom: "16px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            ❓ Frequently Asked Questions
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: 0.95,
          }}>
            Everything you need to know about TerminTacho
          </p>
        </div>
      </div>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 20px" }}>
        <div style={{ marginBottom: "40px" }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                marginBottom: "16px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f3f4f6",
                overflow: "hidden",
                transition: "box-shadow 0.2s",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  flex: 1,
                  paddingRight: "16px",
                }}>
                  {faq.question}
                </span>
                <span style={{
                  fontSize: "24px",
                  color: "#667eea",
                  transform: openIndex === index ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.3s",
                  display: "inline-block",
                }}>
                  ⌄
                </span>
              </button>
              
              {openIndex === index && (
                <div style={{
                  padding: "0 24px 20px",
                  fontSize: "16px",
                  lineHeight: 1.7,
                  color: "#6b7280",
                  animation: "fadeIn 0.3s ease",
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "48px",
          borderRadius: "16px",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>
            Still Have Questions?
          </h2>
          <p style={{ fontSize: "16px", opacity: 0.95, marginBottom: "24px" }}>
            Can't find what you're looking for? Feel free to reach out!
          </p>
          <a
            href="/contact"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background: "white",
              color: "#667eea",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Contact Us
          </a>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </main>
    </>
  );
}
