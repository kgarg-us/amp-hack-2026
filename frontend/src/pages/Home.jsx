import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageSquareText, Sparkles } from "lucide-react";

const highlights = [
  "Personalized first-week plans",
  "Instant answers to 80+ FAQs",
  "Ask in your own words",
];

export default function Home() {
  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col justify-center"
      >
        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-ocean shadow-card">
          <Sparkles size={16} />
          J.A.R.V.I.S. · AI Onboarding Companion
        </span>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
          Help every new teammate feel ready before week two.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          J.A.R.V.I.S. is your Joining Assistant for Roles, Verification,
          Information, and Scheduling. It turns a new-hire profile into a focused
          first-week plan and answers common onboarding questions instantly.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ocean px-6 py-3 font-bold text-white shadow-card transition hover:bg-blue-700"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-white bg-white/80 p-4 text-sm font-semibold text-slate-700 shadow-card">
              <CheckCircle2 className="shrink-0 text-teal" size={18} />
              {item}
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="relative min-h-[500px] overflow-hidden rounded-lg bg-ink p-5 shadow-soft"
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.35),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.28),transparent_24rem)]" />
        <div className="relative flex h-full flex-col justify-between rounded-lg border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="rounded-lg bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">First Week Plan</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-teal">Generated</span>
            </div>
            {["Monday", "Tuesday", "Wednesday"].map((day, index) => (
              <div key={day} className="mb-3 rounded-lg border border-slate-100 p-4 last:mb-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-sm font-black text-ocean">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-ink">{day}</p>
                    <p className="text-sm text-slate-500">Context, setup, and team alignment</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-ocean">
                <MessageSquareText size={20} />
              </span>
              <div>
                <p className="font-bold text-ink">J.A.R.V.I.S.</p>
                <p className="text-sm text-slate-500">Ask about leave, policies, IT, and more.</p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Where can I find company policies?
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
