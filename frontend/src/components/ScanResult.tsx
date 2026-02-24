import type { ScanResult as ScanResultType } from "../hooks/useSkillGeneration";

interface Props {
  result: ScanResultType | null;
}

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  safe: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)' },
  medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)' },
  high: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.2)' },
  critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)' },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#6b7280',
};

export function ScanResult({ result }: Props) {
  if (!result) return null;

  const risk = RISK_CONFIG[result.risk_level] || RISK_CONFIG.safe;
  const circumference = 2 * Math.PI * 28;
  const dashArray = (result.score / 100) * circumference;

  const scoreColor = result.score >= 80 ? '#22c55e' : result.score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mt-8 animate-fade-in-up">
      <p className="text-xs font-mono tracking-wider uppercase mb-3" style={{ color: 'var(--forge-text-dim)' }}>
        Security Scan
      </p>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          border: `1px solid ${risk.border}`,
          background: 'var(--forge-surface)',
        }}
      >
        {/* Top accent */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${risk.color}, transparent)` }} />

        <div className="p-5">
          <div className="flex items-center gap-5">
            {/* Score ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none" stroke="var(--forge-border)" strokeWidth="3"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="3"
                  strokeDasharray={`${dashArray} ${circumference}`}
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 4px ${scoreColor}40)`,
                    transition: 'stroke-dasharray 1s ease-out',
                  }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center font-display text-base font-bold"
                style={{ color: scoreColor }}
              >
                {result.score}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-medium"
                  style={{
                    background: risk.bg,
                    color: risk.color,
                    border: `1px solid ${risk.border}`,
                  }}
                >
                  {result.risk_level.toUpperCase()}
                </span>
                {result.issues.length === 0 && (
                  <span className="text-xs" style={{ color: '#22c55e' }}>
                    No issues detected
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--forge-text-dim)' }}>
                {result.disclaimer}
              </p>
            </div>
          </div>

          {/* Issues list */}
          {result.issues.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--forge-border)' }}>
              <p className="text-xs font-mono mb-3" style={{ color: 'var(--forge-text-muted)' }}>
                {result.issues.length} issue{result.issues.length > 1 ? 's' : ''} found
              </p>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-xs rounded-md px-3 py-2"
                    style={{ background: 'var(--forge-bg)' }}
                  >
                    <span
                      className="font-mono font-medium uppercase shrink-0 w-14"
                      style={{ color: SEVERITY_COLORS[issue.severity] || 'var(--forge-text-dim)' }}
                    >
                      {issue.severity}
                    </span>
                    <span className="flex-1" style={{ color: 'var(--forge-text)' }}>
                      {issue.message}
                    </span>
                    {issue.line && (
                      <span className="font-mono shrink-0" style={{ color: 'var(--forge-text-dim)' }}>
                        L{issue.line}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
