import { NextResponse } from "next/server";

const TTS_SERVER_URL = "http://127.0.0.1:8765";

export async function POST(request: Request) {
  const { text, title } = (await request.json()) as {
    text?: string;
    title?: string;
  };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const response = await fetch(`${TTS_SERVER_URL}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, title }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "TTS server failed to start generation." },
      { status: 500 },
    );
  }

  return NextResponse.json(await response.json());
}
