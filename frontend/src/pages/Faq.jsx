import { useEffect } from "react";
import { motion } from "framer-motion";
import AIAssistant from "../components/assistant/AIAssistant";
import FaqBrowser from "../components/faq/FaqBrowser";

export default function Faq() {
  useEffect(() => {
    document.title = "FAQ | J.A.R.V.I.S.";
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-bold uppercase tracking-normal text-ocean">FAQ</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
          New-hire questions, answered
        </h1>
        <p className="mt-3 text-slate-600">
          Search the 50 most common onboarding questions or tap a suggestion.
          Answers are instant — no profile or sign-in needed.
        </p>
      </motion.div>

      <div className="space-y-6">
        <AIAssistant />
        <FaqBrowser />
      </div>
    </main>
  );
}
