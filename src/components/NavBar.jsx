// src/components/Navbar.jsx
import React, { useState } from "react";



export default function Navbar({ brand = "That-school" }) {
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "#home", label: "Home" },
    { href: "#student", label: "Student Portal" },
    { href: "#parent", label: "Parent Portal" },
    { href: "#", label: "Teacher Portal" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <a href="#home" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
              style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}
            >
              S
            </div>
            <span className="text-slate-800 font-semibold text-lg">
              {brand}
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:space-x-6">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-slate-700 hover:text-slate-900 px-2 py-1 rounded-md font-medium transition"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="#login"
              className="hidden md:inline-block px-3 py-1.5 border border-gray-200 rounded-md font-semibold hover:bg-gray-50"
            >
              Sign In
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-controls="mobile-menu"
              aria-expanded={open}
              className="inline-flex items-center justify-center rounded-md p-2 md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden ${
          open ? "block" : "hidden"
        } border-t border-gray-100 bg-white`}
      >
        <div className="px-4 pt-3 pb-4 space-y-2">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-800 bg-gray-50"
            >
              {n.label}
            </a>
          ))}

          <a
            href="#login"
            onClick={() => setOpen(false)}
            className="block text-center mt-1 px-3 py-2 rounded-md font-semibold border border-gray-200"
          >
            Sign In
          </a>
        </div>
      </div>
    </header>
  );
}
