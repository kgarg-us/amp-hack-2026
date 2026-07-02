import { Loader2, RefreshCw, WandSparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DayCard from "./DayCard";

export default function PlanPanel({ plan, profile, isGenerating, profileChanged, onRegenerate }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="rounded-lg border border-white bg-white p-5 shadow-card sm:p-6"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-ink">Generated First Week Plan</h2>
          <p className="mt-1 text-sm text-slate-500">
            {profile ? `${profile.name} - ${profile.role} in ${profile.team}` : "Your personalized plan will appear here."}
          </p>
        </div>

        {profileChanged ? (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Regenerate Plan
          </button>
        ) : null}
      </div>

      {profileChanged ? (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Profile updated. Regenerate plan.
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center"
          >
            <div>
              <Loader2 className="mx-auto mb-4 animate-spin text-ocean" size={34} />
              <p className="font-bold text-ink">Generating a personalized first week...</p>
              <p className="mt-1 text-sm text-slate-500">Mock API response is preparing the plan.</p>
            </div>
          </motion.div>
        ) : plan.length > 0 ? (
          <motion.div
            key="plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {plan.map((day, index) => (
              <DayCard key={day.id} day={day} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center"
          >
            <div>
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-ocean">
                <WandSparkles size={24} />
              </span>
              <p className="font-bold text-ink">No plan generated yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Fill out the profile form and generate a Monday-Friday onboarding plan.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
