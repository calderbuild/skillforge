import { useState } from "react";

interface Props {
  skillText: string;
  phase: string;
  isStreaming: boolean;
  finalSkillMd: string;
}

export function SkillPreview({
  skillText,
  phase,
  isStreaming,
  finalSkillMd,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);

  const displayText = finalSkillMd || skillText;
  if (!displayText && phase !== "generating") return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalSkillMd || skillText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([finalSkillMd || skillText], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Extract skill name from frontmatter for install command
  const nameMatch = displayText.match(/^name:\s*(.+)$/m);
  const skillName = nameMatch ? nameMatch[1].trim() : "my-skill";
  const installCmd = `mkdir -p ~/.openclaw/skills/${skillName} && curl -o ~/.openclaw/skills/${skillName}/SKILL.md [YOUR_URL]`;

  return (
    <div className="mt-8 animate-fade-in-up">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isStreaming ? 'var(--forge-amber)' : phase === 'done' ? '#22c55e' : 'var(--forge-text-dim)',
              boxShadow: isStreaming ? '0 0 8px var(--forge-amber-glow)' : 'none',
              animation: isStreaming ? 'forge-pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--forge-text-muted)' }}>
            SKILL.md
          </span>
        </div>
        {displayText && !isStreaming && (
          <div className="flex gap-1.5">
            <ActionButton onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </ActionButton>
            <ActionButton onClick={handleDownload}>
              Download
            </ActionButton>
          </div>
        )}
      </div>

      {/* Code panel */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          border: `1px solid ${isStreaming ? 'var(--forge-border-warm)' : 'var(--forge-border)'}`,
          boxShadow: isStreaming
            ? '0 0 30px var(--forge-amber-glow), inset 0 1px 0 rgba(245, 158, 11, 0.05)'
            : 'none',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
      >
        {/* Top accent line */}
        <div
          className="h-px"
          style={{
            background: isStreaming
              ? 'linear-gradient(90deg, transparent, var(--forge-amber), transparent)'
              : 'linear-gradient(90deg, transparent, var(--forge-border), transparent)',
          }}
        />

        <pre
          className="p-4 text-xs leading-relaxed overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap font-mono"
          style={{
            background: 'var(--forge-bg)',
            color: 'var(--forge-text)',
            tabSize: 2,
          }}
        >
          {displayText}
          {isStreaming && phase === "generating" && (
            <span
              className="inline-block w-1.5 h-3.5 ml-0.5"
              style={{
                background: 'var(--forge-amber)',
                animation: 'forge-pulse 0.8s ease-in-out infinite',
                borderRadius: '1px',
                boxShadow: '0 0 6px var(--forge-amber-glow)',
              }}
            />
          )}
        </pre>
      </div>

      {/* Install command */}
      {!isStreaming && finalSkillMd && (
        <div className="mt-4 animate-fade-in-up">
          <p className="text-xs font-mono tracking-wider uppercase mb-2" style={{ color: 'var(--forge-text-dim)' }}>
            Install
          </p>
          <div
            className="flex items-center gap-2 rounded-lg p-3"
            style={{
              background: 'var(--forge-surface)',
              border: '1px solid var(--forge-border)',
            }}
          >
            <code className="flex-1 text-xs font-mono overflow-x-auto" style={{ color: 'var(--forge-text-muted)' }}>
              {installCmd}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(installCmd);
                setCmdCopied(true);
                setTimeout(() => setCmdCopied(false), 2000);
              }}
              className="text-xs font-mono px-2 py-1 rounded transition-all duration-200 shrink-0"
              style={{
                border: '1px solid var(--forge-border)',
                color: cmdCopied ? 'var(--forge-amber)' : 'var(--forge-text-dim)',
                background: 'var(--forge-bg)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--forge-amber-dim)';
                e.currentTarget.style.color = 'var(--forge-amber)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--forge-border)';
                e.currentTarget.style.color = cmdCopied ? 'var(--forge-amber)' : 'var(--forge-text-dim)';
              }}
            >
              {cmdCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-mono px-2.5 py-1 rounded transition-all duration-200"
      style={{
        border: '1px solid var(--forge-border)',
        color: 'var(--forge-text-dim)',
        background: 'var(--forge-surface)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--forge-amber-dim)';
        e.currentTarget.style.color = 'var(--forge-amber)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--forge-border)';
        e.currentTarget.style.color = 'var(--forge-text-dim)';
      }}
    >
      {children}
    </button>
  );
}
