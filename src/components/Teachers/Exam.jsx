import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- API base (safe) ---------- */
const API_BASE = (() => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
    if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
  } catch {}
  return "http://my-school-project.onrender.com/api/exams";
})();

/* ---------- Small helpers ---------- */
const CATEGORY_OPTIONS = [
  "General Knowledge","Books","Film","Music","Science","Computers","Mathematics","Mythology",
  "Sports","Geography","History","Politics","Art","Celebrities","Animals","Vehicles","Comics",
  "Gadgets","Anime & Manga","Cartoons"
];

const emptyQuestion = () => ({ id: cryptoRandomId(), question: "", answer: "", options: ["", "", "", ""] });

// lightweight id generator (not crypto-critical)
function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 9);
}

/* ---------- Memoized Option input (tiny) ---------- */
const OptionInput = React.memo(function OptionInput({ value, onChange, checked, onSelect, placeholder }) {
  return (
    <div className="flex items-center gap-2">
      <input type="radio" checked={checked} onChange={onSelect} className="form-radio" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300"
      />
    </div>
  );
});

/* ---------- Memoized Question editor ---------- */
const QuestionEditor = React.memo(function QuestionEditor({
  q,
  index,
  onChangeQuestion,
  onChangeOption,
  onSetAnswer,
  onRemove,
  onShuffle,
}) {
  // ensure 4 options
  const options = useMemo(() => {
    const o = Array.isArray(q.options) ? q.options.slice() : [];
    while (o.length < 4) o.push("");
    return o.slice(0, 4);
  }, [q.options]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-start gap-3">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-600 font-medium">Question {index + 1}</label>
            <div className="flex gap-2">
              <button onClick={() => onShuffle(index)} className="text-sm text-gray-600 hover:underline">Shuffle</button>
              <button onClick={() => onRemove(index)} className="text-sm text-red-500 hover:underline">Remove</button>
            </div>
          </div>

          <input
            value={q.question}
            onChange={(e) => onChangeQuestion(index, e.target.value)}
            className="w-full mt-2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300"
            placeholder="Type the question here"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {options.map((opt, oi) => (
              <OptionInput
                key={oi}
                value={opt}
                onChange={(val) => onChangeOption(index, oi, val)}
                checked={q.answer === opt}
                onSelect={() => onSetAnswer(index, opt)}
                placeholder={`Option ${oi + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ---------- Main Exams component (refactored) ---------- */
const Exams = ({ teacherName = "Teacher" }) => {
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);

  const [meta, setMeta] = useState({
    title: "", subject: "General Knowledge", difficulty: "Easy", questionsCount: 5, time: 60,
  });

  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // show message
  const showMessage = useCallback((msg, t = 3000) => {
    setGlobalMessage(msg);
    if (t) setTimeout(() => setGlobalMessage(null), t);
  }, []);

  useEffect(() => { fetchExams(); }, []);

  const fetchJson = useCallback(async (url, opts = {}) => {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
    if (!res.ok) {
      const msg = data?.error || data?.message || res.statusText || "Request failed";
      const e = new Error(msg); e.responseData = data; throw e;
    }
    return data;
  }, []);

  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      const data = await fetchJson(API_BASE);
      setExams((data.exams || []).map((e) => ({ ...e, collapsed: true })));
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Failed to fetch exams");
    } finally { setLoadingExams(false); }
  }, [fetchJson, showMessage]);

  /* ---------- Generate preview ---------- */
  const generatePreview = useCallback(async () => {
    if (!meta.subject || !meta.questionsCount) return showMessage("Choose subject + number of questions");
    setPreviewLoading(true);
    try {
      const data = await fetchJson(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: meta.subject, questions: Number(meta.questionsCount), difficulty: meta.difficulty }),
      });

      const q = (data.questions || []).map((qq) => ({
        id: cryptoRandomId(),
        question: qq.question || "",
        answer: qq.answer || "",
        options: Array.isArray(qq.options) ? qq.options.slice() : ["", "", "", ""],
      }));
      while (q.length < Number(meta.questionsCount)) q.push(emptyQuestion());
      setPreviewQuestions(q);
      showMessage("Preview generated — edit before saving");
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Failed to generate preview");
    } finally { setPreviewLoading(false); }
  }, [meta.subject, meta.questionsCount, meta.difficulty, fetchJson, showMessage]);

  /* ---------- Preview helpers (useCallbacks to keep stable refs) ---------- */
  const changeQuestionText = useCallback((index, text) => {
    setPreviewQuestions((prev) => prev.map((p, i) => (i === index ? { ...p, question: text } : p)));
  }, []);

  const changeOptionText = useCallback((qIndex, optIndex, value) => {
    setPreviewQuestions((prev) => prev.map((p, i) => i === qIndex ? { ...p, options: p.options.map((o, oi) => (oi === optIndex ? value : o)) } : p));
  }, []);

  const setAnswer = useCallback((qIndex, optionText) => {
    setPreviewQuestions((prev) => prev.map((p, i) => (i === qIndex ? { ...p, answer: optionText } : p)));
  }, []);

  const addQuestion = useCallback(() => setPreviewQuestions((p) => [...p, emptyQuestion()]), []);
  const removeQuestion = useCallback((index) => setPreviewQuestions((p) => p.filter((_, i) => i !== index)), []);
  const shuffleOptions = useCallback((index) => {
    setPreviewQuestions((prev) => prev.map((p, i) => {
      if (i !== index) return p;
      const shuffled = (p.options || []).slice().sort(() => Math.random() - 0.5);
      return { ...p, options: shuffled };
    }));
  }, []);

  /* ---------- Save exam ---------- */
  const saveExam = useCallback(async () => {
    if (!meta.title) return showMessage("Enter a title before saving");
    if (!previewQuestions || previewQuestions.length === 0) return showMessage("No questions to save");

    const payload = previewQuestions.map((q) => ({
      question: q.question || "",
      answer: q.answer || q.options?.[0] || "",
      options: (q.options || []).slice(0, 4).concat(Array(4).fill("")).slice(0, 4),
    }));

    setSaving(true);
    try {
      const data = await fetchJson(`${API_BASE}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meta.title, subject: meta.subject, difficulty: meta.difficulty,
          time: Number(meta.time || 0), questions: payload, createdBy: teacherName,
        }),
      });
      setExams((prev) => [{ ...data.exam, collapsed: true }, ...prev]);
      setPreviewQuestions([]);
      setMeta((m) => ({ ...m, title: "" }));
      showMessage("Exam saved");
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Failed to save exam");
    } finally { setSaving(false); }
  }, [meta, previewQuestions, fetchJson, showMessage, teacherName]);

  /* ---------- Delete ---------- */
  const deleteExam = useCallback(async (id) => {
    if (!window.confirm("Delete exam?")) return;
    try {
      await fetchJson(`${API_BASE}/${id}`, { method: "DELETE" });
      setExams((prev) => prev.filter((e) => e._id !== id));
      showMessage("Exam deleted");
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Failed to delete exam");
    }
  }, [fetchJson, showMessage]);

  /* ---------- Render ---------- */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-xl shadow text-white flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {teacherName} 👋</h2>
          <p className="text-sm opacity-90">Create, review and publish exams.</p>
        </div>
        <div className="text-sm">{globalMessage}</div>
      </motion.div>

      {/* form */}
      <motion.form onSubmit={(e) => { e.preventDefault(); generatePreview(); }} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input value={meta.title} onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} placeholder="Exam title (required to save)" className="border rounded px-3 py-2" />
          <select value={meta.subject} onChange={(e) => setMeta((m) => ({ ...m, subject: e.target.value }))} className="border rounded px-3 py-2">
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={meta.difficulty} onChange={(e) => setMeta((m) => ({ ...m, difficulty: e.target.value }))} className="border rounded px-3 py-2">
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <input type="number" value={meta.questionsCount} onChange={(e) => setMeta((m) => ({ ...m, questionsCount: Number(e.target.value) }))} className="border rounded px-3 py-2" />
          <input type="number" value={meta.time} onChange={(e) => setMeta((m) => ({ ...m, time: Number(e.target.value) }))} className="border rounded px-3 py-2" />
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={previewLoading}>{previewLoading ? "Generating..." : "Generate Preview"}</button>
            <button type="button" onClick={() => { setPreviewQuestions([]); setMeta((m) => ({ ...m, title: "" })); }} className="border px-4 py-2 rounded">Reset</button>
          </div>
        </div>

        {/* preview */}
        {previewQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Preview ({previewQuestions.length} questions)</h4>
              <div className="flex gap-2">
                <button type="button" onClick={addQuestion} className="border px-3 py-1 rounded">+ Add</button>
                <button type="button" onClick={() => previewQuestions.length && saveExam()} className="bg-green-600 text-white px-3 py-1 rounded" disabled={saving}>{saving ? "Saving..." : "Save Exam"}</button>
              </div>
            </div>

            <div className="space-y-3">
              {previewQuestions.map((q, i) => (
                <QuestionEditor
                  key={q.id}
                  q={q}
                  index={i}
                  onChangeQuestion={changeQuestionText}
                  onChangeOption={changeOptionText}
                  onSetAnswer={setAnswer}
                  onRemove={removeQuestion}
                  onShuffle={shuffleOptions}
                />
              ))}
            </div>
          </div>
        )}
      </motion.form>

      {/* saved exams */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Saved Exams</h3>
          <div className="text-sm text-gray-500">{loadingExams ? "Loading..." : `${exams.length} exams`}</div>
        </div>

        <div className="space-y-4">
          {exams.length === 0 && !loadingExams && <div className="text-center text-gray-500 py-6">No exams yet. Create one above.</div>}
          {exams.map((exam, i) => (
            <motion.div key={exam._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .03 }} className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{exam.title} <span className="text-sm text-gray-500">({exam.subject})</span></h4>
                  <p className="text-sm text-gray-600">{exam.questions} questions • {exam.time} mins • {exam.difficulty}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setExams((prev) => prev.map((e) => e._id === exam._id ? { ...e, collapsed: !e.collapsed } : e))} className="bg-gray-200 px-3 py-1 rounded">{exam.collapsed ? "Show" : "Hide"}</button>
                  <button onClick={() => deleteExam(exam._id)} className="text-red-500">Delete</button>
                </div>
              </div>

              <AnimatePresence>
                {!exam.collapsed && Array.isArray(exam.generatedQuestions) && exam.generatedQuestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: .25 }} className="mt-3 border-t pt-3 space-y-2">
                    {exam.generatedQuestions.map((q, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded border">
                        <p className="font-medium">{idx + 1}. {q.question}</p>
                        <p className="text-sm text-gray-600 mt-1">Answer: {q.answer}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exams;
