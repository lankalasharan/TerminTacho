/**
 * Comprehensive mapping of German city names to their coordinates
 * Includes common aliases and variations (e.g., with/without umlauts, full/short names)
 */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Major cities
  Berlin: { lat: 52.52, lng: 13.405 },
  Hamburg: { lat: 53.5511, lng: 9.9937 },
  Munich: { lat: 48.1351, lng: 11.582 },
  München: { lat: 48.1351, lng: 11.582 },
  Muenchen: { lat: 48.1351, lng: 11.582 },
  Cologne: { lat: 50.9375, lng: 6.9603 },
  Köln: { lat: 50.9375, lng: 6.9603 },
  Koeln: { lat: 50.9375, lng: 6.9603 },
  "Frankfurt am Main": { lat: 50.1109, lng: 8.6821 },
  Frankfurt: { lat: 50.1109, lng: 8.6821 },
  Stuttgart: { lat: 48.7758, lng: 9.1829 },
  Düsseldorf: { lat: 51.2277, lng: 6.7735 },
  Dusseldorf: { lat: 51.2277, lng: 6.7735 },
  Duesseldorf: { lat: 51.2277, lng: 6.7735 },
  Dortmund: { lat: 51.5136, lng: 7.4653 },
  Essen: { lat: 51.4556, lng: 7.0116 },
  Leipzig: { lat: 51.3397, lng: 12.3731 },
  Bremen: { lat: 53.0793, lng: 8.8017 },
  Dresden: { lat: 51.0504, lng: 13.7373 },
  Hanover: { lat: 52.3759, lng: 9.732 },
  Hannover: { lat: 52.3759, lng: 9.732 },
  Nuremberg: { lat: 49.4521, lng: 11.0767 },
  Nürnberg: { lat: 49.4521, lng: 11.0767 },
  Nuernberg: { lat: 49.4521, lng: 11.0767 },

  // Mid-size cities
  Duisburg: { lat: 51.4344, lng: 6.7623 },
  Bochum: { lat: 51.4818, lng: 7.2162 },
  Wuppertal: { lat: 51.2562, lng: 7.1508 },
  Bielefeld: { lat: 52.0302, lng: 8.532 },
  Bonn: { lat: 50.7374, lng: 7.0982 },
  Münster: { lat: 51.9607, lng: 7.6261 },
  Munster: { lat: 51.9607, lng: 7.6261 },
  Muenster: { lat: 51.9607, lng: 7.6261 },
  Karlsruhe: { lat: 49.0069, lng: 8.4037 },
  Mannheim: { lat: 49.4875, lng: 8.466 },
  Augsburg: { lat: 48.3705, lng: 10.8978 },
  Wiesbaden: { lat: 50.0826, lng: 8.24 },
  Chemnitz: { lat: 50.8278, lng: 12.9214 },
  
  // Cities with compound names
  "Offenbach am Main": { lat: 50.1006, lng: 8.7761 },
  Offenbach: { lat: 50.1006, lng: 8.7761 },
  "Halle (Saale)": { lat: 51.4825, lng: 11.9702 },
  Halle: { lat: 51.4825, lng: 11.9702 },
  "Freiburg im Breisgau": { lat: 47.9990, lng: 7.8421 },
  Freiburg: { lat: 47.9990, lng: 7.8421 },
  "Mülheim an der Ruhr": { lat: 51.4272, lng: 6.8825 },
  Mülheim: { lat: 51.4272, lng: 6.8825 },
  Mulheim: { lat: 51.4272, lng: 6.8825 },
  Muelheim: { lat: 51.4272, lng: 6.8825 },

  // Cities with umlauts
  Lübeck: { lat: 53.8655, lng: 10.6866 },
  Lubeck: { lat: 53.8655, lng: 10.6866 },
  Luebeck: { lat: 53.8655, lng: 10.6866 },
  Mönchengladbach: { lat: 51.1805, lng: 6.4428 },
  Monchengladbach: { lat: 51.1805, lng: 6.4428 },
  Moenchengladbach: { lat: 51.1805, lng: 6.4428 },
  Saarbrücken: { lat: 49.2401, lng: 6.9969 },
  Saarbrucken: { lat: 49.2401, lng: 6.9969 },
  Saarbruecken: { lat: 49.2401, lng: 6.9969 },
  Göttingen: { lat: 51.5412, lng: 9.9158 },
  Gottingen: { lat: 51.5412, lng: 9.9158 },
  Goettingen: { lat: 51.5412, lng: 9.9158 },
  Würzburg: { lat: 49.7913, lng: 9.9534 },
  Wurzburg: { lat: 49.7913, lng: 9.9534 },
  Wuerzburg: { lat: 49.7913, lng: 9.9534 },
  Osnabrück: { lat: 52.2799, lng: 8.0472 },
  Osnabruck: { lat: 52.2799, lng: 8.0472 },
  Osnabrueck: { lat: 52.2799, lng: 8.0472 },

  // Additional cities
  Aachen: { lat: 50.7753, lng: 6.0839 },
  Gelsenkirchen: { lat: 51.5177, lng: 7.0857 },
  Braunschweig: { lat: 52.2689, lng: 10.5268 },
  Kiel: { lat: 54.3233, lng: 10.1394 },
  Krefeld: { lat: 51.3388, lng: 6.5853 },
  Magdeburg: { lat: 52.1205, lng: 11.6276 },
  Erfurt: { lat: 50.9848, lng: 11.0299 },
  Oberhausen: { lat: 51.4963, lng: 6.8516 },
  Rostock: { lat: 54.0887, lng: 12.1403 },
  Mainz: { lat: 50.0012, lng: 8.2711 },
  Kassel: { lat: 51.3127, lng: 9.4797 },
  Hagen: { lat: 51.3671, lng: 7.4632 },
  Hamm: { lat: 51.6769, lng: 7.8189 },
  Potsdam: { lat: 52.3906, lng: 13.0645 },
  Ludwigshafen: { lat: 49.4810, lng: 8.4353 },
  Oldenburg: { lat: 53.1435, lng: 8.2146 },
  Leverkusen: { lat: 51.0459, lng: 6.9886 },
  Solingen: { lat: 51.1652, lng: 7.0670 },
  Heidelberg: { lat: 49.3988, lng: 8.6724 },
  Herne: { lat: 51.5386, lng: 7.2257 },
  Neuss: { lat: 51.2040, lng: 6.6895 },
  Darmstadt: { lat: 49.8728, lng: 8.6512 },
  Paderborn: { lat: 51.7189, lng: 8.7575 },
  Regensburg: { lat: 49.0134, lng: 12.1016 },
  Ingolstadt: { lat: 48.7665, lng: 11.4257 },
  Wolfsburg: { lat: 52.4227, lng: 10.7865 },
  Ulm: { lat: 48.4011, lng: 9.9876 },
  Heilbronn: { lat: 49.1427, lng: 9.2109 },
  Pforzheim: { lat: 48.8921, lng: 8.6945 },
  Reutlingen: { lat: 48.4914, lng: 9.2044 },
  Bottrop: { lat: 51.5244, lng: 6.9289 },
  Bremerhaven: { lat: 53.5396, lng: 8.5809 },
  Remscheid: { lat: 51.1790, lng: 7.1896 },
  Trier: { lat: 49.7490, lng: 6.6371 },
  Salzgitter: { lat: 52.1500, lng: 10.3333 },
  Jena: { lat: 50.9272, lng: 11.5860 },
  Fürth: { lat: 49.4778, lng: 10.9886 },
  Furth: { lat: 49.4778, lng: 10.9886 },
  Fuerth: { lat: 49.4778, lng: 10.9886 },
  Erlangen: { lat: 49.5897, lng: 11.0089 },
  Konstanz: { lat: 47.6633, lng: 9.1753 },
};

/**
 * Default coordinates (center of Germany) used when a city is not found
 */
export const DEFAULT_COORDINATES = { lat: 51.1657, lng: 10.4515 };

/**
 * Get coordinates for a city, with fallback to default
 */
export function getCityCoordinates(cityName: string): { lat: number; lng: number } {
  const coords = CITY_COORDINATES[cityName];
  
  if (!coords) {
    console.warn(`⚠️ No coordinates found for city: "${cityName}". Using default coordinates.`);
    return DEFAULT_COORDINATES;
  }
  
  return coords;
}
