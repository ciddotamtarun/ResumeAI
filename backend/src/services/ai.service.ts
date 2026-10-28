import OpenAI from 'openai';

const DEFAULT_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_OPENROUTER_MODEL = 'gpt-4o-mini';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

export type AIProvider = 'openai' | 'gemini';

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly causeError?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

class EmptyCompletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmptyCompletionError';
  }
}

const getClient = (): OpenAI => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL = (process.env.OPENROUTER_BASE_URL || DEFAULT_OPENROUTER_BASE_URL)
    .trim()
    .replace(/\/+$/, '');

  if (!apiKey?.trim()) {
    throw new AIServiceError('OPENROUTER_API_KEY is not configured.', 503);
  }

  try {
    const parsedBaseURL = new URL(baseURL);
    if (parsedBaseURL.protocol !== 'https:' && parsedBaseURL.hostname !== 'localhost') {
      throw new Error('OpenRouter base URL must use HTTPS.');
    }
  } catch {
    throw new AIServiceError('OPENROUTER_BASE_URL is invalid.', 500);
  }

  return new OpenAI({
    apiKey,
    baseURL,
    maxRetries: 0,
    timeout: 30_000,
  });
};

const getModel = (): string => {
  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  if (!model) throw new AIServiceError('OPENROUTER_MODEL is invalid.', 500);
  return model;
};

const getStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as { status?: unknown; statusCode?: unknown }).status
    ?? (error as { statusCode?: unknown }).statusCode;
  return typeof status === 'number' ? status : undefined;
};

const getErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
};

const isRetryable = (error: unknown): boolean => {
  if (error instanceof EmptyCompletionError) return true;

  const status = getStatus(error);
  if (status === 408 || status === 429 || (status !== undefined && status >= 500)) {
    return true;
  }

  const code = getErrorCode(error);
  if (code && ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED'].includes(code)) {
    return true;
  }

  return error instanceof Error &&
    (error.name === 'APIConnectionError' || error.name === 'APIConnectionTimeoutError');
};

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function retryTransientRequest<T>(
  request: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    wait?: (milliseconds: number) => Promise<void>;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const delayMs = options.delayMs ?? RETRY_DELAY_MS;
  const wait = options.wait ?? sleep;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      if (!isRetryable(error) || attempt >= maxRetries) {
        throw toAIServiceError(error);
      }

      const status = getStatus(error);
      const code = getErrorCode(error);
      console.warn('[AI] Transient OpenRouter failure; retrying', {
        attempt: attempt + 1,
        maxAttempts: maxRetries + 1,
        status: status ?? null,
        code: code ?? null,
        errorType: error instanceof Error ? error.name : typeof error,
      });
      await wait(delayMs * (attempt + 1));
    }
  }
}

function toAIServiceError(error: unknown): AIServiceError {
  if (error instanceof AIServiceError) return error;

  const status = getStatus(error);
  if (status === 401 || status === 403) {
    return new AIServiceError(
      'OpenRouter authentication failed. Check OPENROUTER_API_KEY.',
      502,
      error
    );
  }
  if (status === 429) {
    return new AIServiceError(
      'OpenRouter is rate limiting requests. Please try again shortly.',
      503,
      error
    );
  }
  if (status !== undefined && status >= 500) {
    return new AIServiceError(
      'OpenRouter is temporarily unavailable. Please try again shortly.',
      503,
      error
    );
  }
  if (status !== undefined) {
    return new AIServiceError(
      `OpenRouter rejected the AI request (HTTP ${status}). Check the configured model and request settings.`,
      502,
      error
    );
  }
  if (error instanceof EmptyCompletionError) {
    return new AIServiceError(
      'OpenRouter returned no usable text after multiple attempts. Check model availability or configure another OPENROUTER_MODEL.',
      502,
      error
    );
  }
  return new AIServiceError(
    'Could not reach OpenRouter after multiple attempts. Check the backend connection and try again.',
    503,
    error
  );
}

export function extractCompletionText(response: unknown): string {
  if (!response || typeof response !== 'object') {
    throw new EmptyCompletionError('OpenRouter returned an unexpected response.');
  }

  const choices = (response as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new EmptyCompletionError('OpenRouter returned no completion choices.');
  }

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== 'object') {
    throw new EmptyCompletionError('OpenRouter returned an invalid completion choice.');
  }

  const message = (firstChoice as { message?: unknown }).message;
  if (!message || typeof message !== 'object') {
    throw new EmptyCompletionError('OpenRouter completion did not include a message.');
  }

  const content = (message as { content?: unknown }).content;
  let text: string;
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    text = content
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        const block = part as { type?: unknown; text?: unknown };
        return (block.type === 'text' || block.type === undefined) && typeof block.text === 'string'
          ? block.text
          : '';
      })
      .filter(Boolean)
      .join('\n');
  } else {
    text = '';
  }

  if (!text.trim()) {
    throw new EmptyCompletionError('OpenRouter completion message contained no text.');
  }

  return text;
}

function logResponseMetadata(response: unknown, model: string, text: string): void {
  const result = response && typeof response === 'object'
    ? response as {
      id?: unknown;
      model?: unknown;
      choices?: Array<{ finish_reason?: unknown }>;
      usage?: { completion_tokens?: unknown };
    }
    : {};

  console.info('[AI] OpenRouter completion received', {
    requestId: typeof result.id === 'string' ? result.id : null,
    requestedModel: model,
    returnedModel: typeof result.model === 'string' ? result.model : null,
    choiceCount: Array.isArray(result.choices) ? result.choices.length : 0,
    finishReason: result.choices?.[0]?.finish_reason ?? null,
    completionTokens: result.usage?.completion_tokens ?? null,
    contentCharacters: text.length,
  });
}

async function createCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const client = getClient();
  console.log(`[AI] Requesting OpenRouter completion (model: ${model})`);

  return retryTransientRequest(async () => {
    const response: unknown = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    try {
      const text = extractCompletionText(response);
      logResponseMetadata(response, model, text);
      return text;
    } catch (error) {
      const metadata = response && typeof response === 'object'
        ? response as {
          id?: unknown;
          model?: unknown;
          choices?: Array<{ finish_reason?: unknown }>;
          usage?: { completion_tokens?: unknown };
        }
        : {};
      console.warn('[AI] OpenRouter response contained no usable completion text', {
        requestId: typeof metadata.id === 'string' ? metadata.id : null,
        requestedModel: model,
        returnedModel: typeof metadata.model === 'string' ? metadata.model : null,
        choiceCount: Array.isArray(metadata.choices) ? metadata.choices.length : 0,
        finishReason: metadata.choices?.[0]?.finish_reason ?? null,
        completionTokens: metadata.usage?.completion_tokens ?? null,
      });
      throw error;
    }
  });
}

/**
 * Generate a single-turn completion via OpenRouter.
 */
export function generateCompletion(
  prompt: string,
  systemPrompt: string,
  _provider: AIProvider = 'gemini'
): Promise<string> {
  return createCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    getModel(),
    0.7,
    4000
  );
}

/**
 * Generate a multi-turn chat completion via OpenRouter.
 */
export function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  _provider: AIProvider = 'gemini'
): Promise<string> {
  return createCompletion(
    [
      { role: 'system', content: systemPrompt },
      ...messages.map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      })),
    ],
    getModel(),
    0.8,
    1000
  );
}
