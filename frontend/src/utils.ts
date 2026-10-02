export function formatExpiryText(expiresAtStr?: string, expirationMinutes?: number): string {
  if (!expiresAtStr) {
    if (expirationMinutes) {
      if (expirationMinutes === 10) return '10 minutes';
      if (expirationMinutes === 60) return '1 hour';
      if (expirationMinutes === 1440) return '1 day';
      if (expirationMinutes === 10080) return '7 days';
      return `${expirationMinutes} minutes`;
    }
    return '';
  }

  const expiresDate = new Date(expiresAtStr);
  const now = new Date();
  const diffMs = expiresDate.getTime() - now.getTime();
  const diffMins = Math.max(0, Math.round(diffMs / (1000 * 60)));

  let durationText = '';
  if (diffMins <= 1) {
    durationText = 'less than a minute';
  } else if (diffMins < 60) {
    durationText = `${diffMins} minutes`;
  } else if (diffMins < 1440) {
    const hours = Math.round(diffMins / 60);
    durationText = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.round(diffMins / 1440);
    durationText = `${days} day${days > 1 ? 's' : ''}`;
  }

  // Format the clock time, e.g. "10:42 AM"
  const timeFormatted = expiresDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${durationText} (${timeFormatted})`;
}

export function formatViewedTime(viewedAtStr?: string): string {
  if (!viewedAtStr) return '';
  const viewedDate = new Date(viewedAtStr);
  const timeFormatted = viewedDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `Viewed today at ${timeFormatted}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}
