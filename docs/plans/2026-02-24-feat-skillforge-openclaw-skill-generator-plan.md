---
title: "SkillForge - Open-Source AI Skill Generator for OpenClaw"
type: feat
date: 2026-02-24
deepened: 2026-02-24
hackathon: SURGE x OpenClaw Hackathon
deadline: 2026-03-01
---

# SkillForge - Open-Source AI Skill Generator for OpenClaw

> "Describe what you want your AI agent to do. Get a working, security-verified OpenClaw skill in 60 seconds."

## Enhancement Summary

**Deepened on:** 2026-02-24
**Research agents used:** 7 (Security Review, Performance Review, Architecture Review, Spec-Flow Analysis, SKILL.md Format Research, FastAPI Streaming Research, Prompt Injection Detection)

### Key Improvements

1. **Scope reduction** -- 原计划工作量是 5 天的 2 倍，砍掉 AI 语义扫描引擎（MVP 仅用静态规则）、SQLite 存储（无状态管线不需要）、模板从 10 个减至 3 个、部署合并为单 Railway 服务
2. **具体代码模式** -- 新增 SSE 流式架构完整代码（后端 FastAPI + Anthropic SDK，前端 React hook）、YAML 校验函数、静态扫描规则正则、系统 prompt 模板
3. **安全加固路线图** -- 5 天逐日安全加固计划，涵盖 prompt hardening、输出约束、编码归一化、XSS 防护、CORS 锁定
4. **API 契约定义** -- 明确 SSE 事件协议（type: token/phase/static_scan/done/error）、请求/响应 Pydantic 模型
5. **用户流程补全** -- 5 条完整用户流程、29 个 gap 识别、16 个关键决策点及默认假设

### New Considerations Discovered

- AI 语义扫描本质上是一个独立 LLM 产品，MVP 阶段砍掉不影响核心价值
- 安全声明必须诚实：扫描器定位为"defense in depth"，明确标注"AI 分析仅供参考"
- LLM 经常生成无效 YAML frontmatter，必须做后生成校验 + 一次重试
- 部署不需要 Vercel + Railway 两套，FastAPI 直接 serve React 静态文件即可

---

## 一句话目标

SkillForge 是一个免费开源的 OpenClaw 技能生成器，用自然语言描述需求即可生成安全可用的 SKILL.md，内置安全扫描确保生成的技能不含恶意代码。类比 VibeDoc 之于开发计划，SkillForge 之于 OpenClaw 技能。

## 背景：为什么做这个

### 用户痛点（来源：UX 评测 + 社区反馈）

1. **"我该让 Agent 做什么？"** -- 最大痛点，用户装好 OpenClaw 后不知道下一步（来源：UCStrategies 报道、UX Writing Hub 评测）
2. **技能创建门槛高** -- 需要掌握 YAML frontmatter、SKILL.md 结构、权限声明等技术知识
3. **不敢装第三方技能** -- ClawHub 上 12-20% 技能是恶意软件（1,184+ ClawHavoc 攻击、Snyk/Trend Micro 报告）
4. **现有生成器收费且闭源** -- skills-openclaw.com 收费 0.80-1.50 欧/技能，闭源

### 竞品全景

| 产品 | 类型 | 价格 | 安全扫描 | 开源 | Agent 集成 |
|------|------|------|----------|------|-----------|
| skills-openclaw.com | Web SaaS | 0.80-1.50 EUR/技能 | 无 | 闭源 | 无（手动下载 ZIP） |
| LobeHub Advanced Skill Creator | OpenClaw Skill | 免费 | 无 | 开源 | 是（但仅文本生成） |
| openclawskill.ai | Marketplace | 免费 | 无 | 未知 | 无 |
| **SkillForge (ours)** | **Web + OpenClaw Skill** | **免费** | **内置静态安全扫描** | **开源** | **是（一键安装）** |

### 差异化总结

1. **免费开源** -- 竞品收费或闭源
2. **安全扫描内置** -- 所有竞品都不扫描生成结果，在安全危机背景下这是致命缺失
3. **完整技能包** -- 不只是 SKILL.md，还包括脚本、配置、引用文档
4. **OpenClaw Agent 集成** -- 在聊天中直接创建技能，无需离开对话
5. **模板库** -- 预置常见场景模板，降低"不知道做什么"的门槛
6. **交互式优化** -- 对话式迭代优化技能，不是一次性生成

## 技术方案

### 架构

线性管线架构（Architecture Review 确认基本合理）：

```
用户描述需求 (自然语言)
        |
        v
+-------------------+
| SkillForge Engine |  FastAPI + SSE 流式
| (Python)          |
|                   |
| 1. 输入校验       |  Pydantic 模型校验
| 2. LLM 流式生成   |  Anthropic SDK stream
| 3. YAML 校验      |  后生成校验 + 一次重试
| 4. 静态安全扫描   |  正则规则引擎（15+ 规则）
| 5. SSE 推送结果   |  分阶段事件流
+-------------------+
        |
   +----+----+
   |         |
   v         v
Web UI    OpenClaw Skill
(React)   (聊天中使用)
```

