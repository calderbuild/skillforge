import { useState, useCallback, useRef } from "react";

export interface ScanResult {
  score: number;
  risk_level: string;
  issues: Array<{ severity: string; message: string; line: number | null }>;
  summary: Record<string, number>;
  disclaimer: string;
}

interface StreamEvent {
  type: "phase" | "token" | "validation" | "scan_result" | "done" | "error";
  phase?: string;
  content?: string;
  valid?: boolean;
  error?: string | null;
  retrying?: boolean;
  results?: ScanResult;
  skill_md?: string;
}

function normalizeApiBase(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed[0] === trimmed[trimmed.length - 1] && (`"'`.includes(trimmed[0]))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE) ||
  (import.meta.env.PROD
    ? "https://skillforge-backend.vercel.app"
    : "http://127.0.0.1:8000");

export function useSkillGeneration() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [skillText, setSkillText] = useState("");
  const [phase, setPhase] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalSkillMd, setFinalSkillMd] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (description: string, templateId?: string) => {
      setSkillText("");
      setPhase("generating");
      setScanResult(null);
      setError(null);
      setFinalSkillMd("");
      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${API_BASE}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            template_id: templateId || null,
          }),
          signal: abortRef.current.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.detail || `HTTP ${res.status}`
          );
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));
              switch (event.type) {
                case "phase":
                  setPhase(event.phase!);
                  break;
                case "token":
                  setSkillText((prev) => prev + event.content);
                  break;
                case "validation":
                  if (!event.valid && !event.retrying) {
                    setError(`Validation failed: ${event.error}`);
                  }
                  break;
                case "scan_result":
                  setScanResult(event.results!);
                  setPhase("done");
                  break;
                case "done":
                  setFinalSkillMd(event.skill_md || "");
                  setPhase("done");
                  break;
                case "error":
                  setError(event.content!);
                  break;
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network"))) {
          setError("Cannot reach the backend server. Make sure it is running on " + API_BASE);
        } else {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setSkillText("");
    setPhase("");
    setScanResult(null);
    setError(null);
    setFinalSkillMd("");
  }, []);

  return {
    generate,
    cancel,
    reset,
    skillText,
    phase,
    scanResult,
    error,
    isStreaming,
    finalSkillMd,
  };
}
