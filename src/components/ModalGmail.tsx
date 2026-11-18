import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Mail,
  Search,
  RefreshCw,
  Send,
  Trash2,
  ChevronLeft,
  Plus,
  Tag,
  Sparkles,
  FileText,
  Check,
  AlertCircle,
  Reply,
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import {
  GmailService,
  GmailMessageSummary,
  GmailProfile,
  GmailAuthError,
} from '../services/gmailService';
import { Fragrance } from '../types/fragrance';
import { GoogleSignInButton } from './GoogleSignInButton';
import { SoundService } from '../services/sound';

interface ModalGmailProps {
  fragrances: Fragrance[];
  initialComposeFragrance?: Fragrance | null;
  onImportFragrance: (draft: Partial<Fragrance>) => void;
  onClose: () => void;
}

type PendingConfirmation =
  | {
      type: 'send';
      title: string;
      description: string;
      to: string;
      subject: string;
      threadId?: string;
      body: string;
    }
  | {
      type: 'draft';
      title: string;
      description: string;
      to: string;
      subject: string;
      body: string;
    }
  | {
      type: 'trash';
      title: string;
      description: string;
      messageId: string;
      subject: string;
    }
  | {
      type: 'label';
      title: string;
      description: string;
      messageId: string;
      subject: string;
    };

const FRAGRANCE_QUERY = 'perfume OR fragrance OR cologne OR parfum OR sillage OR scent';

