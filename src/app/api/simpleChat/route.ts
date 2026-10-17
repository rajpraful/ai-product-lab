import { NextResponse } from 'next/server';
import { MODEL, costOf, type Usage } from '@/lib/pricing';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error(await res.text()); // log details server-side only
    return NextResponse.json({ error: 'Model request failed' }, { status: 502 });
  }

  const data = await res.json();
  // The response is an array of content blocks; keep the text ones
  const answer = data.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('');

  // usage.output_tokens includes any (hidden) thinking tokens, which are billed as output
  const usage: Usage = data.usage;
  return NextResponse.json({ answer, usage, cost: costOf(usage) });
}
