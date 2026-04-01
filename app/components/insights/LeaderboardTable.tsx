"use client";

import { useState, useMemo } from "react";
import { CityStat } from "@/lib/insightsUtils";

interface LeaderboardTableProps {
  stats: CityStat[];
  selectedCity: string | null;
  onCitySelect: (city: string) => void;
}

type SortField = "avgDays" | "reports";
type SortDirection = "asc" | "desc";

export default function LeaderboardTable({
  stats,
  selectedCity,
  onCitySelect,
}: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("avgDays");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = stats.filter((city) =>
      city.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === "asc" ? 1 : -1;
      return (aVal - bVal) * multiplier;
    });

    return filtered;
  }, [stats, searchQuery, sortField, sortDirection]);

  const selectedCityData = stats.find((s) => s.city === selectedCity);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cities..."
          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
        />
        <svg
          className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  City
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("avgDays")}
                >
                  <div className="flex items-center gap-2">
                    Avg Days
                    {sortField === "avgDays" && (
                      <span className="text-blue-600">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("reports")}
                >
                  <div className="flex items-center gap-2">
                    Reports
                    {sortField === "reports" && (
                      <span className="text-blue-600">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No cities found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((city, idx) => (
                  <tr
                    key={city.city}
                    onClick={() => onCitySelect(city.city)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                      selectedCity === city.city
                        ? "bg-blue-100 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {city.city}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        {city.avgDays}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">days</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">
                        {city.reports}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                          city.confidence === "high"
                            ? "bg-green-100 text-green-800"
                            : city.confidence === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {city.confidence.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected City Detail Panel */}
      {selectedCityData && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedCityData.city}
            </h3>
            <button
              onClick={() => onCitySelect("")}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close details"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Avg Processing Time
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {selectedCityData.avgDays}
                <span className="text-sm font-normal text-gray-600 ml-1">
                  days
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Total Reports
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {selectedCityData.reports}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Data Quality
              </div>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {selectedCityData.confidence}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Location
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {selectedCityData.lat.toFixed(2)}°N,{" "}
                {selectedCityData.lng.toFixed(2)}°E
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
