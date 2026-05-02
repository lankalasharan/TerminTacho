export function normalizeProcessLabel(label: string): string {
  return label
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function foldForMatching(value: string): string {
  return normalizeProcessLabel(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(initial|first|new)\b/g, " ")
    .replace(/\bapplication\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PROCESS_CANONICAL_ALIASES: Array<[RegExp, string]> = [
  [/\bniederlassungserlaubnis\b|\bsettlement permit\b|\bpermanent residence( permit)?\b/, "settlement permit"],
  [/\beu\s*blue\s*card\b|\bblue\s*card\b/, "eu blue card"],
  [/\blanguage\s*course\s*visa\b/, "language course visa"],
  [/\bwork\s*permit\b/, "work permit"],
];

export function getCanonicalProcessKey(label: string): string {
  const folded = foldForMatching(label);
  if (!folded) return "";

  for (const [pattern, canonical] of PROCESS_CANONICAL_ALIASES) {
    if (pattern.test(folded)) return canonical;
  }

  return folded;
}
