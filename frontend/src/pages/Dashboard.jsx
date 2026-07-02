import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generatePlan } from "../services/api";
import { onboardingPlan } from "../data/mockData";
import AIAssistant from "../components/assistant/AIAssistant";
import ProfileForm from "../components/profile/ProfileForm";
import PlanPanel from "../components/plan/PlanPanel";

const howItWorks = [
  { title: "Add a profile", desc: "Enter the new hire's role, team, and start date." },
  { title: "Generate a plan", desc: "Get a tailored Monday–Friday first-week plan." },
  { title: "Ask J.A.R.V.I.S.", desc: "Search 80+ FAQs for instant answers." },
];

const emptyProfile = {
  name: "",
  role: "",
  team: "",
  startDate: "",
  skills: "",
};

export default function Dashboard() {
  const [profile, setProfile] = useState(emptyProfile);
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [plan, setPlan] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const profileChanged = useMemo(() => {
    if (!generatedProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(generatedProfile);
  }, [generatedProfile, profile]);

  useEffect(() => {
    document.title = "Dashboard | J.A.R.V.I.S.";
  }, []);

  const handleGenerate = useCallback(async (values) => {
    setIsGenerating(true);
    setGenerationError("");

    try {
      const response = await generatePlan(values);
      setProfile(values);
      setGeneratedProfile(values);
      setPlan(response.plan);
      setUsedFallback(false);
    } catch {
      // Live AI is unavailable (e.g. no API credits) — show a sample plan so
      // the product stays usable and demoable instead of erroring out.
      setProfile(values);
      setGeneratedProfile(values);
      setPlan(onboardingPlan);
      setUsedFallback(true);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleProfileChange = useCallback((values) => {
    setProfile(values);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-bold uppercase tracking-normal text-ocean">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Build a first-week onboarding plan</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Capture the new hire profile, generate a five-day plan, then use the assistant for quick onboarding questions.
        </p>
      </motion.div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {howItWorks.map((step, index) => (
          <div
            key={step.title}
            className="flex items-start gap-3 rounded-lg border border-white bg-white/80 p-4 shadow-card"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-black text-ocean">
              {index + 1}
            </span>
            <div>
              <p className="font-bold text-ink">{step.title}</p>
              <p className="text-sm text-slate-500">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <ProfileForm
          defaultValues={emptyProfile}
          isGenerating={isGenerating}
          profileChanged={profileChanged}
          hasGenerated={plan.length > 0}
          onGenerate={handleGenerate}
          onProfileChange={handleProfileChange}
        />

        <section className="space-y-6">
          <PlanPanel
            plan={plan}
            profile={generatedProfile}
            isGenerating={isGenerating}
            error={generationError}
            notice={
              usedFallback
                ? "Live AI generation is unavailable right now — showing a sample first-week plan you can still customize."
                : ""
            }
            profileChanged={profileChanged}
            onRegenerate={() => handleGenerate(profile)}
          />
          <AIAssistant />
        </section>
      </div>
    </main>
  );
}
