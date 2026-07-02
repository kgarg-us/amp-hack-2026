// Collapse any run of whitespace (spaces, tabs, newlines) to a single space and
// trim the ends. Guards search and prompts against messy user input.
export function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}
