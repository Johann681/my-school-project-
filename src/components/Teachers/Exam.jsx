// ===== File: src/components/Exams.jsx (Polished, modern, editable preview + generate)
// Replace your current Exams.jsx with this file. Uses Tailwind + Framer Motion.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- API base (safe) ---------- */
const API_BASE = (() => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE)
      return import.meta.env.VITE_API_BASE;
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE)
      return process.env.NEXT_PUBLIC_API_BASE;
    if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE)
      return process.env.REACT_APP_API_BASE;
  } catch {}
  return "https://my-school-project.onrender.com/api";
})();

/* ---------- Helpers ---------- */
const CATEGORY_OPTIONS = [
  "General Knowledge",
  "Books",
  "Film",
  "Music",
  "Science",
  "Computers",
  "Mathematics",
  "Mythology",
  "Sports",
  "Geography",
  "History",
  "Politics",
  "Art",
  "Celebrities",
  "Animals",
  "Vehicles",
  "Comics",
  "Gadgets",
  "Anime & Manga",
  "Cartoons",
];

const emptyQuestion = () => ({
  id: cryptoRandomId(),
  question: "",
  answer: "",
  options: ["", "", "", ""],
});
function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 9);
}

/* ---------- Small UI pieces ---------- */
const OptionInput = React.memo(function OptionInput({
  value,
  onChange,
  checked,
  onSelect,
  placeholder,
  name,
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4"
        aria-checked={checked}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-sky-300"
      />
    </div>
  );
});

