import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, Loader2, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeWhitespace } from "../../utils/text";

// Fixed options for Ampcus new-hire profiles.
const ROLE_OPTIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Solutions Architect",
  "Data Analyst",
  "Business Analyst",
  "Project Manager",
  "QA Engineer",
  "DevOps Engineer",
  "UX/UI Designer",
  "Cybersecurity Analyst",
];

const TEAM_OPTIONS = [
  "FRB (Federal Reserve Bank)",
  "Federal & Public Sector",
  "Commercial Solutions",
  "Cybersecurity",
  "Cloud & Infrastructure",
  "Data & Analytics",
  "Healthcare IT",
  "Managed Services",
  "Talent Solutions",
  "Corporate IT",
];

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

  // Start date can only be today or later.
  const today = new Date().toISOString().slice(0, 10);

  // Clean up free-text fields at submit time (not per keystroke, so typing
  // spaces still works) before generating the plan.
  const handleGenerate = (values) =>
    onGenerate({
      ...values,
      name: normalizeWhitespace(values.name),
      skills: normalizeWhitespace(values.skills),
    });

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

      <form className="space-y-4" onSubmit={handleSubmit(handleGenerate)}>
        <TextField
          label="Name"
          placeholder="Avery Patel"
          error={errors.name?.message}
          registration={register("name", { required: "Name is required" })}
        />

        <SelectField
          label="Role"
          placeholder="Select a role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          registration={register("role", { required: "Role is required" })}
        />

        <SelectField
          label="Team"
          placeholder="Select a team"
          options={TEAM_OPTIONS}
          error={errors.team?.message}
          registration={register("team", { required: "Team is required" })}
        />

        <TextField
          label="Start Date"
          type="date"
          min={today}
          icon={<CalendarDays size={17} />}
          error={errors.startDate?.message}
          registration={register("startDate", {
            required: "Start date is required",
            validate: (value) =>
              !value || value >= today || "Start date must be today or later",
          })}
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

function TextField({ label, registration, error, icon, type = "text", placeholder = "", min }) {
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
          min={min}
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

function SelectField({ label, registration, error, options, placeholder = "Select an option" }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        defaultValue=""
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-ink transition focus:border-ocean focus:bg-white"
        {...registration}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
