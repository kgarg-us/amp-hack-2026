import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { askQuestion, getFAQs, searchFAQs } from "../../services/api";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I can help with onboarding questions about leave, policies, access, and team logistics.",
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [faqs, setFaqs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    getFAQs().then(setFaqs);
  }, []);

  // Semantic search: as the user types, surface related FAQ questions (by
  // meaning, not keywords). Debounced; falls back silently to the default chips.
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchFAQs(trimmed, 5).then((hits) =>
        setSuggestions(hits.map((hit) => hit.question))
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [input]);

  // Show semantic matches while typing, otherwise the default suggestion chips.
  const chips = suggestions.length > 0 ? suggestions : faqs;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  async function sendQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed || isReplying) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsReplying(true);
    setError("");

    try {
      const response = await askQuestion(trimmed);

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: response.answer,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          "Unable to get an answer from the backend."
      );
    } finally {
      setIsReplying(false);
    }
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
          <h2 className="text-xl font-black text-ink">AI Assistant</h2>
          <p className="text-sm text-slate-500">Connected to the backend AI endpoint.</p>
        </div>
      </div>

      {suggestions.length > 0 ? (
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
