import React, { useState } from 'react';
import { Link2, Loader2, AlertCircle } from 'lucide-react';
import type { CreateMessageRequest } from '../types';

interface CreateMessageCardProps {
  onSubmit: (data: CreateMessageRequest) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

const EXPIRATION_OPTIONS = [
  { label: '10 minutes', value: 10 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
  { label: '7 days', value: 10080 },
];

const MAX_CHARS = 500;

export const CreateMessageCard: React.FC<CreateMessageCardProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const [message, setMessage] = useState('');
  const [expirationMinutes, setExpirationMinutes] = useState(60);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = message.trim();
    if (!trimmed) {
      setValidationError('Please enter a message before generating a link.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setValidationError(`Message cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    await onSubmit({
      message: trimmed,
      expiration_minutes: expirationMinutes,
    });
  };

  const currentLength = message.length;

  return (
    <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
          Create a temporary message
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Your message will disappear after it's been viewed.
        </p>
      </div>

      {(validationError || error) && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <span>{validationError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="message-input"
            className="block text-sm font-medium text-[#111827] mb-1.5"
          >
            Message
          </label>
          <div className="relative">
            <textarea
              id="message-input"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (validationError) setValidationError(null);
              }}
              rows={4}
              maxLength={MAX_CHARS}
              placeholder="e.g. WiFi password: 12345678"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all resize-none disabled:bg-slate-50 disabled:text-slate-400"
              required
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-xs text-[#64748B]">
            <span>Max {MAX_CHARS} characters</span>
            <span
              className={
                currentLength >= MAX_CHARS ? 'text-red-500 font-medium' : ''
              }
            >
              {currentLength}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="expiration-select"
            className="block text-sm font-medium text-[#111827] mb-1.5"
          >
            Expires in
          </label>
          <div className="relative">
            <select
              id="expiration-select"
              value={expirationMinutes}
              onChange={(e) => setExpirationMinutes(Number(e.target.value))}
              disabled={isLoading}
              className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm text-[#111827] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              {EXPIRATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#64748B]">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-white bg-[#111827] hover:bg-[#1E293B] active:bg-[#0F172A] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating link...</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 rotate-[-45deg]" />
              <span>Create secure link</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
