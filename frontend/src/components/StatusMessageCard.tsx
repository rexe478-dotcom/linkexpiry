import React from 'react';
import { Clock, EyeOff, X, AlertCircle, Plus, RefreshCw } from 'lucide-react';

export type StatusType = 'expired' | 'viewed' | 'not_found' | 'error';

interface StatusMessageCardProps {
  type: StatusType;
  customTitle?: string;
  customDescription?: string;
  onAction: () => void;
}

export const StatusMessageCard: React.FC<StatusMessageCardProps> = ({
  type,
  customTitle,
  customDescription,
  onAction,
}) => {
  let icon = <Clock className="w-5 h-5 text-[#64748B]" />;
  let iconBg = 'bg-slate-100 border-slate-200/80';
  let title = 'This link has expired';
  let description = 'The message is no longer available.';
  let buttonText = 'Create a new link';
  let isRetry = false;

  switch (type) {
    case 'expired':
      icon = <Clock className="w-5 h-5 text-[#64748B]" />;
      iconBg = 'bg-slate-100 border-slate-200/80';
      title = customTitle || 'This link has expired';
      description = customDescription || 'The message is no longer available.';
      buttonText = 'Create a new link';
      break;

    case 'viewed':
      icon = <EyeOff className="w-5 h-5 text-[#64748B]" />;
      iconBg = 'bg-slate-100 border-slate-200/80';
      title = customTitle || 'This message has already been viewed';
      description = customDescription || 'The content can no longer be accessed.';
      buttonText = 'Create a new link';
      break;

    case 'not_found':
      icon = <X className="w-5 h-5 text-red-500" />;
      iconBg = 'bg-red-50 border-red-100';
      title = customTitle || 'Invalid token';
      description = customDescription || 'This link is not available.';
      buttonText = 'Create a new link';
      break;

    case 'error':
      icon = <AlertCircle className="w-5 h-5 text-amber-600" />;
      iconBg = 'bg-amber-50 border-amber-100';
      title = customTitle || 'Unable to load message';
      description = customDescription || 'An unexpected error occurred. Please try again.';
      buttonText = 'Try again';
      isRetry = true;
      break;
  }

  return (
    <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs text-center">
      {/* Top Status Icon Badge */}
      <div className="flex justify-center mb-5">
        <div
          className={`w-12 h-12 rounded-full border flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="mb-7">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
          {title}
        </h2>
        <p className="text-sm text-[#64748B] mt-1.5">{description}</p>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onAction}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-[#111827] bg-white hover:bg-[#F8FAFC] active:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 cursor-pointer"
      >
        {isRetry ? (
          <>
            <RefreshCw className="w-4 h-4 text-[#64748B]" />
            <span>{buttonText}</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 text-[#64748B]" />
            <span>{buttonText}</span>
          </>
        )}
      </button>
    </div>
  );
};
