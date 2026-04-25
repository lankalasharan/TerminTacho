"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { CityStat, getColor, getRadius } from "@/lib/insightsUtils";
import "leaflet/dist/leaflet.css";

interface GermanyHeatMapProps {
  stats: CityStat[];
  selectedCity: string | null;
  onCitySelect: (city: string) => void;
}

export default function GermanyHeatMap({
  stats,
  selectedCity,
  onCitySelect,
}: GermanyHeatMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Fix Leaflet default marker icon issue with Next.js
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <style>{`
        .heatmap-container {
          height: 500px;
          border-radius: 12px;
        }
        @media (max-width: 768px) {
          .heatmap-container {
            height: 320px;
          }
          .heatmap-legend {
            padding: 8px !important;
            bottom: 8px !important;
            right: 8px !important;
          }
          .heatmap-legend-title {
            font-size: 10px !important;
            margin-bottom: 4px !important;
          }
          .heatmap-legend-item {
            gap: 4px !important;
          }
          .heatmap-legend-dot {
            width: 10px !important;
            height: 10px !important;
          }
          .heatmap-legend-label {
            font-size: 10px !important;
          }
          .heatmap-legend-footer {
            display: none !important;
          }
        }
      `}</style>
      <MapContainer
        center={[51.3, 10.4515]}
        zoom={5}
        style={{ borderRadius: "12px" }}
        className="z-0 heatmap-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stats.map((city) => {
          const isSelected = selectedCity === city.city;
          return (
            <CircleMarker
              key={city.city}
              center={[city.lat, city.lng]}
              radius={isSelected ? getRadius(city.reports) + 3 : getRadius(city.reports)}
              fillColor={getColor(city.avgDays, city.reports)}
              color={isSelected ? "#1F2937" : "#ffffff"}
              weight={isSelected ? 3 : 2}
              opacity={1}
              fillOpacity={0.7}
              eventHandlers={{
                click: () => onCitySelect(city.city),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="text-sm">
                  <div className="font-bold text-gray-900">{city.city}</div>
                  <div className="text-gray-700">
                    Avg: <strong>{city.avgDays > 0 ? `${city.avgDays} days` : "—"}</strong>
                  </div>
                  <div className="text-gray-600">
                    Reports: {city.reports}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        city.confidence === "high"
                          ? "bg-green-100 text-green-800"
                          : city.confidence === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {city.confidence.toUpperCase()}
                    </span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="heatmap-legend absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg shadow-lg z-[1000]" style={{ padding: "12px" }}>
        <div className="heatmap-legend-title text-xs font-bold text-gray-900 mb-2">
          Processing Speed
        </div>
        <div className="space-y-1.5">
          <div className="heatmap-legend-item flex items-center gap-2">
            <div className="heatmap-legend-dot w-4 h-4 rounded-full bg-[#10B981]"></div>
            <span className="heatmap-legend-label text-xs text-gray-700">Fast (&lt;25 days)</span>
          </div>
          <div className="heatmap-legend-item flex items-center gap-2">
            <div className="heatmap-legend-dot w-4 h-4 rounded-full bg-[#F59E0B]"></div>
            <span className="heatmap-legend-label text-xs text-gray-700">Medium (25-40 days)</span>
          </div>
          <div className="heatmap-legend-item flex items-center gap-2">
            <div className="heatmap-legend-dot w-4 h-4 rounded-full bg-[#EF4444]"></div>
            <span className="heatmap-legend-label text-xs text-gray-700">Slow (&gt;40 days)</span>
          </div>
          <div className="heatmap-legend-item flex items-center gap-2">
            <div className="heatmap-legend-dot w-4 h-4 rounded-full bg-[#9CA3AF]"></div>
            <span className="heatmap-legend-label text-xs text-gray-700">No data</span>
          </div>
        </div>
        <div className="heatmap-legend-footer text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
          Size = Report count
        </div>
      </div>
    </div>
  );
}
