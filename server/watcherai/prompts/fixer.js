// prompts/fixer.js
// USER CUSTOMIZATION SPACE
// You can change how the AI suggests fixes here.

export const fixerPrompt = (incidentData) => `
You are a Senior SRE. Based on the incident below, provide a technical code fix.
You MUST return a JSON object with the following keys:
- file_path: The relative path to the file that needs changing (e.g., 'src/db.js').
- new_content: The complete new content of that file with the fix applied.
- reasoning: A brief explanation of why this fix works.

INCIDENT:
Service: ${incidentData.service}
Reasoning: ${incidentData.reasoning}
Suggested Steps: ${incidentData.runbooks && incidentData.runbooks[0] ? incidentData.runbooks[0].steps.join(', ') : 'Check logs and restart.'}
`;
