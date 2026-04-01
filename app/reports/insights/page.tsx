"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CityStat, MOCK_CITY_STATS } from "@/lib/insightsUtils";
import KpiRibbon from "@/app/components/insights/KpiRibbon";
import LeaderboardTable from "@/app/components/insights/LeaderboardTable";
import Link from "next/link";

// Dynamically import the map component to avoid SSR issues with Leaflet
const GermanyHeatMap = dynamic(
  () => import("@/app/components/insights/GermanyHeatMap"),
  { ssr: false }
);

export default function InsightsPage() {
  const [stats, setStats] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats/cities");
        if (!res.ok) throw new Error("Failed to fetch city statistics");
        
        const data = await res.json();
        
        if (data.cities && data.cities.length > 0) {
          setStats(data.cities);
          setError(null);
        } else {
          // Fallback to mock data if API returns empty
          setStats(MOCK_CITY_STATS);
          setError("Using sample data. Real data not available yet.");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setStats(MOCK_CITY_STATS);
        setError("Could not load real-time data. Showing sample data instead.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">
              Insights Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Real-time processing speed analytics across German immigration offices
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <div className="font-semibold text-yellow-900 mb-1">
                Data Limitation
              </div>
              <div className="text-sm text-yellow-800">{error}</div>
            </div>
          </div>
        )}

        {/* KPI Ribbon */}
        <KpiRibbon stats={stats} />

        {/* Germany Map Heat View */}
        <section className="mb-8">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Germany Map Heat View
              </h2>
              <p className="text-gray-600">
                Click on any city marker to view detailed statistics
              </p>
            </div>
            <GermanyHeatMap
              stats={stats}
              selectedCity={selectedCity}
              onCitySelect={setSelectedCity}
            />
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                City Leaderboard
              </h2>
              <p className="text-gray-600">
                Compare processing times across all cities
              </p>
            </div>
            <LeaderboardTable
              stats={stats}
              selectedCity={selectedCity}
              onCitySelect={setSelectedCity}
            />
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">
            Help Improve This Data
          </h3>
          <p className="text-blue-100 mb-4">
            Submit your timeline to help others plan their immigration journey
          </p>
          <Link
            href="/submit"
            className="inline-block bg-white text-blue-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Submit Your Timeline
          </Link>
        </div>
      </div>
    </div>
  );
}
