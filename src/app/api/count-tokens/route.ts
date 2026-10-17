import { NextResponse } from 'next/server';
import { MODEL } from '@/lib/pricing';

// Counts input tokens for each text without generating a reply (count_tokens is free)
export async function POST(req: Request) {
  const { texts } = await req.json();

  if (!Array.isArray(texts) || !texts.every((t) => typeof t === 'string' && t)) {
    return NextResponse.json({ error: 'texts must be non-empty strings' }, { status: 400 });
  }

  try {
    const counts = await Promise.all(
      texts.map(async (text: string) => {
        const res = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [{ role: 'user', content: text }],
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        return data.input_tokens as number;
      }),
    );
    return NextResponse.json({ counts });
  } catch (e) {
    console.error(e); // log details server-side only
    return NextResponse.json({ error: 'Token count failed' }, { status: 502 });
  }
}
