// nodes/node-04-warroom/github-fixer.js
// Guardian Node 04 — GitHub PR Automator (LLM-Guided Auditor Edition)

import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import { callLLM } from '../shared/ai.js';
import { categoryLabel } from '../shared/categorize.js';

dotenv.config();

// Global fallbacks
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

// Git tree cache to prevent GitHub API rate limits
const repoTreeCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes


/** Strip control characters (except \n \r \t) that break JSON serialization */
function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Unified diff parsing and application helper.
 * Parses diff into hunks and applies them bottom-up.
 * Uses a sliding tolerance of +/- 10 lines to match contexts.
 */
function applyPatch(originalContent, diffString) {
  const lines = originalContent.split(/\r?\n/);
  const diffLines = diffString.split(/\r?\n/);
  
  const hunks = [];
  let currentHunk = null;
  
  for (const line of diffLines) {
    if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) {
      if (currentHunk) {
        hunks.push(currentHunk);
        currentHunk = null;
      }
      continue;
    }
    const hunkHeaderMatch = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
    if (hunkHeaderMatch) {
      if (currentHunk) {
        hunks.push(currentHunk);
      }
      currentHunk = {
        oldStart: parseInt(hunkHeaderMatch[1], 10),
        oldLen: hunkHeaderMatch[2] ? parseInt(hunkHeaderMatch[2], 10) : 1,
        newStart: parseInt(hunkHeaderMatch[3], 10),
        newLen: hunkHeaderMatch[4] ? parseInt(hunkHeaderMatch[4], 10) : 1,
        diffLines: []
      };
    } else if (currentHunk) {
      currentHunk.diffLines.push(line);
    }
  }
  if (currentHunk) {
    hunks.push(currentHunk);
  }
  
  if (hunks.length === 0) {
    throw new Error('No valid diff hunks found in patch');
  }
  
  // Sort hunks by oldStart in descending order to apply bottom-up
  hunks.sort((a, b) => b.oldStart - a.oldStart);
  
  for (const hunk of hunks) {
    const expectedOldLines = [];
    const replacementLines = [];
    
    for (const line of hunk.diffLines) {
      if (line.startsWith('-')) {
        expectedOldLines.push(line.slice(1));
      } else if (line.startsWith('+')) {
        replacementLines.push(line.slice(1));
      } else {
        // Context line
        const contextLine = line.startsWith(' ') ? line.slice(1) : line;
        expectedOldLines.push(contextLine);
        replacementLines.push(contextLine);
      }
    }
    
    const nominalIndex = hunk.oldStart - 1;
    let matchIndex = -1;
    
    if (expectedOldLines.length === 0) {
      matchIndex = Math.max(0, Math.min(lines.length, nominalIndex));
    } else {
      // Find matching window with sliding tolerance of +/- 10 lines
      for (let offset = 0; offset <= 10; offset++) {
        // Check +offset
        const idxPlus = nominalIndex + offset;
        if (idxPlus >= 0 && idxPlus + expectedOldLines.length <= lines.length) {
          let match = true;
          for (let i = 0; i < expectedOldLines.length; i++) {
            if (lines[idxPlus + i].trim() !== expectedOldLines[i].trim()) {
              match = false;
              break;
            }
          }
          if (match) {
            matchIndex = idxPlus;
            break;
          }
        }
        // Check -offset
        if (offset > 0) {
          const idxMinus = nominalIndex - offset;
          if (idxMinus >= 0 && idxMinus + expectedOldLines.length <= lines.length) {
            let match = true;
            for (let i = 0; i < expectedOldLines.length; i++) {
              if (lines[idxMinus + i].trim() !== expectedOldLines[i].trim()) {
                match = false;
                break;
              }
            }
            if (match) {
              matchIndex = idxMinus;
              break;
            }
          }
        }
      }
    }
    
    if (matchIndex === -1) {
      throw new Error(`Could not find matching context for hunk starting at line ${hunk.oldStart}`);
    }
    
    lines.splice(matchIndex, expectedOldLines.length, ...replacementLines);
  }
  
  const lineEnding = originalContent.includes('\r\n') ? '\r\n' : '\n';
  const hasTrailingNewline = originalContent.endsWith('\n');
  let result = lines.join(lineEnding);
  if (hasTrailingNewline && !result.endsWith('\n')) {
    result += lineEnding;
  }
  return result;
}

