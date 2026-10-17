'use client';
import Link from 'next/link';
import { useState } from 'react';

const LANGUAGES = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Chinese',
  'Japanese',
  'Korean',
  'Russian',
];

// The first box has no language (accepts any); added boxes require one
type Box = { id: number; lang: string | null; text: string };

const card = 'border-border bg-surface rounded-xl border p-5';
const field =
  'border-border bg-background placeholder:text-muted focus:border-accent focus:ring-accent/30 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2';
const button =
  'bg-accent text-accent-foreground rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButton =
  'border-border bg-surface hover:border-accent rounded-lg border px-4 py-2 text-sm font-medium shadow-sm shadow-black/10 transition-colors active:shadow-none';
const deleteButton =
  'border-danger/50 bg-surface text-danger hover:border-danger hover:bg-danger/10 focus-visible:ring-danger/30 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm shadow-black/10 transition-colors outline-none focus-visible:ring-2 active:shadow-none';

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

let nextId = 1;

export default function TokenCalculatorPage() {
  const [boxes, setBoxes] = useState<Box[]>([{ id: 0, lang: null, text: '' }]);
  // Token counts keyed by exact text, so unchanged boxes never hit the API again
  const [cache, setCache] = useState<Record<string, number>>({});
  // Snapshot of the boxes at the last successful submit, for the results table
  const [results, setResults] = useState<Box[] | null>(null);
  const [counting, setCounting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function updateBox(id: number, patch: Partial<Box>) {
    setBoxes((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setResults(null);
  }

  function addBox() {
    setBoxes((bs) => [...bs, { id: nextId++, lang: LANGUAGES[0], text: '' }]);
    setResults(null);
  }

  function removeBox(id: number) {
    setBoxes((bs) => bs.filter((b) => b.id !== id));
    setResults(null);
  }

  async function handleSubmit() {
    setSubmitted(true);
    setError('');
    if (boxes.some((b) => !b.text.trim())) {
      setError('Every text box needs some text. Fill it in or delete it.');
      return;
    }
    const missing = [...new Set(boxes.map((b) => b.text))].filter((t) => !(t in cache));
    if (missing.length === 0) {
      setResults(boxes);
      return;
    }
    setCounting(true);
    try {
      const res = await fetch('/api/count-tokens', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ texts: missing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCache((c) => ({
        ...c,
        ...Object.fromEntries(missing.map((t, i) => [t, data.counts[i] as number])),
      }));
      setResults(boxes);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCounting(false);
    }
  }

  const label = (b: Box) => b.lang ?? 'Text';

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <header>
        <Link href="/" className="text-muted hover:text-foreground text-sm">
          ← AI Product Lab
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Token Calculator</h1>
        <p className="text-muted mt-1 text-sm">
          Count input tokens for any text (free, no reply). Add boxes to compare languages.
        </p>
      </header>

      <section className={card}>
        <div className="space-y-4">
          {boxes.map((b, i) => {
            const empty = submitted && !b.text.trim();
            const tokens = cache[b.text];
            return (
              <div key={b.id}>
                <div className="flex items-center justify-between gap-2">
                  {b.lang === null ? (
                    <label htmlFor={`text-${b.id}`} className="text-sm font-medium">
                      Text (any language)
                    </label>
                  ) : (
                    <select
                      aria-label="Language"
                      value={b.lang}
                      onChange={(e) => updateBox(b.id, { lang: e.target.value })}
                      className="border-border bg-background focus:border-accent rounded-lg border px-2 py-1 text-sm outline-none"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex items-center gap-3">
                    {tokens !== undefined && (
                      <span className="text-muted font-mono text-xs">{tokens} tokens</span>
                    )}
                    {i > 0 && (
                      <button
                        onClick={() => removeBox(b.id)}
                        className={deleteButton}
                        aria-label={`Delete ${label(b)} box`}
                      >
                        <TrashIcon />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  id={`text-${b.id}`}
                  value={b.text}
                  onChange={(e) => updateBox(b.id, { text: e.target.value })}
                  rows={3}
                  placeholder={b.lang ? `Enter ${b.lang} text…` : 'Enter text in any language…'}
                  className={`${field} mt-2 resize-y ${empty ? 'border-danger' : ''}`}
                />
                {empty && <p className="text-danger mt-1 text-xs">Text is required.</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={addBox} className={secondaryButton}>
            + Add language
          </button>
          <button onClick={handleSubmit} disabled={counting} className={button}>
            {counting ? 'Counting…' : 'Count tokens'}
          </button>
        </div>
        {error && <p className="text-danger mt-3 text-sm">{error}</p>}
      </section>

      {results && (
        <section className={card}>
          <h2 className="text-muted text-xs font-medium tracking-wide uppercase">Results</h2>
          <table className="mt-2 w-full text-sm">
            <thead className="text-muted text-left text-xs">
              <tr className="border-border border-b">
                <th className="py-2 font-medium">Box</th>
                <th className="py-2 text-right font-medium">Chars</th>
                <th className="py-2 text-right font-medium">Input tokens</th>
                {results.length > 1 && <th className="py-2 text-right font-medium">vs first</th>}
              </tr>
            </thead>
            <tbody className="font-mono">
              {results.map((b) => (
                <tr key={b.id} className="border-border border-b last:border-0">
                  <td className="py-2 font-sans">{label(b)}</td>
                  <td className="py-2 text-right">{[...b.text].length}</td>
                  <td className="py-2 text-right">{cache[b.text]}</td>
                  {results.length > 1 && (
                    <td className="py-2 text-right">
                      {(cache[b.text] / cache[results[0].text]).toFixed(2)}×
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-muted mt-3 text-xs">
            Counts include ~10 tokens of fixed message overhead, the same for every row.
          </p>
        </section>
      )}
    </main>
  );
}
