import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, Loader2, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileForm({
  defaultValues,
  isGenerating,
  profileChanged,
  hasGenerated,
  onGenerate,
  onProfileChange,
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    const subscription = watch((values) => {
      onProfileChange(values);
    });

    return () => subscription.unsubscribe();
  }, [onProfileChange, watch]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-lg border border-white bg-white p-5 shadow-card sm:p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-ocean">
          <UserRound size={22} />
        </span>
        <div>
          <h2 className="text-xl font-black text-ink">User Profile</h2>
          <p className="text-sm text-slate-500">Details used to tailor the onboarding plan.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onGenerate)}>
        <TextField
          label="Name"
          placeholder="Avery Patel"
          error={errors.name?.message}
          registration={register("name", { required: "Name is required" })}
        />

        <TextField
          label="Role"
          placeholder="Product Analyst"
          error={errors.role?.message}
          registration={register("role", { required: "Role is required" })}
        />

        <TextField
          label="Team"
          placeholder="Growth"
          error={errors.team?.message}
          registration={register("team", { required: "Team is required" })}
        />

        <TextField
          label="Start Date"
          type="date"
          icon={<CalendarDays size={17} />}
          error={errors.startDate?.message}
          registration={register("startDate", { required: "Start date is required" })}
        />

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="skills">
            Skills
          </label>
          <textarea
            id="skills"
            rows={5}
            placeholder="SQL, dashboards, user research, experimentation"
            className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-ink transition placeholder:text-slate-400 focus:border-ocean focus:bg-white"
            {...register("skills", { required: "Skills are required" })}
          />
          {errors.skills ? <p className="mt-2 text-sm font-semibold text-red-600">{errors.skills.message}</p> : null}
        </div>

        {profileChanged ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Profile updated. Regenerate plan.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ocean px-5 py-3 font-bold text-white shadow-card transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : hasGenerated ? <RefreshCw size={18} /> : <Sparkles size={18} />}
          {isGenerating ? "Generating Plan..." : hasGenerated ? "Regenerate Plan" : "Generate Plan"}
        </button>
      </form>
    </motion.section>
  );
}

function TextField({ label, registration, error, icon, type = "text", placeholder = "" }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {icon ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span> : null}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-ink transition placeholder:text-slate-400 focus:border-ocean focus:bg-white ${
            icon ? "pl-10" : ""
          }`}
          {...registration}
        />
      </div>
      {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
