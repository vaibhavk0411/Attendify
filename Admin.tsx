import DailySummaryTable from "../components/DailySummaryTable";
import AdminSidebar from "../components/AdminSidebar";
import { Button } from "../components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const clientId = "4ir68homtqoldnpbn4d52tf50f";
const logoutUri = "http://localhost:5173";
const cognitoDomain = "https://ap-south-198vedqttf.auth.ap-south-1.amazoncognito.com";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState([
    // ... existing attendance data ...
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('attendify_user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    const groups = parsedUser?.profile?.["cognito:groups"] || [];
    if (!(Array.isArray(groups) ? groups.includes("admin") : groups === "admin")) {
      navigate('/');
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('attendify_user');
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>
        {/* Main Content: Replaced with DailySummaryTable */}
        <DailySummaryTable />
      </main>
    </div>
  );
};

export default Admin;