### Research Insights: 架构决策

**Scope 裁剪（Architecture Review -- FATAL 发现）:**

原计划工作量约为 5 天的 2 倍。以下是强制裁剪项：

| 原计划 | MVP 决策 | 理由 |
|--------|----------|------|
| AI 语义扫描引擎 | 砍掉 | 本质上是第二个 LLM 产品，有独立的 prompt 工程、失败模式、延迟成本 |
| SQLite 数据存储 | 砍掉 | 无状态管线不需要持久化，生成即输出 |
| 10 个模板 | 减至 3 个 | 3 个高质量模板 > 10 个粗糙模板 |
| Vercel + Railway 双部署 | 单 Railway | FastAPI 直接 serve React 静态文件 |
| Moltbook 自动发帖 | 改为 opt-in 手动触发 | 防止滥用（Security Review 发现） |

**文件结构（扁平化，10 个源文件）:**

```
skillforge/
  backend/
    main.py              # FastAPI 应用、CORS、路由、SSE 端点
    generator.py          # LLM 调用 + SKILL.md 生成
    scanner.py            # 静态规则扫描引擎
    prompts.py            # System prompt + few-shot examples
    templates/
      email-digest.yaml   # 模板 1: 邮件摘要
      git-commit.yaml     # 模板 2: Git commit 助手
      code-reviewer.yaml  # 模板 3: 代码审查
    requirements.txt
  frontend/
    src/
      App.tsx             # 路由 + 布局
      components/
        GenerateForm.tsx  # 输入表单 + 模板选择
        SkillPreview.tsx  # 流式代码预览 + 高亮
        ScanResult.tsx    # 安全扫描结果展示
      hooks/
        useSkillGeneration.ts  # SSE 消费 hook
  skill/
    SKILL.md              # SkillForge 本身作为 OpenClaw 技能
  README.md
```

### 核心模块

#### 模块 1: Skill Generator Engine (`backend/generator.py`)

- **输入校验**: Pydantic 模型校验用户输入（长度、格式）
- **LLM 流式生成**: Anthropic SDK `client.messages.stream()` 上下文管理器
- **YAML 后验证**: 生成完成后校验 frontmatter 格式合规，失败重试一次
- **模板注入**: 将 3 个模板摘要注入 system prompt（Performance Review 建议方案 B），LLM 自行匹配，无需独立匹配代码

### Research Insights: SKILL.md 格式规范

**完整 YAML Frontmatter Schema**（来源：SKILL.md Format Research Agent）:

```yaml
---
name: my-skill                    # 必填，匹配 ^[a-z0-9][a-z0-9-]*$
description: Trigger phrase        # 必填，是触发短语而非营销文案
version: 1.0.0                    # 语义版本
metadata:
  openclaw:
    requires:
      env:                        # 所需环境变量
        - SOME_API_KEY
      bins:                       # 所需命令行工具
        - curl
      binsAnyOf:                  # 满足任一即可的工具
        - ["npm", "yarn", "pnpm"]
      config:                     # 所需配置
        - "some.config.key"
    primaryEnv: SOME_API_KEY      # 主要 API key
    alwaysOn: false               # 是否始终激活
    key: my-skill                 # 技能唯一标识
    emoji: "🔧"                   # 显示图标
    homepage: https://...         # 技能主页
    os:                           # 操作系统限制
      - macos
      - linux
    install:                      # 安装依赖（OpenClaw 不自动执行）
      - kind: brew
        formula: jq
        bins: [jq]
---

# My Skill

## Instructions

具体行为指令（Agent 会严格遵循）。

## Description

技能的详细描述和使用场景。

## Examples

使用示例和预期输出。
```

**关键发现:**

- `description` 字段是**触发短语**，用户说出类似的话会触发该技能。不要写营销文案。
- `name` 必须全小写 + 连字符，匹配 `^[a-z0-9][a-z0-9-]*$`
- `references/` 目录用于按需加载的参考文档
- OpenClaw **不会自动执行** install 脚本，只做提示
- 技能优先级：workspace > `~/.openclaw/skills` > bundled
- 文件大小限制：50MB 总包，仅文本文件

**YAML 校验函数（Architecture Review 提供）:**

```python
import re
import yaml

def validate_skill_md(content: str) -> tuple[bool, str]:
    """校验生成的 SKILL.md 格式是否合规。"""
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return False, "Missing YAML frontmatter delimiters"
    try:
        meta = yaml.safe_load(frontmatter_match.group(1))
    except yaml.YAMLError as e:
        return False, f"Invalid YAML: {e}"
    if not meta.get("name"):
        return False, "Missing required field: name"
    if not re.match(r'^[a-z0-9][a-z0-9-]*$', meta["name"]):
        return False, f"Invalid name format: {meta['name']}"
    if not meta.get("description"):
        return False, "Missing required field: description"
    return True, ""
```

