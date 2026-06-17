import { useState, useMemo, useCallback, useEffect, useRef, type CSSProperties } from 'react';
import {
  DocuSignShell,
  AgreementTableView,
  DataTable,
  PageHeader,
  FilterBar,
  Button,
  Banner,
  Badge,
  ComboButton,
  AIIcon,
  AIBadge,
  Accordion,
  Avatar,
  Divider,
  Input,
  IrisIcon,
  Icon,
  IconButton,
  Card,
  Stack,
  Grid,
  Inline,
  Container,
  Heading,
  Tabs,
  Text,
  Chip,
  StatusLight,
  Link,
  dataTableStyles,
} from '@/design-system';

/* ═══════════════════════════════════════
   DataTable Row Stagger Animation (CSS)
   ═══════════════════════════════════════ */

const tableRowStaggerStyles = `
@keyframes inkRowEntrance {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply staggered entrance to DataTable body rows */
[data-ink-component="DataTable"] tbody tr {
  animation: inkRowEntrance 300ms cubic-bezier(0.33, 0, 0.67, 1) backwards;
}

/* Stagger rows — 20ms increments, capped at 10 rows (200ms) */
[data-ink-component="DataTable"] tbody tr:nth-child(1) { animation-delay: 0ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(2) { animation-delay: 20ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(3) { animation-delay: 40ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(4) { animation-delay: 60ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(5) { animation-delay: 80ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(6) { animation-delay: 100ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(7) { animation-delay: 120ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(8) { animation-delay: 140ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(9) { animation-delay: 160ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(10) { animation-delay: 180ms; }
[data-ink-component="DataTable"] tbody tr:nth-child(n+11) { animation-delay: 200ms; }

@keyframes iris-dot-pulse {
  0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
  40% { transform: scale(1); opacity: 1; }
}
.iris-thinking-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ink-text-secondary, #6b6b7a);
  display: inline-block;
  animation: iris-dot-pulse 1.4s ease-in-out infinite;
}
.iris-thinking-dot:nth-child(1) { animation-delay: 0s; }
.iris-thinking-dot:nth-child(2) { animation-delay: 0.18s; }
.iris-thinking-dot:nth-child(3) { animation-delay: 0.36s; }

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  [data-ink-component="DataTable"] tbody tr {
    animation: none;
  }
}

@keyframes shimmer {
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
.answer-skeleton-line {
  background: linear-gradient(90deg, #f0f0f3 25%, #e4e4ea 50%, #f0f0f3 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 4px;
}

@keyframes chipFadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}
.chip-fade-in {
  animation: chipFadeIn 320ms cubic-bezier(0.33, 0, 0.67, 1) both;
}
`;

/* ═══════════════════════════════════════
   Entrance Animation Hooks
   ═══════════════════════════════════════ */

/**
 * Hook for staggered entrance animations.
 * Returns a function that generates style props for each item.
 */
function useStaggerEntrance(itemCount: number, options?: {
  baseDelay?: number;
  staggerInterval?: number;
  duration?: number;
  distance?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const {
    baseDelay = 0,
    staggerInterval = 30,
    duration = 400,
    distance = 8,
  } = options || {};

  return (index: number) => ({
    style: {
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : `translateY(${distance}px)`,
      transition: `opacity ${duration}ms cubic-bezier(0.33, 0, 0.67, 1) ${baseDelay + index * staggerInterval}ms, transform ${duration}ms cubic-bezier(0.35, 0, 0.2, 1) ${baseDelay + index * staggerInterval}ms`,
    } as CSSProperties,
  });
}

/**
 * Hook for a simple fade-in on mount.
 */
function useFadeIn(delay: number = 0, duration: number = 300) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return {
    style: {
      opacity: mounted ? 1 : 0,
      transition: `opacity ${duration}ms cubic-bezier(0.33, 0, 0.67, 1) ${delay}ms`,
    } as CSSProperties,
  };
}

/**
 * Wrapper component that fades in its children.
 * Use key={someValue} on the component to re-trigger on changes.
 */
function FadeIn({ children, keyProp: _keyProp }: { children: React.ReactNode; keyProp: string }) {
  const fade = useFadeIn(0, 250);
  return <div {...fade}>{children}</div>;
}

/* ═══════════════════════════════════════
   Suggested Questions
   ═══════════════════════════════════════ */

const SUGGESTED_QUESTIONS = [
  { id: 'sq_current', icon: 'filter' as const, query: 'Show me contracts expiring in the next 6 months', description: 'Current state · applies filters and returns matching agreements' },
  { id: 'sq3', icon: 'calendar' as const, query: 'Show me all vendor contracts expiring in the next 6 months', description: 'Future state · AI-guided analysis, risk identification, and structured worksheet' },
];

function SuggestionsDropdown({ onSelect }: { onSelect: (q: string, id: string) => void }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--ink-border-color-subtle)',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 16px 6px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ink-text-secondary)',
      }}>
        Suggested Questions
      </div>
      {SUGGESTED_QUESTIONS.map((q, i) => (
        <button
          key={q.id}
          onMouseDown={(e) => { e.preventDefault(); onSelect(q.query, q.id); }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            width: '100%',
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderTop: i === 0 ? 'none' : '1px solid var(--ink-border-color-subtle)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f5f5f7)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
        >
          <Icon name={q.icon} size={16} color="var(--ink-text-secondary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-text-primary)', lineHeight: 1.4 }}>{q.query}</span>
              {q.id === 'sq_current' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'var(--ink-text-secondary)', background: 'var(--ink-neutral-fade-05, #f5f5f7)', border: '1px solid var(--ink-border-color-default)', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Current state
                </span>
              )}
              {q.id === 'sq3' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'var(--ink-green-80, #2f9e44)', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-green-80, #2f9e44)', flexShrink: 0 }} />
                  Future state
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-text-secondary)', marginTop: '2px' }}>{q.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   Iris Sidebar
   ═══════════════════════════════════════ */

function IrisThinkingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: '4px 16px 16px 16px', width: 'fit-content' }}>
      <span className="iris-thinking-dot" />
      <span className="iris-thinking-dot" />
      <span className="iris-thinking-dot" />
    </div>
  );
}

function IrisUserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ background: 'var(--ink-neutral-fade-10, #f0f0f3)', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', maxWidth: '82%', fontSize: '14px', lineHeight: 1.5 }}>
        {text}
      </div>
    </div>
  );
}