const QuestionEditor = React.memo(function QuestionEditor({
  q,
  index,
  onChangeQuestion,
  onChangeOption,
  onSetAnswer,
  onRemove,
  onShuffle,
}) {
  const options = useMemo(() => {
    const o = Array.isArray(q.options) ? q.options.slice() : [];
    while (o.length < 4) o.push("");
    return o.slice(0, 4);
  }, [q.options]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-sky-600">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-600 font-medium">
              Question
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onShuffle(index)}
                className="text-sm text-gray-500 hover:underline"
              >
                Shuffle
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>

          <input
            value={q.question}
            onChange={(e) => onChangeQuestion(index, e.target.value)}
            className="w-full mt-2 border rounded px-3 py-2 focus:ring-2 focus:ring-sky-300"
            placeholder="Type the question here"
            aria-label={`Question ${index + 1}`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {options.map((opt, oi) => (
              <OptionInput
                key={oi}
                name={`q-${q.id}-opt`}
                value={opt}
                onChange={(val) => onChangeOption(index, oi, val)}
                checked={q.answer === opt && opt !== ""}
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

/* ---------- Main Exams component (modern polish) ---------- */
const Exams = ({ teacherName = "Teacher" }) => {
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);

  const [meta, setMeta] = useState({
    title: "",
    subject: "General Knowledge",
    difficulty: "Easy",
    questionsCount: 5,
    time: 60,
  });
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // message helper
  const showMessage = useCallback((msg, t = 3500) => {
    setGlobalMessage(msg);
    if (t) setTimeout(() => setGlobalMessage(null), t);
  }, []);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchJson = useCallback(async (url, opts = {}) => {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = {};
    }
    if (!res.ok) {
      const msg =
        data?.error || data?.message || res.statusText || "Request failed";
      const e = new Error(msg);
      e.responseData = data;
      throw e;
    }
    return data;
  }, []);

  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      // Expect your backend to expose GET /api/exams or root /api returning { exams: [] }
      const data = await fetchJson(`${API_BASE}/exams`);
      setExams((data.exams || []).map((e) => ({ ...e, collapsed: true })));
    } catch (err) {
      console.warn(
        "fetchExams failed, trying root /api fallback",
        err?.message
      );
      try {
        const data = await fetchJson(API_BASE);
        setExams((data.exams || []).map((e) => ({ ...e, collapsed: true })));
      } catch (e) {
        console.error(e);
        showMessage("Failed to load saved exams");
      }
    } finally {
      setLoadingExams(false);
    }
  }, [fetchJson, showMessage]);

  /* ---------- Generate preview (calls backend) ---------- */
  const generatePreview = useCallback(async () => {
    if (!meta.subject || !meta.questionsCount)
      return showMessage("Choose subject + number of questions");
    if (meta.questionsCount > 100)
      return showMessage("Please request 100 or fewer questions");

    setPreviewLoading(true);
    try {
      // CALL the backend route that generates questions
      const data = await fetchJson(`${API_BASE}/exams/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: meta.subject,
          questions: Number(meta.questionsCount),
          difficulty: meta.difficulty
        })
      });
      

      const q = (data.questions || []).map((qq) => ({
        id: cryptoRandomId(),
        question: qq.question || qq.text || "",
        answer: qq.answer || "",
        options: Array.isArray(qq.options)
          ? qq.options.slice()
          : ["", "", "", ""],
      }));
      while (q.length < Number(meta.questionsCount)) q.push(emptyQuestion());
      setPreviewQuestions(q);
      showMessage("Preview generated — edit before saving");
    } catch (err) {
      console.error("generatePreview error", err);
      showMessage(err.message || "Failed to generate preview");
    } finally {
      setPreviewLoading(false);
    }
  }, [
    meta.subject,
    meta.questionsCount,
    meta.difficulty,
    fetchJson,
    showMessage,
  ]);

  /* ---------- Preview helpers ---------- */
  const changeQuestionText = useCallback(
    (index, text) =>
      setPreviewQuestions((prev) =>
        prev.map((p, i) => (i === index ? { ...p, question: text } : p))
      ),
    []
  );
  const changeOptionText = useCallback(
    (qIndex, optIndex, value) =>
      setPreviewQuestions((prev) =>
        prev.map((p, i) =>
          i === qIndex
            ? {
                ...p,
                options: p.options.map((o, oi) =>
                  oi === optIndex ? value : o
                ),
              }
            : p
        )
      ),
    []
  );
  const setAnswer = useCallback(
    (qIndex, optionText) =>
      setPreviewQuestions((prev) =>
        prev.map((p, i) => (i === qIndex ? { ...p, answer: optionText } : p))
      ),
    []
  );
  const addQuestion = useCallback(
    () => setPreviewQuestions((p) => [...p, emptyQuestion()]),
    []
  );
  const removeQuestion = useCallback(
    (index) => setPreviewQuestions((p) => p.filter((_, i) => i !== index)),
    []
  );
  const shuffleOptions = useCallback(
    (index) =>
      setPreviewQuestions((prev) =>
        prev.map((p, i) => {
          if (i !== index) return p;
          const shuffled = (p.options || [])
            .slice()
            .sort(() => Math.random() - 0.5);
          return { ...p, options: shuffled };
        })
      ),
    []
  );

  /* ---------- Save exam ---------- */
  const saveExam = useCallback(async () => {
    if (!meta.title) return showMessage("Enter a title before saving");
    if (!previewQuestions.length) return showMessage("No questions to save");

    const payload = previewQuestions.map((q) => ({
      question: q.question || "",
      answer: q.answer || q.options?.[0] || "",
      options: (q.options || [])
        .slice(0, 4)
        .concat(Array(4).fill(""))
        .slice(0, 4),
    }));
    setSaving(true);
    try {
      const data = await fetchJson(`${API_BASE}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meta.title,
          subject: meta.subject,
          difficulty: meta.difficulty,
          time: Number(meta.time || 0),
          questions: payload,
          createdBy: teacherName,
        }),
      });
      setExams((prev) => [{ ...data.exam, collapsed: true }, ...prev]);
      setPreviewQuestions([]);
      setMeta((m) => ({ ...m, title: "" }));
      showMessage("Exam saved");
    } catch (err) {
      console.error("saveExam error", err);
      showMessage(err.message || "Failed to save exam");
    } finally {
      setSaving(false);
    }
  }, [meta, previewQuestions, fetchJson, showMessage, teacherName]);

  const deleteExam = useCallback(
    async (id) => {
      if (!window.confirm("Delete exam?")) return;
      try {
        await fetchJson(`${API_BASE}/exams/${id}`, { method: "DELETE" });
        setExams((prev) => prev.filter((e) => e._id !== id));
        showMessage("Exam deleted");
      } catch (err) {
        console.error(err);
        showMessage(err.message || "Failed to delete exam");
      }
    },
    [fetchJson, showMessage]
  );

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: control panel */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white p-6 rounded-2xl shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">Create Exam</h3>
            <p className="text-sm text-gray-500 mt-1">
              Quickly generate a draft then edit before saving.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm text-gray-600">Title</label>
              <input
                value={meta.title}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, title: e.target.value }))
                }
                placeholder="Exam title (required to save)"
                className="w-full border rounded px-3 py-2"
              />

              <label className="block text-sm text-gray-600">Subject</label>
              <select
                value={meta.subject}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, subject: e.target.value }))
                }
                className="w-full border rounded px-3 py-2"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-600">
                    Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={meta.questionsCount}
                    onChange={(e) =>
                      setMeta((m) => ({
                        ...m,
                        questionsCount: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Time (mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={meta.time}
                    onChange={(e) =>
                      setMeta((m) => ({ ...m, time: Number(e.target.value) }))
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <label className="block text-sm text-gray-600">Difficulty</label>
              <select
                value={meta.difficulty}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, difficulty: e.target.value }))
                }
                className="w-full border rounded px-3 py-2"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={generatePreview}
                  className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg shadow hover:bg-sky-700 disabled:opacity-60"
                  disabled={previewLoading}
                >
                  {previewLoading ? "Generating..." : "Generate Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewQuestions([]);
                    setMeta((m) => ({ ...m, title: "" }));
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Reset
                </button>
              </div>

              {globalMessage && (
                <div className="mt-3 text-sm text-sky-600">{globalMessage}</div>
              )}
            </div>
          </motion.div>

          {/* Middle + Right: preview & saved */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-1 border rounded"
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => previewQuestions.length && saveExam()}
                    className="px-3 py-1 bg-emerald-600 text-white rounded"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Exam"}
                  </button>
                </div>
              </div>

              {previewLoading && (
                <div className="mt-4 text-sm text-gray-500">Generating…</div>
              )}

              {previewQuestions.length === 0 && !previewLoading && (
                <div className="mt-6 text-center text-gray-400">
                  No preview. Generate questions to start.
                </div>
              )}

              <div className="mt-4 space-y-3">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Saved Exams</h3>
                <div className="text-sm text-gray-500">
                  {loadingExams ? "Loading..." : `${exams.length} exams`}
                </div>
              </div>

              <div className="space-y-3">
                {exams.length === 0 && !loadingExams && (
                  <div className="text-center text-gray-400 py-6">
                    No saved exams — save one from the preview above.
                  </div>
                )}
                {exams.map((exam, idx) => (
                  <div
                    key={exam._id || idx}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {exam.title}{" "}
                          <span className="text-sm text-gray-500">
                            ({exam.subject})
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {
                            (exam.questions || exam.generatedQuestions || [])
                              .length
                          }{" "}
                          questions • {exam.time} mins • {exam.difficulty}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setExams((prev) =>
                              prev.map((e) =>
                                e._id === exam._id
                                  ? { ...e, collapsed: !e.collapsed }
                                  : e
                              )
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          {exam.collapsed ? "Show" : "Hide"}
                        </button>
                        <button
                          onClick={() => deleteExam(exam._id)}
                          className="px-2 py-1 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {!exam.collapsed &&
                      Array.isArray(exam.generatedQuestions) &&
                      exam.generatedQuestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {exam.generatedQuestions.map((q, i2) => (
                            <div
                              key={i2}
                              className="p-3 bg-white border rounded"
                            >
                              <div className="font-medium">
                                {i2 + 1}. {q.question}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Answer: {q.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;
