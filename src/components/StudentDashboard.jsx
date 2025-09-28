import React, { useEffect, useState, useRef } from "react";

// Safe API base (works for CRA/Vite/Next fallback)
const API_BASE = (() => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE)
      return import.meta.env.VITE_API_BASE;
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE)
      return process.env.NEXT_PUBLIC_API_BASE;
    if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE)
      return process.env.REACT_APP_API_BASE;
  } catch (e) {}
  return "https://my-school-project.onrender.com/api";
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
    const msg =
      data?.error || data?.message || res.statusText || "Request failed";
    const err = new Error(msg);
    err.data = data;
    throw err;
  }
  return data;
}

/*
Polished StudentDashboard
- modern layout
- accessible registration flow (modal)
- nicer exam cards, timer progress bar
- clean question UI and submission flow
- lightweight skeletons / loading states
*/

export default function StudentDashboard() {
  const [student, setStudent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("student")) || null;
    } catch (e) {
      return null;
    }
  });

  const [tab, setTab] = useState("exams"); // exams | submissions | taking
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null); // exam object for taking
  const [answers, setAnswers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const timerRef = useRef(null);
  const [remainingSec, setRemainingSec] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExam && selectedExam.time) {
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

  async function loadExams() {
    setLoadingExams(true);
    try {
      const data = await fetchJson(
        `${API_BASE.replace(/\/$/, "")}/student/exams`
      );
      const list = Array.isArray(data) ? data : data.exams || [];
      setExams(list);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to load exams");
    } finally {
      setLoadingExams(false);
    }
  }

  async function handleRegister(form) {
    try {
      setLoading(true);
      const data = await fetchJson(
        `${API_BASE.replace(/\/$/, "")}/student/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const studentObj = data.student || data;
      setStudent(studentObj);
      localStorage.setItem("student", JSON.stringify(studentObj));
      setMessage("Registered successfully");
      setShowRegisterModal(false);
      setTab("exams");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  async function startExam(examId) {
    try {
      setLoading(true);
      const data = await fetchJson(
        `${API_BASE.replace(/\/$/, "")}/student/exams/${examId}`
      );
      const ex = data.exam || data;
      const initialAnswers = (ex.generatedQuestions || []).map((q) => ({
        question: q.question,
        selectedOption: null,
      }));
      setSelectedExam(ex);
      setAnswers(initialAnswers);
      setTab("taking");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to start exam");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(qIndex, option) {
    setAnswers((prev) =>
      prev.map((a, i) => (i === qIndex ? { ...a, selectedOption: option } : a))
    );
  }

  async function submitExam() {
    if (!student) return setMessage("Please register before submitting");
    if (!selectedExam) return;

    const payload = {
      studentId: student._id || student.id,
      studentName: student.name || student.email,
      examId: selectedExam._id,
      answers: answers.map((a) => ({
        question: a.question,
        selectedOption: a.selectedOption,
      })),
    };

    try {
      setLoading(true);
      const data = await fetchJson(
        `${API_BASE.replace(/\/$/, "")}/submissions/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      

      const submission = data.submission || data;
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

  async function handleAutoSubmit() {
    if (!selectedExam) return;
    setMessage("Time up — auto-submitting...");
    await submitExam();
  }

  async function fetchSubmissionResult(examId) {
    if (!student) return setMessage("Register first");
    try {
      setLoading(true);
      const data = await fetchJson(
        `${API_BASE.replace(/\/$/, "")}/submissions/result/${
          student._id || student.id
        }/${examId}`
      );
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

  function formatTime(sec) {
    if (sec === null || sec === undefined) return "";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Take exams assigned to you — fast, simple, fair.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {student ? (
              <div className="text-right">
                <div className="font-medium text-gray-800">
                  {student.name || student.email}
                </div>
                <div className="text-sm text-gray-500">
                  {student.class || "—"}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg shadow"
              >
                Register
              </button>
            )}
          </div>
        </header>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-5">
          <nav className="flex gap-2 mb-4">
            <TabButton active={tab === "exams"} onClick={() => setTab("exams")}>
              Exams
            </TabButton>
            <TabButton
              active={tab === "submissions"}
              onClick={() => setTab("submissions")}
            >
              My Submissions
            </TabButton>
            {tab === "taking" && <TabButton active>Taking</TabButton>}
          </nav>

          <main>
            {tab === "exams" && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Available Exams</h2>
                {loadingExams ? (
                  <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exams.length === 0 && (
                      <div className="text-gray-500">No exams available.</div>
                    )}
                    {exams.map((ex) => (
                      <ExamCard
                        key={ex._id}
                        exam={ex}
                        onStart={() => startExam(ex._id)}
                        onCheck={() => fetchSubmissionResult(ex._id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === "taking" && selectedExam && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {selectedExam.title}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {selectedExam.subject} • {selectedExam.difficulty}
                    </div>
                  </div>
                  {selectedExam.time && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Time remaining
                      </div>
                      <div className="font-mono text-lg">
                        {formatTime(remainingSec)}
                      </div>
                      <ProgressBar
                        total={selectedExam.time * 60}
                        remaining={remainingSec}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedExam.generatedQuestions.map((q, idx) => (
                    <QuestionCard
                      key={idx}
                      index={idx}
                      q={q}
                      selected={answers[idx]?.selectedOption}
                      onSelect={(opt) => handleSelectOption(idx, opt)}
                    />
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={submitExam}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Submit Exam
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExam(null);
                      setTab("exams");
                      if (timerRef.current) clearInterval(timerRef.current);
                    }}
                    className="border px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </section>
            )}

            {tab === "submissions" && (
              <section>
                <h2 className="text-xl font-semibold mb-3">My Submissions</h2>
                <div className="space-y-3">
                  {submissions.length === 0 && (
                    <div className="text-gray-500">No submissions yet.</div>
                  )}
                  {submissions.map((s) => (
                    <SubmissionCard
                      key={s._id || `${s.exam}_${s.submittedAt}`}
                      s={s}
                    />
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegister}
          loading={loading}
        />
      )}
    </div>
  );
}

/* ---------------- small components ---------------- */
function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-sm ${
        active ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function ExamCard({ exam, onStart, onCheck }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold">{exam.title}</div>
          <div className="text-sm text-gray-500 mt-1">
            {exam.subject} • {exam.difficulty}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {(exam.questions || exam.generatedQuestions || []).length} questions
            • {exam.time} min
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onStart}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Start
          </button>
          <button onClick={onCheck} className="px-3 py-1 border rounded">
            Check Result
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border rounded-xl p-4 bg-white">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-8 bg-gray-200 rounded w-24" />
    </div>
  );
}

function QuestionCard({ q, index, selected, onSelect }) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="font-medium mb-3">
        {index + 1}. {q.question}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
              selected === opt ? "bg-sky-50 border-sky-200" : "hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name={`q-${index}`}
              checked={selected === opt}
              onChange={() => onSelect(opt)}
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ total = 1, remaining = 0 }) {
  const pct =
    total && remaining !== null
      ? Math.max(0, Math.min(100, Math.round((remaining / total) * 100)))
      : 0;
  return (
    <div className="w-48 mt-2">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className={`h-2 bg-gradient-to-r from-green-400 to-emerald-600`}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">{pct}% left</div>
    </div>
  );
}

function SubmissionCard({ s }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">
            {s.exam?.title || s.examTitle || "Exam"}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Submitted:{" "}
            {new Date(
              s.submittedAt || s.createdAt || Date.now()
            ).toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-green-600">
            Score: {s.score ?? "Pending"}
          </div>
          <div className="text-sm text-gray-500">
            Graded by: {s.gradedBy || "—"}
          </div>
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
                <div className="text-sm">
                  {a.isCorrect ? (
                    <span className="text-green-600">Correct</span>
                  ) : (
                    <span className="text-red-600">Wrong</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function RegisterModal({ onClose, onRegister, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !studentClass)
      return alert("Please fill all fields");
    onRegister({ name, email, class: studentClass });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Register to Take Exams</h3>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full border rounded px-3 py-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full border rounded px-3 py-2"
          />
          <input
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            placeholder="Class (e.g. JSS1)"
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded"
            >
              {loading ? "Saving..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
