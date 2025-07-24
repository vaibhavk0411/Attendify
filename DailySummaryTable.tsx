import React, { useEffect, useState } from "react";
import { parseISO, format, startOfWeek } from "date-fns";

interface DailySummary {
  date: string;
  count: number;
}

interface WeeklySummary {
  weekStart: string; // e.g., "2025-07-15"
  count: number;
}

const DailySummaryTable: React.FC = () => {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(
          "https://4xntjop8v7.execute-api.ap-south-1.amazonaws.com/rithish"
        );
        const data = await res.json();

        const parsedData =
          typeof data.body === "string" ? JSON.parse(data.body) : data;

        const entries = parsedData || {};

        const transformed: DailySummary[] = Object.keys(entries)
          .sort((a, b) => b.localeCompare(a)) // sort descending
          .map((date) => ({
            date,
            count: entries[date],
          }));

        setSummary(transformed);

        // === Weekly grouping logic ===
        const weekMap: { [weekStart: string]: number } = {};

        transformed.forEach(({ date, count }) => {
          const parsedDate = parseISO(date);
          const weekStart = format(startOfWeek(parsedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
          weekMap[weekStart] = (weekMap[weekStart] || 0) + count;
        });

        const weeklyData: WeeklySummary[] = Object.entries(weekMap)
          .sort((a, b) => b[0].localeCompare(a[0])) // descending
          .map(([weekStart, count]) => ({ weekStart, count }));

        setWeeklySummary(weeklyData);
      } catch (error) {
        console.error("Error fetching daily summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center">Loading analytics...</p>;

  const totalAttendance = summary.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="p-4 rounded-xl shadow-xl bg-white mt-4">
      <h2 className="text-xl font-bold mb-2">📊 Daily Attendance Summary</h2>
      <p className="text-sm mb-1 text-gray-600">
        Debug: {summary.length} record(s) fetched
      </p>
      <p className="text-sm mb-4 text-gray-600">
        Total Attendance: {totalAttendance}
      </p>

      <table className="w-full table-auto border border-gray-300 mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Total Present</th>
          </tr>
        </thead>
        <tbody>
          {summary.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-4">
                No attendance data yet.
              </td>
            </tr>
          ) : (
            summary.map((item) => (
              <tr key={item.date}>
                <td className="border px-4 py-2">{item.date}</td>
                <td className="border px-4 py-2 text-center">{item.count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mb-2">📅 Weekly Attendance Summary</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Week Starting</th>
            <th className="border px-4 py-2">Total Present</th>
          </tr>
        </thead>
        <tbody>
          {weeklySummary.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-4">
                No weekly data yet.
              </td>
            </tr>
          ) : (
            weeklySummary.map((week) => (
              <tr key={week.weekStart}>
                <td className="border px-4 py-2">{week.weekStart}</td>
                <td className="border px-4 py-2 text-center">{week.count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DailySummaryTable;