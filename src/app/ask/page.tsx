'use client';
import { useState } from 'react';

export default function AskPage() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAsk() {
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnswer(data.answer);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto' }}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{ width: '100%' }}
      />
      <button onClick={handleAsk} disabled={loading || !prompt}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {answer && <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>}
    </main>
  );
}
