"use client";

export default function ShareButtons({ title, url, description }: { title: string; url: string; description: string }) {
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <div style={{
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--tt-text-muted)" }}>Share:</span>
      
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "#1DA1F2",
          color: "white",
          textDecoration: "none",
          fontSize: "18px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        title="Share on Twitter"
      >
        𝕏
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "#1877F2",
          color: "white",
          textDecoration: "none",
          fontSize: "18px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        title="Share on Facebook"
      >
        f
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "#0A66C2",
          color: "white",
          textDecoration: "none",
          fontSize: "18px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        title="Share on LinkedIn"
      >
        in
      </a>

      <a
        href={shareLinks.reddit}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "#FF4500",
          color: "white",
          textDecoration: "none",
          fontSize: "18px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        title="Share on Reddit"
      >
        r
      </a>

      <button
        onClick={handleCopyLink}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "var(--tt-primary-strong)",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        title="Copy link"
      >
        🔗
      </button>
    </div>
  );
}

