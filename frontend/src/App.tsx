import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CreateMessageCard } from './components/CreateMessageCard';
import { CreatedSuccessCard } from './components/CreatedSuccessCard';
import { ViewMessageCard } from './components/ViewMessageCard';
import { RevealedMessageCard } from './components/RevealedMessageCard';
import { StatusMessageCard } from './components/StatusMessageCard';
import type { StatusType } from './components/StatusMessageCard';
import { ApiService } from './api';
import type {
  CreateMessageRequest,
  CreateMessageResponse,
  MessageStatusResponse,
  RevealMessageResponse,
} from './types';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  // Create Flow State
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdData, setCreatedData] = useState<CreateMessageResponse | null>(null);

  // View Flow State
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusData, setStatusData] = useState<MessageStatusResponse | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedData, setRevealedData] = useState<RevealMessageResponse | null>(null);
  const [viewError, setViewError] = useState<{
    type: StatusType;
    title?: string;
    description?: string;
  } | null>(null);

  // Extract token from search params, hash, or pathname
  const extractTokenFromLocation = (): string | null => {
    // 1. Check search params: ?token=XYZ or ?t=XYZ
    const params = new URLSearchParams(window.location.search);
    const paramToken = params.get('token') || params.get('t') || params.get('m');
    if (paramToken && paramToken.trim()) {
      return paramToken.trim();
    }

    // 2. Check hash: #/XYZ or #XYZ
    if (window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (cleanHash && cleanHash !== 'index.html') {
        return cleanHash;
      }
    }

    // 3. Check pathname
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const segments = rawPath.split('/').filter(Boolean);

    if (segments.length === 0) {
      return null;
    }

    // If hosted under subpath (e.g., /linkexpiry/)
    if (segments[0].toLowerCase() === 'linkexpiry') {
      if (segments.length > 1 && segments[1] !== 'index.html') {
        return segments[1];
      }
      return null;
    }

    // If single segment that isn't index.html
    if (segments.length === 1 && segments[0] !== 'index.html') {
      return segments[0];
    }

    return null;
  };

  // Sync route with URL
  const syncRouteFromPath = useCallback(() => {
    const foundToken = extractTokenFromLocation();

    if (foundToken) {
      setToken(foundToken);
      setCreatedData(null);
      setRevealedData(null);
      setViewError(null);
    } else {
      setToken(null);
      setStatusData(null);
      setRevealedData(null);
      setViewError(null);
    }
  }, []);

  useEffect(() => {
    syncRouteFromPath();

    const handlePopState = () => {
      syncRouteFromPath();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [syncRouteFromPath]);

  // Check status when token changes
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const checkStatus = async () => {
      setIsCheckingStatus(true);
      setViewError(null);
      try {
        const res = await ApiService.getMessageStatus(token);
        if (!isMounted) return;
        setStatusData(res);

        if (res.status === 'not_found') {
          setViewError({
            type: 'not_found',
            title: 'Invalid token',
            description: 'This link is not available.',
          });
        } else if (res.status === 'expired') {
          setViewError({
            type: 'expired',
            title: 'This link has expired',
            description: 'The message is no longer available.',
          });
        } else if (res.status === 'viewed') {
          setViewError({
            type: 'viewed',
            title: 'This message has already been viewed',
            description: 'The content can no longer be accessed.',
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Unable to load message.';
        setViewError({
          type: 'error',
          title: 'Unable to connect',
          description: msg,
        });
      } finally {
        if (isMounted) setIsCheckingStatus(false);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Navigate to home (reset everything)
  const navigateToHome = () => {
    const rawPath = window.location.pathname;
    const homePath = rawPath.includes('/linkexpiry') ? '/linkexpiry/' : '/';
    window.history.pushState({}, '', homePath);
    if (window.location.hash) {
      window.location.hash = '';
    }
    setToken(null);
    setCreatedData(null);
    setStatusData(null);
    setRevealedData(null);
    setViewError(null);
    setCreateError(null);
  };

  // Handle message creation
  const handleCreateSubmit = async (data: CreateMessageRequest) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await ApiService.createMessage(data);
      const currentOrigin = window.location.origin;
      const rawPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
      const cleanBase = `${currentOrigin}${rawPath}`;
      const shareUrl = `${cleanBase}/#/${res.token}`;
      setCreatedData({
        ...res,
        url: shareUrl,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create message';
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle message reveal
  const handleReveal = async () => {
    if (!token) return;
    setIsRevealing(true);
    setViewError(null);
    try {
      const res = await ApiService.revealMessage(token);
      setRevealedData(res);
    } catch (err: unknown) {
      const errObj = err as { message?: string; status?: number };
      const msg = errObj.message || 'Failed to reveal message';

      if (msg.toLowerCase().includes('already been viewed') || errObj.status === 410) {
        setViewError({
          type: 'viewed',
          title: 'This message has already been viewed',
          description: 'The content can no longer be accessed.',
        });
      } else if (msg.toLowerCase().includes('expired')) {
        setViewError({
          type: 'expired',
          title: 'This link has expired',
          description: 'The message is no longer available.',
        });
      } else if (msg.toLowerCase().includes('not found') || errObj.status === 404) {
        setViewError({
          type: 'not_found',
          title: 'Invalid token',
          description: 'This link is not available.',
        });
      } else {
        setViewError({
          type: 'error',
          title: 'Reveal failed',
          description: msg,
        });
      }
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFAFC] text-[#111827]">
      <Header onNavigateHome={navigateToHome} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* State 1 & 2: Creation Mode */}
        {!token && (
          <>
            {createdData ? (
              <CreatedSuccessCard
                data={createdData}
                onCreateAnother={() => setCreatedData(null)}
              />
            ) : (
              <CreateMessageCard
                onSubmit={handleCreateSubmit}
                isLoading={isCreating}
                error={createError}
              />
            )}
          </>
        )}

        {/* State 3, 4, 5, 6: View / Reveal Mode */}
        {token && (
          <>
            {isCheckingStatus ? (
              <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
                <p className="text-sm text-[#64748B]">Checking message security...</p>
              </div>
            ) : viewError ? (
              <StatusMessageCard
                type={viewError.type}
                customTitle={viewError.title}
                customDescription={viewError.description}
                onAction={() => {
                  if (viewError.type === 'error') {
                    window.location.reload();
                  } else {
                    navigateToHome();
                  }
                }}
              />
            ) : revealedData ? (
              <RevealedMessageCard
                message={revealedData.message}
                viewedAt={revealedData.viewed_at}
                onCreateNew={navigateToHome}
              />
            ) : (
              <ViewMessageCard
                expiresAt={statusData?.expires_at}
                onReveal={handleReveal}
                isRevealing={isRevealing}
              />
            )}
          </>
        )}
      </main>

      {/* Minimal clean footer */}
      <footer className="py-6 text-center text-xs text-[#94A3B8]">
        <span>LinkExpiry • End-to-end encrypted temporary messages</span>
      </footer>
    </div>
  );
};

export default App;
