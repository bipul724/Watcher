// nodes/shared/categorize.js
// Deterministic error category classifier.
// Maps raw error text + LLM error_type → a human-readable category tag
// used for grouping in Discord, Pinecone filters, and PR postmortems.

export const ERROR_CATEGORIES = [
  'HTTP_5XX',
  'HTTP_4XX',
  'DATABASE',
  'BUILD_DEPLOY',
  'AUTHENTICATION',
  'NETWORK',
  'MEMORY',
  'DEPENDENCY',
  'CONFIGURATION',
  'RUNTIME_ERROR',
  'UNKNOWN',
];

const CATEGORY_PATTERNS = {
  HTTP_5XX: [
    /\b5\d{2}\b/,
    /internal\s+server\s+error/i,
    /bad\s+gateway/i,
    /service\s+unavailable/i,
    /gateway\s+timeout/i,
  ],
  HTTP_4XX: [
    /\b4\d{2}\b/,
    /unauthorized/i,
    /forbidden/i,
    /not\s+found/i,
    /rate.?limit/i,
    /too\s+many\s+requests/i,
    /unprocessable/i,
  ],
  DATABASE: [
    /MongoNetworkError/i,
    /SequelizeConnectionError/i,
    /connection.*pool/i,
    /ECONNREFUSED.*(?:5432|27017|3306|6379)/,
    /query.*fail/i,
    /deadlock/i,
    /transaction.*rollback/i,
    /pg.*error/i,
    /mysql.*error/i,
    /\bsql\b.*error/i,
  ],
  BUILD_DEPLOY: [
    /build\s+fail/i,
    /compilation\s+error/i,
    /deploy\s+fail/i,
    /cannot\s+find\s+module/i,
    /module\s+not\s+found/i,
    /SyntaxError/,
    /webpack/i,
    /tsc\s+error/i,
    /docker\s+build/i,
  ],
  AUTHENTICATION: [
    /jwt/i,
    /token\s+expir/i,
    /invalid\s+token/i,
    /auth.*fail/i,
    /permission\s+denied/i,
    /access\s+denied/i,
    /credentials.*invalid/i,
    /OAuth/i,
  ],
  NETWORK: [
    /ECONNREFUSED/,
    /ETIMEDOUT/,
    /ENOTFOUND/,
    /socket\s+hang\s+up/i,
    /connection\s+refus/i,
    /DNS.*fail/i,
    /network\s+error/i,
    /fetch\s+failed/i,
    /ssl\s+handshake/i,
  ],
  MEMORY: [
    /out\s+of\s+memory/i,
    /OOMKilled/,
    /heap.*limit/i,
    /memory\s+limit/i,
    /ENOMEM/,
    /segfault/i,
    /stack\s+overflow/i,
  ],
  DEPENDENCY: [
    /cannot\s+find\s+module/i,
    /module\s+not\s+found/i,
    /import\s+error/i,
    /missing\s+package/i,
    /version\s+conflict/i,
    /peer\s+dependency/i,
  ],
  CONFIGURATION: [
    /env.*not\s+set/i,
    /missing\s+(?:env|config|key)/i,
    /invalid\s+config/i,
    /schema\s+validation/i,
    /environment\s+variable/i,
    /\.env/i,
  ],
};

// Maps LLM error_type values to a fallback category when patterns don't match.
const TYPE_FALLBACK = {
  syntax:     'BUILD_DEPLOY',
  config:     'CONFIGURATION',
  dependency: 'DEPENDENCY',
  network:    'NETWORK',
  runtime:    'RUNTIME_ERROR',
  logic:      'RUNTIME_ERROR',
  unknown:    'UNKNOWN',
};

/**
 * Returns one of the ERROR_CATEGORIES strings for the given error text.
 * @param {string} errorMessage  raw error text
 * @param {string} errorType     LLM-derived error_type ('runtime', 'config', …)
 * @returns {string}
 */
export function categorizeError(errorMessage = '', errorType = '') {
  const text = `${errorMessage} ${errorType}`;

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some(p => p.test(text))) {
      return category;
    }
  }

  return TYPE_FALLBACK[errorType?.toLowerCase()] || 'UNKNOWN';
}

/**
 * Returns a short human-readable label + emoji for the category.
 * Used in Discord embeds and PR postmortems.
 */
export function categoryLabel(category) {
  const labels = {
    HTTP_5XX:       '🔴 HTTP 5xx (Server Error)',
    HTTP_4XX:       '🟠 HTTP 4xx (Client Error)',
    DATABASE:       '🗄️ Database / Connection',
    BUILD_DEPLOY:   '🏗️ Build / Deploy',
    AUTHENTICATION: '🔐 Authentication / Auth',
    NETWORK:        '🌐 Network / Connectivity',
    MEMORY:         '💾 Memory / OOM',
    DEPENDENCY:     '📦 Dependency / Package',
    CONFIGURATION:  '⚙️ Configuration / Env',
    RUNTIME_ERROR:  '⚡ Runtime Error',
    UNKNOWN:        '❓ Unknown',
  };
  return labels[category] || category;
}
