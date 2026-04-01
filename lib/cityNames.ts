const DUSSELDORF_CANONICAL = "Düsseldorf";
const DUSSELDORF_REGEX = /^d[\?u\u00fc]sseldorf$/i;

const FRANKFURT_CANONICAL = "Frankfurt am Main";
const FRANKFURT_REGEX = /^frankfurt( am main)?$/i;

const MUNSTER_CANONICAL = "Münster";
const MUNSTER_REGEX = /^m[\?u\u00fc]nster$/i;

const OFFENBACH_CANONICAL = "Offenbach am Main";
const OFFENBACH_REGEX = /^offenbach( am main)?$/i;

const FREIBURG_CANONICAL = "Freiburg im Breisgau";
const FREIBURG_REGEX = /^freiburg( im breisgau)?$/i;

const MULHEIM_CANONICAL = "Mülheim an der Ruhr";
const MULHEIM_REGEX = /^m[\?u\u00fc]lheim( an der ruhr)?$/i;

const HALLE_CANONICAL = "Halle (Saale)";
const HALLE_REGEX = /^halle( \(saale\))?$/i;

export function normalizeCityName(city: string): string {
  const trimmed = city.trim();
  
  // Düsseldorf variations
  if (DUSSELDORF_REGEX.test(trimmed)) return DUSSELDORF_CANONICAL;
  
  // Frankfurt variations
  if (FRANKFURT_REGEX.test(trimmed)) return FRANKFURT_CANONICAL;
  
  // Münster variations
  if (MUNSTER_REGEX.test(trimmed)) return MUNSTER_CANONICAL;
  
  // Offenbach variations
  if (OFFENBACH_REGEX.test(trimmed)) return OFFENBACH_CANONICAL;
  
  // Freiburg variations
  if (FREIBURG_REGEX.test(trimmed)) return FREIBURG_CANONICAL;
  
  // Mülheim variations
  if (MULHEIM_REGEX.test(trimmed)) return MULHEIM_CANONICAL;
  
  // Halle variations
  if (HALLE_REGEX.test(trimmed)) return HALLE_CANONICAL;
  
  return trimmed;
}

export function getCityAliases(city: string): string[] {
  const aliases = new Set<string>();
  const trimmed = city.trim();
  if (trimmed) aliases.add(trimmed);

  const normalized = normalizeCityName(trimmed);
  if (normalized) aliases.add(normalized);

  if (normalized === DUSSELDORF_CANONICAL) {
    aliases.add("Dusseldorf");
    aliases.add("D?sseldorf");
    aliases.add("Düsseldorf");
    aliases.add("Duesseldorf");
  }

  if (normalized === FRANKFURT_CANONICAL) {
    aliases.add("Frankfurt");
    aliases.add("Frankfurt am Main");
  }

  if (normalized === MUNSTER_CANONICAL) {
    aliases.add("Munster");
    aliases.add("M?nster");
    aliases.add("Münster");
    aliases.add("Muenster");
  }

  if (normalized === OFFENBACH_CANONICAL) {
    aliases.add("Offenbach");
    aliases.add("Offenbach am Main");
  }

  if (normalized === FREIBURG_CANONICAL) {
    aliases.add("Freiburg");
    aliases.add("Freiburg im Breisgau");
  }

  if (normalized === MULHEIM_CANONICAL) {
    aliases.add("Mülheim");
    aliases.add("Mulheim");
    aliases.add("Muelheim");
    aliases.add("Mülheim an der Ruhr");
    aliases.add("Mulheim an der Ruhr");
  }

  if (normalized === HALLE_CANONICAL) {
    aliases.add("Halle");
    aliases.add("Halle (Saale)");
  }

  return Array.from(aliases);
}
