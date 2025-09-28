"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const sections = ["Dashboard", "Register Teacher", "Manage Teachers", "Reports", "Settings"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Dashboard");

  // Teacher form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Check admin token
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/admin/login");
  };

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "https://my-school-project.onrender.com/api/teachers/register",
        { name, email, username, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ Teacher registered successfully!");
      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Registration failed");
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Welcome, {localStorage.getItem("adminUsername")}!
            </h2>
            <p className="text-gray-700">
              Use the sidebar to register teachers, view reports, or manage settings.
            </p>
          </motion.div>
        );
      case "Register Teacher":
        return (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4">Register New Teacher</h2>
            {message && <p className="mb-4 text-green-500">{message}</p>}
            <form onSubmit={handleRegisterTeacher} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 border rounded-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Register Teacher
              </button>
            </form>
          </motion.div>
        );
      case "Manage Teachers":
        return <p>Here we can display a list of registered teachers.</p>;
      case "Reports":
        return <p>Reports section coming soon...</p>;
      case "Settings":
        return <p>Settings section coming soon...</p>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-blue-500">Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          {sections.map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                activePage === item ? "bg-blue-500" : "hover:bg-blue-600"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">{renderPage()}</main>
    </div>
  );
};

export default AdminDashboard;
