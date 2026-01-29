import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const faqs = [
  {
    id: "faq-1",
    title: "What is TerminTacho?",
    description: "TerminTacho is a crowdsourced platform for real processing times...",
  },
  {
    id: "faq-2",
    title: "Is my data anonymous?",
    description: "Yes, all submissions are completely anonymous and GDPR-compliant...",
  },
  {
    id: "faq-3",
    title: "How accurate is the data?",
    description: "Data comes from real community submissions and is aggregated...",
  },
];

const pages = [
  {
    id: "page-1",
    title: "Timelines",
    description: "Browse real processing times across German cities",
    url: "/timelines",
  },
  {
    id: "page-2",
    title: "Submit Your Timeline",
    description: "Share your own experience and help others",
    url: "/submit",
  },
  {
    id: "page-3",
    title: "FAQ",
    description: "Frequently asked questions",
    url: "/faq",
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    // Search cities
    const cities = await prisma.office.findMany({
      where: {
        OR: [
          { city: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      distinct: ["city"],
      take: 5,
    });

    cities.forEach((city) => {
      results.push({
        id: `city-${city.city}`,
        type: "city",
        title: city.city,
        description: `View processing times and statistics for ${city.city}`,
        url: `/offices/${encodeURIComponent(city.city)}`,
      });
    });

    // Search process types
    const processes = await prisma.processType.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      take: 5,
    });

    processes.forEach((process) => {
      results.push({
        id: `process-${process.id}`,
        type: "process",
        title: process.name,
        description: `Processing times for ${process.name} applications`,
        url: `/timelines?process=${encodeURIComponent(process.name)}`,
      });
    });

    // Search FAQs
    const matchingFaqs = faqs.filter(
      (faq) =>
        faq.title.toLowerCase().includes(query) ||
        faq.description.toLowerCase().includes(query)
    );

    results.push(...matchingFaqs.map((faq) => ({ ...faq, type: "faq" as const })));

    // Search pages
    const matchingPages = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query)
    );

    results.push(...matchingPages.map((page) => ({ ...page, type: "page" as const })));

    return NextResponse.json({ results: results.slice(0, 15) });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] });
  }
}