**生成失败处理**: LLM 经常生成无效 YAML。校验失败后用简短 prompt 重试一次（"Fix the YAML frontmatter: {error}"），仍失败则返回错误。

### Research Insights: System Prompt 设计

**`prompts.py` 核心内容（Architecture Review 提供）:**

```python
SYSTEM_PROMPT = """You are SkillForge, an expert OpenClaw skill author.

Given a user's natural language description, generate a complete, valid SKILL.md file.

RULES:
1. Output ONLY the SKILL.md content. No explanations, no markdown code fences.
2. Start with YAML frontmatter delimited by ---.
3. name field: lowercase + hyphens only, matching ^[a-z0-9][a-z0-9-]*$
4. description field: a short trigger phrase (how a user would ask for this skill), NOT marketing copy.
5. version: always 1.0.0 for new skills.
6. Only declare requires.bins for tools the skill actually needs.
7. Only declare requires.env for API keys the skill actually needs.
8. Body must include ## Instructions, ## Description, and ## Examples sections.
9. Instructions must be specific and actionable -- tell the agent exactly what to do.
10. NEVER include: base64 commands, curl|sh pipes, eval(), credential file paths, reverse shell patterns.

AVAILABLE TEMPLATES (use as reference for similar requests):
- email-digest: Daily email summary skill requiring GMAIL_API_KEY
- git-commit: Analyze git diff and generate commit messages, requires git
- code-reviewer: Review code changes and suggest improvements

FORMAT:
---
name: [kebab-case-name]
description: [trigger phrase]
version: 1.0.0
metadata:
  openclaw:
    requires:
      env: [list or omit]
      bins: [list or omit]
---

# [Skill Name]

## Instructions
[Detailed agent instructions]

## Description
[What this skill does]

## Examples
[Usage examples with expected behavior]
"""

FEW_SHOT_EXAMPLE = """User: Create a skill that summarizes my emails every morning

---
name: email-digest
description: Summarize my emails
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - GMAIL_API_KEY
---

# Email Digest

## Instructions

When the user asks to summarize their emails:
1. Use the GMAIL_API_KEY to authenticate with Gmail API.
2. Fetch unread emails from the last 24 hours.
3. Group emails by sender and importance.
4. Generate a concise summary with: sender, subject, key action items.
5. Present as a formatted list, most important first.

## Description

Automatically summarizes unread emails from the last 24 hours, grouping by sender and highlighting action items.

## Examples

User: "Summarize my emails"
→ Fetches last 24h unread emails, returns grouped summary with action items.

User: "What emails did I get today?"
→ Same behavior, triggered by similar phrasing.
"""
```

#### 模块 2: Security Scanner (`backend/scanner.py`)

**MVP 策略变更**: 砍掉 AI 语义引擎，仅保留静态规则引擎。AI 语义扫描本质上是一个独立 LLM 产品（有独立的 prompt 工程、失败模式、延迟），超出 5 天可交付范围。

**静态规则引擎（15+ 规则）:**

