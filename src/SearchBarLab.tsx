import { useState, useRef, useEffect, type CSSProperties } from 'react';
import {
  Container,
  Stack,
  Inline,
  Heading,
  Text,
  Icon,
  IrisIcon,
  Divider,
} from '@/design-system';

/* ─── design tokens ──────────────────────────────────────── */
const T = {
  textPrimary:   'var(--ink-text-primary,   #1a1a2e)',
  textSecondary: 'var(--ink-text-secondary, #6b6b7a)',
  textTertiary:  'var(--ink-text-tertiary,  #9292a0)',
  borderSubtle:  'var(--ink-border-color-subtle, #e8e8ec)',
  borderDefault: 'var(--ink-border-color,   #d0d0da)',
  surface:       'var(--ink-surface,        #ffffff)',
  surfaceSubtle: 'var(--ink-surface-subtle, #f8f8fb)',
  surfaceHover:  'var(--ink-surface-hover,  #f2f2f6)',
  irisPurple:    '#5c3fd1',
  irisBg:        '#f3f0fd',
  irisBgHover:   '#ebe6fa',
  irisBorder:    '#d4c8f7',
  brand:         '#4B47C8',
  searchBlue:    '#2563eb',
};

/* ─── helpers ────────────────────────────────────────────── */

function hl(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return <>{text.slice(0, idx)}<strong>{text.slice(idx, idx + query.length)}</strong>{text.slice(idx + query.length)}</>;
}

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1px 6px', borderRadius: 5, background: T.surfaceSubtle, border: `1px solid ${T.borderSubtle}`, fontSize: 11, fontWeight: 600, color: T.textSecondary, fontFamily: 'inherit', lineHeight: '18px' }}>
      {children}
    </span>
  );
}

function IrisConfirmNote({ query, fullScreen }: { query: string; fullScreen?: boolean }) {
  const msg = fullScreen
    ? <>Full screen Iris would open{query ? <> with "<strong>{query}</strong>"</> : ''}</>
    : <>Iris side panel would open{query ? <> with "<strong>{query}</strong>"</> : ''}</>;
  return (
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.irisBg, borderRadius: 8, border: `1px solid ${T.irisBorder}` }}>
      <IrisIcon /><Text size="sm" style={{ color: T.irisPurple }}>{msg}</Text>
    </div>
  );
}

/* shared dropdown shell */
function DropdownShell({ borderColor = T.brand, children }: { borderColor?: string; children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: T.surface, border: `1.5px solid ${borderColor}`, borderTop: `1px solid ${T.borderSubtle}`, borderRadius: '0 0 12px 12px', boxShadow: '0 12px 36px rgba(0,0,0,0.11)', zIndex: 100, overflow: 'hidden' }}>
      {children}
    </div>
  );
}

