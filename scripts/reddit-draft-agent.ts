import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface RedditSearchListing {
  data?: {
    children?: Array<{
      data?: {
        id?: string;
        title?: string;
        selftext?: string;
        subreddit?: string;
        author?: string;
        score?: number;
        num_comments?: number;
        created_utc?: number;
        permalink?: string;
      };
    }>;
  };
}

type Priority = "high" | "medium";

interface CandidateDraft {
  id: string;
  source: "reddit";
  subreddit: string;
  title: string;
  snippet: string;
  permalink: string;
  createdUtc: string;
  author: string;
  score: number;
  numComments: number;
  matchedQuery: string;
  priority: Priority;
  relevanceScore: number;
  reasons: string[];
  suggestedLink: string;
  suggestedReply: string;
}

interface OutputPayload {
  generatedAt: string;
  siteUrl: string;
  totalCandidates: number;
  notes: string[];
  candidates: CandidateDraft[];
}

const DEFAULT_SUBREDDITS = [
  "germany",
  "berlin",
  "expats",
  "iwantout",
  "AskAGerman",
];

const DEFAULT_QUERIES = [
  "auslanderbehorde timeline",
  "blue card processing time germany",
  "residence permit waiting time germany",
  "visa approval germany timeline",
  "appointment auslanderbehorde wait",
];

const QUESTION_KEYWORDS = [
  "how long",
  "any idea",
  "timeline",
  "processing time",
  "waiting",
  "appointment",
  "still waiting",
  "status update",
];

const TIMELINE_KEYWORDS = [
  "approved",
  "decision",
  "appointment",
  "submitted",
  "application",
  "blue card",
  "residence permit",
  "visa",
  "auslanderbehorde",
  "auslaenderbehoerde",
  "aufenthalt",
];

const GERMAN_CITY_WORDS = [
  "berlin",
  "munich",
  "muenchen",
  "hamburg",
  "frankfurt",
  "cologne",
  "koln",
  "stuttgart",
  "dusseldorf",
  "dortmund",
  "leipzig",
  "bremen",
  "hanover",
  "hannover",
  "nuremberg",
  "nuernberg",
];

const DURATION_PATTERN = /\b\d+\s*(day|days|week|weeks|month|months)\b/i;

function parseList(input: string | undefined, fallback: string[]): string[] {
  if (!input) return fallback;
  const values = input
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return values.length > 0 ? values : fallback;
}

function getEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sanitizeSnippet(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 240);
}

function computeRelevance(title: string, body: string): { score: number; reasons: string[] } {
  const full = `${title} ${body}`.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  if (TIMELINE_KEYWORDS.some((k) => full.includes(k))) {
    score += 3;
    reasons.push("Contains visa/timeline intent keywords");
  }

  if (QUESTION_KEYWORDS.some((k) => full.includes(k)) || full.includes("?")) {
    score += 2;
    reasons.push("Looks like a question or status request");
  }

  if (DURATION_PATTERN.test(full)) {
    score += 2;
    reasons.push("Contains concrete duration signal");
  }

  if (GERMAN_CITY_WORDS.some((city) => full.includes(city))) {
    score += 1;
    reasons.push("Mentions likely German city context");
  }

  return { score, reasons };
}

function buildSuggestedReply(options: {
  title: string;
  body: string;
  siteUrl: string;
}): { suggestedReply: string; suggestedLink: string } {
  const full = `${options.title} ${options.body}`.toLowerCase();
  const looksLikeSuccess = /\b(approved|got it|granted|received|finally)\b/i.test(full);

  if (looksLikeSuccess) {
    const suggestedLink = `${options.siteUrl}/submit`;
    const suggestedReply = [
      "Congrats and thanks for sharing your update :) ",
      "If you are open to it, adding your anonymized timeline can help others waiting in similar situations.",
      ` ${suggestedLink}`,
    ].join("");
    return { suggestedReply, suggestedLink };
  }

  const suggestedLink = `${options.siteUrl}/timelines`;
  const suggestedReply = [
    "Hope this helps a bit while you wait :) ",
    "You can check crowd-reported Germany timeline trends by city and visa type here:",
    ` ${suggestedLink}`,
  ].join("");

  return { suggestedReply, suggestedLink };
}

function toPriority(score: number): Priority | null {
  if (score >= 6) return "high";
  if (score >= 4) return "medium";
  return null;
}

