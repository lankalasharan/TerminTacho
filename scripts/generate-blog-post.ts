/**
 * Auto Blog Post Generator for TerminTacho
 * ==========================================
 * Pulls live stats from Supabase DB, generates an SEO-optimised blog post
 * using Google Gemini, and publishes it directly to the DB.
 *
 * Run manually:   npx tsx scripts/generate-blog-post.ts
 * Scheduled:      GitHub Actions every 2 weeks (see .github/workflows/generate-blog.yml)
 *
 * Required env vars:
 *   DATABASE_URL          — Supabase Postgres connection string
 *   GEMINI_API_KEY        — Google Gemini API key (free at aistudio.google.com)
 *   SITE_URL              — Your live site URL e.g. https://termintacho.de
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1000;
const BLOG_INTERVAL_DAYS = 15;

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

function stripCodeFences(content: string): string {
  return content.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}

function validateGeneratedContent(content: string, finishReason?: string): { ok: boolean; reason?: string } {
  const words = countWords(content);

  if (!content) {
    return { ok: false, reason: "empty content" };
  }
  if (finishReason === "MAX_TOKENS") {
    return { ok: false, reason: "model stopped at max tokens" };
  }
  if (words < 450) {
    return { ok: false, reason: `content too short (${words} words)` };
  }
  if (!content.includes('href="/submit"')) {
    return { ok: false, reason: "missing CTA submit link" };
  }

  return { ok: true };
}

function isScheduledRunDue(now: Date): boolean {
  const startDateInput = process.env.BLOG_SCHEDULE_START_DATE ?? "2026-01-01";
  const anchor = new Date(`${startDateInput}T00:00:00Z`);

  if (Number.isNaN(anchor.getTime())) {
    throw new Error("BLOG_SCHEDULE_START_DATE is invalid. Use YYYY-MM-DD format.");
  }

  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diffDays = Math.floor((todayUtc.getTime() - anchor.getTime()) / DAY_MS);

  return diffDays >= 0 && diffDays % BLOG_INTERVAL_DAYS === 0;
}

async function generateWithGemini(prompt: string, geminiKey: string): Promise<string> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

  let workingPrompt = prompt;
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`🔁 Gemini attempt ${attempt}/3...`);

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: workingPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      if ((geminiRes.status === 429 || geminiRes.status >= 500) && attempt < 3) {
        console.log(`⚠️ Gemini temporary error ${geminiRes.status}. Retrying...`);
        continue;
      }
      throw new Error(`Gemini API error: ${geminiRes.status} ${err}`);
    }

    const geminiData = (await geminiRes.json()) as any;
    const candidate = geminiData.candidates?.[0];
    const finishReason: string | undefined = candidate?.finishReason;
    const rawContent: string = candidate?.content?.parts?.[0]?.text ?? "";
    const content = stripCodeFences(rawContent);
    const validation = validateGeneratedContent(content, finishReason);

    if (validation.ok) {
      return content;
    }

    if (attempt < 3) {
      console.log(`⚠️ Incomplete generation (${validation.reason}). Retrying with stricter instructions...`);
      workingPrompt = `${prompt}\n\nIMPORTANT RETRY INSTRUCTIONS:\n- Previous draft was incomplete.\n- Output a COMPLETE article in valid HTML only.\n- 600-800 words.\n- End with a final complete paragraph and CTA including href=\"/submit\".`;
      continue;
    }

    throw new Error(`Generated content failed validation: ${validation.reason}`);
  }

  throw new Error("Failed to generate blog content after retries");
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

    const approved = cityReports.filter((r: (typeof cityReports)[number]) => r.status === "approved");
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

// ─── Publish directly to DB via Prisma ───────────────────────────────────────

async function publishPost(post: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
}): Promise<void> {
  await prisma.blogPost.upsert({
    where: { slug: post.slug },
    update: {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      readTime: post.readTime,
      autoGenerated: true,
      publishedAt: new Date(),
    },
    create: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      readTime: post.readTime,
      autoGenerated: true,
    },
  });

  const siteUrl = process.env.SITE_URL ?? process.env.APP_URL ?? "https://termintacho.de";
  console.log(`✅ Published: /blog/${post.slug}`);
  console.log(`\n🎉 Done! View at: ${siteUrl}/blog/${post.slug}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🤖 TerminTacho Blog Auto-Generator\n");

  const missingEnv: string[] = [];
  if (!process.env.DATABASE_URL) missingEnv.push("DATABASE_URL");
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) missingEnv.push("GEMINI_API_KEY");
  if (missingEnv.length > 0) {
    throw new Error(`Missing required env var(s): ${missingEnv.join(", ")}`);
  }

  const now = new Date();
  const isManualDispatch = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
  const forceGeneration = process.env.FORCE_BLOG_GENERATION === "true";
  const enforceCadence = process.env.ENFORCE_BLOG_INTERVAL !== "false";
  if (!forceGeneration && !isManualDispatch && enforceCadence && !isScheduledRunDue(now)) {
    console.log(`⏭️ Not a scheduled ${BLOG_INTERVAL_DAYS}-day run date. Skipping generation.`);
    return;
  }

  // Pick topic based on current week number (rotates every run)
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

  if (!geminiKey) {
    throw new Error("Missing required env var: GEMINI_API_KEY");
  }

  // Call Google Gemini with retries and completeness checks.
  const content = await generateWithGemini(prompt, geminiKey);

  const excerpt = buildExcerpt(content);
  const readTime = estimateReadTime(content);

  console.log(`✍️  Generated ${content.length} chars, ~${readTime}`);

  // Publish directly to DB
  await publishPost({ slug, title, excerpt, content, category: topic.category, readTime });
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
