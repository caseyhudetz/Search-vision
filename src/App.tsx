import { useState, useMemo, useCallback, useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { SearchBarLabPage } from './SearchBarLab';
import {
  DocuSignShell,
  AgreementTableView,
  DataTable,
  PageHeader,
  FilterBar,
  Button,
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

@keyframes iris-thinking-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

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

@keyframes acmeCardIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Search input wide enough to show full queries */
.search-input-wrapper input[type="text"],
.search-input-wrapper input:not([type]) {
  min-width: min(820px, 70vw) !important;
  width: min(820px, 70vw) !important;
}

/* ── Full Screen Iris transitions ── */
@keyframes irisEnter {
  from { opacity: 0; transform: scale(0.975); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes irisExit {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.975); }
}
.iris-fs-enter { animation: irisEnter 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.iris-fs-exit  { animation: irisExit  0.22s ease-in forwards; }

@keyframes fsStepIn {
  from { opacity: 0; transform: translateY(7px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fs-step-in { animation: fsStepIn 0.28s cubic-bezier(0.33, 0, 0.2, 1) forwards; }

@keyframes fsAnswerIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fs-answer-in { animation: fsAnswerIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

/* ── Spend AI Preview (Show More) ── */
@keyframes previewIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.spend-preview-in { animation: previewIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes previewOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
.spend-preview-out { animation: previewOut 0.18s ease-in forwards; }

/* ── Navigator table: gray header + column dividers ── */
[data-ink-component="DataTable"] thead th {
  background: #f5f5f8 !important;
}
[data-ink-component="DataTable"] th:not(:last-child),
[data-ink-component="DataTable"] td:not(:last-child) {
  border-right: 1px solid var(--ink-border-color-subtle, #e8e8ec);
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
  { id: 'sq_updates', icon: 'bell' as const, query: 'Acme', label: 'Keyword search' as string | undefined },
  { id: 'sq_renewal', icon: 'refresh' as const, query: 'Acme contract renewal', label: 'Short phrase' as string | undefined },
  { id: 'sq_deep', icon: 'chart-bar' as const, query: 'What products and services do we purchase from Acme?', label: 'Full question → Worksheet' as string | undefined },
  { id: 'sq_spend', icon: 'chart-bar' as const, query: "What's our committed spend by vendor category?", label: 'Full question → Report' as string | undefined },
  { id: 'sq3', icon: 'calendar' as const, query: 'Show me all vendor contracts expiring in the next 6 months', description: 'v1 · AI-guided analysis, risk identification, and structured worksheet' },
];

function SuggestionsDropdown({ onSelect, filterIds, fsMode }: { onSelect: (q: string, id: string) => void; filterIds?: string[]; fsMode?: boolean }) {
  const SectionHeader = ({ label }: { label: string }) => (
    <div style={{
      padding: '10px 16px 5px',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase' as const, color: 'var(--ink-text-secondary)',
      borderTop: '1px solid var(--ink-border-color-subtle)',
    }}>
      {label}
    </div>
  );

  const FlowItem = ({ q, badge }: { q: typeof SUGGESTED_QUESTIONS[0]; badge?: React.ReactNode }) => {
    return (
      <button
        onMouseDown={(e) => { e.preventDefault(); onSelect(q.query, q.id); }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f5f5f7)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
      >
        <Icon name={q.icon} size={14} color="var(--ink-text-secondary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--ink-text-primary)', flex: 1, minWidth: 0 }}>{q.label || q.query}</span>
        {badge}
      </button>
    );
  };

  const show = (id: string) => !filterIds || filterIds.includes(id);

  const sq_updates = SUGGESTED_QUESTIONS.find(q => q.id === 'sq_updates')!;
  const sq_renewal = SUGGESTED_QUESTIONS.find(q => q.id === 'sq_renewal')!;
  const sq_deep = SUGGESTED_QUESTIONS.find(q => q.id === 'sq_deep')!;
  const sq3 = SUGGESTED_QUESTIONS.find(q => q.id === 'sq3')!;
  const sq_spend = SUGGESTED_QUESTIONS.find(q => q.id === 'sq_spend')!;

  const mainFlows = [sq_updates, sq_renewal, sq_deep, sq_spend].filter(q => show(q.id));

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--ink-border-color-subtle)',
      borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 16px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-text-secondary)' }}>
        Demo Flows
      </div>

      {mainFlows.map(q => <FlowItem key={q.id} q={q} />)}

      {show('sq3') && (
        <>
          <SectionHeader label="Archive" />
          <FlowItem
            q={sq3}
            badge={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'var(--ink-green-80, #2f9e44)', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-green-80, #2f9e44)', flexShrink: 0 }} />
                v1
              </span>
            }
          />
        </>
      )}
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

function DisambiguationCard({ question, options, onSelect, selectedOption }: {
  question: string;
  options: string[];
  onSelect: (opt: string) => void;
  selectedOption?: string;
}) {
  const [customInput, setCustomInput] = useState('');
  const isAnswered = !!selectedOption;
  const isCustomSelected = isAnswered && !options.includes(selectedOption!);

  const handleCustomSubmit = () => {
    if (isAnswered) return;
    onSelect(customInput.trim() || 'Something else');
  };

  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '13px 16px 11px', borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
        <Text size="sm" style={{ fontWeight: 600 }}>{question}</Text>
      </div>
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => !isAnswered && onSelect(opt)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 16px', textAlign: 'left', fontFamily: 'inherit',
            background: selectedOption === opt ? 'var(--ink-purple-5, #f5f4fd)' : '#fff',
            border: 'none', borderTop: '1px solid var(--ink-border-color-subtle)',
            cursor: isAnswered ? 'default' : 'pointer',
            opacity: isAnswered && selectedOption !== opt ? 0.38 : 1,
            transition: 'background 120ms, opacity 150ms',
          }}
          onMouseEnter={(e) => { if (!isAnswered) (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f4fd)'; }}
          onMouseLeave={(e) => { if (!isAnswered) (e.currentTarget as HTMLElement).style.background = '#fff'; }}
        >
          <span style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: selectedOption === opt ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-neutral-fade-10, #f1f1f4)',
            color: selectedOption === opt ? '#fff' : 'var(--ink-text-secondary)',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 150ms, color 150ms',
          }}>{i + 1}</span>
          <Text size="sm" style={{ fontWeight: selectedOption === opt ? 500 : 400 }}>{opt}</Text>
        </button>
      ))}

      {/* Something else row */}
      <div style={{
        borderTop: '1px solid var(--ink-border-color-subtle)',
        padding: '8px 12px 8px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: isCustomSelected ? 'var(--ink-purple-5, #f5f4fd)' : '#fff',
        opacity: isAnswered && !isCustomSelected ? 0.38 : 1,
        transition: 'background 120ms, opacity 150ms',
      }}>
        <Icon name="edit" size={13} color={isCustomSelected ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-text-secondary)'} />
        {isCustomSelected ? (
          <Text size="sm" style={{ flex: 1, fontWeight: 500, color: 'var(--ink-purple-100, #4B47C8)' }}>{selectedOption}</Text>
        ) : (
          <>
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
              placeholder="Something else..."
              disabled={isAnswered}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}
            />
            <button
              onClick={handleCustomSubmit}
              disabled={isAnswered}
              style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-text-secondary)', background: 'none', border: 'none', cursor: isAnswered ? 'default' : 'pointer', padding: '3px 6px', fontFamily: 'inherit', flexShrink: 0 }}
            >Skip</button>
            <button
              onClick={handleCustomSubmit}
              disabled={isAnswered}
              style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: customInput.trim() ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-neutral-fade-10, #f1f1f4)', color: customInput.trim() ? '#fff' : 'var(--ink-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isAnswered ? 'default' : 'pointer', flexShrink: 0, transition: 'background 150ms' }}
            >
              <Icon name="arrow-up" size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MultiStepDisambiguationCard({ steps, onComplete }: {
  steps: { question: string; options: string[] }[];
  onComplete: (answers: string[]) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  const step = steps[currentStep];
  const currentAnswer = answers[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleSelect = (opt: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = opt;
    setAnswers(newAnswers);
    if (isLastStep) {
      setTimeout(() => onComplete(newAnswers), 400);
    } else {
      setTimeout(() => setCurrentStep(s => s + 1), 350);
    }
  };

  const canGoNext = !!answers[currentStep] && !isLastStep;

  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ padding: '13px 16px 11px', borderBottom: '1px solid var(--ink-border-color-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text size="sm" style={{ fontWeight: 600, flex: 1, marginRight: 12 }}>{step.question}</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            style={{ background: 'none', border: 'none', cursor: currentStep === 0 ? 'default' : 'pointer', opacity: currentStep === 0 ? 0.3 : 1, padding: '2px 5px', display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-left" size={13} color="var(--ink-text-secondary)" />
          </button>
          <Text size="xs" color="secondary" style={{ minWidth: 36, textAlign: 'center' as const }}>{currentStep + 1} of {steps.length}</Text>
          <button
            onClick={() => canGoNext && setCurrentStep(s => s + 1)}
            disabled={!canGoNext}
            style={{ background: 'none', border: 'none', cursor: canGoNext ? 'pointer' : 'default', opacity: canGoNext ? 1 : 0.3, padding: '2px 5px', display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-right" size={13} color="var(--ink-text-secondary)" />
          </button>
        </div>
      </div>
      {/* Options */}
      {step.options.map((opt, i) => (
        <button key={opt} onClick={() => handleSelect(opt)}
          style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', background: currentAnswer === opt ? 'var(--ink-purple-5)' : '#fff', border: 'none', borderTop: '1px solid var(--ink-border-color-subtle)', cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: currentAnswer === opt ? 'var(--ink-purple-100)' : 'var(--ink-neutral-fade-10)', color: currentAnswer === opt ? '#fff' : 'var(--ink-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            <Text size="sm" style={{ color: currentAnswer === opt ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-text-primary)' }}>{opt}</Text>
          </div>
          {currentAnswer === opt && <Icon name="arrow-right" size={13} color="var(--ink-purple-100, #4B47C8)" />}
        </button>
      ))}
      {/* Something else */}
      <div style={{ borderTop: '1px solid var(--ink-border-color-subtle)', padding: '8px 12px 8px 16px', display: 'flex', alignItems: 'center', gap: 8, background: '#fff' }}>
        <Icon name="edit" size={13} color="var(--ink-text-secondary)" />
        <input value={customInput} onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && customInput.trim()) handleSelect(customInput.trim()); }}
          placeholder="Something else..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', background: 'transparent', color: 'var(--ink-text-primary)' }} />
        <button onClick={() => handleSelect(customInput.trim() || 'Skip')}
          style={{ fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink-text-secondary)', padding: '4px 8px' }}>Skip</button>
      </div>
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

function QuickWorksheetFlow({ question, initialReady, onOpenWorksheetEntry, scrollRef }: {
  question: string; initialReady: boolean; onOpenWorksheetEntry: () => void; scrollRef: React.RefObject<HTMLDivElement>;
}) {
  const [phase, setPhase] = useState<'thinking' | 'answer' | 'pivot' | 'chip'>('thinking');

  useEffect(() => {
    if (!initialReady) return;
    const t1 = setTimeout(() => setPhase('answer'), 800);
    const t2 = setTimeout(() => setPhase('pivot'), 1600);
    const t3 = setTimeout(() => setPhase('chip'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [initialReady]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [phase]);

  return (
    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <IrisUserBubble text={question} />

      {!initialReady && <IrisThinkingBubble />}

      {initialReady && (
        <>
          {/* Mini step indicator */}
          <div className="iris-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="status-check" size={12} color="var(--ink-green-80, #2f9e44)" />
            <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)' }}>Read 10 Acme agreements</span>
          </div>

          {phase === 'thinking' && <IrisThinkingBubble />}

          {phase !== 'thinking' && (
            <div className="iris-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Inline gap="xs" align="center">
                <IrisIcon />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
              </Inline>
              <Text size="sm" style={{ lineHeight: 1.65 }}>
                Across your <strong>10 Acme agreements</strong>, you purchase <strong>3 categories</strong> of products and services: Cloud storage &amp; hosting, Managed IT support, and Professional services. Total committed spend is <strong>$225K/yr</strong>.
              </Text>
            </div>
          )}

          {(phase === 'pivot' || phase === 'chip') && (
            <div className="iris-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-primary)' }}>
                I can help you track and compare this across all your agreements in a structured worksheet — no manual setup needed. Want me to set that up?
              </Text>
            </div>
          )}

          {phase === 'chip' && (
            <button onClick={onOpenWorksheetEntry} className="chip-fade-in" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', border: '1px solid var(--ink-border-color-default)',
              borderRadius: 100, padding: '8px 14px', cursor: 'pointer', fontSize: 13,
              fontFamily: 'inherit', color: 'var(--ink-text-primary)', textAlign: 'left' as const,
              maxWidth: 380, transition: 'background 0.12s, border-color 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
            >
              <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
              Yes, build the worksheet
            </button>
          )}
        </>
      )}
    </div>
  );
}

function CitationBadge({ number, title, excerpt }: { number: number; title: string; excerpt: string }) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      const r = badgeRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX + r.width / 2 });
    }
    setHovered(true);
  };

  return (
    <span style={{ display: 'inline-block', verticalAlign: 'super', lineHeight: 1, marginLeft: 2 }}>
      <span
        ref={badgeRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          height: 18, minWidth: 18, padding: '0 5px',
          fontSize: 11, fontWeight: 600, lineHeight: 1,
          color: hovered ? 'var(--ink-white-100, #fff)' : 'var(--ink-cobalt-100, #4B47C8)',
          background: hovered ? 'var(--ink-cobalt-100, #4B47C8)' : 'var(--ink-cobalt-10, #eeeeff)',
          border: '1px solid var(--ink-cobalt-30, #c5c3f5)',
          borderRadius: 4,
          cursor: 'default',
          transition: 'background 0.12s, color 0.12s',
          userSelect: 'none',
        }}
      >
        {number}
      </span>
      {hovered && createPortal(
        <span style={{
          position: 'absolute', top: pos.top, left: pos.left, transform: 'translateX(-50%)',
          width: 280, background: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 8, padding: 16, zIndex: 99999,
          animation: 'citationFadeIn 0.15s ease',
          pointerEvents: 'none',
        }}>
          <span style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-text-secondary)', marginBottom: 4 }}>Source</span>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink-text-primary)', marginBottom: 6 }}>{title}</span>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'var(--ink-text-secondary)', lineHeight: 1.55 }}>"{excerpt.length > 160 ? excerpt.slice(0, 160) + '…' : excerpt}"</span>
          <style>{`@keyframes citationFadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
        </span>,
        document.body
      )}
    </span>
  );
}

function IrisSidebar({ question, followUp, onClose, onBuildWorksheet, onBuildReport, worksheetMode, flowId, skipThinking, onOpenWorksheetEntry }: {
  question: string; followUp?: string; onClose: () => void; onBuildWorksheet?: (type: string) => void; onBuildReport?: (measure: string, groupBy: string) => void; worksheetMode?: boolean; flowId?: string; skipThinking?: boolean; onOpenWorksheetEntry?: (query: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [followUpReady, setFollowUpReady] = useState(false);
  const [worksheetRequested, setWorksheetRequested] = useState(false);
  const [wsCompleteReady, setWsCompleteReady] = useState(false);
  const _qi = question.toLowerCase();
  const _isRenewalInit = followUp && ((_qi.includes('6 month') || _qi.includes('six month')) && (_qi.includes('expir') || _qi.includes('renew') || _qi.includes('vendor')));
  const _isDeepInit = flowId === 'sq_deep' && !!followUp;
  const _isUpdatesInit = flowId === 'sq_updates' && !!followUp;
  const _isRenewalContractInit = flowId === 'sq_renewal' && !!followUp;
  const _isSpendInit = flowId === 'sq_spend' && !!followUp;
  const [convStep, setConvStep] = useState(_isRenewalInit ? 1 : 0);
  const [userMessages, setUserMessages] = useState<string[]>(
    _isDeepInit ? [followUp as string] : _isUpdatesInit ? [followUp as string] : _isRenewalContractInit ? [followUp as string] : _isSpendInit ? [followUp as string] : _isRenewalInit ? [followUp as string] : []
  );
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [initialReady, setInitialReady] = useState(!!skipThinking);
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

  useEffect(() => {
    if ((!_isDeepInit && !_isUpdatesInit && !_isRenewalContractInit && !_isSpendInit) || !followUpReady || convStep !== 0) return;
    setConvStep(1);
  }, [followUpReady]);

  useEffect(() => {
    if (flowId !== 'ws_complete') return;
    const t = setTimeout(() => setWsCompleteReady(true), 800);
    return () => clearTimeout(t);
  }, [flowId]);

  const q = question.toLowerCase();
  const fq = (followUp || '').toLowerCase();
  const isPriceRaiseFlow = (q.includes('renewal') || q.includes('renew')) &&
    (q.includes('6') || q.includes('six')) && q.includes('month') &&
    (fq.includes('raise') || fq.includes('price') || fq.includes('increase'));

  const isVendorExposureFlow = (q.includes('spend') || q.includes('committed') || q.includes('exposure') || (q.includes('acme') && (q.includes('total') || q.includes('?')))) &&
    (fq.includes('volume') || fq.includes('seat') || fq.includes('grown') || fq.includes('overcharged') || fq.includes('analyze') || fq.includes('growth') || fq.includes('over') || fq.includes('usage') || fq.includes('using'));

  const isSLAFlow = q.includes('software') && q.includes('sla');
  const isPartyFlow = flowId === 'sq_current';
  const isUpdatesFlow = flowId === 'sq_updates';
  const isRenewalContractFlow = flowId === 'sq_renewal';
  const isDeepAnalysisFlow = flowId === 'sq_deep';
  const isSpendFlow = flowId === 'sq_spend';
  const isQuickWorksheetFlow = flowId === 'sq_deep_quick';
  const isWsCompleteFlow = flowId === 'ws_complete';
  const isReportPath = isSpendFlow && (userMessages[0] || followUp || '') === 'Build a spend report';
  const deepEntryChip = isDeepAnalysisFlow ? (followUp || userMessages[0] || '') : '';
  const isPricingTermsPath = deepEntryChip === 'Show me pricing and licensing terms';
  const isFlagEscalationPath = deepEntryChip === 'Flag any price escalation clauses';
  const isPricingTablePath = deepEntryChip === 'Build a pricing comparison table';
  const isRenewalScanFlow = (q.includes('6 month') || q.includes('six month')) && (q.includes('expir') || q.includes('renew') || q.includes('vendor'));
  const sendMessage = (msg: string) => {
    setUserMessages(prev => [...prev, msg]);
    setInputValue('');
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      if ((isPriceRaiseFlow || isVendorExposureFlow || isSLAFlow || isPartyFlow || isUpdatesFlow) && convStep === 0) setConvStep(1);
      if (isRenewalScanFlow && convStep < 3) setConvStep(convStep + 1);
      if (isDeepAnalysisFlow && convStep < 3) setConvStep(convStep + 1);
      if (isRenewalContractFlow && convStep < 4) setConvStep(convStep + 1);
      if (isSpendFlow && convStep < 1) setConvStep(convStep + 1);
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
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
          >
            <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
            By how much?
          </button>
        </div>
      )}
      {isVendorExposureFlow && convStep === 0 && (
        <div style={{ marginBottom: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue('Are we over our committed seat usage?'); }}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
          >
            <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
            Are we over our committed seat usage?
          </button>
        </div>
      )}
      {isSLAFlow && convStep === 0 && (
        <div style={{ marginBottom: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue('Which claim windows are still open?'); }}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
          >
            <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
            Which claim windows are still open?
          </button>
        </div>
      )}
      {isPartyFlow && followUp && convStep === 0 && (
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(followUp.toLowerCase().includes('expir') ? [
            { label: 'What are the notice periods?', val: 'What notice periods apply to those agreements?' },
          ] : [
            { label: 'What are the renewal terms?', val: 'What are the renewal terms in the MSA?' },
          ]).map(chip => (
            <button
              key={chip.label}
              onMouseDown={(e) => { e.preventDefault(); setInputValue(chip.val); }}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
            >
              <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
              {chip.label}
            </button>
          ))}
        </div>
      )}
      {isUpdatesFlow && !isThinking && convStep === 0 && userMessages.length === 0 && (
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {["What's expiring soon?", 'Summarize my relationship with Acme', 'Are there any price increase clauses?'].map(q => (
            <button key={q}
              onMouseDown={(e) => { e.preventDefault(); sendMessage(q); }}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
            >
              <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
              {q}
            </button>
          ))}
        </div>
      )}
      {isUpdatesFlow && !isThinking && convStep >= 1 && userMessages.length === 1 && (
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {["What's the total spend?", 'Are there any auto-renewal clauses?', 'When does the MSA expire?', 'Are there any price escalation caps?'].map(q => (
            <button key={q}
              onMouseDown={(e) => { e.preventDefault(); setInputValue(q); }}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
            >
              <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
              {q}
            </button>
          ))}
        </div>
      )}
      {isDeepAnalysisFlow && chipsReady && !isThinking && convStep === 0 && userMessages.length === 0 && (
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue('What products or services do we purchase and how is pricing structured?'); }}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
          >
            <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
            What products or services do we purchase and how is pricing structured?
          </button>
        </div>
      )}
      {isDeepAnalysisFlow && chipsReady && !isThinking && convStep === 1 && userMessages.length === 1 && (
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue(isPricingTermsPath ? 'Yes, set it up' : isFlagEscalationPath ? 'Yes, flag them' : isPricingTablePath ? 'Yes, build it' : 'Break down by pricing model and give examples'); }}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
          >
            <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
            {isPricingTermsPath ? 'Yes, set it up' : isFlagEscalationPath ? 'Yes, flag them' : isPricingTablePath ? 'Yes, build it' : 'Break down by pricing model and give examples'}
          </button>
        </div>
      )}
      {isDeepAnalysisFlow && chipsReady && !isThinking && convStep === 2 && userMessages.length === 2 && !isPricingTermsPath && !isPricingTablePath && (
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setInputValue(isFlagEscalationPath ? 'Yes, build the tracker' : 'Yes, set it up'); }}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
          >
            <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
            {isFlagEscalationPath ? 'Yes, build the tracker' : 'Yes, set it up'}
          </button>
        </div>
      )}
      {/* Input card — matches screenshot */}
      <div style={{
        border: '1px solid var(--ink-border-color-default)',
        borderRadius: 14, padding: '12px 12px 10px',
        background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          onClick={() => {
            if (!inputValue && isRenewalScanFlow) {
              if (convStep === 0 && userMessages.length === 0) setInputValue("I want to identify which agreements might increase in price and by how much");
              else if (convStep === 1 && userMessages.length === 1) setInputValue("Yes, let's do that.");
              else if (convStep === 2 && userMessages.length === 2) setInputValue('Add Primary Owner');
            }
            if (!inputValue && isDeepAnalysisFlow) {
              if (convStep === 0 && userMessages.length === 0) setInputValue('What products or services do we purchase and how is pricing structured?');
              else if (convStep === 1 && userMessages.length === 1) setInputValue(isPricingTermsPath ? 'Yes, set it up' : isFlagEscalationPath ? 'Yes, flag them' : isPricingTablePath ? 'Yes, build it' : 'Break down by pricing model and give examples');
              else if (convStep === 2 && userMessages.length === 2) setInputValue('Yes, set it up');
            }
          }}
          placeholder="Type something..."
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit', marginBottom: 10, display: 'block' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--ink-border-color-default)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="plus" size={14} color="var(--ink-text-secondary)" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-text-secondary)', background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '3px 8px 3px 6px' }}>
            <Icon name="document" size={12} color="var(--ink-text-secondary)" />
            <span>{isSpendFlow ? '47 agreements' : isRenewalScanFlow ? '9 agreements' : isDeepAnalysisFlow ? '10 agreements' : isPartyFlow ? '4 agreements' : '10 sources'}</span>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={handleSend} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: inputValue.trim() ? 'pointer' : 'default', background: 'var(--ink-purple-100, #4B47C8)', opacity: inputValue.trim() ? 1 : 0.38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 150ms', color: '#fff' }}>
            <Icon name="arrow-up" size={14} />
          </button>
        </div>
      </div>
      <div style={{ marginTop: 7, textAlign: 'center', fontSize: 11, color: 'var(--ink-text-secondary)', lineHeight: 1.4 }}>
        Responses are generated with AI and should not be used as legal advice.{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn how we use AI at Docusign.</span>
      </div>
    </div>
  );

  return (
    <div style={{ width: mounted ? `${sidebarWidth}px` : '0px', flexShrink: 0, overflow: 'hidden', transition: isDragging.current ? 'none' : 'width 460ms cubic-bezier(0.22, 1, 0.36, 1)', position: 'relative' }}>
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, cursor: 'col-resize', zIndex: 10, background: 'transparent' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-30, #ddd9ff)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      />
    <div style={{ width: `${sidebarWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', borderLeft: '1px solid var(--ink-border-color-subtle)', background: '#fff', overflow: 'hidden', transform: mounted ? 'translateX(0)' : 'translateX(100%)', transition: isDragging.current ? 'none' : 'transform 460ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', height: '48px', borderBottom: '1px solid var(--ink-border-color-subtle)', flexShrink: 0 }}>
        <Inline gap="small" align="center">
          <IconButton icon="menu" variant="tertiary" size="small" aria-label="Menu" />
          <Inline gap="xs" align="center">
            <IrisSparkleIcon size={15} />
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Iris</span>
            <Icon name="chevron-down" size={14} color="var(--ink-text-secondary)" />
          </Inline>
        </Inline>
        <Inline gap="xs" align="center">
          <IconButton icon="arrows-out" variant="tertiary" size="small" aria-label="Expand" />
          <IconButton icon="close" variant="tertiary" size="small" aria-label="Close" onClick={onClose} />
        </Inline>
      </div>

      {!question && !flowId ? (
        /* ── Blank — opened from Ask Iris button with no query or flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }} />
          {irisInputArea}
        </>
      ) : isPriceRaiseFlow ? (
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
                <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                    <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                  </Inline>

                  {/* Proactive worksheet CTA */}
                  {!(worksheetMode || worksheetRequested) ? (
                    <div style={{ background: 'var(--ink-purple-10, #f5f3ff)', border: '1px solid var(--ink-purple-30, #ddd9ff)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                      <Inline gap="xs" align="center">
                        <IrisIcon />
                        <Text size="sm" style={{ fontWeight: 600 }}>Build a Price Raise Worksheet?</Text>
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.6, color: 'var(--ink-text-secondary)' }}>
                        A worksheet will extract notice deadlines, calculate raise amounts per cap type, and list each eligible agreement in a single view.
                      </Text>
                      <Inline gap="small">
                        <button onClick={() => { setWorksheetRequested(true); if (onBuildWorksheet) onBuildWorksheet('price-raise-renewals'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Yes, build it
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
                        <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Price Raise Worksheet built — 3 agreements</Text>
                      </div>
                      <Stack gap="small">
                        <Text size="sm" style={{ lineHeight: 1.65 }}>Your worksheet is ready. Here are some things you might want to explore next:</Text>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {[
                            'Which vendor has the earliest notice deadline?',
                            'Draft a price raise notice for Globex',
                            'Show me the full renewal timeline',
                            'Which contracts allow a higher raise next year?',
                          ].map(chip => (
                            <button key={chip} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'background 0.12s, border-color 0.12s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-05, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
                            >
                              <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
                              {chip}
                            </button>
                          ))}
                        </div>
                      </Stack>
                    </div>
                  )}
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
                <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                    <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                  </Inline>
                  {!(worksheetMode || worksheetRequested) ? (
                    <div style={{ background: 'var(--ink-purple-10, #f5f3ff)', border: '1px solid var(--ink-purple-30, #ddd9ff)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                      <Inline gap="xs" align="center">
                        <IrisIcon />
                        <Text size="sm" style={{ fontWeight: 600 }}>Want to dig into this further?</Text>
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                        I can pull together all your Acme agreements into a single view — committed spend, seat counts, and the MFN language — so you have the full picture before renewal comes up.
                      </Text>
                      <Inline gap="small">
                        <button onClick={() => { setWorksheetRequested(true); if (onBuildWorksheet) onBuildWorksheet('vendor-exposure-acme'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Yes, build it
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
                            'Add a column for notice period to terminate',
                            'Flag any auto-renewal clauses',
                            'Add a column comparing per-seat rate to market',
                            'Extract any volume discount thresholds',
                          ].map(label => (
                            <button
                              key={label}
                              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
                            >
                              <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
                              {label}
                            </button>
                          ))}
                        </div>
                        <Inline gap="xs" style={{ marginTop: 4 }}>
                          <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                          <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                          <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                    <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                  </Inline>
                  {!(worksheetMode || worksheetRequested) ? (
                    <div style={{ background: 'var(--ink-purple-10, #f5f3ff)', border: '1px solid var(--ink-purple-30, #ddd9ff)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                      <Inline gap="xs" align="center">
                        <IrisIcon />
                        <Text size="sm" style={{ fontWeight: 600 }}>Build an SLA Remedies Worksheet?</Text>
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.6, color: 'var(--ink-text-secondary)' }}>
                        A worksheet will pull uptime thresholds, credit schedules, claim deadlines, and license counts across your 4 software agreements into a single view.
                      </Text>
                      <Inline gap="small">
                        <button onClick={() => { setWorksheetRequested(true); if (onBuildWorksheet) onBuildWorksheet('sla'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Yes, build it
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
                        <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>SLA Remedies Worksheet built — 4 agreements</Text>
                      </div>
                      <Stack gap="small">
                        <Text size="sm" style={{ lineHeight: 1.65 }}>Your worksheet is ready. Here are some things you might want to explore next:</Text>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {[
                            'Draft a credit claim for BioCore',
                            'Which vendor has the weakest SLA?',
                            'Set a reminder before BioCore\'s claim window closes',
                            'What happens if Pinnacle breaches again?',
                          ].map(chip => (
                            <button key={chip} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'background 0.12s, border-color 0.12s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-05, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
                            >
                              <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
                              {chip}
                            </button>
                          ))}
                        </div>
                      </Stack>
                    </div>
                  )}
                </Stack>
              </>
            )}
          </div>
          {irisInputArea}
        </>
      ) : isDeepAnalysisFlow ? (
        /* ── Deep Analysis flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Step 0: user question */}
            {userMessages.length >= 1 && <IrisUserBubble text={userMessages[0]} />}
            {/* Thinking: pre-populated followUp waits for followUpReady; typed message waits for isThinking */}
            {userMessages.length >= 1 && convStep === 0 && ((_isDeepInit && !followUpReady) || (!_isDeepInit && isThinking)) && <IrisThinkingBubble />}

            {/* Step 1 response: products + pricing models */}
            {convStep >= 1 && (
              <Stack gap="small">
                <Inline gap="xs" align="center">
                  <Text size="xs" color="secondary">Scanning 10 Acme agreements</Text>
                  <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                </Inline>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Across 10 Acme agreements, I found <strong>3 product/service categories</strong> and <strong>3 pricing models</strong> in use.
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--ink-border-color-subtle)', background: 'var(--ink-neutral-fade-05, #f7f7f9)' }}>
                    <Text size="xs" style={{ fontWeight: 600, color: 'var(--ink-text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Products & services found</Text>
                  </div>
                  {[
                    { label: 'Cloud storage & hosting', count: 10, models: 'Volume-tiered' },
                    { label: 'Managed IT support', count: 8, models: 'Flat fee, volume-tiered' },
                    { label: 'Professional services', count: 5, models: 'Time & materials' },
                  ].map((cat, i) => (
                    <div key={cat.label} style={{ padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text size="xs" style={{ fontWeight: 500 }}>{cat.label}</Text>
                        <Text size="xs" color="secondary" style={{ display: 'block' }}>{cat.models}</Text>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-text-secondary)', background: 'var(--ink-neutral-fade-10, #f1f1f4)', borderRadius: 100, padding: '2px 8px' }}>{cat.count}</span>
                    </div>
                  ))}
                </div>
                {isPricingTermsPath && convStep >= 1 && (
                  <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                    To surface all pricing and licensing terms accurately, I'll need to run a structured analysis across your 10 Acme agreements. Would you like me to do that?
                  </Text>
                )}
                {isFlagEscalationPath && convStep >= 1 && (
                  <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                    I can also check all 10 agreements for price escalation language — clauses that allow Acme to increase pricing at renewal. Want me to flag any I find?
                  </Text>
                )}
                {isPricingTablePath && convStep >= 1 && (
                  <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                    Want me to build a side-by-side comparison of pricing terms across all 10 agreements?
                  </Text>
                )}
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}

            {/* Step 2: user asks for pricing breakdown */}
            {userMessages.length >= 2 && <IrisUserBubble text={userMessages[1]} />}
            {isThinking && convStep === 1 && <IrisThinkingBubble />}

            {/* Step 2 response: path-dependent */}
            {convStep >= 2 && (isPricingTermsPath || isPricingTablePath) && !(worksheetMode || worksheetRequested) && (
              /* Pricing terms / pricing table path: skip breakdown, go straight to worksheet proposal */
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  {isPricingTermsPath
                    ? <>I'll set that up now. I'll create a worksheet titled <strong>Acme Products & Pricing Breakdown</strong> that extracts each contract's service, pricing basis, unit price, and any special licensing terms. Here's what I'll pull:</>
                    : <>I'll set that up now. I'll extract the key commercial terms from each of your 10 Acme agreements into a structured comparison worksheet. Here's what I'll pull:</>
                  }
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                  <Text size="xs" style={{ fontWeight: 600, color: 'var(--ink-text-secondary)', display: 'block', marginBottom: 8 }}>What I'll extract</Text>
                  {[
                    { label: 'Agreement name', ai: false },
                    { label: 'Effective date', ai: false },
                    { label: 'End date', ai: false },
                    { label: 'Total contract value', ai: false },
                    { label: 'Service / Offering', ai: true },
                    { label: 'Pricing basis', ai: true },
                    { label: 'Unit price', ai: true },
                    { label: 'Discounts & special terms', ai: true },
                  ].map((col, i) => (
                    <div key={col.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                      <Icon name="check" size={12} color={col.ai ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-text-secondary)'} />
                      <Text size="xs" style={{ flex: 1 }}>{col.label}</Text>
                      {col.ai && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)', background: 'var(--ink-purple-05, #f5f3ff)', border: '1px solid var(--ink-purple-20, #d9d3ff)', borderRadius: 100, padding: '1px 7px' }}>AI</span>}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setWorksheetRequested(true); onBuildWorksheet && onBuildWorksheet('deep-analysis'); if (isPricingTablePath) onClose(); }}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3d39b0'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'; }}
                >
                  <Icon name="table" size={14} color="#fff" />
                  Build my worksheet
                </button>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}
            {convStep >= 2 && isFlagEscalationPath && (
              /* Escalation path: show which agreements have escalation clauses */
              <Stack gap="small">
                <Inline gap="xs" align="center">
                  <Text size="xs" color="secondary">Scanning 10 agreements for price escalation clauses</Text>
                  <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                </Inline>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Found <strong>1 of 10 agreements</strong> with a price escalation clause. The rest have fixed pricing or no escalation language.
                </Text>
                <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '7px 14px', background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderBottom: '1px solid var(--ink-border-color-subtle)', display: 'flex', gap: 16 }}>
                    <Text size="xs" style={{ fontWeight: 600, flex: 1 }}>Agreement</Text>
                    <Text size="xs" style={{ fontWeight: 600, width: 120 }}>Clause</Text>
                    <Text size="xs" style={{ fontWeight: 600, width: 80 }}>Risk</Text>
                  </div>
                  {[
                    { name: 'MSA - Acme Corp.pdf', clause: '3% annual cap (§8.2)', risk: 'Medium', riskColor: '#D97706' },
                    { name: 'SOW - Acme Implementation.pdf', clause: 'None — fixed price', risk: 'Low', riskColor: 'var(--ink-text-secondary)' },
                    { name: 'Order Form - Cloud Storage.pdf', clause: 'None — fixed price', risk: 'Low', riskColor: 'var(--ink-text-secondary)' },
                  ].map((row, i) => (
                    <div key={row.name} style={{ display: 'flex', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', gap: 16, alignItems: 'center' }}>
                      <Text size="xs" style={{ flex: 1, fontWeight: 500 }}>{row.name}</Text>
                      <Text size="xs" style={{ width: 120 }} color="secondary">{row.clause}</Text>
                      <span style={{ fontSize: 11, fontWeight: 600, color: row.riskColor, width: 80 }}>{row.risk}</span>
                    </div>
                  ))}
                </div>
                {convStep === 2 && (
                  <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                    The MSA's §8.2 escalation kicks in at Year 2. Want me to build a tracker that flags this alongside your renewal dates so you can prepare before negotiation?
                  </Text>
                )}
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}
            {convStep >= 2 && !isPricingTermsPath && !isFlagEscalationPath && !isPricingTablePath && (
              /* Default path: pricing model breakdown table */
              <Stack gap="small">
                <Inline gap="xs" align="center">
                  <Text size="xs" color="secondary">Extracting pricing terms from 10 agreements</Text>
                  <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                </Inline>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Here's how pricing breaks down across all Acme agreements:
                </Text>
                <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 68px minmax(0, 1.8fr)', padding: '7px 14px', background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderBottom: '1px solid var(--ink-border-color-subtle)', gap: 16 }}>
                    <Text size="xs" style={{ fontWeight: 600 }}>Pricing model</Text>
                    <Text size="xs" style={{ fontWeight: 600 }}>Agreements</Text>
                    <Text size="xs" style={{ fontWeight: 600 }}>Example</Text>
                  </div>
                  {[
                    { model: 'Flat fee', count: 8, example: 'MSA — $180K/yr fixed annual license' },
                    { model: 'Volume-tiered', count: 10, example: 'Cloud storage — price drops at 10TB, 50TB thresholds' },
                    { model: 'Time & materials', count: 5, example: 'Professional services — $195/hr blended rate' },
                  ].map((row, i) => (
                    <div key={row.model} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 68px minmax(0, 1.8fr)', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', gap: 16, alignItems: 'center' }}>
                      <Text size="xs" style={{ fontWeight: 500 }}>{row.model}</Text>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-text-secondary)' }}>{row.count}</span>
                      <Text size="xs" color="secondary">{row.example}</Text>
                    </div>
                  ))}
                </div>
                <Text size="sm" style={{ lineHeight: 1.65, color: 'var(--ink-text-secondary)' }}>
                  Want to see exact prices and terms side by side? I can set up a comparison view.
                </Text>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}

            {/* Step 3: user message (only shown on default path and escalation path) */}
            {!isPricingTermsPath && !isPricingTablePath && userMessages.length >= 3 && <IrisUserBubble text={userMessages[2]} />}
            {!isPricingTermsPath && !isPricingTablePath && isThinking && convStep === 2 && <IrisThinkingBubble />}

            {/* Step 3 response: escalation path → worksheet proposal */}
            {convStep >= 3 && isFlagEscalationPath && !worksheetMode && !worksheetRequested && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  I'll create a worksheet titled <strong>Acme Price Escalation Tracker</strong> that flags the MSA's §8.2 clause alongside your renewal dates — so you can review it before negotiation begins. Here's what I'll include:
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                  <Text size="xs" style={{ fontWeight: 600, color: 'var(--ink-text-secondary)', display: 'block', marginBottom: 8 }}>What I'll extract</Text>
                  {[
                    { label: 'Agreement name', ai: false },
                    { label: 'Renewal / expiration date', ai: false },
                    { label: 'Escalation clause (y/n)', ai: true },
                    { label: 'Escalation cap %', ai: true },
                    { label: 'Clause location (section)', ai: true },
                    { label: 'Notes', ai: true },
                  ].map((col, i) => (
                    <div key={col.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                      <Icon name="check" size={12} color={col.ai ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-text-secondary)'} />
                      <Text size="xs" style={{ flex: 1 }}>{col.label}</Text>
                      {col.ai && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)', background: 'var(--ink-purple-05, #f5f3ff)', border: '1px solid var(--ink-purple-20, #d9d3ff)', borderRadius: 100, padding: '1px 7px' }}>AI</span>}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setWorksheetRequested(true); onBuildWorksheet && onBuildWorksheet('deep-analysis'); }}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3d39b0'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'; }}
                >
                  <Icon name="table" size={14} color="#fff" />
                  Build my worksheet
                </button>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}

            {/* Step 3 response: default path → worksheet creation */}
            {convStep >= 3 && !isFlagEscalationPath && !isPricingTermsPath && !isPricingTablePath && !worksheetMode && !worksheetRequested && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  I'm going to create a worksheet titled <strong>Acme Products & Pricing Breakdown</strong>, focused on mapping every product and service Acme provides across your 10 agreements — including what you're paying, how it's priced, and any special terms. Here's what I'll extract:
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                  <Text size="xs" style={{ fontWeight: 600, color: 'var(--ink-text-secondary)', display: 'block', marginBottom: 8 }}>What I'll extract</Text>
                  {[
                    { label: 'Agreement name', ai: false },
                    { label: 'Effective date', ai: false },
                    { label: 'End date', ai: false },
                    { label: 'Total contract value', ai: false },
                    { label: 'Service / Offering', ai: true },
                    { label: 'Pricing basis', ai: true },
                    { label: 'Unit price', ai: true },
                    { label: 'Discounts & special terms', ai: true },
                  ].map((col, i) => (
                    <div key={col.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                      <Icon name="check" size={12} color={col.ai ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-text-secondary)'} />
                      <Text size="xs" style={{ flex: 1 }}>{col.label}</Text>
                      {col.ai && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)', background: 'var(--ink-purple-05, #f5f3ff)', border: '1px solid var(--ink-purple-20, #d9d3ff)', borderRadius: 100, padding: '1px 7px' }}>AI</span>}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setWorksheetRequested(true); onBuildWorksheet && onBuildWorksheet('deep-analysis'); }}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3d39b0'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'; }}
                >
                  <Icon name="table" size={14} color="#fff" />
                  Build my worksheet
                </button>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}
            {convStep >= 2 && worksheetMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 8 }}>
                  <Icon name="status-check" size={14} color="var(--ink-green-80, #2f9e44)" />
                  <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Worksheet created — Acme Products & Pricing Breakdown</Text>
                </div>
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>Your analysis is ready. You can view and edit it in the worksheet view.</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      'Which agreement has the highest unit cost?',
                      'Flag agreements missing pricing details',
                      'Show me agreements expiring in the next 90 days',
                      'Add a column for auto-renewal notice deadlines',
                    ].map(chip => (
                      <button key={chip} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'background 0.12s, border-color 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-05, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
                      >
                        <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
                        {chip}
                      </button>
                    ))}
                  </div>
                </Stack>
              </div>
            )}
          </div>
          {irisInputArea}
        </>
      ) : isUpdatesFlow ? (
        /* ── Simple Input / Updates flow — chip or Start Chat entry ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">Read 4 Acme Corp agreements</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>

            {/* Start Chat path — prompt shown in scroll area, chips shown near input */}
            {userMessages.length === 0 && (
              <Text size="sm" style={{ color: 'var(--ink-text-secondary)', lineHeight: 1.6 }}>What would you like to know about Acme Corp?</Text>
            )}

            {userMessages.length >= 1 && <IrisUserBubble text={userMessages[0]} />}
            {userMessages.length >= 1 && convStep === 0 && ((_isUpdatesInit && !followUpReady) || (!_isUpdatesInit && isThinking)) && <IrisThinkingBubble />}

            {userMessages.length >= 1 && convStep >= 1 && !isThinking && (() => {
              const aq = userMessages[0].toLowerCase();
              return (
                <Stack gap="small">
                  {(aq.includes('summar') || aq.includes('relationship')) ? (
                    <>
                      <Inline gap="xs" align="center">
                        <Text size="xs" color="secondary">Summarizing relationship across 4 agreements</Text>
                        <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.65 }}>
                        Acme Corp has been an active vendor for <strong>3+ years</strong> with <strong>4 agreements on record</strong>. Total committed spend is <strong>$225K/yr</strong> across an enterprise MSA, implementation SOW, NDA, and DPA. 2 agreements are approaching expiry within 90 days.
                      </Text>
                      <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                        {[
                          { name: 'MSA - Acme Corp.pdf', detail: 'Enterprise license · $180K/yr', status: 'Active', color: 'var(--ink-text-secondary)' },
                          { name: 'SOW - Acme Implementation.pdf', detail: 'Fixed-price · $45K', status: 'Expiring Aug 2026', color: '#D97706' },
                          { name: 'NDA - Acme Corp.pdf', detail: 'No monetary value', status: 'Expiring Aug 2026', color: '#D97706' },
                          { name: 'DPA - Acme Corp.pdf', detail: 'No expiry', status: 'Active', color: 'var(--ink-text-secondary)' },
                        ].map((r, i) => (
                          <div key={r.name} style={{ padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text size="xs" style={{ fontWeight: 500 }}>{r.name}</Text>
                              <Text size="xs" color="secondary" style={{ display: 'block' }}>{r.detail}</Text>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 500, color: r.color }}>{r.status}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : aq.includes('expir') ? (
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
                  ) : aq.includes('pric') ? (
                    <>
                      <Inline gap="xs" align="center">
                        <Text size="xs" color="secondary">Extracting pricing terms from 2 agreements</Text>
                        <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.65 }}>
                        Acme's active agreements carry a combined <strong>$225K/yr</strong> in committed spend. The MSA includes a <strong>3% annual price escalation clause</strong> (§8.2) starting Year 2. The SOW is fixed-price with no escalation.
                      </Text>
                      <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                        {[
                          { agreement: 'MSA - Acme Corp.pdf', structure: 'Annual license', amount: '$180K/yr', escalation: '3% per year (§8.2)' },
                          { agreement: 'SOW - Acme Implementation.pdf', structure: 'Fixed-price', amount: '$45K', escalation: 'None' },
                        ].map((r, i) => (
                          <div key={r.agreement} style={{ padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text size="xs" style={{ fontWeight: 500 }}>{r.agreement}</Text>
                              <Text size="xs" style={{ fontWeight: 600 }}>{r.amount}</Text>
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                              <Text size="xs" color="secondary">Structure: {r.structure}</Text>
                              <Text size="xs" color="secondary">Escalation: <span style={{ color: r.escalation !== 'None' ? '#D97706' : 'inherit' }}>{r.escalation}</span></Text>
                            </div>
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
                    <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                  </Inline>
                </Stack>
              );
            })()}

            {isThinking && convStep >= 1 && <IrisThinkingBubble />}
          </div>
          {irisInputArea}
        </>
      ) : isSpendFlow ? (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Inline gap="xs" align="center">
              <Text size="xs" color="secondary">Read 47 agreements</Text>
              <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
            </Inline>

            {userMessages.length >= 1 && <IrisUserBubble text={userMessages[0]} />}
            {userMessages.length >= 1 && convStep === 0 && ((_isSpendInit && !followUpReady) || (!_isSpendInit && isThinking)) && <IrisThinkingBubble />}

            {/* Report path */}
            {isReportPath && convStep >= 1 && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Let's configure your report. Two quick questions.
                </Text>
                <MultiStepDisambiguationCard
                  steps={[
                    { question: "What do you want to measure?", options: ['Contract value', 'Number of contracts', 'Average deal size'] },
                    { question: "How do you want to group it?", options: ['By vendor category', 'By department', 'By agreement type'] },
                  ]}
                  onComplete={(answers) => {
                    setUserMessages(prev => [...prev, answers[0], answers[1]]);
                    setIsThinking(true);
                    setTimeout(() => { setIsThinking(false); setConvStep(3); }, 1200);
                  }}
                />
              </Stack>
            )}
            {isReportPath && convStep >= 3 && !isThinking && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Got it. Your report is configured — <strong>{userMessages[1]}</strong> grouped <strong>{(userMessages[2] || '').toLowerCase()}</strong>.
                </Text>
                <button
                  onClick={() => onBuildReport && onBuildReport(userMessages[1], userMessages[2])}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Icon name="chart-bar" size={14} />
                  Build my report
                </button>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}

            {/* Q&A path */}
            {!isReportPath && convStep >= 1 && !isThinking && (() => {
              const aq = (userMessages[0] || '').toLowerCase();
              return (
                <Stack gap="small">
                  {aq.includes('top vendor') ? (
                    <>
                      <Inline gap="xs" align="center">
                        <Text size="xs" color="secondary">Ranking vendors by committed spend</Text>
                        <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.65 }}>
                        Your top 5 vendors by annual committed spend:
                      </Text>
                      <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                        {[
                          { vendor: 'Acme Corp', category: 'Software', spend: '$2.1M/yr' },
                          { vendor: 'Globex Systems', category: 'Infrastructure', spend: '$890K/yr' },
                          { vendor: 'BioCore Innovations', category: 'Prof. Services', spend: '$620K/yr' },
                          { vendor: 'Initech Ltd', category: 'Software', spend: '$410K/yr' },
                          { vendor: 'Beacon Law Group', category: 'Legal Services', spend: '$180K/yr' },
                        ].map((r, i) => (
                          <div key={r.vendor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                            <div>
                              <Text size="sm" style={{ fontWeight: 500 }}>{r.vendor}</Text>
                              <Text size="xs" color="secondary">{r.category}</Text>
                            </div>
                            <Text size="sm" style={{ fontWeight: 600 }}>{r.spend}</Text>
                          </div>
                        ))}
                      </div>
                      <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 10, padding: '14px 16px', background: 'var(--ink-bg-color-subtle, #f8f8fb)' }}>
                        <Inline gap="small" align="center" style={{ marginBottom: 8 }}>
                          <Icon name="chart-bar" size={16} color="var(--ink-cobalt-100, #1E4FD8)" />
                          <Text size="sm" style={{ fontWeight: 600 }}>Visualize this data</Text>
                        </Inline>
                        <Text size="xs" color="secondary" style={{ marginBottom: 12, display: 'block' }}>
                          Would you like to build a report or chart from this vendor spend breakdown?
                        </Text>
                        <button onClick={() => onBuildReport && onBuildReport('committed spend', 'vendor category')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3d39b0'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'; }}>
                          <Icon name="chart-bar" size={14} color="#fff" />
                          Build a report
                        </button>
                      </div>
                    </>
                  ) : aq.includes('expir') ? (
                    <>
                      <Inline gap="xs" align="center">
                        <Text size="xs" color="secondary">Scanning 47 agreements for upcoming expirations</Text>
                        <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.65 }}>
                        <strong>4 contracts</strong> expire within 90 days, representing <strong>$3.6M/yr</strong> in committed spend that will need renewal decisions.
                      </Text>
                      <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                        {[
                          { name: 'MSA - Initech Ltd.pdf', value: '$410K/yr', expires: 'Aug 12, 2026' },
                          { name: 'SaaS - CloudOps Platform.pdf', value: '$380K/yr', expires: 'Aug 29, 2026' },
                          { name: 'SOW - Globex Data Center.pdf', value: '$580K', expires: 'Sep 4, 2026' },
                          { name: 'MSA - BioCore Innovations.pdf', value: '$620K/yr', expires: 'Sep 18, 2026' },
                        ].map((r, i) => (
                          <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                            <Text size="xs" style={{ fontWeight: 500, flex: 1 }}>{r.name}</Text>
                            <Text size="xs" style={{ fontWeight: 600, marginLeft: 12 }}>{r.value}</Text>
                            <span style={{ fontSize: 11, marginLeft: 12, color: '#D97706', fontWeight: 500 }}>Exp. {r.expires}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <Inline gap="xs" align="center">
                        <Text size="xs" color="secondary">Analyzing spend across 47 agreements</Text>
                        <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                      </Inline>
                      <Text size="sm" style={{ lineHeight: 1.65 }}>
                        Total committed spend is <strong>$4.2M/yr</strong> across 47 agreements. Software accounts for 50%, professional services 33%, and infrastructure 17%.
                      </Text>
                    </>
                  )}
                  <Inline gap="xs">
                    <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                    <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                    <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                  </Inline>
                </Stack>
              );
            })()}

            {isThinking && convStep >= 1 && <IrisThinkingBubble />}
          </div>
          {irisInputArea}
        </>
      ) : isRenewalContractFlow ? (
        /* ── Contract Renewal 3-step disambiguation flow ── */
        (() => {
          const q2Map: Record<string, { question: string; options: string[] }> = {
            'Negotiate better pricing': {
              question: "What's driving the conversation?",
              options: ['Renewal is approaching and we want leverage', 'We received a price increase notice', 'Our usage has grown significantly', 'We want to benchmark against market rates'],
            },
            'Review SLA performance': {
              question: 'Which area concerns you most?',
              options: ['Missed delivery or uptime commitments', 'Support response times are too slow', 'Service quality has declined', 'Proactive review before renewal'],
            },
            'Check auto-renewal deadlines': {
              question: 'How much runway do we have?',
              options: ['Less than 30 days to deadline', '30–90 days out', 'More than 90 days — planning ahead', 'Not sure — need to check contracts'],
            },
            'Explore alternative suppliers': {
              question: "What's the primary driver?",
              options: ['Pricing is not competitive', 'Performance has been disappointing', 'We need different capabilities', 'Strategic vendor consolidation'],
            },
          };
          const q3Map: Record<string, { question: string; options: string[] }> = {
            'Negotiate better pricing': {
              question: 'What outcome are you optimizing for?',
              options: ['Lock in current pricing for another term', 'Reduce total spend by 15%+', 'Add performance guarantees to the contract', 'Keep options open — no commitment yet'],
            },
            'Review SLA performance': {
              question: 'What action are you considering?',
              options: ['Formal escalation to the vendor', 'Contract amendment with remedies', 'Early termination review', 'Performance improvement plan'],
            },
            'Check auto-renewal deadlines': {
              question: 'What do you want to do before the deadline?',
              options: ['Send a non-renewal notice', 'Start renegotiation before it locks in', 'Get executive sign-off on renewal', 'Just track it — no action yet'],
            },
            'Explore alternative suppliers': {
              question: "What's your timeline?",
              options: ['Actively evaluating now', 'Planning for next renewal cycle', 'Soft exploration — no urgency', 'Need to move fast'],
            },
          };

          const q1Answer = userMessages[0] || '';
          const q2Answer = userMessages[1] || '';
          const q3Answer = userMessages[2] || '';
          const q2 = q2Map[q1Answer] || q2Map['Negotiate better pricing'];
          const q3 = q3Map[q1Answer] || q3Map['Negotiate better pricing'];

          return (
            <>
              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Q1 answer bubble */}
                {userMessages.length >= 1 && <IrisUserBubble text={userMessages[0]} />}
                {/* Thinking before Q2 */}
                {userMessages.length >= 1 && convStep === 0 && ((_isRenewalContractInit && !followUpReady) || (!_isRenewalContractInit && isThinking)) && <IrisThinkingBubble />}

                {/* Q2+Q3 multi-step disambiguation card */}
                {convStep >= 1 && userMessages.length < 3 && (
                  <Stack gap="small">
                    <Inline gap="xs" align="center">
                      <Text size="xs" color="secondary">Narrowing focus</Text>
                      <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                    </Inline>
                    <MultiStepDisambiguationCard
                      steps={[q2, q3]}
                      onComplete={(answers) => {
                        setUserMessages(prev => [...prev, answers[0], answers[1]]);
                        setIsThinking(true);
                        setTimeout(() => { setIsThinking(false); setConvStep(3); }, 1000);
                      }}
                    />
                  </Stack>
                )}

                {/* Thinking before final analysis */}
                {userMessages.length >= 3 && isThinking && <IrisThinkingBubble />}

                {/* Final analysis */}
                {convStep >= 3 && (
                  <Stack gap="small">
                    <Inline gap="xs" align="center">
                      <Text size="xs" color="secondary">Scanning 10 Acme agreements</Text>
                      <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                    </Inline>
                    {q1Answer === 'Negotiate better pricing' ? (
                      <>
                        <Text size="sm" style={{ lineHeight: 1.65 }}>
                          Based on your goal to <strong>{q3Answer.toLowerCase()}</strong>, here are the 4 strongest leverage points before the Acme MSA renewal in April 2027:
                        </Text>
                        <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                          {[
                            { point: '3% annual escalation clause active (§8.2)', detail: 'Year 2 escalation kicks in at renewal — worth challenging given flat usage growth', tag: 'High leverage' },
                            { point: 'No volume discount threshold met', detail: 'Usage at 8.2TB — well below the 10TB tier discount. Commit to 10TB to trigger lower rate', tag: 'Pricing gap' },
                            { point: 'SOW expiring Aug 2026 — 8 months early', detail: 'Early SOW exit creates natural renegotiation window before MSA renewal', tag: 'Timing' },
                            { point: 'Competing quotes available from 2 alternatives', detail: 'Market rates for comparable services run 12–18% below current MSA terms', tag: 'Benchmark' },
                          ].map((row, i) => (
                            <div key={i} style={{ padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                                <Text size="xs" style={{ fontWeight: 500, flex: 1, paddingRight: 8 }}>{row.point}</Text>
                                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)', background: 'var(--ink-purple-05, #f5f3ff)', border: '1px solid var(--ink-purple-20, #d9d3ff)', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{row.tag}</span>
                              </div>
                              <Text size="xs" color="secondary" style={{ lineHeight: 1.5 }}>{row.detail}</Text>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : q1Answer === 'Check auto-renewal deadlines' ? (
                      <>
                        <Text size="sm" style={{ lineHeight: 1.65 }}>
                          Here are the active auto-renewal deadlines across your 10 Acme agreements. Based on your goal to <strong>{q3Answer.toLowerCase()}</strong>:
                        </Text>
                        <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                          {[
                            { name: 'MSA - Acme Corp.pdf', deadline: 'Feb 25, 2027', window: '60-day notice', status: 'On track' },
                            { name: 'SOW - Acme Implementation.pdf', deadline: 'Jun 18, 2026', window: '30-day notice', status: 'Urgent' },
                            { name: 'NDA - Acme Corp.pdf', deadline: 'Jul 22, 2026', window: 'Auto-expires', status: 'Monitor' },
                          ].map((row, i) => (
                            <div key={i} style={{ padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <Text size="xs" style={{ fontWeight: 500 }}>{row.name}</Text>
                                <Text size="xs" color="secondary" style={{ display: 'block' }}>{row.deadline} · {row.window}</Text>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: row.status === 'Urgent' ? '#D97706' : row.status === 'Monitor' ? 'var(--ink-text-secondary)' : 'var(--ink-green-80, #2f9e44)' }}>{row.status}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Text size="sm" style={{ lineHeight: 1.65 }}>
                        Based on your focus on <strong>{q1Answer.toLowerCase()}</strong> and goal to <strong>{q3Answer.toLowerCase()}</strong>, I've identified the key areas across your 10 Acme agreements. I can pull together a detailed breakdown — want me to build a summary table?
                      </Text>
                    )}
                    <Inline gap="xs">
                      <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                      <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                      <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                    </Inline>
                  </Stack>
                )}
              </div>
              {irisInputArea}
            </>
          );
        })()
      ) : isRenewalScanFlow ? (
        /* ── Renewal scan: multi-step planning flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IrisUserBubble text={question} />

            {/* Thinking before step 0 loads (direct open only) */}
            {!cameFromAnswerBlock && !initialReady && <IrisThinkingBubble />}

            {/* Step 0 AI response — shown immediately for cameFromAnswerBlock, after load for direct */}
            {(cameFromAnswerBlock || initialReady) && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  I've found <strong>9 agreements</strong> hitting their expiration dates soon. What else would you like to understand about these agreements?
                </Text>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}

            {/* User's step-0 reply */}
            {userMessages.length > 0 && (cameFromAnswerBlock || initialReady) && <IrisUserBubble text={userMessages[0]} />}

            {/* Thinking while step 1 loads */}
            {cameFromAnswerBlock && !initialReady && <IrisThinkingBubble />}
            {!cameFromAnswerBlock && initialReady && isThinking && convStep === 0 && <IrisThinkingBubble />}

            {initialReady && convStep >= 1 && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  To help with this, I can extract key details from the agreements—specifically <strong>renewal deadlines</strong> and <strong>price protection</strong>—and map them out in a side-by-side <strong>comparison table</strong>.
                </Text>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Does that sound like the right approach for you?
                </Text>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}
            {initialReady && userMessages.length > 1 && <IrisUserBubble text={userMessages[1]} />}
            {initialReady && isThinking && convStep === 1 && <IrisThinkingBubble />}
            {initialReady && convStep >= 2 && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Great! Since we are aligned on the goal, let's define the <strong>structure</strong>. To give you the best view, I suggest we include:
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Vendor Name', desc: 'The contracting party' },
                    { label: 'Expiration Date', desc: 'When the agreement term ends' },
                    { label: 'Notice Period', desc: 'Deadline to cancel or renegotiate' },
                    { label: 'Price Cap', desc: 'Maximum allowable rate increase' },
                  ].map((col, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-text-secondary)', marginTop: 6, flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-text-primary)', lineHeight: 1.4 }}>{col.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)', lineHeight: 1.4 }}>{col.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Anything else or should we continue to build the table for analysis?
                </Text>
                <Inline gap="xs">
                  <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
                  <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
                  <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
                </Inline>
              </Stack>
            )}
            {initialReady && userMessages.length > 2 && <IrisUserBubble text={userMessages[2]} />}
            {initialReady && isThinking && convStep === 2 && <IrisThinkingBubble />}
            {initialReady && convStep >= 3 && !worksheetMode && !worksheetRequested && (
              <Stack gap="small">
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Good call. I've added <strong>Primary Owner</strong> to the plan. I'm ready to generate this <strong>comparison table</strong>.
                </Text>
                <Text size="sm" style={{ lineHeight: 1.65 }}>
                  Shall I pull the data now?
                </Text>
                <div style={{ background: 'var(--ink-neutral-fade-05, #f7f7f9)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Vendor Name', 'Expiration Date', 'Notice Period', 'Price Cap', 'Primary Owner'].map((col, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: i > 0 ? '4px 0 0' : '0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                      <Icon name="status-check" size={12} color="var(--ink-green-80, #2f9e44)" />
                      <Text size="sm">{col}</Text>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setWorksheetRequested(true); if (onBuildWorksheet) onBuildWorksheet('renewal-scan'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: 'fit-content' }}>
                  <Icon name="table" size={14} color="#fff" />
                  Start analysis
                </button>
              </Stack>
            )}
            {initialReady && convStep >= 3 && (worksheetMode || worksheetRequested) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 8 }}>
                  <Icon name="status-check" size={14} color="var(--ink-green-80, #2f9e44)" />
                  <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Comparison table built — 9 agreements</Text>
                </div>
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>Your table is ready. Here are some things you might want to explore next:</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      'Which vendor has the earliest notice deadline?',
                      'Show me contracts with auto-renewal clauses',
                      'Flag agreements expiring before notice period runs out',
                      'Which vendor has the lowest price cap?',
                    ].map(chip => (
                      <button key={chip} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'background 0.12s, border-color 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-05, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
                      >
                        <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
                        {chip}
                      </button>
                    ))}
                  </div>
                </Stack>
              </div>
            )}
          </div>
          {irisInputArea}
        </>
      ) : isWsCompleteFlow ? (
        /* ── Worksheet-from-modal complete flow ── */
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IrisUserBubble text={followUp || question} />
            {!wsCompleteReady && <IrisThinkingBubble />}
            {wsCompleteReady && (
              <>
                <Inline gap="xs" align="center">
                  <Text size="xs" color="secondary">Read 10 Acme agreements</Text>
                  <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                </Inline>
                <Stack gap="small">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>
                    I found <strong>8 products and services</strong> across your Acme agreements — a mix of SaaS subscriptions, professional services, and support contracts. Pricing models vary: 4 are per-seat, 2 are fixed fee, and 2 are usage-based.
                  </Text>
                </Stack>

                {/* Success card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 8 }}>
                  <Icon name="status-check" size={14} color="var(--ink-green-80, #2f9e44)" />
                  <Text size="sm" style={{ color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Worksheet created — Acme Products & Pricing</Text>
                </div>

                {/* Follow-up chips */}
                <Stack gap="xs">
                  <Text size="sm" style={{ lineHeight: 1.65 }}>Your worksheet is ready. Here are some things you might want to explore next:</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      'Which agreement has the highest unit cost?',
                      'Flag any agreements missing pricing details',
                      'Show me agreements expiring in the next 90 days',
                      'Add a column for auto-renewal notice deadlines',
                    ].map(chip => (
                      <button key={chip} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'background 0.12s, border-color 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-05, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
                      >
                        <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
                        {chip}
                      </button>
                    ))}
                  </div>
                </Stack>
              </>
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
              <span style={{ fontSize: 'var(--ink-font-size-sm)', lineHeight: 1.65, display: 'block' }}>
                The Acme Corporation MSA expires on April 26, 2027. It includes an auto-renewal clause that triggers 60 days prior, on February 25, 2027, unless either party provides written notice.<CitationBadge number={1} title="MSA - Acme Corp.pdf" excerpt="This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal no less than 60 days prior to the end of the then-current term." /><CitationBadge number={2} title="Order Form - Cloud Storage.pdf" excerpt="Renewal terms are governed by the Master Services Agreement dated January 14, 2023. Pricing subject to change with 60 days notice prior to renewal date." />
              </span>
            </Stack>
            <Inline gap="xs">
              <IconButton icon="thumbs-up" variant="tertiary" size="small" aria-label="Helpful" />
              <IconButton icon="thumbs-down" variant="tertiary" size="small" aria-label="Not helpful" />
              <IconButton icon="copy" variant="tertiary" size="small" aria-label="Copy response" />
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
                  <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
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
  'auto-renew-risk': {
    title: 'Setting up your auto-renewal risk tracker…',
    steps: ['Scanning 8 contracts with active auto-renewal clauses', 'Scoring risk across notice period, price escalation, and owner gaps', 'Building prioritized action view'],
  },
  'vendor-exposure': {
    title: 'Vendor Exposure Worksheet',
    steps: ['Reading Acme Corp agreements', 'Extracting volume metrics and MFN clauses', 'Calculating exposure summary'],
  },
  'deep-analysis': {
    title: 'Building your Acme pricing analysis…',
    steps: ['Scoping to 10 Acme agreements', 'Extracting product and pricing data', 'Setting up comparison columns'],
  },
  'termination-audit': {
    title: 'Analyzing Acme termination clauses…',
    steps: ['Reading 5 Acme agreements', 'Extracting Termination for Convenience clauses', 'Building comparison table with source snippets'],
  },
  'report-builder': {
    title: 'Building your spend report…',
    steps: ['Reading 47 agreements', 'Calculating committed spend by category', 'Configuring report layout'],
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

function ReportBuilderView({ onBack, onSave, measure = 'Annual Contract Value', aggregation = 'Sum', groupBy = 'Vendor Category' }: { onBack: () => void; onSave?: () => void; measure?: string; aggregation?: string; groupBy?: string }) {
  const fade = useFadeIn(0, 250);

  const chartData: Record<string, { label: string; value: number; color: string }[]> = {
    'Vendor Category': [
      { label: 'Software', value: 2100, color: '#4B47C8' },
      { label: 'Prof. Services', value: 1400, color: '#6E6BC4' },
      { label: 'Infrastructure', value: 700, color: '#9693D4' },
      { label: 'Hardware', value: 290, color: '#BDB9E5' },
    ],
    'Department': [
      { label: 'Engineering', value: 1800, color: '#4B47C8' },
      { label: 'Sales', value: 1100, color: '#6E6BC4' },
      { label: 'Operations', value: 850, color: '#9693D4' },
      { label: 'Finance', value: 450, color: '#BDB9E5' },
    ],
    'Agreement Type': [
      { label: 'MSA', value: 1900, color: '#4B47C8' },
      { label: 'SOW', value: 1200, color: '#6E6BC4' },
      { label: 'License', value: 780, color: '#9693D4' },
      { label: 'SaaS', value: 320, color: '#BDB9E5' },
    ],
  };

  const bars = chartData[groupBy] || chartData['Vendor Category'];
  const maxVal = Math.max(...bars.map(b => b.value));
  const chartHeight = 320;
  const yTicks = [0, 500, 1000, 1500, 2000, 2500];

  return (
    <div {...fade} style={{ ...fade.style, display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--ink-border-color-subtle)', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Untitled report</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onBack} style={{ padding: '7px 16px', fontSize: 13, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onSave || onBack} style={{ padding: '7px 16px', fontSize: 13, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Save</button>
        </div>
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left config panel */}
        <div style={{ width: 300, borderRight: '1px solid var(--ink-border-color-subtle)', overflowY: 'auto', padding: '20px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Data source */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Data source</div>
            <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginBottom: 8 }}>Choose the data you want to use to build this report</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--ink-border-color-default)', borderRadius: 6, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
              <span>All agreements</span>
              <Icon name="chevron-down" size={13} color="var(--ink-text-secondary)" />
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-text-primary)', fontFamily: 'inherit', padding: 0 }}>
            <Icon name="plus" size={13} />
            Add filter
          </button>
          <div style={{ borderTop: '1px solid var(--ink-border-color-subtle)', paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Build your report</div>
            <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginBottom: 14 }}>Choose your metrics and how you want the data grouped</div>
            <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Metric</div>
              <div style={{ borderTop: '1px solid var(--ink-border-color-subtle)' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Measure</div>
                <div style={{ fontSize: 11, color: 'var(--ink-text-secondary)', marginBottom: 6 }}>Choose an attribute to start building a report</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--ink-purple-100, #4B47C8)', borderRadius: 6, padding: '8px 12px', fontSize: 13, cursor: 'pointer', background: 'var(--ink-purple-5, #f5f4fd)' }}>
                  <span>{measure}</span>
                  <Icon name="chevron-down" size={13} color="var(--ink-text-secondary)" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Aggregation</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--ink-border-color-default)', borderRadius: 6, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
                  <span>{aggregation}</span>
                  <Icon name="chevron-down" size={13} color="var(--ink-text-secondary)" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Currency</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--ink-border-color-default)', borderRadius: 6, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
                  <span>USD</span>
                  <Icon name="chevron-down" size={13} color="var(--ink-text-secondary)" />
                </div>
              </div>
            </div>
          </div>
          <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Group by</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Icon name="close" size={13} color="var(--ink-text-secondary)" /></button>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Group by field</div>
              <div style={{ fontSize: 11, color: 'var(--ink-text-secondary)', marginBottom: 6 }}>Select a field to group or break down your metric by</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--ink-purple-100, #4B47C8)', borderRadius: 6, padding: '8px 12px', fontSize: 13, cursor: 'pointer', background: 'var(--ink-purple-5, #f5f4fd)' }}>
                <span>{groupBy}</span>
                <Icon name="chevron-down" size={13} color="var(--ink-text-secondary)" />
              </div>
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-text-primary)', fontFamily: 'inherit', padding: 0 }}>
            <Icon name="plus" size={13} />
            Segment by
          </button>
        </div>
        {/* Right chart panel */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
          <div style={{ width: '100%', maxWidth: 700 }}>
            <svg width="100%" viewBox={`0 0 600 ${chartHeight + 60}`} style={{ overflow: 'visible' }}>
              {/* Y-axis grid lines and labels */}
              {yTicks.map(tick => {
                const y = chartHeight - (tick / (maxVal * 1.15)) * chartHeight;
                return (
                  <g key={tick}>
                    <line x1={50} y1={y} x2={580} y2={y} stroke="#e5e5e5" strokeWidth={1} strokeDasharray={tick === 0 ? '0' : '4,3'} />
                    <text x={44} y={y + 4} textAnchor="end" fontSize={11} fill="#888">${tick >= 1000 ? (tick/1000) + 'K' : tick}</text>
                  </g>
                );
              })}
              {/* Bars */}
              {bars.map((bar, i) => {
                const barWidth = Math.min(80, (530 / bars.length) * 0.6);
                const spacing = 530 / bars.length;
                const x = 50 + i * spacing + spacing / 2 - barWidth / 2;
                const barH = (bar.value / (maxVal * 1.15)) * chartHeight;
                const y = chartHeight - barH;
                return (
                  <g key={bar.label}>
                    <rect x={x} y={y} width={barWidth} height={barH} fill={bar.color} rx={3} />
                    <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={bar.color}>${(bar.value/1000).toFixed(1)}M</text>
                    <text x={x + barWidth / 2} y={chartHeight + 18} textAnchor="middle" fontSize={12} fill="#555">{bar.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorksheetView({ onBack, worksheetType = 'vendor-exposure-acme' }: { onBack: () => void; worksheetType?: string }) {
  const [dataReady, setDataReady] = useState(false);
  const fade = useFadeIn(0, 250);
  const isRenewalView = worksheetType === 'renewal-scan';
  const isAutoRenewView = worksheetType === 'auto-renew-risk';
  const isDeepAnalysisView = worksheetType === 'deep-analysis';
  const isTerminationView = worksheetType === 'termination-audit';

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
        return <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-text-primary)' }}>{row.renewalDate}</span>;
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
      cell: (row: typeof renewalRows[0]) => aiCell(row.cap, '55%'),
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

  /* ── Auto-renew risk data ── */
  const autoRenewRows = [
    { id: 'ar1', fileName: 'MSA - Salesforce Inc.pdf', vendor: 'Salesforce', daysUntil: 12, risk: 'High', action: 'Negotiate now', value: '$180k/yr', owner: 'Mark Chen' },
    { id: 'ar2', fileName: 'Enterprise Agreement - Workday.pdf', vendor: 'Workday', daysUntil: 18, risk: 'High', action: 'Negotiate now', value: '$140k/yr', owner: 'Sarah Kim' },
    { id: 'ar3', fileName: 'Subscription - Slack Technologies.pdf', vendor: 'Slack', daysUntil: 22, risk: 'High', action: 'Review terms', value: '$95k/yr', owner: 'Mark Chen' },
    { id: 'ar4', fileName: 'SaaS Agreement - Zendesk.pdf', vendor: 'Zendesk', daysUntil: 28, risk: 'Medium', action: 'Review terms', value: '$62k/yr', owner: 'Lisa Torres' },
    { id: 'ar5', fileName: 'Creative Cloud - Adobe Inc.pdf', vendor: 'Adobe', daysUntil: 31, risk: 'Medium', action: 'Monitor', value: '$48k/yr', owner: 'Dev Patel' },
    { id: 'ar6', fileName: 'Enterprise License - Box Inc.pdf', vendor: 'Box', daysUntil: 38, risk: 'Medium', action: 'Monitor', value: '$78k/yr', owner: 'Sarah Kim' },
    { id: 'ar7', fileName: 'NDA - Horizon Partners.pdf', vendor: 'Horizon Partners', daysUntil: 41, risk: 'Low', action: 'Monitor', value: '—', owner: '—' },
    { id: 'ar8', fileName: 'Service Agreement - Pinnacle.pdf', vendor: 'Pinnacle', daysUntil: 44, risk: 'Low', action: 'Monitor', value: '$62k/yr', owner: '—' },
  ];

  const autoRenewColumns = [
    {
      key: 'fileName',
      header: 'File name',
      cell: (row: typeof autoRenewRows[0]) => (
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
      cell: (row: typeof autoRenewRows[0]) => <span style={{ fontSize: 13, fontWeight: 500 }}>{row.vendor}</span>,
      width: '130px',
    },
    {
      key: 'daysUntil',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Days Until Auto-Renewal</span>
        </span>
      ),
      cell: (row: typeof autoRenewRows[0]) => {
        if (!dataReady) return <ShimmerCell width="50%" />;
        const color = row.daysUntil <= 14 ? '#DC2626' : row.daysUntil <= 30 ? '#D97706' : '#16A34A';
        const weight = row.daysUntil <= 14 ? 700 : row.daysUntil <= 30 ? 600 : 400;
        return <span style={{ fontSize: 13, color, fontWeight: weight }}>{row.daysUntil} days</span>;
      },
      width: '190px',
    },
    {
      key: 'risk',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Risk Score</span>
        </span>
      ),
      cell: (row: typeof autoRenewRows[0]) => {
        if (!dataReady) return <ShimmerCell width="60%" />;
        const dotColor = row.risk === 'High' ? '#DC2626' : row.risk === 'Medium' ? '#D97706' : '#16A34A';
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
            {row.risk}
          </span>
        );
      },
      width: '120px',
    },
    {
      key: 'action',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Recommended Action</span>
        </span>
      ),
      cell: (row: typeof autoRenewRows[0]) => aiCell(row.action, '80%'),
      width: '170px',
    },
    {
      key: 'value',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Contract Value</span>
        </span>
      ),
      cell: (row: typeof autoRenewRows[0]) => aiCell(row.value, '60%'),
      width: '130px',
    },
    {
      key: 'owner',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Assigned Owner</span>
        </span>
      ),
      cell: (row: typeof autoRenewRows[0]) => aiCell(row.owner, '65%'),
      width: '140px',
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

  /* ── Deep Analysis data ── */
  const deepRows = [
    { id: 'da1', fileName: 'MSA - Acme Cloud Platform.pdf', effectiveDate: 'Mar 1, 2022', endDate: 'Apr 26, 2027', contractValue: '$180,000/yr', serviceOffering: 'Cloud storage & hosting', pricingBasis: 'Annual flat fee', unitPrice: '$180K/yr', discounts: '3% annual escalation (§8.2)' },
    { id: 'da2', fileName: 'SOW - Acme Managed IT Q1-2024.pdf', effectiveDate: 'Jan 1, 2024', endDate: 'Jun 30, 2024', contractValue: '$48,000', serviceOffering: 'Managed IT support', pricingBasis: 'Flat fee per quarter', unitPrice: '$48K/qtr', discounts: 'None' },
    { id: 'da3', fileName: 'SOW - Acme Analytics Setup.pdf', effectiveDate: 'Feb 15, 2024', endDate: 'May 31, 2024', contractValue: '$62,400', serviceOffering: 'Professional services', pricingBasis: 'Time & materials', unitPrice: '$195/hr (blended)', discounts: 'Volume credit after 200 hrs' },
    { id: 'da4', fileName: 'Enterprise - Acme DataStore.pdf', effectiveDate: 'Jun 1, 2023', endDate: 'May 31, 2026', contractValue: '$96,000/yr', serviceOffering: 'Cloud storage & hosting', pricingBasis: 'Volume-tiered', unitPrice: '$0.023/GB (10TB tier)', discounts: '5% multi-year discount' },
    { id: 'da5', fileName: 'SOW - Acme Managed IT Q2-2024.pdf', effectiveDate: 'Jul 1, 2024', endDate: 'Dec 31, 2024', contractValue: '$52,000', serviceOffering: 'Managed IT support', pricingBasis: 'Flat fee per quarter', unitPrice: '$52K/qtr', discounts: 'None' },
    { id: 'da6', fileName: 'SOW - Acme Data Migration.pdf', effectiveDate: 'Sep 5, 2024', endDate: 'Feb 28, 2025', contractValue: '$38,000', serviceOffering: 'Professional services', pricingBasis: 'Time & materials', unitPrice: '$195/hr (blended)', discounts: 'None' },
    { id: 'da7', fileName: 'Cloud Backup SLA - Acme.pdf', effectiveDate: 'Apr 1, 2023', endDate: 'Mar 31, 2026', contractValue: '$28,800/yr', serviceOffering: 'Cloud storage & hosting', pricingBasis: 'Volume-tiered', unitPrice: '$0.019/GB (50TB tier)', discounts: '10% prepay discount' },
    { id: 'da8', fileName: 'SOW - Acme IT Help Desk.pdf', effectiveDate: 'Jan 1, 2025', endDate: 'Dec 31, 2025', contractValue: '$72,000', serviceOffering: 'Managed IT support', pricingBasis: 'Flat fee per month', unitPrice: '$6K/mo', discounts: 'None' },
    { id: 'da9', fileName: 'Professional Services - Acme AI.pdf', effectiveDate: 'Mar 1, 2025', endDate: 'Aug 31, 2025', contractValue: '$41,600', serviceOffering: 'Professional services', pricingBasis: 'Time & materials', unitPrice: '$200/hr (senior rate)', discounts: 'Fixed cap $41,600' },
    { id: 'da10', fileName: 'SOW - Acme Cloud Ops 2025.pdf', effectiveDate: 'Jun 1, 2025', endDate: 'May 31, 2026', contractValue: '$55,200/yr', serviceOffering: 'Managed IT support', pricingBasis: 'Flat fee', unitPrice: '$55.2K/yr', discounts: 'None' },
  ];

  const deepColumns = [
    {
      key: 'fileName',
      header: 'Agreement',
      cell: (row: typeof deepRows[0]) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--ink-neutral-fade-05, #f5f5f8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="document" size={14} color="var(--ink-text-secondary)" />
          </div>
          <span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)', display: 'block', lineHeight: 1.3 }}>{row.fileName}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-text-secondary)', display: 'block', marginTop: 1 }}>Acme Corp · Completed</span>
          </span>
        </span>
      ),
      width: '270px',
    },
    {
      key: 'effectiveDate',
      header: 'Effective',
      cell: (row: typeof deepRows[0]) => <span style={{ fontSize: 13 }}>{row.effectiveDate}</span>,
      width: '120px',
    },
    {
      key: 'endDate',
      header: 'End date',
      cell: (row: typeof deepRows[0]) => <span style={{ fontSize: 13 }}>{row.endDate}</span>,
      width: '120px',
    },
    {
      key: 'contractValue',
      header: 'Contract value',
      cell: (row: typeof deepRows[0]) => <span style={{ fontSize: 13 }}>{row.contractValue}</span>,
      width: '130px',
    },
    {
      key: 'serviceOffering',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Service / Offering</span>
        </span>
      ),
      cell: (row: typeof deepRows[0]) => aiCell(row.serviceOffering, '85%'),
      width: '200px',
    },
    {
      key: 'pricingBasis',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Pricing basis</span>
        </span>
      ),
      cell: (row: typeof deepRows[0]) => aiCell(row.pricingBasis, '80%'),
      width: '170px',
    },
    {
      key: 'unitPrice',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Unit price</span>
        </span>
      ),
      cell: (row: typeof deepRows[0]) => aiCell(row.unitPrice, '70%'),
      width: '170px',
    },
    {
      key: 'discounts',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Discounts & special terms</span>
        </span>
      ),
      cell: (row: typeof deepRows[0]) => aiCell(row.discounts, '75%'),
      width: '220px',
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

  /* ── Acme termination audit data ── */
  const terminationRows = [
    { id: 'ta1', fileName: 'MSA - Acme Corp.pdf', clauseFound: 'FOUND', noticePeriod: '90 Days', sourceSnippet: '"Either party may terminate this Agreement without cause upon ninety (90) days prior written notice to the other party…"', status: 'Success' },
    { id: 'ta2', fileName: 'SOW - Acme Implementation 2023.pdf', clauseFound: 'NOT FOUND', noticePeriod: 'N/A — Follows MSA', sourceSnippet: 'No convenience termination clause located in this SOW. Termination governed by the MSA.', status: 'Success' },
    { id: 'ta3', fileName: 'Exhibit B - SLA Acme Corp.pdf', clauseFound: 'UNCERTAIN', noticePeriod: 'Unknown', sourceSnippet: 'N/A — Document scan quality insufficient for reliable clause extraction.', status: 'Low Confidence' },
    { id: 'ta4', fileName: 'DPA - Acme Corp.pdf', clauseFound: 'FOUND', noticePeriod: '60 Days', sourceSnippet: '"Either party may terminate this Data Processing Agreement for convenience upon sixty (60) days written notice…"', status: 'Success' },
    { id: 'ta5', fileName: 'Amendment 1 - Acme Corp MSA.pdf', clauseFound: 'NOT FOUND', noticePeriod: 'N/A', sourceSnippet: 'Amendment does not modify termination provisions. Original MSA §14.2 controls.', status: 'Success' },
  ];

  const terminationColumns = [
    {
      key: 'fileName',
      header: 'Document Name',
      cell: (row: typeof terminationRows[0]) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--ink-neutral-fade-05, #f5f5f8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="document" size={14} color="var(--ink-text-secondary)" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)' }}>{row.fileName}</span>
        </span>
      ),
      width: '240px',
    },
    {
      key: 'clauseFound',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Termination for Convenience?</span>
        </span>
      ),
      cell: (row: typeof terminationRows[0]) => {
        if (!dataReady) return <ShimmerCell width="60%" />;
        const color = row.clauseFound === 'FOUND' ? 'var(--ink-green-80, #2f9e44)' : row.clauseFound === 'NOT FOUND' ? 'var(--ink-text-secondary)' : 'var(--ink-orange-80, #d9480f)';
        const bg = row.clauseFound === 'FOUND' ? 'var(--ink-green-10, #f3faf4)' : row.clauseFound === 'NOT FOUND' ? 'var(--ink-neutral-fade-05, #f5f5f8)' : 'var(--ink-orange-10, #fff4e6)';
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color, background: bg, borderRadius: 4, padding: '2px 8px' }}>
            {row.clauseFound}
          </span>
        );
      },
      width: '220px',
    },
    {
      key: 'noticePeriod',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Notice Period Required</span>
        </span>
      ),
      cell: (row: typeof terminationRows[0]) => aiCell(row.noticePeriod, '70%'),
      width: '180px',
    },
    {
      key: 'sourceSnippet',
      header: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AIIcon name="ai-spark" size={13} />
          <span>Verified Source Snippet</span>
        </span>
      ),
      cell: (row: typeof terminationRows[0]) => {
        if (!dataReady) return <ShimmerCell width="90%" />;
        return <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)', fontStyle: row.clauseFound === 'FOUND' ? 'italic' : 'normal', lineHeight: 1.5 }}>{row.sourceSnippet}</span>;
      },
      width: '340px',
    },
    {
      key: 'status',
      header: 'System Status',
      cell: (row: typeof terminationRows[0]) => {
        if (!dataReady) return <ShimmerCell width="55%" />;
        const isLow = row.status === 'Low Confidence';
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: isLow ? 'var(--ink-orange-80, #d9480f)' : 'var(--ink-green-80, #2f9e44)' }}>
            <Icon name={isLow ? 'status-warning' : 'status-check'} size={13} color={isLow ? 'var(--ink-orange-80, #d9480f)' : 'var(--ink-green-80, #2f9e44)'} />
            {row.status}
          </span>
        );
      },
      width: '150px',
    },
  ];

  const viewTitle = isTerminationView ? 'Acme Corp — Termination for Convenience Audit' : isDeepAnalysisView ? 'Acme Corp — Products & Pricing Analysis' : isAutoRenewView ? 'Auto-Renewal Risk Tracker' : isRenewalView ? 'Vendor Renewals — Next 6 Months' : 'Acme Corp — Committed Spend & Usage';
  const viewCrumb = isTerminationView ? 'Termination Analysis' : isDeepAnalysisView ? 'Acme Pricing Analysis' : isAutoRenewView ? 'Auto-Renewal Risk' : isRenewalView ? 'Renewal Analysis' : 'Vendor Exposure Analysis — Acme Corp';
  const viewMeta = isTerminationView ? '5 agreements · Acme Corp · Termination for Convenience · Created just now' : isDeepAnalysisView ? '10 agreements · Acme Corp · Created just now' : isAutoRenewView ? '8 agreements · Risk-prioritized · Created just now' : isRenewalView ? '9 agreements · Vendor renewals · Created just now' : '3 agreements · Acme Corp · Created just now';

  return (
    <div {...fade} style={{ ...fade.style, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Page header — matches AgreementTableView .pageHeader padding */}
      <div style={{ padding: '32px 80px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: 'var(--ink-text-secondary)', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            Completed Documents
          </button>
          <Icon name="chevron-right" size={12} color="var(--ink-text-secondary)" />
          <span style={{ fontSize: 13, color: 'var(--ink-text-secondary)' }}>Worksheets</span>
          <Icon name="chevron-right" size={12} color="var(--ink-text-secondary)" />
          <span style={{ fontSize: 13, color: 'var(--ink-text-primary)', fontWeight: 500 }}>{viewCrumb}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--ink-purple-10, #f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={isTerminationView ? 'document' : isDeepAnalysisView ? 'chart-bar' : isAutoRenewView ? 'bell' : isRenewalView ? 'calendar' : 'status-check'} size={18} color="var(--ink-purple-100, #4B47C8)" />
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 400, color: 'var(--ink-text-primary)', lineHeight: 1.2 }}>{viewTitle}</h1>
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

      {/* Toolbar — matches AgreementTableView .filterBar padding */}
      <div style={{ padding: '16px 80px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
        <Button kind="secondary" size="small" startElement={<Icon name="plus" size={14} />}>Add agreements</Button>
        <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>Filters</Button>
        <Button kind="secondary" size="small" startElement={<Icon name="download" size={14} />}>Export</Button>
      </div>

      {/* Table — matches AgreementTableView .tableWrapper margin */}
      <div style={{ flex: 1, margin: '0 80px', minHeight: 0 }}>
        {isTerminationView ? (
          <DataTable
            columns={terminationColumns}
            data={terminationRows}
            getRowKey={(row) => row.id}
            stickyHeader
            rowHeight="tall"
            selectable
            showColumnControl
            pagination={{ page: 1, pageSize: 50, totalItems: terminationRows.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }}
          />
        ) : isDeepAnalysisView ? (
          <DataTable
            columns={deepColumns}
            data={deepRows}
            getRowKey={(row) => row.id}
            stickyHeader
            rowHeight="tall"
            selectable
            showColumnControl
            pagination={{ page: 1, pageSize: 50, totalItems: deepRows.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }}
          />
        ) : isAutoRenewView ? (
          <DataTable
            columns={autoRenewColumns}
            data={autoRenewRows}
            getRowKey={(row) => row.id}
            stickyHeader
            rowHeight="tall"
            selectable
            showColumnControl
            pagination={{ page: 1, pageSize: 50, totalItems: autoRenewRows.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }}
          />
        ) : isRenewalView ? (
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

const WORKSHEET_EXPANDED_PROMPT = `Extract all products and services Acme Corp provides across your active agreements. For each item, capture the product or service name, pricing model (per-seat, usage-based, or fixed fee), unit rate or contract value, and any special discounts or volume terms. Include SaaS subscriptions, professional services, and support agreements. Flag any agreements where pricing details are missing or unclear.`;

const WORKSHEET_EXAMPLE_CHIPS = ['Human Resources', 'Legal', 'Procurement', 'Sales', 'Security'];
const WORKSHEET_EXAMPLE_PROMPTS: Record<string, string> = {
  'Human Resources': 'What are the notice periods and termination-for-convenience clauses across all HR vendor agreements?',
  'Legal': 'Which agreements contain indemnification clauses that expose us to uncapped liability?',
  'Procurement': 'What products and services do we purchase from Acme, including pricing models and unit rates?',
  'Sales': 'What are the auto-renewal terms and notice windows across our sales tooling contracts?',
  'Security': 'Which software agreements include data processing agreements and what are their breach notification requirements?',
};

function StartWorksheetModal({ prefillQuery, onClose, onGenerate }: { prefillQuery?: string; onClose: () => void; onGenerate: () => void }) {
  const [phase, setPhase] = useState<'thinking' | 'generating' | 'review'>('thinking');
  const [typedText, setTypedText] = useState('');
  const isThinking = phase === 'thinking';
  const isGenerating = phase === 'generating';
  const isReview = phase === 'review';

  /* On mount: brief thinking pause, then start typewriter */
  useEffect(() => {
    const t = setTimeout(() => setPhase('generating'), 900);
    return () => clearTimeout(t);
  }, []);

  /* Typewriter — runs whenever phase flips to 'generating' */
  useEffect(() => {
    if (phase !== 'generating') return;
    setTypedText('');
    let idx = 0;
    const target = WORKSHEET_EXPANDED_PROMPT;
    const id = setInterval(() => {
      idx += 1;
      setTypedText(target.slice(0, idx));
      if (idx >= target.length) {
        clearInterval(id);
        setTimeout(() => setPhase('review'), 350);
      }
    }, 9);
    return () => clearInterval(id);
  }, [phase]);

  const regenerate = () => setPhase('generating');

  const leftPanel = (
    <div style={{ width: 260, flexShrink: 0, background: 'linear-gradient(160deg, #3b27a8 0%, #2d1f8c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '14px 12px', width: '100%' }}>
        {[{ w: '60%', color: '#a78bfa' }, { w: '40%', color: '#818cf8' }].map((col, ci) => (
          <div key={ci} style={{ display: 'flex', gap: 6, marginBottom: ci === 0 ? 10 : 0, alignItems: 'center' }}>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.2)', flex: 1 }} />
            <div style={{ height: 8, borderRadius: 4, background: col.color, width: col.w }} />
          </div>
        ))}
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
            <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,0.15)', flex: 1 }} />
            <div style={{ height: 7, borderRadius: 3, background: i % 3 === 0 ? '#c4b5fd' : i % 3 === 1 ? '#6366f1' : 'rgba(255,255,255,0.12)', width: ['55%','35%','45%','30%','50%'][i] }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 860, maxHeight: 'calc(100vh - 64px)', borderRadius: 14, overflow: 'hidden', display: 'flex', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
        {leftPanel}

        {/* Right white panel */}
        <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 28px 0' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-purple-05, #f5f3ff)', border: '1px solid var(--ink-purple-20, #d9d3ff)', borderRadius: 100, padding: '3px 10px', marginBottom: 12 }}>
                <IrisSparkleIcon size={12} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>AI-Assisted</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ink-text-primary)', lineHeight: 1.2, marginBottom: 8 }}>
                {isReview ? 'Start a worksheet' : 'Start a worksheet'}
              </h2>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-text-secondary)', lineHeight: 1.6 }}>
                {isReview
                  ? 'Iris drafted a prompt from your question. Edit it or deploy as-is.'
                  : 'Iris is drafting a structured extraction prompt from your question.'}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'var(--ink-text-secondary)', flexShrink: 0, marginLeft: 16, marginTop: -4 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: '24px 28px 0' }}>
            {/* Source pill — always visible */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '7px 12px', background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8 }}>
              <Icon name="search" size={13} color="var(--ink-text-secondary)" />
              <span style={{ fontSize: 12.5, color: 'var(--ink-text-secondary)', fontStyle: 'italic', flex: 1 }}>{prefillQuery}</span>
              {(isThinking || isGenerating) && (
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2].map(i => <span key={i} className="iris-thinking-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              )}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-text-primary)', marginBottom: 4 }}>
              {isReview ? 'Your prompt' : 'Generating prompt…'}
            </label>
            {isReview && (
              <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--ink-text-secondary)' }}>You can edit this before deploying.</p>
            )}

            <div style={{ position: 'relative', border: `1.5px solid ${isReview ? 'var(--ink-purple-30, #ddd9ff)' : 'var(--ink-purple-40, #c4b5fd)'}`, borderRadius: 8, background: isReview ? '#fff' : 'var(--ink-purple-05, #f5f3ff)', overflow: 'hidden', transition: 'border-color 0.3s, background 0.3s' }}>
              <div style={{ position: 'absolute', top: 12, left: 14, pointerEvents: 'none' }}>
                <IrisSparkleIcon size={14} />
              </div>
              {isReview ? (
                <textarea
                  value={typedText}
                  onChange={e => setTypedText(e.target.value)}
                  rows={6}
                  autoFocus
                  style={{ display: 'block', width: '100%', border: 'none', outline: 'none', padding: '10px 14px 14px 36px', fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.7, resize: 'none', background: 'transparent', boxSizing: 'border-box', color: 'var(--ink-text-primary)' }}
                />
              ) : (
                <div style={{ padding: '10px 14px 14px 36px', fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.7, color: isThinking ? 'transparent' : 'var(--ink-text-primary)', minHeight: 110, whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'none' }}>
                  {typedText || ' '}
                  {isGenerating && (
                    <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--ink-purple-100, #4B47C8)', marginLeft: 1, verticalAlign: 'text-bottom', animation: 'iris-thinking-blink 0.7s step-end infinite' }} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 28px' }}>
            {/* Left action */}
            {isReview ? (
              <button onClick={regenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-text-secondary)', fontFamily: 'inherit', padding: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-purple-100, #4B47C8)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-text-secondary)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 0 1 10.5 3.5M10.5 3.5V1M10.5 3.5H8M11 6.5A4.5 4.5 0 0 1 2.5 9.5M2.5 9.5V12M2.5 9.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Regenerate
              </button>
            ) : (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-purple-100, #4B47C8)', fontFamily: 'inherit', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                What is a worksheet?
              </button>
            )}

            {/* Right CTA */}
            <button
              disabled={!isReview}
              onClick={isReview ? onGenerate : undefined}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: isReview ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-neutral-fade-20, #e0e0e8)', color: isReview ? '#fff' : 'var(--ink-text-secondary)', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13.5, fontWeight: 600, cursor: isReview ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s' }}
              onMouseEnter={e => { if (isReview) (e.currentTarget as HTMLElement).style.background = '#3d39b0'; }}
              onMouseLeave={e => { if (isReview) (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'; }}
            >
              <Icon name="arrow-right" size={14} color={isReview ? '#fff' : 'var(--ink-text-secondary)'} />
              Build my worksheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

/* ═══════════════════════════════════════
   Acme Termination Block
   ═══════════════════════════════════════ */


function DeepAnalysisAnswerCard({ onCTA }: { onCTA: () => void }) {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ctaClicked, setCtaClicked] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleCTA = () => {
    setCtaClicked(true);
    setCollapsed(true);
    setTimeout(() => onCTA(), 150);
  };

  if (collapsed) return (
    <CollapsedAnswerBar
      summary="10 Acme agreements · 3 product categories · Pricing analysis"
      onExpand={() => { setCollapsed(false); setCtaClicked(false); }}
      irisActive={ctaClicked}
    />
  );

  const categories = [
    { label: 'Cloud storage & hosting', count: 10 },
    { label: 'Managed IT support', count: 8 },
    { label: 'Professional services', count: 5 },
  ];

  return (
    <div style={{
      marginBottom: 20,
      background: '#fff',
      border: '1px solid var(--ink-border-color-subtle)',
      borderRadius: 8,
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity 300ms cubic-bezier(0.33, 0, 0.67, 1), transform 300ms cubic-bezier(0.35, 0, 0.2, 1)',
    }}>

      {/* Header */}
      <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}>
          <div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-text-primary)', textDecoration: 'none', lineHeight: 1.3 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
            >
              Acme Corp
            </a>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', marginTop: 2, flexShrink: 0 }}
          >
            <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginBottom: 10 }}>
          Party · 10 agreements on record
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-text-secondary)', lineHeight: 1.6 }}>
          An established software vendor with a 3-year relationship spanning IT infrastructure, cloud services, and professional services engagements.
        </div>
      </div>

      {/* Product categories */}
      <div style={{ borderBottom: '1px solid var(--ink-border-color-subtle)' }}>
        <div style={{ padding: '8px 16px 6px', fontSize: 11, color: 'var(--ink-text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 500 }}>
          Products & services
        </div>
        {categories.map((cat, i) => (
          <div
            key={cat.label}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 16px',
              borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--ink-text-primary)' }}>{cat.label}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--ink-text-secondary)',
              background: 'var(--ink-neutral-fade-10, #f1f1f4)',
              borderRadius: 100, padding: '2px 8px',
            }}>
              {cat.count} agreements
            </span>
          </div>
        ))}
        <div style={{ height: 8 }} />
      </div>

      {/* AI CTA */}
      <div style={{ padding: '12px 16px 14px', background: 'var(--ink-purple-05, #f5f3ff)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #ede9ff 0%, #ddd5ff 100%)',
            border: '1px solid var(--ink-purple-20, #d9d3ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IrisIcon />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-text-primary)', marginBottom: 4 }}>
              Analyze products, pricing, and terms
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginBottom: 10 }}>
              Ask questions across all 10 Acme agreements
            </div>
            <button
              onClick={handleCTA}
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: ctaClicked ? 'var(--ink-purple-05, #f5f3ff)' : '#fff',
                border: '1px solid var(--ink-border-color-default)',
                borderRadius: 100, padding: '5px 12px', fontSize: 12,
                color: 'var(--ink-text-primary)',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 400,
                transition: 'background 150ms ease, transform 100ms ease',
                transform: ctaClicked ? 'scale(0.95)' : 'scale(1)',
              }}
              onMouseEnter={(e) => { if (!ctaClicked) (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-05, #f5f3ff)'; }}
              onMouseLeave={(e) => { if (!ctaClicked) (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              Start analysis
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

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
      {irisActive
        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 500, flexShrink: 0 }}>Moved to Iris Chat <Icon name="arrow-right" size={12} color="var(--ink-purple-100, #4B47C8)" /></span>
        : <Icon name="chevron-down" size={13} color="var(--ink-text-secondary)" />
      }
    </div>
  );
}

function InlineFollowUp({ onContinue, chips, prefill }: { onContinue: (msg: string) => void; chips?: ActionChip[]; prefill?: string }) {
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
          onFocus={() => { if (!val && prefill) setVal(prefill); }}
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
  const [notScriptedMsg, setNotScriptedMsg] = useState('');
  useEffect(() => { const t = setTimeout(() => setChipsReady(true), 700); return () => clearTimeout(t); }, []);
  const handle = (msg: string) => { setCollapsed(true); setCollapsedViaIris(true); onContinue(msg); };
  if (collapsed) return <CollapsedAnswerBar summary="42 agreements expiring soon — identifying price hike risk" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Inline gap="xs" align="center">
          <IrisIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-purple-100)' }}>Iris</span>
        </Inline>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
        </button>
      </div>
      <Text size="sm" style={{ lineHeight: 1.65, marginBottom: 12, display: 'block' }}>
        I've found <strong>42 agreements</strong> hitting their expiration dates soon. What else would you like to understand about these agreements?
      </Text>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 8 }}>
        {[
          { label: "Show contracts with no price cap", scripted: false },
          { label: "Which ones expire the soonest?", scripted: false },
          { label: "Which ones might increase in price?", scripted: true },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => {
              if (chip.scripted) {
                handle("I want to identify which agreements might increase in price and by how much");
              } else {
                setNotScriptedMsg("This path isn't in the demo — try 'Which ones might increase in price?' to continue.");
              }
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#fff',
              border: '1px solid var(--ink-border-color-default)',
              borderRadius: 100, padding: '5px 12px', fontSize: 12,
              color: 'var(--ink-text-primary)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 400,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f7f7f9)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            {chip.label}
          </button>
        ))}
      </div>
      {notScriptedMsg && (
        <p style={{ fontSize: 12, color: 'var(--ink-text-secondary)', fontStyle: 'italic', margin: '0 0 8px' }}>
          {notScriptedMsg}
        </p>
      )}
      <InlineFollowUp onContinue={handle} chips={[]} prefill="I want to identify which agreements might increase in price and by how much" />
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
   Auto-Renew Answer Block
   ═══════════════════════════════════════ */


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

/* ═══════════════════════════════════════
   Spend by Category Answer Block
   ═══════════════════════════════════════ */

function SpendAnswerBlock({ onFollowUp, sidebarOpen }: { onFollowUp: (msg: string) => void; sidebarOpen?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fade = useFadeIn(120, 300);

  useEffect(() => {
    if (!sidebarOpen && collapsed) { setCollapsed(false); setCollapsedViaIris(false); }
  }, [sidebarOpen]);

  const chips = ['Build a spend report', 'Show top vendors by spend', 'Flag contracts expiring in 90 days'];

  const handleSubmit = (msg: string) => {
    if (!msg.trim()) return;
    setCollapsedViaIris(true);
    setTextInput('');
    setTimeout(() => setCollapsed(true), 80);
    setTimeout(() => onFollowUp(msg.trim()), 150);
  };

  if (collapsed) return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, padding: '10px 16px', marginBottom: 16 }}>
      <Inline gap="small" align="center">
        <IrisIcon />
        <Text size="sm" style={{ fontWeight: 500 }}>Spend by category · 47 agreements</Text>
      </Inline>
      <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
        <Icon name="chevron-down" size={14} color="var(--ink-text-secondary)" />
      </button>
    </div>
  );

  return (
    <div {...fade} style={{ ...fade.style, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <IrisIcon />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
        <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)' }}>· 47 agreements</span>
      </div>
      <div style={{ padding: '10px 18px 12px' }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}>
          Across your <strong>47 agreements</strong>, total committed spend is <strong>$4.2M/yr</strong>. Software is the largest category at <strong>$2.1M</strong>, followed by professional services (<strong>$1.4M</strong>) and infrastructure (<strong>$700K</strong>). Three vendor categories have contracts expiring within 90 days.<CitationBadge number={1} title="Spend Summary — All Vendors" excerpt="Annual committed spend as of Q2 2027: Software $2.1M, Professional Services $1.4M, Infrastructure & Hosting $700K. Figures reflect executed order forms and active SOWs only." /><CitationBadge number={2} title="MSA - Acme Corp.pdf" excerpt="Aggregate spend across all active agreements with Acme Solutions totals $1.87M annually, representing the largest single-vendor relationship in the portfolio." />
        </p>
      </div>
      <div style={{ padding: '0 18px 8px', display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
        {chips.map(chip => (
          <button key={chip} onClick={() => handleSubmit(chip)}
            style={{ fontSize: 13, color: 'var(--ink-text-primary)', background: 'var(--ink-neutral-fade-05)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'background 120ms', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-10)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'}>
            {chip === 'Build a spend report' && <Icon name="chart-bar" size={12} color="var(--ink-purple-60, #7b77d9)" />}
            {chip}
          </button>
        ))}
      </div>
      <div style={{ margin: '4px 18px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-neutral-fade-05)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '5px 5px 5px 16px' }}>
        <input value={textInput} onChange={e => setTextInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(textInput); }}
          placeholder="Ask about your vendor spend..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit' }} />
        <button onClick={() => handleSubmit(textInput)}
          style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: textInput.trim() ? 'pointer' : 'default', opacity: textInput.trim() ? 1 : 0.38, flexShrink: 0, transition: 'opacity 150ms' }}>
          <Icon name="arrow-up" size={13} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Auto-Renewal Risk Answer Block (question-based, cross-supplier)
   ═══════════════════════════════════════ */

function RenewalAnswerBlock({ onFollowUp }: { onFollowUp: (msg: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fade = useFadeIn(120, 300);

  const handleChip = (msg: string) => {
    setCollapsedViaIris(true);
    setTimeout(() => setCollapsed(true), 80);
    setTimeout(() => onFollowUp(msg), 150);
  };

  const handleSubmit = (msg: string) => {
    if (!msg.trim()) return;
    setCollapsedViaIris(true);
    setTextInput('');
    setTimeout(() => setCollapsed(true), 80);
    setTimeout(() => onFollowUp(msg.trim()), 150);
  };

  if (collapsed) return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, padding: '10px 16px', marginBottom: 16, cursor: 'pointer' }} onClick={() => setCollapsed(false)}>
      <Inline gap="small" align="center">
        <IrisSparkleIcon size={14} />
        <Text size="sm" style={{ fontWeight: 500 }}>Acme Corp · 7 agreements renewing · Renewal review</Text>
      </Inline>
      {collapsedViaIris
        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 500 }}>Moved to Iris Chat <Icon name="arrow-right" size={12} color="var(--ink-purple-100, #4B47C8)" /></span>
        : <Icon name="chevron-down" size={14} color="var(--ink-text-secondary)" />
      }
    </div>
  );

  const chips = [
    'Negotiate better pricing',
    'Review SLA performance',
    'Check auto-renewal deadlines',
  ];

  return (
    <div {...fade} style={{ ...fade.style, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <IrisSparkleIcon size={14} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
        <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)' }}>· Acme Corp · 7 agreements renewing</span>
      </div>
      <div style={{ padding: '10px 18px 12px' }}>
        <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.65, color: 'var(--ink-text-primary)' }}>
          You have <strong>7 Acme agreements</strong> renewing in the next 6 months, totaling <strong>$535K</strong>. Three carry pricing or auto-renewal risk worth reviewing before their windows close.<CitationBadge number={1} title="MSA - Acme Corp.pdf, §8.4" excerpt="Unless terminated in accordance with Section 12, this Agreement renews automatically for one-year terms. Pricing adjustments not to exceed 5% annually apply at each renewal." /><CitationBadge number={2} title="Renewal Schedule - Acme Corp.pdf" excerpt="Q3 renewals: Cloud Storage ($210K), Managed Support ($180K), Professional Services ($145K). Auto-renewal notice deadlines fall between April 15 and May 30, 2027." />
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => handleChip(chip)}
              style={{ fontSize: 13, color: 'var(--ink-text-primary)', background: 'var(--ink-neutral-fade-05)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'background 120ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-10)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'; }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
      <div style={{ margin: '4px 18px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-neutral-fade-05)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '5px 5px 5px 16px' }}>
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(textInput); } }}
          placeholder="Ask about these renewals..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}
        />
        <button
          onClick={() => handleSubmit(textInput)}
          style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: textInput.trim() ? 'pointer' : 'default', opacity: textInput.trim() ? 1 : 0.38, flexShrink: 0, transition: 'opacity 150ms' }}
        >
          <Icon name="arrow-up" size={13} />
        </button>
      </div>
    </div>
  );
}

function AcmeUpdatesBlock({ onFollowUp, sidebarOpen }: { onFollowUp: (msg: string) => void; sidebarOpen?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const fade = useFadeIn(120, 300);

  useEffect(() => {
    if (!sidebarOpen && collapsed) {
      setCollapsed(false);
      setCollapsedViaIris(false);
    }
  }, [sidebarOpen]);

  const chips = [
    "What's expiring soon?",
    'Summarize my relationship with Acme',
    'Are there any price increase clauses?',
  ];

  const collapse = (msg: string) => {
    setCollapsedViaIris(true);
    setTimeout(() => setCollapsed(true), 80);
    setTimeout(() => onFollowUp(msg), 150);
  };

  if (collapsed) return <CollapsedAnswerBar summary="Acme Corp · suggested questions" onExpand={() => setCollapsed(false)} irisActive={collapsedViaIris} />;

  return (
    <div {...fade} style={{ ...fade.style, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>

      {/* Row 1: Iris label + chips + Start Chat */}
      <div style={{ padding: '10px 14px 10px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
        <Inline gap="xs" align="center" style={{ flexShrink: 0, marginRight: 2 }}>
          <IrisIcon />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
        </Inline>
        <div style={{ width: 1, height: 14, background: 'var(--ink-border-color-subtle)', flexShrink: 0 }} />
        {chips.map(chip => (
          <button
            key={chip}
            onClick={() => collapse(chip)}
            style={{ fontSize: 13, color: 'var(--ink-text-primary)', background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '4px 13px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'background 120ms' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-10, #f0f0f3)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f7f7f9)'; }}
          >
            {chip}
          </button>
        ))}
        <button
          onClick={() => collapse('')}
          style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--ink-purple-100, #4B47C8)', border: 'none', borderRadius: 100, padding: '4px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'background 120ms' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3d39b0'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'; }}
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}

function AcmeDeepBlock({ onFollowUp, onStartWorksheet }: { onFollowUp: (msg: string) => void; onStartWorksheet?: (query: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedViaIris, setCollapsedViaIris] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fade = useFadeIn(120, 300);

  const chips = [
    'Build a pricing comparison table',
    'Show me pricing and licensing terms',
    'Flag any price escalation clauses',
  ];

  const handleChip = (chip: string) => {
    if (chip === 'Build a pricing comparison table' && onStartWorksheet) {
      onStartWorksheet('What products and services do we purchase from Acme?');
      return;
    }
    handleSubmit(chip);
  };

  const handleSubmit = (msg: string) => {
    if (!msg.trim()) return;
    setCollapsedViaIris(true);
    setTextInput('');
    setTimeout(() => setCollapsed(true), 80);
    setTimeout(() => onFollowUp(msg.trim()), 150);
  };

  if (collapsed) return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, padding: '10px 16px', marginBottom: 16, cursor: 'pointer' }} onClick={() => setCollapsed(false)}>
      <Inline gap="small" align="center">
        <IrisSparkleIcon size={14} />
        <Text size="sm" style={{ fontWeight: 500 }}>Acme Corp · 10 agreements · Products & pricing</Text>
      </Inline>
      {collapsedViaIris
        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 500 }}>Moved to Iris Chat <Icon name="arrow-right" size={12} color="var(--ink-purple-100, #4B47C8)" /></span>
        : <Icon name="chevron-down" size={14} color="var(--ink-text-secondary)" />
      }
    </div>
  );

  return (
    <div {...fade} style={{ ...fade.style, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <IrisSparkleIcon size={14} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
        <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)' }}>· Acme Corp · 10 agreements</span>
      </div>
      <div style={{ padding: '10px 18px 12px' }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}>
          Across your <strong>10 Acme agreements</strong>, you purchase <strong>3 categories</strong> of products and services: <strong>Cloud storage &amp; hosting</strong> (10 agreements, volume-tiered pricing), <strong>Managed IT support</strong> (8 agreements, flat fee), and <strong>Professional services</strong> (5 agreements, time &amp; materials). Total committed spend is <strong>$225K/yr</strong>.<CitationBadge number={1} title="MSA - Acme Corp.pdf" excerpt="Services provided under this Agreement include cloud infrastructure, managed IT support, and professional services engagements as detailed in each applicable Order Form." /><CitationBadge number={2} title="SOW - Acme Implementation.pdf" excerpt="Time and materials engagement capped at 800 hours annually. Blended rate of $185/hr applies to all professional services delivered under this statement of work." />
        </p>
      </div>
      <div style={{ padding: '0 18px 8px', display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
        {chips.map(chip => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            style={{ fontSize: 13, color: 'var(--ink-text-primary)', background: 'var(--ink-neutral-fade-05)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'background 120ms', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-10)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'; }}
          >
            {chip === 'Build a pricing comparison table' && <Icon name="table" size={12} color="var(--ink-purple-60, #7b77d9)" />}
            {chip}
          </button>
        ))}
      </div>
      <div style={{ margin: '4px 18px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-neutral-fade-05)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '5px 5px 5px 16px' }}>
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(textInput); setTextInput(''); } }}
          placeholder="Ask about Acme products and pricing..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}
        />
        <button
          onClick={() => { handleSubmit(textInput); setTextInput(''); }}
          style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: textInput.trim() ? 'pointer' : 'default', opacity: textInput.trim() ? 1 : 0.38, flexShrink: 0, transition: 'opacity 150ms' }}
        >
          <Icon name="arrow-up" size={13} />
        </button>
      </div>
    </div>
  );
}

function AcmeSimpleBlock({ onFollowUp }: { onFollowUp: (msg: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fade = useFadeIn(120, 300);

  const chips = [
    'Summarize my relationship with Acme',
    "What's expiring soon?",
    'What products do we buy from them?',
  ];

  const handleSubmit = (msg: string) => {
    if (!msg.trim()) return;
    onFollowUp(msg.trim());
  };

  if (collapsed) return (
    <div {...fade} style={{ ...fade.style, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Inline gap="small" align="center">
        <IrisIcon />
        <Text size="sm" style={{ fontWeight: 500 }}>Acme Corp · 4 agreements</Text>
      </Inline>
      <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
        <Icon name="chevron-down" size={14} color="var(--ink-text-secondary)" />
      </button>
    </div>
  );

  return (
    <div {...fade} style={{ ...fade.style, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 0' }}>
        <Inline gap="xs" align="center">
          <IrisIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
        </Inline>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <Icon name="chevron-up" size={14} color="var(--ink-text-secondary)" />
        </button>
      </div>

      <div style={{ padding: '10px 18px 14px' }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)' }}>
          I found <strong>4 agreements</strong> with Acme Corp — an established software vendor with <strong>$225K/yr</strong> in committed spend across an MSA, SOW, NDA, and DPA. Two agreements are approaching action before Q3. What would you like to know?
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, padding: '0 18px 14px' }}>
        {chips.map(chip => (
          <button
            key={chip}
            onClick={() => handleSubmit(chip)}
            style={{ fontSize: 13, color: 'var(--ink-text-primary)', background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'background 120ms' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05, #f5f5f8)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            {chip}
          </button>
        ))}
      </div>

      <div style={{ margin: '0 18px 14px', display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, padding: '5px 5px 5px 16px' }}>
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(textInput); setTextInput(''); } }}
          placeholder="Ask a follow-up..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}
        />
        <button
          onClick={() => { handleSubmit(textInput); setTextInput(''); }}
          style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: textInput.trim() ? 'pointer' : 'default', opacity: textInput.trim() ? 1 : 0.38, flexShrink: 0, transition: 'opacity 150ms' }}
        >
          <Icon name="arrow-up" size={13} />
        </button>
      </div>

      <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--ink-border-color-subtle)', textAlign: 'center' as const }}>
        <span style={{ fontSize: 11, color: 'var(--ink-text-secondary)', fontStyle: 'italic' }}>
          Responses are generated with AI and should not be used as legal advice.{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn how we use AI at Docusign.</span>
        </span>
      </div>
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
        <span style={{ fontSize: 'var(--ink-font-size-sm)', lineHeight: 1.65, marginBottom: '12px', display: 'block' }}>
          The Acme Corporation MSA expires on April 26, 2027. It includes an auto-renewal clause that triggers 60 days prior, on February 25, 2027, unless either party provides written notice.<CitationBadge number={1} title="MSA - Acme Corp.pdf" excerpt="This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal no less than 60 days prior to the end of the then-current term." /><CitationBadge number={2} title="Order Form - Cloud Storage.pdf" excerpt="Renewal terms are governed by the Master Services Agreement dated January 14, 2023. Pricing subject to change with 60 days notice prior to renewal date." />
        </span>
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

type TabId = 'home' | 'agreements' | 'templates' | 'insights' | 'admin' | 'search-bar';
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
  { id: '1', name: 'Complete with Docusign: rhi.pdf, Sample_Service_Agreement.pdf', recipient: 'To: Casey Hudetz', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:26', action: 'Copy' },
  { id: '2', name: 'Here is your signed document: Sample_Service_Agreement.pdf', recipient: 'To: Casey Hudetz, [Placeholder]', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:23', action: 'Copy' },
  { id: '3', name: 'Complete with Docusign: rhi.pdf', recipient: 'To: Casey Hudetz', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:16', action: 'Copy' },
  { id: '4', name: 'Complete with Docusign: Sample_Service_Agreement.pdf', recipient: 'To: Casey Hudetz', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:14', action: 'Copy' },
  { id: '5', name: 'Complete with Docusign: Sample_Service_Agreement.pdf', recipient: 'To: Casey Hudetz', status: 'Voided', statusIcon: 'status-void', statusKind: 'neutral', statusSub: 'Purging soon', date: '24/3/2026', time: '20:10', action: 'Copy' },
  { id: '6', name: 'Complete with Docusign: rhi.pdf, Sample_Service_Agreement.pdf', recipient: 'To: Casey Hudetz', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purging soon', date: '23/3/2026', time: '20:25', action: 'Download' },
  { id: '7', name: 'Complete with Docusign: Screenshot 2026-03-18 at 10.27.30 AM.png', recipient: 'To: Casey Hudetz', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purging soon', date: '18/3/2026', time: '11:05', action: 'Download' },
  { id: '8', name: 'Complete with Docusign: Screenshot 2026-03-18 at 10.27.21 AM.png', recipient: 'To: Casey Hudetz', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purging soon', date: '18/3/2026', time: '10:57', action: 'Download' },
  { id: '9', name: 'Please sign: test.txt', recipient: 'To: Casey Hudetz', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purged', date: '26/2/2026', time: '12:15', action: 'Download' },
  { id: '10', name: 'Complete with Docusign: Fontara Financial SOW.pdf', recipient: 'To: Casey Hudetz', status: 'Completed', statusIcon: 'status-check', statusKind: 'success', statusSub: 'Purged', date: '24/2/2026', time: '10:50', action: 'Download' },
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
  { id: 'n1', fileName: 'Abi OrderFormDocumentData 2026-11-18 End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Fontara', 'SpringBox'], status: 'active', agreementType: 'Order Form', contractValue: '$750,000.00 USD', expirationDate: '2026-Nov-18', effectiveDate: '2025-Nov-17', isAIAssisted: true },
  { id: 'n2', fileName: 'Abi FormDocumentData End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: [], status: 'active', agreementType: 'Form', isAIAssisted: false },
  { id: 'n3', fileName: 'Abi FormDocumentData End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Ryan Kam'], status: 'active', agreementType: 'Form', isAIAssisted: false },
  { id: 'n4', fileName: 'Abi C_AON_Quote End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - aiflow-service - aiflow-service-', parties: [], status: 'active', agreementType: 'AON_Quote', isAIAssisted: true },
  { id: 'n5', fileName: 'Abi ReleaseWaiverDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - aiflow-service - aiflow-service-', parties: [], status: 'active', agreementType: 'Release/Waiver', isAIAssisted: false },
  { id: 'n6', fileName: 'Abi ReleaseWaiverDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - aiflow-service - aiflow-service-', parties: [], status: 'active', agreementType: 'Release/Waiver', isAIAssisted: false },
  { id: 'n7', fileName: 'Abi MsaDocumentData End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Dell'], status: 'active', agreementType: 'Master Service Agreement', isAIAssisted: true },
  { id: 'n8', fileName: 'Abi ServicesAgreementDocumentData AUTO_RENEW End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['High Tech Co', 'Kyle Party 0'], status: 'active', agreementType: 'Services Agreement', isAIAssisted: false },
  { id: 'n9', fileName: 'Abi C_DataSharingAgreement End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - inference-as-a-service - infer-', parties: [], status: 'active', agreementType: 'Data Sharing Agreement', isAIAssisted: true },
  { id: 'n10', fileName: 'Abi ReleaseWaiverDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - inference-as-a-service - infer-', parties: [], status: 'active', agreementType: 'Release/Waiver', isAIAssisted: false },
  { id: 'n11', fileName: 'Abi ReleaseWaiverDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - inference-as-a-service - infer-', parties: [], status: 'active', agreementType: 'Release/Waiver', isAIAssisted: false },
  { id: 'n12', fileName: 'Abi DistributionDocumentData AUTO_RENEW 2021-05-01 End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['BASF SE', 'Solenis Switzerland Gm...'], status: 'active', agreementType: 'Supply / Distribution', expirationDate: '2027-Jan-01', effectiveDate: '2021-May-01', isAIAssisted: true },
  { id: 'n13', fileName: 'Abi OtherDocumentData End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: [], status: 'active', agreementType: 'Miscellaneous', isAIAssisted: false },
  { id: 'n14', fileName: 'Abi PurchaseOrderDocumentData 2026-08-12 End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Veridian Corp'], status: 'active', agreementType: 'Purchase Order', contractValue: '$124,500.00 USD', expirationDate: '2027-Aug-12', effectiveDate: '2026-Aug-12', isAIAssisted: true },
  { id: 'n15', fileName: 'Abi NdaDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - aiflow-service - aiflow-service-', parties: ['Horizon Partners'], status: 'active', agreementType: 'NDA', isAIAssisted: false },
  { id: 'n16', fileName: 'Abi SaasAgreementDocumentData AUTO_RENEW End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Silph Co.'], status: 'active', agreementType: 'SaaS Agreement', contractValue: '$48,000.00 USD', expirationDate: '2027-Sep-03', effectiveDate: '2026-Sep-03', isAIAssisted: true },
  { id: 'n17', fileName: 'Abi StatementOfWorkDocumentData End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Beacon Law Group'], status: 'active', agreementType: 'Statement of Work', contractValue: '$78,000.00 USD', isAIAssisted: false },
  { id: 'n18', fileName: 'Abi AmendmentDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - inference-as-a-service - infer-', parties: ['Acme Corp'], status: 'active', agreementType: 'Amendment', isAIAssisted: true },
  { id: 'n19', fileName: 'Abi LicenseAgreementDocumentData 2025-03-01 End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['BioCore Innovations'], status: 'active', agreementType: 'License Agreement', contractValue: '$210,000.00 USD', expirationDate: '2028-Mar-01', effectiveDate: '2025-Mar-01', isAIAssisted: true },
  { id: 'n20', fileName: 'Abi ConfidentialityAgreementDocumentData End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Pinnacle Consulting', 'Kyle Party 0'], status: 'active', agreementType: 'Confidentiality Agreement', isAIAssisted: false },
  { id: 'n21', fileName: 'Abi ReleaseWaiverDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - aiflow-service - aiflow-service-', parties: [], status: 'active', agreementType: 'Release/Waiver', isAIAssisted: false },
  { id: 'n22', fileName: 'Abi FrameworkAgreementDocumentData AUTO_RENEW End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Globex', 'SpringBox'], status: 'active', agreementType: 'Framework Agreement', contractValue: '$95,000.00 USD', expirationDate: '2027-Jul-12', effectiveDate: '2024-Jul-12', isAIAssisted: true },
  { id: 'n23', fileName: 'Abi SupportAgreementDocumentData End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Acme Corp'], status: 'active', agreementType: 'Support Agreement', contractValue: '$24,000.00 USD', isAIAssisted: false },
  { id: 'n24', fileName: 'Abi DataProcessingDocumentData End', fileStatus: 'completed', fileStatusDetail: 'Authorization for Release - inference-as-a-service - infer-', parties: ['Fontara'], status: 'active', agreementType: 'Data Processing Agreement', isAIAssisted: true },
  { id: 'n25', fileName: 'Abi ConsultingServicesDocumentData 2026-06-15 End', fileStatus: 'uploaded', fileStatusDetail: 'View Job', parties: ['Veridian Corp'], status: 'active', agreementType: 'Consulting Services', contractValue: '$62,000.00 USD', expirationDate: '2027-Jun-15', effectiveDate: '2026-Jun-15', isAIAssisted: false },
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
  { id: 'ac2', fileName: 'SOW - Acme Implementation.pdf', fileStatus: 'completed', fileStatusDetail: 'Fixed scope project', parties: ['Acme Corp'], status: 'active', agreementType: 'SOW', contractValue: '$45,000', expirationDate: 'Aug 18, 2026', effectiveDate: '1/15/2024', isAIAssisted: true },
  { id: 'ac3', fileName: 'NDA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Mutual non-disclosure', parties: ['Acme Corp'], status: 'active', agreementType: 'NDA', expirationDate: 'Apr 26, 2027', effectiveDate: '4/26/2022', isAIAssisted: false },
  { id: 'ac4', fileName: 'DPA - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Data processing addendum', parties: ['Acme Corp'], status: 'active', agreementType: 'DPA', effectiveDate: '4/26/2022', isAIAssisted: false },
  { id: 'ac5', fileName: 'Order Form - Acme Core Platform (2024).pdf', fileStatus: 'completed', fileStatusDetail: 'Annual renewal', parties: ['Acme Corp'], status: 'active', agreementType: 'Order Form', contractValue: '$92,000/yr', expirationDate: 'Apr 26, 2025', effectiveDate: '4/26/2024', isAIAssisted: true },
  { id: 'ac6', fileName: 'SOW - Acme Custom Development.pdf', fileStatus: 'completed', fileStatusDetail: 'Time & materials', parties: ['Acme Corp'], status: 'active', agreementType: 'SOW', contractValue: '$28,000', expirationDate: 'Dec 31, 2026', effectiveDate: '6/1/2026', isAIAssisted: true },
  { id: 'ac7', fileName: 'SaaS Addendum - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Platform addendum', parties: ['Acme Corp'], status: 'active', agreementType: 'Addendum', effectiveDate: '4/26/2023', isAIAssisted: false },
  { id: 'ac8', fileName: 'Training Services Agreement - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Annual training package', parties: ['Acme Corp'], status: 'active', agreementType: 'Service', contractValue: '$18,000/yr', expirationDate: 'Mar 15, 2027', effectiveDate: '3/15/2025', isAIAssisted: true },
  { id: 'ac9', fileName: 'Support Agreement - Acme Corp.pdf', fileStatus: 'completed', fileStatusDetail: 'Premium support tier', parties: ['Acme Corp'], status: 'active', agreementType: 'Support', contractValue: '$24,000/yr', expirationDate: 'Apr 26, 2027', effectiveDate: '4/26/2025', isAIAssisted: true },
  { id: 'ac10', fileName: 'Order Form - Acme Corp (2023).pdf', fileStatus: 'completed', fileStatusDetail: 'Prior renewal', parties: ['Acme Corp'], status: 'inactive', agreementType: 'Order Form', contractValue: '$155,000/yr', expirationDate: 'Apr 25, 2024', effectiveDate: '4/26/2022', isAIAssisted: false },
];

const NAVIGATOR_FONTARA: NavigatorAgreement[] = [
  { id: 'fn1', fileName: 'MSA - Fontara Inc.pdf', fileStatus: 'completed', fileStatusDetail: 'Active agreement', parties: ['Fontara Inc.'], status: 'active', agreementType: 'MSA', contractValue: '$140,000/yr', expirationDate: 'Jun 30, 2027', effectiveDate: '7/1/2024', isAIAssisted: true },
  { id: 'fn2', fileName: 'SOW - Fontara Data Migration.pdf', fileStatus: 'completed', fileStatusDetail: 'Fixed scope project', parties: ['Fontara Inc.'], status: 'active', agreementType: 'SOW', contractValue: '$62,000', expirationDate: 'Oct 31, 2026', effectiveDate: '1/15/2026', isAIAssisted: true },
  { id: 'fn3', fileName: 'NDA - Fontara Inc.pdf', fileStatus: 'completed', fileStatusDetail: 'Mutual non-disclosure', parties: ['Fontara Inc.'], status: 'active', agreementType: 'NDA', expirationDate: 'Jun 30, 2027', effectiveDate: '7/1/2024', isAIAssisted: false },
  { id: 'fn4', fileName: 'Order Form - Fontara Analytics (2025).pdf', fileStatus: 'completed', fileStatusDetail: 'Annual renewal', parties: ['Fontara Inc.'], status: 'active', agreementType: 'Order Form', contractValue: '$38,000/yr', expirationDate: 'Jul 1, 2026', effectiveDate: '7/1/2025', isAIAssisted: true },
  { id: 'fn5', fileName: 'DPA - Fontara Inc.pdf', fileStatus: 'completed', fileStatusDetail: 'Data processing addendum', parties: ['Fontara Inc.'], status: 'active', agreementType: 'DPA', effectiveDate: '7/1/2024', isAIAssisted: false },
];

const NAVIGATOR_AUTORENEW: NavigatorAgreement[] = [
  { id: 'ar1', fileName: 'Enterprise Agreement - Salesforce Inc.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['Salesforce Inc.'], status: 'active', agreementType: 'SaaS', contractValue: '$420,000/yr', expirationDate: 'Jul 14, 2026', effectiveDate: '7/14/2023', isAIAssisted: true },
  { id: 'ar2', fileName: 'Enterprise Agreement - Workday.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['Workday'], status: 'active', agreementType: 'SaaS', contractValue: '$310,000/yr', expirationDate: 'Aug 2, 2026', effectiveDate: '8/2/2023', isAIAssisted: true },
  { id: 'ar3', fileName: 'Subscription - Slack Technologies.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['Slack Technologies'], status: 'active', agreementType: 'SaaS', contractValue: '$82,000/yr', expirationDate: 'Aug 18, 2026', effectiveDate: '8/18/2024', isAIAssisted: true },
  { id: 'ar4', fileName: 'SaaS Agreement - Zendesk.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['Zendesk'], status: 'active', agreementType: 'SaaS', contractValue: '$96,000/yr', expirationDate: 'Sep 1, 2026', effectiveDate: '9/1/2024', isAIAssisted: true },
  { id: 'ar5', fileName: 'Creative Cloud - Adobe Inc.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['Adobe Inc.'], status: 'active', agreementType: 'SaaS', contractValue: '$64,000/yr', expirationDate: 'Oct 12, 2026', effectiveDate: '10/12/2024', isAIAssisted: false },
  { id: 'ar6', fileName: 'Enterprise License - Box Inc.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['Box Inc.'], status: 'active', agreementType: 'SaaS', contractValue: '$48,000/yr', expirationDate: 'Oct 28, 2026', effectiveDate: '10/28/2024', isAIAssisted: false },
  { id: 'ar7', fileName: 'Enterprise Agreement - GitHub.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['GitHub'], status: 'active', agreementType: 'SaaS', contractValue: '$32,000/yr', expirationDate: 'Nov 22, 2026', effectiveDate: '11/22/2024', isAIAssisted: false },
  { id: 'ar8', fileName: 'Business Plan - Notion Labs.pdf', fileStatus: 'completed', fileStatusDetail: 'Auto-renewal clause active', parties: ['Notion Labs'], status: 'active', agreementType: 'SaaS', contractValue: '$16,000/yr', expirationDate: 'Dec 5, 2026', effectiveDate: '12/5/2024', isAIAssisted: false },
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
    key: 'fileName',
    header: 'Original File Name',
    sortable: true,
    width: '320px',
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
    width: '160px',
    cell: (row: NavigatorAgreement) => (
      <div className={dataTableStyles.cellContent}>
        {row.parties.length > 0 ? (
          row.parties.map((party, i) => {
            const isMoreLink = party.startsWith('+');
            if (isMoreLink) {
              return <a key={i} href="#" className={dataTableStyles.partyMoreLink}>{party}</a>;
            }
            return (
              <a key={i} href="#" className={dataTableStyles.partyLink}>{party}</a>
            );
          })
        ) : (
          <span className={dataTableStyles.cellSecondary}>&mdash;</span>
        )}
      </div>
    ),
  },
  {
    key: 'agreementType',
    header: 'Agreement Type',
    sortable: true,
    width: '180px',
    cell: (row: NavigatorAgreement) => row.agreementType ? (
      <span style={{ display: 'inline-block', fontSize: 12, color: 'var(--ink-text-primary)', background: 'var(--ink-neutral-fade-05, #f5f5f8)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 4, padding: '2px 8px', lineHeight: 1.5, whiteSpace: 'nowrap' as const }}>{row.agreementType}</span>
    ) : <span style={{ color: 'var(--ink-text-secondary)' }}>—</span>,
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
  { id: '1', name: 'quick send', description: 'Default template for quick envelope sending', owner: 'Casey Hudetz', lastModified: '03/13/2026', shared: false, uses: 24, favorited: true },
  { id: '2', name: 'shared template info', description: 'Shared informational template', owner: 'Casey Hudetz', lastModified: '08/12/2025', shared: true, uses: 12, favorited: true },
  { id: '3', name: 'Non-Disclosure Agreement', description: 'Standard NDA for external partners', owner: 'Legal Team', lastModified: '02/28/2026', shared: true, uses: 156, favorited: false },
  { id: '4', name: 'Service Agreement', description: 'Master service agreement template', owner: 'Legal Team', lastModified: '01/15/2026', shared: true, uses: 89, favorited: false },
  { id: '5', name: 'Offer Letter', description: 'Standard offer letter for new hires', owner: 'HR Department', lastModified: '03/05/2026', shared: true, uses: 203, favorited: false },
  { id: '6', name: 'Consulting Agreement', description: 'Independent contractor consulting agreement', owner: 'Casey Hudetz', lastModified: '02/10/2026', shared: false, uses: 7, favorited: false },
  { id: '7', name: 'Sales Contract', description: 'Standard sales contract with payment terms', owner: 'Sales Ops', lastModified: '03/20/2026', shared: true, uses: 342, favorited: false },
  { id: '8', name: 'Vendor Onboarding', description: 'New vendor setup and compliance form', owner: 'Procurement', lastModified: '12/08/2025', shared: true, uses: 45, favorited: false },
  { id: '9', name: 'Employment Agreement', description: 'Full-time employment agreement', owner: 'HR Department', lastModified: '03/01/2026', shared: true, uses: 178, favorited: false },
  { id: '10', name: 'Change Order', description: 'Amendment to existing SOW or contract', owner: 'Casey Hudetz', lastModified: '03/22/2026', shared: false, uses: 3, favorited: false },
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
  { id: '6', name: 'Envelope Velocity Report', type: 'dashboard', owner: 'Casey Hudetz', lastViewed: '03/25/2026', shared: false },
  { id: '7', name: 'Agreement Trends', type: 'dashboard', owner: 'Casey Hudetz', lastViewed: '03/20/2026', shared: false },
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
          Welcome back, Casey Hudetz
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

const VALID_TABS: TabId[] = ['home', 'agreements', 'templates', 'insights', 'admin', 'search-bar'];

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

/* ═══════════════════════════════════════
   View Mode Toggle
   ═══════════════════════════════════════ */
function ViewModeToggle({
  mode, onChange, searchBarActive, onSearchBarClick,
}: {
  mode: 'side-panel' | 'unified-search';
  onChange: (m: 'side-panel' | 'unified-search') => void;
  searchBarActive?: boolean;
  onSearchBarClick?: () => void;
}) {
  type Opt = { key: string; label: string; icon: React.ReactNode };
  const opts: Opt[] = [
    {
      key: 'side-panel',
      label: 'Side Panel',
      icon: (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <rect x="0.75" y="0.75" width="12.5" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="9.5" y1="1.25" x2="9.5" y2="12.75" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
      ),
    },
    {
      key: 'unified-search',
      label: 'AI Search',
      icon: (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="9.3" y1="9.3" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M11 1.5C11 1.5 11.18 2.58 11.65 3.05C12.12 3.52 13.2 3.2 13.2 3.2s-1.08.32-1.55.79C11.18 4.46 11 5.5 11 5.5s-.18-1.04-.65-1.51C9.88 3.52 8.8 3.2 8.8 3.2s1.08.32 1.55-.15C10.82 2.58 11 1.5 11 1.5z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      key: 'search-bar',
      label: 'Search Bar',
      icon: (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="9.3" y1="9.3" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', background: 'rgba(75,71,200,0.07)', borderRadius: 99, padding: 3, gap: 1, border: '1px solid rgba(75,71,200,0.2)' }}>
      {opts.map(o => {
        const active = o.key === 'search-bar' ? !!searchBarActive : mode === o.key && !searchBarActive;
        const handleClick = o.key === 'search-bar'
          ? () => onSearchBarClick?.()
          : () => { onChange(o.key as 'side-panel' | 'unified-search'); };
        return (
          <button key={o.key} onClick={handleClick} style={{
            padding: '4px 13px', borderRadius: 99, border: 'none', cursor: 'pointer',
            background: active ? '#4B47C8' : 'transparent',
            color: active ? 'white' : '#6B6B8A',
            fontWeight: active ? 700 : 500, fontSize: 12, fontFamily: 'inherit',
            transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
            whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: active ? '0 1px 4px rgba(75,71,200,0.28)' : 'none',
          }}>
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   Unified Search Bar (AI Search filterBar mode)
   ═══════════════════════════════════════ */

const SAVED_SEARCHES_DATA = [
  'testing',
  'what is renewing in the next 90 days?',
  'agreements expiring this quarter',
  'Acme Corp contracts',
  'auto-renewal clauses',
  'amendments to master agreements',
];

const FILTER_ENTITIES = [
  { name: 'ACME', type: 'Party' },
  { name: 'ACME Co.', type: 'Party' },
  { name: 'Acme Inc', type: 'Agreement Set' },
  { name: 'Acme Technologies', type: 'Party' },
  { name: 'Riverside Health Systems', type: 'Party' },
  { name: 'Vertex Solutions', type: 'Party' },
  { name: 'Global Logistics LLC', type: 'Agreement Set' },
];

const DOCUMENT_MATCHES_DATA = [
  { name: 'Acme NDA.docx', sub: 'Name match' },
  { name: 'Acme Cloud Services.doc', sub: 'Name match' },
  { name: 'Acme Corp Master Services Agreement', sub: 'Name match' },
  { name: 'Riverside Health Systems NDA', sub: 'Name match' },
  { name: 'Global Logistics Master Agreement', sub: 'Name match' },
];

const EMPTY_STATE_DOCS = [
  { name: 'Abi OtherDocumentData End - Miscellaneous', sub: 'Miscellaneous · Equilon Enterprises LLC' },
  { name: 'Abi ReleaseWaiverDocumentData End - Release/Waiver', sub: 'Release/Waiver · Equilon Enterprises LLC' },
];

function boldMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>{text.slice(0, idx)}<strong>{text.slice(idx, idx + query.length)}</strong>{text.slice(idx + query.length)}</>
  );
}

function UnifiedSearchBar({
  onSearch,
  onAskIris,
}: {
  onSearch: (query: string) => void;
  onAskIris: (query: string) => void;
}) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<'search' | 'iris'>('search');
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState<string | null>(null);
  const [dismissedSaved, setDismissedSaved] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const isSearch = mode === 'search';
  const isIris = mode === 'iris';
  const hasText = value.trim().length > 0;
  const q = value.trim().toLowerCase();

  const matchedSaved = q
    ? SAVED_SEARCHES_DATA.filter(s => !dismissedSaved.has(s) && s.toLowerCase().includes(q)).slice(0, 1)
    : SAVED_SEARCHES_DATA.filter(s => !dismissedSaved.has(s)).slice(0, 2);
  const matchedEntities = q
    ? FILTER_ENTITIES.filter(e => e.name.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedDocs = q
    ? DOCUMENT_MATCHES_DATA.filter(d => d.name.toLowerCase().includes(q)).slice(0, 2)
    : [];
  const dynamicQuickAnswers = q
    ? [`Do I have contracts with ${value.trim()}?`, `Do I have any active agreements with ${value.trim()}?`]
    : [];

  const handleFocus = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const handleBlur = () => { closeTimer.current = setTimeout(() => setOpen(false), 180); };

  const fireSearch = () => {
    if (!value.trim()) return;
    onSearch(value.trim());
    setOpen(false);
  };

  const fireIris = () => {
    if (!value.trim()) return;
    setMode('iris');
    onAskIris(value.trim());
    setOpen(false);
  };

  const switchTo = (m: 'search' | 'iris') => {
    setMode(m);
    if (m === 'iris') setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const showDropdown = open && isSearch;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#fff',
        border: '1.5px solid #d0d0d8',
        borderRadius: showDropdown ? '20px 20px 0 0' : 20,
        paddingLeft: 16, paddingRight: 4, height: 36,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        gap: 0, transition: 'border-radius 150ms',
      }}>
        <Icon name="search" size={15} color="#9292a0" style={{ flexShrink: 0, marginRight: 10 }} />
        <input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); if (isSearch) setOpen(true); }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (isIris) fireIris();
              else if (e.altKey) fireIris();
              else fireSearch();
            } else if (e.key === 'Escape') { setOpen(false); }
          }}
          placeholder={isIris ? 'Ask Iris about your agreements...' : 'Search agreements, or ask Iris…'}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit', minWidth: 0 }}
        />
        {value && (
          <button
            onMouseDown={e => { e.preventDefault(); setValue(''); inputRef.current?.focus(); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 99, border: 'none', background: '#e8e8ed', cursor: 'pointer', padding: 0, flexShrink: 0, marginRight: 4, transition: 'background 100ms' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#d8d8df')}
            onMouseLeave={e => (e.currentTarget.style.background = '#e8e8ed')}
            title="Clear search"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#555565" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        )}
        {/* Coupled Search + Ask Iris pill — shared outer border, labels collapse to icons on input */}
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1px solid rgba(0,0,0,0.13)',
          borderRadius: 99,
          background: 'rgba(0,0,0,0.02)',
          padding: 2, gap: 1,
          flexShrink: 0, marginLeft: 6, marginRight: 2,
        }}>
          <button
            onMouseDown={e => { e.preventDefault(); switchTo('search'); if (isSearch && value.trim()) fireSearch(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: value ? 0 : 5,
              padding: value ? '4px 7px' : '4px 10px',
              borderRadius: 99, border: 'none',
              background: isSearch ? '#fff' : 'transparent',
              boxShadow: isSearch ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              color: 'var(--ink-text-primary)',
              fontSize: 12, fontWeight: isSearch ? 600 : 400,
              transition: 'all 150ms',
            }}
          >
            <Icon name="search" size={13} color="var(--ink-text-primary)" />
            {!value && 'Search'}
          </button>
          <button
            onMouseDown={e => { e.preventDefault(); switchTo('iris'); if (isIris && value.trim()) fireIris(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: value ? 0 : 5,
              padding: value ? '4px 7px' : '4px 10px',
              borderRadius: 99, border: 'none',
              background: isIris ? '#fff' : 'transparent',
              boxShadow: isIris ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: isIris ? 600 : 400,
              transition: 'all 150ms',
            }}
          >
            <span style={{ display: 'flex', width: 13, height: 13, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><IrisIcon /></span>
            {!value && <span style={{ color: isIris ? '#4B47C8' : 'var(--ink-text-primary)' }}>Ask Iris</span>}
          </button>
        </div>
      </div>
      {/* Dropdown */}
      {showDropdown && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #d0d0d8', borderTop: '1px solid #ebebef', borderRadius: '0 0 20px 20px', boxShadow: '0 12px 32px rgba(0,0,0,0.10)', zIndex: 9999, overflow: 'hidden' }}>

          {/* ── EMPTY STATE ── */}
          {!q && <>
            {/* Saved Searches header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px 10px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 2h9v10.5l-4.5-3.15L2.5 12.5V2z" stroke="#6b6b7e" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-text-primary)' }}>Saved Searches <span style={{ fontWeight: 400, color: '#9292a0' }}>(6)</span></span>
            </div>
            <div style={{ height: 1, background: '#ebebef', margin: '0 18px' }} />
            {matchedSaved.map(s => (
              <div key={s}
                onMouseEnter={() => setHov(`sv-${s}`)} onMouseLeave={() => setHov(null)}
                onMouseDown={e => { e.preventDefault(); setValue(s); setOpen(false); inputRef.current?.focus(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', cursor: 'pointer', background: hov === `sv-${s}` ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9292a0" strokeWidth="1.3"/><path d="M7 4.5V7l2 1.5" stroke="#9292a0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-text-primary)' }}>{s}</span>
                <button onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setDismissedSaved(prev => new Set([...prev, s])); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 5, border: 'none', background: '#ebebef', cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'background 80ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#d8d8df')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#ebebef')}
                ><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#555565" strokeWidth="1.6" strokeLinecap="round"/></svg></button>
              </div>
            ))}
            <div
              onMouseDown={e => { e.preventDefault(); }}
              style={{ padding: '6px 18px 12px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-text-primary)', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 2 }}>Clear search history</span>
            </div>
            <div style={{ height: 1, background: '#ebebef', margin: '0 18px' }} />
            <div style={{ padding: '12px 18px 6px', fontSize: 11, fontWeight: 700, color: '#9292a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Get quick answers</div>
            {(['How many renewal/non-renewal notifications should I expect in the next 90 days, and who are the parties?'] as const).map((qa, i) => (
              <div key={qa}
                onMouseEnter={() => setHov(`qs-${i}`)} onMouseLeave={() => setHov(null)}
                onMouseDown={e => { e.preventDefault(); setValue(qa); setMode('iris'); onAskIris(qa); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 18px 11px', cursor: 'pointer', background: hov === `qs-${i}` ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
              >
                <span style={{ display: 'flex', width: 14, height: 14, flexShrink: 0, marginTop: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><IrisIcon /></span>
                <span style={{ fontSize: 13, color: '#5c3fd1', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 2 }}>{qa}</span>
              </div>
            ))}
            <div style={{ height: 1, background: '#ebebef', margin: '0 18px' }} />
            <div style={{ padding: '12px 18px 6px', fontSize: 11, fontWeight: 700, color: '#9292a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Documents</div>
            {EMPTY_STATE_DOCS.map(d => (
              <div key={d.name}
                onMouseEnter={() => setHov(`ds-${d.name}`)} onMouseLeave={() => setHov(null)}
                onMouseDown={e => { e.preventDefault(); setValue(d.name); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 18px', cursor: 'pointer', background: hov === `ds-${d.name}` ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
              >
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="1" width="9" height="11.5" rx="1.5" stroke="#9292a0" strokeWidth="1.3"/><path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="#9292a0" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--ink-text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: '#9292a0' }}>{d.sub}</div>
                </div>
              </div>
            ))}
          </>}

          {/* ── TYPED STATE ── */}
          {q && <>
            {matchedSaved.map(s => (
              <div key={s}
                onMouseEnter={() => setHov(`sv-${s}`)} onMouseLeave={() => setHov(null)}
                onMouseDown={e => { e.preventDefault(); setValue(s); setOpen(false); inputRef.current?.focus(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', cursor: 'pointer', background: hov === `sv-${s}` ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9292a0" strokeWidth="1.3"/><path d="M7 4.5V7l2 1.5" stroke="#9292a0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-text-primary)' }}>{boldMatch(s, q)}</span>
                <button onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setDismissedSaved(prev => new Set([...prev, s])); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 5, border: 'none', background: '#ebebef', cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'background 80ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#d8d8df')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#ebebef')}
                ><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#555565" strokeWidth="1.6" strokeLinecap="round"/></svg></button>
              </div>
            ))}
            {matchedEntities.length > 0 && <>
              <div style={{ height: 1, background: '#ebebef', margin: '4px 18px' }} />
              <div style={{ padding: '10px 18px 6px', fontSize: 11, fontWeight: 700, color: '#9292a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Filter by</div>
              {matchedEntities.map(e => (
                <div key={e.name}
                  onMouseEnter={() => setHov(`fe-${e.name}`)} onMouseLeave={() => setHov(null)}
                  onMouseDown={ev => { ev.preventDefault(); setValue(e.name); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px', cursor: 'pointer', background: hov === `fe-${e.name}` ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
                >
                  {e.type === 'Agreement Set'
                    ? <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5.5l5-3 5 3-5 3-5-3z" stroke="#9292a0" strokeWidth="1.3" strokeLinejoin="round"/><path d="M2 8.5l5 3 5-3" stroke="#9292a0" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    : <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1" stroke="#9292a0" strokeWidth="1.3"/><path d="M5 12V8h4v4" stroke="#9292a0" strokeWidth="1.3" strokeLinejoin="round"/><rect x="4" y="4" width="2" height="2" rx="0.3" stroke="#9292a0" strokeWidth="1.1"/><rect x="8" y="4" width="2" height="2" rx="0.3" stroke="#9292a0" strokeWidth="1.1"/></svg>
                  }
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--ink-text-primary)' }}>{boldMatch(e.name, q)}</div>
                    <div style={{ fontSize: 12, color: '#9292a0' }}>{e.type}</div>
                  </div>
                </div>
              ))}
            </>}
            {matchedDocs.length > 0 && <>
              <div style={{ height: 1, background: '#ebebef', margin: '4px 18px' }} />
              <div style={{ padding: '10px 18px 6px', fontSize: 11, fontWeight: 700, color: '#9292a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Suggested Searches</div>
              {matchedDocs.map(d => (
                <div key={d.name}
                  onMouseEnter={() => setHov(`dm-${d.name}`)} onMouseLeave={() => setHov(null)}
                  onMouseDown={ev => { ev.preventDefault(); setValue(d.name.replace(/\.docx?$/, '')); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 18px', cursor: 'pointer', background: hov === `dm-${d.name}` ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
                >
                  <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H5.5M11 3V8.5" stroke="#9292a0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--ink-text-primary)' }}>{boldMatch(d.name, q)}</div>
                    <div style={{ fontSize: 12, color: '#9292a0' }}>{d.sub}</div>
                  </div>
                </div>
              ))}
            </>}
            {dynamicQuickAnswers.length > 0 && <>
              <div style={{ height: 1, background: '#ebebef', margin: '4px 18px' }} />
              <div style={{ padding: '10px 18px 6px', fontSize: 11, fontWeight: 700, color: '#9292a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Get quick answers</div>
              {dynamicQuickAnswers.map((qa, i) => (
                <div key={qa}
                  onMouseEnter={() => setHov(`qa-${i}`)} onMouseLeave={() => setHov(null)}
                  onMouseDown={e => { e.preventDefault(); setValue(qa); setMode('iris'); onAskIris(qa); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 18px', cursor: 'pointer', background: hov === `qa-${i}` ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
                >
                  <span style={{ display: 'flex', width: 14, height: 14, flexShrink: 0, marginTop: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><IrisIcon /></span>
                  <span style={{ fontSize: 13, color: '#5c3fd1', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 2 }}>{boldMatch(qa, q)}</span>
                </div>
              ))}
            </>}
            <div style={{ height: 1, background: '#ebebef', margin: '4px 18px' }} />
            <div
              onMouseEnter={() => setHov('view-all')} onMouseLeave={() => setHov(null)}
              onMouseDown={e => { e.preventDefault(); fireSearch(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px 12px', cursor: 'pointer', background: hov === 'view-all' ? '#f2f2f6' : 'transparent', transition: 'background 80ms' }}
            >
              <Icon name="search" size={13} color="#9292a0" />
              <span style={{ fontSize: 13, color: 'var(--ink-text-primary)' }}>View all results for <strong>{value.trim()}</strong></span>
            </div>
          </>}

          {/* ── FOOTER: Ask Iris + Search ── */}
          <div style={{ borderTop: '1px solid #e8e8ec', padding: '10px 14px', background: '#f8f8fb', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onMouseDown={e => { e.preventDefault(); fireIris(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 99, border: '1.5px solid #d4c8f7', background: '#f3f0fd', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'background 100ms' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ebe6fa')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f3f0fd')}
            >
              <span style={{ display: 'flex', width: 13, height: 13, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><IrisIcon /></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#5c3fd1' }}>Ask Iris</span>
            </button>
            <span style={{ fontSize: 12, color: '#9292a0', flexShrink: 0 }}>Option+Enter</span>
            <div style={{ flex: 1 }} />
            <button
              onMouseDown={e => { e.preventDefault(); fireSearch(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 99, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 2px 6px rgba(37,99,235,0.22)', transition: 'opacity 100ms', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Icon name="search" size={12} color="#fff" />
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Full Screen Iris Chat
   ═══════════════════════════════════════ */

const FS_STEPS: Record<string, { label: string; sub: string }[]> = {
  fs_deep: [
    { label: 'Searching agreements', sub: 'Looking for Acme contracts' },
    { label: 'Reading documents', sub: '4 documents found' },
    { label: 'Extracting product data', sub: 'Identifying products and services' },
  ],
  fs_spend: [
    { label: 'Analyzing agreement data', sub: 'Reading all vendor agreements' },
    { label: 'Grouping by category', sub: 'Sorting vendors by spend category' },
    { label: 'Calculating totals', sub: '47 agreements analyzed' },
  ],
};

const FS_CHIP_STEPS: Record<string, { label: string; sub: string }[]> = {
  'Show me pricing and licensing terms': [
    { label: 'Reviewing pricing sections', sub: 'Reading Acme MSA and Order Forms' },
    { label: 'Extracting license terms', sub: 'Found 3 pricing tiers' },
  ],
  'Flag any price escalation clauses': [
    { label: 'Scanning for escalation clauses', sub: 'Checking all Acme agreements' },
    { label: 'Analyzing clause language', sub: '2 clauses identified' },
  ],
  'Build a pricing comparison table': [
    { label: 'Comparing pricing structures', sub: 'Analyzing across 4 agreements' },
    { label: 'Organizing extracted data', sub: 'Building comparison table' },
  ],
  'Build a spend report': [
    { label: 'Aggregating spend data', sub: 'Processing 47 vendor agreements' },
    { label: 'Preparing visualization', sub: 'Structuring report layout' },
  ],
};

function CopyCSVButton({ data }: { data: string[][] }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => {
      const csv = data.map(row => row.map(c => `"${c}"`).join(',')).join('\n');
      navigator.clipboard.writeText(csv).catch(() => {});
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-text-primary)', fontFamily: 'inherit', marginTop: 6 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="1" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 1V0.5H9V1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="3" width="8" height="10" rx="1.5" fill="white" stroke="currentColor" strokeWidth="1.3"/><path d="M3.5 6.5h5M3.5 8.5h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      {copied ? 'Copied!' : 'Copy CSV'}
    </button>
  );
}

function FsAgenticSteps({ steps, revealed, collapsed, onToggleCollapse }: { steps: { label: string; sub: string }[]; revealed: number; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const ICONS: Record<number, React.ReactNode> = {
    0: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#6B6B8A" strokeWidth="1.3"/><path d="M7 4.5v3l1.5 1" stroke="#6B6B8A" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    1: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#6B6B8A" strokeWidth="1.3"/><path d="M9.5 9.5l2.5 2.5" stroke="#6B6B8A" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    2: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke="#6B6B8A" strokeWidth="1.3"/><path d="M4 5h6M4 7h4" stroke="#6B6B8A" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    3: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11l3-3 2 2 5-5" stroke="#6B6B8A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  if (collapsed && revealed >= steps.length) {
    return (
      <button onClick={onToggleCollapse} className="fs-step-in" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 14px', fontFamily: 'inherit' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-text-secondary)', fontWeight: 500 }}>{steps.length} actions completed</span>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: 'var(--ink-text-secondary)' }}><path d="M2.5 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.slice(0, revealed).map((s, i) => (
        <div key={i} className="fs-step-in" style={{ paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ color: '#6B6B8A', flexShrink: 0 }}>{ICONS[i % 4]}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a2e' }}>{s.label}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: '#bbb', flexShrink: 0 }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ paddingLeft: 22, fontSize: 12.5, color: '#6B6B8A' }}>{s.sub}</div>
        </div>
      ))}
      {revealed < steps.length && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 2 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2].map(i => <span key={i} className="iris-thinking-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
          </div>
          <span style={{ fontSize: 12, color: '#9999aa' }}>{steps[revealed]?.label}…</span>
        </div>
      )}
    </div>
  );
}

/* shared sidebar-style chip button */
function FsChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="chip-fade-in" style={{
      display: 'flex', width: '100%', alignItems: 'center', gap: 8,
      background: '#fff', border: '1px solid var(--ink-border-color-default)',
      borderRadius: 100, padding: '8px 14px', cursor: 'pointer', fontSize: 13,
      fontFamily: 'inherit', color: 'var(--ink-text-primary)', textAlign: 'left' as const,
      maxWidth: 420, transition: 'background 0.12s, border-color 0.12s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-5, #f5f3ff)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #ddd9ff)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
    >
      <Icon name="reply" size={13} color="var(--ink-purple-100, #4B47C8)" style={{ flexShrink: 0 }} />
      {label}
    </button>
  );
}

/* IrisSparkleIcon — Iris bloom icon */
function IrisSparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.39143 3.21709C4.66395 2.31986 3.57272 1.87528 1.73785 1.50346C1.72168 1.50346 1.7136 1.50346 1.69743 1.50346C1.64085 1.50346 1.58427 1.52771 1.54385 1.57621C1.50344 1.62471 1.48727 1.68129 1.50344 1.73787C1.87526 3.57274 2.32792 4.67205 3.21706 5.39145C4.13046 4.80946 4.81753 4.1224 5.39951 3.209L5.39143 3.21709Z" fill="#CBC2FF"/>
      <path d="M10.7906 5.39146C11.6878 4.66398 12.1324 3.57275 12.5042 1.73788C12.5204 1.6813 12.5042 1.61663 12.4638 1.56813C12.4234 1.51963 12.3668 1.49538 12.3102 1.49538C12.2941 1.49538 12.286 1.49538 12.2698 1.49538C10.435 1.86721 9.33564 2.31986 8.60816 3.20901C9.19015 4.12241 9.87721 4.80947 10.7906 5.39146Z" fill="#CBC2FF"/>
      <path d="M3.21706 8.60854C2.31984 9.33602 1.87526 10.4272 1.50344 12.2621C1.48727 12.3187 1.50344 12.3834 1.54385 12.4319C1.59235 12.4884 1.6651 12.5208 1.73785 12.5046C3.57272 12.1328 4.67203 11.6801 5.39143 10.791C4.80944 9.87759 4.12238 9.19053 3.20898 8.60854H3.21706Z" fill="#CBC2FF"/>
      <path d="M8.60854 10.791C9.33602 11.6882 10.4272 12.1328 12.2621 12.5046C12.3349 12.5208 12.4076 12.4884 12.4561 12.4319C12.4965 12.3834 12.5127 12.3268 12.4965 12.2621C12.1247 10.4272 11.6721 9.32794 10.7829 8.60854C9.86951 9.19053 9.18245 9.87759 8.60046 10.791H8.60854Z" fill="#CBC2FF"/>
      <path d="M13.6197 6.45843C12.4638 6.03003 11.607 5.63395 10.9199 5.18938C10.0308 4.62356 9.38414 3.97691 8.81832 3.08776C8.38183 2.4007 7.97768 1.5358 7.54927 0.387994C7.46844 0.153583 7.25019 0.00808674 7.0077 0.00808674C6.76521 0.00808674 6.54696 0.153583 6.46613 0.387994C6.03772 1.54388 5.64165 2.4007 5.19708 3.08776C4.63126 3.97691 3.97652 4.62356 3.08738 5.18938C2.40031 5.62587 1.53541 6.03003 0.387608 6.45843C0.153197 6.53926 0.00770082 6.75751 0.00770082 7C0.00770082 7.2425 0.153197 7.46074 0.387608 7.54157C1.5435 7.9619 2.40031 8.36605 3.08738 8.81063C3.97652 9.37645 4.62317 10.0231 5.19708 10.9122C5.63357 11.6074 6.03772 12.4642 6.46613 13.612C6.55504 13.8464 6.76521 13.9919 7.0077 13.9919C7.25019 13.9919 7.46844 13.8383 7.54927 13.612C7.97768 12.4561 8.37375 11.5993 8.81832 10.9122C9.38414 10.0231 10.0308 9.37645 10.9199 8.81063C11.6151 8.37414 12.4719 7.96998 13.6197 7.54157C13.8541 7.45266 13.9996 7.2425 13.9996 7C13.9996 6.75751 13.846 6.53926 13.6197 6.45843ZM10.1116 7.08892C8.31717 7.72749 7.7271 8.31756 7.08853 10.112C7.0562 10.1928 6.93495 10.1928 6.9107 10.112C6.27213 8.31756 5.68207 7.72749 3.88761 7.08892C3.80678 7.05659 3.80678 6.93534 3.88761 6.91109C5.68207 6.27252 6.27213 5.68245 6.9107 3.88799C6.94304 3.79908 7.06428 3.79908 7.08853 3.88799C7.7271 5.68245 8.31717 6.27252 10.1116 6.91109C10.1925 6.94342 10.1925 7.06467 10.1116 7.08892Z" fill="url(#irisGradient)"/>
      <defs>
        <linearGradient id="irisGradient" x1="0.0306558" y1="7" x2="14.028" y2="7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D9155D"/>
          <stop offset="0.501049" stopColor="#A02AAC"/>
          <stop offset="1" stopColor="#4C06FF"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

type FsPhase = 'thinking' | 'answer' | 'chip-thinking' | 'chip-answered' | 'confirm-thinking' | 'confirm-answered' | 'building' | 'built';

function FullScreenIrisChat({
  flowId, query, onClose, onCollapse, onBuildWorksheet, onBuildReport, skipThinking,
}: {
  flowId: 'fs_deep' | 'fs_spend';
  query: string;
  onClose: () => void;
  onCollapse: () => void;
  onBuildWorksheet: (type: string) => void;
  onBuildReport: (measure: string, groupBy: string) => void;
  skipThinking?: boolean;
}) {
  const [animClass, setAnimClass] = useState('iris-fs-enter');
  const steps = FS_STEPS[flowId] || [];
  const [stepsRevealed, setStepsRevealed] = useState(skipThinking ? steps.length : 0);
  const [phase, setPhase] = useState<FsPhase>(skipThinking ? 'answer' : 'thinking');
  const [stepsCollapsed, setStepsCollapsed] = useState(!!skipThinking);
  const [chipStepsCollapsed, setChipStepsCollapsed] = useState(false);
  const [selectedChip, setSelectedChip] = useState('');
  const [chipStepsRevealed, setChipStepsRevealed] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  /* initial agentic steps → answer */
  useEffect(() => {
    if (skipThinking) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setStepsRevealed(i + 1), 600 + i * 850));
    });
    timers.push(setTimeout(() => { setPhase('answer'); setStepsCollapsed(true); }, 600 + steps.length * 850 + 300));
    return () => timers.forEach(clearTimeout);
  }, []);

  /* chip → chip-thinking → chip-answered */
  useEffect(() => {
    if (phase !== 'chip-thinking' || !selectedChip) return;
    const cs = FS_CHIP_STEPS[selectedChip] || [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    cs.forEach((_, i) => {
      timers.push(setTimeout(() => setChipStepsRevealed(i + 1), 400 + i * 800));
    });
    timers.push(setTimeout(() => { setPhase('chip-answered'); setChipStepsCollapsed(true); }, 400 + cs.length * 800 + 350));
    return () => timers.forEach(clearTimeout);
  }, [phase, selectedChip]);

  /* confirm-thinking → confirm-answered */
  useEffect(() => {
    if (phase !== 'confirm-thinking') return;
    const t = setTimeout(() => setPhase('confirm-answered'), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  /* building → built → fire callback */
  useEffect(() => {
    if (phase !== 'building') return;
    const t = setTimeout(() => setPhase('built'), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'built') return;
    const t = setTimeout(() => {
      if (selectedChip === 'Build a pricing comparison table' || selectedChip === 'Show me pricing and licensing terms') {
        handleExit(() => onBuildWorksheet('deep-analysis'));
      } else {
        handleExit(() => onBuildReport('Annual Contract Value', 'By Vendor Category'));
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (contentRef.current) {
      setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, 60);
    }
  }, [stepsRevealed, phase, chipStepsRevealed]);

  const handleExit = (after?: () => void) => {
    setAnimClass('iris-fs-exit');
    setTimeout(() => { onClose(); after?.(); }, 240);
  };

  const handleCollapse = () => {
    setAnimClass('iris-fs-exit');
    setTimeout(onCollapse, 240);
  };

  const handleChipClick = (chip: string) => {
    setSelectedChip(chip);
    setChipStepsRevealed(0);
    setPhase('chip-thinking');
  };

  const handleConfirm = () => setPhase('confirm-thinking');
  const handleBuild = () => setPhase('building');

  const CHIPS_DEEP = ['Show me pricing and licensing terms', 'Flag any price escalation clauses', 'Build a pricing comparison table'];
  const CHIPS_SPEND = ['Break down by sub-category', 'Show me top 5 vendors', 'Build a spend report'];
  const chips = flowId === 'fs_deep' ? CHIPS_DEEP : CHIPS_SPEND;

  const isPricingTermsPath = selectedChip === 'Show me pricing and licensing terms';
  const isFlagEscalationPath = selectedChip === 'Flag any price escalation clauses';
  const isPricingTablePath = selectedChip === 'Build a pricing comparison table';
  const isReportPath = selectedChip === 'Build a spend report';

  return (
    <div className={animClass} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', background: '#F5F3F0',
    }}>
      {/* ── Header bar ── */}
      <div style={{ height: 48, borderBottom: '1px solid var(--ink-border-color-subtle)', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, flexShrink: 0 }}>
        <IconButton icon="menu" variant="tertiary" size="small" aria-label="Menu" />
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6, padding: '4px 8px' }}>
          <IrisSparkleIcon size={15} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-text-primary)' }}>Iris</span>
          <Icon name="chevron-down" size={14} color="var(--ink-text-secondary)" />
        </button>
        <div style={{ flex: 1 }} />
        <IconButton icon="arrows-in" variant="tertiary" size="small" aria-label="Collapse to side panel" onClick={handleCollapse} />
        <IconButton icon="close" variant="tertiary" size="small" aria-label="Close" onClick={() => handleExit()} />
      </div>

      {/* Scrollable content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* User bubble */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ background: '#EEEAE5', borderRadius: '16px 4px 16px 16px', padding: '10px 16px', maxWidth: '72%', fontSize: 14, color: '#1a1a2e', fontWeight: 500, lineHeight: 1.5 }}>
              {query}
            </div>
          </div>

          {/* Iris label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <IrisSparkleIcon size={14} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
          </div>

          {/* Agentic steps */}
          <FsAgenticSteps steps={steps} revealed={stepsRevealed} collapsed={stepsCollapsed} onToggleCollapse={() => setStepsCollapsed(c => !c)} />

          {/* ── Answer area ── */}
          {phase !== 'thinking' && (
            <div className="fs-answer-in">
              {flowId === 'fs_deep' ? (
                /* ── Deep flow ── */
                <div>
                  {/* Iris answer */}
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)', marginBottom: 10 }}>
                    Across your <strong>10 Acme agreements</strong>, you purchase <strong>3 categories</strong> of products and services: <strong>Cloud storage &amp; hosting</strong> (10 agreements, volume-tiered pricing), <strong>Managed IT support</strong> (8 agreements, flat fee), and <strong>Professional services</strong> (5 agreements, time &amp; materials). Total committed spend is <strong>$225K/yr</strong>.
                  </div>
                  <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--ink-border-color-subtle)', background: 'var(--ink-neutral-fade-05, #f7f7f9)' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Products &amp; services found</span>
                    </div>
                    {[
                      { label: 'Cloud storage & hosting', count: 10, models: 'Volume-tiered' },
                      { label: 'Managed IT support', count: 8, models: 'Flat fee, volume-tiered' },
                      { label: 'Professional services', count: 5, models: 'Time & materials' },
                    ].map((cat, i) => (
                      <div key={cat.label} style={{ padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)' }}>{cat.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)' }}>{cat.models}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-text-secondary)', background: 'var(--ink-neutral-fade-10, #f1f1f4)', borderRadius: 100, padding: '2px 8px' }}>{cat.count}</span>
                      </div>
                    ))}
                  </div>

                  <CopyCSVButton data={[['Category','Agreements','Pricing models'],['Cloud storage & hosting','10','Volume-tiered'],['Managed IT support','8','Flat fee, volume-tiered'],['Professional services','5','Time & materials']]} />

                  {/* initial chips */}
                  {phase === 'answer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 14 }}>
                      {chips.map(c => <FsChip key={c} label={c} onClick={() => handleChipClick(c)} />)}
                    </div>
                  )}

                  {/* selected chip bubble */}
                  {selectedChip && phase !== 'answer' && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                        <div style={{ background: '#EEEAE5', borderRadius: '16px 4px 16px 16px', padding: '8px 14px', fontSize: 13.5, color: '#1a1a2e', fontWeight: 500 }}>{selectedChip}</div>
                      </div>
                      {/* chip agentic steps */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <IrisSparkleIcon size={14} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
                      </div>
                      <FsAgenticSteps steps={FS_CHIP_STEPS[selectedChip] || []} revealed={chipStepsRevealed} collapsed={chipStepsCollapsed} onToggleCollapse={() => setChipStepsCollapsed(c => !c)} />

                      {/* chip-answered: Iris follow-up question */}
                      {(phase === 'chip-answered' || phase === 'confirm-thinking' || phase === 'confirm-answered' || phase === 'building') && (
                        <div className="fs-answer-in">
                          {isPricingTablePath && (
                            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)', marginBottom: 12 }}>
                              Want me to build a side-by-side comparison of pricing terms across all 10 agreements?
                            </div>
                          )}
                          {isPricingTermsPath && (
                            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)', marginBottom: 12 }}>
                              To surface all pricing and licensing terms accurately, I'll need to run a structured analysis across your 10 Acme agreements. Would you like me to do that?
                            </div>
                          )}
                          {isFlagEscalationPath && phase === 'chip-answered' && (
                            <div>
                              <div style={{ fontSize: 14, color: 'var(--ink-text-primary)', marginBottom: 14, lineHeight: 1.7 }}>Found <strong>1 of 10 agreements</strong> with a price escalation clause. The rest have fixed pricing or no escalation language.</div>
                              {[
                                { doc: 'Acme Order Form (2024)', clause: 'No price cap — vendor may reprice at renewal with 30-day notice', status: 'At Risk', color: '#d97706', bg: '#fffbeb' },
                              ].map((item, i) => (
                                <div key={i} style={{ border: `1px solid ${item.color}30`, borderRadius: 10, padding: '12px 14px', marginBottom: 12, background: item.bg }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1a1a2e' }}>{item.doc}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: item.color, padding: '2px 9px', borderRadius: 99, background: `${item.color}18` }}>{item.status}</span>
                                  </div>
                                  <div style={{ fontSize: 13, color: '#4a4a5a', lineHeight: 1.6 }}>{item.clause}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* confirm chip */}
                          {(isPricingTablePath || isPricingTermsPath) && phase === 'chip-answered' && (
                            <FsChip label={isPricingTablePath ? 'Yes, build it' : 'Yes, set it up'} onClick={handleConfirm} />
                          )}

                          {/* confirm thinking */}
                          {(isPricingTablePath || isPricingTermsPath) && phase === 'confirm-thinking' && (
                            <div style={{ display: 'flex', gap: 4, paddingTop: 4 }}>
                              {[0,1,2].map(i => <span key={i} className="iris-thinking-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
                            </div>
                          )}

                          {/* worksheet proposal */}
                          {(isPricingTablePath || isPricingTermsPath) && (phase === 'confirm-answered' || phase === 'building') && (
                            <div className="fs-answer-in">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                <IrisSparkleIcon size={14} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
                              </div>
                              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)', marginBottom: 12 }}>
                                {isPricingTermsPath
                                  ? <>I'll set that up now. I'll create a worksheet titled <strong>Acme Products &amp; Pricing Breakdown</strong> that extracts each contract's service, pricing basis, unit price, and any special licensing terms. Here's what I'll pull:</>
                                  : <>I'll set that up now. I'll extract the key commercial terms from each of your 10 Acme agreements into a structured comparison worksheet. Here's what I'll pull:</>
                                }
                              </div>
                              <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>What I'll extract</div>
                                {[
                                  { label: 'Agreement name', ai: false }, { label: 'Effective date', ai: false }, { label: 'End date', ai: false }, { label: 'Total contract value', ai: false },
                                  { label: 'Service / Offering', ai: true }, { label: 'Pricing basis', ai: true }, { label: 'Unit price', ai: true }, { label: 'Discounts & special terms', ai: true },
                                ].map((col, i) => (
                                  <div key={col.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={col.ai ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-text-secondary)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-text-primary)' }}>{col.label}</span>
                                    {col.ai && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)', background: 'var(--ink-purple-05, #f5f3ff)', border: '1px solid var(--ink-purple-20, #d9d3ff)', borderRadius: 100, padding: '1px 7px' }}>AI</span>}
                                  </div>
                                ))}
                              </div>
                              {phase === 'confirm-answered' && (
                                <button onClick={handleBuild} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 4 }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#3d39b0'}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'}
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="#fff" strokeWidth="1.3"/><path d="M4 4h6M4 7h6M4 10h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                  Start analysis
                                </button>
                              )}
                              {phase === 'building' && (
                                <div className="fs-step-in" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(107,71,200,0.06)', borderRadius: 8 }}>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    {[0,1,2].map(i => <span key={i} className="iris-thinking-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
                                  </div>
                                  <span style={{ fontSize: 13, color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 500 }}>Building your worksheet…</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* ── Spend flow ── */
                <div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)', marginBottom: 14 }}>
                    Your committed spend totals <strong>$2.4M/yr</strong> across <strong>6 vendor categories</strong>. Software accounts for 58% of total spend, followed by Professional Services at 22%.
                  </div>
                  <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                    {[['Category', 'Spend', 'Agreements', 'YoY'],
                      ['Software', '$1.39M', '18', '+12%'],
                      ['Professional Services', '$528K', '9', '+4%'],
                      ['Infrastructure', '$264K', '7', '−2%'],
                      ['Legal & Compliance', '$144K', '6', '+8%'],
                      ['Marketing Tools', '$72K', '5', '+19%'],
                      ['Other', '$48K', '2', '—'],
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr', padding: '9px 14px', borderBottom: i < 6 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: i === 0 ? 'var(--ink-neutral-fade-05, #f7f7f9)' : 'white', fontSize: i === 0 ? 11.5 : 13, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--ink-text-secondary)' : 'var(--ink-text-primary)' }}>
                        {row.map((cell, j) => <span key={j} style={{ color: j === 3 && i > 0 ? (cell.startsWith('+') ? '#1a7a4a' : cell.startsWith('−') ? '#d97706' : 'var(--ink-text-secondary)') : undefined, fontWeight: j === 3 && i > 0 && cell !== '—' ? 600 : undefined }}>{cell}</span>)}
                      </div>
                    ))}
                  </div>

                  <CopyCSVButton data={[['Category','Spend','Agreements','YoY'],['Software','$1.39M','18','+12%'],['Professional Services','$528K','9','+4%'],['Infrastructure','$264K','7','−2%'],['Legal & Compliance','$144K','6','+8%'],['Marketing Tools','$72K','5','+19%'],['Other','$48K','2','—']]} />

                  {phase === 'answer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 14 }}>
                      {chips.map(c => <FsChip key={c} label={c} onClick={() => handleChipClick(c)} />)}
                    </div>
                  )}

                  {selectedChip && phase !== 'answer' && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                        <div style={{ background: '#EEEAE5', borderRadius: '16px 4px 16px 16px', padding: '8px 14px', fontSize: 13.5, color: '#1a1a2e', fontWeight: 500 }}>{selectedChip}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <IrisSparkleIcon size={14} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
                      </div>
                      <FsAgenticSteps steps={FS_CHIP_STEPS[selectedChip] || []} revealed={chipStepsRevealed} collapsed={chipStepsCollapsed} onToggleCollapse={() => setChipStepsCollapsed(c => !c)} />

                      {(phase === 'chip-answered' || phase === 'confirm-thinking' || phase === 'confirm-answered' || phase === 'building') && (
                        <div className="fs-answer-in">
                          {!isReportPath && (
                            <div>
                              {selectedChip === 'Break down by sub-category' && (
                                <div>
                                  <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
                                    {[['Sub-category', 'Spend'], ['SaaS Applications', '$840K'], ['Dev Tools', '$310K'], ['Security', '$240K']].map((row, i) => (
                                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', padding: '8px 14px', borderBottom: i < 3 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: i === 0 ? 'var(--ink-neutral-fade-05)' : 'white', fontSize: i === 0 ? 11.5 : 13, fontWeight: i === 0 ? 700 : 400 }}>
                                        {row.map((c, j) => <span key={j}>{c}</span>)}
                                      </div>
                                    ))}
                                  </div>
                                  <CopyCSVButton data={[['Sub-category','Spend'],['SaaS Applications','$840K'],['Dev Tools','$310K'],['Security','$240K']]} />
                                </div>
                              )}
                              {selectedChip === 'Show me top 5 vendors' && (
                                <div>
                                  <div style={{ border: '1px solid var(--ink-border-color-subtle)', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
                                    {[['Vendor', 'Spend', 'Category'], ['Acme Corp', '$225K', 'Software'], ['Fontara', '$190K', 'Prof. Services'], ['Veridian', '$148K', 'Infrastructure'], ['Nexum', '$112K', 'Software'], ['Praxis Legal', '$98K', 'Legal']].map((row, i) => (
                                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '8px 14px', borderBottom: i < 5 ? '1px solid var(--ink-border-color-subtle)' : 'none', background: i === 0 ? 'var(--ink-neutral-fade-05)' : 'white', fontSize: i === 0 ? 11.5 : 13, fontWeight: i === 0 ? 700 : 400 }}>
                                        {row.map((c, j) => <span key={j}>{c}</span>)}
                                      </div>
                                    ))}
                                  </div>
                                  <CopyCSVButton data={[['Vendor','Spend','Category'],['Acme Corp','$225K','Software'],['Fontara','$190K','Prof. Services'],['Veridian','$148K','Infrastructure'],['Nexum','$112K','Software'],['Praxis Legal','$98K','Legal']]} />
                                </div>
                              )}
                            </div>
                          )}

                          {isReportPath && (phase === 'chip-answered') && (
                            <div>
                              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)', marginBottom: 12 }}>
                                I'll set that up now. I'll generate a report showing <strong>committed spend by vendor category</strong> across all 47 agreements, including YoY trends and renewal risk flags. Here's what I'll include:
                              </div>
                              <div style={{ background: 'var(--ink-neutral-fade-03, #fafafa)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-text-secondary)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Report sections</div>
                                {[
                                  { label: 'Spend by vendor category', ai: false },
                                  { label: 'Top vendors by total value', ai: false },
                                  { label: 'YoY trend analysis', ai: true },
                                  { label: 'Renewal risk flags', ai: true },
                                  { label: 'Auto-renewal exposure', ai: true },
                                ].map((col, i) => (
                                  <div key={col.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: i > 0 ? '1px solid var(--ink-border-color-subtle)' : 'none' }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={col.ai ? 'var(--ink-purple-100, #4B47C8)' : 'var(--ink-text-secondary)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-text-primary)' }}>{col.label}</span>
                                    {col.ai && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)', background: 'var(--ink-purple-05, #f5f3ff)', border: '1px solid var(--ink-purple-20, #d9d3ff)', borderRadius: 100, padding: '1px 7px' }}>AI</span>}
                                  </div>
                                ))}
                              </div>
                              <FsChip label="Build this report" onClick={handleConfirm} />
                            </div>
                          )}

                          {isReportPath && phase === 'confirm-thinking' && (
                            <div style={{ display: 'flex', gap: 4, paddingTop: 4 }}>
                              {[0,1,2].map(i => <span key={i} className="iris-thinking-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
                            </div>
                          )}

                          {isReportPath && (phase === 'confirm-answered' || phase === 'building') && (
                            <div className="fs-answer-in">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                <IrisSparkleIcon size={14} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
                              </div>
                              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)', marginBottom: 12 }}>
                                Generating your spend report now. This will open in <strong>Report Builder</strong> with your data pre-loaded.
                              </div>
                              {phase === 'confirm-answered' && (
                                <button onClick={handleBuild} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#3d39b0'}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'}
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l4-4 2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Build my report
                                </button>
                              )}
                              {phase === 'building' && (
                                <div className="fs-step-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(107,71,200,0.06)', borderRadius: 8 }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      {[0,1,2].map(i => <span key={i} className="iris-thinking-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
                                    </div>
                                    <span style={{ fontSize: 13, color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 500 }}>Generating report…</span>
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)' }}>Loading Report Builder with your spend data…</div>
                                </div>
                              )}
                              {phase === 'built' && (
                                <div className="fs-step-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--ink-green-10, #f3faf4)', border: '1px solid var(--ink-green-30, #b2f2bb)', borderRadius: 8 }}>
                                    <Icon name="status-check" size={14} color="var(--ink-green-80, #2f9e44)" />
                                    <span style={{ fontSize: 13, color: 'var(--ink-green-80, #2f9e44)', fontWeight: 500 }}>Report ready — 6 categories, $2.4M total spend</span>
                                  </div>
                                  <div style={{ fontSize: 13, color: 'var(--ink-text-secondary)', lineHeight: 1.6 }}>Opening Report Builder with your data…</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Input bar — matches sidebar style ── */}
      <div style={{ padding: '10px 24px 8px', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', border: '1px solid var(--ink-border-color-default)', borderRadius: 14, padding: '12px 12px 10px', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, color: 'var(--ink-text-tertiary, #9999aa)', marginBottom: 10, padding: '0 4px' }}>Ask a follow-up…</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ width: 28, height: 28, border: '1px solid var(--ink-border-color-subtle)', borderRadius: 6, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-text-secondary)', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
            <div style={{ flex: 1 }} />
            <button style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(75,71,200,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'default' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 11V3M3 7l4-4 4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '0 0 10px', fontSize: 11, color: 'var(--ink-text-tertiary, #9999aa)' }}>
        Responses are generated with AI and should not be used as legal advice.{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn how we use AI at Docusign.</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Spend AI Overview Preview (Show More)
   ═══════════════════════════════════════ */
function SpendAIPreview({ onShowMore }: { onShowMore: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [exiting, setExiting] = useState(false);

  const handleLaunchFS = () => {
    setExiting(true);
    setTimeout(onShowMore, 200);
  };

  const suggestionChips = [
    'Break down Software spend by vendor',
    'Which categories grew the most?',
    'Show top 5 vendors by total spend',
    'Compare to prior year',
  ];

  const rows = [
    ['Software', '$1.39M', '18', '+12%'],
    ['Professional Services', '$528K', '9', '+4%'],
    ['Infrastructure', '$264K', '7', '−2%'],
    ['Legal & Compliance', '$144K', '6', '+8%'],
    ['Marketing Tools', '$72K', '5', '+19%'],
    ['Other', '$48K', '2', '—'],
  ];

  return (
    <div className={exiting ? 'spend-preview-out' : 'spend-preview-in'} style={{
      background: 'white', border: '1.5px solid var(--ink-border-color-subtle)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 12,
    }}>
      <div style={{ padding: '16px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IrisSparkleIcon size={16} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-purple-100, #4B47C8)' }}>Iris</span>
          <span style={{ fontSize: 12, color: 'var(--ink-text-secondary)' }}>· Vendor Spend · 6 categories</span>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-primary)' }}>
          Your committed spend totals <strong>$2.4M/yr</strong> across <strong>6 vendor categories</strong>. Software accounts for 58% of total spend, followed by Professional Services at 22%.
        </p>

        {/* Table with fade mask when collapsed */}
        <div style={{ position: 'relative', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr', padding: '7px 12px', background: 'var(--ink-neutral-fade-05)', borderBottom: '1px solid var(--ink-border-color-subtle)', fontSize: 11, fontWeight: 700, color: 'var(--ink-text-secondary)' }}>
            {['Category', 'Spend', 'Agreements', 'YoY'].map(h => <span key={h}>{h}</span>)}
          </div>
          {/* Rows — show 3 when collapsed, all when expanded */}
          {(expanded ? rows : rows.slice(0, 3)).map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr', padding: '8px 12px', borderBottom: i < (expanded ? rows.length - 1 : 2) ? '1px solid var(--ink-border-color-subtle)' : 'none', fontSize: 13, background: '#fff' }}>
              {row.map((cell, j) => (
                <span key={j} style={{ color: j === 3 ? (cell.startsWith('+') ? '#16a34a' : cell.startsWith('−') ? '#d97706' : 'var(--ink-text-secondary)') : 'var(--ink-text-primary)', fontWeight: j === 3 && cell !== '—' ? 600 : 400 }}>{cell}</span>
              ))}
            </div>
          ))}
          {/* Blur fade when collapsed */}
          {!expanded && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: 'linear-gradient(to bottom, transparent, white)', pointerEvents: 'none' }} />
          )}
        </div>
      </div>

      {/* Show more / chat area */}
      {!expanded ? (
        <button onClick={() => setExpanded(true)} style={{
          display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px 0', border: 'none', borderTop: '1px solid var(--ink-border-color-subtle)',
          background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
          color: 'var(--ink-text-primary)', fontFamily: 'inherit', transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          Show more
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : (
        <div style={{ borderTop: '1px solid var(--ink-border-color-subtle)', padding: '10px 16px 14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 10 }}>
            {suggestionChips.map(chip => (
              <button
                key={chip}
                onClick={handleLaunchFS}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid var(--ink-border-color-default)', borderRadius: 100, background: '#fff', fontSize: 12.5, color: 'var(--ink-text-primary)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-purple-30, #d9d3ff)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-border-color-default)'; }}
              >
                <Icon name="reply" size={12} color="var(--ink-purple-100, #4B47C8)" />
                {chip}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-neutral-fade-05)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 100, padding: '5px 5px 5px 16px' }}>
            <input
              autoFocus
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLaunchFS(); }}
              placeholder="Ask about your spend..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--ink-text-primary)', fontFamily: 'inherit' }}
            />
            <button
              onClick={handleLaunchFS}
              style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <Icon name="arrow-up" size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [showWIPModal, setShowWIPModal] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromHash);
  const [sidebarView, setSidebarView] = useState<SidebarView>('completed');
  const [templatesSidebarView, setTemplatesSidebarView] = useState<TemplatesSidebarView>('my-templates');
  const [insightsSidebarView, setInsightsSidebarView] = useState<InsightsSidebarView>('overview');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [showIrisSidebar, setShowIrisSidebar] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showWorksheetModal, setShowWorksheetModal] = useState(false);
  const [showWorksheetView, setShowWorksheetView] = useState(false);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [reportConfig, setReportConfig] = useState<{ measure: string; groupBy: string }>({ measure: 'Annual Contract Value', groupBy: 'Vendor Category' });
  const [worksheetType, setWorksheetType] = useState<string>('renewals');
  const [worksheetLoading, setWorksheetLoading] = useState(false);
  const [showStartWorksheetModal, setShowStartWorksheetModal] = useState(false);
  const [startWorksheetQuery, setStartWorksheetQuery] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const handleBuildWorksheet = useCallback((type: string) => {
    setWorksheetType(type);
    setWorksheetLoading(true);
    if (type === 'vendor-exposure-acme' || type === 'renewal-scan' || type === 'auto-renew-risk' || type === 'deep-analysis' || type === 'termination-audit') {
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
  const [irisFlowId, setIrisFlowId] = useState<string | undefined>();
  const [irisKey, setIrisKey] = useState(0);
  const [deepAnalysisKey, setDeepAnalysisKey] = useState(0);
  const handleDeepAnalysisCTA = useCallback(() => {
    setIrisFollowUp(undefined);
    setIrisFlowId('sq_deep');
    setShowIrisSidebar(true);
  }, []);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const suggestionsHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [showAgreementDetail, setShowAgreementDetail] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [viewMode, setViewMode] = useState<'side-panel' | 'unified-search'>('side-panel');
  const [showFsIris, setShowFsIris] = useState(false);
  const [fsFlowId, setFsFlowId] = useState<'fs_deep' | 'fs_spend' | undefined>(undefined);
  const [fsQuery, setFsQuery] = useState('');
  const [showSpendPreview, setShowSpendPreview] = useState(false);
  const [sidebarSkipThinking, setSidebarSkipThinking] = useState(false);
  const [fsSkipThinking, setFsSkipThinking] = useState(false);

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

  const handleReset = useCallback(() => {
    window.location.hash = 'agreements';
    setActiveTab('agreements');
    setSidebarView('completed');
    setSearch('');
    setSubmittedSearch('');
    setSelectedQueryId('');
    setShowIrisSidebar(false);
    setIrisFollowUp(undefined);
    setIrisFlowId(undefined);
    setShowWorksheetView(false);
    setShowWorksheetModal(false);
    setShowReportBuilder(false);
    setShowAgreementDetail(false);
    setShowFsIris(false);
    setShowSpendPreview(false);
    setShowStartWorksheetModal(false);
    setSidebarSkipThinking(false);
    setDeepAnalysisKey(k => k + 1);
    setViewMode('side-panel');
    setShowWIPModal(false);
  }, []);

  /* ── GlobalNav — matches production DocuSign ── */
  const globalNavConfig = {
    logo: <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}><img src="/docusign-logo.svg" alt="DocuSign" /></button>,
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
    user: { name: 'Casey Hudetz' },
    extraActions: <ViewModeToggle mode={viewMode} onChange={(m) => { setViewMode(m); if (m === 'unified-search' || activeTab === 'search-bar') handleTabClick('agreements'); setSidebarView('completed'); }} searchBarActive={activeTab === 'search-bar'} onSearchBarClick={() => handleTabClick('search-bar')} />,
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
          { id: 'd2', name: 'Contractor NDA - Pending Review', recipient: 'To: Casey Hudetz', status: 'Draft', statusIcon: 'clock' as const, statusKind: 'neutral' as const, date: '30/3/2026', time: '14:30', action: 'Edit' as const },
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
          { id: 'del1', name: 'Old NDA - Expired', recipient: 'To: Casey Hudetz', status: 'Voided', statusIcon: 'status-void' as const, statusKind: 'neutral' as const, statusSub: 'Deleted', date: '15/3/2026', time: '08:30', action: 'Copy' as const },
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
    if (selectedQueryId === 'sq_deep') return NAVIGATOR_ACME;
    const q = submittedSearch.toLowerCase();
    if (q.trim() === 'fontara' || q.includes('fontara')) return NAVIGATOR_FONTARA;
    if (q.includes('sla') || q.includes('uptime') || q.includes('service level') || q.includes('service credit') || q.includes('claim window') || q.includes('remedy')) return NAVIGATOR_SLA;
    if (q.includes('pricing cap') || q.includes('price raise') || q.includes('expiring in 6') || (q.includes('expir') && (q.includes('cap') || q.includes('selling') || q.includes('price') || q.includes('raise')))) return NAVIGATOR_PRICE_RAISE;
    if (q.includes('acme') || q.includes('exposure') || q.includes('total spend') || q.includes('benchmark')) return NAVIGATOR_ACME;
    if (q.includes('auto-renew') || q.includes('auto renew') || q.includes('risk of auto')) return NAVIGATOR_AUTORENEW;
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
  }, [submittedSearch, selectedQueryId]);

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
        return TEMPLATES_DATA.filter(t => t.owner === 'Casey Hudetz');
      case 'shared-with-me':
        return TEMPLATES_DATA.filter(t => t.shared && t.owner !== 'Casey Hudetz');
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
      banner={isNavigatorView && !bannerDismissed ? (
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--ink-message-bg-color-subtle)', minHeight: 52, padding: '0 8px', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 14, color: 'var(--ink-font-color-default)' }}>Stay ahead of your renewals</span>
          <Button kind="tertiary" size="small" menuTrigger onClick={() => {}}>Show Insights</Button>
          <IconButton icon="close" variant="tertiary" size="small" onClick={() => setBannerDismissed(true)} aria-label="Close" />
        </div>
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
                {/* + button with dropdown */}
                <div style={{ position: 'relative' }}>
                  <div onClick={() => { setShowAddDropdown(v => !v); setShowSettingsDropdown(false); }} style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--ink-border-color-default)', borderRadius: 'var(--ink-radius-sm)', height: '32px', background: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="plus" size={16} color="var(--ink-text-primary)" />
                    </div>
                    <div style={{ width: 1, height: 16, background: 'var(--ink-border-color-default)' }} />
                    <div style={{ width: 24, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                    </div>
                  </div>
                  {showAddDropdown && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 9999, width: 280, overflow: 'hidden' }}
                      onMouseLeave={() => setShowAddDropdown(false)}>
                      <div style={{ padding: '10px 14px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ink-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add documents to Completed</div>
                      {[
                        { icon: 'upload', label: 'Upload', sub: 'From your device or installed', badge: false },
                        { icon: 'arrow-right', label: 'Import from Email', sub: 'Send attachments into Agreement Manager', badge: true },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', background: '#fff' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                          onClick={() => setShowAddDropdown(false)}>
                          <div style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--ink-border-color-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name={item.icon as any} size={15} color="var(--ink-text-primary)" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {item.label}
                              {item.badge && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--ink-purple-10, #f0eeff)', color: 'var(--ink-purple-100, #4B47C8)', border: '1px solid var(--ink-purple-20, #d8d5f7)', borderRadius: 4, padding: '1px 5px' }}>New</span>}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginTop: 1 }}>{item.sub}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ margin: '6px 0', borderTop: '1px solid var(--ink-border-color-subtle)' }} />
                      <div style={{ padding: '4px 14px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ink-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add data from external sources</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px 12px', cursor: 'pointer', background: '#fff' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                        onClick={() => setShowAddDropdown(false)}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--ink-border-color-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name="arrow-right" size={15} color="var(--ink-text-primary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            Import Data
                            <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--ink-purple-10, #f0eeff)', color: 'var(--ink-purple-100, #4B47C8)', border: '1px solid var(--ink-purple-20, #d8d5f7)', borderRadius: 4, padding: '1px 5px' }}>New</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginTop: 1 }}>Edit data with a spreadsheet</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Settings button with dropdown */}
                <div style={{ position: 'relative' }}>
                  <div onClick={() => { setShowSettingsDropdown(v => !v); setShowAddDropdown(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 10px', border: '1px solid var(--ink-border-color-default)', borderRadius: 'var(--ink-radius-sm)', height: '32px', background: '#fff', cursor: 'pointer', userSelect: 'none' as const }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="settings" size={16} color="var(--ink-text-primary)" />
                      <div style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: '#e03131', border: '1.5px solid #fff' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)', lineHeight: 1 }}>Manage</span>
                    <Icon name="chevron-down" size={12} color="var(--ink-text-secondary)" />
                  </div>
                  {showSettingsDropdown && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 9999, width: 260, overflow: 'hidden' }}
                      onMouseLeave={() => setShowSettingsDropdown(false)}>
                      <div style={{ padding: '10px 14px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ink-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Manage agreement data</div>
                      {[
                        { icon: 'document', label: 'Fields', sub: 'Track data inside your agreements' },
                        { icon: 'list', label: 'Agreement Types', sub: 'Categorize and structure agreements' },
                        { icon: 'users', label: 'Parties', sub: 'Maintain business relationships' },
                        { icon: 'flag', label: 'Obligations', sub: 'Sort and label common tasks' },
                        { icon: 'layers', label: 'Sets', sub: 'Filter and share related agreements' },
                        { icon: 'git-branch', label: 'Rules', sub: 'Stay organized with if/then logic' },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', cursor: 'pointer', background: '#fff' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                          onClick={() => setShowSettingsDropdown(false)}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--ink-border-color-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name={item.icon as any} size={14} color="var(--ink-text-secondary)" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-text-primary)' }}>{item.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-text-secondary)', marginTop: 1 }}>{item.sub}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ margin: '6px 0', borderTop: '1px solid var(--ink-border-color-subtle)' }} />
                      {[
                        { icon: 'refresh', label: 'Uploads and Processing Status' },
                        { icon: 'copy', label: 'Review Duplicate Files' },
                        { icon: 'clock', label: 'View Activity Log' },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', background: '#fff' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-neutral-fade-05)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                          onClick={() => setShowSettingsDropdown(false)}>
                          <Icon name={item.icon as any} size={15} color="var(--ink-text-secondary)" />
                          <div style={{ fontSize: 13, color: 'var(--ink-text-primary)' }}>{item.label}</div>
                        </div>
                      ))}
                      <div style={{ height: 4 }} />
                    </div>
                  )}
                </div>
              </>)
            : <Button kind="secondary" menuTrigger>Shared Access</Button>
          }
        />
      }
      filterBar={
        isNavigatorView && viewMode === 'unified-search' ? (
          /* ── AI Search bar (unified mode) — full row ── */
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Left group: search pill + saved searches + filters — flush together */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ position: 'relative', width: 560 }}>
                <UnifiedSearchBar
                  onSearch={(query) => {
                    setSearch(query);
                    setSubmittedSearch(query);
                    setSidebarView('completed');
                  }}
                  onAskIris={(query) => {
                    setSearch(query);
                    setIrisFollowUp(query);
                    setIrisFlowId('sq_deep');
                    setIrisKey(k => k + 1);
                    setShowIrisSidebar(true);
                    setSidebarView('completed');
                  }}
                />
              </div>
              <IconButton icon="bookmark" variant="secondary" size="small" aria-label="Saved questions" />
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>Filters</Button>
                {submittedSearch && (
                  <span style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', lineHeight: 1 }}>1</span>
                )}
              </div>
            </div>
            {/* Right group: worksheets + ask iris */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <Button kind="secondary" size="small" startElement={<Icon name="layout-grid" size={14} />}>Worksheets</Button>
              <button
                onClick={() => { setIrisKey(k => k + 1); setIrisFollowUp(undefined); setIrisFlowId(undefined); setShowIrisSidebar(true); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px 5px 10px', border: 'none', borderRadius: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, height: 32 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M13.6197 6.45843C12.4638 6.03003 11.607 5.63395 10.9199 5.18938C10.0308 4.62356 9.38414 3.97691 8.81832 3.08776C8.38183 2.4007 7.97768 1.5358 7.54927 0.387994C7.46844 0.153583 7.25019 0.00808674 7.0077 0.00808674C6.76521 0.00808674 6.54696 0.153583 6.46613 0.387994C6.03772 1.54388 5.64165 2.4007 5.19708 3.08776C4.63126 3.97691 3.97652 4.62356 3.08738 5.18938C2.40031 5.62587 1.53541 6.03003 0.387608 6.45843C0.153197 6.53926 0.00770082 6.75751 0.00770082 7C0.00770082 7.2425 0.153197 7.46074 0.387608 7.54157C1.5435 7.9619 2.40031 8.36605 3.08738 8.81063C3.97652 9.37645 4.62317 10.0231 5.19708 10.9122C5.63357 11.6074 6.03772 12.4642 6.46613 13.612C6.55504 13.8464 6.76521 13.9919 7.0077 13.9919C7.25019 13.9919 7.46844 13.8383 7.54927 13.612C7.97768 12.4561 8.37375 11.5993 8.81832 10.9122C9.38414 10.0231 10.0308 9.37645 10.9199 8.81063C11.6151 8.37414 12.4719 7.96998 13.6197 7.54157C13.8541 7.45266 13.9996 7.2425 13.9996 7C13.9996 6.75751 13.846 6.53926 13.6197 6.45843Z" fill="white"/>
                </svg>
                Ask Iris
              </button>
            </div>
          </div>
        ) : (
        <div
          style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}
        >
          <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}
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
              onSubmit: isNavigatorView ? () => {
                const sq = search.toLowerCase().trim();
                if ((sq.includes('6 month') || sq.includes('six month')) && (sq.includes('expir') || sq.includes('renew') || sq.includes('vendor'))) setSelectedQueryId('sq3');
                else setSelectedQueryId('');
                setSubmittedSearch(search);
                setShowSuggestions(false);
              } : undefined,
              placeholder: isNavigatorView
                ? 'Try "which agreements expire in 90 days"'
                : isPartiesView ? 'Search parties...'
                : isRequestsView ? 'Search Request Titles or IDs...'
                : 'Search Envelopes',
            }}
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
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Button kind="secondary" size="small" startElement={<Icon name="filter" size={14} />}>Filters</Button>
                {submittedSearch && (
                  <span style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', lineHeight: 1 }}>1</span>
                )}
              </div>
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
              <SuggestionsDropdown
                filterIds={undefined}
                onSelect={(q, id) => {
                setSearch(q);
                setShowSuggestions(false);
                setSubmittedSearch(q);
                setSelectedQueryId(id);
              }} />
            </div>
          )}
          </div>
          {/* Worksheets + Ask Iris — pushed to far right */}
          {isNavigatorView && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Button kind="secondary" size="small" startElement={<Icon name="layout-grid" size={14} />}>Worksheets</Button>
              <button
                onClick={() => { setIrisKey(k => k + 1); setIrisFollowUp(undefined); setIrisFlowId(undefined); setShowIrisSidebar(true); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px 5px 10px', border: 'none', borderRadius: 6, background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, height: 32 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M13.6197 6.45843C12.4638 6.03003 11.607 5.63395 10.9199 5.18938C10.0308 4.62356 9.38414 3.97691 8.81832 3.08776C8.38183 2.4007 7.97768 1.5358 7.54927 0.387994C7.46844 0.153583 7.25019 0.00808674 7.0077 0.00808674C6.76521 0.00808674 6.54696 0.153583 6.46613 0.387994C6.03772 1.54388 5.64165 2.4007 5.19708 3.08776C4.63126 3.97691 3.97652 4.62356 3.08738 5.18938C2.40031 5.62587 1.53541 6.03003 0.387608 6.45843C0.153197 6.53926 0.00770082 6.75751 0.00770082 7C0.00770082 7.2425 0.153197 7.46074 0.387608 7.54157C1.5435 7.9619 2.40031 8.36605 3.08738 8.81063C3.97652 9.37645 4.62317 10.0231 5.19708 10.9122C5.63357 11.6074 6.03772 12.4642 6.46613 13.612C6.55504 13.8464 6.76521 13.9919 7.0077 13.9919C7.25019 13.9919 7.46844 13.8383 7.54927 13.612C7.97768 12.4561 8.37375 11.5993 8.81832 10.9122C9.38414 10.0231 10.0308 9.37645 10.9199 8.81063C11.6151 8.37414 12.4719 7.96998 13.6197 7.54157C13.8541 7.45266 13.9996 7.2425 13.9996 7C13.9996 6.75751 13.846 6.53926 13.6197 6.45843Z" fill="white"/>
                </svg>
                Ask Iris
              </button>
            </div>
          )}
        </div>
        )
      }
    >
      {isPartiesView ? (
        <DataTable columns={partyColumns} data={filteredParties} getRowKey={(row) => row.id} stickyHeader showColumnControl emptyMessage="No parties match your search" pagination={{ page: 1, pageSize: 25, totalItems: 1334, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }} />
      ) : isRequestsView ? (
        <DataTable columns={requestColumns} data={filteredRequests} getRowKey={(row) => row.id} stickyHeader showColumnControl rowHeight="tall" emptyMessage="No requests found" pagination={{ page: 1, pageSize: 10, totalItems: filteredRequests.length, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }} />
      ) : isNavigatorView ? (
        <>
          {submittedSearch && selectedQueryId === 'sq_deep' && viewMode === 'side-panel' && (
            <AcmeDeepBlock
              onFollowUp={(msg) => { setIrisFollowUp(msg); setIrisFlowId('sq_deep'); setIrisKey(k => k + 1); setShowIrisSidebar(true); }}
              onStartWorksheet={(query) => { setStartWorksheetQuery(query); setShowStartWorksheetModal(true); }}
            />
          )}
          {submittedSearch && selectedQueryId === 'sq_spend' && viewMode === 'side-panel' && (
            <SpendAnswerBlock sidebarOpen={showIrisSidebar} onFollowUp={(msg) => { setIrisFollowUp(msg); setIrisFlowId('sq_spend'); setShowIrisSidebar(true); }} />
          )}
          {submittedSearch && selectedQueryId === 'sq_updates' && (
            <AcmeUpdatesBlock sidebarOpen={showIrisSidebar} onFollowUp={(msg) => { setIrisFollowUp(msg || undefined); setIrisFlowId('sq_updates'); setShowIrisSidebar(true); }} />
          )}
          {submittedSearch && selectedQueryId === 'sq_renewal' && (
            <RenewalAnswerBlock onFollowUp={(msg) => { setIrisFollowUp(msg); setIrisFlowId('sq_renewal'); setShowIrisSidebar(true); }} />
          )}
          <DataTable columns={navigatorColumns} data={filteredNavigator} getRowKey={(row) => row.id} selectable stickyHeader showColumnControl rowHeight="tall" emptyMessage="No completed documents" onRowClick={() => setShowAgreementDetail(true)} pagination={{ page: 1, pageSize: 25, totalItems: submittedSearch ? (selectedQueryId === 'sq3' ? 42 : selectedQueryId === 'sq_spend' ? 47 : filteredNavigator.length) : 23505, onPageChange: () => {}, onPageSizeChange: () => {}, showInfo: true }} />
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
    'search-bar': undefined,
  };

  const contentMap: Record<TabId, JSX.Element> = {
    home: <HomePage />,
    agreements: agreementsContent,
    templates: templatesContent,
    insights: insightsContent,
    admin: <AdminPage />,
    'search-bar': <SearchBarLabPage />,
  };

  /* ── Transition key — changes on tab OR sidebar view to trigger animation ── */
  const transitionKey = `${activeTab}-${sidebarView}-${templatesSidebarView}-${insightsSidebarView}`;

  return (
    <>
    <style>{tableRowStaggerStyles}</style>
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto', transition: 'flex 460ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
        <DocuSignShell
          globalNav={globalNavConfig}
          localNav={showIrisSidebar
            ? { ...agreementsSidebar, isLocked: false }
            : sidebarMap[activeTab]}
        >
          <FadeIn keyProp={transitionKey + (showReportBuilder ? '-rb' : showWorksheetView ? '-ws' : '')} key={transitionKey + (showReportBuilder ? '-rb' : showWorksheetView ? '-ws' : '')}>
            <div className="page-transition" style={{ flex: 1 }}>
              {showReportBuilder
                ? <ReportBuilderView
                    onBack={() => { setShowReportBuilder(false); setShowIrisSidebar(false); setActiveTab('agreements'); }}
                    onSave={() => { setShowReportBuilder(false); }}
                    measure={reportConfig.measure}
                    aggregation={reportConfig.measure === 'Number of contracts' ? 'Count' : reportConfig.measure === 'Average deal size' ? 'Average' : 'Sum'}
                    groupBy={reportConfig.groupBy.replace('By ', '').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  />
                : showWorksheetView
                ? <WorksheetView onBack={() => { setShowWorksheetView(false); }} worksheetType={worksheetType} />
                : contentMap[activeTab]}
            </div>
          </FadeIn>
          <Footer />
        </DocuSignShell>
      </div>
      {showIrisSidebar && (
        <IrisSidebar
          key={irisFlowId ?? `blank-${irisKey}`}
          question={irisFlowId ? submittedSearch : ''}
          followUp={irisFollowUp}
          onClose={() => { setShowIrisSidebar(false); setIrisFollowUp(undefined); setIrisFlowId(undefined); setShowWorksheetView(false); setShowReportBuilder(false); setSidebarSkipThinking(false); }}
          onBuildWorksheet={handleBuildWorksheet}
          onBuildReport={(measure, groupBy) => {
            const measureMap: Record<string, string> = {
              'Contract value': 'Annual Contract Value',
              'Number of contracts': 'Contract Count',
              'Average deal size': 'Annual Contract Value',
            };
            const gbClean = (groupBy || 'By vendor category').replace('By ', '').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            setReportConfig({ measure: measureMap[measure] || measure, groupBy: gbClean });
            setActiveTab('insights');
            setInsightsSidebarView('reports');
            setReportLoading(true);
            setTimeout(() => {
              setReportLoading(false);
              setShowReportBuilder(true);
            }, 8000);
          }}
          worksheetMode={showWorksheetView}
          flowId={irisFlowId}
          skipThinking={sidebarSkipThinking}
          onOpenWorksheetEntry={(query) => { setStartWorksheetQuery(query); setShowStartWorksheetModal(true); }}
        />
      )}
    </div>
    {showStartWorksheetModal && (
      <StartWorksheetModal
        prefillQuery={startWorksheetQuery}
        onClose={() => setShowStartWorksheetModal(false)}
        onGenerate={() => { setShowStartWorksheetModal(false); setIrisFlowId('ws_complete'); setIrisFollowUp(startWorksheetQuery); handleBuildWorksheet('deep-analysis'); }}
      />
    )}
    {showAgreementDetail && (
      <AgreementDetailView onClose={() => setShowAgreementDetail(false)} />
    )}
    {showFsIris && fsFlowId && (
      <FullScreenIrisChat
        key={fsQuery}
        flowId={fsFlowId}
        query={fsQuery}
        skipThinking={fsSkipThinking}
        onClose={() => { setShowFsIris(false); setFsSkipThinking(false); if (fsFlowId === 'fs_deep') { setSubmittedSearch(fsQuery); setSelectedQueryId('sq_deep'); } }}
        onCollapse={() => {
          setShowFsIris(false);
          setFsSkipThinking(false);
          setIrisFlowId(fsFlowId === 'fs_deep' ? 'sq_deep' : 'sq_spend');
          setIrisFollowUp(undefined);
          setSubmittedSearch(fsQuery);
          setSelectedQueryId(fsFlowId === 'fs_deep' ? 'sq_deep' : 'sq_spend');
          setSidebarSkipThinking(true);
          setShowIrisSidebar(true);
        }}
        onBuildWorksheet={(type) => { setShowFsIris(false); handleBuildWorksheet(type); }}
        onBuildReport={(measure, groupBy) => {
          setShowFsIris(false);
          const gbClean = groupBy.replace('By ', '').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          setReportConfig({ measure, groupBy: gbClean });
          setActiveTab('insights');
          setInsightsSidebarView('reports');
          setReportLoading(true);
          setTimeout(() => { setReportLoading(false); setShowReportBuilder(true); }, 8000);
        }}
      />
    )}
    {worksheetLoading && <WorksheetLoadingOverlay worksheetType={worksheetType} />}
    {reportLoading && <WorksheetLoadingOverlay worksheetType="report-builder" />}
    {showWorksheetModal && (
      <WorksheetModal onClose={() => setShowWorksheetModal(false)} worksheetType={worksheetType} />
    )}
    {showWIPModal && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '32px 36px', maxWidth: 480, width: '90%', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 100, padding: '3px 10px' }}>
              Work in Progress
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-text-primary)', marginBottom: 14, lineHeight: 1.3 }}>Search Vision Prototype</div>
          <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-secondary)', fontFamily: 'inherit' }}>
            This is a directional prototype showing how <strong style={{ color: 'var(--ink-text-primary)' }}>Search as a front door</strong> could function in Agreement Manager. All scenarios, vendor names, and contract data are <strong style={{ color: 'var(--ink-text-primary)' }}>fictional</strong>.
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-secondary)', fontFamily: 'inherit' }}>
            It is meant to show direction — not final product behavior or engineering commitments.
          </p>
          <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-text-secondary)', fontFamily: 'inherit' }}>
            For more finalized designs, <a href="https://www.figma.com/design/P7vv9ve50WQBDXh95uO1Jy/CY26---Search-Find---Share----Manage--Document-Management?node-id=464-118829&t=c6Mxq7hviY0wT3Nj-1" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 600, textDecoration: 'none' }}>view the Figma file →</a>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ink-neutral-fade-05, #f7f7f9)', border: '1px solid var(--ink-border-color-subtle)', borderRadius: 8, padding: '12px 16px', marginBottom: 28 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-text-secondary)' }}>Questions or feedback?</span>
            <span style={{ fontSize: 13, color: 'var(--ink-purple-100, #4B47C8)', fontWeight: 600 }}>Slack Sehoon Park</span>
          </div>
          <button
            onClick={() => setShowWIPModal(false)}
            style={{ background: 'var(--ink-purple-100, #4B47C8)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3d39b0'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-purple-100, #4B47C8)'; }}
          >
            Got it, let's explore
          </button>
        </div>
      </div>
    )}
    </>
  );
}
