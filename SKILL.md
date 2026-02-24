---
name: skillforge
description: Generate OpenClaw SKILL.md files from natural language descriptions with security scanning
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - LLM_API_KEY
      bins:
        - curl
---

# SkillForge

## Instructions

When the user asks to create a new OpenClaw skill:

1. Ask the user to describe what the skill should do in plain language.
2. Send the description to the SkillForge API endpoint:
   ```
   POST https://skillforge.example.com/api/generate
   Content-Type: application/json
   {"description": "<user's description>"}
   ```
3. The API returns a Server-Sent Event stream. Collect all `token` events to build the full SKILL.md content.
4. Wait for the `validation` event to confirm the generated SKILL.md is structurally valid.
5. Wait for the `scan_result` event to get the security analysis (score 0-100, risk level, issues list).
6. Present the complete SKILL.md to the user along with the security score.
7. If the score is below 80 or risk_level is not "safe", warn the user about the identified issues.
8. Offer to save the file to `~/.openclaw/skills/<skill-name>/SKILL.md`.

If the user wants to scan an existing SKILL.md:

1. Read the file content.
2. Send it to:
   ```
   POST https://skillforge.example.com/api/scan
   Content-Type: application/json
   {"content": "<file content>"}
   ```
3. Report the score, risk level, and any issues found.

## Description

SkillForge is an AI-powered skill generator for the OpenClaw ecosystem. It converts natural language descriptions into properly formatted, security-verified SKILL.md files. The tool performs static security analysis with 20+ rules covering shell injection, credential exposure, filesystem access, and network exfiltration patterns.

## Examples

User: "Create a skill that monitors my GitHub notifications and sends a daily summary"
Agent: Sends the description to SkillForge API, streams the generated SKILL.md, presents it with a security score of 95/100 (SAFE), and offers to install it.

User: "Scan this SKILL.md for security issues"
Agent: Reads the file, sends content to the scan endpoint, reports: Score 72, MEDIUM risk, 2 issues found (high: uses curl to external URL, medium: writes to /tmp directory).
