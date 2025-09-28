// HomePage.jsx
// React + Tailwind component (default export)
// - Replace image URLs with your own in /public or import them
// - Ensure Tailwind CSS is set up in your project

import React, { useState } from "react";

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* NAVBAR */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="#home" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  S
n                </div>
                <span className="font-semibold text-lg">SMPN 1 Cibadak</span>
              </a>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#home" className="hover:text-blue-600">Home</a>
              <a href="/teacher/login" className="hover:text-blue-600">Teacher</a>
              <a href="/student" className="hover:text-blue-600">Student</a>
            </nav>

            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-md focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 flex flex-col gap-2">
              <a href="#home" className="py-2">Home</a>
              <a href="#teacher" className="py-2">Teacher</a>
              <a href="#student" className="py-2">Student</a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <main id="home" className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                Welcome to <span className="text-blue-600">SMPN 1 Cibadak</span>
              </h1>
              <p className="mt-4 text-gray-600 max-w-xl">
                A caring and scholarly environment focused on ethical intelligence — where students grow with curiosity,
                empathy, and strong character. Explore resources for teachers and students below.
              </p>

              <div className="mt-6 flex gap-3">
                <a href="#teacher" className="inline-block px-5 py-3 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700">For Teachers</a>
                <a href="#student" className="inline-block px-5 py-3 border border-gray-200 rounded-md font-medium hover:bg-gray-100">For Students</a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <h4 className="font-semibold text-gray-700">Location</h4>
                  <p>Jl. Siliwangi No 123, Cibadak, Sukabumi</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Contact</h4>
                  <p>(0266) 531333 · info@smpn1cibadak.sch.id</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80"
                alt="School building"
                className="w-full rounded-xl shadow-lg object-cover h-80 sm:h-[420px]"
              />

              <div className="absolute -bottom-8 left-6 grid grid-cols-2 gap-4 w-[85%]">
                <img
                  src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=60"
                  alt="Teacher"
                  className="w-full h-24 rounded-lg object-cover border-4 border-white shadow-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60"
                  alt="Students learning"
                  className="w-full h-24 rounded-lg object-cover border-4 border-white shadow-md"
                />
              </div>
            </div>
          </section>

          {/* spacer to make absolutely positioned images visible */}
          <div className="h-12" />

          {/* TEACHER & STUDENT CARDS */}
          <section id="teacher" className="mt-12">
            <h2 className="text-2xl font-semibold">Teacher Portal</h2>
            <p className="mt-2 text-gray-600 max-w-2xl">Resources, exam management, announcements — tools to help teachers manage classes effectively.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1596496055186-1a0b5f2f0b7f?auto=format&fit=crop&w=1000&q=60" alt="Classroom" className="w-full h-44 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold">Create Exams</h3>
                  <p className="mt-2 text-sm text-gray-600">Quickly build and schedule assessments for your class.</p>
                  <a href="#" className="mt-4 inline-block text-blue-600 text-sm">Open</a>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=60" alt="Notes" className="w-full h-44 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold">Announcements</h3>
                  <p className="mt-2 text-sm text-gray-600">Post school-wide notices or class-specific reminders.</p>
                  <a href="#" className="mt-4 inline-block text-blue-600 text-sm">Open</a>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=60" alt="Schedule" className="w-full h-44 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold">Class Roster</h3>
                  <p className="mt-2 text-sm text-gray-600">View and manage students enrolled in your classes.</p>
                  <a href="#" className="mt-4 inline-block text-blue-600 text-sm">Open</a>
                </div>
              </div>
            </div>
          </section>

          <section id="student" className="mt-12">
            <h2 className="text-2xl font-semibold">Student Area</h2>
            <p className="mt-2 text-gray-600 max-w-2xl">Learning materials, schedules, and announcements — everything a student needs in one place.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
                <div className="w-1/3">
                  <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=60" alt="Student studying" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 w-2/3">
                  <h3 className="font-semibold">My Courses</h3>
                  <p className="mt-2 text-sm text-gray-600">Access your subjects, notes and assignments.</p>
                  <a href="#" className="mt-4 inline-block text-blue-600 text-sm">Open</a>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
                <div className="w-1/3">
                  <img src="https://images.unsplash.com/photo-1554475901-4538ddfbccc4?auto=format&fit=crop&w=800&q=60" alt="Online learning" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 w-2/3">
                  <h3 className="font-semibold">Announcements</h3>
                  <p className="mt-2 text-sm text-gray-600">See the latest school updates and event schedules.</p>
                  <a href="#" className="mt-4 inline-block text-blue-600 text-sm">Open</a>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-16 border-t pt-8 pb-12 text-sm text-gray-600">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div>
                <strong>SMPN 1 Cibadak</strong>
                <p className="mt-2">Jl. Siliwangi No 123, Cibadak, Sukabumi, Jawa Barat 43351</p>
                <p className="mt-1">(0266) 531333 · info@smpn1cibadak.sch.id</p>
              </div>

              <div className="text-gray-500">
                © {new Date().getFullYear()} SMP Negeri 1 Cibadak. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
