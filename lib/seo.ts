import { Metadata } from "next";

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  keywords?: string[];
}

export function generateMetadata({
  title,
  description,
  path,
  image = "/og-image.png",
  type = "website",
  publishedTime,
  author,
  keywords = [],
}: PageSEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://termintacho.de";
  const url = `${baseUrl}${path}`;
  const fullImageUrl = `${baseUrl}${image}`;

  const defaultKeywords = [
    "Germany",
    "visa",
    "residence permit",
    "Aufenthaltserlaubnis",
    "processing time",
    "Ausländerbehörde",
    "German bureaucracy",
  ];

  return {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords],
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type,
      locale: "en_US",
      url,
      title,
      description,
      siteName: "TerminTacho",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && type === "article"
        ? { publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
      creator: "@termintacho",
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TerminTacho",
    url: "https://termintacho.de",
    logo: "https://termintacho.de/logo.png",
    description:
      "Anonymous, crowdsourced processing times for German visa applications, residence permits, and bureaucratic processes.",
    sameAs: [
      // Add social media links here when available
    ],
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TerminTacho",
    url: "https://termintacho.de",
    description:
      "Real processing times for German bureaucracy from real people across 74 cities.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://termintacho.de/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },

  breadcrumb: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  article: (article: {
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "TerminTacho",
      logo: {
        "@type": "ImageObject",
        url: "https://termintacho.de/logo.png",
      },
    },
  }),

  faqPage: (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }),
};
