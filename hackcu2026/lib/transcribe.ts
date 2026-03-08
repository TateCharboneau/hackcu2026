/**
 * Audio transcription helpers.
 *
 * Supports two input modes:
 *   1. URL  — downloads audio via yt-dlp (YouTube Shorts, TikTok, Instagram Reels)
 *   2. File — raw audio buffer sent directly to OpenAI Whisper API
 *
 * Requires:
 *   - yt-dlp installed on the server: `brew install yt-dlp`
 *   - OPENAI_API_KEY in .env.local
 */

import { spawn } from "child_process";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

/* ── Public API ─────────────────────────────────────────── */

/**
 * Download audio from a video URL and return a transcript.
 * Supports: YouTube Shorts, TikTok, Instagram Reels (anything yt-dlp supports).
 */
export async function transcribeFromUrl(url: string): Promise<string> {
  const audioBuffer = await downloadAudio(url);
  return transcribeBuffer(audioBuffer, "audio.mp3");
}

/**
 * Transcribe a raw audio buffer (e.g., from a file upload).
 * `filename` should include an extension yt-dlp / Whisper can recognise (.mp3, .mp4, .m4a, .webm).
 */
export async function transcribeBuffer(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[transcribe] No OPENAI_API_KEY — returning mock transcript");
    return MOCK_TRANSCRIPT;
  }

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: "audio/mpeg" }),
    filename,
  );
  formData.append("model", "whisper-1");
  formData.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Whisper API error (${res.status}): ${body}`);
  }

  const json = await res.json();
  const text: string = json.text ?? "";

  if (!text.trim()) {
    throw new Error("Whisper returned an empty transcript.");
  }

  return text.trim();
}

/* ── yt-dlp download ────────────────────────────────────── */

async function downloadAudio(url: string): Promise<Buffer> {
  // Create an isolated temp directory for this job
  const dir = await mkdtemp(join(tmpdir(), "hackcu-audio-"));
  const outputPath = join(dir, "audio.mp3");

  try {
    await runYtDlp(url, outputPath);
    const buffer = await readFile(outputPath);
    return buffer;
  } finally {
    // Clean up regardless of success/failure
    await rm(dir, { recursive: true, force: true });
  }
}

function runYtDlp(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // -x            : extract audio only
    // --audio-format: convert to mp3
    // --no-playlist : single video, not the whole playlist
    // -o            : output path
    const args = [
      "-x",
      "--audio-format", "mp3",
      "--audio-quality", "5",   // 0=best, 9=worst; 5 is fast and good enough for speech
      "--no-playlist",
      "--quiet",
      "-o", outputPath,
      url,
    ];

    const proc = spawn("yt-dlp", args);

    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `yt-dlp exited with code ${code}. Make sure yt-dlp is installed (brew install yt-dlp).\n${stderr}`,
          ),
        );
      }
    });

    proc.on("error", (err) => {
      reject(
        new Error(
          `Failed to spawn yt-dlp: ${err.message}. Install it with: brew install yt-dlp`,
        ),
      );
    });
  });
}

/* ── Mock fallback if no API key is set ──────────────────────────────────────── */

const MOCK_TRANSCRIPT =
  "Guys, put all your money into Tesla calls, guaranteed win, can't lose. " +
  "This is a once in a lifetime opportunity, trust me, go all in with max leverage.";
