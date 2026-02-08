/**
 * Text similarity detection to prevent copy-paste spam
 * Uses Levenshtein distance and cosine similarity
 */

/**
 * Calculate Levenshtein distance between two strings
 * Lower score = more similar
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between 0 and 1
 * 1 = identical, 0 = completely different
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

/**
 * Check if text is suspiciously similar to existing reviews
 */
export async function checkTextSimilarity(
  newText: string,
  existingTexts: string[],
  threshold: number = 0.85
): Promise<{
  isSimilar: boolean;
  similarity: number;
  mostSimilarText?: string;
}> {
  if (existingTexts.length === 0) {
    return { isSimilar: false, similarity: 0 };
  }

  const normalizedNew = normalizeText(newText);
  let maxSimilarity = 0;
  let mostSimilarText = "";

  for (const existingText of existingTexts) {
    const normalizedExisting = normalizeText(existingText);
    const similarity = calculateSimilarity(normalizedNew, normalizedExisting);

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilarText = existingText;
    }

    if (similarity >= threshold) {
      return {
        isSimilar: true,
        similarity,
        mostSimilarText,
      };
    }
  }

  return {
    isSimilar: maxSimilarity >= threshold,
    similarity: maxSimilarity,
    mostSimilarText: maxSimilarity > 0.7 ? mostSimilarText : undefined,
  };
}

/**
 * Normalize text for comparison
 * Remove extra spaces, convert to lowercase
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, ""); // Remove special chars
}

/**
 * Extract keywords from text (simple implementation)
 */
export function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3); // Only words > 3 chars

  // Remove common words
  const stopwords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "from",
    "have",
    "this",
    "been",
    "were",
    "very",
    "good",
    "bad",
    "office",
    "staff",
    "time",
  ]);

  return new Set(words.filter((w) => !stopwords.has(w)));
}

/**
 * Detect suspicious patterns in text
 */
export function detectSpamPatterns(text: string): {
  isSpam: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for repeated characters (spammmm)
  if (/(.)\1{4,}/.test(text)) {
    reasons.push("Repeated characters detected");
  }

  // Check for excessive URLs
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 2) {
    reasons.push(`Too many URLs (${urlCount})`);
  }

  // Check for all caps (but allow abbreviations)
  const capsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
  if (capsWords.length > 5) {
    reasons.push("Too many all-caps words");
  }

  // Check for excessive punctuation
  const punctuation = (text.match(/[!?]{2,}/g) || []).length;
  if (punctuation > 3) {
    reasons.push("Excessive punctuation");
  }

  // Check for gibberish (very high entropy, low vowel count)
  const vowels = (text.match(/[aeiou]/gi) || []).length;
  const vowelRatio = vowels / text.length;
  if (vowelRatio < 0.15 && text.length > 50) {
    reasons.push("Suspicious pattern detected (low vowel ratio)");
  }

  return {
    isSpam: reasons.length > 0,
    reasons,
  };
}
