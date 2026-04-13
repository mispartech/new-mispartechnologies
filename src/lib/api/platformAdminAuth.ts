import { API_ROUTES } from './apiRoutes';

const DJANGO_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://api.mispartechnologies.com';

type JsonRecord = Record<string, unknown>;

export interface PlatformAdminEmailCheckResponse {
  available: boolean;
  message?: string;
}

export interface PlatformAdminRegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

export interface PlatformAdminRegisterResponse {
  token?: string;
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

class PlatformAdminApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'PlatformAdminApiError';
    this.status = status;
    this.details = details;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatFieldLabel(field: string) {
  if (field === 'non_field_errors') return 'General';
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFieldErrors(data: JsonRecord): string | null {
  const reservedKeys = new Set(['detail', 'error', 'message', 'status', 'statusCode']);
  const entries = Object.entries(data).filter(
    ([key, value]) => !reservedKeys.has(key) && value !== undefined && value !== null,
  );

  if (!entries.length) return null;

  return entries
    .map(([key, value]) => {
      const message = Array.isArray(value) ? value.join(', ') : String(value);
      return `${formatFieldLabel(key)}: ${message}`;
    })
    .join('\n');
}

async function parseResponseBody(response: Response): Promise<{ data?: unknown; text?: string }> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return { data: await response.json().catch(() => undefined) };
  }

  const text = await response.text();
  if (!text) return {};

  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { text };
  }
}

function getPlatformAdminErrorMessage(status: number, data?: unknown, text?: string) {
  if (isRecord(data)) {
    const fieldErrors = formatFieldErrors(data);
    if (fieldErrors) return fieldErrors;

    const topLevelMessage = [data.detail, data.error, data.message].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

    if (topLevelMessage) return topLevelMessage;
  }

  if (status === 502) {
    return 'Admin registration is temporarily unavailable because the server could not provision your account. Please contact support to verify the Supabase service-role configuration.';
  }

  if (status >= 500) {
    return 'Admin registration is temporarily unavailable. Please try again shortly.';
  }

  if (text) {
    const trimmed = text.trim();
    const isHtml = trimmed.startsWith('<') || trimmed.includes('<!DOCTYPE');
    if (!isHtml && trimmed.length > 0) {
      return trimmed.slice(0, 300);
    }
  }

  return 'Request failed';
}

async function requestPlatformAdminEndpoint<T>(endpoint: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${DJANGO_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const { data, text } = await parseResponseBody(response);

  if (!response.ok) {
    throw new PlatformAdminApiError(
      response.status,
      getPlatformAdminErrorMessage(response.status, data, text),
      data ?? text,
    );
  }

  return (data ?? {}) as T;
}

export async function checkPlatformAdminEmail(email: string): Promise<PlatformAdminEmailCheckResponse> {
  return requestPlatformAdminEndpoint<PlatformAdminEmailCheckResponse>(API_ROUTES.PLATFORM_CHECK_EMAIL, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function registerPlatformAdmin(
  payload: PlatformAdminRegisterPayload,
): Promise<PlatformAdminRegisterResponse> {
  return requestPlatformAdminEndpoint<PlatformAdminRegisterResponse>(API_ROUTES.PLATFORM_REGISTER, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
