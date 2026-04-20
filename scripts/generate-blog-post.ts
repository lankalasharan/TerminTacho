/**
 * Auto Blog Post Generator for TerminTacho
 * ==========================================
 * Pulls live stats from Supabase DB, generates an SEO-optimised blog post
 * using OpenAI GPT-4o, and publishes it via the /api/blog endpoint.
 *
 * Run manually:   npx tsx scripts/generate-blog-post.ts
 * Scheduled:      GitHub Actions every 2 weeks (see .github/workflows/generate-blog.yml)
 *
 * Required env vars:
 *   DATABASE_URL          — Supabase Postgres connection string
 *   GEMINI_API_KEY        — Google Gemini API key (free at aistudio.google.com)
 *   BLOG_GENERATE_SECRET  — Secret shared with /api/blog POST endpoint
 *   SITE_URL              — Your live site URL e.g. https://termintacho.de
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProcessStat {
  name: string;
  avgDays: number;
  count: number;
}

interface CityStat {
  city: string;
  totalReports: number;
  approvalRate: number;
  processes: ProcessStat[];
}

// ─── Topic rotation — cycles through these every 2 weeks ─────────────────────

const TOPIC_TEMPLATES = [
  {
    category: "Data Report",
    titleTemplate: (city: string, month: string, year: number) =>
      `Ausländerbehörde Processing Times in ${city} — ${month} ${year} Report`,
    keywordFocus: (city: string) =>
      `ausländerbehörde ${city.toLowerCase()} processing time, ${city.toLowerCase()} visa wait time, how long ${city.toLowerCase()} permit`,
  },
  {
    category: "Visa Guides",
    titleTemplate: (_city: string, month: string, year: number) =>
      `EU Blue Card Processing Times Germany — ${month} ${year} Data`,
    keywordFocus: (_city: string) =>
      `eu blue card processing time germany 2026, blue card wait time, how long blue card germany`,
  },
  {
    category: "Analysis",
    titleTemplate: (_city: string, month: string, year: number) =>
      `Germany Work Permit vs Blue Card: Processing Time Comparison ${month} ${year}`,
    keywordFocus: (_city: string) =>
      `work permit germany processing time, blue card vs work permit wait time, §18b visa duration`,
  },
  {
    category: "Tips & Tricks",
    titleTemplate: (city: string, _month: string, _year: number) =>
      `How to Speed Up Your ${city} Ausländerbehörde Application in 2026`,
    keywordFocus: (city: string) =>
      `${city.toLowerCase()} ausländerbehörde tips, how to apply faster germany visa, speed up permit germany`,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöü]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getMonthName(date: Date): string {
  return date.toLocaleString("en-US", { month: "long" });
}

function estimateReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

// ─── Fetch live stats from DB ─────────────────────────────────────────────────

async function fetchCityStats(): Promise<CityStat[]> {
  const reports = await prisma.report.findMany({
    where: { decisionAt: { not: null } },
    include: {
      office: { select: { city: true } },
      processType: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const cityMap = new Map<string, typeof reports>();
  for (const r of reports) {
    const city = r.office?.city ?? "Unknown";
    if (!cityMap.has(city)) cityMap.set(city, []);
    cityMap.get(city)!.push(r);
  }

  const stats: CityStat[] = [];
  for (const [city, cityReports] of cityMap.entries()) {
    if (cityReports.length < 3) continue; // skip cities with too little data

    const approved = cityReports.filter((r) => r.status === "approved");
    const approvalRate = Math.round((approved.length / cityReports.length) * 100);

    // Group by process type
    const processMap = new Map<string, number[]>();
    for (const r of cityReports) {
      if (!r.decisionAt || !r.submittedAt) continue;
      const days = Math.round(
        (new Date(r.decisionAt).getTime() - new Date(r.submittedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (days < 0 || days > 730) continue; // sanity check
      const name = r.processType?.name ?? "Unknown";
      if (!processMap.has(name)) processMap.set(name, []);
      processMap.get(name)!.push(days);
    }

    const processes: ProcessStat[] = [];
    for (const [name, days] of processMap.entries()) {
      const avgDays = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
      processes.push({ name, avgDays, count: days.length });
    }
    processes.sort((a, b) => b.count - a.count);

    stats.push({ city, totalReports: cityReports.length, approvalRate, processes });
  }

  stats.sort((a, b) => b.totalReports - a.totalReports);
  return stats;
}

// ─── Build the GPT prompt ─────────────────────────────────────────────────────

function buildPrompt(
  topic: (typeof TOPIC_TEMPLATES)[0],
  topCity: CityStat,
  allCities: CityStat[],
  title: string,
  keywordFocus: string,
  month: string,
  year: number
): string {
  const processLines = topCity.processes
    .slice(0, 5)
    .map((p) => `- ${p.name}: average ${p.avgDays} days (${p.count} reports)`)
    .join("\n");

  const otherCities = allCities
    .filter((c) => c.city !== topCity.city)
    .slice(0, 3)
    .map((c) => `${c.city}: ${c.totalReports} reports, ${c.approvalRate}% approval`)
    .join("; ");

  return `You are writing a blog post for termintacho.de — a free community tool where expats and immigrants in Germany share real Ausländerbehörde processing timelines.

TITLE: "${title}"
CATEGORY: ${topic.category}
TARGET KEYWORDS: ${keywordFocus}
MONTH/YEAR: ${month} ${year}

REAL DATA FROM OUR DATABASE:
- Focus city: ${topCity.city} (${topCity.totalReports} reports, ${topCity.approvalRate}% approval rate)
${processLines}
- Other cities in our DB: ${otherCities}

WRITING INSTRUCTIONS:
- Write in a warm, human, slightly informal tone — like an experienced expat helping a friend
- The reader is anxious and waiting for a visa decision. Be reassuring but honest.
- Use the real data above. Don't invent statistics not listed here.
- Naturally mention termintacho.de 2-3 times as the data source
- Include a call-to-action at the end asking readers to submit their own timeline
- Structure: intro → data breakdown → what affects processing time → tips → CTA
- Length: 550–700 words of actual prose
- Output ONLY valid HTML (use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a href="...">)
- No <html>, <body>, <head> tags — just the article body HTML
- Links: use href="/submit" for the submit page and href="/timelines" for browsing data
- Do NOT add any markdown. Only HTML.`;
}

// ─── Generate excerpt from content ───────────────────────────────────────────

function buildExcerpt(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, 200).replace(/\s\w+$/, "") + "...";
}

// ─── Publish to site via API ──────────────────────────────────────────────────

async function publishPost(post: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
}): Promise<void> {
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const secret = process.env.BLOG_GENERATE_SECRET;

  if (!secret) throw new Error("BLOG_GENERATE_SECRET env var is not set");

  const res = await fetch(`${siteUrl}/api/blog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-blog-secret": secret,
    },
    body: JSON.stringify({ ...post, autoGenerated: true }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to publish: ${res.status} ${text}`);
  }

  console.log(`✅ Published: /blog/${post.slug}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🤖 TerminTacho Blog Auto-Generator\n");

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("GEMINI_API_KEY env var is not set");

  // Pick topic based on current week number (rotates every run)
  const now = new Date();
  const weekNumber = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 7));
  const topic = TOPIC_TEMPLATES[weekNumber % TOPIC_TEMPLATES.length];
  const month = getMonthName(now);
  const year = now.getFullYear();

  console.log(`📋 Topic: ${topic.category}`);

  // Fetch live DB stats
  console.log("📊 Fetching DB stats...");
  const cityStats = await fetchCityStats();

  if (cityStats.length === 0) {
    console.log("⚠️  Not enough data in DB yet. Need at least 3 reports per city. Skipping.");
    return;
  }

  // Rotate through top cities too
  const cityIndex = weekNumber % Math.min(cityStats.length, 3);
  const topCity = cityStats[cityIndex];
  console.log(`🏙️  Focus city: ${topCity.city} (${topCity.totalReports} reports)`);

  const title = topic.titleTemplate(topCity.city, month, year);
  const keywordFocus = topic.keywordFocus(topCity.city);
  const slug = slugify(`${title}-${year}-${month.toLowerCase()}`);

  console.log(`📝 Generating: "${title}"`);

  // Build the GPT prompt
  const prompt = buildPrompt(topic, topCity, cityStats, title, keywordFocus, month, year);

  // Call Google Gemini (free tier)
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;

  const geminiRes = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    }),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    throw new Error(`Gemini API error: ${geminiRes.status} ${err}`);
  }

  const geminiData = await geminiRes.json() as any;
  const content: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!content) throw new Error("OpenAI returned empty content");

  const excerpt = buildExcerpt(content);
  const readTime = estimateReadTime(content);

  console.log(`✍️  Generated ${content.length} chars, ~${readTime}`);

  // Publish
  await publishPost({ slug, title, excerpt, content, category: topic.category, readTime });

  console.log(`\n🎉 Done! View at: ${process.env.SITE_URL ?? "http://localhost:3000"}/blog/${slug}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
