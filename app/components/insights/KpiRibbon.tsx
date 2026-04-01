import {
  CityStat,
  computeNationalAverageWeighted,
  getFastestCity,
  getSlowestCity,
} from "@/lib/insightsUtils";

interface KpiRibbonProps {
  stats: CityStat[];
}

export default function KpiRibbon({ stats }: KpiRibbonProps) {
  const nationalAvg = computeNationalAverageWeighted(stats);
  const fastest = getFastestCity(stats);
  const slowest = getSlowestCity(stats);
  const totalReports = stats.reduce((sum, city) => sum + city.reports, 0);
  const citiesCount = stats.length;

  const kpis = [
    {
      label: "National Average",
      value: nationalAvg > 0 ? `${nationalAvg} days` : "—",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"/>
          <line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
      ),
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
    },
    {
      label: "Fastest City",
      value: fastest ? `${fastest.city}` : "—",
      subValue: fastest ? `${fastest.avgDays} days` : "",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
        </svg>
      ),
      color: "bg-green-50 border-green-200",
      textColor: "text-green-900",
    },
    {
      label: "Slowest City",
      value: slowest ? `${slowest.city}` : "—",
      subValue: slowest ? `${slowest.avgDays} days` : "",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      color: "bg-red-50 border-red-200",
      textColor: "text-red-900",
    },
    {
      label: "Total Reports",
      value: totalReports.toLocaleString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-900",
    },
    {
      label: "Cities Covered",
      value: citiesCount.toString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      color: "bg-amber-50 border-amber-200",
      textColor: "text-amber-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className={`${kpi.color} border-2 rounded-xl p-5 transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="text-current" aria-hidden="true">
              {kpi.icon}
            </div>
          </div>
          <div className={`text-sm font-medium text-gray-600 mb-1`}>
            {kpi.label}
          </div>
          <div className={`text-2xl font-bold ${kpi.textColor}`}>
            {kpi.value}
          </div>
          {kpi.subValue && (
            <div className={`text-sm font-medium ${kpi.textColor} opacity-80 mt-1`}>
              {kpi.subValue}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
