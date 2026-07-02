import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, Send, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { getAllFAQs, rankFAQs } from "../../services/api";
import { normalizeWhitespace } from "../../utils/text";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I'm J.A.R.V.I.S. Ask me anything about onboarding — leave, benefits, IT access, policies, or your team — and I'll answer from the new-hire FAQ.",
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [allFaqs, setAllFaqs] = useState([]);
  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState("");
  const [related, setRelated] = useState([]);
  const chatEndRef = useRef(null);

  // Load the 50 FAQs once, then search them entirely on the client (no LLM).
  useEffect(() => {
    getAllFAQs().then(setAllFaqs);
  }, []);

  // Default chips: one question per category as a compact starting point.
  const defaultChips = useMemo(() => {
    const seen = new Set();
    const picks = [];
    for (const item of allFaqs) {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        picks.push(item.question);
      }
    }
    return picks;
  }, [allFaqs]);

  // Live, local search over the FAQ as the user types.
  const suggestions = useMemo(() => {
    if (normalizeWhitespace(input).length < 2) return [];
    return rankFAQs(input, allFaqs, 5).map((item) => item.question);
  }, [input, allFaqs]);

  // While typing → live matches; after an answer → related questions;
  // otherwise → the default suggestion chips.
  const chips =
    suggestions.length > 0
      ? suggestions
      : related.length > 0
        ? related
        : defaultChips;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  function sendQuestion(question) {
    const clean = normalizeWhitespace(question);
    if (!clean || isReplying) return;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: clean },
    ]);
    setInput("");
    setError("");
    setIsReplying(true);

    // Answer from the FAQ via local search — no LLM/network call.
    const ranked = rankFAQs(clean, allFaqs, 5);
    const answerText = ranked.length
      ? ranked[0].answer
      : "I couldn't find that in the FAQ. Try rephrasing, or pick one of the suggested questions above.";

    // Surface a few related questions so the user can keep exploring the topic.
    setRelated(
      ranked
        .slice(1, 5)
        .map((item) => item.question)
    );

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", text: answerText },
      ]);
      setIsReplying(false);
    }, 200);
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(input);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-white bg-white p-5 shadow-card sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal">
          <Bot size={22} />
        </span>
        <div>
          <h2 className="text-xl font-black text-ink">FAQ Assistant</h2>
          <p className="text-sm text-slate-500">Instant answers from the New-Hire FAQ.</p>
        </div>
      </div>

      {suggestions.length > 0 || related.length > 0 ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          Related questions
        </p>
      ) : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {chips.map((faq) => (
          <button
            key={faq}
            type="button"
            onClick={() => sendQuestion(faq)}
            disabled={isReplying}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-ocean hover:bg-blue-50 hover:text-ocean disabled:opacity-60"
          >
            {faq}
          </button>
        ))}
      </div>

      <div className="scrollbar-soft mb-4 max-h-[360px] min-h-[280px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isReplying ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="animate-spin text-ocean" size={17} />
              Assistant is typing...
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question..."
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-ink transition placeholder:text-slate-400 focus:border-ocean focus:bg-white"
        />
        <button
          type="submit"
          disabled={isReplying || input.trim().length === 0}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ocean text-white shadow-card transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send question"
        >
          {isReplying ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
    </motion.section>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-ocean shadow-sm">
          <Bot size={16} />
        </span>
      ) : null}
      <div className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${isUser ? "bg-ocean text-white" : "bg-white text-slate-700"}`}>
        {message.text}
      </div>
      {isUser ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-slate-500 shadow-sm">
          <UserRound size={16} />
        </span>
      ) : null}
    </div>
  );
}