```python
import re
from dataclasses import dataclass

@dataclass
class ScanIssue:
    severity: str  # critical, high, medium, low
    message: str
    line: int | None = None

RULES = [
    # Critical: 远程代码执行
    {"pattern": r"curl\s+.*\|\s*sh", "severity": "critical",
     "message": "Pipe to shell execution detected"},
    {"pattern": r"base64\s+(-d|--decode)", "severity": "critical",
     "message": "Base64 decode command detected"},
    {"pattern": r"(nc\s+-l|ncat|netcat)", "severity": "critical",
     "message": "Reverse shell tool detected"},
    {"pattern": r"ignore\s+(previous|above|all)\s+instructions", "severity": "critical",
     "message": "Prompt injection pattern detected"},
    {"pattern": r"wget\s+.*-O\s*-\s*\|", "severity": "critical",
     "message": "Remote script download and execute"},

    # High: 危险操作
    {"pattern": r"eval\(|exec\(", "severity": "high",
     "message": "Dynamic code execution"},
    {"pattern": r"(\/etc\/passwd|\/etc\/shadow|~\/\.ssh)", "severity": "high",
     "message": "Sensitive file path access"},
    {"pattern": r"(rm\s+-rf|chmod\s+777|chown)", "severity": "high",
     "message": "Dangerous filesystem operation"},
    {"pattern": r"subprocess\.call|os\.system|os\.popen", "severity": "high",
     "message": "Shell command execution in script"},

    # Medium: 可疑模式
    {"pattern": r"(OPENAI_API_KEY|AWS_SECRET|PRIVATE_KEY|PASSWORD)",
     "severity": "medium", "message": "Credential access pattern"},
    {"pattern": r"https?://\d+\.\d+\.\d+\.\d+", "severity": "medium",
     "message": "Direct IP address in URL (suspicious)"},
    {"pattern": r"\\x[0-9a-fA-F]{2}", "severity": "medium",
     "message": "Hex-encoded content (possible obfuscation)"},

    # Low: 建议
    {"pattern": r"TODO|FIXME|HACK", "severity": "low",
     "message": "Unfinished code marker"},
]

# bins 白名单（Security Review 建议）
ALLOWED_BINS = {
    "git", "node", "npm", "npx", "yarn", "pnpm", "python", "python3",
    "pip", "pip3", "ruby", "gem", "go", "cargo", "rustc", "java",
    "javac", "mvn", "gradle", "docker", "kubectl", "jq", "yq",
    "sed", "awk", "grep", "find", "sort", "uniq", "wc", "tr",
}
BLOCKED_BINS = {"bash", "sh", "zsh", "curl", "wget", "nc", "ncat", "netcat", "telnet"}

def scan_skill_md(content: str) -> dict:
    """扫描 SKILL.md 内容，返回安全报告。"""
    issues: list[ScanIssue] = []

    # 多编码归一化（Security Review 建议）
    normalized = content
    # 解码常见转义
    try:
        normalized = normalized.encode().decode('unicode_escape')
    except (UnicodeDecodeError, UnicodeError):
        pass

    # 规则匹配
    for rule in RULES:
        for i, line in enumerate(normalized.split('\n'), 1):
            if re.search(rule["pattern"], line, re.IGNORECASE):
                issues.append(ScanIssue(
                    severity=rule["severity"],
                    message=rule["message"],
                    line=i,
                ))

    # bins 白名单检查
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if frontmatter_match:
        import yaml
        try:
            meta = yaml.safe_load(frontmatter_match.group(1)) or {}
            bins = (meta.get("metadata", {}).get("openclaw", {})
                    .get("requires", {}).get("bins", []))
            for b in bins:
                if b in BLOCKED_BINS:
                    issues.append(ScanIssue(
                        severity="critical",
                        message=f"Blocked binary requested: {b}",
                    ))
                elif b not in ALLOWED_BINS:
                    issues.append(ScanIssue(
                        severity="medium",
                        message=f"Unknown binary requested: {b}",
                    ))
        except yaml.YAMLError:
            pass

    # 计算评分
    severity_weights = {"critical": 30, "high": 15, "medium": 5, "low": 1}
    penalty = sum(severity_weights.get(i.severity, 0) for i in issues)
    score = max(0, 100 - penalty)

    severity_counts = {}
    for i in issues:
        severity_counts[i.severity] = severity_counts.get(i.severity, 0) + 1

    risk_level = "safe"
    if any(i.severity == "critical" for i in issues):
        risk_level = "critical"
    elif any(i.severity == "high" for i in issues):
        risk_level = "high"
    elif any(i.severity == "medium" for i in issues):
        risk_level = "medium"

    return {
        "score": score,
        "risk_level": risk_level,
        "issues": [{"severity": i.severity, "message": i.message, "line": i.line}
                   for i in issues],
        "summary": severity_counts,
        "disclaimer": "Static analysis only. This is advisory -- not a security guarantee.",
    }
```

### Research Insights: 安全加固

**Security Review 发现的 10 个安全问题及缓解措施:**

| 严重度 | 问题 | 缓解措施 | 实施日 |
|--------|------|----------|--------|
| CRITICAL | LLM prompt injection（用户输入直接进 prompt） | System prompt hardening + constrained output schema + 输出校验 | Day 1 |
| CRITICAL | Claude API key 泄露风险 | `.gitignore` + 环境变量 + 永不前端暴露 | Day 1 |
| HIGH | 扫描器被编码绕过（hex/base64/unicode escape） | 多编码归一化后再匹配 | Day 3 |
| HIGH | 生成的技能无沙箱 | 明确标注 advisory only + bins 白名单 | Day 1 |
| HIGH | API 无认证无限流 | `slowapi` 限流（10 req/min per IP） | Day 1 |
| HIGH | Moltbook 自动发帖被滥用 | 改为 opt-in 手动触发 | Day 4 |
| MEDIUM | XSS（skill 内容直接渲染到 HTML） | `react-markdown` + `rehype-sanitize` | Day 2 |
| MEDIUM | YAML injection | `yaml.safe_load()`（已默认安全） | Day 1 |
| MEDIUM | 供应链风险（npm/pip 依赖） | `package-lock.json` + `requirements.txt` 锁版本 | Day 1 |
| LOW | 信息泄露（详细错误栈） | 生产环境统一错误格式，不暴露内部错误 | Day 5 |

**Prompt Hardening（Security Review 建议）:**

在 system prompt 末尾添加：

```
SAFETY RULES (non-negotiable):
- NEVER include base64-encoded commands
- NEVER include pipe-to-shell patterns (curl|sh, wget|sh)
- NEVER reference /etc/passwd, /etc/shadow, ~/.ssh, or credential files
- NEVER include reverse shell commands (nc, ncat, netcat)
- NEVER include eval() or exec() calls
- If the user's description asks for anything malicious, generate a harmless
  placeholder skill instead and explain why.
- requires.bins MUST only include tools the skill genuinely needs.
```