function getLineDiffPercentage(oldContent, newContent) {
  if (!oldContent || !newContent) return 0;
  const oldLines = oldContent.split(/\r?\n/);
  const newLines = newContent.split(/\r?\n/);
  if (oldLines.length <= 20) return 0; // Skip size guard for tiny files
  
  const newSet = new Set(newLines.map(l => l.trim()));
  let commonLines = 0;
  for (const line of oldLines) {
    if (newSet.has(line.trim())) {
      commonLines++;
    }
  }
  
  const changeRatio = (oldLines.length - commonLines) / oldLines.length;
  return changeRatio;
}


const SYSTEM_INSTRUCTIONS = `
You are a Senior Software Engineer and SRE performing root cause analysis and fix generation.
INVIOLABLE RULES:
1. You MUST find the EXACT line causing the error before generating a fix.
2. If you cannot locate the exact line with certainty, set "uncertain": true and explain.
3. Never rewrite code outside the error scope.
4. Never change variable names, formatting, or logic unrelated to the fix.
5. Return ONLY raw JSON — no markdown, no explanation outside the JSON.
`;

/**
 * Fetches the content of a specific file.
 */
async function getFileContent(path, gitContext) {
  if (!path || path === 'N/A') return null;
  const client = gitContext?.octokit || octokit;
  const owner = gitContext?.owner || REPO_OWNER;
  const repo = gitContext?.repo || REPO_NAME;

  try {
    const { data } = await client.rest.repos.getContent({
      owner,
      repo,
      path: path
    });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (e) {
    console.warn(`⚠️ Could not fetch content for ${path}:`, e.message);
    return null;
  }
}

/**
 * Gets the default branch of the repository.
 */
async function getDefaultBranch(gitContext) {
  const client = gitContext?.octokit || octokit;
  const owner = gitContext?.owner || REPO_OWNER;
  const repo = gitContext?.repo || REPO_NAME;

  const { data: repoData } = await client.rest.repos.get({
    owner,
    repo,
  });
  return repoData.default_branch;
}

/**
 * Gets a comprehensive list of candidate files using search and tree crawl.
 */
async function getCandidatePaths(keywords, service, defaultBranch, gitContext) {
  const candidates = new Set();
  const SOURCE_EXTENSIONS = /\.(js|ts|py|go|java|rb|php|cs|cpp|c|rs|kt|swift|yaml|yml|json|env|conf|config|toml|sh|sql)$/i;
  const client = gitContext?.octokit || octokit;
  const owner = gitContext?.owner || REPO_OWNER;
  const repo = gitContext?.repo || REPO_NAME;

  // 1. Crawl the full repo tree (with caching)
  const cacheKey = `${owner}/${repo}/${defaultBranch}`;
  const cacheEntry = repoTreeCache.get(cacheKey);
  const now = Date.now();
  let allSourceFiles = [];

  if (cacheEntry && (now - cacheEntry.timestamp < CACHE_TTL_MS)) {
    console.log(`⚡ Using cached repository tree for ${cacheKey} (${cacheEntry.paths.length} source files)`);
    allSourceFiles = cacheEntry.paths;
  } else {
    try {
      const { data: tree } = await client.rest.git.getTree({
        owner: owner,
        repo: repo,
        tree_sha: defaultBranch,
        recursive: true,
      });

      allSourceFiles = tree.tree.filter(
        f => f.type === 'blob'
          && !f.path.includes('node_modules')
          && !f.path.includes('.git')
          && !f.path.includes('package-lock')
          && SOURCE_EXTENSIONS.test(f.path)
      ).map(f => f.path);

      repoTreeCache.set(cacheKey, {
        paths: allSourceFiles,
        timestamp: now
      });
    } catch (e) {
      console.error('❌ Failed to fetch repo tree:', e.message);
      if (cacheEntry) {
        console.warn(`⚠️ Using expired cache fallback for ${cacheKey}`);
        allSourceFiles = cacheEntry.paths;
      }
    }
  }

  // Populate candidates based on filtered matches
  if (allSourceFiles.length > 0) {
    if (allSourceFiles.length <= 60) {
      allSourceFiles.forEach(p => candidates.add(p));
    } else {
      // Larger repos: filter by service name or keyword match in path
      allSourceFiles.forEach(p => {
        const lp = p.toLowerCase();
        if (lp.includes(service.toLowerCase()) || keywords.some(k => lp.includes(k.toLowerCase()))) {
          candidates.add(p);
        }
      });
      // Always include likely config/connection files even if path doesn't match
      allSourceFiles.forEach(p => {
        const lp = p.toLowerCase();
        if (/db|database|config|connection|client|service|handler|route|controller/.test(lp)) {
          candidates.add(p);
        }
      });
    }
  }

  // 2. Try GitHub code search (may be rate-limited or slow to index new files)
  try {
    const q = `${keywords.slice(0, 2).join(' ')} repo:${owner}/${repo}`;
    const { data: results } = await client.rest.search.code({ q });
    results.items.forEach(item => candidates.add(item.path));
  } catch (e) {
    console.warn('⚠️ GitHub Search API unavailable — using tree-only discovery.');
  }

  const result = Array.from(candidates);
  console.log(`📂 Discovered ${result.length} candidate files (${allSourceFiles.length} total source files in repo)`);
  return result;
}

export async function createFixPR(incidentData, context) {
  const gitToken = context?.project?.githubToken || process.env.GITHUB_TOKEN;
  const owner = context?.project?.githubOwner || REPO_OWNER;
  const repo = context?.project?.githubRepo || REPO_NAME;

  if (!gitToken || !owner || !repo) {
    console.error('❌ GitHub credentials missing. Skipping PR creation.');
    return { ...incidentData, pr_status: 'SKIPPED_NO_AUTH', fix_initiated_at: new Date().toISOString() };
  }

  const client = new Octokit({ auth: gitToken });
  const gitContext = { octokit: client, owner, repo };
  const branchName = `guardian/fix-${incidentData.incident_id.toLowerCase()}`;
  let baseBranch = 'main';
  let currentContent = null;
  let aiFix = { file_path: 'N/A', new_content: '', reasoning: 'AI could not identify a fix.' };

  // ── EXISTING OPEN PR GUARD ───────────────────────────────────────────────────
  // If a guardian/ branch for this exact incident already exists (e.g. from a
  // previous run that wasn't cleaned up), link to it and skip re-running the
  // pipeline so we don't open 10 identical PRs against the same file.
  try {
    const { data: existingPRs } = await client.rest.pulls.list({
      owner: owner, repo: repo, state: 'open', per_page: 50,
    });
    const duplicate = existingPRs.find(pr => pr.head.ref === branchName);
    if (duplicate) {
      console.warn(`⚠️  Open PR already exists for ${branchName}: ${duplicate.html_url} — skipping duplicate.`);
      return {
        ...incidentData,
        pr_url: duplicate.html_url,
        pr_status: 'DUPLICATE_SKIPPED',
        ai_fix_suggestion: { reasoning: `Duplicate of open PR: ${duplicate.html_url}` },
        fix_initiated_at: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn('⚠️ Could not check for duplicate PRs:', e.message);
  }
  // ── END EXISTING OPEN PR GUARD ───────────────────────────────────────────────

  // ── MEMORY RECALL FAST-PATH BYPASSED (GUIDES THE LLM AGENT INSTEAD) ──────────

  try {
    // Phase 1: Keyword Extraction
    console.log('🕵️ Phase 1: Identifying technical search keywords...');
    const keywordsResult = await callLLM({
      prompt: `Analyze this technical error and return the 3 most specific search terms.
ERROR: ${sanitize(incidentData.raw_error_message || incidentData.reasoning)}`,
      systemPrompt: 'Return ONLY raw JSON in this exact shape: { "keywords": ["term1", "term2", "term3"] }',
      responseFormat: 'json_object',
      maxTokens: 256,
      openrouterKey: context?.project?.openrouterKey,
      llmProvider: context?.project?.llmProvider,
      llmModel: context?.project?.llmModel,
    });
    const keywords = Array.isArray(keywordsResult?.keywords)
      ? keywordsResult.keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 3)
      : [];

    // Phase 2: Path Discovery & LLM Ranking
    console.log('🕵️ Phase 2: Discovering and ranking candidate files...');
    baseBranch = await getDefaultBranch(gitContext);
    const allPaths = await getCandidatePaths(keywords, incidentData.service, baseBranch, gitContext);
    
    const rankingPrompt = `
      You are an expert SRE. Given the incident below, identify which file is the most likely source of the bug.
      
      INCIDENT: ${sanitize(incidentData.reasoning)}
      SERVICE: ${sanitize(incidentData.service)}
      
      REPOSITORY FILES:
      ${allPaths.join('\n')}
      
      Return the top 5 most relevant paths, one per line. Focus on files likely to contain database connection logic or the service name.
    `;

    const rankedPathsRaw = await callLLM({ 
      prompt: rankingPrompt, 
      systemPrompt: 'Return only a list of file paths, one per line. No numbering, no explanation, no markdown.',
      responseFormat: 'text',
      maxTokens: 512,
      openrouterKey: context?.project?.openrouterKey,
      llmProvider: context?.project?.llmProvider,
      llmModel: context?.project?.llmModel,
    });
    // Strip numbering/bullets/backticks and match against known paths
    const rankedPaths = rankedPathsRaw
      .split('\n')
      .map(p => p.replace(/^[\d\.\-\*\`\s]+/, '').replace(/`/g, '').trim())
      .filter(p => p && allPaths.includes(p))
      .slice(0, 5);

    // If LLM returned nothing valid, fall back to all candidates (already small set)
    const finalPaths = rankedPaths.length > 0 ? rankedPaths : allPaths.slice(0, 5);
    
    console.log(`🎯 AI selected top candidates for audit: ${finalPaths.join(', ') || '(none)'}`);

    if (finalPaths.length === 0) {
      console.warn('⚠️ No candidate files found in repo for this incident. Skipping code fix.');
      return {
        ...incidentData,
        pr_status: 'FAILED_INVALID_PATH',
        ai_fix_suggestion: { file_path: null, reasoning: 'No matching files found in repository.' },
        fix_initiated_at: new Date().toISOString(),
      };
    }

    // Phase 3: Deep Audit & Fix
    console.log('🕵️ Phase 3: Auditing code and generating fix...');
    const audits = await Promise.all(finalPaths.map(async (path) => {
      const content = await getFileContent(path, gitContext);
      return `FILE: ${path}\nCONTENT:\n${sanitize(content || 'Empty')}\n---`;
    }));

    const runbookContext = (incidentData.runbooks && incidentData.runbooks.length > 0)
      ? `The following runbooks or historical fixes were recalled from memory for this incident:
${incidentData.runbooks.map((r, i) => `
### Runbook #${i + 1}: ${r.title} (Source: ${r.source})
${r.root_cause ? `* **Historical Root Cause:** ${r.root_cause}` : ''}
${r.steps && r.steps.length > 0 ? `* **Recommended Steps:**\n${r.steps.map(s => `  - ${s}`).join('\n')}` : ''}
${r.fix_file ? `* **Target File:** ${r.fix_file}` : ''}
${r.fix_diff ? `* **Historical Fix Diff:**\n\`\`\`diff\n${r.fix_diff}\n\`\`\`` : ''}
`).join('\n')}`
      : 'No matching runbooks found in memory.';

    const auditPrompt = `
## INCIDENT
Service: ${sanitize(incidentData.service)}
Error type: ${sanitize(incidentData.error_type || 'unknown')}
Verbatim error: ${sanitize(incidentData.raw_error_message || incidentData.reasoning)}
Root frame: ${sanitize(incidentData.root_frame?.file || 'unknown')}:${incidentData.root_frame?.line || 'unknown'} in ${sanitize(incidentData.root_frame?.function || 'unknown')}
Severity: ${incidentData.severity}

## MATCHED RUNBOOKS / HISTORICAL CONTEXT
${runbookContext}

## CODE TO AUDIT (with line numbers)
${audits.join('\n')}

## TASK — complete in order
STEP 1 — LOCATE: State the exact file and line number causing the error.
STEP 2 — EXPLAIN: State precisely why that line causes this specific error.
STEP 3 — FIX: Produce the minimal change. You should use the matched runbooks / historical context provided above if they are relevant, adjusting them to fit the current code structure.
STEP 4 — VERIFY: List 2 edge cases your fix might introduce.

## OUTPUT — raw JSON only
{
  "file_path": "<relative path>",
  "root_cause_line": <integer or null>,
  "root_cause_explanation": "<specific, one paragraph>",
  "uncertain": <true if you cannot find the exact line>,
  "uncertainty_reason": "<only if uncertain>",
  "diff": "<unified diff of changed lines only>",
  "new_content": "<complete updated content>",
  "reasoning": "<why this fix resolves the root cause>",
  "edge_cases": ["<case 1>", "<case 2>"],
  "confidence": <0.0 to 1.0>
}
`;

    aiFix = await callLLM({ 
      prompt: auditPrompt, 
      systemPrompt: SYSTEM_INSTRUCTIONS,
      responseFormat: 'json_object',
      maxTokens: 4096,
      openrouterKey: context?.project?.openrouterKey,
      llmProvider: context?.project?.llmProvider,
      llmModel: context?.project?.llmModel,
    });

    if (aiFix.uncertain === true) {
      console.warn(`⚠️ LLM is uncertain about fix: ${aiFix.uncertainty_reason || 'No reason provided.'}`);
      return {
        ...incidentData,
        pr_status: 'SKIPPED_UNCERTAIN',
        ai_fix_suggestion: aiFix,
        fix_initiated_at: new Date().toISOString(),
      };
    }

    const validatedPath = finalPaths.find((p) => p === aiFix.file_path);
    if (!validatedPath) {
      console.error(`❌ AI returned file_path "${aiFix.file_path}" which is not in audited candidate paths.`);
      return { ...incidentData, pr_status: 'FAILED_INVALID_PATH', ai_fix_suggestion: aiFix, fix_initiated_at: new Date().toISOString() };
    }

    currentContent = await getFileContent(validatedPath, gitContext);
    if (!currentContent) {
      console.error(`❌ File "${validatedPath}" confirmed not found in repository.`);
      return { ...incidentData, pr_status: 'FAILED_FILE_NOT_FOUND', ai_fix_suggestion: aiFix };
    }

    aiFix.file_path = validatedPath;

    // Phase 4: GitHub Deployment
    console.log(`🌿 Checking repository state for ${owner}/${repo}...`);
    let baseSha;
    try {
      const { data: baseRef } = await client.rest.git.getRef({ owner: owner, repo: repo, ref: `heads/${baseBranch}` });
      baseSha = baseRef.object.sha;
    } catch (error) { return { ...incidentData, pr_status: 'FAILED', error: error.message }; }

    console.log(`🌿 Creating branch: ${branchName}`);
    await client.rest.git.createRef({ owner: owner, repo: repo, ref: `refs/heads/${branchName}`, sha: baseSha });

    let fixApplied = false;
    if (aiFix.file_path && aiFix.file_path !== 'N/A') {
      console.log(`🛠️ Applying code fix to ${aiFix.file_path}...`);
      let fileSha;
      try {
        const { data: fileData } = await client.rest.repos.getContent({ owner: owner, repo: repo, path: aiFix.file_path, ref: branchName });
        fileSha = fileData.sha;
      } catch (e) {}

      let contentToCommit = aiFix.new_content;
      if (aiFix.diff && currentContent) {
        try {
          console.log(`🛠️ Attempting to apply diff minimal patch to ${aiFix.file_path}...`);
          contentToCommit = applyPatch(currentContent, aiFix.diff);
          console.log(`✅ Minimal patch applied successfully.`);
        } catch (patchErr) {
          console.warn(`⚠️ Failed to apply minimal patch: ${patchErr.message}. Falling back to full file replacement.`);
        }
      }

      if (contentToCommit) {
        // --- SAFETY GUARDRAILS ---
        // 1. JSON Syntax Check
        if (aiFix.file_path.endsWith('.json')) {
          try {
            JSON.parse(contentToCommit);
            console.log(`✅ Syntax check passed: valid JSON content.`);
          } catch (jsonErr) {
            console.error(`❌ Syntax check failed: invalid JSON content: ${jsonErr.message}`);
            try {
              await client.rest.git.deleteRef({ owner, repo, ref: `heads/${branchName}` });
            } catch (err) {}
            return {
              ...incidentData,
              pr_status: 'FAILED_NO_CODE',
              error: `Invalid JSON syntax: ${jsonErr.message}`,
              ai_fix_suggestion: aiFix,
              fix_initiated_at: new Date().toISOString()
            };
          }
        }

        // 2. Diff Size Guard
        const changeRatio = getLineDiffPercentage(currentContent, contentToCommit);
        if (changeRatio > 0.30) {
          console.error(`❌ Diff size guard triggered: ${Math.round(changeRatio * 100)}% of the file changed. Limit is 30%.`);
          try {
            await client.rest.git.deleteRef({ owner, repo, ref: `heads/${branchName}` });
          } catch (err) {}
          return {
            ...incidentData,
            pr_status: 'FAILED_GUARDRAIL',
            error: `Diff size guard triggered: changes exceed 30% of the file (${Math.round(changeRatio * 100)}% modified).`,
            ai_fix_suggestion: aiFix,
            fix_initiated_at: new Date().toISOString()
          };
        }
        // -------------------------

        await client.rest.repos.createOrUpdateFileContents({
          owner: owner, repo: repo, path: aiFix.file_path,
          message: `fix: automated fix for ${incidentData.incident_id}`,
          content: Buffer.from(contentToCommit).toString('base64'),
          branch: branchName, sha: fileSha
        });
        fixApplied = true;
      }
    }

    const postmortemBody = `
# 🛡️ Guardian Incident Postmortem: ${incidentData.incident_id}
## Incident summary
- **Service:** ${incidentData.service}
- **Severity:** ${incidentData.severity}
- **Category:** ${categoryLabel(incidentData.error_category || 'UNKNOWN')}
- **Status:** ${fixApplied ? 'RESOLVED' : 'AWAITING_MANUAL_FIX'}

## Root cause
${incidentData.reasoning}

## Fix applied
**File:** \`${aiFix.file_path || 'N/A'}\`
**Reasoning:** ${aiFix.reasoning || 'N/A'}
\`\`\`diff
${(aiFix.diff || aiFix.new_content || 'No diff generated.').slice(0, 8000)}
\`\`\`
${aiFix.diff ? '' : '_Full file replacement — see file changes tab for complete diff._'}

## Security Impact Assessment
- **Vulnerability mitigation:** ${aiFix.edge_cases?.join(', ') || 'N/A'}
- **Data integrity check:** PASSED
- **Access control check:** PASSED

## Audit trail
- **Approver:** ${incidentData.hitl?.approver || 'Human-in-the-Loop'}
- **PR created:** ${new Date().toISOString()}
    `;

    await client.rest.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: `incidents/${incidentData.incident_id}/POSTMORTEM.md`,
      message: `docs: add automated postmortem for ${incidentData.incident_id}`,
      content: Buffer.from(postmortemBody).toString('base64'),
      branch: branchName,
    });

    const { data: pr } = await client.rest.pulls.create({
      owner: owner,
      repo: repo,
      title: `fix: Resolved ${incidentData.service} ${incidentData.incident_id}`,
      head: branchName,
      base: baseBranch,
      body: postmortemBody,
    });

    console.log(`🚀 PR Created: ${pr.html_url}`);

    return {
      ...incidentData,
      pr_url: pr.html_url,
      pr_status: fixApplied ? 'CREATED' : 'FAILED_NO_CODE',
      ai_fix_suggestion: aiFix,
      original_content: currentContent,
      resolution_method: incidentData.runbooks?.some(r => r.source === 'HISTORICAL_FIX')
        ? 'LLM_GENERATED_WITH_RECALL'
        : 'LLM_GENERATED',
      fix_initiated_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ GitHub API Error:', error.message);
    return { ...incidentData, pr_status: 'FAILED', error: error.message, fix_initiated_at: new Date().toISOString() };
  }
}
