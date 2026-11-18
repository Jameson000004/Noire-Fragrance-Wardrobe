import { Fragrance, FragranceConcentration } from '../types/fragrance';

export class GmailAuthError extends Error {
  constructor(message = 'Google session expired. Please sign in with Google to reconnect Gmail.') {
    super(message);
    this.name = 'GmailAuthError';
  }
}

export interface GmailLabel {
  id: string;
  name: string;
  type?: 'system' | 'user';
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  bodyText: string;
  labelIds: string[];
  isUnread: boolean;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

function decodeBase64Url(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractBodyFromPayload(payload: any): string {
  if (!payload) return '';

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      return stripHtmlTags(decoded);
    }
    return decoded;
  }

  if (Array.isArray(payload.parts)) {
    // Prefer text/plain first
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain' && p.body?.data);
    if (plainPart) {
      return decodeBase64Url(plainPart.body.data);
    }
    // Check nested parts recursively
    for (const part of payload.parts) {
      const nested = extractBodyFromPayload(part);
      if (nested) return nested;
    }
  }

  return '';
}

function getHeader(headers: Array<{ name: string; value: string }> = [], name: string): string {
  const found = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return found?.value || '';
}

async function gmailFetch<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody?.error?.message || 'Gmail access requires Google sign-in authorization.';
    if (res.status === 401) {
      throw new GmailAuthError(message);
    }
    throw new Error(message);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Gmail request failed (${res.status})`);
  }

  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const GmailService = {
  async getProfile(accessToken: string): Promise<GmailProfile> {
    return gmailFetch<GmailProfile>(`${GMAIL_API_BASE}/profile`, accessToken);
  },

  async listLabels(accessToken: string): Promise<GmailLabel[]> {
    const data = await gmailFetch<{ labels?: GmailLabel[] }>(`${GMAIL_API_BASE}/labels`, accessToken);
    return data.labels || [];
  },

  async listMessages(
    accessToken: string,
    options: { q?: string; labelIds?: string[]; maxResults?: number } = {}
  ): Promise<GmailMessageSummary[]> {
    const params = new URLSearchParams();
    params.set('maxResults', String(options.maxResults ?? 12));
    if (options.q?.trim()) {
      params.set('q', options.q.trim());
    }
    if (options.labelIds && options.labelIds.length > 0) {
      options.labelIds.forEach((id) => params.append('labelIds', id));
    }

    const listData = await gmailFetch<{ messages?: Array<{ id: string; threadId: string }> }>(
      `${GMAIL_API_BASE}/messages?${params.toString()}`,
      accessToken
    );

    const refs = listData.messages || [];
    if (refs.length === 0) return [];

    const details = await Promise.all(
      refs.map(async (ref) => {
        try {
          const msg = await gmailFetch<any>(
            `${GMAIL_API_BASE}/messages/${ref.id}?format=full`,
            accessToken
          );
          const headers = msg.payload?.headers || [];
          const bodyText = extractBodyFromPayload(msg.payload) || msg.snippet || '';
          const labelIds: string[] = msg.labelIds || [];
          return {
            id: msg.id,
            threadId: msg.threadId,
            subject: getHeader(headers, 'Subject') || '(No Subject)',
            from: getHeader(headers, 'From') || 'Unknown Sender',
            to: getHeader(headers, 'To') || '',
            date: getHeader(headers, 'Date') || '',
            snippet: msg.snippet || '',
            bodyText: bodyText.trim(),
            labelIds,
            isUnread: labelIds.includes('UNREAD'),
          } as GmailMessageSummary;
        } catch {
          return null;
        }
      })
    );

    return details.filter((m): m is GmailMessageSummary => m !== null);
  },

  async sendMessage(
    accessToken: string,
    params: { to: string; subject: string; body: string; threadId?: string }
  ): Promise<{ id: string; threadId: string }> {
    const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
    const mimeLines = [
      `To: ${params.to.trim()}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      params.body,
    ];
    const raw = encodeBase64Url(mimeLines.join('\r\n'));

    return gmailFetch<{ id: string; threadId: string }>(`${GMAIL_API_BASE}/messages/send`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        raw,
        ...(params.threadId ? { threadId: params.threadId } : {}),
      }),
    });
  },

  async createDraft(
    accessToken: string,
    params: { to: string; subject: string; body: string }
  ): Promise<{ id: string }> {
    const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
    const mimeLines = [
      `To: ${params.to.trim()}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      params.body,
    ];
    const raw = encodeBase64Url(mimeLines.join('\r\n'));

    return gmailFetch<{ id: string }>(`${GMAIL_API_BASE}/drafts`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        message: { raw },
      }),
    });
  },

  async trashMessage(accessToken: string, messageId: string): Promise<void> {
    await gmailFetch(`${GMAIL_API_BASE}/messages/${messageId}/trash`, accessToken, {
      method: 'POST',
    });
  },

  async modifyLabels(
    accessToken: string,
    messageId: string,
    addLabelIds: string[] = [],
    removeLabelIds: string[] = []
  ): Promise<void> {
    await gmailFetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ addLabelIds, removeLabelIds }),
    });
  },

  async ensureNoireLabel(accessToken: string): Promise<GmailLabel> {
    const labels = await this.listLabels(accessToken);
    const existing = labels.find((l) => l.name.toLowerCase() === 'noiré' || l.name.toLowerCase() === 'noire');
    if (existing) return existing;

    return gmailFetch<GmailLabel>(`${GMAIL_API_BASE}/labels`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Noiré',
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      }),
    });
  },

  formatFragranceEmail(fragrance: Fragrance): { subject: string; body: string } {
    const topNotes = fragrance.notes.top.map((n) => n.name).join(', ') || 'Not recorded';
    const heartNotes = fragrance.notes.heart.map((n) => n.name).join(', ') || 'Not recorded';
    const baseNotes = fragrance.notes.base.map((n) => n.name).join(', ') || 'Not recorded';

    return {
      subject: `Noiré Scent Note — ${fragrance.name} by ${fragrance.brand}`,
      body: [
        `${fragrance.name} — ${fragrance.brand}`,
        `${fragrance.concentration} · ${fragrance.volumeMilliliters} ml · ${fragrance.longevityText}`,
        '',
        fragrance.description,
        '',
        'Olfactory Architecture:',
        `• Top Notes: ${topNotes}`,
        `• Heart Notes: ${heartNotes}`,
        `• Base Notes: ${baseNotes}`,
        '',
        `Ideal For: ${fragrance.tags.occasions.join(', ')} (${fragrance.tags.seasons.join(', ')})`,
        '',
        '— Shared from Noiré, Your Fragrance Wardrobe',
      ].join('\n'),
    };
  },

  extractFragranceDraftFromEmail(msg: GmailMessageSummary): Partial<Fragrance> {
    const combined = `${msg.subject}\n${msg.bodyText}`;

    // Detect concentration
    let concentration: FragranceConcentration = 'Eau de Parfum';
    if (/extrait/i.test(combined)) concentration = 'Extrait de Parfum';
    else if (/eau de toilette|\bedt\b/i.test(combined)) concentration = 'Eau de Toilette';
    else if (/eau de cologne|\bedc\b/i.test(combined)) concentration = 'Eau de Cologne';
    else if (/\bparfum\b/i.test(combined) && !/eau de parfum/i.test(combined)) concentration = 'Parfum';

    // Detect volume in ml
    const volMatch = combined.match(/(\d{2,3})\s?ml\b/i);
    const volumeMilliliters = volMatch ? Number(volMatch[1]) : 50;

    // Extract clean sender brand name
    const senderName = msg.from.replace(/<[^>]+>/g, '').replace(/["']/g, '').trim();
    const cleanedSubject = msg.subject
      .replace(/^(re|fwd|order confirmation|your order|receipt|invoice)[:\s-]*/i, '')
      .trim();

    return {
      name: cleanedSubject.slice(0, 60) || 'Imported Fragrance',
      brand: senderName.slice(0, 48) || 'Maison Noiré',
      concentration,
      volumeMilliliters,
      description: msg.snippet.slice(0, 280) || 'Imported from Gmail correspondence.',
    };
  },
};
