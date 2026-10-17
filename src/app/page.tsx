import Link from 'next/link';

const EXPERIMENTS = [
  {
    href: '/simpleChat',
    title: 'Simple Chat',
    description: 'Send a prompt to Claude and see token usage and cost per request.',
  },
  {
    href: '/tokenCalculator',
    title: 'Token Calculator',
    description: 'Count input tokens for any text and compare counts across languages.',
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">AI Product Lab</h1>
      <p className="text-muted mt-2">Small experiments with the Claude API.</p>
      <ul className="mt-10 grid gap-4">
        {EXPERIMENTS.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className="border-border bg-surface hover:border-accent block rounded-xl border p-5 transition-colors"
            >
              <h2 className="font-medium">{e.title} →</h2>
              <p className="text-muted mt-1 text-sm">{e.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
