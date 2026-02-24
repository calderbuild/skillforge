---
title: "ClawSafe - AI-Powered OpenClaw Skill Security Analyzer & Agent"
type: feat
date: 2026-02-24
hackathon: SURGE x OpenClaw Hackathon
deadline: 2026-03-01
---

# ClawSafe - AI-Powered OpenClaw Skill Security Analyzer & Agent

## Overview

ClawSafe 是一个 AI 驱动的 OpenClaw 技能安全分析器，同时也是一个 OpenClaw Agent，能够自动扫描、分析和报告 ClawHub 技能的安全风险。它解决了 OpenClaw 生态系统中最紧迫的安全危机：12-20% 的 ClawHub 技能被确认为恶意软件。

## 为什么选择这个方向

### 问题是真实且紧迫的

截至 2026 年 2 月：

- **1,184+ 恶意技能** 被发现在 ClawHub 上（ClawHavoc 攻击）
- **12-20% 的技能** 被安全研究人员确认为恶意
- **42,665 个暴露实例**，其中 5,194 个被验证为易受攻击
- **CVE-2026-25253**（CVSS 8.8）和 6 个额外 CVE 被披露
- Microsoft、Kaspersky、Cisco、CrowdStrike 全部发出安全警告
- 恶意技能可以 **窃取私钥**、**注入提示词攻击**、**毒化 Agent 记忆** 实现持久化

