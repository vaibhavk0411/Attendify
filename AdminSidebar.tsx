
import { NavLink } from "react-router-dom";
import { Home } from "lucide-react";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  
];

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-blue-100 min-h-screen p-6 space-y-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Attendify</h2>
      </div>
      <nav className="space-y-2 mb-8">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.url}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-200 text-blue-800 font-medium" : "text-gray-700 hover:bg-blue-50"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
