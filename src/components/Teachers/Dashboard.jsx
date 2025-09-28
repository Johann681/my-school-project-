"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import Home from "./Home";
import Exams from "./Exam";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(
    localStorage.getItem("activePage") || "Home"
  );
  const [teacherName, setTeacherName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist activePage in localStorage
  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    const name = localStorage.getItem("teacherName");
    if (!token || !name) {
      navigate("/teacher/login");
    } else {
      setTeacherName(name);
    }
  }, [navigate]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("activePage");
    navigate("/teacher/login");
  };

  const renderPage = () => {
    switch (activePage) {
      case "Home":
        return <Home teacherName={teacherName} />;
      case "Exams":
        return <Exams teacherName={teacherName} />;
      default:
        return <Home teacherName={teacherName} />;
    }
  };

  const navItems = [
    "Home",
    "Classes",
    "Exams",
    "Assignments",
    "Students",
    "Reports",
    "Settings",
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-md flex items-center px-4 sm:px-6">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 p-2 rounded-md bg-blue-700 text-white shadow-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <HiMenu size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
            {activePage}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-gray-700 font-medium truncate max-w-[140px] sm:max-w-[220px]">
            Hello, {teacherName}
          </span>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 top-16 z-30 bg-black bg-opacity-30 md:hidden"
            />

            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed left-0 top-16 bottom-0 z-40 w-64 bg-gradient-to-b from-blue-700 to-blue-600 text-white flex flex-col shadow-lg md:hidden"
            >
              <div className="p-5 text-2xl font-bold border-b border-blue-500 flex justify-between items-center">
                Teacher
                <button
                  className="text-white text-2xl"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <HiX />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setActivePage(item);
                      setSidebarOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200 break-words ${
                      activePage === item
                        ? "bg-white text-blue-700 shadow-lg"
                        : "hover:bg-blue-500 hover:bg-opacity-80"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-blue-500">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-blue-700 to-blue-600 text-white h-full shadow-lg">
        <div className="p-5 text-2xl font-bold border-b border-blue-500">Teacher</div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`block w-full text-left px-4 py-3 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200 break-words ${
                activePage === item
                  ? "bg-white text-blue-700 shadow-lg"
                  : "hover:bg-blue-500 hover:bg-opacity-80"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col pt-16">
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto bg-gray-50">
          <AnimatePresence exitBeforeEnter>{renderPage()}</AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
