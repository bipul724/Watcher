// mocks/unit/setup-mocks.js
// Monkey-patches module stubs and constructors to run tests in-memory offline.

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../server/watcherai/.env') });

// Setup mock environment variables so startups don't error out
process.env.DEFAULT_LLM_MODEL = 'google/gemini-2.5-pro';
process.env.OPENROUTER_API_KEY = 'global-mock-or-key';
process.env.PINECONE_API_KEY = 'global-mock-pinecone-key';
process.env.PINECONE_INDEX_NAME = 'watcher-knowledge';
process.env.DISCORD_BOT_TOKEN = 'global-mock-discord-token';
process.env.DISCORD_INCIDENT_CHANNEL_ID = '1234567890';
process.env.GITHUB_TOKEN = 'global-mock-github-token';
process.env.GITHUB_REPO_OWNER = 'global-owner';
process.env.GITHUB_REPO_NAME = 'global-repo';

import axios from 'axios';
import { Octokit } from 'octokit';
import { Client, ChannelManager } from 'discord.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pineconeModule = require('@pinecone-database/pinecone');
const OriginalPinecone = pineconeModule.Pinecone;

// Stateful vector store for testing memory recall / similar error twice
export const mockVectors = [];

class MockPinecone extends OriginalPinecone {
  constructor(opts) {
    super(opts);
    console.log('[MOCK PINECONE CONSTRUCTOR] Intercepted new Pinecone()');
    
    this.index = function (name) {
      console.log(`[MOCK PINECONE] Selected Index: "${name}"`);
      return {
        namespace: function (ns) {
          console.log(`[MOCK PINECONE] Switched to Namespace: "${ns}"`);
          this._ns = ns;
          return this;
        },
        query: async (options) => {
          console.log(`[MOCK PINECONE] Executing query in namespace: "${options.namespace || 'default'}"`);
          const signatureMatches = mockVectors.filter(v => 
            v.metadata?.chunk_type === 'error_signature' && 
            (!options.filter?.service || v.metadata?.service === (options.filter.service.$eq || options.filter.service))
          );
          if (global.testRecallEmpty) {
            return {
              matches: signatureMatches.map(m => ({
                score: 0.95,
                metadata: m.metadata
              }))
            };
          }
          if (signatureMatches.length > 0) {
            return {
              matches: signatureMatches.map(m => ({
                score: 0.95,
                metadata: m.metadata
              }))
            };
          }
          return {
            matches: [
              {
                score: 0.92,
                metadata: {
                  title: 'Database connection pool runbook',
                  steps: JSON.stringify(['Verify database metrics', 'Increase connection pool limits']),
                  fix_diff: '@@ -42,1 +42,1 @@\n-  poolSize: 5\n+  poolSize: 20',
                  fix_file: 'db.js',
                  root_cause: 'MongoDB Connection pool timeout',
                  pr_url: 'https://github.com/mock/pr/1',
                  source: 'HISTORICAL_FIX',
                  incident_id: 'INC-7890'
                }
              }
            ]
          };
        },
        upsert: async (payload) => {
          console.log(`[MOCK PINECONE] Upserted vectors into Pinecone:`, JSON.stringify(payload));
          if (payload && Array.isArray(payload.records)) {
            for (const rec of payload.records) {
              mockVectors.push(rec);
            }
          }
          return { upsertedCount: payload.records ? payload.records.length : 0 };
        }
      };
    };

    Object.defineProperty(this, 'inference', {
      value: {
        embed: async (options) => {
          console.log(`[MOCK PINECONE INFERENCE] Generating embedding vector for text: "${options.inputs[0].slice(0, 40)}..."`);
          return {
            data: (options.inputs || []).map(() => ({ values: new Array(1024).fill(0.123) }))
          };
        }
      },
      writable: true,
      configurable: true
    });
  }
}