function IrisSidebar({ question, followUp, onClose, onBuildWorksheet, worksheetMode }: {
  question: string; followUp?: string; onClose: () => void; onBuildWorksheet?: (type: string) => void; worksheetMode?: boolean;
}) {
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [followUpReady, setFollowUpReady] = useState(false);
  const _qi = question.toLowerCase();
  const _isRenewalInit = followUp && ((_qi.includes('6 month') || _qi.includes('six month')) && (_qi.includes('expir') || _qi.includes('renew') || _qi.includes('vendor')));
  const [convStep, setConvStep] = useState(_isRenewalInit ? 1 : 0);
  const [userMessages, setUserMessages] = useState<string[]>(_isRenewalInit ? [followUp as string] : []);
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [initialReady, setInitialReady] = useState(false);
  const [cameFromAnswerBlock] = useState(!!_isRenewalInit);
  const [chipsReady, setChipsReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX - ev.clientX;
      setSidebarWidth(Math.max(300, Math.min(720, startWidth + delta)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 80);
    }
  }, [convStep, followUp, isThinking, followUpReady]);

  useEffect(() => {
    if (followUp) {
      setFollowUpReady(false);
      const t = setTimeout(() => setFollowUpReady(true), 1300);
      return () => clearTimeout(t);
    }
  }, [followUp]);

  useEffect(() => {
    const delay = cameFromAnswerBlock ? 1800 : 1600;
    const t = setTimeout(() => setInitialReady(true), delay);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isThinking) { setChipsReady(false); return; }
    if (!initialReady) return;
    const t = setTimeout(() => setChipsReady(true), 500);
    return () => clearTimeout(t);
  }, [isThinking, initialReady]);

  const q = question.toLowerCase();
  const fq = (followUp || '').toLowerCase();
  const isPriceRaiseFlow = (q.includes('renewal') || q.includes('renew')) &&
    (q.includes('6') || q.includes('six')) && q.includes('month') &&
    (fq.includes('raise') || fq.includes('price') || fq.includes('increase'));

  const isVendorExposureFlow = (q.includes('spend') || q.includes('committed') || q.includes('exposure') || (q.includes('acme') && (q.includes('total') || q.includes('?')))) &&
    (fq.includes('volume') || fq.includes('seat') || fq.includes('grown') || fq.includes('overcharged') || fq.includes('analyze') || fq.includes('growth') || fq.includes('over') || fq.includes('usage') || fq.includes('using'));

  const isSLAFlow = q.includes('software') && q.includes('sla');
  const isPartyFlow = q.trim() === 'acme';
  const isRenewalScanFlow = (q.includes('6 month') || q.includes('six month')) && (q.includes('expir') || q.includes('renew') || q.includes('vendor'));

  const sendMessage = (msg: string) => {
    setUserMessages(prev => [...prev, msg]);
    setInputValue('');
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      if ((isPriceRaiseFlow || isVendorExposureFlow || isSLAFlow || isPartyFlow) && convStep === 0) setConvStep(1);
      if (isRenewalScanFlow && convStep < 2) setConvStep(convStep + 1);
    }, 1300);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
  };

  const irisInputArea = (
    <div style={{ borderTop: '1px solid var(--ink-border-color-subtle)', padding: '10px 12px', flexShrink: 0 }}>
      {isPriceRaiseFlow && convStep === 0 && (
        <div style={{ marginBottom: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue('By how much?'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-default)', borderRadius: 16, padding: '6px 12px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Icon name="reply" size={13} color="var(--ink-text-secondary)" />
            By how much?
          </button>
        </div>
      )}
      {isVendorExposureFlow && convStep === 0 && (
        <div style={{ marginBottom: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue('Are we over our committed seat usage?'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-default)', borderRadius: 16, padding: '6px 12px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Icon name="reply" size={13} color="var(--ink-text-secondary)" />
            Are we over our committed seat usage?
          </button>
        </div>
      )}
      {isRenewalScanFlow && convStep === 0 && userMessages.length === 0 && chipsReady && (
        <div className="chip-fade-in" style={{ marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          {[
            'Check for both risks',
            'Check auto-renewals only',
            'Filter by price increases',
          ].map((label) => (
            <button
              key={label}
              onMouseDown={(e) => { e.preventDefault(); sendMessage(label); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '6px 14px', fontSize: 12, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f7f7f9)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {isRenewalScanFlow && convStep === 1 && userMessages.length === 1 && chipsReady && (
        <div className="chip-fade-in" style={{ marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          {[
            'Add Primary Owner',
            'Add Current Annual Spend',
            'Add both fields',
            'Keep as is',
          ].map((label) => (
            <button
              key={label}
              onMouseDown={(e) => { e.preventDefault(); sendMessage(label); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '6px 14px', fontSize: 12, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f7f7f9)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {isSLAFlow && convStep === 0 && (
        <div style={{ marginBottom: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue('Which claim windows are still open?'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-default)', borderRadius: 16, padding: '6px 12px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Icon name="reply" size={13} color="var(--ink-text-secondary)" />
            Which claim windows are still open?
          </button>
        </div>
      )}
      {isPartyFlow && followUp && convStep === 0 && (
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {(followUp.toLowerCase().includes('expir') ? [
            { label: 'What are the notice periods?', val: 'What notice periods apply to those agreements?' },
          ] : [
            { label: 'What are the renewal terms?', val: 'What are the renewal terms in the MSA?' },
          ]).map(chip => (
            <button
              key={chip.label}
              onMouseDown={(e) => { e.preventDefault(); setInputValue(chip.val); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-default)', borderRadius: 16, padding: '6px 12px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <Icon name="reply" size={13} color="var(--ink-text-secondary)" />
              {chip.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 8px 8px 18px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Ask a question..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}
        />
        <button onClick={handleSend} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: inputValue.trim() ? 'pointer' : 'default', background: inputValue.trim() ? 'var(--ink-purple-100, #4B47C8)' : 'rgba(75,71,200,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 150ms', color: '#fff' }}>
          <Icon name="arrow-up" size={15} color="#fff" />
        </button>
      </div>
      <Text size="xs" color="secondary" style={{ marginTop: 6, textAlign: 'center', display: 'block', lineHeight: 1.4, fontStyle: 'italic' }}>
        Responses are generated with AI and should not be used as legal advice.{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn how we use AI at Docusign.</span>
      </Text>
    </div>
  );

  return (
    <div style={{ width: mounted ? `${sidebarWidth}px` : '0px', flexShrink: 0, overflow: 'hidden', transition: isDragging.current ? 'none' : 'width 350ms cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}>
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, cursor: 'col-resize', zIndex: 10, background: 'transparent' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-30, #ddd9ff)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      />
    <div style={{ width: `${sidebarWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', borderLeft: '1px solid var(--ink-border-color-subtle)', background: '#fff', overflow: 'hidden', transform: mounted ? 'translateX(0)' : 'translateX(100%)', transition: isDragging.current ? 'none' : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', height: '48px', borderBottom: '1px solid var(--ink-border-color-subtle)', flexShrink: 0 }}>
        <Inline gap="small" align="center">
          <IconButton icon="menu" variant="tertiary" size="small" aria-label="Menu" />
          <Inline gap="xs" align="center">
            <IrisIcon />
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Iris</span>
            <Icon name="chevron-down" size={14} color="var(--ink-text-secondary)" />
          </Inline>
        </Inline>
        <Inline gap="xs" align="center">
          <IconButton icon="arrows-out" variant="tertiary" size="small" aria-label="Expand" />
          <IconButton icon="external-link" variant="tertiary" size="small" aria-label="Open in new tab" />
          <IconButton icon="close" variant="tertiary" size="small" aria-label="Close" onClick={onClose} />
        </Inline>
      </div>

      {/* ── Price-raise flow ── */}
      {isPriceRaiseFlow ? (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Original search bubble */}
            <IrisUserBubble text={question} />
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">Read 7 agreements</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>

            {/* Initial answer — matches answer card */}
            <Stack gap="small">
              <Text size="sm" style={{ lineHeight: 1.65 }}>
                You have <strong>7 agreements</strong> renewing in the next 6 months, totaling <strong>$535K</strong> in contract value. <strong>3 include pricing cap provisions</strong>.
              </Text>
              <Inline gap="xs">
                <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
              </Inline>
            </Stack>

            {/* Follow-up bubble */}
            {followUp && <IrisUserBubble text={followUp} />}
            {followUp && !followUpReady && <IrisThinkingBubble />}

            {/* Iris eligibility analysis */}
            {followUp && followUpReady && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  I reviewed the pricing clauses across all 7 renewal agreements. <strong>3 are eligible for a price increase</strong> — their contracts include fixed-cap provisions that allow a raise at renewal. The other 4 are CPI-linked only and don't allow discretionary increases beyond inflation.
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { name: 'MSA - Globex.pdf', note: 'Fixed 4% cap · eligible' },
                    { name: 'MSA - BioCore Innovations.pdf', note: 'Fixed 4% cap · eligible' },
                    { name: 'SOW - Beacon Law Group.pdf', note: 'CPI + 1% · eligible' },
                  ].map(r => (
                    <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Inline gap="xs" align="center">
                        <Icon name="document" size={13} color="var(--ink-text-secondary)" />
                        <Text size="xs">{r.name}</Text>
                      </Inline>
                      <Text size="xs" color="secondary">{r.note}</Text>
                    </div>
                  ))}
                </div>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                </Inline>
              </Stack>
            )}

            {/* Thinking after step 0 send */}
            {isThinking && followUpReady && <IrisThinkingBubble />}

            {/* Step 1: user asked "By how much?" */}
            {convStep >= 1 && !isThinking && (
              <>
                <IrisUserBubble text="By how much?" />
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>
                    Each eligible contract allows a <strong>fixed 4% increase</strong> at renewal. Here's the breakdown:
                  </Text>
                  <div style={{ borderRadius: 8, border: '1px solid var(--ink-border-color-subtle)', overflow: 'hidden' }}>
                    {[
                      { name: 'MSA - Globex', current: '$95,000/yr', raise: '+$3,800' },
                      { name: 'MSA - BioCore Innovations', current: '$140,000/yr', raise: '+$5,600' },
                      { name: 'SOW - Beacon Law Group', current: '$78,000/yr', raise: '+$3,120' },
                    ].map((r, i) => (
                      <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: '#fff' }}>
                        <Text size="sm">{r.name}</Text>
                        <Inline gap="small" align="center">
                          <Text size="xs" color="secondary">{r.current}</Text>
                          <span style={{ fontSize: 13, color: 'var(--ink-green-80, #2f9e44)', fontWeight: 600 }}>{r.raise}</span>
                        </Inline>
                      </div>
                    ))}
                    <div style={{ padding: '9px 14px', borderTop: '1px solid var(--ink-border-color-subtle)', background: 'var(--ink-neutral-fade-05, #f7f7f9)', display: 'flex', justifyContent: 'space-between' }}>
                      <Text size="sm" style={{ fontWeight: 600 }}>Total additional revenue</Text>
                      <span style={{ fontSize: 13, color: 'var(--ink-green-80, #2f9e44)', fontWeight: 700 }}>+$12,520/yr</span>
                    </div>
                  </div>
                  <Inline gap="xs">
                    <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                    <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  </Inline>

                  {/* Proactive worksheet CTA */}
                  <div style={{ background: 'var(--ink-purple-10, #f5f3ff)', border: '1px solid var(--ink-purple-30, #ddd9ff)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <Inline gap="xs" align="center">
                      <IrisIcon />
                      <Text size="sm" style={{ fontWeight: 600 }}>Build a Price Raise Worksheet?</Text>
                    </Inline>
                    <Text size="sm" style={{ lineHeight: 1.6, color: 'var(--ink-text-secondary)' }}>
                      A worksheet will extract notice deadlines, calculate raise amounts per cap type, and list each eligible agreement in a single view.
                    </Text>
                    <Inline gap="small">
                      <button onClick={() => { if (onBuildWorksheet) onBuildWorksheet('price-raise-renewals'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Yes, build it
                        <Icon name="arrow-right" size={13} color="#fff" />
                      </button>
                      <button style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-text-secondary)', cursor: 'pointer', fontFamily: 'inherit', padding: '8px 4px' }}>
                        No thanks
                      </button>
                    </Inline>
                  </div>
                </Stack>
              </>
            )}
          </div>
          {irisInputArea}
        </>
      ) : isVendorExposureFlow ? (
        /* ── Vendor exposure scripted flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IrisUserBubble text={question} />
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">Read 3 Acme agreements</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>
            <Stack gap="small">
              <Text size="sm" style={{ lineHeight: 1.65 }}>
                You have <strong>3 active agreements</strong> with Acme Corp totaling <strong>$225K/yr</strong> in committed spend — an MSA ($180K), a SOW ($45K), and a DPA. The MSA is your primary cost driver and is active until April 2027.
              </Text>
              <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { name: 'MSA - Acme Corp.pdf', value: '$180K/yr', note: 'Primary · 720 seats' },
                  { name: 'SOW - Acme Implementation.pdf', value: '$45K', note: 'Fixed scope' },
                  { name: 'DPA - Acme Corp.pdf', value: '—', note: 'Data processing' },
                ].map(r => (
                  <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Inline gap="xs" align="center">
                      <Icon name="document" size={13} color="var(--ink-text-secondary)" />
                      <Text size="xs">{r.name}</Text>
                    </Inline>
                    <Inline gap="small" align="center">
                      <Text size="xs" color="secondary">{r.note}</Text>
                      <Text size="xs" style={{ fontWeight: 600 }}>{r.value}</Text>
                    </Inline>
                  </div>
                ))}
              </div>
              <Inline gap="xs">
                <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
              </Inline>
            </Stack>

            {followUp && <IrisUserBubble text={followUp} />}
            {followUp && !followUpReady && <IrisThinkingBubble />}

            {followUp && followUpReady && (
              <Stack gap="small">
                <Inline gap="xs" align="center">
                  <Text size="xs" color="secondary">Analyzing volume metrics across agreements</Text>
                  <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                </Inline>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Seat usage has grown from <strong>500 → 720 seats (+44%)</strong> since the MSA was signed in April 2022. The contract rate was set at the 500-seat tier and has not been renegotiated.
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Text size="xs" style={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-text-secondary)', display: 'block' }}>Contract terms</Text>
                  {[
                    { icon: 'arrow-up' as const, text: 'Seat volume: 500 contracted → 720 current (+44%)', color: 'var(--ink-text-primary)' },
                    { icon: 'document' as const, text: 'MFN clause (§8.3) — most favored nation pricing applies', color: 'var(--ink-text-primary)' },
                    { icon: 'calendar' as const, text: 'MSA renewal: April 2027', color: 'var(--ink-text-secondary)' },
                  ].map((item, i) => (
                    <Inline key={i} gap="xs" align="center">
                      <Icon name={item.icon} size={13} color={item.color} />
                      <Text size="xs" style={{ color: item.color }}>{item.text}</Text>
                    </Inline>
                  ))}
                </div>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                </Inline>
              </Stack>
            )}

            {isThinking && followUpReady && <IrisThinkingBubble />}

            {convStep >= 1 && !isThinking && (
              <>
                <IrisUserBubble text="Are we over our committed seat usage?" />
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>
                    Yes — you're running <strong>44% over your committed volume</strong>. The MSA locked in pricing at 500 seats, but you're currently using 720. That gap isn't being billed right now, but Acme could bring it up at your April 2027 renewal as a true-up or use it as leverage to renegotiate the rate.
                  </Text>
                  <div style={{ borderRadius: 8, border: '1px solid var(--ink-border-color-subtle)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
                      <Text size="xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-text-secondary)' }}>Seat usage</Text>
                      <Text size="xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-text-secondary)' }}>Count</Text>
                    </div>
                    {[
                      { label: 'Contracted (MSA)', count: '500 seats', color: 'var(--ink-text-primary)', bg: '#fff' },
                      { label: 'Current usage', count: '720 seats', color: 'var(--ink-red-80, #c92a2a)', bg: 'var(--ink-red-10, #fff5f5)' },
                    ].map((r, i) => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: r.bg }}>
                        <Text size="sm">{r.label}</Text>
                        <span style={{ fontSize: 13, color: r.color, fontWeight: 600 }}>{r.count}</span>
                      </div>
                    ))}
                    <div style={{ padding: '8px 14px', borderTop: '1px solid var(--ink-border-color-subtle)', background: 'var(--ink-red-10, #fff5f5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text size="xs" color="secondary">Overage</Text>
                      <span style={{ fontSize: 12, color: 'var(--ink-red-80, #c92a2a)', fontWeight: 600 }}>+220 seats (+44%)</span>
                    </div>
                  </div>
                  <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                    The MSA includes an MFN clause (§8.3) that gives you some pricing protection, but the overage leaves you exposed going into renewal.
                  </Text>
                  <Inline gap="xs">
                    <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                    <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  </Inline>
                  {!worksheetMode ? (
                    <div style={{ background: 'var(--ink-purple-10, #f5f3ff)', border: '1px solid var(--ink-purple-30, #ddd9ff)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                      <Inline gap="xs" align="center">
                        <IrisIcon />
                        <Text size="sm" style={{ fontWeight: 600 }}>Want to dig into this further?</Text>
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                        I can pull together all your Acme agreements into a single view — committed spend, seat counts, and the MFN language — so you have the full picture before renewal comes up.
                      </Text>
                      <Inline gap="small">
                        <button onClick={() => { if (onBuildWorksheet) onBuildWorksheet('vendor-exposure-acme'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Yes, let's do it
                          <Icon name="arrow-right" size={13} color="#fff" />
                        </button>
                        <button style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-text-secondary)', cursor: 'pointer', fontFamily: 'inherit', padding: '8px 4px' }}>
                          Not right now
                        </button>
                      </Inline>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 8 }}>
                        <Icon name="status-check" size={14} color="var(--ink-green-80, #2f9e44)" />
                        <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Vendor Exposure Worksheet built</Text>
                      </div>
                      <Stack gap="small">
                        <Text size="sm" style={{ lineHeight: 1.65 }}>
                          Your worksheet is ready. Try these to build it out further:
                        </Text>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[
                            { label: 'Add a column for notice period to terminate', icon: 'plus' as const },
                            { label: 'Flag any auto-renewal clauses', icon: 'status-check' as const },
                            { label: 'Add a column comparing per-seat rate to market', icon: 'chart-bar' as const },
                            { label: 'Extract any volume discount thresholds', icon: 'document' as const },
                          ].map(chip => (
                            <button
                              key={chip.label}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-default)', borderRadius: 20, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                            >
                              <Icon name={chip.icon} size={13} color="var(--ink-purple-100, #4B47C8)" />
                              {chip.label}
                            </button>
                          ))}
                        </div>
                        <Inline gap="xs" style={{ marginTop: 4 }}>
                          <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                          <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                        </Inline>
                      </Stack>
                    </div>
                  )}
                </Stack>
              </>
            )}
          </div>
          {irisInputArea}
        </>
      ) : isSLAFlow ? (
        /* ── SLA Remedies scripted flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IrisUserBubble text={question} />
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">Read 4 software agreements</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>

            {/* Initial: SLA overview table */}
            <Stack gap="small">
              <Text size="sm" style={{ lineHeight: 1.65 }}>
                <strong>4 software agreements</strong> include explicit SLA provisions. Uptime thresholds range from <strong>99.0% to 99.9%</strong>, with service credits from 5–20% of monthly fees. <strong>2 contracts grant termination rights</strong> after 3 consecutive breaches — your Globex MSA and BioCore Innovations MSA.
              </Text>
              <div style={{ borderRadius: 8, border: '1px solid var(--ink-border-color-subtle)', overflow: 'hidden' }}>
                {[
                  { vendor: 'Acme Corp', uptime: '99.9%', credit: '10% / mo', window: '30 days', termination: '—' },
                  { vendor: 'Globex', uptime: '99.5%', credit: '15% / mo', window: '30 days', termination: 'Yes — 3 breaches' },
                  { vendor: 'BioCore Innovations', uptime: '99.9%', credit: '20% / mo', window: '30 days', termination: 'Yes — 3 breaches' },
                  { vendor: 'Pinnacle Consulting', uptime: '99.0%', credit: '5% / mo', window: '60 days', termination: '—' },
                ].map((r, i) => (
                  <div key={r.vendor} style={{ display: 'grid', gridTemplateColumns: '1fr 14% 14% 14% 1fr', alignItems: 'center', padding: '8px 12px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: '#fff', gap: 8 }}>
                    <Text size="xs" style={{ fontWeight: 500 }}>{r.vendor}</Text>
                    <Text size="xs" color="secondary">{r.uptime}</Text>
                    <Text size="xs" color="secondary">{r.credit}</Text>
                    <Text size="xs" color="secondary">{r.window}</Text>
                    <Text size="xs" style={{ color: r.termination !== '—' ? 'var(--ink-orange-80, #e67700)' : 'var(--ink-text-secondary)' }}>{r.termination}</Text>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 14% 14% 14% 1fr', padding: '6px 12px', background: 'var(--ink-neutral-fade-05, #f7f7f9)', gap: 8, borderTop: '1px solid var(--ink-border-color-subtle)' }}>
                  {['Vendor', 'Uptime SLA', 'Credit', 'Claim Window', 'Termination'].map(h => (
                    <Text key={h} size="xs" style={{ fontWeight: 600, color: 'var(--ink-text-secondary)', fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</Text>
                  ))}
                </div>
              </div>
              <Inline gap="xs">
                <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
              </Inline>
            </Stack>

            {/* followUp: "Show me specific SLA clauses and remedies" */}
            {followUp && <IrisUserBubble text={followUp} />}
            {followUp && !followUpReady && <IrisThinkingBubble />}

            {followUp && followUpReady && (
              <Stack gap="small">
                <Inline gap="xs" align="center">
                  <Text size="xs" color="secondary">Extracting clause language from Globex MSA</Text>
                  <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                </Inline>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  The <strong>Globex MSA</strong> has your strongest remedy structure — a tiered credit schedule and explicit termination right. Here's the exact language from §8.2:
                </Text>
                {/* Document excerpt card */}
                <div style={{ background: '#fafafa', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, borderLeft: '3px solid var(--ink-purple-100, #4B47C8)', padding: '14px 16px' }}>
                  <Inline gap="xs" align="center" style={{ marginBottom: 10 }}>
                    <Icon name="document" size={13} color="var(--ink-text-secondary)" />
                    <Text size="xs" color="secondary" style={{ fontStyle: 'italic' }}>MSA - Globex.pdf · §8.2 Service Level Agreement</Text>
                  </Inline>
                  <p style={{ margin: 0, fontSize: 12.5, fontStyle: 'italic', lineHeight: 1.75, color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}>
                    "…Provider shall issue a service credit equal to <strong style={{ fontStyle: 'normal' }}>15% of the monthly fee</strong> for each full hour of Unplanned Downtime exceeding the <strong style={{ fontStyle: 'normal' }}>99.5% uptime threshold</strong>. Credits must be claimed within <strong style={{ fontStyle: 'normal' }}>30 days</strong> of the incident by submitting a written request to support@globex.com. After <strong style={{ fontStyle: 'normal' }}>3 consecutive months</strong> of SLA breaches, Customer may terminate this Agreement upon 30 days written notice without penalty…"
                  </p>
                </div>
                {/* Credit schedule table */}
                <Text size="xs" style={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-text-secondary)', display: 'block', marginTop: 2 }}>Credit schedule — Globex MSA §8.2</Text>
                <div style={{ borderRadius: 8, border: '1px solid var(--ink-border-color-subtle)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
                    <Text size="xs" style={{ fontWeight: 600, color: 'var(--ink-text-secondary)', fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Breach Level</Text>
                    <Text size="xs" style={{ fontWeight: 600, color: 'var(--ink-text-secondary)', fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Credit</Text>
                  </div>
                  {[
                    { level: '< 99.5% uptime  (≥ 3.6 hrs/mo down)', credit: '15% monthly fee' },
                    { level: '< 99.0% uptime  (≥ 7.2 hrs/mo down)', credit: '25% monthly fee' },
                    { level: '< 95.0% uptime  (≥ 36 hrs/mo down)', credit: '50% monthly fee' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: '#fff' }}>
                      <Text size="xs">{r.level}</Text>
                      <Text size="xs" style={{ fontWeight: 600 }}>{r.credit}</Text>
                    </div>
                  ))}
                </div>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  2 other contracts have similar provisions — <strong>Acme Corp</strong> (10% credit, 30-day window, no termination right) and <strong>BioCore Innovations</strong> (20% credit, 30-day window, termination right after 3 breaches). Pinnacle Consulting is least favorable: 5% credit with a 60-day claim window.
                </Text>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                </Inline>
              </Stack>
            )}

            {isThinking && followUpReady && <IrisThinkingBubble />}

            {/* convStep 1: claim window status */}
            {convStep >= 1 && !isThinking && (
              <>
                <IrisUserBubble text="Which claim windows are still open?" />
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>
                    Based on reported uptime data, <strong>2 agreements have claimable breaches</strong> within their claim windows. 1 window has closed; 1 had no breach in the last 90 days.
                  </Text>
                  <div style={{ borderRadius: 8, border: '1px solid var(--ink-border-color-subtle)', overflow: 'hidden' }}>
                    {[
                      { vendor: 'Acme Corp', breach: 'May — 99.2% actual (breach)', tag: '22 days left', tagColor: 'var(--ink-green-80, #2f9e44)', bg: '#fff' },
                      { vendor: 'BioCore Innovations', breach: 'Apr — 98.6% actual (breach)', tag: '8 days left', tagColor: 'var(--ink-orange-80, #e67700)', bg: 'var(--ink-orange-10, #fff8f0)' },
                      { vendor: 'Pinnacle Consulting', breach: 'Mar — 98.9% actual (breach)', tag: 'Window closed', tagColor: 'var(--ink-red-80, #c92a2a)', bg: '#fff' },
                      { vendor: 'Globex', breach: 'No breach in last 90 days', tag: null, tagColor: null, bg: '#fff' },
                    ].map((r, i) => (
                      <div key={r.vendor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: r.bg }}>
                        <div>
                          <Text size="sm" style={{ fontWeight: r.tag === '8 days left' ? 600 : 400 }}>{r.vendor}</Text>
                          <Text size="xs" color="secondary" style={{ marginTop: 1, display: 'block' }}>{r.breach}</Text>
                        </div>
                        {r.tag ? (
                          <span style={{ fontSize: 12, fontWeight: 600, color: r.tagColor, flexShrink: 0 }}>{r.tag}</span>
                        ) : (
                          <Text size="xs" color="secondary">No breach</Text>
                        )}
                      </div>
                    ))}
                  </div>
                  <Text size="sm" style={{ lineHeight: 1.65 }}>
                    The <strong>BioCore breach (April, 98.6% uptime)</strong> qualifies for a 20% monthly credit with 8 days remaining in the claim window. The Pinnacle claim window (March breach) has closed.
                  </Text>
                  <Inline gap="xs">
                    <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                    <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  </Inline>
                  <div style={{ background: 'var(--ink-purple-10, #f5f3ff)', border: '1px solid var(--ink-purple-30, #ddd9ff)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <Inline gap="xs" align="center">
                      <IrisIcon />
                      <Text size="sm" style={{ fontWeight: 600 }}>Build an SLA Remedies Worksheet?</Text>
                    </Inline>
                    <Text size="sm" style={{ lineHeight: 1.6, color: 'var(--ink-text-secondary)' }}>
                      A worksheet will pull uptime thresholds, credit schedules, claim deadlines, and license counts across your 4 software agreements into a single view.
                    </Text>
                    <Inline gap="small">
                      <button onClick={() => { if (onBuildWorksheet) onBuildWorksheet('sla'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Yes, build it
                        <Icon name="arrow-right" size={13} color="#fff" />
                      </button>
                      <button style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-text-secondary)', cursor: 'pointer', fontFamily: 'inherit', padding: '8px 4px' }}>
                        No thanks
                      </button>
                    </Inline>
                  </div>
                </Stack>
              </>
            )}
          </div>
          {irisInputArea}
        </>
      ) : isPartyFlow ? (
        /* ── Party relationship flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IrisUserBubble text={question} />
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">Read 4 Acme Corp agreements</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>
            {/* Initial: party summary */}
            <Stack gap="small">
              <Text size="sm" style={{ lineHeight: 1.65 }}>
                Acme Corp has <strong>4 agreements on record</strong> — 3 currently active. Total committed spend is <strong>$225K/yr</strong> across an MSA, SOW, and DPA. <strong>2 agreements expire within 90 days</strong>: the SOW (Aug 18, 2026) and the NDA (Aug 22, 2026). The MSA is the primary agreement and renews April 2027.
              </Text>
              <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { name: 'MSA - Acme Corp.pdf', detail: 'Active · Renews Apr 2027', value: '$180K/yr' },
                  { name: 'SOW - Acme Implementation.pdf', detail: 'Expiring Aug 2026', value: '$45K', urgent: true },
                  { name: 'NDA - Acme Corp.pdf', detail: 'Expiring Aug 2026', value: '—', urgent: true },
                  { name: 'DPA - Acme Corp.pdf', detail: 'Active · No expiry', value: '—' },
                ].map(r => (
                  <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Inline gap="xs" align="center">
                      <Icon name="document" size={13} color={r.urgent ? 'var(--ink-orange-80, #e67700)' : 'var(--ink-text-secondary)'} />
                      <div>
                        <Text size="xs" style={{ fontWeight: 500 }}>{r.name}</Text>
                        <Text size="xs" color="secondary" style={{ display: 'block' }}>{r.detail}</Text>
                      </div>
                    </Inline>
                    <Text size="xs" style={{ fontWeight: 600 }}>{r.value}</Text>
                  </div>
                ))}
              </div>
              <Inline gap="xs">
                <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
              </Inline>
            </Stack>

            {followUp && <IrisUserBubble text={followUp} />}
            {followUp && !followUpReady && <IrisThinkingBubble />}

            {followUp && followUpReady && (
              <Stack gap="small">
                {followUp.toLowerCase().includes('expir') ? (
                  <>
                    <Inline gap="xs" align="center">
                      <Text size="xs" color="secondary">Checking expiration dates across agreements</Text>
                      <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                    </Inline>
                    <Text size="sm" style={{ lineHeight: 1.65 }}>
                      2 Acme agreements expire within the next 90 days. The SOW has a <strong>60-day notice period</strong> for non-renewal; the NDA auto-expires with no renewal clause.
                    </Text>
                    <div style={{ borderRadius: 8, border: '1px solid var(--ink-border-color-subtle)', overflow: 'hidden' }}>
                      {[
                        { name: 'SOW - Acme Implementation.pdf', expires: 'Aug 18, 2026', notice: '60-day notice required', daysLeft: '63 days' },
                        { name: 'NDA - Acme Corp.pdf', expires: 'Aug 22, 2026', notice: 'Auto-expires, no renewal', daysLeft: '67 days' },
                      ].map((r, i) => (
                        <div key={r.name} style={{ padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <Text size="sm" style={{ fontWeight: 500 }}>{r.name}</Text>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-orange-80, #e67700)' }}>{r.daysLeft}</span>
                          </div>
                          <Text size="xs" color="secondary">{r.expires} · {r.notice}</Text>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Inline gap="xs" align="center">
                      <Text size="xs" color="secondary">Reading MSA renewal terms</Text>
                      <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                    </Inline>
                    <Text size="sm" style={{ lineHeight: 1.65 }}>
                      The Acme MSA (§12.1) auto-renews for successive 1-year terms on <strong>April 26, 2027</strong>, unless either party provides written notice of non-renewal at least <strong>60 days prior</strong> (by February 25, 2027).
                    </Text>
                    <div style={{ background: '#fafafa', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, borderLeft: '3px solid var(--ink-purple-100, #4B47C8)', padding: '14px 16px' }}>
                      <Inline gap="xs" align="center" style={{ marginBottom: 10 }}>
                        <Icon name="document" size={13} color="var(--ink-text-secondary)" />
                        <Text size="xs" color="secondary" style={{ fontStyle: 'italic' }}>MSA - Acme Corp.pdf · §12.1 Term and Renewal</Text>
                      </Inline>
                      <p style={{ margin: 0, fontSize: 12.5, fontStyle: 'italic', lineHeight: 1.75, color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}>
                        "…This Agreement shall automatically renew for successive one (1) year terms unless either party provides written notice of non-renewal no less than <strong style={{ fontStyle: 'normal' }}>sixty (60) days</strong> prior to the end of the then-current term…"
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { label: 'Current term ends', value: 'April 26, 2027' },
                        { label: 'Non-renewal notice deadline', value: 'February 25, 2027' },
                        { label: 'Auto-renewal clause', value: 'Yes — 1-year successive terms' },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                          <Text size="xs" color="secondary">{row.label}</Text>
                          <Text size="xs" style={{ fontWeight: 600 }}>{row.value}</Text>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                </Inline>
              </Stack>
            )}

            {isThinking && followUpReady && <IrisThinkingBubble />}
            {convStep >= 1 && !isThinking && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                  Is there anything else you'd like to know about this party relationship?
                </Text>
              </Stack>
            )}
          </div>
          {irisInputArea}
        </>
      ) : isRenewalScanFlow ? (
        /* ── Renewal scan: multi-step planning flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IrisUserBubble text={question} />
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">Scanned 42 expiring agreements</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>
            {/* Answer block path: user's reply sits above the thinking bubble */}
            {cameFromAnswerBlock && userMessages.length > 0 && <IrisUserBubble text={userMessages[0]} />}

            {/* Initial thinking — before first AI response loads */}
            {!initialReady && <IrisThinkingBubble />}

            {/* Step 0 content — only shown on direct open, not from answer block */}
            {initialReady && !cameFromAnswerBlock && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Found <strong>42 agreements</strong> expiring in the next 6 months — the earliest on <strong>Jul 14</strong>, with a cluster of 11 coming due in September.
                </Text>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  To help plan renewals and avoid lapses, these agreements can be reviewed for auto-renewal clauses and upcoming price increases. Would you like to check for both?
                </Text>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                </Inline>
              </Stack>
            )}

            {/* Normal path: step 0→1 user message + transition thinking */}
            {initialReady && !cameFromAnswerBlock && userMessages.length > 0 && <IrisUserBubble text={userMessages[0]} />}
            {initialReady && !cameFromAnswerBlock && isThinking && convStep === 0 && <IrisThinkingBubble />}

            {initialReady && convStep >= 1 && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  A comparison tracking view can be prepared for all 42 agreements. To analyze cost protection, the following fields will be extracted from each contract:
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Notice Period', desc: 'The deadline required to cancel or renegotiate' },
                    { label: 'Price Increase Rights', desc: 'Whether the vendor is legally permitted to raise rates' },
                    { label: 'Percentage Cap', desc: 'The maximum allowable rate increase' },
                  ].map((col, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-purple-100, #4B47C8)', marginTop: 5, flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-text-primary)', lineHeight: 1.4 }}>{col.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)', lineHeight: 1.4 }}>{col.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                  Should we also include <strong>Primary Contract Owner</strong> or <strong>Current Annual Spend</strong> to help assign next steps?
                </Text>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                </Inline>
              </Stack>
            )}
            {initialReady && userMessages.length > 1 && <IrisUserBubble text={userMessages[1]} />}
            {initialReady && isThinking && convStep === 1 && <IrisThinkingBubble />}
            {initialReady && convStep >= 2 && !worksheetMode && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Adding <strong>Primary Contract Owner</strong> to the view.
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Notice Period', 'Price Increase Rights', 'Percentage Cap', 'Primary Contract Owner'].map((col, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: i > 0 ? '4px 0 0' : '0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                      <Icon name="status-check" size={12} color="var(--ink-green-80, #2f9e44)" />
                      <Text size="sm">{col}</Text>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--ink-purple-10, #f5f3ff)', border: '1px solid var(--ink-purple-30, #ddd9ff)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <Inline gap="xs" align="center">
                    <IrisIcon />
                    <Text size="sm" style={{ fontWeight: 600 }}>Your renewal tracker is ready</Text>
                  </Inline>
                  <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                    All 42 agreements will be organized into a sortable view so you can prioritize what's expiring first, spot contracts without price protection, and assign owners before renewals come due.
                  </Text>
                  <button onClick={() => { if (onBuildWorksheet) onBuildWorksheet('renewal-scan'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: 'fit-content' }}>
                    Start my renewal review
                    <Icon name="arrow-right" size={13} color="#fff" />
                  </button>
                </div>
              </Stack>
            )}
            {initialReady && convStep >= 2 && worksheetMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 8 }}>
                  <Icon name="status-check" size={14} color="var(--ink-green-80, #2f9e44)" />
                  <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Renewal table built — 42 agreements</Text>
                </div>
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>Your table is ready. Want to refine it?</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Flag contracts with no price cap', icon: 'filter' as const },
                      { label: 'Add a column for auto-renewal language', icon: 'plus' as const },
                      { label: 'Sort by earliest notice deadline', icon: 'calendar' as const },
                      { label: 'Show only contracts over $50K', icon: 'filter' as const },
                    ].map((chip, i) => (
                      <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid var(--ink-border-color-default)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <Icon name={chip.icon} size={13} color="var(--ink-purple-100, #4B47C8)" />
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </Stack>
              </div>
            )}
          </div>
          {irisInputArea}
        </>
      ) : (
        /* ── Default / generic conversation ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IrisUserBubble text={question} />
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">3 actions completed</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>
            <Stack gap="small">
              <Text size="sm" style={{ lineHeight: 1.65 }}>
                The Acme Corporation MSA expires on April 26, 2027. It includes an auto-renewal clause that triggers 60 days prior, on February 25, 2027, unless either party provides written notice.
              </Text>
              <Inline gap="xs" align="center">
                <Icon name="document" size={13} color="var(--ink-text-secondary)" />
                <Text size="xs" color="secondary" style={{ textDecoration: 'underline', cursor: 'pointer' }}>MSA - Acme Corp.pdf, Section 12.1</Text>
              </Inline>
            </Stack>
            <Inline gap="xs">
              <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
              <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
            </Inline>
            {followUp && (
              <>
                <IrisUserBubble text={followUp} />
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>
                    Got it — pulling the relevant clauses and cross-referencing across your agreements now.
                  </Text>
                  <Inline gap="xs" align="center">
                    <Icon name="document" size={13} color="var(--ink-text-secondary)" />
                    <Text size="xs" color="secondary" style={{ textDecoration: 'underline', cursor: 'pointer' }}>Searching 687 agreements…</Text>
                  </Inline>
                </Stack>
              </>
            )}
            <Stack gap="small">
              <Text size="xs" color="secondary">Would you like to explore this agreement further?</Text>
              {['Show renewal terms', 'List the parties', 'Summarize key terms'].map((chip) => (
                <button key={chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', fontSize: 13, color: 'var(--ink-text-primary)', textAlign: 'left' }} onClick={() => setInputValue(chip)}>
                  <Icon name="reply" size={13} color="var(--ink-text-secondary)" />
                  {chip}
                </button>
              ))}
            </Stack>
          </div>
          {irisInputArea}
        </>
      )}
    </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Worksheet Configs
   ═══════════════════════════════════════ */

const WORKSHEET_CONFIGS: Record<string, {
  heading: string;
  promptText: string;
  reasons: { title: string; body: string }[];
  knownCols: { id: string; type: string; name: string; source: string; ai: boolean }[];
  extractCols: { id: string; type: string; name: string; description: string }[];
  buttonLabel: string;
}> = {
  'renewals': {
    heading: 'Renewal, Termination Notice, and Price Cap Review',
    promptText: '"Extract the renewal date, the required notice period for termination, and any maximum percentage caps on price increases."',
    reasons: [
      { title: 'Renewal Date', body: 'Because you asked for the renewal date, this column shows the renewal-related date already captured on each agreement so you can quickly identify upcoming action points.' },
      { title: 'Renewal Notice Period', body: 'Because you asked about notice timing, this column shows the structured renewal notice period where available so you can compare lead times and spot agreements that require earlier preparation.' },
      { title: 'Maximum Price Increase Cap %', body: 'Because you asked about pricing constraints, this column extracts the maximum annual price escalation cap so you can flag high-risk renewals before negotiation begins.' },
    ],
    knownCols: [
      { id: 'wc1', type: 'T', name: 'File Name', source: 'Standard field · Docusign', ai: false },
      { id: 'wc2', type: 'Cal', name: 'Renewal Date', source: 'Standard field · Docusign', ai: true },
      { id: 'wc3', type: 'Cal', name: 'Renewal Notice Period', source: 'Standard field · Docusign', ai: true },
      { id: 'wc4', type: '#', name: 'Maximum Price Increase Cap %', source: 'Standard field · Docusign', ai: true },
    ],
    extractCols: [
      { id: 'wx1', type: 'T', name: 'Required Notice Period for Termination', description: "Extract the required notice period for termination from this agreement. Consider both termination for convenience and termination for cause if stated. Return a short single value such as '30 days', '60 days', 'immediate'." },
    ],
    buttonLabel: 'Add 6 Columns',
  },
  'sla': {
    heading: 'SLA Remedies Worksheet — Software Agreements',
    promptText: '"Extract SLA uptime thresholds, service credit percentages, claim windows, termination rights, license counts, and current seat usage across all software agreements."',
    reasons: [
      { title: 'Uptime Threshold', body: 'Because you asked about uptime guarantees, this column extracts the specific uptime SLA percentage (e.g. 99.9%) so you can compare commitments across vendors at a glance.' },
      { title: 'Service Credit %', body: 'Because you asked about remedies, this column extracts the percentage of monthly fees claimable as service credits when the SLA threshold is breached.' },
      { title: 'Claim Window', body: 'Because timing matters for enforcement, this column captures the deadline for submitting a service credit claim after a breach — so you know when you must act.' },
      { title: 'License & Seat Count', body: 'Because software contracts are often under-used or over-subscribed, these columns capture contracted license count and current seat usage — surfacing optimization opportunities alongside the SLA terms.' },
    ],
    knownCols: [
      { id: 'sc1', type: 'T', name: 'File Name', source: 'Standard field · Docusign', ai: false },
      { id: 'sc2', type: 'T', name: 'Vendor / Party Name', source: 'Standard field · Docusign', ai: true },
      { id: 'sc3', type: '$', name: 'Contract Value', source: 'Standard field · Docusign', ai: true },
      { id: 'sc4', type: 'Cal', name: 'Expiration Date', source: 'Standard field · Docusign', ai: true },
    ],
    extractCols: [
      { id: 'se1', type: '%', name: 'Uptime SLA Threshold', description: 'Extract the uptime percentage guaranteed in the SLA. Return a value like "99.9%", "99.5%", or "N/A" if no uptime SLA exists.' },
      { id: 'se2', type: '%', name: 'Service Credit %', description: 'Extract the service credit as a percentage of monthly fees owed when the SLA is breached. Return a value like "10%" or "N/A".' },
      { id: 'se3', type: 'T', name: 'Claim Window', description: 'Extract the deadline for filing a service credit claim after an SLA breach. Return a duration like "30 days" or "N/A".' },
      { id: 'se4', type: 'T', name: 'Termination Right', description: 'Determine if the agreement grants a termination right after repeated SLA breaches. Return "Yes – after X breaches", "No", or "N/A".' },
      { id: 'se5', type: '#', name: 'Licensed Seat Count', description: 'Extract the number of software seats or licenses contracted. Return a number like "500 seats", "unlimited", or "N/A".' },
      { id: 'se6', type: '#', name: 'Current Seat Usage', description: 'Extract or infer current seat usage if stated. Return a value like "720 seats (actual)" or "N/A if not stated".' },
    ],
    buttonLabel: 'Add 8 Columns',
  },
  'price-raise': {
    heading: 'Price Increase Analysis — Expiring Contracts',
    promptText: '"Extract pricing cap provisions, CPI linkage, notice periods required for renewal, and current contract values from each expiring agreement."',
    reasons: [
      { title: 'Price Cap Type', body: 'Because you asked about pricing caps, this column identifies whether each contract uses a fixed percentage, CPI linkage, or custom formula — so you can calculate the maximum allowable increase.' },
      { title: 'Notice Period', body: 'Because the window to act is closing, this column extracts the advance notice required to invoke a price increase so you can prioritize contracts by urgency.' },
      { title: 'Recommended Raise', body: "Because you asked how much to raise prices, this column calculates the optimal increase based on the contract's cap type against current CPI (3.2%) so you can act on each contract immediately." },
    ],
    knownCols: [
      { id: 'pc1', type: 'T', name: 'File Name', source: 'Standard field · Docusign', ai: false },
      { id: 'pc2', type: 'Cal', name: 'Expiration Date', source: 'Standard field · Docusign', ai: true },
      { id: 'pc3', type: '$', name: 'Contract Value', source: 'Standard field · Docusign', ai: true },
    ],
    extractCols: [
      { id: 'pe1', type: 'T', name: 'Price Cap Type', description: 'Identify how pricing increases are capped: "Fixed X%", "CPI", "CPI + X%", or "None". Capture the exact formula if present.' },
      { id: 'pe2', type: 'T', name: 'Notice Period for Price Raise', description: 'Extract the advance notice required to invoke a price increase. Return a duration like "60 days", "30 days", or "N/A".' },
      { id: 'pe3', type: '$', name: 'Recommended Raise Amount', description: 'Calculate the maximum allowable price increase based on the cap type and current CPI (3.2%). Return a dollar amount.' },
    ],
    buttonLabel: 'Add 6 Columns',
  },
  'price-raise-renewals': {
    heading: 'Price Raise Worksheet — Globex, BioCore & Beacon Law',
    promptText: '"Extract pricing cap type, the required notice period for a price increase, and calculate the maximum allowable raise for each of the 3 eligible renewal agreements."',
    reasons: [
      { title: 'Price Cap Type', body: 'Because these 3 agreements have different cap structures — fixed 4%, CPI-only, and CPI+1% — this column identifies each so you can apply the correct formula and avoid exceeding the contractual limit.' },
      { title: 'Notice Deadline', body: 'Because timing is critical, this column extracts the exact deadline by which written notice must be delivered to invoke the price increase — BioCore by Jun 4 and Beacon Law by Jun 18.' },
      { title: 'Recommended Raise Amount', body: 'Based on each contract\'s cap type and the current CPI rate (3.2%), this column calculates the maximum allowable increase in dollars — so you can prepare outreach with the exact figures ready.' },
    ],
    knownCols: [
      { id: 'prr1', type: 'T', name: 'File Name', source: 'Standard field · Docusign', ai: false },
      { id: 'prr2', type: 'Cal', name: 'Expiration Date', source: 'Standard field · Docusign', ai: true },
      { id: 'prr3', type: '$', name: 'Contract Value', source: 'Standard field · Docusign', ai: true },
    ],
    extractCols: [
      { id: 'prre1', type: 'T', name: 'Price Cap Type', description: 'Identify the pricing cap structure: "Fixed 4%", "CPI (3.2%)", "CPI + 1%", or other. Capture the exact formula if present.' },
      { id: 'prre2', type: 'T', name: 'Notice Period for Price Raise', description: 'Extract the advance notice required to invoke a price increase. Return a duration like "60 days" or "30 days".' },
      { id: 'prre3', type: '$', name: 'Recommended Raise Amount', description: 'Calculate the maximum allowable increase in dollars based on the cap type and CPI of 3.2%. Globex: +$3,800 · BioCore: +$4,480 · Beacon Law: +$3,276.' },
    ],
    buttonLabel: 'Add 6 Columns',
  },
  'vendor-exposure-acme': {
    heading: 'Acme Corp — Committed Spend & Usage',
    promptText: '"Extract seat volume metrics, committed spend, and MFN clause language from the 3 Acme Corp agreements so we can understand the full picture before renewal."',
    reasons: [
      { title: 'Volume / Usage Metric', body: 'You\'re 44% over the committed seat count in the MSA. This column captures contracted vs. actual usage across each agreement so the overage is visible in one place.' },
      { title: 'MFN Clause', body: 'The MSA has an MFN clause (§8.3) that could limit what Acme can charge at renewal. This column extracts the exact language so you know what protection you have.' },
    ],
    knownCols: [
      { id: 'vac1', type: 'T', name: 'File Name', source: 'Standard field · Docusign', ai: false },
      { id: 'vac2', type: '$', name: 'Contract Value', source: 'Standard field · Docusign', ai: true },
      { id: 'vac3', type: 'Cal', name: 'Expiration Date', source: 'Standard field · Docusign', ai: true },
    ],
    extractCols: [
      { id: 'vae1', type: 'T', name: 'Volume / Usage Metric', description: 'Committed vs. actual seat count, and any overage terms. For the MSA this should show "500 contracted · 720 actual (+44%)".' },
      { id: 'vae2', type: 'T', name: 'MFN Clause', description: 'Does this agreement include a Most Favored Nation clause? Return "Yes — §8.3" or "Not applicable".' },
    ],
    buttonLabel: 'Create Worksheet',
  },
  'vendor-exposure': {
    heading: 'Vendor Exposure Analysis — Acme Corp',
    promptText: '"Extract volume metrics (seats, transactions, licenses), pricing structure, MFN clauses, and SLA commitments across all Acme agreements."',
    reasons: [
      { title: 'Volume / Usage Metric', body: 'Because you asked about volume growth, this column captures the unit of measure in each contract so you can assess whether current usage exceeds contracted quantities — a key negotiation lever.' },
      { title: 'MFN Clause', body: 'Because you are evaluating whether a price increase is warranted, this column identifies MFN clauses that may prevent Acme from charging you more than comparable customers.' },
      { title: 'Benchmark Reference', body: 'Because you asked whether a price raise is justified, this column extracts any pricing benchmark or market rate references in the contract that you can use in negotiation.' },
    ],
    knownCols: [
      { id: 'vc1', type: 'T', name: 'File Name', source: 'Standard field · Docusign', ai: false },
      { id: 'vc2', type: '$', name: 'Contract Value', source: 'Standard field · Docusign', ai: true },
      { id: 'vc3', type: 'Cal', name: 'Expiration Date', source: 'Standard field · Docusign', ai: true },
    ],
    extractCols: [
      { id: 've1', type: 'T', name: 'Volume / Usage Metric', description: 'Extract the unit of measure: seats, licenses, transactions, API calls, etc. Include the contracted quantity and any overage terms.' },
      { id: 've2', type: 'T', name: 'MFN Clause', description: 'Determine if this contract contains a Most Favored Nation clause. Return "Yes — [summary]" or "No".' },
      { id: 've3', type: 'T', name: 'Benchmark Reference', description: 'Extract any pricing benchmark or market rate reference mentioned in the contract. Return the clause text or "None found".' },
    ],
    buttonLabel: 'Add 6 Columns',
  },
};

/* ═══════════════════════════════════════
   Worksheet Loading Overlay
   ═══════════════════════════════════════ */

const WORKSHEET_LOADING_LABELS: Record<string, { title: string; steps: string[] }> = {
  'price-raise-renewals': {
    title: 'Price Raise Worksheet — 3 Eligible Renewals',
    steps: ['Reading Globex, BioCore & Beacon Law agreements', 'Extracting pricing caps and notice deadlines', 'Calculating recommended raise amounts'],
  },
  'price-raise': {
    title: 'Price Raise Analysis Worksheet',
    steps: ['Reading expiring contracts', 'Extracting pricing cap provisions', 'Setting up columns and formulas'],
  },
  'renewals': {
    title: 'Renewal Review Worksheet',
    steps: ['Reading renewal agreements', 'Extracting notice periods and cap terms', 'Setting up renewal tracking columns'],
  },
  'sla': {
    title: 'SLA Remedies Worksheet — 4 Software Agreements',
    steps: ['Reading Acme, Globex, BioCore & Pinnacle agreements', 'Extracting uptime thresholds, credits & claim windows', 'Adding licensed seat count and usage columns'],
  },
  'vendor-exposure-acme': {
    title: 'Building your Acme analysis…',
    steps: ['Reading MSA, SOW & DPA agreements', 'Extracting committed spend and seat usage', 'Pulling MFN clause language from the MSA'],
  },
  'renewal-scan': {
    title: 'Setting up your renewal tracker…',
    steps: ['Scanning 42 expiring agreements', 'Checking notice periods and price increase rights', 'Identifying percentage caps and primary owners'],
  },
  'vendor-exposure': {
    title: 'Vendor Exposure Worksheet',
    steps: ['Reading Acme Corp agreements', 'Extracting volume metrics and MFN clauses', 'Calculating exposure summary'],
  },
};

function WorksheetLoadingOverlay({ worksheetType }: { worksheetType: string }) {
  const info = WORKSHEET_LOADING_LABELS[worksheetType] || { title: 'Building Worksheet', steps: ['Reading agreements', 'Extracting data', 'Setting up columns'] };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 420, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IrisIcon />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-purple-100, #4B47C8)' }}>{info.title}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {info.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="answer-skeleton-line" style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0 }} />
              <div className="answer-skeleton-line" style={{ height: 11, flex: 1, borderRadius: 4, opacity: 1 - i * 0.2 }} />
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--ink-text-secondary)', opacity: 0.7 }}>This usually takes a few seconds</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Worksheet Full-Page View (Vendor Exposure — Acme)
   ═══════════════════════════════════════ */

function WorksheetView({ onBack, worksheetType = 'vendor-exposure-acme' }: { onBack: () => void; worksheetType?: string }) {
  const [dataReady, setDataReady] = useState(false);
  const fade = useFadeIn(0, 250);
  const isRenewalView = worksheetType === 'renewal-scan';

  useEffect(() => {
    const t = setTimeout(() => setDataReady(true), 2400);
    return () => clearTimeout(t);
  }, []);

  const ShimmerCell = ({ width = '75%' }: { width?: string }) => (
    <div className="answer-skeleton-line" style={{ height: 13, width, borderRadius: 3 }} />
  );

  const aiCell = (value: string, width = '80%', highlight?: 'risk' | 'warn') => {
    if (!dataReady) return <ShimmerCell width={width} />;
    const color = highlight === 'risk' ? 'var(--ink-red-80, #c92a2a)' : highlight === 'warn' ? 'var(--ink-orange-80, #d9480f)' : 'var(--ink-text-primary)';
    return <span style={{ fontSize: 13, color, lineHeight: 1.4 }}>{value}</span>;
  };

  /* ── Renewal scan data ── */
  const renewalRows = [
    { id: 'rn1', fileName: 'MSA - Salesforce Inc.pdf', vendor: 'Salesforce', renewalDate: 'Jul 14, 2026', noticePeriod: '60 days', priceRights: 'Yes — CPI-linked', cap: '5% / yr', owner: 'Mark Chen' },
    { id: 'rn2', fileName: 'Enterprise Agreement - Workday.pdf', vendor: 'Workday', renewalDate: 'Aug 2, 2026', noticePeriod: '90 days', priceRights: 'Yes — Fixed cap', cap: '4% / yr', owner: 'Sarah Kim' },
    { id: 'rn3', fileName: 'Subscription - Slack Technologies.pdf', vendor: 'Slack', renewalDate: 'Aug 18, 2026', noticePeriod: '30 days', priceRights: 'No cap specified', cap: 'Unlimited', owner: 'Mark Chen' },
    { id: 'rn4', fileName: 'SaaS Agreement - Zendesk.pdf', vendor: 'Zendesk', renewalDate: 'Sep 1, 2026', noticePeriod: '60 days', priceRights: 'Yes — Fixed', cap: '3% / yr', owner: 'Lisa Torres' },
    { id: 'rn5', fileName: 'Creative Cloud - Adobe Inc.pdf', vendor: 'Adobe', renewalDate: 'Oct 12, 2026', noticePeriod: '30 days', priceRights: 'CPI-linked', cap: '3.2% / yr', owner: 'Dev Patel' },
    { id: 'rn6', fileName: 'Enterprise License - Box Inc.pdf', vendor: 'Box', renewalDate: 'Oct 28, 2026', noticePeriod: '45 days', priceRights: 'No restriction', cap: '—', owner: 'Sarah Kim' },
    { id: 'rn7', fileName: 'Enterprise Agreement - GitHub.pdf', vendor: 'GitHub', renewalDate: 'Nov 22, 2026', noticePeriod: '30 days', priceRights: 'No cap', cap: 'Unlimited', owner: 'Dev Patel' },
    { id: 'rn8', fileName: 'Business Plan - Notion Labs.pdf', vendor: 'Notion', renewalDate: 'Dec 5, 2026', noticePeriod: '14 days', priceRights: 'No restriction', cap: '—', owner: 'Lisa Torres' },
    { id: 'rn9', fileName: 'MSA - Figma Inc.pdf', vendor: 'Figma', renewalDate: 'Dec 18, 2026', noticePeriod: '60 days', priceRights: 'Fixed cap', cap: '5% / yr', owner: 'Mark Chen' },
  ];

  const renewalColumns = [
    {
      key: 'fileName',
      header: 'File name',
      cell: (row: typeof renewalRows[0]) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--ink-neutral-fade-05, #f5f5f8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="document" size={14} color="var(--ink-text-secondary)" />
          </div>
          <span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)', display: 'block', lineHeight: 1.3 }}>{row.fileName}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-text-secondary)', display: 'block', marginTop: 1 }}>Completed envelope · Active agreement</span>
          </span>
        </span>
      ),
      width: '280px',
    },
    {
      key: 'vendor',
      header: 'Vendor',
      cell: (row: typeof renewalRows[0]) => <span style={{ fontSize: 13, fontWeight: 500 }}>{row.vendor}</span>,
      width: '110px',
    },
    {
      key: 'renewalDate',
      header: 'Renewal date',
      cell: (row: typeof renewalRows[0]) => {
        const isUrgent = row.renewalDate.includes('Jul') || row.renewalDate.includes('Aug');
        return <span style={{ fontSize: 13, fontWeight: isUrgent ? 600 : 400, color: isUrgent ? 'var(--ink-red-80, #c92a2a)' : 'var(--ink-text-primary)' }}>{row.renewalDate}</span>;
      },
      width: '130px',
    },
    {
      key: 'noticePeriod',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Notice Period</span>
        </span>
      ),
      cell: (row: typeof renewalRows[0]) => aiCell(row.noticePeriod, '70%'),
      width: '130px',
    },
    {
      key: 'priceRights',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Price Increase Rights</span>
        </span>
      ),
      cell: (row: typeof renewalRows[0]) => aiCell(row.priceRights, '85%'),
      width: '185px',
    },
    {
      key: 'cap',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Percentage Cap</span>
        </span>
      ),
      cell: (row: typeof renewalRows[0]) => aiCell(row.cap, '55%', row.cap === 'Unlimited' ? 'risk' : undefined),
      width: '130px',
    },
    {
      key: 'owner',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Primary Owner</span>
        </span>
      ),
      cell: (row: typeof renewalRows[0]) => aiCell(row.owner, '65%'),
      width: '130px',
    },
    {
      key: 'addCol',
      header: (
        <button style={{ background: 'none', border: '1px dashed var(--ink-border-color-default)', borderRadius: 6, cursor: 'pointer', padding: '3px 10px', color: 'var(--ink-text-secondary)', fontSize: 16, fontWeight: 400, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }} title="Add column">
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          <span style={{ fontSize: 12 }}>Add column</span>
        </button>
      ),
      cell: () => null,
      width: '120px',
    },
  ];

  /* ── Vendor exposure (Acme) data ── */
  const worksheetRows = [
    { id: 'w1', fileName: 'MSA - Acme Corp.pdf', type: 'MSA', contractValue: '$180,000/yr', expirationDate: 'Apr 26, 2027', volumeMetric: '500 contracted · 720 actual (+44%)', mfnClause: 'Yes — §8.3' },
    { id: 'w2', fileName: 'SOW - Acme Implementation.pdf', type: 'SOW', contractValue: '$45,000', expirationDate: '—', volumeMetric: 'Project-based · fixed scope', mfnClause: 'Not applicable' },
    { id: 'w3', fileName: 'DPA - Acme Corp.pdf', type: 'DPA', contractValue: '—', expirationDate: 'Ongoing', volumeMetric: 'N/A', mfnClause: 'N/A' },
  ];

  const fileSubtext: Record<string, string> = {
    'w1': 'Completed envelope · Active agreement',
    'w2': 'Completed envelope · Active agreement',
    'w3': 'Completed envelope · Active agreement',
  };

  const worksheetColumns = [
    {
      key: 'fileName',
      header: 'File name',
      cell: (row: typeof worksheetRows[0]) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--ink-neutral-fade-05, #f5f5f8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="document" size={14} color="var(--ink-text-secondary)" />
          </div>
          <span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)', display: 'block', lineHeight: 1.3 }}>{row.fileName}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-text-secondary)', display: 'block', marginTop: 1 }}>{fileSubtext[row.id] || 'Completed envelope · Active agreement'}</span>
          </span>
        </span>
      ),
      width: '270px',
    },
    {
      key: 'contractValue',
      header: 'Contract value',
      cell: (row: typeof worksheetRows[0]) => <span style={{ fontSize: 13 }}>{row.contractValue}</span>,
      width: '130px',
    },
    {
      key: 'expirationDate',
      header: 'Expiration date',
      cell: (row: typeof worksheetRows[0]) => <span style={{ fontSize: 13 }}>{row.expirationDate}</span>,
      width: '140px',
    },
    {
      key: 'volumeMetric',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Volume / Usage Metric</span>
        </span>
      ),
      cell: (row: typeof worksheetRows[0]) => aiCell(row.volumeMetric),
      width: '210px',
    },
    {
      key: 'mfnClause',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>MFN Clause</span>
        </span>
      ),
      cell: (row: typeof worksheetRows[0]) => aiCell(row.mfnClause, '65%'),
      width: '160px',
    },
    {
      key: 'addCol',
      header: (
        <button
          style={{ background: 'none', border: '1px dashed var(--ink-border-color-default)', borderRadius: 6, cursor: 'pointer', padding: '3px 10px', color: 'var(--ink-text-secondary)', fontSize: 16, fontWeight: 400, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
          title="Add column"
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          <span style={{ fontSize: 12 }}>Add column</span>
        </button>
      ),
      cell: () => null,
      width: '120px',
    },
  ];

  const viewTitle = isRenewalView ? 'Vendor Renewals — Next 6 Months' : 'Acme Corp — Committed Spend & Usage';
  const viewCrumb = isRenewalView ? 'Renewal Analysis' : 'Vendor Exposure Analysis — Acme Corp';
  const viewMeta = isRenewalView ? '42 agreements · Vendor renewals · Created just now' : '3 agreements · Acme Corp · Created just now';

  return (
    <div {...fade} style={{ ...fade.style, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '14px 80px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: 'var(--ink-text-secondary)', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
          Completed Documents
        </button>
        <Icon name="chevron-right" size={12} color="var(--ink-text-secondary)" />
        <span style={{ fontSize: 13, color: 'var(--ink-text-secondary)' }}>Worksheets</span>
        <Icon name="chevron-right" size={12} color="var(--ink-text-secondary)" />
        <span style={{ fontSize: 13, color: 'var(--ink-text-primary)', fontWeight: 500 }}>{viewCrumb}</span>
      </div>

      {/* Title row */}
      <div style={{ padding: '16px 80px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--ink-purple-10, #f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={isRenewalView ? 'calendar' : 'status-check'} size={18} color="var(--ink-purple-100, #4B47C8)" />
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 400, color: 'var(--ink-text-primary)', lineHeight: 1.2 }}>{viewTitle}</h1>
        </div>
        <div style={{ marginTop: 8, marginLeft: 48, fontSize: 13, color: 'var(--ink-text-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {viewMeta.split(' · ').map((part, i, arr) => (
            <span key={i} style={{ display: 'contents' }}>
              <span>{part}</span>
              {i < arr.length - 1 && <span style={{ color: 'var(--ink-border-color-default)' }}>·</span>}
            </span>
          ))}
          {!dataReady && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--ink-border-color-default)' }}>·</span>
              <IrisIcon />
              <span style={{ color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 500 }}>Extracting data…</span>
            </span>
          )}
          {dataReady && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--ink-border-color-default)' }}>·</span>
              <Icon name="status-check" size={13} color="var(--ink-green-80, #2f9e44)" />
              <span style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Extraction complete</span>
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '16px 80px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
        <Button kind="secondary" size="small" startElement={<Icon name="plus" size={14} />}>Add agreements</Button>
        <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>Filters</Button>
        <Button kind="secondary" size="small" startElement={<Icon name="download" size={14} />}>Export</Button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowX: 'auto' }}>
        {isRenewalView ? (
          <DataTable
            columns={renewalColumns}
            data={renewalRows}
            getRowKey={(row) => row.id}
            stickyHeader
            rowHeight="tall"
            selectable
            showColumnControl
            pagination={{ page: 1, pageSize: 50, totalItems: renewalRows.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }}
          />
        ) : (
          <DataTable
            columns={worksheetColumns}
            data={worksheetRows}
            getRowKey={(row) => row.id}
            stickyHeader
            rowHeight="tall"
            selectable
            showColumnControl
            pagination={{ page: 1, pageSize: 50, totalItems: worksheetRows.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Worksheet Modal
   ═══════════════════════════════════════ */

const WORKSHEET_COLUMNS_KNOWN = [
  { id: 'wc1', type: 'T', name: 'File Name', source: 'Standard field · Docusign', ai: false },
  { id: 'wc2', type: 'Cal', name: 'Renewal Date', source: 'Standard field · Docusign', ai: true },
  { id: 'wc3', type: 'Cal', name: 'Renewal Notice Period', source: 'Standard field · Docusign', ai: true },
  { id: 'wc4', type: '#', name: 'Maximum Price Increase Cap %', source: 'Standard field · Docusign', ai: true },
];

const WORKSHEET_COLUMNS_EXTRACT = [
  {
    id: 'wx1', type: 'T', name: 'Required Notice Period for Termination',
    description: 'Extract the required notice period for termination from this agreement. Consider both termination for convenience and termination for cause if stated. Return a short single value such as \'30 days\', \'60 days\', \'immediate\'.',
  },
];

const COLUMN_TYPE_EXPLANATIONS = [
  {
    title: 'Renewal Date',
    body: 'Because you asked for the renewal date, this column shows the renewal-related date already captured on each agreement so you can quickly identify upcoming action points and prioritize outreach.',
  },
  {
    title: 'Renewal Notice Period',
    body: 'Because you asked about notice timing, this column shows the structured renewal notice period where available so you can compare lead times and spot agreements that require earlier preparation.',
  },
  {
    title: 'Maximum Price Increase Cap %',
    body: 'Because you asked about pricing constraints, this column extracts the maximum annual price escalation cap so you can flag high-risk renewals before negotiation begins.',
  },
];

function WorksheetModal({ onClose, worksheetType = 'renewals' }: { onClose: () => void; worksheetType?: string }) {
  const config = WORKSHEET_CONFIGS[worksheetType] || WORKSHEET_CONFIGS['renewals'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
    }}>
      <div style={{
        background: '#fff',
        width: '100%', maxWidth: 600,
        maxHeight: 'calc(100vh - 64px)',
        borderRadius: '14px',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '24px 24px 0',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ink-purple-10, #f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IrisIcon />
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-text-primary)' }}>{config.heading}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Your agreements will be checked with AI and the data below organized into a spreadsheet-style view. Review the columns before building.
            </p>
          </div>
          <IconButton icon="close" variant="tertiary" size="small" aria-label="Close" onClick={onClose} style={{ flexShrink: 0, marginLeft: 12, marginTop: -2 }} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Already available */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Icon name="status-check" size={13} color="var(--ink-green-80, #2f9e44)" />
              <Text size="xs" color="secondary" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Already in Docusign</Text>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {config.knownCols.map((col) => (
                <div key={col.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  border: '1px solid var(--ink-border-color-subtle)',
                  borderRadius: 20, padding: '5px 11px',
                  background: 'var(--ink-neutral-fade-05, #f7f7f9)',
                }}>
                  <Icon name="status-check" size={11} color="var(--ink-green-80, #2f9e44)" />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-text-primary)' }}>{col.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI-extracted columns */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <AIIcon name="ai-spark" size={13} />
              <Text size="xs" color="secondary" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI-assisted</Text>
            </div>
            <Stack gap="small">
              {config.extractCols.map((col) => (
                <div key={col.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  border: '1px solid var(--ink-border-color-subtle)',
                  borderRadius: 8, padding: '12px 14px',
                  background: '#fff',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ink-purple-10, #f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IrisIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-text-primary)', display: 'block', marginBottom: 2 }}>{col.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)', lineHeight: 1.5 }}>{col.description}</span>
                  </div>
                </div>
              ))}
            </Stack>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
          padding: '16px 24px',
          borderTop: '1px solid var(--ink-border-color-subtle)',
          flexShrink: 0,
        }}>
          <Button kind="secondary" onClick={onClose}>Cancel</Button>
          <Button kind="primary" startElement={<IrisIcon />} onClick={onClose}>Create Worksheet</Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Answer Loading Skeleton
   ═══════════════════════════════════════ */

function AnswerSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div className="answer-skeleton-line" style={{ width: 18, height: 18, borderRadius: '50%' }} />
        <div className="answer-skeleton-line" style={{ width: 64, height: 12 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
        <div className="answer-skeleton-line" style={{ height: 12, width: '91%' }} />
        <div className="answer-skeleton-line" style={{ height: 12, width: '76%' }} />
        <div className="answer-skeleton-line" style={{ height: 12, width: '83%' }} />
      </div>
      <div className="answer-skeleton-line" style={{ height: 11, width: 160 }} />
    </div>
  );
}

/* ═══════════════════════════════════════
   Renewals Answer Block
   ═══════════════════════════════════════ */

const UPCOMING_RENEWALS = [
  { id: 'r1', name: 'MSA - Globex.pdf', party: 'Globex', type: 'MSA', effective: 'Jun 2023', expires: 'Jul 12, 2026' },
  { id: 'r2', name: 'Service - Pinnacle.pdf', party: 'Pinnacle Consulting', type: 'Service', effective: 'Aug 2024', expires: 'Jul 28, 2026' },
  { id: 'r3', name: 'MSA - BioCore.pdf', party: 'BioCore Innovations', type: 'MSA', effective: 'Aug 2023', expires: 'Aug 4, 2026' },
  { id: 'r4', name: 'SOW - Beacon Law.pdf', party: 'Beacon Law Group', type: 'SOW', effective: 'Sep 2025', expires: 'Aug 18, 2026' },
];

const renewalColumns = [
  { key: 'name', header: 'Name', width: '30%', cell: (r: typeof UPCOMING_RENEWALS[0]) => (
    <Inline gap="xs" align="center">
      <Icon name="document" size={14} color="var(--ink-text-secondary)" />
      <Text size="sm">{r.name}</Text>
    </Inline>
  )},
  { key: 'party', header: 'Party', cell: (r: typeof UPCOMING_RENEWALS[0]) => <Text size="sm">{r.party}</Text> },
  { key: 'type', header: 'Type', cell: (r: typeof UPCOMING_RENEWALS[0]) => <Text size="sm">{r.type}</Text> },
  { key: 'effective', header: 'Effective', cell: (r: typeof UPCOMING_RENEWALS[0]) => <Text size="sm">{r.effective}</Text> },
  { key: 'expires', header: 'Expires', cell: (r: typeof UPCOMING_RENEWALS[0]) => <Text size="sm">{r.expires}</Text> },
  { key: 'actions', header: '', align: 'end', cell: () => <IconButton icon="overflow-vertical" variant="tertiary" size="small" aria-label="More" /> },
];

type ActionChip = { label: string; onClick: () => void };

function CollapsedAnswerBar({ summary, onExpand, irisActive }: { summary: string; onExpand: () => void; irisActive?: boolean }) {
  return (
    <div
      onClick={onExpand}
      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, width: '100%', boxSizing: 'border-box' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f9f9fb)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
    >
      <IrisIcon />
      <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</span>
      {irisActive && <span style={{ fontSize: 12, color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 500, flexShrink: 0 }}>Continued in Iris</span>}
      {irisActive && <Icon name="arrow-right" size={13} color="var(--ink-purple-100, #4B47C8)" />}
      <Icon name="chevron-down" size={13} color="var(--ink-text-secondary)" />
    </div>
  );
}

function InlineFollowUp({ onContinue, chips }: { onContinue: (msg: string) => void; chips?: ActionChip[] }) {
  const [val, setVal] = useState('');
  const submit = () => { if (val.trim()) { onContinue(val.trim()); setVal(''); } };
  return (
    <div style={{ marginTop: 16 }}>
      {chips && chips.length > 0 && (
        <div className="chip-fade-in" style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {chips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.onClick}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '5px 12px', fontSize: 12, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f7f7f9)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 8px 8px 18px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Ask a follow-up…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', fontFamily: 'inherit', color: 'var(--ink-text-primary)' }}
        />
        <button onClick={submit} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: val.trim() ? 'pointer' : 'default', background: val.trim() ? 'var(--ink-purple-100, #4B47C8)' : 'rgba(75,71,200,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 150ms', color: '#fff' }}>
          <Icon name="arrow-up" size={14} color="#fff" />
        </button>
      </div>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <Text size="xs" color="secondary" style={{ fontStyle: 'italic', lineHeight: 1.5 }}>
          Responses are generated with AI and should not be used as legal advice.{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn how we use AI at Docusign.</span>
        </Text>
      </div>
    </div>
  );
}

function RenewalsAnswerBlock({ onContinue, onBuildWorksheet }: { onContinue: (msg: string) => void; onBuildWorksheet: (type: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const handle = (msg: string) => { setCollapsed(true); setCollapsedViaIris(true); onContinue(msg); };
  if (collapsed) return <CollapsedAnswerBar summary="7 agreements renewing in 90 days — $535K in contract value, 3 have auto-renewal notices due" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Inline gap="xs" align="center">
          <IrisIcon />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-purple-100)' }}>Answer</span>
        </Inline>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
        </button>
      </div>
      <Text size="sm" style={{ lineHeight: 1.65, marginBottom: 12, display: 'block' }}>
        You have <strong>7 agreements</strong> renewing in the next 90 days, totaling <strong>$535K</strong> in contract value. <strong>3 include auto-renewal provisions</strong> — including Globex and Pinnacle — with opt-out notice deadlines approaching in the next 30 days.
      </Text>
      <InlineFollowUp onContinue={handle} chips={[
        { label: 'Show auto-renewal terms', onClick: () => handle('Show the auto-renewal terms for each contract') },
        { label: 'Create renewal worksheet', onClick: () => onBuildWorksheet('renewals') },
        { label: 'Create a Report', onClick: () => {} },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════
   Renewals 6-Month Answer Block
   ═══════════════════════════════════════ */

function RenewalsSixMonthAnswerBlock({ onContinue, onBuildWorksheet }: { onContinue: (msg: string) => void; onBuildWorksheet: (type: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const [chipsReady, setChipsReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setChipsReady(true), 700); return () => clearTimeout(t); }, []);
  const handle = (msg: string) => { setCollapsed(true); setCollapsedViaIris(true); onContinue(msg); };
  if (collapsed) return <CollapsedAnswerBar summary="42 agreements expiring in 6 months — earliest Jul 14, cluster of 11 in September" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Inline gap="xs" align="center">
          <IrisIcon />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-purple-100)' }}>Answer</span>
        </Inline>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
        </button>
      </div>
      <Text size="sm" style={{ lineHeight: 1.65, marginBottom: 8, display: 'block' }}>
        Found <strong>42 agreements</strong> expiring in the next 6 months — the earliest on <strong>Jul 14</strong>, with a cluster of 11 coming due in September.
      </Text>
      <Text size="sm" style={{ lineHeight: 1.65, marginBottom: 12, display: 'block' }}>
        To help plan renewals and avoid lapses, these agreements can be reviewed for auto-renewal clauses and upcoming price increases. Would you like to check for both?
      </Text>
      <InlineFollowUp onContinue={handle} chips={chipsReady ? [
        { label: 'Check for both risks', onClick: () => handle('Check for both risks') },
        { label: 'Check auto-renewals only', onClick: () => handle('Check auto-renewals only') },
        { label: 'Filter by price increases', onClick: () => handle('Filter by price increases') },
      ] : []} />
    </div>
  );
}

/* ═══════════════════════════════════════
   Donut Chart + Distribution Answer
   ═══════════════════════════════════════ */

const CHART_DATA = [
  { label: 'MSA',  count: 35, pct: 0.45, color: '#4B47C8' },
  { label: 'SOW',  count: 20, pct: 0.25, color: '#06a16c' },
  { label: 'NDA',  count: 14, pct: 0.18, color: '#8b7aff' },
  { label: 'SLA',  count:  9, pct: 0.12, color: '#f16700' },
];

function DonutChart() {
  const r = 35;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <svg viewBox="0 0 100 100" width="120" height="120" style={{ flexShrink: 0 }}>
      {/* Background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-neutral-fade-10, #f0f0f3)" strokeWidth="16" />
      {/* Segments */}
      {CHART_DATA.map((seg) => {
        const startAngle = -90 + cumulative * 360;
        const dash = seg.pct * circumference;
        cumulative += seg.pct;
        return (
          <circle
            key={seg.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(${startAngle} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
      {/* Center text */}
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 15, fontWeight: 700, fill: 'var(--ink-text-primary, #1a1a2e)' }}>
        78
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle"
        style={{ fontSize: 9, fill: 'var(--ink-text-secondary, #6b6b7a)' }}>
        total
      </text>
    </svg>
  );
}

function DistributionAnswerBlock({ onContinue }: { onContinue: () => void }) {
  const sectionLabelStyle: CSSProperties = {
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em',
    textTransform: 'uppercase', color: 'var(--ink-text-secondary, #6b6b7a)',
    display: 'block', marginBottom: '12px',
  };

  return (
    <Stack gap="none" style={{ marginBottom: '16px' }}>
      {/* Answer card */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--ink-border-color-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '20px',
      }}>
        <Inline gap="xs" align="center" style={{ marginBottom: '10px' }}>
          <IrisIcon />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-purple-100)' }}>Answer</span>
        </Inline>
        <Text size="sm" style={{ lineHeight: 1.65, marginBottom: '12px', display: 'block' }}>
          Your agreement portfolio contains <strong>78 active agreements</strong> across <strong>4 types</strong>. MSAs make up the largest share at 45%, followed by Statements of Work at 25%.
        </Text>
        <Inline gap="xs" align="center" style={{ marginBottom: '14px' }}>
          <Icon name="document-stack" size={13} color="var(--ink-text-secondary)" />
          <Text size="xs" color="secondary" style={{ textDecoration: 'underline', cursor: 'pointer' }}>Synthesized from 78 documents</Text>
        </Inline>
        <Button kind="primary" size="small" startElement={<IrisIcon />} onClick={onContinue}>Continue in Iris</Button>
      </div>

      {/* Chart card */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--ink-border-color-subtle)',
        borderRadius: '8px',
        padding: '20px 24px',
      }}>
        <Inline justify="between" align="center" style={{ marginBottom: '16px' }}>
          <div>
            <span style={sectionLabelStyle}>Agreement distribution by type</span>
            <Text size="xs" color="secondary">78 active agreements</Text>
          </div>
          <Button kind="primary" size="small" startElement={<Icon name="document" size={14} />}>Create Report</Button>
        </Inline>
        <Inline gap="xl" align="center">
          <DonutChart />
          <Stack gap="small">
            {CHART_DATA.map((seg) => (
              <Inline key={seg.label} gap="small" align="center">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                <Text size="sm" style={{ minWidth: 40 }}>{seg.label}</Text>
                <Text size="sm" color="secondary">{seg.count} ({Math.round(seg.pct * 100)}%)</Text>
              </Inline>
            ))}
          </Stack>
        </Inline>
      </div>
    </Stack>
  );
}

/* ═══════════════════════════════════════
   SLA Remedies Answer Block
   ═══════════════════════════════════════ */

const SLA_AGREEMENTS = [
  { id: 'sl1', vendor: 'Acme Corp', agreement: 'MSA - Acme Corp.pdf', uptime: '99.9%', credit: '10% / mo', claimWindow: '30 days', remedy: 'Service credit' },
  { id: 'sl2', vendor: 'Globex', agreement: 'MSA - Globex.pdf', uptime: '99.5%', credit: '15% / mo', claimWindow: '30 days', remedy: 'Credit + termination right' },
  { id: 'sl3', vendor: 'Pinnacle Consulting', agreement: 'Service - Pinnacle.pdf', uptime: '99.0%', credit: '5% / mo', claimWindow: '60 days', remedy: 'Service credit' },
  { id: 'sl4', vendor: 'BioCore Innovations', agreement: 'MSA - BioCore.pdf', uptime: '99.9%', credit: '20% / mo', claimWindow: '30 days', remedy: 'Full month credit' },
];

const slaColumns: any[] = [
  { key: 'vendor', header: 'Vendor', width: '20%', cell: (r: typeof SLA_AGREEMENTS[0]) => <Text size="sm">{r.vendor}</Text> },
  { key: 'uptime', header: 'Uptime SLA', width: '13%', cell: (r: typeof SLA_AGREEMENTS[0]) => <Text size="sm">{r.uptime}</Text> },
  { key: 'credit', header: 'Service Credit', width: '15%', cell: (r: typeof SLA_AGREEMENTS[0]) => <Text size="sm">{r.credit}</Text> },
  { key: 'claimWindow', header: 'Claim Window', width: '14%', cell: (r: typeof SLA_AGREEMENTS[0]) => <Text size="sm">{r.claimWindow}</Text> },
  { key: 'remedy', header: 'Remedy Type', cell: (r: typeof SLA_AGREEMENTS[0]) => <Text size="sm">{r.remedy}</Text> },
  { key: 'actions', header: '', align: 'end', cell: () => <IconButton icon="overflow-vertical" variant="tertiary" size="small" aria-label="More" /> },
];

function SLAAnswerBlock({ onContinue, onBuildWorksheet }: { onContinue: (msg: string) => void; onBuildWorksheet: (type: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const handle = (msg: string) => { setCollapsed(true); setCollapsedViaIris(true); onContinue(msg); };
  if (collapsed) return <CollapsedAnswerBar summary="4 vendor agreements have explicit SLAs — 2 include termination rights after 3 consecutive breaches" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Inline gap="xs" align="center">
          <IrisIcon />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-purple-100)' }}>Answer</span>
        </Inline>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
        </button>
      </div>
      <Text size="sm" style={{ lineHeight: 1.65, marginBottom: 12, display: 'block' }}>
        <strong>4 vendor agreements</strong> include explicit SLA provisions. All guarantee uptime between <strong>99% and 99.9%</strong>, with service credits ranging from 5–15% of monthly fees per incident. Claim windows are 30–60 days. <strong>2 contracts grant a termination right</strong> after 3 consecutive SLA breaches — including your Globex MSA.
      </Text>
      <InlineFollowUp onContinue={handle} chips={[
        { label: 'Show specific clauses', onClick: () => handle('Show me the specific SLA clauses and remedies for Globex') },
        { label: 'Create SLA worksheet', onClick: () => onBuildWorksheet('sla') },
        { label: 'Create a Report', onClick: () => {} },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════
   Price Raise Answer Block
   ═══════════════════════════════════════ */

const PRICE_RAISE_DATA = [
  { id: 'pr1', party: 'Globex', agreement: 'MSA - Globex.pdf', expires: 'Jul 12, 2026', noticeBy: 'May 12, 2026', capType: 'Fixed 4%', currentValue: '$95K/yr', recommendedRaise: '+$3,800' },
  { id: 'pr2', party: 'Pinnacle Consulting', agreement: 'Service - Pinnacle.pdf', expires: 'Jul 28, 2026', noticeBy: 'May 28, 2026', capType: 'Fixed 4%', currentValue: '$62K/yr', recommendedRaise: '+$2,480' },
  { id: 'pr3', party: 'BioCore Innovations', agreement: 'MSA - BioCore.pdf', expires: 'Aug 4, 2026', noticeBy: 'Jun 4, 2026', capType: 'CPI (3.2%)', currentValue: '$140K/yr', recommendedRaise: '+$4,480' },
  { id: 'pr4', party: 'Beacon Law Group', agreement: 'SOW - Beacon Law.pdf', expires: 'Aug 18, 2026', noticeBy: 'Jun 18, 2026', capType: 'CPI + 1%', currentValue: '$78K/yr', recommendedRaise: '+$3,276' },
  { id: 'pr5', party: 'Acme Corp', agreement: 'MSA - Acme Corp.pdf', expires: 'Apr 26, 2027', noticeBy: 'Feb 25, 2027', capType: 'Fixed 4%', currentValue: '$180K/yr', recommendedRaise: '+$7,200' },
];

const priceRaiseColumns: any[] = [
  { key: 'party', header: 'Party', width: '18%', cell: (r: typeof PRICE_RAISE_DATA[0]) => <Text size="sm">{r.party}</Text> },
  { key: 'expires', header: 'Expires', width: '13%', cell: (r: typeof PRICE_RAISE_DATA[0]) => <Text size="sm">{r.expires}</Text> },
  { key: 'noticeBy', header: 'Notice By', width: '13%', cell: (r: typeof PRICE_RAISE_DATA[0]) => (
    <Text size="sm" style={{ color: 'var(--ink-red-80, #c92a2a)', fontWeight: 500 }}>{r.noticeBy}</Text>
  )},
  { key: 'capType', header: 'Cap Type', width: '13%', cell: (r: typeof PRICE_RAISE_DATA[0]) => <Text size="sm">{r.capType}</Text> },
  { key: 'currentValue', header: 'Current Value', width: '12%', cell: (r: typeof PRICE_RAISE_DATA[0]) => <Text size="sm">{r.currentValue}</Text> },
  { key: 'recommendedRaise', header: 'Recommended Raise', cell: (r: typeof PRICE_RAISE_DATA[0]) => (
    <Inline gap="xs" align="center">
      <Icon name="arrow-up" size={12} color="var(--ink-green-80, #2f9e44)" />
      <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 600 }}>{r.recommendedRaise}</Text>
    </Inline>
  )},
  { key: 'actions', header: '', align: 'end', cell: () => <IconButton icon="overflow-vertical" variant="tertiary" size="small" aria-label="More" /> },
];

function PriceRaiseAnswerBlock({ onContinue, onBuildWorksheet }: { onContinue: (msg: string) => void; onBuildWorksheet: (type: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const handle = (msg: string) => { setCollapsed(true); setCollapsedViaIris(true); onContinue(msg); };
  if (collapsed) return <CollapsedAnswerBar summary="5 contracts have pricing caps — ~$21K/yr raise potential, 2 notice deadlines still open" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Inline gap="xs" align="center">
          <IrisIcon />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-purple-100)' }}>Answer</span>
        </Inline>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
        </button>
      </div>
      <Text size="sm" style={{ lineHeight: 1.65, marginBottom: 12, display: 'block' }}>
        <strong>5 contracts</strong> expiring in the next 12 months include pricing cap provisions. <strong>2 allow a fixed 4% increase</strong> (Globex, Acme Corp), <strong>2 are CPI-linked</strong> (current CPI: 3.2%), and 1 uses a CPI+1% formula. Total raise opportunity: <strong>~$21K/yr</strong>. <strong>2 contracts still have open notice windows</strong> — BioCore (due Jun 4) and Beacon Law (due Jun 18).
      </Text>
      <InlineFollowUp onContinue={handle} chips={[
        { label: 'Which need notice now?', onClick: () => handle('Which contracts require notice action in the next 30 days?') },
        { label: 'Create price raise worksheet', onClick: () => onBuildWorksheet('price-raise') },
        { label: 'Create a Report', onClick: () => {} },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════
   Vendor Exposure Answer Block
   ═══════════════════════════════════════ */

const ACME_EXPOSURE_DATA = [
  { id: 've1', agreement: 'MSA - Acme Corp.pdf', type: 'MSA', annualValue: '$180K/yr', volumeMetric: '500 → 720 seats (+44%)', slaGrade: '99.9%', mfn: 'Yes' },
  { id: 've2', agreement: 'SOW - Acme Implementation.pdf', type: 'SOW', annualValue: '$45K', volumeMetric: 'Fixed scope', slaGrade: '—', mfn: 'No' },
  { id: 've3', agreement: 'DPA - Acme Corp.pdf', type: 'DPA', annualValue: '—', volumeMetric: '—', slaGrade: '—', mfn: 'No' },
];

const vendorExposureColumns: any[] = [
  { key: 'agreement', header: 'Agreement', width: '34%', cell: (r: typeof ACME_EXPOSURE_DATA[0]) => (
    <Inline gap="xs" align="center">
      <Icon name="document" size={14} color="var(--ink-text-secondary)" />
      <Text size="sm">{r.agreement}</Text>
    </Inline>
  )},
  { key: 'type', header: 'Type', width: '8%', cell: (r: typeof ACME_EXPOSURE_DATA[0]) => <Badge kind="neutral" size="small">{r.type}</Badge> },
  { key: 'annualValue', header: 'Annual Value', width: '13%', cell: (r: typeof ACME_EXPOSURE_DATA[0]) => <Text size="sm">{r.annualValue}</Text> },
  { key: 'volumeMetric', header: 'Volume / Usage', cell: (r: typeof ACME_EXPOSURE_DATA[0]) => <Text size="sm">{r.volumeMetric}</Text> },
  { key: 'slaGrade', header: 'SLA', width: '10%', cell: (r: typeof ACME_EXPOSURE_DATA[0]) => <Text size="sm">{r.slaGrade}</Text> },
  { key: 'mfn', header: 'MFN', width: '8%', cell: (r: typeof ACME_EXPOSURE_DATA[0]) => (
    <Text size="sm" style={{ color: r.mfn === 'Yes' ? 'var(--ink-green-80, #2f9e44)' : 'var(--ink-text-secondary)', fontWeight: r.mfn === 'Yes' ? 600 : 400 }}>{r.mfn}</Text>
  )},
  { key: 'actions', header: '', align: 'end', cell: () => <IconButton icon="overflow-vertical" variant="tertiary" size="small" aria-label="More" /> },
];

function VendorExposureAnswerBlock({ onContinue, onBuildWorksheet }: { onContinue: (msg: string) => void; onBuildWorksheet: (type: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const handle = (msg: string) => { setCollapsed(true); setCollapsedViaIris(true); onContinue(msg); };
  if (collapsed) return <CollapsedAnswerBar summary="3 Acme Corp agreements, $225K committed spend — seat volume +44%, MFN clause active" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Inline gap="xs" align="center">
          <IrisIcon />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-purple-100)' }}>Answer</span>
        </Inline>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
        </button>
      </div>
      <Text size="sm" style={{ lineHeight: 1.65, marginBottom: 12, display: 'block' }}>
        You have <strong>3 active agreements</strong> with Acme Corp totaling <strong>$225K/yr in committed spend</strong> — an MSA ($180K), a SOW ($45K), and a DPA. The MSA is your primary cost driver and is active until April 2027.
      </Text>
      <InlineFollowUp onContinue={handle} chips={[
        { label: 'Analyze volume growth', onClick: () => handle('Analyze volume growth for this vendor') },
        { label: 'Build vendor worksheet', onClick: () => onBuildWorksheet('vendor-exposure-acme') },
        { label: 'Create a Report', onClick: () => {} },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════
   AI Answer Block
   ═══════════════════════════════════════ */

interface SourceAgreement {
  id: string;
  name: string;
  party: string;
  type: string;
  effective: string;
  expires: string;
}

const SOURCE_AGREEMENTS: SourceAgreement[] = [
  { id: 's1', name: 'MSA - Acme Corp.pdf', party: 'Acme Corporation', type: 'MSA', effective: 'Apr 26, 2022', expires: 'Apr 26, 2027' },
];

const sourceAgreementColumns = [
  {
    key: 'name',
    header: 'Name',
    width: '35%',
    cell: (row: SourceAgreement) => (
      <Inline gap="xs" align="center">
        <Icon name="document" size={14} color="var(--ink-text-secondary)" />
        <Text size="sm">{row.name}</Text>
      </Inline>
    ),
  },
  { key: 'party', header: 'Party', cell: (row: SourceAgreement) => <Text size="sm">{row.party}</Text> },
  { key: 'type', header: 'Type', cell: (row: SourceAgreement) => <Text size="sm">{row.type}</Text> },
  { key: 'effective', header: 'Effective', cell: (row: SourceAgreement) => <Text size="sm">{row.effective}</Text> },
  { key: 'expires', header: 'Expires', cell: (row: SourceAgreement) => <Text size="sm">{row.expires}</Text> },
  {
    key: 'actions',
    header: '',
    align: 'end',
    cell: () => <IconButton icon="overflow-vertical" variant="tertiary" size="small" aria-label="More actions" />,
  },
];

function AcmePartyCard({ onContinue, onBuildWorksheet }: { onContinue: (msg: string) => void; onBuildWorksheet: (type: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const handle = (msg: string) => { setCollapsed(true); setCollapsedViaIris(true); onContinue(msg); };
  if (collapsed) return <CollapsedAnswerBar summary="Acme Corp — 4 agreements, $225K total spend, active since Apr 2022" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--ink-neutral-fade-10, #f0f0f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="building-person" size={20} color="var(--ink-text-secondary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-text-primary)', lineHeight: 1.25 }}>Acme Corp</div>
            <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginTop: 1 }}>Enterprise Software · Customer since Apr 2022</div>
            <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--ink-purple-100, #4B47C8)', padding: 0, marginTop: 3, fontFamily: 'inherit' }}>
              View party page <Icon name="arrow-right" size={11} color="var(--ink-purple-100, #4B47C8)" />
            </button>
          </div>
        </div>
        <Inline gap="xs" align="center">
          <Badge kind="success" size="small">Active</Badge>
          <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
          </button>
        </Inline>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 20px', marginBottom: 14, padding: '12px 0', borderTop: '1px solid var(--ink-border-color-subtle)', borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
        {[
          { label: 'Active Agreements', value: '3' },
          { label: 'Total Agreements', value: '4' },
          { label: 'Expiring Soon', value: '2 (within 90 days)', highlight: true },
          { label: 'Up for Renewal', value: '1 (MSA, Apr 2027)' },
          { label: 'Total Spend', value: '$225K/yr' },
          { label: 'Agreement Types', value: 'MSA, SOW, DPA' },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: (stat as any).highlight ? 'var(--ink-orange-80, #e67700)' : 'var(--ink-text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>
      <InlineFollowUp onContinue={handle} chips={[
        { label: 'Which agreements are expiring soon?', onClick: () => handle('Which Acme agreements are expiring soon?') },
        { label: 'When does the MSA renew?', onClick: () => handle('When does the Acme MSA renew and what are the terms?') },
        { label: 'Create a Report', onClick: () => {} },
      ]} />
    </div>
  );
}

function AIAnswerBlock({ onContinue, question, onBuildWorksheet }: { onContinue: (msg: string) => void; question: string; onBuildWorksheet: (type: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const q = question.toLowerCase();
  if (collapsed) return <CollapsedAnswerBar summary="Answer collapsed — click to expand" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  // Acme party card — simple name lookup
  if (q.trim() === 'acme' || (q.includes('acme') && q.length < 12 && !q.includes('?') && !q.includes('spend') && !q.includes('exposure'))) {
    return <AcmePartyCard onContinue={onContinue} onBuildWorksheet={onBuildWorksheet} />;
  }
  if (q.includes('distributed by type')) {
    return <DistributionAnswerBlock onContinue={onContinue} />;
  }
  if ((q.includes('6 month') || q.includes('six month')) && (q.includes('expir') || q.includes('renew') || q.includes('vendor'))) {
    return <RenewalsSixMonthAnswerBlock onContinue={onContinue} onBuildWorksheet={onBuildWorksheet} />;
  }
  if ((q.includes('renewal') || q.includes('renew')) && (q.includes('90') || q.includes('coming up'))) {
    return <RenewalsAnswerBlock onContinue={onContinue} onBuildWorksheet={onBuildWorksheet} />;
  }
  if (q.includes('sla') || q.includes('uptime') || q.includes('service level') || q.includes('service credit') || q.includes('claim window') || q.includes('remedy')) {
    return <SLAAnswerBlock onContinue={onContinue} onBuildWorksheet={onBuildWorksheet} />;
  }
  if (q.includes('pricing cap') || q.includes('price raise') || (q.includes('expir') && (q.includes('cap') || q.includes('selling') || q.includes('price') || q.includes('raise')))) {
    return <PriceRaiseAnswerBlock onContinue={onContinue} onBuildWorksheet={onBuildWorksheet} />;
  }
  if (q.includes('exposure') || q.includes('total spend') || q.includes('vendor') || (q.includes('acme') && (q.includes('?') || q.includes('spend'))) || q.includes('past pricing') || q.includes('how much') || q.includes('benchmark')) {
    return <VendorExposureAnswerBlock onContinue={onContinue} onBuildWorksheet={onBuildWorksheet} />;
  }
  // Simple lookups — no answer card, just let the table filter handle it
  if (q.length <= 30 && !q.includes('?') && !q.includes('show') && !q.includes('when') && !q.includes('what') && !q.includes('how')) {
    return null;
  }
  const sectionLabelStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--ink-text-secondary, #6b6b7a)',
    display: 'block',
    marginBottom: '12px',
  };

  return (
    <Stack gap="none" style={{ marginBottom: '16px' }}>
      {/* Answer card */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--ink-border-color-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Inline gap="xs" align="center">
            <IrisIcon />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-purple-100)' }}>Answer</span>
          </Inline>
          <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
          </button>
        </div>
        <Text size="sm" style={{ lineHeight: 1.65, marginBottom: '12px', display: 'block' }}>
          The Acme Corporation MSA expires on April 26, 2027. It includes an auto-renewal clause that triggers 60 days prior, on February 25, 2027, unless either party provides written notice.
        </Text>
        <InlineFollowUp onContinue={(msg) => onContinue(msg)} chips={[
          { label: 'Show related agreements', onClick: () => onContinue('Show all related agreements') },
          { label: 'Create a Report', onClick: () => {} },
        ]} />
      </div>
    </Stack>
  );
}

/* ═══════════════════════════════════════
   Types
   ═══════════════════════════════════════ */

type TabId = 'home' | 'agreements' | 'templates' | 'insights' | 'admin';
type SidebarView = 'all-agreements' | 'drafts' | 'in-progress' | 'completed' | 'deleted' | 'parties' | 'requests';
type TemplatesSidebarView = 'my-templates' | 'shared-with-me' | 'favorites' | 'all-templates';
type InsightsSidebarView = 'overview' | 'dashboards' | 'reports';

/* ═══════════════════════════════════════
   Agreements Data
   ═══════════════════════════════════════ */

interface Agreement {
  id: string;
  name: string;
  recipient: string;
  status: string;
  statusIcon: 'status-check' | 'status-void' | 'clock' | 'status-warn';
  statusKind: 'success' | 'warning' | 'info' | 'neutral';
  statusSub?: string;
  date: string;
  time: string;
  action: 'Copy' | 'Download';
}

const AGREEMENTS_DATA: Agreement[] = [
  { id: '1', name: 'Complete with Docusign: rhi.pdf, Sample_Service_Agreement.pdf', recipient: 'To: Akshat Mishra', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:26', action: 'Copy' },
  { id: '2', name: 'Here is your signed document: Sample_Service_Agreement.pdf', recipient: 'To: Akshat Mishra, [Placeholder]', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:23', action: 'Copy' },
  { id: '3', name: 'Complete with Docusign: rhi.pdf', recipient: 'To: Akshat Mishra', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:16', action: 'Copy' },
  { id: '4', name: 'Complete with Docusign: Sample_Service_Agreement.pdf', recipient: 'To: Akshat Mishra', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:14', action: 'Copy' },
  { id: '5', name: 'Complete with Docusign: Sample_Service_Agreement.pdf', recipient: 'To: Akshat Mishra', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:10', action: 'Copy' },
  { id: '6', name: 'Complete with Docusign: rhi.pdf, Sample_Service_Agreement.pdf', recipient: 'To: Akshat Mishra', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purging soon', date: '23/3/2026', time: '20:25', action: 'Download' },
  { id: '7', name: 'Complete with Docusign: Screenshot 2026-03-18 at 10.27.30 AM.png', recipient: 'To: Akshat Mishra', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purging soon', date: '18/3/2026', time: '11:05', action: 'Download' },
  { id: '8', name: 'Complete with Docusign: Screenshot 2026-03-18 at 10.27.21 AM.png', recipient: 'To: Akshat Mishra', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purging soon', date: '18/3/2026', time: '10:57', action: 'Download' },
  { id: '9', name: 'Please sign: test.txt', recipient: 'To: Akshat Mishra', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purged', date: '26/2/2026', time: '12:15', action: 'Download' },
  { id: '10', name: 'Complete with Docusign: Fontara Financial SOW.pdf', recipient: 'To: Akshat Mishra', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purged', date: '24/2/2026', time: '10:50', action: 'Download' },
  { id: '11', name: 'Complete with DocuSign: Georgia-Residential-Lease-Agreement.pdf', recipient: 'From: Renewal Management', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', date: '24/2/2026', time: '10:44', action: 'Download' },
];

const agreementColumns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    width: '50%',
    cell: (row: Agreement) => (
      <Stack gap="none" style={{ gap: 'var(--ink-spacing-25)' }}>
        <Text size="sm">{row.name}</Text>
        <Text size="xs" color="secondary">{row.recipient}</Text>
      </Stack>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row: Agreement) => (
      <Stack gap="none" style={{ gap: 'var(--ink-spacing-25)' }}>
        <Inline gap="small" align="center">
          <Icon name={row.statusIcon} size={16} color={row.statusKind === 'success' ? 'var(--ink-green-80)' : undefined} />
          <Text size="sm">{row.status}</Text>
        </Inline>
        {row.statusSub && (
          <Text size="xs" color="secondary" style={{ textDecoration: 'underline', textDecorationColor: 'var(--ink-border-subtle)' }}>{row.statusSub}</Text>
        )}
      </Stack>
    ),
  },
  {
    key: 'date',
    header: 'Last Change',
    sortable: true,
    cell: (row: Agreement) => (
      <Stack gap="none" style={{ gap: 'var(--ink-spacing-25)' }}>
        <Text size="sm">{row.date}</Text>
        <Text size="xs" color="secondary">{row.time}</Text>
      </Stack>
    ),
  },
  {
    key: 'action',
    header: '',
    align: 'end',
    cell: (row: Agreement) => (
      <Inline gap="small" align="center" justify="end" style={{ marginLeft: 'auto' }}>
        <Button kind="secondary" size="small">{row.action}</Button>
        <IconButton icon="overflow-vertical" variant="tertiary" size="small" aria-label="More actions" />
      </Inline>
    ),
  },
];

/* ═══════════════════════════════════════
   Navigator (Completed) Data — matches Navigator view
   ═══════════════════════════════════════ */

interface NavigatorAgreement {
  id: string;
  fileName: string;
  fileStatus: 'uploaded' | 'completed';
  fileStatusDetail: string;
  parties: string[];
  status: 'active' | 'inactive';
  statusDate?: string;
  agreementType: string;
  contractValue?: string;
  effectiveDate?: string;
  expirationDate?: string;
  isAIAssisted: boolean;
}

const NAVIGATOR_DATA: NavigatorAgreement[] = [
  { id: 'n1', fileName: 'MSA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Acme Corp'], status: 'active', agreementType: 'MSA', contractValue: '$180,000/yr', expirationDate: 'Apr 26, 2027', effectiveDate: '4/26/2022', isAIAssisted: true },
  { id: 'n2', fileName: 'SOW - Beacon Law Group.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Beacon Law Group'], status: 'active', agreementType: 'SOW', contractValue: '$78,000/yr', expirationDate: 'Aug 18, 2026', effectiveDate: '8/18/2024', isAIAssisted: true },
  { id: 'n3', fileName: 'MSA - Globex.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Globex'], status: 'active', agreementType: 'MSA', contractValue: '$95,000/yr', expirationDate: 'Jul 12, 2026', effectiveDate: '7/12/2023', isAIAssisted: true },
  { id: 'n4', fileName: 'Service Agreement - Pinnacle Consulting.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Pinnacle Consulting'], status: 'active', agreementType: 'Service', contractValue: '$62,000/yr', expirationDate: 'Jul 28, 2026', effectiveDate: '7/28/2023', isAIAssisted: true },
  { id: 'n5', fileName: 'MSA - BioCore Innovations.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['BioCore Innovations'], status: 'active', agreementType: 'MSA', contractValue: '$140,000/yr', expirationDate: 'Aug 4, 2026', effectiveDate: '8/4/2023', isAIAssisted: true },
  { id: 'n6', fileName: 'SaaS Agreement - Silph Co.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Silph Co.'], status: 'active', agreementType: 'SaaS', contractValue: '$48,000/yr', expirationDate: 'Sep 3, 2026', effectiveDate: '9/3/2023', isAIAssisted: true },
  { id: 'n7', fileName: 'Services Agreement - Veridian Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Veridian Corp'], status: 'active', agreementType: 'Service', contractValue: '$112,000/yr', expirationDate: 'Sep 14, 2026', effectiveDate: '9/14/2023', isAIAssisted: false },
  { id: 'n8', fileName: 'NDA - Horizon Partners.pdf', fileStatus: 'completed', fileStatusDetail: 'Signed NDA', parties: ['Horizon Partners'], status: 'active', agreementType: 'NDA', expirationDate: 'Aug 22, 2026', effectiveDate: '8/22/2024', isAIAssisted: false },
  { id: 'n9', fileName: 'DPA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Data processing addendum', parties: ['Acme Corp'], status: 'active', agreementType: 'DPA', effectiveDate: '4/26/2022', isAIAssisted: false },
  { id: 'n10', fileName: 'Order Form - Acme Corp (2023).pdf', fileStatus: 'completed', fileStatusDetail: 'Prior renewal', parties: ['Acme Corp'], status: 'inactive', agreementType: 'Order Form', contractValue: '$155,000/yr', expirationDate: 'Apr 25, 2023', effectiveDate: '4/26/2021', isAIAssisted: false },
];

const NAVIGATOR_PRICE_RAISE: NavigatorAgreement[] = [
  { id: 'pr1', fileName: 'MSA - Globex.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Globex'], status: 'active', agreementType: 'MSA', contractValue: '$95,000/yr', expirationDate: 'Jul 12, 2026', isAIAssisted: true },
  { id: 'pr2', fileName: 'Service Agreement - Pinnacle Consulting.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Pinnacle Consulting'], status: 'active', agreementType: 'Service', contractValue: '$62,000/yr', expirationDate: 'Jul 28, 2026', isAIAssisted: true },
  { id: 'pr3', fileName: 'MSA - BioCore Innovations.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['BioCore Innovations'], status: 'active', agreementType: 'MSA', contractValue: '$140,000/yr', expirationDate: 'Aug 4, 2026', isAIAssisted: true },
  { id: 'pr4', fileName: 'SOW - Beacon Law Group.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Beacon Law Group'], status: 'active', agreementType: 'SOW', contractValue: '$78,000/yr', expirationDate: 'Aug 18, 2026', isAIAssisted: true },
  { id: 'pr5', fileName: 'MSA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Acme Corp'], status: 'active', agreementType: 'MSA', contractValue: '$180,000/yr', expirationDate: 'Apr 26, 2027', isAIAssisted: true },
  { id: 'pr6', fileName: 'SaaS Agreement - Silph Co.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Silph Co.'], status: 'active', agreementType: 'SaaS', contractValue: '$48,000/yr', expirationDate: 'Sep 3, 2026', isAIAssisted: true },
  { id: 'pr7', fileName: 'Services Agreement - Veridian Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Veridian Corp'], status: 'active', agreementType: 'Service', contractValue: '$112,000/yr', expirationDate: 'Sep 14, 2026', isAIAssisted: true },
];

const NAVIGATOR_SLA: NavigatorAgreement[] = [
  { id: 'sl1', fileName: 'MSA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Acme Corp'], status: 'active', agreementType: 'MSA', contractValue: '$180,000/yr', expirationDate: 'Apr 26, 2027', isAIAssisted: true },
  { id: 'sl2', fileName: 'MSA - Globex.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Globex'], status: 'active', agreementType: 'MSA', contractValue: '$95,000/yr', expirationDate: 'Jul 12, 2026', isAIAssisted: true },
  { id: 'sl3', fileName: 'Service Agreement - Pinnacle Consulting.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Pinnacle Consulting'], status: 'active', agreementType: 'Service', contractValue: '$62,000/yr', expirationDate: 'Jul 28, 2026', isAIAssisted: true },
  { id: 'sl4', fileName: 'MSA - BioCore Innovations.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['BioCore Innovations'], status: 'active', agreementType: 'MSA', contractValue: '$140,000/yr', expirationDate: 'Aug 4, 2026', isAIAssisted: true },
  { id: 'sl5', fileName: 'SaaS Agreement - Silph Co.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Silph Co.'], status: 'active', agreementType: 'SaaS', contractValue: '$48,000/yr', expirationDate: 'Sep 3, 2026', isAIAssisted: true },
  { id: 'sl6', fileName: 'Enterprise License - Veridian Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Veridian Corp'], status: 'active', agreementType: 'License', contractValue: '$112,000/yr', expirationDate: 'Sep 14, 2026', isAIAssisted: true },
];

const NAVIGATOR_ACME: NavigatorAgreement[] = [
  { id: 'ac1', fileName: 'MSA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Acme Corp'], status: 'active', agreementType: 'MSA', contractValue: '$180,000/yr', expirationDate: 'Apr 26, 2027', effectiveDate: '4/26/2022', isAIAssisted: true },
  { id: 'ac2', fileName: 'SOW - Acme Implementation.pdf', fileStatus: 'completed', fileStatusDetail: 'Fixed scope project', parties: ['Acme Corp'], status: 'active', agreementType: 'SOW', contractValue: '$45,000', effectiveDate: '1/15/2024', isAIAssisted: true },
  { id: 'ac3', fileName: 'DPA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Data processing addendum', parties: ['Acme Corp'], status: 'active', agreementType: 'DPA', effectiveDate: '4/26/2022', isAIAssisted: false },
  { id: 'ac4', fileName: 'Order Form - Acme Corp (2023).pdf', fileStatus: 'completed', fileStatusDetail: 'Renewal order form', parties: ['Acme Corp'], status: 'inactive', agreementType: 'Order Form', contractValue: '$155,000/yr', expirationDate: 'Apr 25, 2023', effectiveDate: '4/26/2021', isAIAssisted: false },
];

const NAVIGATOR_RENEWALS: NavigatorAgreement[] = [
  { id: 'rn1', fileName: 'MSA - Globex.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal in 45 days', parties: ['Globex'], status: 'active', agreementType: 'MSA', contractValue: '$95,000/yr', expirationDate: 'Jul 12, 2026', isAIAssisted: true },
  { id: 'rn2', fileName: 'Service Agreement - Pinnacle Consulting.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal in 52 days', parties: ['Pinnacle Consulting'], status: 'active', agreementType: 'Service', contractValue: '$62,000/yr', expirationDate: 'Jul 28, 2026', isAIAssisted: true },
  { id: 'rn3', fileName: 'MSA - BioCore Innovations.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal in 59 days', parties: ['BioCore Innovations'], status: 'active', agreementType: 'MSA', contractValue: '$140,000/yr', expirationDate: 'Aug 4, 2026', isAIAssisted: true },
  { id: 'rn4', fileName: 'SOW - Beacon Law Group.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal in 63 days', parties: ['Beacon Law Group'], status: 'active', agreementType: 'SOW', contractValue: '$78,000/yr', expirationDate: 'Aug 18, 2026', isAIAssisted: true },
  { id: 'rn5', fileName: 'NDA - Horizon Partners.pdf', fileStatus: 'completed', fileStatusDetail: 'Expires passively', parties: ['Horizon Partners'], status: 'active', agreementType: 'NDA', expirationDate: 'Aug 22, 2026', isAIAssisted: false },
  { id: 'rn6', fileName: 'SaaS Agreement - Silph Co.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal in 79 days', parties: ['Silph Co.'], status: 'active', agreementType: 'SaaS', contractValue: '$48,000/yr', expirationDate: 'Sep 3, 2026', isAIAssisted: true },
  { id: 'rn7', fileName: 'Services Agreement - Veridian Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal in 90 days', parties: ['Veridian Corp'], status: 'active', agreementType: 'Service', contractValue: '$112,000/yr', expirationDate: 'Sep 14, 2026', isAIAssisted: true },
];

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const navigatorColumns: any[] = [
  {
    key: 'aiAssisted',
    header: '',
    width: '40px',
    cell: (row: NavigatorAgreement) =>
      row.isAIAssisted ? (
        <span className={dataTableStyles.aiSparkle}>
          <AIIcon name="ai-spark-filled" size={14} />
        </span>
      ) : null,
  },
  {
    key: 'fileName',
    header: 'File Name',
    sortable: true,
    width: '280px',
    className: dataTableStyles.columnBorderRight,
    cell: (row: NavigatorAgreement) => (
      <div className={dataTableStyles.cellContent}>
        <a href="#" className={dataTableStyles.cellPrimary} style={{ textDecoration: 'none', color: 'inherit' }}>
          {row.fileName}
        </a>
        <span className={dataTableStyles.cellSecondary}>
          {row.fileStatus === 'uploaded' ? '↑' : '✓'}{' '}
          {row.fileStatus === 'uploaded' ? 'Uploaded: ' : 'Completed envelope: '}
          <a href="#">{row.fileStatusDetail}</a>
        </span>
      </div>
    ),
  },
  {
    key: 'parties',
    header: 'Parties',
    width: '180px',
    cell: (row: NavigatorAgreement) => (
      <div className={dataTableStyles.cellContent}>
        {row.parties.length > 0 ? (
          row.parties.map((party, i) => {
            const isMoreLink = party.startsWith('+');
            if (isMoreLink) {
              return <a key={i} href="#" className={dataTableStyles.partyMoreLink}>{party}</a>;
            }
            return (
              <span key={i} className={dataTableStyles.partyChip}>
                <a href="#" className={dataTableStyles.partyLink}>{party}</a>
              </span>
            );
          })
        ) : (
          <span className={dataTableStyles.cellSecondary}>&mdash;</span>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '120px',
    cell: (row: NavigatorAgreement) => (
      <div className={dataTableStyles.statusCell}>
        <span className={dataTableStyles.statusDot} data-status={row.status} />
        <div className={dataTableStyles.statusText}>
          <span className={dataTableStyles.statusLabel}>
            {row.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          {row.statusDate && (
            <span className={dataTableStyles.statusDate}>{row.statusDate}</span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'agreementType',
    header: 'Agreement Type',
    sortable: true,
    width: '140px',
  },
  {
    key: 'contractValue',
    header: 'Total Contract Value',
    sortable: true,
    width: '160px',
    alignment: 'right',
    cell: (row: NavigatorAgreement) => row.contractValue || '—',
  },
  {
    key: 'effectiveDate',
    header: 'Effective Date',
    sortable: true,
    width: '130px',
    cell: (row: NavigatorAgreement) => row.effectiveDate || '—',
  },
  {
    key: 'expirationDate',
    header: 'Expiration Date',
    sortable: true,
    width: '140px',
    alignment: 'right',
    cell: (row: NavigatorAgreement) => row.expirationDate || '—',
  },
];

/* ═══════════════════════════════════════
   Parties Data (matches real DocuSign)
   ═══════════════════════════════════════ */

interface Party {
  id: string;
  name: string;
  role: string;
  activeAgreements: number;
  existingAgreements: number;
  starred?: boolean;
}

const PARTIES_DATA: Party[] = [
  { id: '1', name: 'DocuSign, Inc.', role: 'Other', activeAgreements: 1009, existingAgreements: 16, starred: false },
  { id: '2', name: 'Docusign', role: 'Other', activeAgreements: 192, existingAgreements: 6, starred: false },
  { id: '3', name: 'DocuSign Inc.', role: 'Other', activeAgreements: 95, existingAgreements: 3, starred: false },
  { id: '4', name: 'Bio-Logistics Solutions LLC', role: 'Seller', activeAgreements: 19, existingAgreements: 2, starred: false },
  { id: '5', name: 'Docusign Inc', role: 'Other', activeAgreements: 55, existingAgreements: 2, starred: false },
  { id: '6', name: 'Grant Thornton Advisors LLC', role: 'Other', activeAgreements: 2, existingAgreements: 3, starred: false },
  { id: '7', name: 'FinLogic LLC', role: 'Other', activeAgreements: 2, existingAgreements: 3, starred: false },
  { id: '8', name: 'Docusign, Inc', role: 'Other', activeAgreements: 90, existingAgreements: 3, starred: false },
  { id: '9', name: 'Umbrella Corporation', role: 'Buyer', activeAgreements: 19, existingAgreements: 3, starred: false },
  { id: '10', name: 'DocuSign France', role: 'Other', activeAgreements: 3, existingAgreements: 3, starred: false },
];

const partyColumns: any[] = [
  { key: 'name', header: 'Name', sortable: true, width: '280px' },
  { key: 'role', header: 'Role', sortable: true, width: '120px' },
  {
    key: 'activeAgreements',
    header: 'Active agreements',
    sortable: true,
    width: '160px',
    cell: (row: Party) => (
      <Inline gap="small" align="center">
        <Badge kind="success" size="small">Active</Badge>
        <Text size="sm">{row.activeAgreements.toLocaleString()}</Text>
      </Inline>
    ),
  },
  { key: 'existingAgreements', header: 'Existing agreements', sortable: true, width: '160px' },
  {
    key: 'starred',
    header: '',
    width: '48px',
    alignment: 'center' as const,
    cell: (row: Party) => (
      <IconButton icon={row.starred ? 'star' : 'star'} variant="tertiary" size="small" aria-label="Favorite" />
    ),
  },
];

/* ═══════════════════════════════════════
   Requests Data (matches real DocuSign)
   ═══════════════════════════════════════ */

interface RequestItem {
  id: string;
  title: string;
  requestId: string;
  status: 'New' | 'In Progress' | 'Completed' | 'Overdue';
  lastActivityAt: string;
  dueDate: string;
  submitterName: string;
  submitterEmail: string;
  submitterInitials: string;
  owner: string;
}

const REQUESTS_DATA: RequestItem[] = [
  { id: '1', title: '[Example] General Legal Request by DocuSign User Rename', requestId: 'REQ-0006', status: 'New', lastActivityAt: '6/3/2026 07:16', dueDate: '', submitterName: 'DocuSign User', submitterEmail: 'navigator_test_admin@dsxtr.com', submitterInitials: 'DU', owner: 'Unassigned' },
  { id: '2', title: '[Example] General Legal Request by DocuSign User JR', requestId: 'REQ-0007', status: 'New', lastActivityAt: '26/2/2026 21:31', dueDate: '', submitterName: 'DocuSign User', submitterEmail: 'navigator_test_admin@dsxtr.com', submitterInitials: 'DU', owner: 'Unassigned' },
  { id: '3', title: '[Example] General Legal Request by DocuSign User', requestId: 'REQ-0005', status: 'New', lastActivityAt: '9/2/2026 19:19', dueDate: '', submitterName: 'DocuSign User', submitterEmail: 'navigator_test_admin@dsxtr.com', submitterInitials: 'DU', owner: 'Unassigned' },
  { id: '4', title: '[Example] NDA Request by DocuSign User', requestId: 'REQ-0004', status: 'New', lastActivityAt: '18/12/2025 23:10', dueDate: '', submitterName: 'DocuSign User', submitterEmail: 'navigator_test_admin@dsxtr.com', submitterInitials: 'DU', owner: 'Unassigned' },
  { id: '5', title: '[Example] General Legal Request by DocuSign User', requestId: 'REQ-0003', status: 'New', lastActivityAt: '18/12/2025 21:55', dueDate: '', submitterName: 'DocuSign User', submitterEmail: 'navigator_test_admin@dsxtr.com', submitterInitials: 'DU', owner: 'Unassigned' },
  { id: '6', title: '[Example] NDA Request by DocuSign User', requestId: 'REQ-0002', status: 'New', lastActivityAt: '15/11/2025 21:25', dueDate: '', submitterName: 'DocuSign User', submitterEmail: 'navigator_test_admin@dsxtr.com', submitterInitials: 'DU', owner: 'Unassigned' },
  { id: '7', title: '[Example] NDA Request by DocuSign User', requestId: 'REQ-0001', status: 'New', lastActivityAt: '23/10/2025 18:35', dueDate: '', submitterName: 'DocuSign User', submitterEmail: 'navigator_test_admin@dsxtr.com', submitterInitials: 'DU', owner: 'Unassigned' },
];

const requestColumns: any[] = [
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    width: '360px',
    cell: (row: RequestItem) => (
      <div className={dataTableStyles.cellContent}>
        <Text size="sm">{row.title}</Text>
        <Text size="xs" color="secondary">{row.requestId}</Text>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '100px',
    cell: (row: RequestItem) => (
      <Inline gap="small" align="center">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-green-60)', flexShrink: 0 }} />
        <Badge kind="success" size="small">{row.status}</Badge>
      </Inline>
    ),
  },
  { key: 'lastActivityAt', header: 'Last Activity At', sortable: true, width: '170px' },
  { key: 'dueDate', header: 'Due Date', sortable: true, width: '120px', cell: (row: RequestItem) => row.dueDate || '—' },
  {
    key: 'submitter',
    header: 'Submitter',
    sortable: true,
    width: '220px',
    cell: (row: RequestItem) => (
      <Inline gap="small" align="center">
        <Avatar size="small" initials={row.submitterInitials} />
        <div className={dataTableStyles.cellContent}>
          <Text size="sm">{row.submitterName}</Text>
          <Text size="xs" color="secondary">{row.submitterEmail}</Text>
        </div>
      </Inline>
    ),
  },
  {
    key: 'owner',
    header: 'Owner',
    sortable: true,
    width: '140px',
    cell: (row: RequestItem) => (
      <Inline gap="small" align="center">
        <Icon name="person" size={16} color="var(--ink-text-secondary)" />
        <Text size="sm" color="secondary">{row.owner}</Text>
      </Inline>
    ),
  },
];

/* ═══════════════════════════════════════
   Templates Data (matches real DocuSign)
   ═══════════════════════════════════════ */

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  owner: string;
  lastModified: string;
  shared: boolean;
  uses: number;
  favorited: boolean;
}

const TEMPLATES_DATA: TemplateItem[] = [
  { id: '1', name: 'quick send', description: 'Default template for quick envelope sending', owner: 'Akshat Mishra', lastModified: '03/13/2026', shared: false, uses: 24, favorited: true },
  { id: '2', name: 'shared template info', description: 'Shared informational template', owner: 'Akshat Mishra', lastModified: '08/12/2025', shared: true, uses: 12, favorited: true },
  { id: '3', name: 'Non-Disclosure Agreement', description: 'Standard NDA for external partners', owner: 'Legal Team', lastModified: '02/28/2026', shared: true, uses: 156, favorited: false },
  { id: '4', name: 'Service Agreement', description: 'Master service agreement template', owner: 'Legal Team', lastModified: '01/15/2026', shared: true, uses: 89, favorited: false },
  { id: '5', name: 'Offer Letter', description: 'Standard offer letter for new hires', owner: 'HR Department', lastModified: '03/05/2026', shared: true, uses: 203, favorited: false },
  { id: '6', name: 'Consulting Agreement', description: 'Independent contractor consulting agreement', owner: 'Akshat Mishra', lastModified: '02/10/2026', shared: false, uses: 7, favorited: false },
  { id: '7', name: 'Sales Contract', description: 'Standard sales contract with payment terms', owner: 'Sales Ops', lastModified: '03/20/2026', shared: true, uses: 342, favorited: false },
  { id: '8', name: 'Vendor Onboarding', description: 'New vendor setup and compliance form', owner: 'Procurement', lastModified: '12/08/2025', shared: true, uses: 45, favorited: false },
  { id: '9', name: 'Employment Agreement', description: 'Full-time employment agreement', owner: 'HR Department', lastModified: '03/01/2026', shared: true, uses: 178, favorited: false },
  { id: '10', name: 'Change Order', description: 'Amendment to existing SOW or contract', owner: 'Akshat Mishra', lastModified: '03/22/2026', shared: false, uses: 3, favorited: false },
];

const templateColumns: any[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    width: '300px',
    cell: (row: TemplateItem) => (
      <div className={dataTableStyles.cellContent}>
        <Text size="sm">{row.name}</Text>
        <Text size="xs" color="secondary">{row.description}</Text>
      </div>
    ),
  },
  { key: 'owner', header: 'Owner', sortable: true, width: '160px' },
  { key: 'lastModified', header: 'Last Modified', sortable: true, width: '140px' },
  {
    key: 'shared',
    header: 'Shared',
    width: '100px',
    cell: (row: TemplateItem) => row.shared ? <Badge kind="info" size="small">Shared</Badge> : <Text size="sm" color="secondary">Private</Text>,
  },
  { key: 'uses', header: 'Uses', sortable: true, width: '80px', alignment: 'right' as const },
  {
    key: 'actions',
    header: '',
    width: '80px',
    alignment: 'end' as const,
    cell: (row: TemplateItem) => (
      <Inline gap="small" align="center" justify="end">
        <IconButton icon="star" variant="tertiary" size="small" aria-label="Favorite" style={row.favorited ? { color: 'var(--ink-yellow-80)' } : undefined} />
        <IconButton icon="overflow-vertical" variant="tertiary" size="small" aria-label="More actions" />
      </Inline>
    ),
  },
];

/* ═══════════════════════════════════════
   Insights Reports Data
   ═══════════════════════════════════════ */

interface ReportItem {
  id: string;
  name: string;
  type: 'dashboard' | 'report';
  owner: string;
  lastViewed: string;
  shared: boolean;
}

const REPORTS_DATA: ReportItem[] = [
  { id: '1', name: 'Expiring agreements', type: 'report', owner: 'System', lastViewed: '03/26/2026', shared: true },
  { id: '2', name: 'Upcoming renewals', type: 'report', owner: 'System', lastViewed: '03/18/2026', shared: true },
  { id: '3', name: 'All agreements', type: 'report', owner: 'System', lastViewed: '02/28/2026', shared: true },
  { id: '4', name: 'Agreements with renewal notice date', type: 'report', owner: 'System', lastViewed: '02/26/2026', shared: true },
  { id: '5', name: 'Obligations by type', type: 'report', owner: 'System', lastViewed: '02/26/2026', shared: true },
  { id: '6', name: 'Envelope Velocity Report', type: 'dashboard', owner: 'Akshat Mishra', lastViewed: '03/25/2026', shared: false },
  { id: '7', name: 'Agreement Trends', type: 'dashboard', owner: 'Akshat Mishra', lastViewed: '03/20/2026', shared: false },
  { id: '8', name: 'Renewals Dashboard', type: 'dashboard', owner: 'Legal Team', lastViewed: '03/15/2026', shared: true },
  { id: '9', name: 'Monthly Signing Activity', type: 'report', owner: 'System', lastViewed: '03/10/2026', shared: true },
  { id: '10', name: 'Compliance Overview', type: 'dashboard', owner: 'Legal Team', lastViewed: '03/01/2026', shared: true },
];

const reportColumns: any[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    width: '360px',
    cell: (row: ReportItem) => (
      <Inline gap="small" align="center">
        <Icon name={row.type === 'dashboard' ? 'grid' : 'bar-chart-2'} size={16} color="var(--ink-text-secondary)" />
        <Text size="sm">{row.name}</Text>
      </Inline>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    width: '120px',
    cell: (row: ReportItem) => <Badge kind={row.type === 'dashboard' ? 'info' : 'neutral'} size="small">{capitalize(row.type)}</Badge>,
  },
  { key: 'owner', header: 'Owner', sortable: true, width: '160px' },
  { key: 'lastViewed', header: 'Last Viewed', sortable: true, width: '140px' },
  {
    key: 'shared',
    header: 'Shared',
    width: '100px',
    cell: (row: ReportItem) => row.shared ? <Badge kind="info" size="small">Shared</Badge> : <Text size="sm" color="secondary">Private</Text>,
  },
];

/* ═══════════════════════════════════════
   Home Page
   ═══════════════════════════════════════ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text as="span" size="xs" weight="semibold" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
      {children}
    </Text>
  );
}

function HomePage() {
  const getStaggerProps = useStaggerEntrance(6, { baseDelay: 100, staggerInterval: 60, duration: 400, distance: 12 });

  const activity = [
    { name: 'Complete with Docusign: rhi.pdf, Sample_Service_Agreement.pdf', time: '6 days ago', status: 'Voided', statusIcon: 'status-void' as const },
    { name: 'Here is your signed document: Sample_Service_Agreement.pdf', time: '6 days ago', status: 'Voided', statusIcon: 'status-void' as const },
    { name: 'Complete with Docusign: rhi.pdf', time: '6 days ago', status: 'Voided', statusIcon: 'status-void' as const },
    { name: 'Change Order.docx', time: 'Expiring on 07/31/2026', status: 'Expiring Soon', statusIcon: 'clock' as const },
    { name: 'SOW(2).docx', time: 'Expiring on 06/30/2026', status: 'Expiring Soon', statusIcon: 'clock' as const },
    { name: 'SOW(1).docx', time: 'Expiring on 06/30/2026', status: 'Expiring Soon', statusIcon: 'clock' as const },
  ];

  const overview = [
    { label: 'Open requests', value: 7 },
    { label: 'Waiting for others', value: 0 },
    { label: 'Expiring soon', value: 0 },
    { label: 'Completed', value: 0 },
    { label: 'Upcoming renewals', value: 0 },
  ];

  const favoriteTemplates = [
    { name: 'quick send', lastUsed: 'Last used on 03/13/2026' },
    { name: 'shared template info', lastUsed: 'Last used on 08/12/2025' },
  ];

  return (
    <Stack gap="none">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(174deg, var(--ink-cobalt-100, #4C00FB) 1.48%, var(--ink-cobalt-140, #260559) 97.92%)',
        color: 'white',
        padding: '100px var(--ink-spacing-300) 72px',
        textAlign: 'center',
      }}>
        <Heading level={3} style={{ color: 'white', fontWeight: 400, marginBottom: 'var(--ink-spacing-300)' }}>
          Welcome back, Akshat Mishra
        </Heading>
        <Inline gap="small" justify="center">
          <Button kind="brand" menuTrigger>Start</Button>
          {[
            { icon: 'send' as const, label: 'Send an Envelope' },
            { icon: 'ai-spark-filled' as const, label: 'Send with AI' },
            { icon: 'templates' as const, label: 'Create a Request' },
          ].map((btn) => (
            <button
              key={btn.label}
              className="banner-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--ink-spacing-125)',
                padding: 'var(--ink-spacing-125) var(--ink-spacing-250)', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--ink-radius-sm)',
                color: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Icon name={btn.icon} size={16} color="white" /> {btn.label}
            </button>
          ))}
        </Inline>
      </div>

      {/* Main content */}
      <Container style={{ maxWidth: 1120, padding: 'var(--ink-spacing-400) var(--ink-spacing-400)' }}>
        <Inline gap="large" align="start">
          {/* Left column */}
          <Stack gap="medium" style={{ flex: 1 }}>
            {/* Tasks */}
            <div {...getStaggerProps(0)}>
            <Card radius="large" className="home-card">
              <Stack gap="none" style={{ padding: 'var(--ink-spacing-200) var(--ink-spacing-250)' }}>
                <Inline justify="between" align="center" style={{ paddingBottom: 'var(--ink-spacing-150)' }}>
                  <SectionLabel>Tasks</SectionLabel>
                  <Icon name="chevron-right" size={18} />
                </Inline>
                <Stack gap="none" style={{ gap: 'var(--ink-spacing-50)', padding: 'var(--ink-spacing-250) 0 var(--ink-spacing-150)' }}>
                  <Text size="lg" weight="regular">You don&apos;t have any tasks yet</Text>
                  <Text size="sm" color="secondary">When you have new tasks assigned to you, they will show up here.</Text>
                </Stack>
              </Stack>
            </Card>
            </div>

            {/* Agreement Activity */}
            <div {...getStaggerProps(1)}>
            <Card radius="large" className="home-card">
              <Stack gap="none" style={{ padding: 'var(--ink-spacing-200) var(--ink-spacing-250)' }}>
                <Inline gap="none" align="center" style={{ gap: 'var(--ink-spacing-50)', marginBottom: 'var(--ink-spacing-150)' }}>
                  <SectionLabel>Agreement Activity</SectionLabel>
                  <Icon name="info" size={14} />
                </Inline>
                {activity.map((item, i) => (
                  <Inline
                    key={i}
                    justify="between"
                    align="center"
                    className="activity-row"
                    style={{
                      padding: 'var(--ink-spacing-150) 0',
                      borderTop: i > 0 ? '1px solid var(--ink-border-subtle)' : 'none',
                    }}
                  >
                    <Stack gap="none" style={{ gap: "var(--ink-spacing-25)" }}>
                      <Text size="sm">{item.name}</Text>
                      <Text size="xs" color="secondary" style={{ textDecoration: 'underline', textDecorationColor: 'var(--ink-border-subtle)' }}>{item.time}</Text>
                    </Stack>
                    <Inline gap="small" align="center" style={{ flexShrink: 0 }}>
                      <Icon name={item.statusIcon} size={14} />
                      <Text size="xs" color="secondary">{item.status}</Text>
                      <Icon name="chevron-right" size={14} />
                    </Inline>
                  </Inline>
                ))}
              </Stack>
            </Card>
            </div>

            {/* Favorite Templates */}
            <div {...getStaggerProps(2)}>
            <Card radius="large" className="home-card">
              <Stack gap="none" style={{ padding: 'var(--ink-spacing-200) var(--ink-spacing-250)' }}>
                <Inline justify="between" align="center" style={{ marginBottom: 'var(--ink-spacing-200)' }}>
                  <SectionLabel>Favorite Templates</SectionLabel>
                  <Icon name="chevron-right" size={18} />
                </Inline>
                <Grid columns={3} gap="medium">
                  {favoriteTemplates.map((t) => (
                    <Card key={t.name} radius="medium" className="home-card activity-row" style={{ padding: 0 }}>
                      <Stack gap="small" style={{ padding: 'var(--ink-spacing-150)' }}>
                        <div style={{ height: 140, background: '#f5f5f5', borderRadius: 'var(--ink-radius-sm)', position: 'relative', overflow: 'hidden', padding: 6 }}>
                          {/* Mock document preview */}
                          <div style={{ background: 'white', borderRadius: 3, height: '100%', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            {/* Header area */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ height: 5, width: '35%', background: '#ddd', borderRadius: 1 }} />
                              <div style={{ height: 5, width: '15%', background: '#e8e8e8', borderRadius: 1 }} />
                            </div>
                            <div style={{ height: 1, background: '#eee' }} />
                            {/* Table-like rows */}
                            <div style={{ display: 'flex', gap: 6 }}>
                              <div style={{ height: 4, width: '25%', background: '#e5e5e5', borderRadius: 1 }} />
                              <div style={{ height: 4, width: '20%', background: '#efefef', borderRadius: 1 }} />
                              <div style={{ height: 4, width: '30%', background: '#efefef', borderRadius: 1 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <div style={{ height: 4, width: '25%', background: '#efefef', borderRadius: 1 }} />
                              <div style={{ height: 4, width: '20%', background: '#f2f2f2', borderRadius: 1 }} />
                              <div style={{ height: 4, width: '30%', background: '#f2f2f2', borderRadius: 1 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <div style={{ height: 4, width: '25%', background: '#efefef', borderRadius: 1 }} />
                              <div style={{ height: 4, width: '20%', background: '#f2f2f2', borderRadius: 1 }} />
                              <div style={{ height: 4, width: '30%', background: '#f2f2f2', borderRadius: 1 }} />
                            </div>
                            <div style={{ height: 1, background: '#eee', marginTop: 2 }} />
                            {/* More text lines */}
                            <div style={{ height: 3, width: '70%', background: '#efefef', borderRadius: 1 }} />
                            <div style={{ height: 3, width: '50%', background: '#f2f2f2', borderRadius: 1 }} />
                          </div>
                          {/* Favorite badge */}
                          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Icon name="star" size={9} color="gold" /> Favorite
                          </div>
                        </div>
                        <Text size="sm" weight="medium" style={{ color: 'var(--ink-cobalt-90)' }}>{t.name}</Text>
                        <Text size="xs" color="secondary">{t.lastUsed}</Text>
                      </Stack>
                    </Card>
                  ))}
                  <Card radius="medium" className="home-card activity-row" style={{ padding: 0 }}>
                    <Stack gap="small" align="center" justify="center" style={{ padding: 'var(--ink-spacing-200)', height: '100%' }}>
                      <Text size="sm" weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.03em' }}>Add Favorite Template</Text>
                      <Text size="xs" color="secondary" style={{ textAlign: 'center' }}>Send future documents faster with favorited templates.</Text>
                      <Button kind="secondary" size="small">Browse templates</Button>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            </Card>
            </div>

            {/* Promo cards */}
            <div {...getStaggerProps(3)}>
            <Grid columns={2} gap="medium">
              <Card radius="large" className="home-card promo-card activity-row" noPadding>
                <Inline gap="none" align="stretch" style={{ minHeight: '100%' }}>
                  <div style={{ width: 120, flexShrink: 0, background: 'rgb(247, 246, 247)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--ink-radius-lg) 0 0 var(--ink-radius-lg)', alignSelf: 'stretch' }}>
                    <img src="/illustration-bulk-send.svg" alt="" width={72} height={72} />
                  </div>
                  <Stack gap="none" style={{ gap: 'var(--ink-spacing-50)', padding: 'var(--ink-spacing-200) var(--ink-spacing-250)' }}>
                    <Text size="sm" weight="medium">Save time with bulk send</Text>
                    <Text size="xs" color="secondary">No need to send separate envelopes. Import a bulk list and each recipient receives a unique copy. <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--ink-cobalt-90)' }}>Learn More</span></Text>
                  </Stack>
                </Inline>
              </Card>
              <Card radius="large" className="home-card promo-card activity-row" noPadding>
                <Inline gap="none" align="stretch" style={{ minHeight: '100%' }}>
                  <div style={{ width: 120, flexShrink: 0, background: 'rgb(247, 246, 247)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--ink-radius-lg) 0 0 var(--ink-radius-lg)', alignSelf: 'stretch' }}>
                    <img src="/illustration-help.svg" alt="" width={72} height={72} />
                  </div>
                  <Stack gap="none" style={{ gap: 'var(--ink-spacing-50)', padding: 'var(--ink-spacing-200) var(--ink-spacing-250)' }}>
                    <Text size="sm" weight="medium">Need help getting started?</Text>
                    <Text size="xs" color="secondary">Get help with basic questions. <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--ink-cobalt-90)' }}>View Our Guide</span></Text>
                  </Stack>
                </Inline>
              </Card>
            </Grid>
            </div>
          </Stack>

          {/* Right column - Overview */}
          <div style={{ width: 220, flexShrink: 0, ...getStaggerProps(4).style }}>
            <Card radius="large" className="home-card">
              <Stack gap="none" style={{ padding: 'var(--ink-spacing-200)' }}>
                <SectionLabel>Overview</SectionLabel>
                <Stack gap="none" style={{ marginTop: 'var(--ink-spacing-150)' }}>
                  {overview.map((item, i) => (
                    <Inline
                      key={i}
                      justify="between"
                      className="overview-row"
                      style={{
                        padding: 'var(--ink-spacing-150) var(--ink-spacing-50)',
                        borderTop: i > 0 ? '1px solid var(--ink-border-subtle)' : 'none',
                        borderRadius: 'var(--ink-radius-sm)',
                      }}
                    >
                      <Text size="sm">{item.label}</Text>
                      <Text size="sm" weight="semibold">{item.value}</Text>
                    </Inline>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </div>
        </Inline>
      </Container>
    </Stack>
  );
}

/* ═══════════════════════════════════════
   Insights — Overview sub-view
   ═══════════════════════════════════════ */

function InsightsOverview() {
  const getStaggerProps = useStaggerEntrance(4, { baseDelay: 50, staggerInterval: 80, duration: 400, distance: 10 });

  const recents = [
    { name: 'Expiring agreements', time: 'viewed 5 days ago' },
    { name: 'Upcoming renewals', time: 'viewed 13 days ago' },
    { name: 'All agreements', time: 'viewed 32 days ago' },
    { name: 'Agreements with renewal notice date', time: 'viewed 34 days ago' },
    { name: 'Obligations by type', time: 'viewed 34 days ago' },
  ];

  const favorites = [
    'Envelope Velocity Report',
    'Agreement Trends',
    'Renewals Dashboard',
  ];

  return (
    <div style={{ padding: 'var(--ink-spacing-300)' }}>
      <div {...getStaggerProps(0)}>
        <PageHeader title="Overview" />
      </div>

      <div {...getStaggerProps(1)} style={{ ...getStaggerProps(1).style, marginTop: 'var(--ink-spacing-200)', marginBottom: 'var(--ink-spacing-300)' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1px solid var(--ink-border-subtle)', borderRadius: 'var(--ink-radius-md)',
          padding: 'var(--ink-spacing-100) var(--ink-spacing-150)', gap: 'var(--ink-spacing-100)',
        }}>
          <Icon name="search" size={16} />
          <span style={{ fontSize: 14, color: 'var(--ink-font-secondary)' }}>Find reports or dashboards</span>
        </div>
      </div>

      <div {...getStaggerProps(2)}>
      <Grid columns={2} gap="medium">
        <Card radius="large">
          <div style={{ padding: 'var(--ink-spacing-200)' }}>
            <Text size="sm" weight="semibold">Your Recents</Text>
            <Stack gap="none" style={{ marginTop: 'var(--ink-spacing-150)' }}>
              {recents.map((r, i) => (
                <Inline key={i} justify="between" align="center" style={{
                  padding: 'var(--ink-spacing-100) 0',
                  borderTop: i > 0 ? '1px solid var(--ink-border-subtle)' : 'none',
                }}>
                  <Inline gap="small" align="center">
                    <Icon name="bar-chart-2" size={16} />
                    <Text size="sm">{r.name}</Text>
                  </Inline>
                  <Text size="xs" color="secondary">{r.time}</Text>
                </Inline>
              ))}
            </Stack>
            <div style={{ textAlign: 'center', marginTop: 'var(--ink-spacing-150)', borderTop: '1px solid var(--ink-border-subtle)', paddingTop: 'var(--ink-spacing-100)' }}>
              <Link href="#">View all</Link>
            </div>
          </div>
        </Card>

        <Card radius="large">
          <div style={{ padding: 'var(--ink-spacing-200)' }}>
            <Text size="sm" weight="semibold">Your Favorites</Text>
            <Stack gap="none" style={{ marginTop: 'var(--ink-spacing-150)' }}>
              {favorites.map((f, i) => (
                <Inline key={i} gap="small" align="center" style={{
                  padding: 'var(--ink-spacing-100) 0',
                  borderTop: i > 0 ? '1px solid var(--ink-border-subtle)' : 'none',
                }}>
                  <Icon name="star" size={16} color="var(--ink-yellow-80)" />
                  <Text size="sm">{f}</Text>
                </Inline>
              ))}
            </Stack>
          </div>
        </Card>
      </Grid>
      </div>

      <div {...getStaggerProps(3)} style={{ ...getStaggerProps(3).style, marginTop: 'var(--ink-spacing-300)' }}>
        <Text size="md" weight="semibold">Weekly Insights</Text>
        <Grid columns={3} gap="medium" style={{ marginTop: 'var(--ink-spacing-200)' }}>
          <Card radius="large">
            <div style={{ padding: 'var(--ink-spacing-200)', textAlign: 'center' }}>
              <Text size="sm" weight="medium">All agreements</Text>
              <Text size="xs" color="secondary" style={{ marginTop: 'var(--ink-spacing-100)' }}>Count</Text>
              <div style={{ fontSize: 36, fontWeight: 600, margin: 'var(--ink-spacing-100) 0', color: 'var(--ink-cobalt-90)' }}>42,357</div>
              <Text size="sm">Agreements</Text>
            </div>
          </Card>
          <Card radius="large">
            <div style={{ padding: 'var(--ink-spacing-200)', textAlign: 'center' }}>
              <Text size="sm" weight="medium">New agreements ingested</Text>
              <Text size="xs" color="secondary" style={{ marginTop: 'var(--ink-spacing-100)' }}>Count</Text>
              <div style={{ fontSize: 36, fontWeight: 600, margin: 'var(--ink-spacing-100) 0', color: 'var(--ink-cobalt-90)' }}>25</div>
              <Text size="sm">Agreements</Text>
            </div>
          </Card>
          <Card radius="large">
            <div style={{ padding: 'var(--ink-spacing-200)', textAlign: 'center' }}>
              <Text size="sm" weight="medium">Expiring soon</Text>
              <Text size="xs" color="secondary" style={{ marginTop: 'var(--ink-spacing-100)' }}>Next 90 days</Text>
              <div style={{ fontSize: 36, fontWeight: 600, margin: 'var(--ink-spacing-100) 0', color: 'var(--ink-yellow-80)' }}>138</div>
              <Text size="sm">Agreements</Text>
            </div>
          </Card>
        </Grid>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Templates Page — no longer used as standalone
   (rendered inline via AgreementTableView)
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   Admin Page
   ═══════════════════════════════════════ */

function AdminPage() {
  return (
    <div style={{ padding: 'var(--ink-spacing-300)' }}>
      <PageHeader title="Admin" />
      <div style={{ marginTop: 'var(--ink-spacing-400)', textAlign: 'center' }}>
        <Icon name="settings" size={48} />
        <div style={{ fontSize: 16, fontWeight: 500, marginTop: 'var(--ink-spacing-150)' }}>Account Settings</div>
        <div style={{ fontSize: 13, color: 'var(--ink-font-secondary)', marginTop: 4 }}>Manage users, billing, and account preferences.</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Footer
   ═══════════════════════════════════════ */

function Footer() {
  const links = ['Contact Us', 'Terms of Use', 'Privacy', 'Intellectual Property', 'Trust'];
  return (
    <footer style={{
      borderTop: '1px solid var(--ink-border-subtle)',
      padding: 'var(--ink-spacing-200) var(--ink-spacing-300)',
      marginTop: 'auto',
    }}>
      <Inline justify="between" align="center">
        <Inline gap="small" align="center">
          <Text size="xs" color="secondary">English (US)</Text>
          <Icon name="chevron-down" size={12} />
          <Text size="xs" color="secondary" style={{ margin: '0 var(--ink-spacing-100)' }}>|</Text>
          {links.map((link, i) => (
            <Text key={i} as="span" size="xs" color="secondary" style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent' }}>
              {link}
            </Text>
          ))}
        </Inline>
        <Text size="xs" color="secondary">
          Version: 1.13043 &middot; Copyright &copy; 2026 Docusign, Inc. All rights reserved.
        </Text>
      </Inline>
    </footer>
  );
}

/* ═══════════════════════════════════════
   App
   ═══════════════════════════════════════ */

const VALID_TABS: TabId[] = ['home', 'agreements', 'templates', 'insights', 'admin'];

/* ═══════════════════════════════════════
   Agreement Detail View (Navigator Viewer)
   Full-screen dialog with PDF viewer + detail sidebar
   ═══════════════════════════════════════ */

const AGREEMENT_DETAIL = {
  fileName: 'Batterii MLA_00992.pdf',
  agreementType: 'License',
  status: 'Inactive',
  parties: [
    { name: 'Batterii, LLC', role: 'Licensor' },
    { name: 'ABC COMPANY INC', role: 'Licensee' },
  ],
  lineOfBusiness: 'Unspecified',
  languages: 'English',
  terminationNoticePeriod: '30 days',
  governingLaw: 'Ohio',
  fields: 34,
  suggestions: 5,
  clauses: [
    'Assignment Clause #1', 'Assignment Clause #2',
    'Change of Control Clause #1', 'Change of Control Clause #2',
    'Confidentiality Clause #1', 'Confidentiality Clause #2',
    'Indemnification Clause',
    'Intellectual Property Rights Clause #1', 'Intellectual Property Rights Clause #2', 'Intellectual Property Rights Clause #3',
    'Limitation of Liability Clause',
    'Separation Clause #1', 'Separation Clause #2', 'Separation Clause #3', 'Separation Clause #4',
    'Service Level Agreements Clause',
    'Termination for Breach Clause #1', 'Termination for Breach Clause #2', 'Termination for Breach Clause #3',
  ],
};

const DETAIL_TABS = [
  { id: 'details', icon: 'info' as const, label: 'Details' },
  { id: 'obligations', icon: 'flag' as const, label: 'Obligations' },
  { id: 'sets', icon: 'diamond-stack' as const, label: 'Agreement sets' },
  { id: 'related', icon: 'hierarchy' as const, label: 'Related agreements' },
  { id: 'chat', icon: 'comment' as const, label: 'Chat' },
];

function AgreementDetailView({ onClose }: { onClose: () => void }) {
  const detail = AGREEMENT_DETAIL;
  const [activeDetailTab, setActiveDetailTab] = useState<string | null>('details');
  const fadeIn = useFadeIn(0, 250);
  const getDetailStagger = useStaggerEntrance(5, { baseDelay: 150, staggerInterval: 50, duration: 350, distance: 8 });

  const handleSidebarTabClick = (tabId: string) => {
    if (activeDetailTab === tabId) {
      setActiveDetailTab(null); // close panel
    } else {
      setActiveDetailTab(tabId); // open/switch panel
    }
  };

  const detailContent = (
    <Stack gap="medium" style={{ padding: 'var(--ink-spacing-200)' }}>
      {/* AI suggestion banner */}
      <div {...getDetailStagger(0)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ink-spacing-100)', flexDirection: 'column' }}>
          <AIBadge infoContent={false}>AI-Assisted</AIBadge>
          <Text size="sm">
            It looks like this agreement type is <strong>{detail.agreementType}</strong>. There are <strong>{detail.fields}</strong> fields and <strong>{detail.suggestions}</strong> new suggestions for you to review.
          </Text>
          <Button kind="secondary" size="small">Review All</Button>
        </div>
      </div>

      <div {...getDetailStagger(1)}>
        <Divider />
      </div>

      {/* Search */}
      <div {...getDetailStagger(2)}>
        <Input placeholder="Find details" />
      </div>

      {/* Agreement Type */}
      <div {...getDetailStagger(3)}>
        <Inline gap="small" align="center">
          <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agreement Type</Text>
          <AIIcon name="ai-spark-filled" size={12} />
        </Inline>
        <Text size="sm">{detail.agreementType}</Text>
      </div>

      {/* Accordion sections */}
      <div {...getDetailStagger(4)}>
      <Accordion
        allowMultiple
        defaultOpenItems={['general', 'termination', 'clauses', 'legal']}
        bordered
        items={[
          {
            id: 'general',
            title: 'General',
            subtitle: 'AI Suggested',
            content: (
              <Stack gap="medium">
                <div>
                  <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</Text>
                  <Text size="sm">{detail.status}</Text>
                </div>
                <div>
                  <Inline gap="small" align="center">
                    <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parties</Text>
                    <AIIcon name="ai-spark-filled" size={12} />
                  </Inline>
                  {detail.parties.map((p, i) => (
                    <Inline key={i} justify="between" align="center" style={{ padding: 'var(--ink-spacing-50) 0' }}>
                      <Text size="sm">{p.name}</Text>
                      <Link href="#">View</Link>
                    </Inline>
                  ))}
                </div>
                <div>
                  <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Name</Text>
                  <Text size="sm">{detail.fileName}</Text>
                </div>
                <div>
                  <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Line of Business</Text>
                  <Text size="sm">{detail.lineOfBusiness}</Text>
                </div>
                <div>
                  <Inline gap="small" align="center">
                    <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Languages</Text>
                    <AIIcon name="ai-spark-filled" size={12} />
                  </Inline>
                  <Text size="sm">{detail.languages}</Text>
                </div>
                <Button kind="secondary" size="small">Show 7 empty fields</Button>
              </Stack>
            ),
          },
          {
            id: 'termination',
            title: 'Termination',
            subtitle: 'AI Suggested',
            content: (
              <Stack gap="medium">
                <div>
                  <Inline gap="small" align="center">
                    <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Termination for Convenience - Notice Period</Text>
                    <AIIcon name="ai-spark-filled" size={12} />
                  </Inline>
                  <Text size="sm">{detail.terminationNoticePeriod}</Text>
                </div>
                <Button kind="secondary" size="small">Show 1 empty field</Button>
              </Stack>
            ),
          },
          { id: 'renewal', title: 'Renewal', content: <Text size="sm" color="secondary">No renewal terms found.</Text> },
          { id: 'payment', title: 'Payment', content: <Text size="sm" color="secondary">No payment terms found.</Text> },
          {
            id: 'legal',
            title: 'Legal and Compliance',
            subtitle: 'AI Suggested',
            content: (
              <Stack gap="medium">
                <div>
                  <Inline gap="small" align="center">
                    <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Governing Law</Text>
                    <AIIcon name="ai-spark-filled" size={12} />
                  </Inline>
                  <Text size="sm">{detail.governingLaw}</Text>
                </div>
                <Button kind="secondary" size="small">Show 4 empty fields</Button>
              </Stack>
            ),
          },
          {
            id: 'clauses',
            title: 'Clauses',
            subtitle: 'AI Suggested',
            content: (
              <Stack gap="small">
                {detail.clauses.map((clause, i) => (
                  <Inline key={i} justify="between" align="center" style={{ padding: 'var(--ink-spacing-50) 0' }}>
                    <Inline gap="small" align="center">
                      <Text size="xs" weight="semibold" color="secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{clause}</Text>
                      <AIIcon name="ai-spark-filled" size={12} />
                    </Inline>
                    <Text size="sm">Found</Text>
                  </Inline>
                ))}
              </Stack>
            ),
          },
        ]}
      />
      </div>
    </Stack>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1060,
      ...fadeIn.style,
      background: 'var(--ink-bg-color-default)',
      display: 'grid', gridTemplateRows: 'auto auto 1fr',
    }}>
      {/* Row 1: Dark top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--ink-spacing-100)',
        padding: '0 var(--ink-spacing-100)',
        background: 'var(--ink-neutral-140)',
        color: 'white',
        height: 64,
      }}>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 64 }}>
          <Icon name="close" size={20} />
        </button>
        <Text size="sm" style={{ flex: 1, color: 'white' }}>{detail.fileName}</Text>
        <button aria-label="Set a notification" style={{ width: 40, height: 40, borderRadius: 4, border: '1px solid transparent', background: 'var(--ink-cobalt-140)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bell-slash" size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={{ background: 'var(--ink-cobalt-140)', border: 'none', color: 'white', padding: '0 16px', height: 40, borderRadius: '4px 0 0 4px', cursor: 'pointer', fontSize: 'var(--ink-font-size-sm)', fontFamily: 'var(--ink-font-family-default)' }}>Download</button>
          <button aria-label="More actions" style={{ background: 'var(--ink-cobalt-140)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 40, height: 40, borderRadius: '0 4px 4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-down" size={16} />
          </button>
        </div>
      </div>

      {/* Row 2: Document controls bar — full width */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--ink-spacing-200)', padding: 'var(--ink-spacing-50) var(--ink-spacing-100)',
        borderBottom: '1px solid var(--ink-border-subtle)',
        background: 'var(--ink-bg-color-default)',
        minHeight: 40, position: 'relative',
      }}>
        <Inline gap="small" align="center" style={{ whiteSpace: 'nowrap' }}>
          <Input style={{ width: 36, textAlign: 'center', padding: '2px 4px' }} value="1" readOnly />
          <Text size="sm" color="secondary" style={{ whiteSpace: 'nowrap' }}>/ 5</Text>
          <IconButton icon="chevron-up" variant="tertiary" size="small" aria-label="Previous page" />
          <IconButton icon="chevron-down" variant="tertiary" size="small" aria-label="Next page" />
        </Inline>
        <div style={{ width: 1, height: 16, background: 'var(--ink-border-subtle)' }} />
        <Inline gap="small" align="center">
          <IconButton icon="zoom-in" variant="tertiary" size="small" aria-label="Zoom in" />
          <Text size="xs">100%</Text>
          <IconButton icon="zoom-out" variant="tertiary" size="small" aria-label="Zoom out" />
        </Inline>
        <IconButton icon="search" variant="tertiary" size="small" aria-label="Search document" style={{ position: 'absolute', right: 'var(--ink-spacing-100)' }} />
      </div>

      {/* Row 3: left sidebar + detail panel + document */}
      <div style={{ display: 'grid', gridTemplateColumns: activeDetailTab ? '64px 380px 1fr' : '64px 1fr', overflow: 'hidden' }}>
        {/* Left icon sidebar — controls right panel tabs */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 4px', gap: '16px',
          background: 'white',
          width: 64,
        }}>
          {DETAIL_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSidebarTabClick(tab.id)}
              aria-label={tab.label}
              style={{
                width: 40, height: 40,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: activeDetailTab === tab.id ? 'var(--ink-cobalt-140)' : 'transparent',
                color: activeDetailTab === tab.id ? 'rgba(255,255,255,0.9)' : 'var(--ink-neutral-140)',
              }}
            >
              <Icon name={tab.icon} size={20} />
            </button>
          ))}
        </div>

        {/* Detail panel — LEFT side, toggled by sidebar icons, no tab bar */}
        {activeDetailTab && (
          <div style={{
            borderRight: '1px solid var(--ink-border-subtle)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: 'var(--ink-bg-color-default)',
          }}>
            <div style={{ overflow: 'auto', height: 'calc(100vh - 104px)' }}>
              {activeDetailTab === 'details' && (
                <>
                  <div style={{ padding: 'var(--ink-spacing-150) var(--ink-spacing-200)', display: 'flex', alignItems: 'center', gap: 'var(--ink-spacing-100)' }}>
                    <Heading level={2}>Details</Heading>
                    <IconButton icon="edit" variant="tertiary" size="small" aria-label="Edit" />
                    <IconButton icon="plus" variant="tertiary" size="small" aria-label="Create new Fields or Clauses" />
                  </div>
                  {detailContent}
                </>
              )}
              {activeDetailTab === 'obligations' && (
                <div style={{ padding: 'var(--ink-spacing-200)' }}>
                  <Heading level={2}>Obligations</Heading>
                  <Text size="sm" color="secondary" style={{ marginTop: 'var(--ink-spacing-100)' }}>No obligations found.</Text>
                </div>
              )}
              {activeDetailTab === 'sets' && (
                <div style={{ padding: 'var(--ink-spacing-200)' }}>
                  <Heading level={2}>Agreement sets</Heading>
                  <Text size="sm" color="secondary" style={{ marginTop: 'var(--ink-spacing-100)' }}>No agreement sets.</Text>
                </div>
              )}
              {activeDetailTab === 'related' && (
                <div style={{ padding: 'var(--ink-spacing-200)' }}>
                  <Heading level={2}>Related agreements</Heading>
                  <Text size="sm" color="secondary" style={{ marginTop: 'var(--ink-spacing-100)' }}>No related agreements.</Text>
                </div>
              )}
              {activeDetailTab === 'chat' && (
                <div style={{ padding: 'var(--ink-spacing-200)' }}>
                  <Heading level={2}>Chat</Heading>
                  <Text size="sm" color="secondary" style={{ marginTop: 'var(--ink-spacing-100)' }}>Start a conversation about this agreement.</Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document viewer — RIGHT side */}
        <div style={{
          background: 'var(--ink-bg-color-subtle)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Document */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 'var(--ink-spacing-300)' }}>
            <div style={{
              width: 680, maxWidth: '100%', background: 'white', borderRadius: 'var(--ink-radius-size-m)',
              boxShadow: 'var(--ink-shadow-elevation-2)',
              padding: 'var(--ink-spacing-400) var(--ink-spacing-500)',
              minHeight: 900,
            }}>
              <Stack gap="medium">
                <Text size="xs" color="secondary" style={{ textAlign: 'right' }}>2135C Central Parkway Cincinnati, OH 45214</Text>
                <Heading level={2} style={{ textAlign: 'center', fontFamily: 'serif' }}>batterii</Heading>
                <Text size="xs" color="secondary" style={{ textAlign: 'center' }}>Inspiring Innovation™</Text>
                <Heading level={3}>Master Licensing Agreement</Heading>
                <Text size="sm">
                  This Agreement (the &quot;License&quot;) is for the use of the Batterii SaaS Platform (&quot;Batterii&quot;) as defined below. Use of Batterii SaaS Platform is expressly conditioned upon acceptance of &quot;Company Name&quot; (&quot;Master Licensee&quot;) and compliance with the following terms and conditions.
                </Text>
                <Heading level={4}>1.0 Definitions</Heading>
                <Text size="sm">The following terms have the meaning set forth herein:</Text>
                <Text size="sm"><strong>Customer Data</strong> — All materials, including but not limited to graphic, picture, text, audio, video, software or information not generated by Batterii...</Text>
                <Text size="sm"><strong>Privacy Policy</strong> — The Batterii Privacy Policy identifies the manner in which Batterii obtains, accesses and provides others with access to information obtained by Batterii...</Text>
                <Heading level={4}>2.0 Grant of License</Heading>
                <Text size="sm">Batterii grants Master Licensee, a non-exclusive, non-transferable, worldwide right to use Batterii SaaS as set forth herein.</Text>
                <Heading level={4}>3.0 Fee and Payment</Heading>
                <Text size="sm">The License fee shall be billed in advance of the usage by mutually agreed time periods; typically quarterly, semi-annually or annually.</Text>
                <Heading level={4}>4.0 License Term</Heading>
                <Text size="sm">This license shall be for the agreed term unless terminated in writing by Master Licensee or by Batterii.</Text>
              </Stack>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTabFromHash(): TabId {
  const hash = window.location.hash.replace('#', '');
  return VALID_TABS.includes(hash as TabId) ? (hash as TabId) : 'agreements';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromHash);
  const [sidebarView, setSidebarView] = useState<SidebarView>('completed');
  const [templatesSidebarView, setTemplatesSidebarView] = useState<TemplatesSidebarView>('my-templates');
  const [insightsSidebarView, setInsightsSidebarView] = useState<InsightsSidebarView>('overview');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [showIrisSidebar, setShowIrisSidebar] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWorksheetModal, setShowWorksheetModal] = useState(false);
  const [showWorksheetView, setShowWorksheetView] = useState(false);
  const [worksheetType, setWorksheetType] = useState<string>('renewals');
  const [worksheetLoading, setWorksheetLoading] = useState(false);
  const handleBuildWorksheet = useCallback((type: string) => {
    setWorksheetType(type);
    setWorksheetLoading(true);
    if (type === 'vendor-exposure-acme' || type === 'renewal-scan') {
      setTimeout(() => {
        setWorksheetLoading(false);
        setShowWorksheetView(true);
        setShowIrisSidebar(true);
      }, 10000);
    } else {
      setTimeout(() => { setWorksheetLoading(false); setShowWorksheetModal(true); }, 10000);
    }
  }, []);
  const [irisFollowUp, setIrisFollowUp] = useState<string | undefined>();
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const suggestionsHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [showAgreementDetail, setShowAgreementDetail] = useState(false);

  /* ── Sync hash ↔ state ── */
  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getTabFromHash());
      setSearch('');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!submittedSearch) { setIsAnswerLoading(false); return; }
    setIsAnswerLoading(true);
    const t = setTimeout(() => setIsAnswerLoading(false), 1100);
    return () => clearTimeout(t);
  }, [submittedSearch]);

  const handleTabClick = useCallback((tabId: string) => {
    window.location.hash = tabId;
    if (tabId === 'agreements') setSidebarView('all-agreements');
    if (tabId === 'templates') setTemplatesSidebarView('my-templates');
    if (tabId === 'insights') setInsightsSidebarView('overview');
  }, []);

  /* ── GlobalNav — matches production DocuSign ── */
  const globalNavConfig = {
    logo: <img src="/docusign-logo.svg" alt="DocuSign" />,
    showAppSwitcher: true,
    onAppSwitcherClick: () => {},
    navItems: [
      { id: 'home', label: 'Home', active: activeTab === 'home', onClick: () => handleTabClick('home') },
      { id: 'agreements', label: 'Agreements', active: activeTab === 'agreements', onClick: () => handleTabClick('agreements') },
      { id: 'templates', label: 'Templates', active: activeTab === 'templates', onClick: () => handleTabClick('templates') },
      { id: 'insights', label: 'Insights', active: activeTab === 'insights', onClick: () => handleTabClick('insights') },
    ],
    showSettings: true,
    settingsIcon: 'sliders-horizontal' as const,
    user: { name: 'Akshat Mishra' },
  };

  /* ── LocalNav — Agreements tab ── */
  const agreementsSidebar = {
    headerLabel: 'Start',
    headerIcon: 'plus' as const,
    headerMenuItems: [
      { id: 'new-agreement', label: 'New Agreement', icon: 'edit' as const },
      { id: 'new-template', label: 'New Template', icon: 'star' as const },
      { id: 'upload', label: 'Upload Document', icon: 'upload' as const },
    ],
    activeItemId: sidebarView,
    sections: [
      {
        id: 'agreements',
        items: [
          { id: 'all-agreements', label: 'All Agreements', icon: 'envelope' as const, onClick: () => setSidebarView('all-agreements') },
          { id: 'drafts', label: 'Drafts', nested: true, onClick: () => setSidebarView('drafts') },
          { id: 'in-progress', label: 'In Progress', nested: true, onClick: () => setSidebarView('in-progress') },
          { id: 'completed', label: 'Completed', nested: true, onClick: () => setSidebarView('completed') },
          { id: 'deleted', label: 'Deleted', nested: true, onClick: () => setSidebarView('deleted') },
        ],
      },
      { id: 'folders-divider', hasDivider: true, items: [
        { id: 'folders-item', label: 'Folders', icon: 'folder' as const, hasMenu: true },
      ]},
      {
        id: 'features',
        hasDivider: true,
        items: [
          { id: 'parties', label: 'Parties', icon: 'building-person' as const, badge: 'New', onClick: () => setSidebarView('parties') },
          { id: 'requests', label: 'Requests', icon: 'ticket' as const, badge: 'New', onClick: () => setSidebarView('requests') },
          { id: 'maestro', label: 'Maestro Workflows', icon: 'workflow' as const, badge: 'New' },
          { id: 'workspaces', label: 'Workspaces', icon: 'transaction' as const },
          { id: 'powerforms', label: 'PowerForms', icon: 'flash' as const },
          { id: 'bulk-send', label: 'Bulk Send', icon: 'document-stack' as const },
        ],
      },
    ],
  };

  /* ── Templates sidebar — matches production DocuSign ── */
  const templatesSidebar = {
    headerLabel: 'Start',
    headerIcon: 'plus' as const,
    headerMenuItems: [
      { id: 'new-template', label: 'Create Template', icon: 'edit' as const },
      { id: 'upload-template', label: 'Upload Template', icon: 'upload' as const },
    ],
    activeItemId: templatesSidebarView,
    sections: [
      {
        id: 'envelope-templates',
        items: [
          { id: 'envelope-templates-header', label: 'Envelope Templates', icon: 'templates' as const, onClick: () => setTemplatesSidebarView('my-templates') },
          { id: 'my-templates', label: 'My Templates', nested: true, onClick: () => setTemplatesSidebarView('my-templates') },
          { id: 'shared-with-me', label: 'Shared with Me', nested: true, onClick: () => setTemplatesSidebarView('shared-with-me') },
          { id: 'favorites', label: 'Favorites', nested: true, onClick: () => setTemplatesSidebarView('favorites') },
        ],
      },
      {
        id: 'other-templates',
        hasDivider: true,
        items: [
          { id: 'document-templates', label: 'Document Templates', icon: 'document' as const, badge: 'New' },
          { id: 'workflow-templates', label: 'Workflow Templates', icon: 'workflow' as const, badge: 'New' },
        ],
      },
      {
        id: 'web-forms',
        hasDivider: true,
        items: [
          { id: 'web-forms-header', label: 'Web Forms', icon: 'globe-language' as const },
          { id: 'my-web-forms', label: 'My Web Forms', nested: true },
          { id: 'shared-web-forms', label: 'Shared with Me', nested: true },
          { id: 'all-web-forms', label: 'All Web Forms', nested: true, onClick: () => setTemplatesSidebarView('all-templates') },
          { id: 'template-gallery', label: 'Template Gallery', nested: true, badge: 'New' },
        ],
      },
    ],
  };

  /* ── Insights sidebar — matches production DocuSign Reports ── */
  const insightsSidebar = {
    headerLabel: 'Create',
    headerIcon: 'plus' as const,
    activeItemId: insightsSidebarView,
    sections: [
      {
        id: 'insights-overview',
        items: [
          { id: 'overview', label: 'Overview', icon: 'home' as const, onClick: () => setInsightsSidebarView('overview') },
        ],
      },
      {
        id: 'insights-dashboards',
        hasDivider: true,
        items: [
          { id: 'dashboards', label: 'Dashboards', icon: 'layout-grid' as const, onClick: () => setInsightsSidebarView('dashboards') },
          { id: 'my-dashboard', label: 'My dashboard', nested: true, onClick: () => setInsightsSidebarView('dashboards') },
          { id: 'admin-dashboard', label: 'Administrator dashboard', nested: true, onClick: () => setInsightsSidebarView('dashboards') },
          { id: 'agreements-dashboard', label: 'Agreements', nested: true, onClick: () => setInsightsSidebarView('dashboards') },
          { id: 'obligations-dashboard', label: 'Obligations', nested: true, onClick: () => setInsightsSidebarView('dashboards') },
          { id: 'renewals-dashboard', label: 'Renewals', nested: true, onClick: () => setInsightsSidebarView('dashboards') },
          { id: 'requests-dashboard', label: 'Requests', nested: true, onClick: () => setInsightsSidebarView('dashboards') },
        ],
      },
      {
        id: 'insights-reports',
        hasDivider: true,
        items: [
          { id: 'reports', label: 'Reports', icon: 'bar-chart-2' as const, onClick: () => setInsightsSidebarView('reports') },
        ],
      },
    ],
  };

  /* ── View-filtered data ── */
  const viewAgreements = useMemo(() => {
    switch (sidebarView) {
      case 'drafts':
        return [
          { id: 'd1', name: 'Q2 Partnership Agreement - Draft', recipient: 'To: Legal Team', status: 'Draft', statusIcon: 'clock' as const, statusKind: 'neutral' as const, date: '31/3/2026', time: '09:15', action: 'Edit' as const },
          { id: 'd2', name: 'Contractor NDA - Pending Review', recipient: 'To: Akshat Mishra', status: 'Draft', statusIcon: 'clock' as const, statusKind: 'neutral' as const, date: '30/3/2026', time: '14:30', action: 'Edit' as const },
          { id: 'd3', name: 'Office Lease Renewal 2026', recipient: 'To: Facilities', status: 'Draft', statusIcon: 'clock' as const, statusKind: 'neutral' as const, date: '28/3/2026', time: '11:00', action: 'Edit' as const },
        ];
      case 'in-progress':
        return [
          { id: 'ip1', name: 'Vendor Agreement - CloudCo Services', recipient: 'To: CloudCo Services', status: 'Sent', statusIcon: 'clock' as const, statusKind: 'info' as const, statusSub: 'Waiting for others', date: '30/3/2026', time: '16:45', action: 'Copy' as const },
          { id: 'ip2', name: 'Consulting Agreement - DesignLab', recipient: 'To: DesignLab Studio', status: 'Sent', statusIcon: 'clock' as const, statusKind: 'info' as const, statusSub: 'Waiting for others', date: '29/3/2026', time: '10:20', action: 'Copy' as const },
          { id: 'ip3', name: 'Software License Agreement - Acme', recipient: 'To: Acme Solutions, Inc.', status: 'Delivered', statusIcon: 'clock' as const, statusKind: 'info' as const, statusSub: '1 of 2 signed', date: '27/3/2026', time: '09:00', action: 'Copy' as const },
          { id: 'ip4', name: 'Service Level Agreement - TechStart', recipient: 'To: TechStart Inc', status: 'Delivered', statusIcon: 'clock' as const, statusKind: 'info' as const, statusSub: 'Viewed', date: '25/3/2026', time: '14:10', action: 'Copy' as const },
        ];
      case 'completed':
        return AGREEMENTS_DATA.filter(a => a.status === 'Completed');
      case 'deleted':
        return [
          { id: 'del1', name: 'Old NDA - Expired', recipient: 'To: Akshat Mishra', status: 'Voided', statusIcon: 'status-void' as const, statusKind: 'neutral' as const, statusSub: 'Deleted', date: '15/3/2026', time: '08:30', action: 'Copy' as const },
        ];
      default:
        return AGREEMENTS_DATA;
    }
  }, [sidebarView]);

  const filteredAgreements = useMemo(() => {
    if (!search) return viewAgreements;
    const q = search.toLowerCase();
    return viewAgreements.filter((a) => a.name.toLowerCase().includes(q) || a.recipient.toLowerCase().includes(q));
  }, [search, viewAgreements]);

  const filteredParties = useMemo(() => {
    if (!search) return PARTIES_DATA;
    const q = search.toLowerCase();
    return PARTIES_DATA.filter((p) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  }, [search]);

  const VIEW_LABELS: Record<SidebarView, string> = {
    'all-agreements': 'All Agreements', drafts: 'Drafts', 'in-progress': 'In Progress',
    completed: 'Completed', deleted: 'Deleted', parties: 'Parties', requests: 'Requests',
  };

  const isPartiesView = sidebarView === 'parties';
  const isNavigatorView = sidebarView === 'completed';
  const isRequestsView = sidebarView === 'requests';

  /* ── Navigator filtered data — only filters on submit, not on keystroke ── */
  const filteredNavigator = useMemo(() => {
    if (!submittedSearch) return NAVIGATOR_DATA;
    const q = submittedSearch.toLowerCase();
    if (q.includes('sla') || q.includes('uptime') || q.includes('service level') || q.includes('service credit') || q.includes('claim window') || q.includes('remedy')) return NAVIGATOR_SLA;
    if (q.includes('pricing cap') || q.includes('price raise') || q.includes('expiring in 6') || (q.includes('expir') && (q.includes('cap') || q.includes('selling') || q.includes('price') || q.includes('raise')))) return NAVIGATOR_PRICE_RAISE;
    if (q.includes('exposure') || q.includes('total spend') || q.includes('benchmark') || (q.includes('acme') && (q.includes('?') || q.includes('spend')))) return NAVIGATOR_ACME;
    if ((q.includes('renewal') || q.includes('renew')) && (q.includes('6') || q.includes('six')) && q.includes('month')) return NAVIGATOR_RENEWALS;
    if ((q.includes('renewal') || q.includes('renew')) && (q.includes('90') || q.includes('coming up'))) return NAVIGATOR_RENEWALS;
    // Simple text lookup — word-by-word match against file name, party, or agreement type
    const words = q.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return NAVIGATOR_DATA;
    const filtered = NAVIGATOR_DATA.filter(r =>
      words.some(w =>
        r.fileName.toLowerCase().includes(w) ||
        r.parties.some(p => p.toLowerCase().includes(w)) ||
        (r.agreementType || '').toLowerCase().includes(w)
      )
    );
    return filtered.length > 0 ? filtered : NAVIGATOR_DATA;
  }, [submittedSearch]);

  /* ── Requests filtered data ── */
  const filteredRequests = useMemo(() => {
    if (!search) return REQUESTS_DATA;
    const q = search.toLowerCase();
    return REQUESTS_DATA.filter(r => r.title.toLowerCase().includes(q) || r.requestId.toLowerCase().includes(q));
  }, [search]);

  /* ── Templates filtered data ── */
  const viewTemplates = useMemo(() => {
    switch (templatesSidebarView) {
      case 'my-templates':
        return TEMPLATES_DATA.filter(t => t.owner === 'Akshat Mishra');
      case 'shared-with-me':
        return TEMPLATES_DATA.filter(t => t.shared && t.owner !== 'Akshat Mishra');
      case 'favorites':
        return TEMPLATES_DATA.filter(t => t.favorited);
      default:
        return TEMPLATES_DATA;
    }
  }, [templatesSidebarView]);

  const filteredTemplates = useMemo(() => {
    if (!search) return viewTemplates;
    const q = search.toLowerCase();
    return viewTemplates.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [search, viewTemplates]);

  /* ── Reports filtered data ── */
  const viewReports = useMemo(() => {
    if (insightsSidebarView === 'dashboards') return REPORTS_DATA.filter(r => r.type === 'dashboard');
    return REPORTS_DATA;
  }, [insightsSidebarView]);

  const filteredReports = useMemo(() => {
    if (!search) return viewReports;
    const q = search.toLowerCase();
    return viewReports.filter(r => r.name.toLowerCase().includes(q));
  }, [search, viewReports]);

  const TEMPLATE_VIEW_LABELS: Record<TemplatesSidebarView, string> = {
    'my-templates': 'My Templates', 'shared-with-me': 'Shared with Me',
    favorites: 'Favorites', 'all-templates': 'All Templates',
  };

  const INSIGHTS_VIEW_LABELS: Record<InsightsSidebarView, string> = {
    overview: 'Overview', dashboards: 'Dashboards', reports: 'Reports',
  };

  /* ── Templates content ── */
  const templatesContent = (
    <AgreementTableView
      pageHeader={
        <PageHeader
          title={TEMPLATE_VIEW_LABELS[templatesSidebarView]}
          actions={
            <>
              <Button kind="secondary" startElement={<Icon name="upload" size={16} />}>Upload</Button>
              <Button kind="secondary">New Template</Button>
            </>
          }
        />
      }
      filterBar={
        <FilterBar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search templates...',
          }}
          filters={
            <Inline gap="small" align="center" style={{ flexWrap: 'nowrap' }}>
              <Button kind="secondary" size="small" menuTrigger>Owner</Button>
              <Button kind="secondary" size="small" menuTrigger>Shared</Button>
              <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>All Filters</Button>
            </Inline>
          }
        />
      }
    >
      <DataTable
        columns={templateColumns}
        data={filteredTemplates}
        getRowKey={(row) => row.id}
        stickyHeader
        showColumnControl
        emptyMessage="No templates found"
        pagination={{ page: 1, pageSize: 25, totalItems: filteredTemplates.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }}
      />
    </AgreementTableView>
  );

  /* ── Insights content ── */
  const insightsContent = insightsSidebarView === 'overview' ? (
    <InsightsOverview />
  ) : (
    <AgreementTableView
      pageHeader={
        <PageHeader
          title={INSIGHTS_VIEW_LABELS[insightsSidebarView]}
          actions={
            <Button kind="secondary" startElement={<Icon name="plus" size={16} />}>
              {insightsSidebarView === 'dashboards' ? 'New Dashboard' : 'New Report'}
            </Button>
          }
        />
      }
      filterBar={
        <FilterBar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: insightsSidebarView === 'dashboards' ? 'Search dashboards...' : 'Search reports...',
          }}
          filters={
            <Inline gap="small" align="center" style={{ flexWrap: 'nowrap' }}>
              <Button kind="secondary" size="small" menuTrigger>Type</Button>
              <Button kind="secondary" size="small" menuTrigger>Owner</Button>
            </Inline>
          }
        />
      }
    >
      <DataTable
        columns={reportColumns}
        data={filteredReports}
        getRowKey={(row) => row.id}
        stickyHeader
        showColumnControl
        emptyMessage={insightsSidebarView === 'dashboards' ? 'No dashboards found' : 'No reports found'}
        pagination={{ page: 1, pageSize: 25, totalItems: filteredReports.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }}
      />
    </AgreementTableView>
  );

  /* ── Agreements content ── */
  const agreementsContent = (
    <AgreementTableView
      banner={isNavigatorView ? (
        <Banner kind="promo" closable customIcon={<IrisIcon />}>
          <strong>0 agreements</strong> with renewal notice dates in the next 30 days.
        </Banner>
      ) : undefined}
      pageHeader={
        <PageHeader
          title={isNavigatorView ? (
            <span>
              Completed{' '}
              <span style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', cursor: 'pointer' }}>Documents</span>
              {' '}<Icon name="chevron-down" size={16} style={{ verticalAlign: 'middle', color: 'var(--ink-text-secondary)' }} />
            </span>
          ) : isPartiesView ? 'Parties' : isRequestsView ? 'Requests' : VIEW_LABELS[sidebarView]}
          showAIBadge={isNavigatorView || isPartiesView}
          aiBadgeText="AI-Assisted"
          actions={isPartiesView
            ? (<>
                <IconButton icon="bar-chart-2" variant="tertiary" size="small" aria-label="Analytics" />
                <Button kind="secondary" startElement={<Icon name="settings" size={16} />}>Manage Parties</Button>
              </>)
            : isRequestsView
            ? <Button kind="secondary">Create Request</Button>
            : isNavigatorView
            ? (<>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--ink-border-color-default)', borderRadius: 'var(--ink-radius-sm)', height: '32px', background: '#fff', cursor: 'pointer' }}>
                  <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="plus" size={16} color="var(--ink-text-primary)" />
                  </div>
                  <div style={{ width: 1, height: 16, background: 'var(--ink-border-color-default)' }} />
                  <div style={{ width: 24, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--ink-border-color-default)', borderRadius: 'var(--ink-radius-sm)', height: '32px', background: '#fff', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="settings" size={16} color="var(--ink-text-primary)" />
                    <div style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: '#e03131', border: '1.5px solid #fff' }} />
                  </div>
                  <div style={{ width: 1, height: 16, background: 'var(--ink-border-color-default)' }} />
                  <div style={{ width: 24, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                  </div>
                </div>
              </>)
            : <Button kind="secondary" menuTrigger>Shared Access</Button>
          }
        />
      }
      filterBar={
        <div
          style={{ position: 'relative' }}
          onFocusCapture={() => {
            if (isNavigatorView) {
              clearTimeout(suggestionsHideTimer.current);
              setShowSuggestions(true);
            }
          }}
          onBlurCapture={() => {
            suggestionsHideTimer.current = setTimeout(() => setShowSuggestions(false), 150);
          }}
        >
        <FilterBar
          viewSelector={isPartiesView ? (
            <Button kind="secondary" size="small" menuTrigger>Role View</Button>
          ) : undefined}
          search={{
            value: search,
            onChange: (v) => { setSearch(v); if (!v) { setSubmittedSearch(''); setShowIrisSidebar(false); } },
            onSubmit: isNavigatorView ? () => { setSubmittedSearch(search); setShowSuggestions(false); } : undefined,
            placeholder: isNavigatorView
              ? "Try 'which agreements expire in 90 days'"
              : isPartiesView ? 'Search parties...'
              : isRequestsView ? 'Search Request Titles or IDs...'
              : 'Search Envelopes',
          }}
          showSearchIndicator={!isPartiesView && !isRequestsView}
          quickActions={isNavigatorView ? [
            <IconButton key="bm" icon="bookmark" variant="secondary" size="small" aria-label="Bookmarks" />,
          ] : isRequestsView ? [
            <IconButton key="bm" icon="bookmark" variant="secondary" size="small" aria-label="Bookmarks" />,
          ] : undefined}
          filters={isPartiesView ? (
            <Inline gap="small" align="center" style={{ flexWrap: 'nowrap' }}>
              <Button kind="secondary" size="small" menuTrigger>Party Roles</Button>
              <Button kind="secondary" size="small" menuTrigger>Party Side</Button>
            </Inline>
          ) : isRequestsView ? (
            <Inline gap="small" align="center" style={{ flexWrap: 'nowrap' }}>
              <Chip onRemove={() => {}}>Status Type: Open</Chip>
              <Button kind="secondary" size="small" menuTrigger>Created At</Button>
              <Button kind="secondary" size="small" menuTrigger>Due Date</Button>
              <Button kind="secondary" size="small" menuTrigger>Last Activity At</Button>
              <Button kind="secondary" size="small" menuTrigger>Owner</Button>
              <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>All Filters</Button>
            </Inline>
          ) : isNavigatorView ? (
            <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>Filters</Button>
          ) : (
            <Inline gap="small" align="center" style={{ flexWrap: 'nowrap' }}>
              <Chip onRemove={() => {}}>Date: Last 6 Months</Chip>
              <div style={{ width: 1, height: 20, background: 'var(--ink-border-subtle)', flexShrink: 0 }} />
              <Button kind="secondary" size="small" menuTrigger>Status</Button>
              <Button kind="secondary" size="small" menuTrigger>Sender</Button>
              <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>All Filters</Button>
            </Inline>
          )}
        />
        {isNavigatorView && showSuggestions && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, marginTop: '4px' }}>
            <SuggestionsDropdown onSelect={(q, id) => {
              setSearch(q);
              setSubmittedSearch(q);
              setSelectedQueryId(id);
              setShowSuggestions(false);
            }} />
          </div>
        )}
        </div>
      }
    >
      {isPartiesView ? (
        <DataTable columns={partyColumns} data={filteredParties} getRowKey={(row) => row.id} stickyHeader showColumnControl emptyMessage="No parties match your search" pagination={{ page: 1, pageSize: 25, totalItems: 1334, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }} />
      ) : isRequestsView ? (
        <DataTable columns={requestColumns} data={filteredRequests} getRowKey={(row) => row.id} stickyHeader showColumnControl rowHeight="tall" emptyMessage="No requests found" pagination={{ page: 1, pageSize: 10, totalItems: filteredRequests.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }} />
      ) : isNavigatorView ? (
        <>
          {submittedSearch && selectedQueryId === 'sq_current' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--ink-border-color-subtle)', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text size="xs" color="secondary" style={{ fontWeight: 600 }}>Filters applied:</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--ink-blue-10, #e8f3ff)', border: '1px solid var(--ink-blue-30, #b3d4ff)', borderRadius: 100, padding: '3px 10px 3px 8px' }}>
                  <Icon name="building-person" size={12} color="var(--ink-blue-80, #1565c0)" />
                  <span style={{ fontSize: 12, color: 'var(--ink-blue-80, #1565c0)', fontWeight: 500, marginLeft: 4 }}>Party: Acme</span>
                  <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', display: 'flex', alignItems: 'center' }}>
                    <Icon name="close" size={10} color="var(--ink-blue-80, #1565c0)" />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--ink-blue-10, #e8f3ff)', border: '1px solid var(--ink-blue-30, #b3d4ff)', borderRadius: 100, padding: '3px 10px 3px 8px' }}>
                  <Icon name="calendar" size={12} color="var(--ink-blue-80, #1565c0)" />
                  <span style={{ fontSize: 12, color: 'var(--ink-blue-80, #1565c0)', fontWeight: 500, marginLeft: 4 }}>Expiration: Next 6 months</span>
                  <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', display: 'flex', alignItems: 'center' }}>
                    <Icon name="close" size={10} color="var(--ink-blue-80, #1565c0)" />
                  </button>
                </div>
                <button onClick={() => { setSearch(''); setSubmittedSearch(''); setSelectedQueryId(''); }} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>Clear all</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)', fontWeight: 500 }}>42 agreements · Party: Acme · Expiring: next 6 months</span>
              </div>
            </div>
          )}
          {submittedSearch && selectedQueryId !== 'sq_current' && (isAnswerLoading ? <AnswerSkeleton /> : <AIAnswerBlock question={submittedSearch} onContinue={(msg) => { setIrisFollowUp(msg || undefined); setShowIrisSidebar(true); }} onBuildWorksheet={handleBuildWorksheet} />)}
          {submittedSearch && selectedQueryId !== 'sq_current' && filteredNavigator.length < 687 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 10px', borderBottom: '1px solid var(--ink-border-color-subtle)', marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '3px 12px' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)', fontWeight: 500 }}>Showing {filteredNavigator.length} of 687</span>
              </div>
              <Text size="xs" color="secondary">agreements matching your search</Text>
              <button onClick={() => { setSearch(''); setSubmittedSearch(''); setSelectedQueryId(''); }} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>Clear filter</button>
            </div>
          )}
          <DataTable columns={navigatorColumns} data={filteredNavigator} getRowKey={(row) => row.id} selectable stickyHeader showColumnControl rowHeight="tall" emptyMessage="No completed documents" onRowClick={() => setShowAgreementDetail(true)} pagination={{ page: 1, pageSize: 50, totalItems: submittedSearch ? filteredNavigator.length : 687, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }} />
        </>
      ) : (
        <DataTable columns={agreementColumns} data={filteredAgreements} getRowKey={(row) => row.id} selectable stickyHeader showColumnControl rowHeight="tall" emptyMessage={
          sidebarView === 'drafts' ? 'No drafts found' :
          sidebarView === 'in-progress' ? 'No documents in progress' :
          sidebarView === 'deleted' ? 'No deleted documents' :
          'No agreements match your search'
        } pagination={{ page: 1, pageSize: 25, totalItems: filteredAgreements.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }} />
      )}
    </AgreementTableView>
  );

  /* ── Resolve content + sidebar ── */
  const sidebarMap: Record<TabId, object | undefined> = {
    home: undefined,
    agreements: agreementsSidebar,
    templates: templatesSidebar,
    insights: insightsSidebar,
    admin: undefined,
  };

  const contentMap: Record<TabId, JSX.Element> = {
    home: <HomePage />,
    agreements: agreementsContent,
    templates: templatesContent,
    insights: insightsContent,
    admin: <AdminPage />,
  };

  /* ── Transition key — changes on tab OR sidebar view to trigger animation ── */
  const transitionKey = `${activeTab}-${sidebarView}-${templatesSidebarView}-${insightsSidebarView}`;

  return (
    <>
    <style>{tableRowStaggerStyles}</style>
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto', transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <DocuSignShell
          globalNav={globalNavConfig}
          localNav={showIrisSidebar
            ? { ...agreementsSidebar, isLocked: false }
            : sidebarMap[activeTab]}
        >
          <FadeIn keyProp={transitionKey + (showWorksheetView ? '-ws' : '')} key={transitionKey + (showWorksheetView ? '-ws' : '')}>
            <div className="page-transition" style={{ flex: 1 }}>
              {showWorksheetView
                ? <WorksheetView onBack={() => { setShowWorksheetView(false); }} worksheetType={worksheetType} />
                : contentMap[activeTab]}
            </div>
          </FadeIn>
          <Footer />
        </DocuSignShell>
      </div>
      {showIrisSidebar && (
        <IrisSidebar
          question={submittedSearch}
          followUp={irisFollowUp}
          onClose={() => { setShowIrisSidebar(false); setIrisFollowUp(undefined); setShowWorksheetView(false); }}
          onBuildWorksheet={handleBuildWorksheet}
          worksheetMode={showWorksheetView}
        />
      )}
    </div>
    {showAgreementDetail && (
      <AgreementDetailView onClose={() => setShowAgreementDetail(false)} />
    )}
    {worksheetLoading && <WorksheetLoadingOverlay worksheetType={worksheetType} />}
    {showWorksheetModal && (
      <WorksheetModal onClose={() => setShowWorksheetModal(false)} worksheetType={worksheetType} />
    )}
    </>
  );
}
