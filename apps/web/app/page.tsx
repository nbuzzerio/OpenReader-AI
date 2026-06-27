'use client';

import { useRef, useState } from 'react';

const DEFAULT_TEXT =
  'Hello Nick. This is your local AI lab reading pasted text with a cloned voice.';

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [audioUrl, setAudioUrl] = useState('');
  const [speed, setSpeed] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  async function generateSpeech() {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = (await response.json()) as {
        audioUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.audioUrl) {
        throw new Error(data.error ?? 'Failed to generate speech.');
      }

      setAudioUrl(data.audioUrl);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.playbackRate = speed;
          void audioRef.current.play();
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsGenerating(false);
    }
  }

  function rewind(seconds: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - seconds,
    );
  }

  function updateSpeed(nextSpeed: number) {
    setSpeed(nextSpeed);

    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-3xl font-bold">Local AI Lab</h1>
        <p className="mt-2 text-sm opacity-70">
          Paste text, generate speech locally, and play it back.
        </p>
      </header>

      <textarea
        className="min-h-64 w-full rounded-lg border p-4 text-base"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={isGenerating || !text.trim()}
          onClick={generateSpeech}
        >
          {isGenerating ? 'Generating...' : 'Generate & Play'}
        </button>

        <label className="flex items-center gap-2">
          Speed
          <select
            className="rounded border px-2 py-1"
            value={speed}
            onChange={(event) => updateSpeed(Number(event.target.value))}
          >
            {[0.75, 1, 1.25, 1.5, 2, 2.5, 3].map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </label>
      </div>

      {audioUrl ? (
        <section className="flex flex-col gap-3">
          <audio ref={audioRef} controls src={audioUrl} />

          <div className="flex flex-wrap gap-2">
            {[10, 20, 30, 60].map((seconds) => (
              <button
                className="rounded border px-3 py-1"
                key={seconds}
                onClick={() => rewind(seconds)}
              >
                -{seconds}s
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p className="text-red-600">{error}</p> : null}
    </main>
  );
}