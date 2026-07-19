// prompts/triage.js
// USER CUSTOMIZATION SPACE
// You can change the "vibe" or specific instructions here.

export const triagePrompt = (input) => `
Analyze this incident payload and classify it.
Focus on identifying the service name and impact on users.
CRITICAL: For the "reasoning" field in your JSON response, you MUST extract the exact technical error message, stack trace snippet, or root cause from the payload (e.g., "ReferenceError: connectt is not defined" or "ECONNREFUSED"). 
Do NOT write a generic summary for the reasoning. The reasoning MUST contain the specific technical error to enable accurate historical searches.
`;
