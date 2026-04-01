export interface CityStat {
  city: string;
  avgDays: number;
  reports: number;
  confidence: "low" | "medium" | "high";
  lat: number;
  lng: number;
}

export function getColor(avgDays: number, reports: number): string {
  if (reports === 0 || avgDays <= 0) return "#9CA3AF"; // grey
  if (avgDays < 25) return "#10B981"; // green
  if (avgDays <= 40) return "#F59E0B"; // yellow
  return "#EF4444"; // red
}

export function getRadius(reports: number): number {
  if (reports === 0) return 6;
  if (reports < 5) return 8;
  if (reports < 10) return 10;
  if (reports < 20) return 13;
  return 18;
}

export function computeNationalAverageWeighted(stats: CityStat[]): number {
  if (stats.length === 0) return 0;

  const valid = stats.filter((city) => city.reports > 0 && city.avgDays > 0);
  if (valid.length === 0) return 0;

  const totalWeightedDays = valid.reduce(
    (sum, city) => sum + city.avgDays * city.reports,
    0
  );
  const totalReports = valid.reduce((sum, city) => sum + city.reports, 0);

  if (totalReports === 0) return 0;
  return Math.round(totalWeightedDays / totalReports);
}

export function getFastestCity(stats: CityStat[]): CityStat | null {
  if (stats.length === 0) return null;
  const validCities = stats.filter((s) => s.reports > 0 && s.avgDays > 0);
  if (validCities.length === 0) return null;
  return validCities.reduce((min, city) =>
    city.avgDays < min.avgDays ? city : min
  );
}

export function getSlowestCity(stats: CityStat[]): CityStat | null {
  if (stats.length === 0) return null;
  const validCities = stats.filter((s) => s.reports > 0 && s.avgDays > 0);
  if (validCities.length === 0) return null;
  return validCities.reduce((max, city) =>
    city.avgDays > max.avgDays ? city : max
  );
}

export const MOCK_CITY_STATS: CityStat[] = [
  { city: "Berlin", avgDays: 32, reports: 45, confidence: "high", lat: 52.52, lng: 13.405 },
  { city: "Munich", avgDays: 28, reports: 38, confidence: "high", lat: 48.1351, lng: 11.582 },
  { city: "Hamburg", avgDays: 35, reports: 29, confidence: "high", lat: 53.5511, lng: 9.9937 },
  { city: "Cologne", avgDays: 42, reports: 22, confidence: "high", lat: 50.9375, lng: 6.9603 },
  { city: "Frankfurt am Main", avgDays: 31, reports: 18, confidence: "high", lat: 50.1109, lng: 8.6821 },
  { city: "Stuttgart", avgDays: 38, reports: 15, confidence: "high", lat: 48.7758, lng: 9.1829 },
  { city: "Düsseldorf", avgDays: 29, reports: 12, confidence: "high", lat: 51.2277, lng: 6.7735 },
  { city: "Leipzig", avgDays: 26, reports: 8, confidence: "medium", lat: 51.3397, lng: 12.3731 },
  { city: "Dresden", avgDays: 45, reports: 6, confidence: "medium", lat: 51.0504, lng: 13.7373 },
  { city: "Nuremberg", avgDays: 33, reports: 4, confidence: "medium", lat: 49.4521, lng: 11.0767 },
];
