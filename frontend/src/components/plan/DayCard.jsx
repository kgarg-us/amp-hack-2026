import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DayCard({ day, index }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-black text-ocean">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="font-black text-ink">{day.day}</p>
            <p className="truncate text-sm text-slate-500">{day.title}</p>
          </div>
        </div>
        <ChevronDown className={`shrink-0 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} size={20} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="border-t border-slate-100 px-4 py-4">
              {day.summary ? <p className="mb-4 text-sm font-semibold text-slate-500">{day.summary}</p> : null}
              <ul className="space-y-3">
                {day.tasks.map((task) => (
                  <li key={task} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-ocean focus:ring-ocean"
                      aria-label={task}
                    />
                    <span className="text-sm font-medium leading-6 text-slate-700">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
