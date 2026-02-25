import type { HistoryEntry } from "../hooks/useHistory";

interface Props {
  open: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const RISK_COLORS: Record<string, string> = {
  safe: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export function HistorySidebar({
  open,
  entries,
  onClose,
  onSelect,
  onRemove,
  onClearAll,
}: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="history-backdrop"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="history-drawer"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--forge-border)" }}
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v5l3 3"
                stroke="var(--forge-amber)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="var(--forge-text-dim)"
                strokeWidth="1.5"
              />
            </svg>
            <span
              className="font-mono text-xs tracking-wider uppercase"
              style={{ color: "var(--forge-text-muted)" }}
            >
              History
            </span>
            {entries.length > 0 && (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: "var(--forge-surface)",
                  color: "var(--forge-text-dim)",
                  border: "1px solid var(--forge-border)",
                }}
              >
                {entries.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors duration-150"
            style={{ color: "var(--forge-text-dim)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--forge-text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--forge-text-dim)")
            }
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {entries.length === 0 && (
            <div className="text-center py-12">
              <p
                className="text-xs"
                style={{ color: "var(--forge-text-dim)" }}
              >
                No history yet.
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--forge-text-dim)" }}
              >
                Generated skills will appear here.
              </p>
            </div>
          )}

          {entries.map((entry) => {
            const riskColor =
              RISK_COLORS[entry.riskLevel] || "var(--forge-text-dim)";
            return (
              <div
                key={entry.id}
                className="group rounded-lg p-3 transition-all duration-150 cursor-pointer"
                style={{
                  background: "var(--forge-surface)",
                  border: "1px solid var(--forge-border)",
                }}
                onClick={() => onSelect(entry)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--forge-amber-dim)";
                  e.currentTarget.style.boxShadow =
                    "0 0 12px var(--forge-amber-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--forge-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--forge-text)" }}
                    >
                      {entry.skillName}
                    </p>
                    <p
                      className="text-xs mt-0.5 line-clamp-2"
                      style={{ color: "var(--forge-text-muted)" }}
                    >
                      {entry.description}
                    </p>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(entry.id);
                    }}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ color: "var(--forge-text-dim)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--forge-text-dim)")
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="font-mono text-[10px] font-medium"
                    style={{ color: riskColor }}
                  >
                    {entry.scanScore}/100
                  </span>
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase"
                    style={{
                      color: riskColor,
                      background: `${riskColor}14`,
                      border: `1px solid ${riskColor}30`,
                    }}
                  >
                    {entry.riskLevel}
                  </span>
                  <span
                    className="font-mono text-[10px] ml-auto"
                    style={{ color: "var(--forge-text-dim)" }}
                  >
                    {formatTime(entry.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div
            className="px-5 py-3"
            style={{ borderTop: "1px solid var(--forge-border)" }}
          >
            <button
              onClick={onClearAll}
              className="w-full text-xs font-mono py-2 rounded-md transition-all duration-150"
              style={{
                border: "1px solid var(--forge-border)",
                color: "var(--forge-text-dim)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--forge-border)";
                e.currentTarget.style.color = "var(--forge-text-dim)";
              }}
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </>
  );
}