/* source cluster used in V3 */
function SourceCluster() {
  const icons = [
    { name: 'envelope',        bg: '#eef2ff', color: T.brand },
    { name: 'building-person', bg: '#f0fdf4', color: '#16a34a' },
    { name: 'templates',       bg: '#fef9ee', color: '#d97706' },
  ] as const;
  return (
    <Inline gap={0} align="center">
      {icons.map((ic, i) => (
        <div key={ic.name} style={{ width: 22, height: 22, borderRadius: '50%', background: ic.bg, border: `2px solid ${T.surface}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i === 0 ? 0 : -6, zIndex: icons.length - i }}>
          <Icon name={ic.name as any} size={11} color={ic.color} />
        </div>
      ))}
      <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 600, color: T.textTertiary }}>+47</span>
    </Inline>
  );
}

/* shared dropdown focus/blur logic */
function useDropdown() {
  const [open, setOpen]    = useState(false);
  const inputRef           = useRef<HTMLInputElement>(null);
  const closeTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFocus = (cb?: () => void) => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); cb?.(); };
  const handleBlur  = ()                => { closeTimer.current = setTimeout(() => setOpen(false), 180); };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  return { open, setOpen, inputRef, handleFocus, handleBlur };
}

/* ═══════════════════════════════════════
   V1 — Typeahead + pinned Ask Iris
   ═══════════════════════════════════════ */

const SUGGESTIONS = [
  'Acme Corp',
  'Acme contract renewal',
  'Acme pricing terms',
  'What products do we purchase from Acme?',
  'Agreements expiring in 6 months',
  'Committed spend by vendor category',
];

function V1Demo() {
  const [value, setValue]                 = useState('');
  const [hovered, setHovered]             = useState<number | null>(null);
  const [irisHov, setIrisHov]             = useState(false);
  const [fired, setFired]                 = useState(false);
  const { open, setOpen, inputRef, handleFocus, handleBlur } = useDropdown();

  const filtered = value.trim() ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase())) : SUGGESTIONS;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${open ? T.brand : T.borderDefault}`, borderRadius: open ? '10px 10px 0 0' : 10, background: T.surface, boxShadow: open ? `0 0 0 3px rgba(75,71,200,0.10)` : 'none', transition: 'all 150ms', paddingLeft: 14, paddingRight: 10, height: 48, gap: 10 }}>
        <Icon name="search" size={17} color={open ? T.brand : T.textTertiary} />
        <input ref={inputRef} value={value} onChange={e => { setValue(e.target.value); setOpen(true); setFired(false); }} onFocus={() => handleFocus(() => setFired(false))} onBlur={handleBlur} placeholder="Search agreements, vendors, or ask a question…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: T.textPrimary, background: 'transparent', fontFamily: 'inherit', fontWeight: value ? 500 : 400 }} />
        {value && <button onMouseDown={e => { e.preventDefault(); setValue(''); inputRef.current?.focus(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: T.textTertiary, display: 'flex', alignItems: 'center' }}><Icon name="x" size={14} /></button>}
      </div>
      {open && (
        <DropdownShell>
          {filtered.map((s, i) => (
            <div key={s} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onMouseDown={e => { e.preventDefault(); setValue(s); setOpen(false); inputRef.current?.focus(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: hovered === i ? T.surfaceHover : 'transparent', transition: 'background 80ms' }}>
              <Icon name="search" size={14} color={T.textTertiary} />
              <span style={{ fontSize: 14, color: T.textPrimary }}>{hl(s, value)}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.borderSubtle}` }} />
          <div onMouseEnter={() => setIrisHov(true)} onMouseLeave={() => setIrisHov(false)} onMouseDown={e => { e.preventDefault(); setFired(true); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: 'pointer', background: irisHov ? T.irisBgHover : T.irisBg, transition: 'background 100ms' }}>
            <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IrisIcon /></div>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.irisPurple }}>Ask Iris about this</span>
            <Icon name="arrow-right" size={14} color={T.irisPurple} style={{ marginLeft: 'auto' }} />
          </div>
        </DropdownShell>
      )}
      {fired && <IrisConfirmNote query={value} />}
    </div>
  );
}

/* ═══════════════════════════════════════
   V2 — Command palette
   ═══════════════════════════════════════ */

const TIPS = [
  { prefix: 'ask:',      hint: 'Ask Iris',                      isIris: true,  icon: null },
  { prefix: 'vendor:',   hint: 'Search by vendor name',         isIris: false, icon: 'building' },
  { prefix: 'contract:', hint: 'Search contracts',              isIris: false, icon: 'envelope' },
  { prefix: 'party:',    hint: 'Find parties & counterparties', isIris: false, icon: 'user' },
  { prefix: 'expire:',   hint: 'Find expiring agreements',      isIris: false, icon: 'calendar' },
  { prefix: 'spend:',    hint: 'Search by spend category',      isIris: false, icon: 'chart-bar' },
];

function V2Demo() {
  const [value, setValue]     = useState('');
  const [hov, setHov]         = useState<number | null>(null);
  const [fired, setFired]     = useState(false);
  const { open, setOpen, inputRef, handleFocus, handleBlur } = useDropdown();
  const hasQ = value.trim().length > 0;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${open ? '#222' : T.borderDefault}`, borderRadius: open ? '10px 10px 0 0' : 10, background: T.surface, transition: 'border-color 150ms', paddingLeft: 14, paddingRight: 14, height: 48, gap: 10 }}>
        <Icon name="search" size={17} color={T.textTertiary} />
        <input ref={inputRef} value={value} onChange={e => { setValue(e.target.value); setFired(false); if (!open) setOpen(true); }} onFocus={() => handleFocus(() => setFired(false))} onBlur={handleBlur} placeholder="Search…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: T.textPrimary, background: 'transparent', fontFamily: 'inherit' }} />
      </div>
      {open && (
        <DropdownShell borderColor="#222">
          {!hasQ ? (
            <>
              <div style={{ padding: '10px 16px 6px', fontSize: 11, fontWeight: 600, color: T.textTertiary, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Search tips</div>
              {TIPS.map((tip, i) => (
                <div key={tip.prefix} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); if (tip.isIris) { setFired(true); setOpen(false); } else { setValue(tip.prefix + ' '); inputRef.current?.focus(); } }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px', cursor: 'pointer', background: hov === i ? T.surfaceHover : 'transparent', transition: 'background 80ms' }}>
                  <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{tip.isIris ? <IrisIcon /> : <Icon name={(tip.icon as any) || 'search'} size={15} color={T.textTertiary} />}</div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: tip.isIris ? T.irisPurple : T.textPrimary, minWidth: 72 }}>{tip.prefix}</span>
                  <span style={{ fontSize: 14, color: T.textTertiary }}>—</span>
                  <span style={{ fontSize: 14, color: tip.isIris ? T.irisPurple : T.textSecondary }}>{tip.hint}</span>
                  {tip.isIris && <Icon name="arrow-right" size={14} color={T.irisPurple} style={{ marginLeft: 'auto' }} />}
                </div>
              ))}
            </>
          ) : (
            <div onMouseEnter={() => setHov(0)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); setFired(true); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', background: hov === 0 ? T.irisBgHover : T.surface, transition: 'background 80ms' }}>
              <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IrisIcon /></div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.irisPurple }}>Ask Iris</span>
              <span style={{ fontSize: 14, color: T.textTertiary }}>—</span>
              <span style={{ fontSize: 14, color: T.textSecondary }}>"{value}"</span>
              <Icon name="arrow-right" size={14} color={T.irisPurple} style={{ marginLeft: 'auto' }} />
            </div>
          )}
          <div style={{ borderTop: `1px solid ${T.borderSubtle}`, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, background: T.surfaceSubtle }}>
            <Inline gap={6} align="center"><KbdHint>↑</KbdHint><KbdHint>↓</KbdHint><span style={{ fontSize: 12, color: T.textTertiary }}>to navigate</span></Inline>
            <Inline gap={6} align="center"><KbdHint>↵</KbdHint><span style={{ fontSize: 12, color: T.textTertiary }}>to select</span></Inline>
            {hasQ && <Inline gap={6} align="center"><KbdHint>Tab</KbdHint><span style={{ fontSize: 12, color: T.irisPurple, fontWeight: 500 }}>to ask Iris</span></Inline>}
          </div>
        </DropdownShell>
      )}
      {fired && <IrisConfirmNote query={value} />}
    </div>
  );
}

/* ═══════════════════════════════════════
   V3 — Leading questions
        Empty: show intent starters
        Typing (no starter): normal search suggestions + Ask Iris
        Starter selected: two-step → Iris
   ═══════════════════════════════════════ */

const STARTERS = [
  { icon: 'table',     text: 'I want to analyze…',   hint: 'Builds a worksheet with Iris' },
  { icon: 'chart-bar', text: 'I want to visualize…', hint: 'Builds a report with Iris' },
  { icon: 'chat',      text: 'I want to know…',       hint: 'Opens Iris chat' },
  { icon: 'search',    text: 'I want to find…',       hint: 'Filters your agreements' },
  { icon: 'compare',   text: 'I want to compare…',   hint: 'Side-by-side comparison' },
];

function V3Demo() {
  const [value, setValue]         = useState('');
  const [starter, setStarter]     = useState<typeof STARTERS[0] | null>(null);
  const [hov, setHov]             = useState<number | null>(null);
  const [fired, setFired]         = useState(false);
  const [firedSearch, setFiredSearch] = useState(false);
  const { open, setOpen, inputRef, handleFocus, handleBlur } = useDropdown();

  const filtered = value.trim() ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase())) : SUGGESTIONS;

  const pickStarter = (s: typeof STARTERS[0]) => {
    setStarter(s);
    const prefill = s.text.replace('…', ' ');
    setValue(prefill);
    setFired(false); setFiredSearch(false);
    setOpen(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const len = prefill.length;
      inputRef.current?.setSelectionRange(len, len);
    });
  };

  const fireIris   = () => { setFired(true); setFiredSearch(false); setOpen(false); };
  const fireSearch = () => { setFiredSearch(true); setFired(false); setOpen(false); };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${open ? T.brand : T.borderDefault}`, borderRadius: open ? '10px 10px 0 0' : 10, background: T.surface, boxShadow: open ? `0 0 0 3px rgba(75,71,200,0.10)` : 'none', transition: 'all 150ms', paddingLeft: 14, paddingRight: 10, height: 48, gap: 10 }}>
        <Icon name="search" size={17} color={open ? T.brand : T.textTertiary} />
        <input
          ref={inputRef} value={value}
          onChange={e => { setValue(e.target.value); setFired(false); if (!open) setOpen(true); }}
          onFocus={() => handleFocus(() => setFired(false))}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') { starter ? fireIris() : fireSearch(); }
          }}
          placeholder="What would you like to do?"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: T.textPrimary, background: 'transparent', fontFamily: 'inherit', fontWeight: value ? 500 : 400 }}
        />
        {value && (
          <button onMouseDown={e => { e.preventDefault(); setValue(''); setStarter(null); inputRef.current?.focus(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: T.textTertiary, display: 'flex', alignItems: 'center' }}>
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {open && (
        <DropdownShell>
          {starter ? (
            /* Step 2: starter picked — show context + Open Iris */
            <>
              <div onMouseEnter={() => setHov(0)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); fireIris(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', background: hov === 0 ? T.irisBgHover : T.irisBg, transition: 'background 100ms' }}>
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IrisIcon /></div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.irisPurple, flex: 1 }}>Open Iris</span>
                {value.trim() && <span style={{ fontSize: 13, color: T.textSecondary, fontStyle: 'italic', marginRight: 8 }}>"{value.trim()}"</span>}
                <Icon name="arrow-right" size={14} color={T.irisPurple} />
              </div>
            </>
          ) : value.trim() ? (
            /* Typing freely — show suggestions + Ask Iris, Enter = normal search */
            <>
              {filtered.map((s, i) => (
                <div key={s} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); setValue(s); setOpen(false); inputRef.current?.focus(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: hov === i ? T.surfaceHover : 'transparent', transition: 'background 80ms' }}>
                  <Icon name="search" size={14} color={T.textTertiary} />
                  <span style={{ fontSize: 14, color: T.textPrimary }}>{hl(s, value)}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${T.borderSubtle}` }} />
              <div onMouseEnter={() => setHov(99)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); fireIris(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: 'pointer', background: hov === 99 ? T.irisBgHover : T.irisBg, transition: 'background 80ms' }}>
                <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center' }}><IrisIcon /></div>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.irisPurple }}>Ask Iris about this</span>
                <Icon name="arrow-right" size={14} color={T.irisPurple} style={{ marginLeft: 'auto' }} />
              </div>
            </>
          ) : (
            /* Empty focus — show leading question starters */
            <>
              <div style={{ padding: '12px 16px 6px', fontSize: 11, fontWeight: 600, color: T.textTertiary, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Get started</div>
              {STARTERS.map((s, i) => (
                <div key={s.text} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); pickStarter(s); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', background: hov === i ? T.surfaceHover : 'transparent', transition: 'background 80ms' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: T.surfaceSubtle, border: `1px solid ${T.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={s.icon as any} size={14} color={T.textSecondary} />
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{s.text}</span>
                    <span style={{ fontSize: 13, color: T.textTertiary, marginLeft: 8 }}>{s.hint}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </DropdownShell>
      )}

      {fired && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.irisBg, borderRadius: 8, border: `1px solid ${T.irisBorder}` }}>
          <IrisIcon />
          <Text size="sm" style={{ color: T.irisPurple }}>Iris chat opens with "<strong>{value.trim()}</strong>"</Text>
        </div>
      )}
      {firedSearch && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
          <Icon name="search" size={14} color={T.searchBlue} />
          <Text size="sm" style={{ color: T.searchBlue }}>Standard search for "<strong>{value.trim()}</strong>"</Text>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   V1 — DuckDuckGo-style dual mode
        Toggle group inside pill: labeled when empty, icon-only when typing.
        Active button = white raised pill within the group.
        Search mode: dropdown + Ask Iris / Option+Enter / Search footer.
        Iris mode: Send button below input; Enter fires Iris.
   ═══════════════════════════════════════ */

function DuckStyleDemo() {
  const [value, setValue]             = useState('');
  const [mode, setMode]               = useState<'search' | 'iris'>('search');
  const [hov, setHov]                 = useState<number | null>(null);
  const [fired, setFired]             = useState(false);
  const [firedSearch, setFiredSearch] = useState(false);
  const { open, setOpen, inputRef, handleFocus, handleBlur } = useDropdown();

  const isSearch = mode === 'search';
  const isIris   = mode === 'iris';
  const hasText  = value.trim().length > 0;

  const filtered = value.trim()
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTIONS;

  const fireIris   = () => { setFired(true); setFiredSearch(false); setOpen(false); };
  const fireSearch = () => { setFiredSearch(true); setFired(false); setOpen(false); };

  const switchTo = (m: 'search' | 'iris') => {
    setMode(m);
    setFired(false); setFiredSearch(false);
    if (m === 'iris') setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 620 }}>

      {/* ── Input bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        borderRadius: open && isSearch ? '28px 28px 0 0' : 28,
        background: T.surface,
        boxShadow: open && isSearch
          ? '0 0 0 1.5px #d0d0da'
          : '0 1px 8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
        transition: 'border-radius 150ms, box-shadow 180ms',
        paddingLeft: 20, paddingRight: 8, height: 52, gap: 8,
      }}>

        <input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); setFired(false); setFiredSearch(false); if (isSearch && !open) setOpen(true); }}
          onFocus={() => { if (isSearch) handleFocus(() => { setFired(false); setFiredSearch(false); }); }}
          onBlur={() => { if (isSearch) handleBlur(); }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (isIris) { fireIris(); }
              else if (e.altKey) { fireIris(); }
              else { fireSearch(); }
            }
          }}
          placeholder={isIris ? 'Ask Iris anything…' : 'Search agreements, or ask Iris…'}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: T.textPrimary, background: 'transparent', fontFamily: 'inherit', fontWeight: value ? 500 : 400 }}
        />

        {value && (
          <button onMouseDown={e => { e.preventDefault(); setValue(''); inputRef.current?.focus(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 6px', color: T.textTertiary, display: 'flex', alignItems: 'center' }}>
            <Icon name="x" size={15} />
          </button>
        )}

        {/* ── Toggle group ── */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#ebebef', borderRadius: 99, padding: 3, gap: 2, flexShrink: 0 }}>

          {/* Search pill */}
          <button
            onMouseDown={e => { e.preventDefault(); switchTo('search'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: hasText ? 0 : 6,
              padding: hasText ? '6px 10px' : '7px 14px',
              borderRadius: 99, border: 'none',
              background: isSearch ? T.surface : 'transparent',
              boxShadow: isSearch ? '0 1px 3px rgba(0,0,0,0.14)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              color: isSearch ? T.textPrimary : T.textSecondary,
              transition: 'all 150ms',
            }}
          >
            <Icon name="search" size={15} color={isSearch ? T.textPrimary : T.textSecondary} />
            {!hasText && <span style={{ fontSize: 13, fontWeight: 600 }}>Search</span>}
          </button>

          {/* Ask Iris pill */}
          <button
            onMouseDown={e => { e.preventDefault(); switchTo('iris'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: hasText ? 0 : 6,
              padding: hasText ? '6px 10px' : '7px 14px',
              borderRadius: 99, border: 'none',
              background: isIris ? T.surface : 'transparent',
              boxShadow: isIris ? '0 1px 3px rgba(0,0,0,0.14)' : 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 150ms',
            }}
          >
            <IrisIcon />
            {!hasText && <span style={{ fontSize: 13, fontWeight: 600, color: isIris ? T.irisPurple : T.textSecondary, marginLeft: 4 }}>Ask Iris</span>}
          </button>
        </div>
      </div>

      {/* ── Search dropdown ── */}
      {open && isSearch && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: T.surface, border: '1.5px solid #d0d0da', borderTop: `1px solid ${T.borderSubtle}`, borderRadius: '0 0 28px 28px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
          <div style={{ padding: '8px 0' }}>
            {filtered.map((s, i) => (
              <div key={s} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); setValue(s); setOpen(false); inputRef.current?.focus(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', cursor: 'pointer', background: hov === i ? T.surfaceHover : 'transparent', transition: 'background 80ms' }}>
                <Icon name="search" size={14} color={T.textTertiary} />
                <span style={{ fontSize: 15, color: T.textPrimary }}>{hl(s, value)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.borderSubtle}`, padding: '10px 16px', background: T.surfaceSubtle, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onMouseDown={e => { e.preventDefault(); fireIris(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 99, border: `1.5px solid ${T.irisBorder}`, background: T.irisBg, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = T.irisBgHover)}
              onMouseLeave={e => (e.currentTarget.style.background = T.irisBg)}
            >
              <IrisIcon />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.irisPurple }}>Ask Iris</span>
            </button>
            <span style={{ fontSize: 13, color: T.textTertiary, flexShrink: 0 }}>Option+Enter</span>
            <div style={{ flex: 1 }} />
            <button
              onMouseDown={e => { e.preventDefault(); fireSearch(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 99, border: 'none', background: T.searchBlue, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(37,99,235,0.25)', transition: 'opacity 100ms', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Icon name="search" size={13} color="#fff" />
              Search
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmations ── */}
      {fired && <IrisConfirmNote query={value} fullScreen />}
      {firedSearch && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
          <Icon name="search" size={14} color={T.searchBlue} />
          <Text size="sm" style={{ color: T.searchBlue }}>Standard search for "<strong>{value.trim()}</strong>"</Text>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   (old V4 dual-mode — replaced by DuckStyleDemo above)
   ═══════════════════════════════════════ */

function V5Demo() {
  const [value, setValue]             = useState('');
  const [mode, setMode]               = useState<'search' | 'iris'>('search');
  const [hov, setHov]                 = useState<number | null>(null);
  const [fired, setFired]             = useState(false);
  const [firedSearch, setFiredSearch] = useState(false);
  const { open, setOpen, inputRef, handleFocus, handleBlur } = useDropdown();

  const isSearch = mode === 'search';
  const isIris   = mode === 'iris';

  const filtered = value.trim()
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTIONS;

  const fireIris   = () => { setFired(true); setFiredSearch(false); setOpen(false); };
  const fireSearch = () => { setFiredSearch(true); setFired(false); setOpen(false); };

  const switchTo = (m: 'search' | 'iris') => {
    setMode(m);
    setFired(false); setFiredSearch(false);
    if (m === 'iris') setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 620 }}>

      {/* ── Input row — both mode buttons always visible ── */}
      <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${isIris ? T.irisPurple : T.borderDefault}`, borderRadius: open && isSearch ? '12px 12px 0 0' : 12, background: T.surface, boxShadow: isIris ? '0 0 0 3px rgba(92,63,209,0.12)' : (open ? '0 0 0 2px rgba(0,0,0,0.07)' : 'none'), transition: 'all 180ms', paddingLeft: 16, paddingRight: 8, height: 52, gap: 10 }}>

        {isIris
          ? <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IrisIcon /></div>
          : <Icon name="search" size={16} color={T.textTertiary} style={{ flexShrink: 0 }} />
        }

        <input
          ref={inputRef} value={value}
          onChange={e => { setValue(e.target.value); setFired(false); setFiredSearch(false); if (isSearch && !open) setOpen(true); }}
          onFocus={() => { if (isSearch) handleFocus(); }}
          onBlur={() => { if (isSearch) handleBlur(); }}
          onKeyDown={e => { if (e.key === 'Enter') { isIris ? fireIris() : fireSearch(); } }}
          placeholder={isIris ? 'Ask Iris anything…' : 'Search agreements, vendors, or ask Iris…'}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: T.textPrimary, background: 'transparent', fontFamily: 'inherit', fontWeight: value ? 500 : 400 }}
        />

        {value && (
          <button onMouseDown={e => { e.preventDefault(); setValue(''); inputRef.current?.focus(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px', color: T.textTertiary, display: 'flex', alignItems: 'center' }}>
            <Icon name="x" size={15} />
          </button>
        )}

        {/* Search button — highlighted when search mode is active */}
        <button
          onMouseDown={e => { e.preventDefault(); switchTo('search'); }}
          title="Search mode"
          style={{ border: isSearch ? '1.5px solid #2563eb' : `1px solid ${T.borderSubtle}`, borderRadius: 8, background: isSearch ? '#eff6ff' : T.surface, cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms', flexShrink: 0 }}
        >
          <Icon name="search" size={16} color={isSearch ? '#2563eb' : T.textTertiary} />
        </button>

        {/* Iris button — highlighted when iris mode is active */}
        <button
          onMouseDown={e => { e.preventDefault(); switchTo('iris'); }}
          title="Ask Iris mode"
          style={{ border: isIris ? `1.5px solid ${T.irisPurple}` : `1px solid ${T.irisBorder}`, borderRadius: 8, background: isIris ? T.irisBg : T.surface, cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms', flexShrink: 0, marginRight: 2 }}
        >
          <IrisIcon />
        </button>
      </div>

      {/* ── Search mode dropdown ── */}
      {open && isSearch && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: T.surface, border: `1.5px solid ${T.borderDefault}`, borderTop: `1px solid ${T.borderSubtle}`, borderRadius: '0 0 14px 14px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
          <div style={{ padding: '6px 0' }}>
            {filtered.map((s, i) => (
              <div key={s} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onMouseDown={e => { e.preventDefault(); setValue(s); setOpen(false); inputRef.current?.focus(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', background: hov === i ? T.surfaceHover : 'transparent', transition: 'background 80ms' }}>
                <Icon name="search" size={14} color={T.textTertiary} />
                <span style={{ fontSize: 14, color: T.textPrimary, flex: 1 }}>{hl(s, value)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.borderSubtle}`, padding: '10px 12px', background: T.surfaceSubtle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <button onMouseDown={e => { e.preventDefault(); fireIris(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, border: `1.5px solid ${T.irisBorder}`, background: T.irisBg, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.irisBgHover)}
              onMouseLeave={e => (e.currentTarget.style.background = T.irisBg)}>
              <IrisIcon />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.irisPurple }}>Ask Iris</span>
            </button>
            <button onMouseDown={e => { e.preventDefault(); fireSearch(); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 20px', borderRadius: 99, border: 'none', background: T.searchBlue, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(37,99,235,0.25)', transition: 'opacity 100ms' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <Icon name="search" size={13} color="#fff" />
              Search
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmations ── */}
      {fired && <IrisConfirmNote query={value} fullScreen />}
      {firedSearch && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
          <Icon name="search" size={14} color={T.searchBlue} />
          <Text size="sm" style={{ color: T.searchBlue }}>
            Standard search would run{value ? <> for "<strong>{value}</strong>"</> : ''}
          </Text>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   V5 — Ask-first
        Enter / Ask button → Iris (default)
        "Search" in dropdown or ⌥↩ → standard search
   ═══════════════════════════════════════ */

function AskFirstDemo() {
  const [value, setValue]             = useState('');
  const [hov, setHov]                 = useState<number | null>(null);
  const [fired, setFired]             = useState(false);
  const [firedSearch, setFiredSearch] = useState(false);
  const { open, setOpen, inputRef, handleFocus, handleBlur } = useDropdown();

  const hasText      = value.trim().length > 0;
  const showDropdown = open && hasText;

  const fireIris   = () => { setFired(true); setFiredSearch(false); setOpen(false); };
  const fireSearch = () => { setFiredSearch(true); setFired(false); setOpen(false); };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 620 }}>

      {/* ── Input bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        borderRadius: showDropdown ? '16px 16px 0 0' : 28,
        background: T.surface,
        boxShadow: showDropdown
          ? '0 0 0 1px #d0d0da'
          : '0 1px 8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.07)',
        transition: 'border-radius 120ms, box-shadow 150ms',
        paddingLeft: 20, paddingRight: 6, height: 52, gap: 2,
      }}>

        <input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); setFired(false); setFiredSearch(false); if (!open) setOpen(true); }}
          onFocus={() => handleFocus(() => { setFired(false); setFiredSearch(false); })}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter' && hasText) { e.altKey ? fireSearch() : fireIris(); }
          }}
          placeholder="Create, ask, or search anything"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: T.textPrimary, background: 'transparent', fontFamily: 'inherit', fontWeight: value ? 500 : 400 }}
        />

        {/* Ask / submit button — pill when text present, gray circle when empty */}
        {hasText ? (
          <button
            onMouseDown={e => { e.preventDefault(); fireIris(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 99, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0, marginRight: 2 }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="white"><path d="M6.5 0.5L7.8 5.2L12.5 6.5L7.8 7.8L6.5 12.5L5.2 7.8L0.5 6.5L5.2 5.2L6.5 0.5Z"/></svg>
            Ask
          </button>
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#bfc0c8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 2 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 11V3M3.5 6.5L7 3L10.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: T.surface, border: '1px solid #d0d0da', borderTop: `1px solid ${T.borderSubtle}`, borderRadius: '0 0 16px 16px', boxShadow: '0 8px 20px rgba(0,0,0,0.09)', zIndex: 100, overflow: 'hidden' }}>

          {/* Search row */}
          <div
            onMouseEnter={() => setHov(0)} onMouseLeave={() => setHov(null)}
            onMouseDown={e => { e.preventDefault(); fireSearch(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', background: hov === 0 ? T.surfaceHover : 'transparent', transition: 'background 80ms' }}
          >
            <Icon name="search" size={15} color={T.textSecondary} />
            <span style={{ fontSize: 14, color: T.textPrimary, flex: 1 }}>
              <strong>Search</strong><span style={{ color: T.textSecondary, fontWeight: 400 }}> — {value}</span>
            </span>
            <Inline gap={4} align="center">
              <KbdHint>option</KbdHint>
              <span style={{ fontSize: 11, color: T.textTertiary }}>+</span>
              <KbdHint>return</KbdHint>
            </Inline>
          </div>

        </div>
      )}

      {/* ── Confirmations ── */}
      {fired && <IrisConfirmNote query={value} />}
      {firedSearch && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
          <Icon name="search" size={14} color={T.searchBlue} />
          <Text size="sm" style={{ color: T.searchBlue }}>Standard search for "<strong>{value.trim()}</strong>"</Text>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Variation registry
   ═══════════════════════════════════════ */

interface Variation {
  id: string; shortLabel: string; label: string;
  components: string[]; engineerNote: string;
  Demo: React.FC;
}

const VARIATIONS: Variation[] = [
  {
    id: 'v1', shortLabel: 'Dual-mode',
    label: 'Dual-mode: Search / Ask Iris toggle',
    components: ['Pill input', 'Toggle group', 'IrisIcon', 'Search suggestions', 'Ask Iris + Search footer', 'Send button'],
    engineerNote: 'Toggle group sits inside the pill — labeled (Search / Ask Iris) when empty, icon-only when typing. Active mode gets a white raised pill. Search mode: dropdown with suggestions + Ask Iris pill + Option+Enter hint + Search button. Iris mode: Enter or Send fires full-screen Iris.',
    Demo: DuckStyleDemo,
  },
  {
    id: 'v2', shortLabel: 'Typeahead',
    label: 'Typeahead + pinned Ask Iris',
    components: ['Input', 'Dropdown overlay', 'IrisIcon', 'Icon'],
    engineerNote: 'Absolutely-positioned dropdown, no library needed. Iris row pinned below a divider — always visible. Blur uses a short delay so click events register before close.',
    Demo: V1Demo,
  },
  {
    id: 'v3', shortLabel: 'Command palette',
    label: 'Command palette',
    components: ['Input', 'Dropdown overlay', 'IrisIcon', 'Icon', 'Keyboard hint badges'],
    engineerNote: 'Two states: empty focus shows search-prefix tips; any typing collapses the dropdown to a single Ask Iris row echoing the query.',
    Demo: V2Demo,
  },
  {
    id: 'v4', shortLabel: 'Leading questions',
    label: 'Leading questions → Iris',
    components: ['Input', 'Dropdown overlay', 'IrisIcon', 'Intent starter rows', 'Three-state dropdown'],
    engineerNote: 'Three dropdown states: (1) empty = intent starters; (2) typing freely = search suggestions + Ask Iris — Enter runs a normal search; (3) starter selected = Open Iris, Enter fires Iris.',
    Demo: V3Demo,
  },
  {
    id: 'v5', shortLabel: 'Ask-first',
    label: 'Ask-first: Chat by default, Search on ⌥↩',
    components: ['Pill input', 'IrisIcon', 'Ask button', 'Keyboard shortcut hint', 'Dropdown overlay'],
    engineerNote: 'Enter / Ask button fires Iris chat by default. Search is a secondary action reachable via the dropdown row or ⌥↩ shortcut. The input morphs from a pill to a connected rectangle when the dropdown opens.',
    Demo: AskFirstDemo,
  },
];

/* ═══════════════════════════════════════
   Page shell — tabbed
   ═══════════════════════════════════════ */

const chipStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
  background: T.surfaceSubtle, color: T.textSecondary, border: `1px solid ${T.borderSubtle}`,
};

export function SearchBarLabPage() {
  const [active, setActive] = useState(0);
  const v = VARIATIONS[active];

  return (
    <div style={{ padding: '72px 0 140px', minHeight: '100vh', background: T.surfaceSubtle }}>
      <Container>
        <Stack gap={32}>

          <Heading level={2}>Search Bar Explorations</Heading>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(75,71,200,0.06)', borderRadius: 12, padding: 4, border: `1px solid rgba(75,71,200,0.14)`, alignSelf: 'flex-start' }}>
            {VARIATIONS.map((variation, i) => {
              const isActive = active === i;
              return (
                <button key={variation.id} onClick={() => setActive(i)} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', background: isActive ? T.brand : 'transparent', color: isActive ? '#fff' : T.textSecondary, fontWeight: isActive ? 700 : 500, fontSize: 13, fontFamily: 'inherit', transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)', boxShadow: isActive ? '0 2px 8px rgba(75,71,200,0.28)' : 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, opacity: isActive ? 0.7 : 0.5, letterSpacing: '0.05em' }}>V{i + 1}</span>
                  {variation.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Active card — NO overflow:hidden so dropdowns are never clipped */}
          <div key={v.id} style={{ borderRadius: 16, border: `1px solid ${T.borderSubtle}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

            {/* Title strip */}
            <div style={{ padding: '36px 52px 32px', borderBottom: `1px solid ${T.borderSubtle}`, background: T.surface, borderRadius: '16px 16px 0 0' }}>
              <Inline gap={10} align="center">
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: '#eef2ff', color: T.brand, border: '1px solid #c7d2fe', flexShrink: 0 }}>V{active + 1}</span>
                <Heading level={3} style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{v.label}</Heading>
              </Inline>
            </div>

            {/* Demo — tall enough to show open dropdown without overflow clipping */}
            <div style={{ background: '#e8e8ef', padding: '80px 52px 420px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', borderBottom: `1px solid ${T.borderSubtle}` }}>
              <v.Demo key={v.id} />
            </div>

            {/* Footer — chips + note */}
            <div style={{ padding: '32px 52px 40px', background: T.surface, borderRadius: '0 0 16px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Inline gap={6} wrap>
                {v.components.map(c => <span key={c} style={chipStyle}>{c}</span>)}
              </Inline>
              <p style={{ margin: 0, fontSize: 13, color: T.textSecondary, lineHeight: 1.65 }}>{v.engineerNote}</p>
            </div>

          </div>

          {/* Prev / next */}
          <Inline gap={12} align="center" style={{ justifyContent: 'space-between', paddingTop: 4 }}>
            <button onClick={() => setActive(i => Math.max(0, i - 1))} disabled={active === 0} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: `1px solid ${T.borderDefault}`, background: T.surface, cursor: active === 0 ? 'not-allowed' : 'pointer', opacity: active === 0 ? 0.4 : 1, fontSize: 13, fontWeight: 500, color: T.textPrimary, fontFamily: 'inherit' }}>
              <Icon name="arrow-left" size={14} /> Previous
            </button>
            <Text size="sm" color="secondary">{active + 1} of {VARIATIONS.length}</Text>
            <button onClick={() => setActive(i => Math.min(VARIATIONS.length - 1, i + 1))} disabled={active === VARIATIONS.length - 1} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: `1px solid ${T.borderDefault}`, background: T.surface, cursor: active === VARIATIONS.length - 1 ? 'not-allowed' : 'pointer', opacity: active === VARIATIONS.length - 1 ? 0.4 : 1, fontSize: 13, fontWeight: 500, color: T.textPrimary, fontFamily: 'inherit' }}>
              Next <Icon name="arrow-right" size={14} />
            </button>
          </Inline>

        </Stack>
      </Container>
    </div>
  );
}