async function fetchRedditResults(subreddit: string, query: string, limit: number): Promise<CandidateDraft[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodedQuery}&restrict_sr=1&sort=new&t=month&limit=${limit}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "TermintachoSocialResearchAgent/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit request failed (${response.status}) for r/${subreddit} query "${query}"`);
  }

  const json = (await response.json()) as RedditSearchListing;
  const children = json.data?.children ?? [];

  const candidates: CandidateDraft[] = [];

  for (const child of children) {
    const data = child.data;
    if (!data?.id || !data.title || !data.permalink) {
      continue;
    }

    const selfText = data.selftext ?? "";
    const relevance = computeRelevance(data.title, selfText);
    const priority = toPriority(relevance.score);

    if (!priority) {
      continue;
    }

    const siteUrl = process.env.SITE_URL ?? "https://termintacho.de";
    const suggestion = buildSuggestedReply({
      title: data.title,
      body: selfText,
      siteUrl,
    });

    candidates.push({
      id: data.id,
      source: "reddit",
      subreddit: data.subreddit ?? subreddit,
      title: data.title,
      snippet: sanitizeSnippet(selfText || data.title),
      permalink: `https://www.reddit.com${data.permalink}`,
      createdUtc: new Date((data.created_utc ?? 0) * 1000).toISOString(),
      author: data.author ?? "unknown",
      score: data.score ?? 0,
      numComments: data.num_comments ?? 0,
      matchedQuery: query,
      priority,
      relevanceScore: relevance.score,
      reasons: relevance.reasons,
      suggestedLink: suggestion.suggestedLink,
      suggestedReply: suggestion.suggestedReply,
    });
  }

  return candidates;
}

function dedupeCandidates(items: CandidateDraft[]): CandidateDraft[] {
  const seen = new Set<string>();
  const deduped: CandidateDraft[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  return deduped.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
    return b.score - a.score;
  });
}

async function main() {
  const subreddits = parseList(process.env.REDDIT_SUBREDDITS, DEFAULT_SUBREDDITS);
  const queries = parseList(process.env.REDDIT_QUERIES, DEFAULT_QUERIES);
  const limitPerQuery = getEnvNumber("REDDIT_LIMIT_PER_QUERY", 10);
  const siteUrl = process.env.SITE_URL ?? "https://termintacho.de";

  console.log("[social-agent] Collecting Reddit candidates for manual review...");
  console.log(`[social-agent] Subreddits: ${subreddits.join(", ")}`);
  console.log(`[social-agent] Queries: ${queries.join(" | ")}`);

  const collected: CandidateDraft[] = [];
  const failures: string[] = [];

  for (const subreddit of subreddits) {
    for (const query of queries) {
      try {
        const result = await fetchRedditResults(subreddit, query, limitPerQuery);
        collected.push(...result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        failures.push(msg);
      }
    }
  }

  const candidates = dedupeCandidates(collected).slice(0, getEnvNumber("SOCIAL_MAX_DRAFTS", 80));

  const output: OutputPayload = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    totalCandidates: candidates.length,
    notes: [
      "Approval-only workflow: this script never posts to Reddit or Facebook.",
      "Review each draft for relevance and subreddit rules before posting.",
      "Use Facebook Graph API with proper permissions for Facebook data ingestion.",
      ...(failures.length > 0 ? [`Some queries failed: ${failures.join(" ; ")}`] : []),
    ],
    candidates,
  };

  const outputDir = path.join(process.cwd(), "reports", "social");
  await mkdir(outputDir, { recursive: true });

  const dateSuffix = new Date().toISOString().slice(0, 10);
  const latestFile = path.join(outputDir, "reddit-drafts.latest.json");
  const datedFile = path.join(outputDir, `reddit-drafts.${dateSuffix}.json`);

  const serialized = `${JSON.stringify(output, null, 2)}\n`;
  await writeFile(latestFile, serialized, "utf8");
  await writeFile(datedFile, serialized, "utf8");

  console.log(`[social-agent] Saved ${candidates.length} candidates:`);
  console.log(`[social-agent] - ${latestFile}`);
  console.log(`[social-agent] - ${datedFile}`);

  if (failures.length > 0) {
    console.log(`[social-agent] Completed with ${failures.length} fetch warnings.`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[social-agent] Failed: ${message}`);
  process.exit(1);
});