try {
  Object.defineProperty(pineconeModule, 'Pinecone', {
    value: MockPinecone,
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.log('[MOCK PINECONE] Export is read-only, applying prototype monkey-patches to OriginalPinecone...');
  OriginalPinecone.prototype.index = function (name) {
    console.log(`[MOCK PINECONE] Selected Index: "${name}"`);
    return {
      namespace: function (ns) {
        console.log(`[MOCK PINECONE] Switched to Namespace: "${ns}"`);
        this._ns = ns;
        return this;
      },
      query: async (options) => {
        console.log(`[MOCK PINECONE] Executing query in namespace: "${options.namespace || 'default'}"`);
        const signatureMatches = mockVectors.filter(v => 
          v.metadata?.chunk_type === 'error_signature' && 
          (!options.filter?.service || v.metadata?.service === (options.filter.service.$eq || options.filter.service))
        );
        if (global.testRecallEmpty) {
          return {
            matches: signatureMatches.map(m => ({
              score: 0.95,
              metadata: m.metadata
            }))
          };
        }
        if (signatureMatches.length > 0) {
          return {
            matches: signatureMatches.map(m => ({
              score: 0.95,
              metadata: m.metadata
            }))
          };
        }
        return {
          matches: [
            {
              score: 0.92,
              metadata: {
                title: 'Database connection pool runbook',
                steps: JSON.stringify(['Verify database metrics', 'Increase connection pool limits']),
                fix_diff: '@@ -42,1 +42,1 @@\n-  poolSize: 5\n+  poolSize: 20',
                fix_file: 'db.js',
                root_cause: 'MongoDB Connection pool timeout',
                pr_url: 'https://github.com/mock/pr/1',
                source: 'HISTORICAL_FIX',
                incident_id: 'INC-7890'
              }
            }
          ]
        };
      },
      upsert: async (payload) => {
        console.log(`[MOCK PINECONE] Upserted vectors into Pinecone:`, JSON.stringify(payload));
        if (payload && Array.isArray(payload.records)) {
          for (const rec of payload.records) {
            mockVectors.push(rec);
          }
        }
        return { upsertedCount: payload.records ? payload.records.length : 0 };
      }
    };
  };

  Object.defineProperty(OriginalPinecone.prototype, 'inference', {
    get() {
      return {
        embed: async (options) => {
          console.log(`[MOCK PINECONE INFERENCE] Generating embedding vector for text: "${options.inputs[0].slice(0, 40)}..."`);
          return {
            data: (options.inputs || []).map(() => ({ values: new Array(1024).fill(0.123) }))
          };
        }
      };
    },
    set(val) {
      // Prevent constructor from overwriting the getter
    },
    configurable: true,
    enumerable: true
  });
}
const Pinecone = MockPinecone;

// Setup relative path to the incident-store service of the watcherai agent
import {
  getIncident,
  removeIncident,
  saveIncidentTimeout,
  clearIncidentTimeout,
} from '../../server/watcherai/services/incident-store.js';

// 1. Mock Axios POST for LLM (OpenRouter) calls
axios.post = async (url, data, config) => {
  const body = typeof data === 'string' ? JSON.parse(data) : data;
  const systemPrompt = body.messages.find(m => m.role === 'system')?.content || '';
  const userPrompt = body.messages.find(m => m.role === 'user')?.content || '';

  console.log(`[MOCK AXIOS] Intercepted POST to OpenRouter:`, url);

  // Determine which node is calling based on prompt keyword hints
  if (systemPrompt.includes('Triage')) {
    // Triage Node mock response
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              service: 'checkout-service',
              severity: 'P1',
              raw_error_message: 'MongoNetworkError: connection pool timeout',
              normalized_error_signature: 'MongoNetworkError: connection pool timeout',
              root_frame: { file: 'db.js', line: 42, function: 'connect' },
              affected_files: ['db.js'],
              reasoning: 'Verbatim: MongoNetworkError: connection pool timeout',
              confidence: 90,
              is_critical: true,
              error_type: 'network'
            })
          }
        }]
      }
    };
  } else if (userPrompt.includes('TASK — complete in order') || userPrompt.includes('STEP 1 — LOCATE')) {
    // GitHub Fixer Deep Audit mock response
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              file_path: 'db.js',
              root_cause_line: 42,
              root_cause_explanation: 'DB connection pool timeout during burst traffic.',
              uncertain: false,
              diff: '@@ -42,1 +42,1 @@\n-  poolSize: 5\n+  poolSize: 20',
              new_content: '// db.js\nconst pool = {\n  poolSize: 20\n};',
              reasoning: 'Increase connection pool size to handle concurrency.',
              edge_cases: ['Excessive memory usage if pool size is too high'],
              confidence: 0.95
            })
          }
        }]
      }
    };
  } else if (userPrompt.includes('technical search keywords')) {
    // Keyword extractor mock response
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              keywords: ['mongodb', 'connection', 'timeout']
            })
          }
        }]
      }
    };
  } else if (userPrompt.includes('top 5 most relevant paths')) {
    // Path ranker mock response
    return {
      data: {
        choices: [{
          message: {
            content: 'db.js\ncheckout.js'
          }
        }]
      }
    };
  }

  // General fallback
  return {
    data: {
      choices: [{
        message: {
          content: '{}'
        }
      }]
    }
  };
};

// Helper for HTTP fetch mocking
function makeMockResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data)
  };
}

