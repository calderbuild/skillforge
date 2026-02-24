import { GenerateForm } from "./components/GenerateForm";
import { SkillPreview } from "./components/SkillPreview";
import { ScanResult } from "./components/ScanResult";
import { useSkillGeneration } from "./hooks/useSkillGeneration";

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

  return (
    <div className="min-h-screen forge-gradient-top">
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--forge-border)' }}>
        <div className="max-w-2xl mx-auto px-6 py-5">
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
                <h1 className="font-display text-lg font-bold tracking-tight" style={{ color: 'var(--forge-text)' }}>
                  SkillForge
                </h1>
                <p className="text-xs" style={{ color: 'var(--forge-text-dim)' }}>
                  AI Skill Generator for OpenClaw
                </p>
              </div>
            </div>
            {(phase || error) && (
              <button
                onClick={reset}
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
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Hero tagline - only when idle */}
        {!phase && !error && (
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-display text-4xl font-extrabold tracking-tight mb-4">
              <span className="shimmer-text">Describe it.</span>{" "}
              <span style={{ color: 'var(--forge-text)' }}>Generate it.</span>{" "}
              <span style={{ color: 'var(--forge-text-muted)' }}>Install it.</span>
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'var(--forge-text-muted)' }}>
              Tell us what you want your AI agent to do.
              Get a working, security-scanned OpenClaw skill in seconds.
            </p>
          </div>
        )}

        {/* Phase indicator bar */}
        {phase && phase !== "done" && (
          <div
            className="mb-8 flex items-center gap-3 px-4 py-3 rounded-lg animate-scale-in"
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
          onGenerate={generate}
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

        <SkillPreview
          skillText={skillText}
          phase={phase}
          isStreaming={isStreaming}
          finalSkillMd={finalSkillMd}
        />

        <ScanResult result={scanResult} />
      </main>

      {/* Footer */}
      <footer className="mt-20" style={{ borderTop: '1px solid var(--forge-border)' }}>
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <p className="text-xs" style={{ color: 'var(--forge-text-dim)' }}>
            SkillForge is open source (MIT).{" "}
            <a
              href="https://github.com/calderbuild/openclaw-surge-hackathon"
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
    </div>
  );
}

export default App;
