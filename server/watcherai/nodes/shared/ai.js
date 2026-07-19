// nodes/shared/ai.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_LLM_MODEL;
const JSON_ONLY_INSTRUCTION = 'CRITICAL: Return ONLY raw JSON. No markdown fences, no backticks, no preamble, no explanation. Start your response with { and end with }.';

function safeParseJSON(content) {
  const stripped = String(content ?? '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(stripped);
}

/**
 * Remove control characters (U+0000–U+001F except \t \n \r) and
 * Unicode line/paragraph separators that some JSON parsers reject.
 */
function cleanString(str) {
  return String(str ?? '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u2028\u2029]/g, '');
}

/**
 * Common LLM call function via OpenRouter
 */
export async function callLLM({ 
  prompt, 
  systemPrompt, 
  model, 
  responseFormat = 'json_object', 
  maxTokens = 4096, 
  timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10), 
  openrouterKey,
  llmProvider,
  llmModel
}) {
  const provider = llmProvider || 'OPENROUTER';
  const targetModel = llmModel || model || DEFAULT_MODEL;

  if (!targetModel) {
    console.error('❌ LLM model is not defined (neither project model nor default model env is set)');
    throw new Error('LLM model is missing');
  }

  // Resolve API Key
  let apiKey = openrouterKey;
  if (!apiKey) {
    if (provider === 'OPENROUTER') apiKey = process.env.OPENROUTER_API_KEY;
    else if (provider === 'OPENAI') apiKey = process.env.OPENAI_API_KEY;
    else if (provider === 'ANTHROPIC') apiKey = process.env.ANTHROPIC_API_KEY;
    else if (provider === 'GEMINI') apiKey = process.env.GEMINI_API_KEY;
  }

  console.log(`🤖 LLM Call: using provider ${provider}, model ${targetModel}`);
  
  if (!apiKey) {
    console.warn(`⚠️ API Key for ${provider} not set. LLM calls will fail.`);
    throw new Error(`API Key for ${provider} is missing`);
  }

  const messages = [];
  if (systemPrompt || responseFormat === 'json_object') {
    const baseSystemPrompt = systemPrompt ? `${cleanString(systemPrompt)}\n\n` : '';
    const finalSystemPrompt = responseFormat === 'json_object'
      ? `${baseSystemPrompt}${JSON_ONLY_INSTRUCTION}`
      : baseSystemPrompt.trim();

    messages.push({ role: 'system', content: finalSystemPrompt });
  }
  messages.push({ role: 'user', content: cleanString(prompt) });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    
    if (provider === 'OPENROUTER') {
      const bodyPayload = {
        model: targetModel,
        messages,
        max_tokens: maxTokens,
        ...(responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
      };
      response = await axios.post('https://openrouter.ai/api/v1/chat/completions', JSON.stringify(bodyPayload), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/guardian-agent',
          'X-Title': 'Guardian AI SRE'
        },
        signal: controller.signal
      });
      const content = response.data.choices[0].message.content;
      return responseFormat === 'json_object' ? safeParseJSON(content) : content;
    } 
    
    if (provider === 'OPENAI') {
      const bodyPayload = {
        model: targetModel,
        messages,
        max_tokens: maxTokens,
        ...(responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
      };
      response = await axios.post('https://api.openai.com/v1/chat/completions', JSON.stringify(bodyPayload), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      const content = response.data.choices[0].message.content;
      return responseFormat === 'json_object' ? safeParseJSON(content) : content;
    }
    
    if (provider === 'ANTHROPIC') {
      const systemMsg = messages.find(m => m.role === 'system')?.content || '';
      const userMsg = messages.find(m => m.role === 'user')?.content || '';
      const bodyPayload = {
        model: targetModel,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: userMsg }],
        ...(systemMsg ? { system: systemMsg } : {})
      };
      response = await axios.post('https://api.anthropic.com/v1/messages', JSON.stringify(bodyPayload), {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        signal: controller.signal
      });
      const content = response.data.content[0].text;
      return responseFormat === 'json_object' ? safeParseJSON(content) : content;
    }
    
    if (provider === 'GEMINI') {
      const systemMsg = messages.find(m => m.role === 'system')?.content || '';
      const userMsg = messages.find(m => m.role === 'user')?.content || '';
      const bodyPayload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: userMsg }]
          }
        ],
        ...(systemMsg ? { systemInstruction: { parts: [{ text: systemMsg }] } } : {}),
        generationConfig: {
          responseMimeType: responseFormat === 'json_object' ? 'application/json' : 'text/plain',
          maxOutputTokens: maxTokens
        }
      };
      response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, JSON.stringify(bodyPayload), {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      const content = response.data.candidates[0].content.parts[0].text;
      return responseFormat === 'json_object' ? safeParseJSON(content) : content;
    }

    throw new Error(`Unsupported LLM provider: ${provider}`);
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      throw new Error(`${provider} request timed out after ${timeoutMs}ms`);
    }

    const errorData = error.response?.data || error.message;
    console.error(`❌ ${provider} API Error (${targetModel}):`, JSON.stringify(errorData, null, 2));
    throw new Error(`${provider} Error: ${JSON.stringify(errorData)}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Embedding generation using Pinecone Inference (Serverless)
 */
export async function getEmbedding(text, pc) {
  if (!text || text.trim().length === 0) {
    throw new Error('getEmbedding: text must be a non-empty string');
  }

  try {
    // Standard serverless embedding model in Pinecone
    const model = 'multilingual-e5-large'; 
    
    // Ensure pc.inference exists
    if (!pc || !pc.inference) {
      throw new Error('Pinecone client not initialized with inference capabilities. Ensure you are using SDK v7+');
    }

    // Pinecone v7 SDK Inference Signature: embed({ model, inputs, parameters })
    const response = await pc.inference.embed({
      model: model,
      inputs: [text.slice(0, 8000)],
      parameters: { inputType: 'passage', truncate: 'END' }
    });
    
    // Pinecone v7 returns an EmbeddingsList object with a .data array
    if (response && response.data && response.data.length > 0) {
      return response.data[0].values;
    }
    
    throw new Error('getEmbedding: Pinecone returned empty embedding');
  } catch (error) {
    throw new Error(`getEmbedding failed: ${error.message}`);
  }
}
