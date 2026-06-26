#!/usr/bin/env python3
"""Optimize Chinese prose and Markdown formatting in documentation."""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Applied to full file content (including frontmatter)
GLOBAL_REPLACEMENTS = [
    (re.compile(r"\biPhon\b(?!e)"), "iPhone"),  # iPhon -> iPhone, skip iPhone
    ("drwaio", "drawio"),
    ("k可通过", "可通过"),
    ("imaginary能", "imaginary 能"),
    ("开机时候", "开机时"),
    ("注 意", "注意"),
    ("提 示", "提示"),
    ("SynologyNAS", "Synology NAS"),
]

CHINESE = r"\u4e00-\u9fff"
PUNCT_BEFORE_COMMA = re.compile(rf"([{CHINESE}）】」』\"'）\]])" + r", ")
PUNCT_AFTER_BACKTICK = re.compile(r"`" + r", ")
PUNCT_AFTER_BOLD = re.compile(r"\*\*, ")
PUNCT_END_PERIOD = re.compile(rf"([{CHINESE}）】」』\"'）\]])\.(?=\s*$)")
PUNCT_SEMICOLON = re.compile(rf"([{CHINESE}]);(?=\s*$)")
DOUBLE_SPACE_BEFORE_BACKTICK = re.compile(r"  (`)")
LIST_BOLD_LABEL = re.compile(
    rf"^(\s*(?:[-*+]|\d+\.)\s+)\*\*([^*]+)\*\* ([{CHINESE}])"
)
STANDALONE_BOLD_LABEL = re.compile(
    rf"^\*\*([^*]+)\*\* ([{CHINESE}])"
)
IMAGE_LINE = re.compile(r"^\s*!\[")


def apply_global(content: str) -> str:
    for old, new in GLOBAL_REPLACEMENTS:
        if isinstance(old, re.Pattern):
            content = old.sub(new, content)
        else:
            content = content.replace(old, new)
    content = content.replace("登陆", "登录")
    return content


def in_code_block(line: str, state: dict) -> bool:
    if line.strip().startswith("```"):
        state["in_code"] = not state.get("in_code", False)
        return True
    return state.get("in_code", False)


def in_frontmatter(line: str, state: dict) -> bool:
    if state.get("fm_done"):
        return False
    if line.strip() == "---":
        state["fm_count"] = state.get("fm_count", 0) + 1
        if state["fm_count"] >= 2:
            state["fm_done"] = True
        return True
    return not state.get("fm_done", True) and state.get("fm_count", 0) == 1


def optimize_prose_line(line: str, state: dict) -> str:
    if in_frontmatter(line, state) or in_code_block(line, state):
        return line

    stripped = line.strip()
    if stripped.startswith(("<", "$", "#!", "{%")):
        return line

    line = DOUBLE_SPACE_BEFORE_BACKTICK.sub(r" \1", line)
    line = PUNCT_BEFORE_COMMA.sub(r"\1，", line)
    line = PUNCT_AFTER_BACKTICK.sub("`，", line)
    line = PUNCT_AFTER_BOLD.sub("**，", line)
    line = PUNCT_END_PERIOD.sub(r"\1。", line)
    line = PUNCT_SEMICOLON.sub(r"\1；", line)

    # Only add colon for list-item labels and standalone bold headings
    line = LIST_BOLD_LABEL.sub(r"\1**\2**：\3", line)
    if STANDALONE_BOLD_LABEL.match(line) and "：" not in line.split("**")[1]:
        line = STANDALONE_BOLD_LABEL.sub(r"**\1**：\2", line)

    return line


def add_blank_lines_before_images(content: str) -> str:
    lines = content.splitlines(keepends=True)
    out = []
    for i, line in enumerate(lines):
        if IMAGE_LINE.match(line) and i > 0:
            prev = out[-1] if out else ""
            if prev.strip() and not prev.strip().endswith((">", ":")):
                if not (out and out[-1].strip() == ""):
                    out.append("\n")
        out.append(line)
    return "".join(out)


def add_blank_lines_before_headings(content: str) -> str:
    lines = content.splitlines(keepends=True)
    out = []
    for i, line in enumerate(lines):
        if re.match(r"^#{1,6}\s", line) and i > 0:
            prev = out[-1] if out else ""
            if prev.strip() and not (out and out[-1].strip() == ""):
                out.append("\n")
        out.append(line)
    return "".join(out)


def fix_heading_spaces(content: str) -> str:
    def repl(m):
        text = m.group(2)
        text = re.sub(r"([a-zA-Z])([\u4e00-\u9fff])", r"\1 \2", text)
        text = re.sub(r"([\u4e00-\u9fff])([a-zA-Z])", r"\1 \2", text)
        text = re.sub(r"\s+", " ", text).strip()
        return f"{m.group(1)}{text}"

    return re.sub(r"^(#{1,6}\s+)(.+)$", repl, content, flags=re.MULTILINE)


def process_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    original = content

    content = apply_global(content)

    state: dict = {"fm_count": 0, "fm_done": False, "in_code": False}
    lines = content.splitlines(keepends=True)
    new_lines = [optimize_prose_line(line, state) for line in lines]
    content = "".join(new_lines)

    content = add_blank_lines_before_images(content)
    content = add_blank_lines_before_headings(content)
    content = fix_heading_spaces(content)
    content = "\n".join(ln.rstrip() for ln in content.splitlines()) + "\n"

    if content != original:
        path.write_text(content, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = []
    for path in sorted(ROOT.rglob("*.md")):
        if ".jekyll" in str(path) or "_site" in str(path):
            continue
        if process_file(path):
            changed.append(path.relative_to(ROOT))

    print(f"Updated {len(changed)} files")
    for p in changed:
        print(f"  {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
