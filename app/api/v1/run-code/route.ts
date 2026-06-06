import { NextResponse } from "next/server";

// Judge0 CE on RapidAPI — proxied so the browser never sees the API key.
// Set these env vars in `.env.local`:
//   JUDGE0_RAPIDAPI_KEY=<your key>
//   JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com   (optional, default below)
const JUDGE0_HOST = process.env.JUDGE0_RAPIDAPI_HOST ?? "judge0-ce.p.rapidapi.com";
const JUDGE0_URL = `https://${JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`;

// UI language id -> Judge0 language_id
// See https://judge0.com/#about-supported-languages-and-versions
const LANGUAGE_MAP: Record<string, { id: number; label: string }> = {
  js:         { id: 63, label: "JavaScript (Node.js 12.14.0)" },
  javascript: { id: 63, label: "JavaScript (Node.js 12.14.0)" },
  python:     { id: 71, label: "Python (3.8.1)" },
  py:         { id: 71, label: "Python (3.8.1)" },
  java:       { id: 62, label: "Java (OpenJDK 13.0.1)" },
  cpp:        { id: 54, label: "C++ (GCC 9.2.0)" },
  "c++":      { id: 54, label: "C++ (GCC 9.2.0)" },
};

type RunCodeBody = {
  language?: string;
  code?: string;
  stdin?: string;
};

type Judge0Response = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: { id: number; description: string };
};

export async function POST(request: Request) {
  const apiKey = process.env.JUDGE0_RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "JUDGE0_RAPIDAPI_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: RunCodeBody;
  try {
    body = (await request.json()) as RunCodeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { language, code, stdin } = body;

  if (!language || typeof language !== "string") {
    return NextResponse.json({ error: "`language` is required." }, { status: 400 });
  }
  if (typeof code !== "string" || code.length === 0) {
    return NextResponse.json({ error: "`code` is required." }, { status: 400 });
  }

  const mapped = LANGUAGE_MAP[language.toLowerCase()];
  if (!mapped) {
    return NextResponse.json(
      { error: `Unsupported language: ${language}` },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": JUDGE0_HOST,
      },
      body: JSON.stringify({
        language_id: mapped.id,
        source_code: code,
        stdin: typeof stdin === "string" ? stdin : "",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Judge0 error (${response.status}): ${text || response.statusText}` },
        { status: response.status }
      );
    }

    const result = (await response.json()) as Judge0Response;

    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";
    const compileOutput = result.compile_output ?? "";
    const statusDesc = result.status?.description ?? "";
    const exitCode = result.status?.id === 3 ? 0 : 1; // status 3 = Accepted

    // Shape the response to match what the frontend already consumes:
    // { compile: { stderr, ... } | null, run: { stdout, stderr, code, ... } }
    return NextResponse.json({
      language: mapped.label,
      version: null,
      status: statusDesc,
      time: result.time,
      memory: result.memory,
      compile: compileOutput
        ? {
            stdout: "",
            stderr: compileOutput,
            output: compileOutput,
            code: null,
            signal: null,
          }
        : null,
      run: {
        stdout,
        stderr: stderr || (result.message ?? ""),
        output: stdout + stderr,
        code: exitCode,
        signal: null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to execute code.",
      },
      { status: 500 }
    );
  }
}
