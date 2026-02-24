import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  prompt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

interface Props {
  onGenerate: (description: string, templateId?: string) => void;
  isStreaming: boolean;
  onCancel: () => void;
}

export function GenerateForm({ onGenerate, isStreaming, onCancel }: Props) {
  const [description, setDescription] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/templates`)
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onGenerate(description.trim(), selectedTemplate || undefined);
  };

  const handleTemplateClick = (t: Template) => {
    setDescription(t.prompt);
    setSelectedTemplate(t.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Textarea */}
      <div className="animate-fade-in-up delay-100">
        <label
          htmlFor="description"
          className="block text-xs font-medium mb-2 font-mono tracking-wider uppercase"
          style={{ color: 'var(--forge-text-muted)' }}
        >
          Describe the skill you want to forge
        </label>
        <div
          className="relative rounded-lg transition-all duration-300"
          style={{
            boxShadow: isFocused
              ? '0 0 30px var(--forge-amber-glow), 0 0 60px rgba(245, 158, 11, 0.05)'
              : 'none',
          }}
        >
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSelectedTemplate(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="e.g., Create a skill that summarizes my emails every morning and sends a digest..."
            rows={4}
            maxLength={5000}
            className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none transition-colors duration-200"
            style={{
              background: 'var(--forge-surface)',
              border: `1px solid ${isFocused ? 'var(--forge-amber-dim)' : 'var(--forge-border)'}`,
              color: 'var(--forge-text)',
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
            disabled={isStreaming}
          />
          {/* Corner accent */}
          <div
            className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
            style={{
              background: 'linear-gradient(225deg, var(--forge-amber-glow) 0%, transparent 60%)',
              borderRadius: '0 0.5rem 0 0',
              opacity: isFocused ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-xs font-mono" style={{ color: 'var(--forge-text-dim)' }}>
            {description.length > 0 ? `${description.length.toLocaleString()} chars` : ''}
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--forge-text-dim)' }}>
            {description.length}/5,000
          </span>
        </div>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div className="animate-fade-in-up delay-200">
          <p className="text-xs font-mono tracking-wider uppercase mb-3" style={{ color: 'var(--forge-text-dim)' }}>
            Quick start templates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {templates.map((t, index) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTemplateClick(t)}
                disabled={isStreaming}
                className="text-left p-4 rounded-lg transition-all duration-200 group"
                style={{
                  background: selectedTemplate === t.id
                    ? 'var(--forge-surface-raised)'
                    : 'var(--forge-surface)',
                  border: `1px solid ${selectedTemplate === t.id ? 'var(--forge-amber-dim)' : 'var(--forge-border)'}`,
                  boxShadow: selectedTemplate === t.id
                    ? '0 0 20px var(--forge-amber-glow)'
                    : 'none',
                  opacity: isStreaming ? 0.5 : 1,
                  animationDelay: `${(index + 3) * 100}ms`,
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate !== t.id) {
                    e.currentTarget.style.borderColor = 'var(--forge-text-dim)';
                    e.currentTarget.style.background = 'var(--forge-surface-raised)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate !== t.id) {
                    e.currentTarget.style.borderColor = 'var(--forge-border)';
                    e.currentTarget.style.background = 'var(--forge-surface)';
                  }
                }}
              >
                <div className="font-medium text-sm mb-1" style={{ color: 'var(--forge-text)' }}>
                  {t.name}
                </div>
                <div className="text-xs leading-relaxed mb-2" style={{ color: 'var(--forge-text-muted)' }}>
                  {t.description}
                </div>
                <div
                  className="text-xs font-mono"
                  style={{ color: selectedTemplate === t.id ? 'var(--forge-amber)' : 'var(--forge-text-dim)' }}
                >
                  {t.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 animate-fade-in-up delay-300">
        <button
          type="submit"
          disabled={isStreaming || !description.trim()}
          className="flex-1 rounded-lg px-6 py-3 font-display font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isStreaming
              ? 'var(--forge-amber-dim)'
              : 'linear-gradient(135deg, var(--forge-amber) 0%, var(--forge-amber-dim) 100%)',
            color: '#1a0e00',
            boxShadow: !isStreaming && description.trim()
              ? '0 0 20px var(--forge-amber-glow), 0 4px 12px rgba(0,0,0,0.3)'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (!isStreaming && description.trim()) {
              e.currentTarget.style.boxShadow = '0 0 30px var(--forge-amber-glow), 0 0 60px rgba(245, 158, 11, 0.1), 0 4px 12px rgba(0,0,0,0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = !isStreaming && description.trim()
              ? '0 0 20px var(--forge-amber-glow), 0 4px 12px rgba(0,0,0,0.3)'
              : 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isStreaming ? "Forging..." : "Forge Skill"}
        </button>
        {isStreaming && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-6 py-3 text-sm transition-all duration-200"
            style={{
              border: '1px solid var(--forge-border)',
              color: 'var(--forge-text-muted)',
              background: 'var(--forge-surface)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--forge-text-dim)';
              e.currentTarget.style.color = 'var(--forge-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--forge-border)';
              e.currentTarget.style.color = 'var(--forge-text-muted)';
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