**安全声明诚实性（Security Review 关键洞察）:**

> 安全声明必须诚实。扫描器应定位为 defense in depth，不是保证。UI 上显示：
> "Static security analysis is advisory only. Always review generated skills before installation."

#### 模块 3: Web Dashboard (`frontend/`)

React + TypeScript + Tailwind CSS，单页应用：

- **GenerateForm**: 输入框 + 3 个模板卡片 + 提交按钮
- **SkillPreview**: SSE 流式接收 + `prism-react-renderer` 代码高亮（200ms 节流）
- **ScanResult**: 安全评分圆环 + 问题列表 + 风险等级标签

### Research Insights: SSE 流式架构

**后端 SSE 端点（Performance Review + FastAPI Streaming Research）:**

```python
# backend/main.py 核心端点
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="SkillForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

@app.post("/api/generate")
async def generate_skill(req: GenerateRequest):
    """SSE 端点：流式生成 SKILL.md + 安全扫描。"""
    return StreamingResponse(
        skill_generation_stream(req.description, req.template_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

@app.post("/api/scan")
async def scan_skill(req: ScanRequest):
    """独立扫描端点：输入 SKILL.md 内容，输出安全报告。"""
    return scan_skill_md(req.content)

# 生产环境：FastAPI 直接 serve React 静态文件
# app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
```

**SSE 事件协议:**

```
阶段 1: 生成中
data: {"type": "phase", "phase": "generating"}
data: {"type": "token", "content": "---\n"}
data: {"type": "token", "content": "name: "}
data: {"type": "token", "content": "email-digest\n"}
...

阶段 2: 校验
data: {"type": "phase", "phase": "validating"}
data: {"type": "validation", "valid": true}

阶段 3: 扫描
data: {"type": "phase", "phase": "scanning"}
data: {"type": "scan_result", "results": {"score": 95, "risk_level": "safe", ...}}

完成
data: {"type": "done", "skill_md": "完整内容"}
```

**前端 SSE Hook（FastAPI Streaming Research 提供）:**

```typescript
// hooks/useSkillGeneration.ts
import { useState, useCallback, useRef } from "react";

interface StreamEvent {
  type: "phase" | "token" | "validation" | "scan_result" | "done" | "error";
  phase?: string;
  content?: string;
  valid?: boolean;
  results?: ScanResult;
  skill_md?: string;
}

export function useSkillGeneration() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [skillText, setSkillText] = useState("");
  const [phase, setPhase] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (description: string, templateId?: string) => {
    setSkillText("");
    setPhase("generating");
    setScanResult(null);
    setError(null);
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, template_id: templateId }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
          const event: StreamEvent = JSON.parse(line.slice(6));
          switch (event.type) {
            case "phase": setPhase(event.phase!); break;
            case "token": setSkillText(prev => prev + event.content); break;
            case "scan_result": setScanResult(event.results!); break;
            case "error": setError(event.content!); break;
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { generate, cancel, skillText, phase, scanResult, error, isStreaming };
}
```

**性能关键指标（Performance Review）:**

| 指标 | 目标值 |
|------|--------|
| 首 token 延迟 | < 1.5s |
| 总生成时间 | 9-24s（取决于技能复杂度） |
| 代码高亮节流 | 200ms（流式期间） |
| LLM 并发控制 | `asyncio.Semaphore(3)` |
| API 限流 | 10 req/min per IP（`slowapi`） |

**客户端代码高亮**: 使用 `prism-react-renderer`（30KB gzipped），流式期间 200ms 节流避免卡顿，流结束后做一次完整高亮。

#### 模块 4: OpenClaw Skill (`skill/`)

SkillForge 本身作为 OpenClaw 技能运行：

```
~/.openclaw/skills/skillforge/
├── SKILL.md        # 技能定义
├── references/
│   └── templates.md  # 内置模板参考
```

用户在聊天中直接使用：
- "create a skill that summarizes my emails every morning"
- "forge a skill for monitoring crypto prices on CoinGecko"
- Agent 生成技能 → 安全扫描 → 自动安装到本地

### 技术选型

| 组件 | 技术 | 理由 |
|------|------|------|
| 后端 | Python 3.11 + FastAPI | 你的强项，VibeDoc/MeetSpot 同栈 |
| AI 引擎 | Claude API（Anthropic SDK async） | `client.messages.stream()` 原生流式 |
| 备选 LLM | DeepSeek（OpenAI SDK 兼容） | `base_url="https://api.deepseek.com"`，10-30x 便宜 |
| 前端 | React 18 + TypeScript + Tailwind | 快速 UI |
| 代码高亮 | `prism-react-renderer` | 30KB gzipped，支持流式 |
| Markdown 渲染 | `react-markdown` + `rehype-sanitize` | XSS 安全 |
| YAML 解析 | `python-frontmatter` 或 regex + `yaml.safe_load` | 后生成校验 |
| API 限流 | `slowapi` | FastAPI 限流中间件 |
| 部署 | 单 Railway 服务 | FastAPI serve React 静态文件，一次部署 |