// 2. Mock network requests to api.github.com
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  const urlStr = String(url);
  
  if (urlStr.includes('api.github.com')) {
    console.log(`[MOCK FETCH GITHUB] ${options?.method || 'GET'} ${urlStr}`);
    
    if (urlStr.includes('/pulls')) {
      if (options?.method === 'POST') {
        return makeMockResponse({ html_url: 'https://github.com/test-owner/test-repo/pull/1' }, 201);
      }
      return makeMockResponse([]);
    }
    if (urlStr.includes('/git/refs') && options?.method === 'POST') {
      return makeMockResponse({}, 201);
    }
    if (urlStr.includes('/git/ref/')) {
      return makeMockResponse({ object: { sha: 'mocksha1234567890' } });
    }
    if (urlStr.includes('/git/trees/')) {
      return makeMockResponse({
        tree: [
          { path: 'db.js', type: 'blob' },
          { path: 'checkout.js', type: 'blob' }
        ]
      });
    }
    if (urlStr.includes('/contents/')) {
      if (options?.method === 'PUT') {
        return makeMockResponse({}, 200);
      }
      return makeMockResponse({
        content: Buffer.from('const poolSize = 5;').toString('base64'),
        sha: 'mockfilesha9876'
      });
    }
    if (urlStr.includes('/search/code')) {
      return makeMockResponse({ items: [{ path: 'db.js' }] });
    }
    // /repos/{owner}/{repo}
    if (urlStr.match(/\/repos\/[^/]+\/[^/]+$/)) {
      return makeMockResponse({ default_branch: 'main' });
    }

    return makeMockResponse({});
  }

  if (urlStr.includes('api.pinecone.io')) {
    console.log(`[MOCK FETCH PINECONE] Intercepted embedding request to URL: ${urlStr}`);
    return makeMockResponse({
      data: [{ values: new Array(1024).fill(0.123) }]
    });
  }

  return originalFetch(url, options);
};

// Prototype level backup mock for Octokit
Octokit.prototype.request = async function(route, options) {
  console.log(`[MOCK OCTOKIT REQUEST] Backup Intercept: ${route}`);
  const cleanRoute = String(route).trim();
  if (cleanRoute.includes('/pulls') && cleanRoute.startsWith('GET')) {
    return { data: [] };
  }
  if (cleanRoute.includes('/pulls') && cleanRoute.startsWith('POST')) {
    return { data: { html_url: `https://github.com/test-owner/test-repo/pull/1` } };
  }
  if (cleanRoute.includes('/git/ref') && cleanRoute.startsWith('GET')) {
    return { data: { object: { sha: 'mocksha1234567890' } } };
  }
  if (cleanRoute.includes('/git/refs') && cleanRoute.startsWith('POST')) {
    return { data: {} };
  }
  if (cleanRoute.includes('/git/trees') && cleanRoute.startsWith('GET')) {
    return {
      data: {
        tree: [
          { path: 'db.js', type: 'blob' },
          { path: 'checkout.js', type: 'blob' }
        ]
      }
    };
  }
  if (cleanRoute.includes('/contents/') && cleanRoute.startsWith('GET')) {
    return {
      data: {
        content: Buffer.from('const poolSize = 5;').toString('base64'),
        sha: 'mockfilesha9876'
      }
    };
  }
  if (cleanRoute.includes('/contents/') && cleanRoute.startsWith('PUT')) {
    return { data: {} };
  }
  if (cleanRoute.startsWith('GET /repos/{owner}/{repo}') || cleanRoute.startsWith('GET /repos/:owner/:repo')) {
    return { data: { default_branch: 'main' } };
  }
  if (cleanRoute.startsWith('GET /search/code')) {
    return { data: { items: [{ path: 'db.js' }] } };
  }
  return { data: {} };
};

// Mapped via Pinecone constructor above

// 4. Mock Discord Bot Client
Client.prototype.login = async function (token) {
  console.log('[MOCK DISCORD] Logging in client...');
  this.token = token;
  this.user = { tag: 'MockBot#1234' };
  
  process.nextTick(() => {
    this.emit('ready');
  });
  return token;
};

// Intercept at ChannelManager prototype level
ChannelManager.prototype.fetch = async function(id) {
  console.log(`[MOCK DISCORD CHANNEL MANAGER] Fetched channel ID: ${id}`);
  return {
    send: async (embedPayload) => {
      console.log(`[MOCK DISCORD] Sent message embed to channel`);
      return {
        id: 'mock-message-id-5555',
        startThread: async (threadOpts) => {
          console.log(`[MOCK DISCORD] Opened thread: "${threadOpts.name}"`);
          return {
            id: 'mock-thread-id-7777',
            send: async (msg) => {
              console.log(`[MOCK DISCORD] Thread message sent: "${msg}"`);
              return {};
            }
          };
        }
      };
    }
  };
};
