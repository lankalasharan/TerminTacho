import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";

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

interface DraftPayload {
  generatedAt: string;
  siteUrl: string;
  totalCandidates: number;
  notes: string[];
  candidates: CandidateDraft[];
}

const DEFAULT_DIGEST_EMAIL = "termintacho@gmail.com";
const DEFAULT_DIGEST_TIMEZONE = "Europe/Berlin";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || DEFAULT_DIGEST_EMAIL;
}

function getDigestWindowHours(): number {
  const raw = process.env.SOCIAL_DIGEST_WINDOW_HOURS;
  if (!raw) return 24;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 24;
}

function hasFetchWarnings(notes: string[]): boolean {
  return notes.some((note) => /some queries failed/i.test(note));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: process.env.SOCIAL_DIGEST_TIMEZONE || DEFAULT_DIGEST_TIMEZONE,
  });
}

function sortCandidates(items: CandidateDraft[]): CandidateDraft[] {
  return [...items].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === "high" ? -1 : 1;
    if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
    return b.score - a.score;
  });
}

function toHtmlRows(candidates: CandidateDraft[]): string {
  return candidates
    .map((candidate) => {
      const reasons = candidate.reasons.map(escapeHtml).join("; ");
      const title = escapeHtml(candidate.title);
      const snippet = escapeHtml(candidate.snippet);
      const suggestion = escapeHtml(candidate.suggestedReply);
      const suggestedLink = escapeHtml(candidate.suggestedLink);
      const createdAt = escapeHtml(formatDate(candidate.createdUtc));

      return `
      <tr>
        <td style="padding:14px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">
            r/${escapeHtml(candidate.subreddit)} | ${escapeHtml(candidate.priority.toUpperCase())} | ${createdAt}
          </div>
          <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:6px;">
            ${title}
          </div>
          <div style="font-size:13px;color:#374151;line-height:1.5;margin-bottom:8px;">
            ${snippet}
          </div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">
            Relevance ${candidate.relevanceScore} | Reddit score ${candidate.score} | Comments ${candidate.numComments}
          </div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:10px;">${reasons}</div>
          <div style="font-size:13px;color:#111827;line-height:1.5;background:#f9fafb;padding:10px;border-radius:8px;margin-bottom:10px;">
            Suggested reply: ${suggestion}
          </div>
          <div>
            <a href="${escapeHtml(candidate.permalink)}" style="color:#0f766e;text-decoration:none;font-weight:700;margin-right:14px;">Open Reddit post</a>
            <a href="${suggestedLink}" style="color:#0f766e;text-decoration:none;font-weight:700;">Open suggested link</a>
          </div>
        </td>
      </tr>`;
    })
    .join("\n");
}

function toTextBody(params: {
  siteUrl: string;
  windowHours: number;
  candidates: CandidateDraft[];
}): string {
  const lines: string[] = [];

  lines.push(`TerminTacho social digest (last ${params.windowHours}h)`);
  lines.push("");

  params.candidates.forEach((candidate, index) => {
    lines.push(`${index + 1}. [${candidate.priority.toUpperCase()}] r/${candidate.subreddit}`);
    lines.push(`Title: ${candidate.title}`);
    lines.push(`Post: ${candidate.permalink}`);
    lines.push(`Time: ${formatDate(candidate.createdUtc)}`);
    lines.push(`Suggested link: ${candidate.suggestedLink}`);
    lines.push(`Suggested reply: ${candidate.suggestedReply}`);
    lines.push(`Signals: ${candidate.reasons.join("; ")}`);
    lines.push("");
  });

  if (params.candidates.length === 0) {
    lines.push("No matching posts in this window.");
  }

  lines.push(`Site: ${params.siteUrl}`);
  return lines.join("\n");
}

async function main() {
  const resendApiKey = getRequiredEnv("RESEND_API_KEY");
  const recipient = process.env.SOCIAL_DIGEST_TO || DEFAULT_DIGEST_EMAIL;
  const resend = new Resend(resendApiKey);

  const reportPath = path.join(process.cwd(), "reports", "social", "reddit-drafts.latest.json");
  const raw = await readFile(reportPath, "utf8");
  const parsed = JSON.parse(raw) as DraftPayload;
  const hadFetchWarnings = hasFetchWarnings(parsed.notes ?? []);

  const windowHours = getDigestWindowHours();
  const now = Date.now();
  const minTimestamp = now - windowHours * 60 * 60 * 1000;

  const recent = parsed.candidates.filter((candidate) => {
    const timestamp = new Date(candidate.createdUtc).getTime();
    return Number.isFinite(timestamp) && timestamp >= minTimestamp;
  });

  const sorted = sortCandidates(recent);
  const sortedAll = sortCandidates(parsed.candidates ?? []);
  const maxItems = Number(process.env.SOCIAL_DIGEST_MAX_ITEMS || 40);
  const safeMaxItems = Number.isFinite(maxItems) && maxItems > 0 ? maxItems : 40;

  let selected = sorted.slice(0, safeMaxItems);
  let usedFallback = false;

  // Fallback to freshest known candidates when 24h window is empty.
  if (selected.length === 0 && sortedAll.length > 0) {
    selected = sortedAll.slice(0, safeMaxItems);
    usedFallback = true;
  }

  // If scraper reported fetch failures and no drafts were produced at all,
  // fail loudly so schedules surface the upstream data problem.
  if (selected.length === 0 && hadFetchWarnings) {
    throw new Error(
      "No candidates available and scraper reported fetch warnings. Check reddit-drafts.latest.json notes for upstream Reddit errors.",
    );
  }

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    dateStyle: "medium",
    timeZone: process.env.SOCIAL_DIGEST_TIMEZONE || DEFAULT_DIGEST_TIMEZONE,
  });
  const subject = `TerminTacho social digest ${dateLabel} (${selected.length} posts)`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="760" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:18px 20px;background:#0f766e;color:#ffffff;">
              <div style="font-size:22px;font-weight:800;">TerminTacho Social Digest</div>
              <div style="font-size:13px;opacity:0.9;margin-top:4px;">Manual review only. Last ${windowHours} hours.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">
              Found <strong>${selected.length}</strong> review candidates.
              ${selected.length === 0 ? "No relevant posts in this window." : "Open post links, copy the draft response, and post manually."}
              ${usedFallback ? "Showing freshest available candidates because no posts matched the configured time window." : ""}
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${toHtmlRows(selected)}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = toTextBody({
    siteUrl: parsed.siteUrl,
    windowHours,
    candidates: selected,
  });

  await resend.emails.send({
    from: getFromAddress(),
    to: recipient,
    subject,
    html,
    text,
  });

  if (usedFallback) {
    console.warn(
      `[social-digest] No posts found in last ${windowHours}h. Sent freshest available ${selected.length} items instead.`,
    );
  }

  console.log(`[social-digest] Sent to ${recipient} with ${selected.length} items.`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[social-digest] Failed: ${message}`);
  process.exit(1);
});
