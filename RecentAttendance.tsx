import React, { useEffect, useState } from "react";

type AttendanceRecord = {
  id: string;
  name: string;
  timestamp: string;
  status: string;
};

const RecentAttendance = ({ employeeId }: { employeeId: string }) => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("https://mv26cx5baa.execute-api.ap-south-1.amazonaws.com/sample/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId }),
        });

        const result = await res.json();
        if (result.success && result.attendanceHistory) {
          setData(result.attendanceHistory);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [employeeId]);

  if (loading) return <p className="text-center">Loading history...</p>;

  return (
    <div className="mt-10 border rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold mb-4">Recent Attendance</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No attendance records found.</p>
      ) : (
        <ul className="divide-y">
          {data.map((entry) => (
            <li key={entry.id} className="py-2 flex justify-between text-sm">
              <span>{new Date(entry.timestamp).toLocaleString()}</span>
              <span className={`font-medium ${entry.status === "Present" ? "text-green-600" : "text-red-600"}`}>
                {entry.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentAttendance; 