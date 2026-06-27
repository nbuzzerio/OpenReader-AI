import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    fileName: string;
  }>;
};

function isValidWavFileName(fileName: string) {
  return (
    fileName.endsWith(".wav") &&
    !fileName.includes("/") &&
    !fileName.includes("\\")
  );
}

export async function GET(request: Request, { params }: Params) {
  const { fileName } = await params;

  if (!isValidWavFileName(fileName)) {
    return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
  }

  const repoRoot = path.resolve(process.cwd(), "../..");
  const filePath = path.join(repoRoot, "services", "tts", "outputs", fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Audio file not found." },
      { status: 404 },
    );
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  if (!range) {
    const stream = fs.createReadStream(filePath);

    return new Response(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Type": "audio/wav",
        "Content-Length": String(fileSize),
        "Cache-Control": "no-store",
      },
    });
  }

  const match = range.match(/bytes=(\d*)-(\d*)/);

  if (!match) {
    return new Response(null, {
      status: 416,
      headers: {
        "Content-Range": `bytes */${fileSize}`,
      },
    });
  }

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : fileSize - 1;

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end >= fileSize ||
    start > end
  ) {
    return new Response(null, {
      status: 416,
      headers: {
        "Content-Range": `bytes */${fileSize}`,
      },
    });
  }

  const chunkSize = end - start + 1;
  const stream = fs.createReadStream(filePath, { start, end });

  return new Response(stream as unknown as BodyInit, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Type": "audio/wav",
      "Content-Length": String(chunkSize),
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Cache-Control": "no-store",
    },
  });
}
