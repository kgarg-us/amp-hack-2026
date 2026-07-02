import PromptForm from "@/components/PromptForm";

export default async function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">AMP Hack 2026</p>
        <h1>GPT Console</h1>
        <p>
          Server-rendered Next.js frontend connected to a Python FastAPI backend
          that invokes your configured OpenAI model.
        </p>
      </section>
      <PromptForm apiBaseUrl={apiBaseUrl} />
    </main>
  );
}
