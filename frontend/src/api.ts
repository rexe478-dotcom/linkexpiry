import type {
  CreateMessageRequest,
  CreateMessageResponse,
  MessageStatusResponse,
  RevealMessageResponse,
} from './types';

const rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawBase.endsWith('/api') ? rawBase : rawBase.endsWith('/') ? `${rawBase}api` : `${rawBase}/api`;

export class ApiService {
  static async createMessage(data: CreateMessageRequest): Promise<CreateMessageResponse> {
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.detail || 'Failed to create temporary message');
      }

      return json as CreateMessageResponse;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  static async getMessageStatus(token: string): Promise<MessageStatusResponse> {
    try {
      const response = await fetch(`${API_BASE}/messages/${encodeURIComponent(token)}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.detail || 'Failed to load message status');
      }

      return json as MessageStatusResponse;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unable to connect to server.');
    }
  }

  static async revealMessage(token: string): Promise<RevealMessageResponse> {
    try {
      const response = await fetch(
        `${API_BASE}/messages/${encodeURIComponent(token)}/reveal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const json = await response.json();

      if (!response.ok) {
        const error = new Error(json.detail || 'This message cannot be revealed.');
        (error as { status?: number }).status = response.status;
        throw error;
      }

      return json as RevealMessageResponse;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Network error while revealing message.');
    }
  }
}
