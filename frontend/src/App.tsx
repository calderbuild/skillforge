import { useState, useRef, useEffect, useCallback } from "react";
import { GenerateForm } from "./components/GenerateForm";
import { SkillPreview } from "./components/SkillPreview";
import { ScanResult } from "./components/ScanResult";
import { HistorySidebar } from "./components/HistorySidebar";
import { useSkillGeneration } from "./hooks/useSkillGeneration";
import { useHistory, type HistoryEntry } from "./hooks/useHistory";

function App() {
  const {
    generate,
    cancel,
    reset,
    skillText,
    phase,
    scanResult,
    error,
    isStreaming,
    finalSkillMd,
  } = useSkillGeneration();

  const { entries, addEntry, removeEntry, clearAll } = useHistory();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<HistoryEntry | null>(null);

  // Track the description used for the current generation
  const lastDescRef = useRef("");
  const savedRef = useRef(false);

  const handleGenerate = useCallback(
    (description: string, templateId?: string) => {
      lastDescRef.current = description;
      savedRef.current = false;
      setViewingEntry(null);
      generate(description, templateId);
    },
    [generate]
  );

  // Auto-save to history when generation completes
  useEffect(() => {
    if (phase !== "done" || !finalSkillMd || savedRef.current) return;
    savedRef.current = true;

    const nameMatch = finalSkillMd.match(/^name:\s*(.+)$/m);
    const skillName = nameMatch ? nameMatch[1].trim() : "unnamed-skill";

    addEntry({
      description: lastDescRef.current,
      skillName,
      skillMd: finalSkillMd,
      scanScore: scanResult?.score ?? 0,
      riskLevel: scanResult?.risk_level ?? "safe",
      scanResult: scanResult ?? null,
    });
  }, [phase, finalSkillMd, scanResult, addEntry]);

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setViewingEntry(entry);
    setSidebarOpen(false);
  }, []);

  const handleReset = useCallback(() => {
    setViewingEntry(null);
    reset();
  }, [reset]);

  // Determine what to display: history entry or live generation
  const displaySkillText = viewingEntry ? viewingEntry.skillMd : skillText;
  const displayFinalMd = viewingEntry ? viewingEntry.skillMd : finalSkillMd;
  const displayScan = viewingEntry ? viewingEntry.scanResult : scanResult;
  const displayPhase = viewingEntry ? "done" : phase;

  return (
    <div className="min-h-screen forge-gradient-top forge-viewport">
      <div className="forge-atmosphere" aria-hidden="true">
        <div className="forge-orb forge-orb--one" />
        <div className="forge-orb forge-orb--two" />
        <div className="forge-grid" />
      </div>

      {/* Header */}
      <header className="border-b relative z-10" style={{ borderColor: 'var(--forge-border)' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Forge icon */}
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--forge-amber) 0%, var(--forge-amber-dim) 100%)',
                  boxShadow: '0 0 16px var(--forge-amber-glow)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L2 5v6l6 4 6-4V5L8 1z" stroke="#1a0e00" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <path d="M8 5v6M5 6.5l3 1.5 3-1.5" stroke="#1a0e00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--forge-text)' }}>
                  SkillForge
                </h1>
                <p className="text-xs" style={{ color: 'var(--forge-text-dim)' }}>
                  AI Skill Generator for OpenClaw
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 mr-3">
                <span className="status-dot" />
                <span className="text-[11px] font-mono tracking-wider uppercase" style={{ color: "var(--forge-text-muted)" }}>
                  Forge Console
                </span>
              </div>
              {viewingEntry && (
                <button
                  onClick={handleReset}
                  className="text-xs px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105"
                  style={{
                    border: '1px solid var(--forge-border)',
                    color: 'var(--forge-text-muted)',
                    background: 'var(--forge-surface)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--forge-amber-dim)';
                    e.currentTarget.style.color = 'var(--forge-amber)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--forge-border)';
                    e.currentTarget.style.color = 'var(--forge-text-muted)';
                  }}
                >
                  Back
                </button>
              )}
              {!viewingEntry && (phase || error) && (
                <button
                  onClick={handleReset}
                  className="text-xs px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105"
                  style={{
                    border: '1px solid var(--forge-border)',
                    color: 'var(--forge-text-muted)',
                    background: 'var(--forge-surface)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--forge-amber-dim)';
                    e.currentTarget.style.color = 'var(--forge-amber)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--forge-border)';
                    e.currentTarget.style.color = 'var(--forge-text-muted)';
                  }}
                >
                  New Skill
                </button>
              )}
              {/* History toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-xs px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105 flex items-center gap-1.5"
                style={{
                  border: '1px solid var(--forge-border)',
                  color: 'var(--forge-text-muted)',
                  background: 'var(--forge-surface)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--forge-amber-dim)';
                  e.currentTarget.style.color = 'var(--forge-amber)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--forge-border)';
                  e.currentTarget.style.color = 'var(--forge-text-muted)';
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                History
                {entries.length > 0 && (
                  <span
                    className="font-mono text-[10px] px-1 rounded"
                    style={{
                      background: 'var(--forge-amber-glow)',
                      color: 'var(--forge-amber)',
                    }}
                  >
                    {entries.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
        {/* Viewing history banner */}
        {viewingEntry && (
          <div
            className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg animate-scale-in"
            style={{
              background: 'var(--forge-surface)',
              border: '1px solid var(--forge-border-warm)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v5l3 3" stroke="var(--forge-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="6.5" stroke="var(--forge-text-dim)" strokeWidth="1.5"/>
            </svg>
            <span className="font-mono text-xs" style={{ color: 'var(--forge-text-muted)' }}>
              Viewing: <span style={{ color: 'var(--forge-amber)' }}>{viewingEntry.skillName}</span>
            </span>
            <span className="font-mono text-[10px] ml-auto" style={{ color: 'var(--forge-text-dim)' }}>
              {new Date(viewingEntry.createdAt).toLocaleString()}
            </span>
          </div>
        )}

        {/* Hero tagline - only when idle and not viewing history */}
        {!phase && !error && !viewingEntry && (
          <div className="text-center mb-10 sm:mb-12 animate-fade-in-up">
            <p
              className="font-mono text-[11px] tracking-[0.24em] uppercase mb-3"
              style={{ color: "var(--forge-text-dim)" }}
            >
              Secure Skill Authoring Pipeline
            </p>
            <h2 className="font-display text-[clamp(2rem,6vw,4rem)] font-extrabold tracking-tight mb-4 leading-[0.95]">
              <span className="shimmer-text">Describe it.</span>{" "}
              <span style={{ color: 'var(--forge-text)' }}>Generate it.</span>{" "}
              <span style={{ color: 'var(--forge-text-muted)' }}>Install it.</span>
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--forge-text-muted)' }}>
              Tell us what you want your AI agent to do.
              Get a working, security-scanned OpenClaw skill in seconds.
            </p>
          </div>
        )}

        {!viewingEntry && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 sm:mb-8 animate-fade-in-up delay-100">
              {[
                { title: "Generate", text: "Stream markdown from your prompt." },
                { title: "Validate", text: "Frontmatter + format checks." },
                { title: "Scan", text: "Risk score with issue breakdown." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: "var(--forge-surface)",
                    border: "1px solid var(--forge-border)",
                  }}
                >
                  <p className="text-[11px] font-mono tracking-[0.16em] uppercase mb-1" style={{ color: "var(--forge-amber)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--forge-text-muted)" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <section className="metal-panel rounded-2xl px-4 py-5 sm:px-6 sm:py-6 forge-glass">
              {/* Phase indicator bar */}
              {phase && phase !== "done" && (
                <div
                  className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg animate-scale-in"
                  style={{
                    background: 'var(--forge-surface)',
                    border: '1px solid var(--forge-border-warm)',
                    boxShadow: '0 0 20px var(--forge-amber-glow)',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-forge-pulse"
                    style={{ background: 'var(--forge-amber)' }}
                  />
                  <span className="font-mono text-xs font-medium" style={{ color: 'var(--forge-amber)' }}>
                    {phase === "generating" ? "FORGING SKILL..." :
                     phase === "validating" ? "VALIDATING FORMAT..." :
                     phase === "scanning" ? "SECURITY SCAN..." :
                     phase.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--forge-amber), var(--forge-amber-dim), transparent)',
                        animation: 'forge-shimmer 2s linear infinite',
                        backgroundSize: '200% 100%',
                      }}
                    />
                  </div>
                </div>
              )}

              <GenerateForm
                onGenerate={handleGenerate}
                isStreaming={isStreaming}
                onCancel={cancel}
              />

              {error && (
                <div
                  className="mt-6 rounded-lg p-4 text-sm animate-scale-in"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                  }}
                >
                  <span className="font-mono text-xs font-medium" style={{ color: '#ef4444' }}>ERROR </span>
                  {error}
                </div>
              )}
            </section>
          </>
        )}

        <div className="mt-2">
          <SkillPreview
            skillText={displaySkillText}
            phase={displayPhase}
            isStreaming={viewingEntry ? false : isStreaming}
            finalSkillMd={displayFinalMd}
          />

          <ScanResult result={displayScan} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 relative z-10" style={{ borderTop: '1px solid var(--forge-border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className="text-xs" style={{ color: 'var(--forge-text-dim)' }}>
            SkillForge is open source (MIT).{" "}
            <a
              href="https://github.com/calderbuild/skillforge"
              className="underline underline-offset-2 transition-colors duration-200"
              style={{ color: 'var(--forge-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--forge-amber)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--forge-text-muted)'}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--forge-text-dim)' }}>
            Built for the SURGE x OpenClaw Hackathon 2026
          </p>
        </div>
      </footer>

      {/* History Sidebar */}
      <HistorySidebar
        open={sidebarOpen}
        entries={entries}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelectHistory}
        onRemove={removeEntry}
        onClearAll={clearAll}
      />
    </div>
  );
}

export default App;
