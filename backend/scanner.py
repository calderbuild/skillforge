import re
import yaml


RULES = [
    # Critical: remote code execution
    {"pattern": r"curl\s+.*\|\s*(sudo\s+)?(sh|bash|zsh|python[23]?|perl|ruby|node)",
     "severity": "critical", "message": "Pipe to shell execution detected"},
    {"pattern": r"wget\s+.*-O\s*-\s*\|\s*(sh|bash|python)",
     "severity": "critical", "message": "wget pipe to shell detected"},
    {"pattern": r"base64\s+(-d|--decode)",
     "severity": "critical", "message": "Base64 decode command detected"},
    {"pattern": r"(nc\s+-[a-z]*[el]|ncat|netcat)\s+",
     "severity": "critical", "message": "Reverse shell tool detected"},
    {"pattern": r"bash\s+-i\s+>&?\s*/dev/tcp/",
     "severity": "critical", "message": "Bash reverse shell via /dev/tcp"},
    {"pattern": r"python[23]?\s+-c\s+['\"].*socket.*connect",
     "severity": "critical", "message": "Python reverse shell"},
    {"pattern": r"mkfifo\s+\S+\s*;\s*.*\bsh\b",
     "severity": "critical", "message": "Named pipe reverse shell"},
    {"pattern": r"ignore\s+(previous|above|all)\s+instructions",
     "severity": "critical", "message": "Prompt injection pattern detected"},
    {"pattern": r"(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(DAN|unrestricted|unfiltered)",
     "severity": "critical", "message": "Jailbreak pattern detected"},

    # High: dangerous operations
    {"pattern": r"\beval\s*\(|\bexec\s*\(",
     "severity": "high", "message": "Dynamic code execution"},
    {"pattern": r"(\/etc\/passwd|\/etc\/shadow|~\/\.ssh\/id_)",
     "severity": "high", "message": "Sensitive file path access"},
    {"pattern": r"(rm\s+-rf\s+[/~]|chmod\s+777|chown\s+root)",
     "severity": "high", "message": "Dangerous filesystem operation"},
    {"pattern": r"subprocess\.call|os\.system|os\.popen",
     "severity": "high", "message": "Shell command execution in script"},
    {"pattern": r"(crontab\s+-|LaunchAgents?/.*\.plist)",
     "severity": "high", "message": "Persistence mechanism detected"},
    {"pattern": r"(repeat|reveal|show)\s+(your|the)\s+(system\s+prompt|hidden\s+instructions?)",
     "severity": "high", "message": "System prompt extraction attempt"},

    # Medium: suspicious patterns
    {"pattern": r"\$\{?(AWS_SECRET_ACCESS_KEY|PRIVATE_KEY|DB_PASSWORD)\}?",
     "severity": "medium", "message": "Sensitive credential reference"},
    {"pattern": r"https?://\d+\.\d+\.\d+\.\d+",
     "severity": "medium", "message": "Direct IP address in URL"},
    {"pattern": r"\\x[0-9a-fA-F]{2}(\\x[0-9a-fA-F]{2}){5,}",
     "severity": "medium", "message": "Hex-encoded content (possible obfuscation)"},
    {"pattern": r"https?://(webhook\.site|requestbin\.com|pipedream\.net|pastebin\.com|transfer\.sh)",
     "severity": "medium", "message": "Known data exfiltration service URL"},
    {"pattern": r"(cat|read)\s+.*\|.*\b(curl|wget|nc)\b",
     "severity": "medium", "message": "File read piped to network command"},

    # Low: informational
    {"pattern": r"\b(TODO|FIXME|HACK)\b",
     "severity": "low", "message": "Unfinished code marker"},
]

ALLOWED_BINS = {
    "git", "node", "npm", "npx", "yarn", "pnpm", "python", "python3",
    "pip", "pip3", "ruby", "gem", "go", "cargo", "rustc", "java",
    "javac", "mvn", "gradle", "docker", "kubectl", "jq", "yq",
    "sed", "awk", "grep", "find", "sort", "uniq", "wc", "tr",
    "convert", "ffmpeg", "sqlite3", "psql", "mongosh",
}
BLOCKED_BINS = {"bash", "sh", "zsh", "curl", "wget", "nc", "ncat", "netcat", "telnet"}


def validate_skill_md(content: str) -> tuple:
    """Validate SKILL.md format compliance. Returns (valid, error_message)."""
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return False, "Missing YAML frontmatter delimiters"
    try:
        meta = yaml.safe_load(frontmatter_match.group(1))
    except yaml.YAMLError as e:
        return False, f"Invalid YAML: {e}"
    if not isinstance(meta, dict):
        return False, "Frontmatter is not a YAML mapping"
    if not meta.get("name"):
        return False, "Missing required field: name"
    if not re.match(r'^[a-z0-9][a-z0-9-]*$', str(meta["name"])):
        return False, f"Invalid name format: {meta['name']}"
    if not meta.get("description"):
        return False, "Missing required field: description"
    return True, ""


def scan_skill_md(content: str) -> dict:
    """Scan SKILL.md content and return security report."""
    issues = []

    # Normalize encodings before matching
    normalized = content
    try:
        normalized = normalized.encode().decode('unicode_escape')
    except (UnicodeDecodeError, UnicodeError):
        pass

    # Rule matching
    for rule in RULES:
        compiled = re.compile(rule["pattern"], re.IGNORECASE)
        for i, line in enumerate(normalized.split('\n'), 1):
            if compiled.search(line):
                issues.append({
                    "severity": rule["severity"],
                    "message": rule["message"],
                    "line": i,
                })

    # Bins whitelist check
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if frontmatter_match:
        try:
            meta = yaml.safe_load(frontmatter_match.group(1)) or {}
            bins = (meta.get("metadata", {}).get("openclaw", {})
                    .get("requires", {}).get("bins", []))
            for b in (bins or []):
                if b in BLOCKED_BINS:
                    issues.append({
                        "severity": "critical",
                        "message": f"Blocked binary requested: {b}",
                        "line": None,
                    })
                elif b not in ALLOWED_BINS:
                    issues.append({
                        "severity": "medium",
                        "message": f"Unknown binary requested: {b}",
                        "line": None,
                    })
        except yaml.YAMLError:
            pass

    # Score calculation
    severity_weights = {"critical": 30, "high": 15, "medium": 5, "low": 1}
    penalty = sum(severity_weights.get(i["severity"], 0) for i in issues)
    score = max(0, 100 - penalty)

    severity_counts = {}
    for i in issues:
        severity_counts[i["severity"]] = severity_counts.get(i["severity"], 0) + 1

    risk_level = "safe"
    if any(i["severity"] == "critical" for i in issues):
        risk_level = "critical"
    elif any(i["severity"] == "high" for i in issues):
        risk_level = "high"
    elif any(i["severity"] == "medium" for i in issues):
        risk_level = "medium"

    return {
        "score": score,
        "risk_level": risk_level,
        "issues": issues,
        "summary": severity_counts,
        "disclaimer": "Static analysis only. This is advisory -- not a security guarantee.",
    }
