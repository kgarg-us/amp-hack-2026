import axios from "axios";
import { faqs } from "../data/mockData";
import { normalizeWhitespace } from "../utils/text";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function generatePlan(profile) {
  const response = await apiClient.post("/api/generate", {
    prompt: buildPlanPrompt(profile),
  });

  const plan = parsePlanResponse(response.data.output_text);

  return {
    profile,
    plan,
    model: response.data.model,
  };
}

export async function askQuestion(question) {
  const response = await apiClient.post("/api/generate", {
    prompt: buildChatPrompt(question),
  });

  return {
    question,
    answer: response.data.output_text,
    model: response.data.model,
  };
}

// Load the full FAQ ({ id, category, question, answer }) from the backend so the
// UI can search it locally. Falls back to the mock questions if the API is down.
export async function getAllFAQs() {
  try {
    const response = await apiClient.get("/api/faq");
    const categories = response.data.categories || [];
    const items = categories.flatMap((category) =>
      (category.items || []).map((item) => ({
        id: item.id,
        category: category.category,
        question: item.question,
        answer: item.answer,
      }))
    );
    if (items.length > 0) return items;
  } catch {
    // fall through to the mock list below
  }
  return faqs.map((question, index) => ({
    id: index,
    category: "",
    question,
    answer: "",
  }));
}

// Common words that carry little meaning for matching (incl. FAQ question words).
const STOPWORDS = new Set([
  "the", "and", "for", "are", "can", "you", "your", "that", "this", "with",
  "how", "what", "when", "who", "where", "does", "did", "from", "into", "out",
  "have", "has", "had", "will", "would", "should", "about", "an", "my", "me",
  "is", "it", "to", "of", "do", "in", "on", "or", "as", "at", "be", "a", "i",
]);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (token) => token.length > 1 && !STOPWORDS.has(token)
  );
}

// Local, no-LLM ranking over the FAQ items. Scores whole-word overlap across the
// question (weighted highest), category, and answer — with a longer-term
// substring fallback and a phrase-match boost — so related topics surface
// without a network/LLM call. Whole-word matching avoids false hits like
// "off" matching "offer".
export function rankFAQs(query, items, limit = 5) {
  const cleanQuery = normalizeWhitespace(query);
  const terms = [...new Set(tokenize(cleanQuery))];
  if (terms.length === 0) return [];

  const phrase = cleanQuery.toLowerCase();

  return items
    .map((item) => {
      const questionWords = new Set(tokenize(item.question));
      const categoryWords = new Set(tokenize(item.category || ""));
      const answerWords = new Set(tokenize(item.answer || ""));
      const questionText = item.question.toLowerCase();
      const answerText = (item.answer || "").toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (questionWords.has(term)) score += 3;
        else if (term.length >= 5 && questionText.includes(term)) score += 1.5;

        if (categoryWords.has(term)) score += 2;

        if (answerWords.has(term)) score += 1;
        else if (term.length >= 5 && answerText.includes(term)) score += 0.5;
      }
      if (phrase.length > 2 && questionText.includes(phrase)) score += 4;

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

function buildPlanPrompt(profile) {
  return `
You are an AI Employee Onboarding Companion.
Create a personalized first-week onboarding plan for this employee:

Name: ${normalizeWhitespace(profile.name)}
Role: ${normalizeWhitespace(profile.role)}
Team: ${normalizeWhitespace(profile.team)}
Start Date: ${normalizeWhitespace(profile.startDate)}
Skills: ${normalizeWhitespace(profile.skills)}

Return ONLY valid JSON. Do not include markdown fences or prose.
The JSON must be an array of exactly five objects for Monday through Friday.
Each object must use this shape:
{
  "id": "monday",
  "day": "Monday",
  "title": "Short day title",
  "summary": "One sentence personalized summary.",
  "tasks": ["Checklist task 1", "Checklist task 2", "Checklist task 3", "Checklist task 4"]
}
`.trim();
}

function buildChatPrompt(question) {
  return `
You are an AI assistant for a new employee onboarding companion.
Answer the employee's question clearly and briefly in 2-4 sentences.
If the question requires company-specific information you do not have, explain the likely next step and who to ask.

Question: ${question}
`.trim();
}

function parsePlanResponse(outputText) {
  const jsonText = extractJson(outputText);
  const parsed = JSON.parse(jsonText);

  if (!Array.isArray(parsed)) {
    throw new Error("Backend returned a plan response that was not a JSON array.");
  }

  return parsed.map((day, index) => ({
    id: day.id || day.day?.toLowerCase() || `day-${index + 1}`,
    day: day.day || `Day ${index + 1}`,
    title: day.title || "Onboarding focus",
    summary: day.summary || "",
    tasks: Array.isArray(day.tasks) ? day.tasks : [],
  }));
}

function extractJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) return fencedMatch[1].trim();

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1);
  }

  return trimmed;
}

export { apiClient };