## Scope

### In Scope (MVP -- 裁剪后)

1. **技能生成 SSE API** -- POST /api/generate，输入自然语言，SSE 流式输出完整技能包
2. **安全扫描 API** -- POST /api/scan，输入 SKILL.md 内容，输出静态规则扫描报告
3. **Web Dashboard** -- 输入描述 → 流式生成 → 扫描 → 下载的完整流程
4. **模板库** -- 3 个预置高质量模板（email-digest, git-commit, code-reviewer）
5. **OpenClaw SKILL.md** -- 可安装到 OpenClaw 的技能版本
6. **Demo 视频** -- 60 秒内从描述到安装的完整演示

### Out of Scope

- AI 语义扫描引擎（MVP 后迭代）
- SQLite / 任何持久化存储
- ClawHub 发布集成
- Moltbook 自动发帖（改为 README 中说明手动发布）
- 付费功能
- 移动端 UI
- 多语言生成（MVP 仅英文技能）
- 技能运行时测试（沙箱执行）
- 10 个模板（MVP 仅 3 个）

## API 契约

### POST /api/generate

**Request:**
```json
{
  "description": "Create a skill that summarizes my emails every morning",
  "template_id": "email-digest" | null
}
```

**Response:** SSE stream

```
data: {"type": "phase", "phase": "generating"}
data: {"type": "token", "content": "---\n"}
data: {"type": "token", "content": "name: email-digest\n"}
...
data: {"type": "phase", "phase": "validating"}
data: {"type": "validation", "valid": true}
data: {"type": "phase", "phase": "scanning"}
data: {"type": "scan_result", "results": {"score": 95, "risk_level": "safe", "issues": [], "disclaimer": "..."}}
data: {"type": "done", "skill_md": "完整内容"}
```

**错误（流中）:**
```
data: {"type": "error", "content": "LLM generation failed: rate limited"}
```

**错误（流前，HTTP 422）:**
```json
{"detail": [{"msg": "field required", "type": "value_error.missing"}]}
```

### POST /api/scan

**Request:**
```json
{
  "content": "---\nname: my-skill\n..."
}
```

**Response:**
```json
{
  "score": 85,
  "risk_level": "medium",
  "issues": [
    {"severity": "medium", "message": "Credential access pattern", "line": 15}
  ],
  "summary": {"medium": 1},
  "disclaimer": "Static analysis only. This is advisory -- not a security guarantee."
}
```

### GET /api/health

**Response:** `{"status": "ok"}`

## 用户流程

### Research Insights: 完整用户流程（Spec-Flow Analysis）

**Flow 1: Web Dashboard -- 从零开始**
1. 用户访问首页 → 看到输入框 + 3 个模板卡片
2. 输入自然语言描述（如 "Create a skill that reviews my pull requests"）
3. 点击 Generate → 页面切换到生成视图
4. 流式看到 SKILL.md 逐 token 出现（代码高亮）
5. 生成完成 → 自动运行静态安全扫描
6. 展示安全评分 + 问题列表（如有）
7. 一键复制安装命令：`mkdir -p ~/.openclaw/skills/pr-reviewer && curl -o ... SKILL.md`
8. 或下载 SKILL.md 文件

**Flow 2: Web Dashboard -- 从模板开始**
1. 用户点击模板卡片（如 "Email Digest"）
2. 模板的描述自动填入输入框，用户可修改
3. 点击 Generate → 同 Flow 1 步骤 3-8

**Flow 3: OpenClaw Agent -- 聊天中生成**
1. 用户安装 SkillForge 技能到 `~/.openclaw/skills/skillforge/`
2. 在聊天中说 "forge a skill for summarizing Slack messages"
3. Agent 调用 SkillForge 后端 API
4. 流式展示生成结果
5. 自动扫描 + 展示报告
6. 询问 "Install this skill? (Y/n)"
7. 用户确认 → 自动写入 `~/.openclaw/skills/slack-summary/SKILL.md`

**Flow 4: 独立扫描已有技能**
1. 用户有一个从 ClawHub 下载的 SKILL.md
2. 粘贴内容到 Web Dashboard 的 "Scan" 标签
3. 获得安全报告

### Gap 清单（Spec-Flow Analysis 识别，29 项中的关键项）