export const ModalGmail: React.FC<ModalGmailProps> = ({
  fragrances,
  initialComposeFragrance,
  onImportFragrance,
  onClose,
}) => {
  const { gmailAccessToken, signInWithGoogle, invalidateGmailToken } = useAuth();

  const [view, setView] = useState<'inbox' | 'reader' | 'compose'>(
    initialComposeFragrance ? 'compose' : 'inbox'
  );
  const [filterMode, setFilterMode] = useState<'fragrance' | 'all'>('fragrance');
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageSummary | null>(null);

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeThreadId, setComposeThreadId] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);

  // Pre-fill compose if opened from a bottle detail screen
  useEffect(() => {
    if (initialComposeFragrance) {
      const formatted = GmailService.formatFragranceEmail(initialComposeFragrance);
      setComposeSubject(formatted.subject);
      setComposeBody(formatted.body);
      setComposeThreadId(undefined);
      setView('compose');
    }
  }, [initialComposeFragrance]);

  const loadInbox = useCallback(
    async (token: string, customQuery?: string, modeOverride?: 'fragrance' | 'all') => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const activeMode = modeOverride ?? filterMode;
        const effectiveQuery =
          customQuery !== undefined
            ? customQuery
            : searchQuery.trim()
            ? searchQuery.trim()
            : activeMode === 'fragrance'
            ? FRAGRANCE_QUERY
            : '';

        const [prof, msgs] = await Promise.all([
          GmailService.getProfile(token),
          GmailService.listMessages(token, {
            q: effectiveQuery || undefined,
            labelIds: !effectiveQuery ? ['INBOX'] : undefined,
            maxResults: 12,
          }),
        ]);
        setProfile(prof);
        setMessages(msgs);
      } catch (err: any) {
        if (err instanceof GmailAuthError) {
          invalidateGmailToken();
        }
        setErrorMsg(err?.message || 'Unable to load Gmail messages.');
      } finally {
        setIsLoading(false);
      }
    },
    [filterMode, searchQuery, invalidateGmailToken]
  );

  useEffect(() => {
    if (gmailAccessToken && view === 'inbox') {
      loadInbox(gmailAccessToken);
    }
  }, [gmailAccessToken, filterMode]);

  const handleConnectGoogle = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      SoundService.playTap();
      const token = await signInWithGoogle();
      if (token && view === 'inbox') {
        await loadInbox(token);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google authentication was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailAccessToken) return;
    SoundService.playTap();
    loadInbox(gmailAccessToken, searchQuery.trim());
  };

  const showToast = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3200);
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm || !gmailAccessToken) return;
    const action = pendingConfirm;
    setPendingConfirm(null);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (action.type === 'send') {
        await GmailService.sendMessage(gmailAccessToken, {
          to: action.to,
          subject: action.subject,
          body: action.body,
          threadId: action.threadId,
        });
        SoundService.playSpritz();
        showToast(`Email sent to ${action.to}`);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeThreadId(undefined);
        setView('inbox');
        await loadInbox(gmailAccessToken);
      } else if (action.type === 'draft') {
        await GmailService.createDraft(gmailAccessToken, {
          to: action.to,
          subject: action.subject,
          body: action.body,
        });
        SoundService.playTap();
        showToast('Saved to your Gmail Drafts');
      } else if (action.type === 'trash') {
        await GmailService.trashMessage(gmailAccessToken, action.messageId);
        SoundService.playTap();
        setMessages((prev) => prev.filter((m) => m.id !== action.messageId));
        setSelectedMessage(null);
        setView('inbox');
        showToast('Message moved to Trash');
      } else if (action.type === 'label') {
        const label = await GmailService.ensureNoireLabel(gmailAccessToken);
        await GmailService.modifyLabels(gmailAccessToken, action.messageId, [label.id]);
        SoundService.playTap();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === action.messageId && !m.labelIds.includes(label.id)
              ? { ...m, labelIds: [...m.labelIds, label.id] }
              : m
          )
        );
        if (selectedMessage?.id === action.messageId) {
          setSelectedMessage((prev) =>
            prev && !prev.labelIds.includes(label.id)
              ? { ...prev, labelIds: [...prev.labelIds, label.id] }
              : prev
          );
        }
        showToast('Applied "Noiré" label in Gmail');
      }
    } catch (err: any) {
      if (err instanceof GmailAuthError) {
        invalidateGmailToken();
      }
      setErrorMsg(err?.message || 'Gmail operation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertBottle = (fragId: string) => {
    const frag = fragrances.find((f) => f.id === fragId);
    if (!frag) return;
    SoundService.playTap();
    const formatted = GmailService.formatFragranceEmail(frag);
    setComposeSubject(formatted.subject);
    setComposeBody(formatted.body);
  };

  const handleReply = (msg: GmailMessageSummary) => {
    SoundService.playTap();
    const emailMatch = msg.from.match(/<([^>]+)>/);
    const replyTo = emailMatch ? emailMatch[1] : msg.from;
    setComposeTo(replyTo);
    setComposeSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setComposeBody(`\n\n--- On ${msg.date}, ${msg.from} wrote:\n${msg.snippet}`);
    setComposeThreadId(msg.threadId);
    setView('compose');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md rounded-[32px] glass-panel border border-[rgba(244,233,229,0.2)] p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(244,233,229,0.1)] mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {view !== 'inbox' && gmailAccessToken && (
              <button
                type="button"
                onClick={() => {
                  SoundService.playTap();
                  setView('inbox');
                }}
                aria-label="Back to Gmail inbox"
                className="w-8 h-8 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#F4E9E5] leading-tight">
                Atelier Mail
              </h3>
              <p className="text-[11px] text-[#C8B7B9] font-sans">
                {profile?.emailAddress
                  ? profile.emailAddress
                  : 'Gmail fragrance receipts & scent sharing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {gmailAccessToken && view === 'inbox' && (
              <button
                type="button"
                onClick={() => {
                  SoundService.playTap();
                  setComposeTo('');
                  setComposeSubject('');
                  setComposeBody('');
                  setComposeThreadId(undefined);
                  setView('compose');
                }}
                aria-label="Compose email"
                className="h-9 px-3 rounded-full bg-[#F4E9E5] text-[#10090B] text-xs font-semibold flex items-center gap-1.5 hover:bg-white cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Compose</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                SoundService.playTap();
                onClose();
              }}
              aria-label="Close Atelier Mail"
              className="w-9 h-9 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusBanner && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#2E181D] border border-[#D8A6AC]/40 text-xs text-[#F4E9E5] flex items-center gap-2 flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-[#D8A6AC] flex-shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Unauthenticated / Token Missing View */}
        {!gmailAccessToken ? (
          <div className="py-6 px-2 text-center space-y-5">
            <div className="w-14 h-14 rounded-full glass-card border border-[#D8A6AC]/30 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-[#D8A6AC]" strokeWidth={1.6} />
            </div>

            <div>
              <h4 className="font-serif text-2xl text-[#F4E9E5] mb-2">
                Connect your Gmail
              </h4>
              <p className="text-xs text-[#C8B7B9] leading-relaxed max-w-xs mx-auto">
                Sign in with Google to browse fragrance order confirmations, import bottles directly to your shelf, and send curated scent notes.
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <GoogleSignInButton
                onClick={handleConnectGoogle}
                disabled={isSigningIn}
                label={isSigningIn ? 'Connecting...' : 'Sign in with Google'}
              />
            </div>

            <p className="text-[11px] text-[#C8B7B9]/70 max-w-xs mx-auto">
              Access tokens remain strictly in session memory and are never persisted to browser storage.
            </p>
          </div>
        ) : view === 'inbox' ? (
          /* INBOX VIEW */
          <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-[340px]">
            {/* Search & Filter Row */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-[#C8B7B9]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Gmail messages..."
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.16)] rounded-full pl-8 pr-3 py-2 text-xs text-[#F4E9E5] placeholder-[#C8B7B9]/60 focus:outline-none focus:border-[#D8A6AC]"
                />
              </div>
              <button
                type="button"
                onClick={() => loadInbox(gmailAccessToken)}
                disabled={isLoading}
                aria-label="Refresh Gmail"
                className="w-9 h-9 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </form>

            {/* Filter Mode Switch */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  SoundService.playTap();
                  setSearchQuery('');
                  setFilterMode('fragrance');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                  filterMode === 'fragrance'
                    ? 'bg-[#F4E9E5] text-[#10090B] font-semibold'
                    : 'glass-control text-[#C8B7B9] hover:text-[#F4E9E5]'
                }`}
              >
                Fragrance & Orders
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundService.playTap();
                  setSearchQuery('');
                  setFilterMode('all');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-[#F4E9E5] text-[#10090B] font-semibold'
                    : 'glass-control text-[#C8B7B9] hover:text-[#F4E9E5]'
                }`}
              >
                All Inbox
              </button>
            </div>

            {/* Messages List */}
            {isLoading && messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#C8B7B9]">
                Loading your Gmail correspondence...
              </div>
            ) : messages.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-center my-4">
                <Mail className="w-8 h-8 text-[#D8A6AC] mx-auto mb-2 opacity-60" />
                <p className="font-serif text-base text-[#F4E9E5] mb-1">
                  No messages found
                </p>
                <p className="text-xs text-[#C8B7B9]">
                  {filterMode === 'fragrance'
                    ? 'No fragrance-related emails matched. Try switching to All Inbox.'
                    : 'Try searching with a different keyword.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-2">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => {
                      SoundService.playTap();
                      setSelectedMessage(msg);
                      setView('reader');
                    }}
                    className="w-full text-left p-3.5 rounded-2xl glass-card border border-[rgba(244,233,229,0.12)] hover:border-[#D8A6AC]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-sans text-[#D8A6AC] truncate">
                        {msg.from.replace(/<[^>]+>/g, '').replace(/["']/g, '').trim()}
                      </span>
                      <span className="text-[10px] font-sans text-[#C8B7B9]/75 flex-shrink-0">
                        {msg.date ? new Date(msg.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    <h5 className="font-serif text-sm text-[#F4E9E5] line-clamp-1 mb-1 group-hover:text-white">
                      {msg.subject}
                    </h5>
                    <p className="text-[11px] text-[#C8B7B9] line-clamp-2 leading-relaxed">
                      {msg.snippet}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : view === 'reader' && selectedMessage ? (
          /* MESSAGE READER VIEW */
          <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 min-h-[340px]">
            <div>
              <h4 className="font-serif text-xl text-[#F4E9E5] leading-snug mb-2">
                {selectedMessage.subject}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#C8B7B9]">
                <span className="text-[#D8A6AC] font-medium">{selectedMessage.from}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {selectedMessage.date
                    ? new Date(selectedMessage.date).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  SoundService.playTap();
                  const draft = GmailService.extractFragranceDraftFromEmail(selectedMessage);
                  onImportFragrance(draft);
                }}
                className="px-3 py-1.5 rounded-full bg-[#F4E9E5] text-[#10090B] text-xs font-semibold flex items-center gap-1.5 hover:bg-white cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A34F56]" />
                <span>Import to Shelf</span>
              </button>

              <button
                type="button"
                onClick={() => handleReply(selectedMessage)}
                className="px-3 py-1.5 rounded-full glass-control text-xs text-[#F4E9E5] flex items-center gap-1.5 hover:border-[#D8A6AC] cursor-pointer"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPendingConfirm({
                    type: 'label',
                    title: 'Apply "Noiré" Label?',
                    description: `Create (if needed) and apply the "Noiré" label to "${selectedMessage.subject}" in Gmail?`,
                    messageId: selectedMessage.id,
                    subject: selectedMessage.subject,
                  })
                }
                className="px-3 py-1.5 rounded-full glass-control text-xs text-[#F4E9E5] flex items-center gap-1.5 hover:border-[#D8A6AC] cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-[#D8A6AC]" />
                <span>Label Noiré</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPendingConfirm({
                    type: 'trash',
                    title: 'Move Email to Trash?',
                    description: `Are you sure you want to move "${selectedMessage.subject}" to Trash in your Gmail account?`,
                    messageId: selectedMessage.id,
                    subject: selectedMessage.subject,
                  })
                }
                className="px-3 py-1.5 rounded-full glass-control text-xs text-red-300 flex items-center gap-1.5 hover:border-red-400/50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trash</span>
              </button>
            </div>

            {/* Decoded Body */}
            <div className="glass-card rounded-2xl p-4 text-xs text-[#F4E9E5]/90 leading-relaxed whitespace-pre-wrap font-sans max-h-72 overflow-y-auto">
              {selectedMessage.bodyText || selectedMessage.snippet || 'No message body available.'}
            </div>
          </div>
        ) : (
          /* COMPOSE / SHARE SCENT NOTE VIEW */
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 min-h-[340px] text-xs font-sans">
            {/* Quick Insert from Wardrobe */}
            {fragrances.length > 0 && (
              <div>
                <label className="block text-[10px] font-semibold text-[#D8A6AC] uppercase tracking-wider mb-1">
                  Share a Bottle from Your Shelf
                </label>
                <select
                  onChange={(e) => handleInsertBottle(e.target.value)}
                  defaultValue={initialComposeFragrance?.id || ''}
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3 py-2 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
                >
                  <option value="" disabled>
                    Select a fragrance to pre-fill scent notes...
                  </option>
                  {fragrances.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.brand} ({f.concentration})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-[#C8B7B9] uppercase tracking-wider mb-1">
                To
              </label>
              <input
                type="email"
                required
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#C8B7B9] uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Noiré Scent Note"
                className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#C8B7B9] uppercase tracking-wider mb-1">
                Message
              </label>
              <textarea
                rows={6}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write a personal fragrance note..."
                className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC] resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isLoading || !composeSubject.trim()}
                onClick={() =>
                  setPendingConfirm({
                    type: 'draft',
                    title: 'Save Gmail Draft?',
                    description: `Save "${composeSubject.trim()}" as a draft in your Gmail account?`,
                    to: composeTo.trim(),
                    subject: composeSubject.trim(),
                    body: composeBody,
                  })
                }
                className="px-4 py-3 rounded-full glass-control text-xs font-medium text-[#F4E9E5] flex items-center justify-center gap-1.5 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={isLoading || !composeTo.trim() || !composeSubject.trim()}
                onClick={() =>
                  setPendingConfirm({
                    type: 'send',
                    title: 'Send Email via Gmail?',
                    description: `Send "${composeSubject.trim()}" to ${composeTo.trim()} from your Gmail account?`,
                    to: composeTo.trim(),
                    subject: composeSubject.trim(),
                    body: composeBody,
                    threadId: composeThreadId,
                  })
                }
                className="flex-1 py-3 rounded-full bg-[#F4E9E5] text-[#10090B] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white disabled:opacity-40 cursor-pointer shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        )}

        {/* Explicit User Confirmation Modal for All Mutating/Destructive Gmail Operations */}
        {pendingConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="glass-card max-w-xs w-full p-5 rounded-3xl border border-[rgba(244,233,229,0.22)] text-center shadow-2xl">
              <h4 className="font-serif text-lg text-[#F4E9E5] mb-2">
                {pendingConfirm.title}
              </h4>
              <p className="text-xs text-[#C8B7B9] leading-relaxed mb-5">
                {pendingConfirm.description}
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingConfirm(null)}
                  className="flex-1 py-2.5 rounded-full glass-control text-xs text-[#F4E9E5] hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  className={`flex-1 py-2.5 rounded-full text-xs font-semibold cursor-pointer ${
                    pendingConfirm.type === 'trash'
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : 'bg-[#F4E9E5] text-[#10090B] hover:bg-white'
                  }`}
                >
                  {pendingConfirm.type === 'trash' ? 'Move to Trash' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
