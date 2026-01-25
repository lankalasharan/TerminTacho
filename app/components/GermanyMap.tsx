"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// German cities with Ausländerbehörde offices - Comprehensive list
const germanCities = [
  // Major cities (population > 500k)
  { name: "Berlin", lat: 52.52, lng: 13.405, reports: 245, avgDays: 89 },
  { name: "Hamburg", lat: 53.5511, lng: 9.9937, reports: 182, avgDays: 78 },
  { name: "Munich", lat: 48.1351, lng: 11.582, reports: 198, avgDays: 67 },
  { name: "Cologne", lat: 50.9375, lng: 6.9603, reports: 154, avgDays: 81 },
  { name: "Frankfurt am Main", lat: 50.1109, lng: 8.6821, reports: 176, avgDays: 72 },
  
  // Large cities (population 300k-500k)
  { name: "Stuttgart", lat: 48.7758, lng: 9.1829, reports: 143, avgDays: 69 },
  { name: "Düsseldorf", lat: 51.2277, lng: 6.7735, reports: 161, avgDays: 75 },
  { name: "Dortmund", lat: 51.5136, lng: 7.4653, reports: 98, avgDays: 84 },
  { name: "Essen", lat: 51.4556, lng: 7.0116, reports: 89, avgDays: 77 },
  { name: "Leipzig", lat: 51.3397, lng: 12.3731, reports: 112, avgDays: 71 },
  { name: "Bremen", lat: 53.0793, lng: 8.8017, reports: 101, avgDays: 79 },
  { name: "Dresden", lat: 51.0504, lng: 13.7373, reports: 97, avgDays: 73 },
  { name: "Hanover", lat: 52.3759, lng: 9.732, reports: 106, avgDays: 76 },
  { name: "Nuremberg", lat: 49.4521, lng: 11.0767, reports: 94, avgDays: 70 },
  
  // Medium cities (population 150k-300k)
  { name: "Duisburg", lat: 51.4344, lng: 6.7623, reports: 72, avgDays: 82 },
  { name: "Bochum", lat: 51.4818, lng: 7.2162, reports: 65, avgDays: 80 },
  { name: "Wuppertal", lat: 51.2562, lng: 7.1508, reports: 58, avgDays: 85 },
  { name: "Bielefeld", lat: 52.0302, lng: 8.532, reports: 71, avgDays: 74 },
  { name: "Bonn", lat: 50.7374, lng: 7.0982, reports: 89, avgDays: 68 },
  { name: "Münster", lat: 51.9607, lng: 7.6261, reports: 75, avgDays: 73 },
  { name: "Karlsruhe", lat: 49.0069, lng: 8.4037, reports: 73, avgDays: 71 },
  { name: "Mannheim", lat: 49.4875, lng: 8.4660, reports: 67, avgDays: 72 },
  { name: "Augsburg", lat: 48.3705, lng: 10.8978, reports: 64, avgDays: 69 },
  { name: "Wiesbaden", lat: 50.0826, lng: 8.2400, reports: 68, avgDays: 76 },
  { name: "Mönchengladbach", lat: 51.1805, lng: 6.4428, reports: 56, avgDays: 83 },
  { name: "Gelsenkirchen", lat: 51.5177, lng: 7.0857, reports: 45, avgDays: 81 },
  { name: "Braunschweig", lat: 52.2689, lng: 10.5268, reports: 59, avgDays: 75 },
  { name: "Aachen", lat: 50.7753, lng: 6.0839, reports: 61, avgDays: 78 },
  { name: "Chemnitz", lat: 50.8278, lng: 12.9214, reports: 53, avgDays: 77 },
  { name: "Kiel", lat: 54.3233, lng: 10.1394, reports: 50, avgDays: 79 },
  { name: "Halle (Saale)", lat: 51.4969, lng: 11.9688, reports: 47, avgDays: 74 },
  { name: "Magdeburg", lat: 52.1205, lng: 11.6276, reports: 52, avgDays: 76 },
  { name: "Freiburg im Breisgau", lat: 47.9990, lng: 7.8421, reports: 66, avgDays: 68 },
  { name: "Krefeld", lat: 51.3388, lng: 6.5853, reports: 44, avgDays: 80 },
  { name: "Mainz", lat: 49.9929, lng: 8.2473, reports: 55, avgDays: 70 },
  { name: "Lübeck", lat: 53.8655, lng: 10.6866, reports: 48, avgDays: 77 },
  { name: "Erfurt", lat: 50.9848, lng: 11.0299, reports: 51, avgDays: 75 },
  { name: "Oberhausen", lat: 51.4963, lng: 6.8515, reports: 43, avgDays: 82 },
  { name: "Rostock", lat: 54.0924, lng: 12.0991, reports: 49, avgDays: 78 },
  
  // Smaller cities (population 100k-150k)
  { name: "Kassel", lat: 51.3127, lng: 9.4797, reports: 53, avgDays: 73 },
  { name: "Hagen", lat: 51.3671, lng: 7.4632, reports: 42, avgDays: 84 },
  { name: "Saarbrücken", lat: 49.2401, lng: 6.9969, reports: 50, avgDays: 76 },
  { name: "Hamm", lat: 51.6806, lng: 7.8142, reports: 41, avgDays: 81 },
  { name: "Mülheim an der Ruhr", lat: 51.4270, lng: 6.8831, reports: 40, avgDays: 83 },
  { name: "Potsdam", lat: 52.3906, lng: 13.0645, reports: 69, avgDays: 72 },
  { name: "Ludwigshafen", lat: 49.4774, lng: 8.4452, reports: 46, avgDays: 74 },
  { name: "Oldenburg", lat: 53.1435, lng: 8.2146, reports: 48, avgDays: 77 },
  { name: "Leverkusen", lat: 51.0458, lng: 6.9886, reports: 45, avgDays: 79 },
  { name: "Osnabrück", lat: 52.2799, lng: 8.0472, reports: 47, avgDays: 75 },
  { name: "Solingen", lat: 51.1652, lng: 7.0670, reports: 43, avgDays: 80 },
  { name: "Heidelberg", lat: 49.3988, lng: 8.6724, reports: 57, avgDays: 69 },
  { name: "Herne", lat: 51.5383, lng: 7.2256, reports: 38, avgDays: 82 },
  { name: "Neuss", lat: 51.2042, lng: 6.6853, reports: 44, avgDays: 78 },
  { name: "Darmstadt", lat: 49.8728, lng: 8.6512, reports: 52, avgDays: 71 },
  { name: "Paderborn", lat: 51.7189, lng: 8.7575, reports: 42, avgDays: 76 },
  { name: "Regensburg", lat: 49.0134, lng: 12.1016, reports: 48, avgDays: 70 },
  { name: "Ingolstadt", lat: 48.7665, lng: 11.4257, reports: 45, avgDays: 72 },
  { name: "Würzburg", lat: 49.7913, lng: 9.9534, reports: 43, avgDays: 73 },
  { name: "Wolfsburg", lat: 52.4227, lng: 10.7865, reports: 41, avgDays: 75 },
  { name: "Ulm", lat: 48.4011, lng: 9.9876, reports: 44, avgDays: 71 },
  { name: "Göttingen", lat: 51.5415, lng: 9.9158, reports: 40, avgDays: 74 },
  { name: "Heilbronn", lat: 49.1427, lng: 9.2109, reports: 42, avgDays: 72 },
  { name: "Pforzheim", lat: 48.8921, lng: 8.6945, reports: 38, avgDays: 75 },
  { name: "Reutlingen", lat: 48.4914, lng: 9.2044, reports: 39, avgDays: 73 },
  { name: "Bottrop", lat: 51.5244, lng: 6.9285, reports: 36, avgDays: 81 },
  { name: "Offenbach am Main", lat: 50.1009, lng: 8.7667, reports: 43, avgDays: 74 },
  { name: "Bremerhaven", lat: 53.5396, lng: 8.5809, reports: 37, avgDays: 78 },
  { name: "Remscheid", lat: 51.1796, lng: 7.1895, reports: 35, avgDays: 80 },
  { name: "Trier", lat: 49.7490, lng: 6.6371, reports: 41, avgDays: 76 },
  { name: "Salzgitter", lat: 52.1506, lng: 10.3470, reports: 34, avgDays: 79 },
  { name: "Jena", lat: 50.9272, lng: 11.5892, reports: 42, avgDays: 72 },
  { name: "Fürth", lat: 49.4778, lng: 10.9889, reports: 38, avgDays: 71 },
  { name: "Erlangen", lat: 49.5897, lng: 11.0089, reports: 44, avgDays: 70 },
  { name: "Konstanz", lat: 47.6633, lng: 9.1753, reports: 39, avgDays: 73 },
];

export default function GermanyMap() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Fix Leaflet default marker icon issue with Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  if (!isMounted) {
    return (
      <div style={{
        height: "600px",
        background: "#f3f4f6",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        color: "#6b7280"
      }}>
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 0 }}>
      <MapContainer
        center={[51.1657, 10.4515]} // Center of Germany
        zoom={6}
        style={{ height: "600px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {germanCities.map((city) => (
          <Marker key={city.name} position={[city.lat, city.lng]}>
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: "700", 
                  marginBottom: "8px",
                  color: "#1f2937"
                }}>
                  {city.name}
                </h3>
                <div style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.6" }}>
                  <div style={{ marginBottom: "4px" }}>
                    📊 <strong>{city.reports}</strong> reports submitted
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    ⏱️ Avg. wait: <strong>{city.avgDays} days</strong>
                  </div>
                  <a 
                    href="/timelines" 
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "6px 12px",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  >
                    View Details →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