| 类别 | Gap | 默认决策 |
|------|-----|----------|
| 输入校验 | 描述最大长度未定义 | 5000 字符上限 |
| 输入校验 | 空输入/纯标点处理 | 前端禁用按钮 + 后端 Pydantic 校验 |
| 安全扫描 | 扫描分数阈值行为（低于 X 分怎么办） | 始终展示结果，不阻止下载，但低于 50 分显示警告 |
| 生成质量 | YAML 校验失败处理 | 自动重试一次，仍失败返回错误 |
| Agent 集成 | 安装需要用户确认吗 | 是，必须用户确认（never auto-install） |
| 错误处理 | API key 无效/过期 | 返回清晰错误："API key invalid. Set ANTHROPIC_API_KEY env var." |
| 错误处理 | 网络断开（SSE 中途断） | 前端 catch AbortError，提示 "Connection lost. Try again." |
| UI | 生成中可以取消吗 | 是，前端 abort + 后端 catch CancelledError |

## 风险分析

| 风险 | 严重度 | 缓解措施 |
|------|--------|----------|
| **时间不够（5 天 solo）** | **高** | 已裁剪 scope（砍 AI 扫描、SQLite、模板减至 3 个、单部署）；Day 3 为打磨日不加功能 |
| LLM 生成质量不稳定 | 中 | 精心设计 system prompt + few-shot example + YAML 后验证 + 一次重试 |
| LLM 生成无效 YAML | 中 | `validate_skill_md()` 后验证 + 自动重试一次 |
| LLM API 延迟影响体验 | 低 | SSE 流式输出，首 token < 1.5s |
| Prompt injection（用户输入恶意描述） | 中 | System prompt hardening + 输出约束 + 静态规则检测 injection 模式 |
| 安全扫描被绕过 | 中 | 多编码归一化 + 诚实标注 advisory only |
| XSS（技能内容渲染） | 中 | `react-markdown` + `rehype-sanitize` |
| API 被滥用 | 中 | `slowapi` 限流 10 req/min per IP |
| 与 skills-openclaw.com 相似 | 低 | 强调开源 + 免费 + 安全扫描三大差异 |

## 验证方式

1. 用 3 个模板场景测试生成质量（email-digest, git-commit, code-reviewer）
2. 用 5 个自由描述测试生成质量（翻译、价格监控、RSS、会议记录、代码解释）
3. 用已知恶意模式测试安全扫描检出率（reverse shell, pipe-to-shell, credential access, prompt injection）
4. 实际安装到 OpenClaw 验证可用性
5. 故意输入恶意描述测试 prompt hardening 效果

## 模板库设计（3 个 MVP 模板）

| 分类 | 模板名 | 描述 | 关键字段 |
|------|--------|------|----------|
| 生产力 | Email Digest | 每日邮件摘要总结 | requires.env: GMAIL_API_KEY |
| 开发 | Git Commit Helper | 分析代码变更生成 commit message | requires.bins: git |
| 开发 | Code Reviewer | 代码审查和改进建议 | 无特殊依赖 |

## 实施计划（修订版）

### Day 1 (2/25): 后端核心 + 安全基础

**文件:**
- `backend/main.py` -- FastAPI 应用、CORS、SSE 端点、限流
- `backend/generator.py` -- LLM 流式调用 + SKILL.md 生成 + YAML 校验
- `backend/prompts.py` -- System prompt + few-shot example
- `backend/scanner.py` -- 静态规则引擎（15+ 规则）
- `backend/requirements.txt`
- `.gitignore` -- 确保 .env 不入库

**任务:**
- [ ] FastAPI 项目搭建 + CORS 配置 + `slowapi` 限流
- [ ] Pydantic request/response 模型
- [ ] Anthropic SDK 异步流式集成（`AsyncAnthropic` + `client.messages.stream()`）
- [ ] System prompt + few-shot example 编写（含 SAFETY RULES）
- [ ] YAML 后验证函数（`validate_skill_md`）+ 重试逻辑
- [ ] SSE 事件协议实现（token/phase/validation/scan_result/done/error）
- [ ] 静态安全扫描规则（15+ 规则 + bins 白名单）
- [ ] `/api/generate`（SSE）、`/api/scan`（JSON）、`/api/health` 端点
- [ ] `.gitignore` 加入 `.env`、`__pycache__`

**安全加固（Day 1）:**
- [ ] 环境变量管理（ANTHROPIC_API_KEY 仅后端）
- [ ] `slowapi` 限流配置（10 req/min per IP）
- [ ] System prompt hardening（SAFETY RULES 段）
- [ ] `yaml.safe_load()` 而非 `yaml.load()`

**验收:** `curl -X POST /api/generate -d '{"description":"..."}' ` 返回 SSE 流 + 有效 SKILL.md

### Day 2 (2/26): 前端 Dashboard

**文件:**
- `frontend/src/App.tsx` -- 路由 + 布局
- `frontend/src/components/GenerateForm.tsx` -- 输入 + 模板选择
- `frontend/src/components/SkillPreview.tsx` -- 流式代码预览
- `frontend/src/components/ScanResult.tsx` -- 安全报告
- `frontend/src/hooks/useSkillGeneration.ts` -- SSE 消费 hook

