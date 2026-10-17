'use client';
import Link from 'next/link';
import { useState } from 'react';

type Usage = { input_tokens: number; output_tokens: number };
type Cost = { input: number; output: number; total: number };

const usd = (n: number) => `$${n.toFixed(6)}`;

const card = 'border-border bg-surface rounded-xl border p-5';
const field =
  'border-border bg-background placeholder:text-muted focus:border-accent focus:ring-accent/30 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2';
const button =
  'bg-accent text-accent-foreground rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border rounded-lg border px-3 py-2">
      <div className="text-muted text-xs">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

export default function SimpleChatPage() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [usage, setUsage] = useState<Usage | null>(null);
  const [cost, setCost] = useState<Cost | null>(null);
  const [session, setSession] = useState({ requests: 0, input: 0, output: 0, cost: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    setLoading(true);
    setError('');
    setAnswer('');
    setUsage(null);
    setCost(null);
    try {
      const res = await fetch('/api/simpleChat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnswer(data.answer);
      setUsage(data.usage);
      setCost(data.cost);
      setSession((s) => ({
        requests: s.requests + 1,
        input: s.input + data.usage.input_tokens,
        output: s.output + data.usage.output_tokens,
        cost: s.cost + data.cost.total,
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <header>
        <Link href="/" className="text-muted hover:text-foreground text-sm">
          ← AI Product Lab
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Simple Chat</h1>
      </header>

      <section className={card}>
        <label htmlFor="prompt" className="text-sm font-medium">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt && !loading) handleSend();
          }}
          rows={4}
          placeholder="Message Claude…"
          className={`${field} mt-2 resize-y`}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-muted text-xs">⌘/Ctrl + Enter to send</span>
          <button onClick={handleSend} disabled={loading || !prompt} className={button}>
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </div>
        {error && <p className="text-danger mt-3 text-sm">{error}</p>}
      </section>

      {answer && (
        <section className={card}>
          <h2 className="text-muted text-xs font-medium tracking-wide uppercase">Reply</h2>
          <p className="mt-2 leading-relaxed whitespace-pre-wrap">{answer}</p>
          {usage && cost && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="Input" value={`${usage.input_tokens} · ${usd(cost.input)}`} />
              <Stat label="Output" value={`${usage.output_tokens} · ${usd(cost.output)}`} />
              <Stat label="Request" value={usd(cost.total)} />
            </div>
          )}
        </section>
      )}

      {session.requests > 0 && (
        <p className="text-muted font-mono text-xs">
          Session: {session.requests} req · {session.input} in · {session.output} out ·{' '}
          {usd(session.cost)}
        </p>
      )}
    </main>
  );
}
