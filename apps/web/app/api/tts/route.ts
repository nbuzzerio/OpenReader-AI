import { spawn } from "node:child_process";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text?: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const repoRoot = path.resolve(process.cwd(), "../..");
  const ttsDir = path.join(repoRoot, "services", "tts");
  const pythonPath = path.join(ttsDir, ".venv", "Scripts", "python.exe");

  const outputName = `tts-${Date.now()}.wav`;
  const ttsOutputPath = path.join(ttsDir, "outputs", outputName);
  const publicOutputPath = path.join(
    repoRoot,
    "apps",
    "web",
    "public",
    "generated",
    outputName,
  );

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      pythonPath,
      [
        "scripts/speak.py",
        "--text",
        text,
        "--voice",
        "nova.wav",
        "--output",
        outputName,
      ],
      { cwd: ttsDir },
    );

    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `TTS exited with code ${code}`));
    });
  });

  const fs = await import("node:fs/promises");
  await fs.copyFile(ttsOutputPath, publicOutputPath);

  return NextResponse.json({
    audioUrl: `/generated/${outputName}`,
  });
}
