import React, { useEffect, useState, useRef } from "react";

// Safe API base (works for CRA/Vite/Next fallback)
const API_BASE = (() => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
    if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
  } catch (e) {}
  return "http://my-school-project.onrender/api";
})();

// Helper: fetch JSON with nicer errors
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    // non-json response
    data = { message: text };
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || "Request failed";
    const err = new Error(msg);
    err.data = data;
    throw err;
  }
  return data;
}

/*
StudentDashboard component
- Register student (localStorage persisted)
- List exams (GET /api/student/exams)
- Start exam (GET /api/student/exams/:examId)
- Take exam (select answers), optional timer
- Submit answers (POST /api/student/submit)
- View submission result (immediate response or fetched later)
*/

export default function StudentDashboard() {
  const [student, setStudent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("student")) || null;
    } catch (e) {
      return null;
    }
  });

  const [tab, setTab] = useState("exams"); // exams | submissions
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null); // exam object for taking
  const [answers, setAnswers] = useState([]); // [{question, selectedOption}]
  const [submissions, setSubmissions] = useState([]); // local cache of submissions
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const [remainingSec, setRemainingSec] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExam && selectedExam.time) {
      // set timer in seconds
      setRemainingSec(selectedExam.time * 60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemainingSec((s) => {
          if (s === null) return null;
          if (s <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExam]);

  // load exams list for students
  async function loadExams() {
    setLoadingExams(true);
    try {
      const data = await fetchJson(`${API_BASE}/student/exams`);
      // backend returns array or {exams}
      const list = Array.isArray(data) ? data : data.exams || [];
      setExams(list);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to load exams");
    } finally {
      setLoadingExams(false);
    }
  }

  // register student and persist locally
  async function handleRegister(form) {
    try {
      setLoading(true);
      const data = await fetchJson(`${API_BASE}/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const studentObj = data.student || data;
      setStudent(studentObj);
      localStorage.setItem("student", JSON.stringify(studentObj));
      setMessage("Registered successfully");
      setTab("exams");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  // open exam to take
  async function startExam(examId) {
    try {
      setLoading(true);
      const data = await fetchJson(`${API_BASE}/student/exams/${examId}`);
      const ex = data.exam || data; // controller might return object directly
      // create blank answers structure
      const initialAnswers = (ex.generatedQuestions || []).map((q) => ({ question: q.question, selectedOption: null }));
      setSelectedExam(ex);
      setAnswers(initialAnswers);
      setTab("taking");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to start exam");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(qIndex, option) {
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? { ...a, selectedOption: option } : a)));
  }

  // prepare payload and submit to backend
  async function submitExam() {
    if (!student) return setMessage("Please register before submitting");
    if (!selectedExam) return;

    // ensure all answers selected? we allow partial submits
    const payload = {
      studentId: student._id || student.id,
      studentName: student.name || student.email,
      examId: selectedExam._id,
      answers: answers.map((a) => ({ question: a.question, selectedOption: a.selectedOption })),
    };

    try {
      setLoading(true);
      const data = await fetchJson(`${API_BASE}/student/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const submission = data.submission || data; // controller returns submission
      // cache locally
      setSubmissions((s) => [submission, ...s]);
      setSelectedExam(null);
      setAnswers([]);
      setTab("submissions");
      setMessage("Submitted — check results in My Submissions");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to submit exam");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  // auto submit when timer runs out
  async function handleAutoSubmit() {
    if (!selectedExam) return;
    setMessage("Time up — auto-submitting...");
    await submitExam();
  }

  // fetch single submission result (if teacher grades later)
  async function fetchSubmissionResult(examId) {
    if (!student) return setMessage("Register first");
    try {
      setLoading(true);
      const data = await fetchJson(`${API_BASE.replace(/\/$/, "")}/submissions/result/${student._id || student.id}/${examId}`);
      const sub = data.submission || data;
      setSubmissions((s) => [sub, ...s.filter((x) => x._id !== sub._id)]);
      setMessage("Fetched latest result");
      setTab("submissions");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "No graded result yet");
    } finally {
      setLoading(false);
    }
  }

  // small helpers
  function formatTime(sec) {
    if (sec === null || sec === undefined) return "";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  /* ---------- UI ---------- */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-gray-600">Take exams assigned to you.</p>
        </div>
        <div className="text-right">
          {student ? (
            <div>
              <div className="font-medium">{student.name || student.email}</div>
              <div className="text-sm text-gray-500">{student.class || "--"}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Not registered</div>
          )}
        </div>
      </header>

      {message && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">{message}</div>
      )}

      {/* Registration card */}
      {!student && (
        <RegistrationCard onRegister={handleRegister} loading={loading} />
      )}

      {/* Tabs */}
      <nav className="flex gap-2">
        <button onClick={() => setTab("exams")} className={`px-3 py-1 rounded ${tab === "exams" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
          Exams
        </button>
        <button onClick={() => setTab("submissions")} className={`px-3 py-1 rounded ${tab === "submissions" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
          My Submissions
        </button>
      </nav>

      {/* Main content */}
      <main>
        {tab === "exams" && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Available Exams</h2>
            {loadingExams ? (
              <div>Loading exams...</div>
            ) : (
              <div className="space-y-3">
                {exams.length === 0 && <div className="text-gray-500">No exams available.</div>}
                {exams.map((ex) => (
                  <div key={ex._id} className="border rounded p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{ex.title}</div>
                      <div className="text-sm text-gray-500">{ex.subject} • {ex.difficulty} • {ex.questions} Qs • {ex.time} min</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startExam(ex._id)} className="bg-green-600 text-white px-3 py-1 rounded">Start</button>
                      <button onClick={() => fetchSubmissionResult(ex._id)} className="border px-3 py-1 rounded">Check Result</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "taking" && selectedExam && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedExam.title}</h2>
              <div className="text-sm text-gray-600">{selectedExam.subject} • {selectedExam.difficulty}</div>
            </div>

            {selectedExam.time && (
              <div className="mb-3">
                <div className="text-sm text-gray-600">Time remaining: <span className="font-mono ml-2">{formatTime(remainingSec)}</span></div>
              </div>
            )}

            <div className="space-y-4">
              {selectedExam.generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-4 border rounded">
                  <div className="font-medium">{idx + 1}. {q.question}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${answers[idx]?.selectedOption === opt ? "bg-blue-50 border-blue-200" : ""}`}>
                        <input type="radio" name={`q-${idx}`} checked={answers[idx]?.selectedOption === opt} onChange={() => handleSelectOption(idx, opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={submitExam} className="bg-blue-600 text-white px-4 py-2 rounded">Submit Exam</button>
              <button onClick={() => { setSelectedExam(null); setTab("exams"); if (timerRef.current) clearInterval(timerRef.current); }} className="border px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        )}

        {tab === "submissions" && (
          <div>
            <h2 className="text-lg font-semibold mb-3">My Submissions</h2>
            <div className="space-y-3">
              {submissions.length === 0 && <div className="text-gray-500">No submissions yet.</div>}
              {submissions.map((s) => (
                <div key={s._id || `${s.exam}_${s.submittedAt}`} className="border rounded p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{s.exam?.title || s.examTitle || "Exam"}</div>
                      <div className="text-sm text-gray-500">Submitted: {new Date(s.submittedAt || s.createdAt || Date.now()).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">Score: {s.score ?? "Pending"}</div>
                      <div className="text-sm text-gray-500">Graded by: {s.gradedBy || "—"}</div>
                    </div>
                  </div>
                  {Array.isArray(s.answers) && (
                    <details className="mt-3">
                      <summary className="cursor-pointer">View answers</summary>
                      <div className="mt-2 space-y-2">
                        {s.answers.map((a, i) => (
                          <div key={i} className="p-2 border rounded">
                            <div className="text-sm font-medium">Q: {a.question}</div>
                            <div className="text-sm">Your answer: {a.selectedOption}</div>
                            <div className="text-sm">Correct: {a.correctAnswer ?? "—"}</div>
                            <div className="text-sm">{a.isCorrect ? <span className="text-green-600">Correct</span> : <span className="text-red-600">Wrong</span>}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- Registration card component ---------- */
function RegistrationCard({ onRegister, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !studentClass) return alert("Please fill all fields");
    onRegister({ name, email, class: studentClass });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded border mb-4">
      <h3 className="font-semibold mb-2">Register / Identify</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="border px-3 py-2 rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="border px-3 py-2 rounded" />
        <input value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder="Class (e.g. JSS1)" className="border px-3 py-2 rounded" />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : "Register"}</button>
      </div>
    </form>
  );
}