**任务:**
- [ ] Vite + React + TypeScript + Tailwind 项目搭建
- [ ] `useSkillGeneration` hook（fetch + ReadableStream SSE 消费）
- [ ] GenerateForm（输入框 + 3 个模板卡片 + 提交/取消按钮）
- [ ] SkillPreview（`prism-react-renderer` 高亮 + 200ms 流式节流）
- [ ] ScanResult（安全评分 + 问题列表 + 风险标签 + advisory 声明）
- [ ] 一键复制安装命令
- [ ] 下载 SKILL.md 按钮

**安全加固（Day 2）:**
- [ ] `react-markdown` + `rehype-sanitize` 用于 Markdown 渲染
- [ ] CSP header 配置

**验收:** 从输入到展示结果的完整 UI 流程可用，流式显示无卡顿

### Day 3 (2/27): 打磨日（不加功能）

**任务:**
- [ ] 3 个模板 YAML 文件创建和测试
- [ ] 前后端联调 + edge case 处理
- [ ] 错误处理完善（网络断开、API 超时、无效输入）
- [ ] UI 微调（loading 状态、空状态、错误状态）
- [ ] 多编码归一化加固（Security Review 建议）
- [ ] 5 个恶意模式测试用例
- [ ] 性能测试（首 token 延迟、总时间）

**验收:** 所有已知 edge case 处理完毕，无 crash

### Day 4 (2/28): OpenClaw Skill + 集成

**文件:**
- `skill/SKILL.md` -- SkillForge 的 OpenClaw 技能文件
- `skill/references/templates.md` -- 模板参考

**任务:**
- [ ] 编写 SkillForge 的 SKILL.md（遵循完整 frontmatter schema）
- [ ] `references/templates.md` 编写
- [ ] 端到端测试：OpenClaw 聊天中 "forge a skill for..." → 生成 → 扫描 → 安装
- [ ] 部署配置：FastAPI `StaticFiles` serve React build
- [ ] Railway 部署配置

**验收:** 在 OpenClaw 聊天中说 "forge a skill for..." 能生成并安装技能

### Day 5 (3/1): 提交

**任务:**
- [ ] Demo 视频录制（60 秒从描述到运行）
- [ ] README 文档（中英双语）
- [ ] 生产环境安全加固：统一错误格式、CORS 锁定到生产域名
- [ ] 部署到 Railway
- [ ] 发布到 X（tag @lablabai @Surgexyz_）
- [ ] Moltbook submolt 手动发布
- [ ] Lablab.ai 提交表单
- [ ] 最终 bug 修复

## 提交 Checklist

- [ ] 公开 GitHub 仓库（MIT License）
- [ ] Demo 视频发布到 X，tag @lablabai 和 @Surgexyz_
- [ ] 视频链接填入提交表单
- [ ] 在 Moltbook lablab submolt 发布更新（hackathon 期间持续发布）
- [ ] 封面图
- [ ] 项目标题 + 短描述 + 长描述
- [ ] 技术标签（OpenClaw、Python、FastAPI、React、AI）
- [ ] 类别标签
- [ ] GitHub 仓库链接
- [ ] Demo 应用 URL
- [ ] 幻灯片

## 为什么这个项目能拿奖

1. **解决最大用户痛点** -- "不知道让 Agent 做什么" + "不敢装第三方技能" 双重解决
2. **免费开源 vs 收费闭源竞品** -- skills-openclaw.com 收费，我们免费开源
3. **安全扫描是独有功能** -- 所有现有技能生成器都不做安全检查，在 12-20% 恶意技能的背景下这是关键差异
4. **本次 hackathon 无直接竞品** -- 已有提交（AutoClaw、AgentNet、MacGas、Agent Forge）全是 agent 经济
5. **Demo 效果好** -- "60 秒从自然语言到可用技能"的演示天然有冲击力
6. **延续你的成功模式** -- VibeDoc (想法 → 开发计划) 验证了这种"AI 转换器"模式的受欢迎度
7. **实用性** -- 生成的技能真的能在 OpenClaw 中运行
8. **技术深度** -- LLM 流式生成 + 后验证 + 静态规则扫描的完整管线

## 参考资料

- [OpenClaw Skills 官方文档](https://docs.openclaw.ai/tools/skills)
- [ClawHub SKILL.md 格式规范](https://github.com/openclaw/clawhub/blob/main/docs/skill-format.md)
- [Snyk ToxicSkills 研究](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)
- [skills-openclaw.com](https://skills-openclaw.com/) -- 收费竞品参考
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Anthropic Python SDK](https://github.com/anthropics/anthropic-sdk-python)
- [Anthropic SDK Streaming Helpers](https://github.com/anthropics/anthropic-sdk-python/blob/main/helpers.md)
- [FastAPI StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/)
- [DeepSeek API](https://api-docs.deepseek.com/)
- [python-frontmatter](https://github.com/eyeseast/python-frontmatter)
- [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer)
