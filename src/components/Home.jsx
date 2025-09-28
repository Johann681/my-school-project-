
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Visitor");

  // Try to personalize from localStorage (safe fallback)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userName") || localStorage.getItem("name");
      if (stored) setName(stored);
      else setName("Lotus"); // friendly default — change as you like
    } catch (e) {
      setName("Lotus");
    }
  }, []);

  // close mobile menu when a link is clicked
  const handleNavClick = () => setOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* NAVBAR */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="#home" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">Sn</div>
                <span className="font-semibold text-lg">SMPN 1 Cibadak</span>
              </a>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#home" className="hover:text-blue-600">Home</a>
              <a href="/teacher/login" className="hover:text-blue-600">Teacher</a>
              <a href="/student" className="hover:text-blue-600">Student</a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-gray-600">Hi, <strong className="text-gray-800">{name}</strong></div>
              <a href="/teacher/login" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm shadow-sm hover:bg-blue-700">Sign In</a>
            </div>

            {/* mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
                aria-expanded={open}
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

        {/* mobile menu (full-screen overlay) */}
        {open && (
          <div className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setOpen(false)}>
            <div
              className="absolute top-0 right-0 w-11/12 max-w-xs h-full bg-white shadow-xl p-6 transform transition-transform"
              onClick={(e) => e.stopPropagation()} // prevent overlay click from closing when interacting inside panel
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">Sn</div>
                  <div>
                    <div className="font-semibold">SMPN 1 Cibadak</div>
                    <div className="text-xs text-gray-500">Welcome, {name}</div>
                  </div>
                </div>

                <button onClick={() => setOpen(false)} className="p-2 rounded-md focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-3">
                <a href="#home" onClick={handleNavClick} className="py-2 text-base font-medium hover:bg-gray-100 rounded-md px-2">Home</a>
                <a href="/teacher/login" onClick={handleNavClick} className="py-2 text-base font-medium hover:bg-gray-100 rounded-md px-2">Teacher</a>
                <a href="/student" onClick={handleNavClick} className="py-2 text-base font-medium hover:bg-gray-100 rounded-md px-2">Student</a>
                <a href="#teacher" onClick={handleNavClick} className="py-2 text-base font-medium hover:bg-gray-100 rounded-md px-2">Teacher Portal</a>
                <a href="#student" onClick={handleNavClick} className="py-2 text-base font-medium hover:bg-gray-100 rounded-md px-2">Student Area</a>
              </nav>

              <div className="mt-6 pt-4 border-t">
                <a href="/teacher/login" onClick={handleNavClick} className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium">Sign In</a>
                <a href="/contact" onClick={handleNavClick} className="block w-full text-center mt-3 px-4 py-2 border border-gray-200 rounded-md">Contact</a>
              </div>

              <div className="mt-6 text-xs text-gray-400">Tip: add <code>localStorage.setItem('userName', 'YourName')</code> to personalize the greeting.</div>
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
                Hey <span className="text-blue-600">{name}</span>, welcome back —
                <div className="text-xl font-medium text-gray-700">SMPN 1 Cibadak: where curiosity meets character</div>
              </h1>

              <p className="mt-4 text-gray-600 max-w-xl">
                Great to see you again, {name}. This is your hub for lessons, exams, and school updates — fast access to the tools
                you use every day. Whether you're creating an exam, posting an announcement, or checking a roster, we've got your back.
              </p>

              <div className="mt-6 flex gap-3">
                <a href="#teacher" className="inline-block px-5 py-3 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700">Go to Teacher Tools</a>
                <a href="#student" className="inline-block px-5 py-3 border border-gray-200 rounded-md font-medium hover:bg-gray-100">Open Student Area</a>
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
              {/* Replace with your local images in /public/images or keep the external URL as fallback */}
              <img
                src="/images/school.jpg"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80" }}
                alt="School building"
                className="w-full rounded-xl shadow-lg object-cover h-80 sm:h-[420px]"
              />

              <div className="absolute -bottom-8 left-6 grid grid-cols-2 gap-4 w-[85%]">
                <img
                  src="/images/teacher.jpg"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=60" }}
                  alt="Teacher"
                  className="w-full h-24 rounded-lg object-cover border-4 border-white shadow-md"
                />
                <img
                  src="/images/students.jpg"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60" }}
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
            <p className="mt-2 text-gray-600 max-w-2xl">Hey {name} — quick access to the tools teachers love: create exams, share announcements, and manage your class roster with ease. Everything you need to keep lessons running smoothly.</p>

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
            <p className="mt-2 text-gray-600 max-w-2xl">Students: find your courses, assignments, and announcements in one friendly place. Track progress, join classes, and stay in the loop.</p>

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
