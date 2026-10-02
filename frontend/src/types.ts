export interface CreateMessageRequest {
  message: string;
  expiration_minutes: number;
}

export interface CreateMessageResponse {
  token: string;
  expires_at: string;
  url: string;
}

export interface MessageStatusResponse {
  status: 'available' | 'expired' | 'viewed' | 'not_found';
  expires_at?: string;
  created_at?: string;
}

export interface RevealMessageResponse {
  message: string;
  viewed_at: string;
  expires_at: string;
}

export interface ApiError {
  detail: string;
}
