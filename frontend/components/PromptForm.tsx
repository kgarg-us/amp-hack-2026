"use client";

import { FormEvent, useState } from "react";

type PromptFormProps = {
  apiBaseUrl: string;
};

type GenerateResponse = {
  model: string;
  output_text: string;
};

export default function PromptForm({ apiBaseUrl }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setResult(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="console">
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask the configured model anything..."
          rows={8}
          required
        />
        <button type="submit" disabled={isLoading || prompt.trim().length === 0}>
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </form>

      <div className="result" aria-live="polite">
        {error ? <p className="error">{error}</p> : null}
        {result ? (
          <>
            <p className="model">Model: {result.model}</p>
            <pre>{result.output_text}</pre>
          </>
        ) : (
          <p className="placeholder">Model output will appear here.</p>
        )}
      </div>
    </section>
  );
}
