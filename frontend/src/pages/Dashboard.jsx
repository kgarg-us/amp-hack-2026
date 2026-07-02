import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generatePlan } from "../services/api";
import { onboardingPlan } from "../data/mockData";
import AIAssistant from "../components/assistant/AIAssistant";
import ProfileForm from "../components/profile/ProfileForm";
import PlanPanel from "../components/plan/PlanPanel";

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