来源：
- [Snyk ToxicSkills 研究](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)
- [Trend Micro 报告](https://www.trendmicro.com/en_us/research/26/b/openclaw-skills-used-to-distribute-atomic-macos-stealer.html)
- [Microsoft 安全博客](https://www.microsoft.com/en-us/security/blog/2026/02/19/running-openclaw-safely-identity-isolation-runtime-risk/)
- [Cisco 安全博客](https://blogs.cisco.com/ai/personal-ai-agents-like-openclaw-are-a-security-nightmare)

### 现有工具的不足

| 工具 | 类型 | 局限性 |
|------|------|--------|
| VirusTotal 官方集成 | 安装时扫描 | 官方承认"不是银弹"，prompt injection 可绕过 |
| SecureClaw (Adversa AI) | CLI 审计工具 | 仅 CLI，无 UI，面向安全专家 |
| UseClawPro | 浏览器静态检查 | 仅名称比对，无深度 AI 分析 |
| mcp-scan (Snyk) | 命令行扫描 | 开发者工具，非终端用户产品 |
| ClawShield (hackathon) | 安装时拦截 | 仅拦截已知模式，无实时监控 |

**核心差距：没有工具提供 AI 驱动的深度语义分析 + 用户友好的可视化 + OpenClaw Agent 集成。**

### 与你的技术栈完美匹配

- Python/FastAPI -- 后端分析引擎
- React/TypeScript -- 安全报告可视化 Dashboard
- AI/ML -- LLM 驱动的语义安全分析（类似你的 VibeDoc 和 MD_Audit 项目）
- 全栈能力 -- 端到端产品

### 竞品分析与差异化

**Circle USDC Hackathon 获奖项目 ClawShield** -- 专注安装时拦截，运行时无保护。ClawSafe 提供 **安装前分析 + 运行时监控 + AI 语义分析** 三层防护。

**BNB Chain Hackathon 安全项目 ShieldBot/Aegis** -- 专注 DeFi 交易保护。ClawSafe 专注 **技能供应链安全**，完全不同的赛道。

**本次 hackathon 已有提交** -- AutoClaw、AgentNet、MacGas、Agent Forge 全部聚焦 Agent 经济。**安全赛道完全空白，零竞争。**

## 技术方案

### 架构

```
+------------------+     +-------------------+     +------------------+
|  ClawSafe Agent  | --> | Analysis Engine   | --> | Dashboard (React)|
|  (OpenClaw Skill)|     | (FastAPI + LLM)   |     | Security Reports |
+------------------+     +-------------------+     +------------------+
        |                         |                         |
        v                         v                         v
  Moltbook Posts           ClawHub API               Risk Database
  (Auto-report)            (Skill fetch)             (SQLite/JSON)
```

### 核心模块

#### 1. Skill Scanner Engine (Python/FastAPI)

输入一个 ClawHub 技能 URL 或 SKILL.md 内容，输出安全分析报告。

分析维度：
- **静态分析**：检测已知恶意模式（reverse shell、data exfiltration、credential access）
- **AI 语义分析**：用 LLM 理解 SKILL.md 的意图，检测隐藏的 prompt injection
- **行为预测**：基于权限声明预测技能可能的危险行为
- **供应链检查**：检查 GitHub 账号年龄、star 数、贡献者信息
- **对比已知威胁**：匹配 ClawHavoc 等已知攻击模式

输出：
- 0-100 安全评分
- 风险等级（Safe / Caution / Dangerous / Malicious）
- 具体问题列表 + 详细解释
- 修复建议

#### 2. Memory Integrity Monitor

检测 Agent 记忆文件（SOUL.md、MEMORY.md）的篡改：
- 建立记忆文件基线 hash
- 定期检查是否有未授权修改
- 检测 prompt injection 在记忆中的持久化痕迹

#### 3. Dashboard (React + TypeScript)

可视化安全报告：
- 扫描结果总览（饼图/条形图展示风险分布）
- 技能详情页（逐条风险 + 代码高亮）
- 时间线（记忆文件变更历史）
- 一键扫描入口

#### 4. OpenClaw Agent Integration

ClawSafe 本身作为一个 OpenClaw Skill 运行：
- 用户可以通过聊天命令触发扫描："scan skill <url>"
- Agent 自动在 Moltbook 上发布安全报告
- 定期自动扫描已安装技能

### 技术选型

| 组件 | 技术 | 理由 |
|------|------|------|
| 后端 | Python + FastAPI | 你的强项，快速开发 |
| AI 分析 | Claude API / DeepSeek | 语义分析 SKILL.md |
| 前端 | React + TypeScript + Tailwind | 快速 UI 开发 |
| 数据存储 | SQLite | 轻量，适合 MVP |
| OpenClaw 集成 | SKILL.md + setup.sh | 标准技能格式 |
| 部署 | Vercel (前端) + 本地 (Agent) | 快速上线 |

## Scope

### In Scope (MVP, 5 天内完成)

1. **Skill Scanner API** -- FastAPI 端点，输入 SKILL.md URL/内容，输出安全分析
2. **AI 分析引擎** -- 用 LLM 检测 prompt injection、恶意模式
3. **Web Dashboard** -- React 可视化安全报告
4. **OpenClaw Skill** -- 标准 SKILL.md，用户可安装到 OpenClaw
5. **Moltbook 集成** -- Agent 自动发布扫描结果到 Moltbook
6. **Demo 视频** -- 展示完整流程

### Out of Scope

- 实时运行时拦截（需要 hook OpenClaw 内核，5 天不够）
- 完整的恶意技能数据库（使用已有公开数据）
- 付费 API（MVP 免费）
- 移动端 UI

## 风险分析

| 风险 | 严重度 | 缓解措施 |
|------|--------|----------|
| LLM 分析不准确 | 中 | 结合静态规则 + AI 分析双引擎，类似 MD_Audit 的方法 |
| OpenClaw API 限制 | 低 | 直接从 GitHub raw 获取 SKILL.md |
| 时间紧张 | 高 | 严格优先级：Scanner > Dashboard > Agent > Moltbook |
| 与 SecureClaw 重叠 | 低 | SecureClaw 是 CLI 审计工具，ClawSafe 是 AI 分析 + 可视化产品 |

## 验证方式

1. 用已知恶意技能（ClawHavoc 样本）测试检出率
2. 用已知安全技能测试误报率
3. Hackathon 评委实际使用 demo

## 提交 Checklist

- [ ] 公开 GitHub 仓库
- [ ] Demo 视频发布到 X，tag @lablabai 和 @Surgexyz_
- [ ] 在 Moltbook lablab submolt 发布更新
- [ ] Lablab.ai 提交表单填写
- [ ] 封面图
- [ ] 项目文档（README）

## 实施计划

### Day 1 (2/25): 后端核心
- [ ] 项目脚手架搭建（FastAPI + React monorepo）
- [ ] Skill Scanner 静态分析引擎
- [ ] SKILL.md 解析器
- [ ] 已知恶意模式匹配规则

### Day 2 (2/26): AI 分析引擎
- [ ] LLM 集成（Claude/DeepSeek）分析 SKILL.md
- [ ] Prompt injection 检测逻辑
- [ ] 安全评分算法
- [ ] API 端点完善

### Day 3 (2/27): Dashboard
- [ ] React Dashboard 搭建
- [ ] 扫描结果可视化
- [ ] 风险等级展示
- [ ] 代码高亮 + 问题标注

### Day 4 (2/28): OpenClaw 集成 + Moltbook
- [ ] SKILL.md 编写
- [ ] Agent 聊天命令实现
- [ ] Moltbook 自动发帖
- [ ] 集成测试

### Day 5 (3/1): 打磨 + 提交
- [ ] Demo 视频录制
- [ ] README 完善
- [ ] 发布到 X
- [ ] 提交到 Lablab.ai
- [ ] 最终测试和 bug 修复

## 为什么这个项目能拿奖

1. **解决真实问题** -- OpenClaw 安全危机是 2026 年 2 月最热门的安全话题，Microsoft、Cisco、CrowdStrike 都在报道
2. **社会价值** -- 保护用户免受恶意软件、数据泄露、私钥被盗
3. **创新性** -- AI 语义分析 + 可视化 Dashboard + OpenClaw Agent 三合一，市场上没有
4. **本次 hackathon 安全赛道零竞争** -- 已有提交全部是 Agent 经济方向
5. **实用性** -- 用户真正需要且会使用的工具
6. **技术深度** -- 双引擎分析（静态规则 + AI 语义），不是简单的正则匹配
7. **完整性** -- 从 API 到 Dashboard 到 OpenClaw Skill 的完整产品

## 备选方案

如果安全方向最终不想做，以下是两个备选：

### 备选 A: AgentMeet -- 智能 Agent 协作匹配平台
类似你的 MeetSpot，但为 AI Agent 找到最佳协作伙伴。基于能力、信誉、历史表现匹配 Agent。

### 备选 B: SkillForge -- AI Agent 技能自动生成器
用自然语言描述需求，自动生成安全的 OpenClaw Skill。内置安全检查，确保生成的技能不包含恶意代码。
