import axios from "axios";
import { faqs, mockAnswers, onboardingPlan } from "../data/mockData";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generatePlan(profile) {
  await wait(850);

  const personalizedPlan = onboardingPlan.map((day) => ({
    ...day,
    title:
      day.id === "monday"
        ? `Welcome ${profile.name || "there"} to ${profile.team || "your team"}`
        : day.title,
    summary: `${profile.role || "New hire"} focus: build context, confidence, and momentum.`,
  }));

  return Promise.resolve({
    profile,
    plan: personalizedPlan,
  });
}

export async function askQuestion(question) {
  await wait(650);
  const normalizedQuestion = question.trim().toLowerCase();
  const answer =
    mockAnswers[normalizedQuestion] ||
    "Great question. I would route this to your onboarding buddy first, then your manager if it affects priorities, access, or team-specific expectations.";

  return Promise.resolve({
    question,
    answer,
  });
}

export async function getFAQs() {
  await wait(250);
  return Promise.resolve(faqs);
}

export { apiClient };
