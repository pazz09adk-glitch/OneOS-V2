#!/usr/bin/env python3
"""Convert textutil Word HTML export to ct-word-doc seed JS module."""

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Set

from bs4 import BeautifulSoup, NavigableString, Tag

DEFAULT_SEMANTIC = {
    "p1": "ct-word-title",
    "p2": "ct-word-contract-no",
    "p3": "ct-word-contract-no",
    "p5": "ct-word-party-line",
    "p6": "ct-word-party-line",
    "p7": "ct-word-party-line",
    "p8": "ct-word-party-line",
}


def parse_css_rules(css_text: str) -> Dict[str, str]:
    rules: Dict[str, str] = {}
    for block in re.findall(r"([^{]+)\{([^}]+)\}", css_text):
        selector = block[0].strip()
        props = block[1].strip()
        if "," in selector:
            continue
        selector = selector.lstrip(".")
        if re.match(r"^(p|span|td|table)\.", selector):
            rules[selector] = props
    return rules


def is_red_style(style: str) -> bool:
    return bool(re.search(r"color\s*:\s*#ff0000", style, re.I))


def build_red_classes(rules: Dict[str, str]) -> Set[str]:
    red = set()
    for cls, props in rules.items():
        if is_red_style(props):
            red.add(cls.split(".")[-1])
    return red


def class_list(tag: Tag) -> List[str]:
    raw = tag.get("class") or []
    if isinstance(raw, str):
        return raw.split()
    return list(raw)


def primary_class(tag: Tag) -> Optional[str]:
    classes = class_list(tag)
    for c in classes:
        if c in DEFAULT_SEMANTIC or re.match(r"^[pst]\d+$", c) or re.match(r"^td\d+$", c):
            return c
    return classes[0] if classes else None


def merge_style(tag: Tag, rules: Dict[str, str]) -> None:
    parts: List[str] = []
    for c in class_list(tag):
        key_p = f"p.{c}" if c.startswith("p") else None
        key_s = f"span.{c}" if c.startswith("s") else None
        key_td = f"td.{c}" if c.startswith("td") else None
        key_t = f"table.{c}" if c.startswith("t") else None
        for key in (key_p, key_s, key_td, key_t):
            if key and key in rules:
                parts.append(rules[key])
    if parts:
        existing = tag.get("style", "")
        merged = ";".join([existing] + parts) if existing else ";".join(parts)
        tag["style"] = merged


def strip_apple_noise(soup: BeautifulSoup) -> None:
    for el in soup.find_all(class_="Apple-converted-space"):
        el.replace_with("\u00a0" * max(1, len(el.get_text())))
    for el in soup.find_all(class_="Apple-tab-span"):
        el.replace_with("\t")


def wrap_risk_redlines(soup: BeautifulSoup, red_classes: Set[str]) -> None:
    risk_seq = 0

    def next_id() -> str:
        nonlocal risk_seq
        risk_seq += 1
        return f"risk-{risk_seq}"

    def is_red_tag(tag: Tag) -> bool:
        pc = primary_class(tag)
        return pc in red_classes if pc else False

    for p in list(soup.find_all("p")):
        if not is_red_tag(p):
            continue
        if p.find_parent(class_=lambda x: x and "ct-risk-redline" in x):
            continue
        inner = list(p.contents)
        if not inner:
            continue
        wrapper = soup.new_tag(
            "span",
            attrs={
                "class": "ct-risk-redline",
                "data-risk-redline": "1",
                "data-risk-id": next_id(),
            },
        )
        for child in inner:
            wrapper.append(child.extract() if isinstance(child, Tag) else child)
        p.clear()
        p.append(wrapper)

    for span in list(soup.find_all("span")):
        if not is_red_tag(span):
            continue
        if span.find_parent(class_=lambda x: x and "ct-risk-redline" in x):
            continue
        parent_p = span.find_parent("p")
        if parent_p and is_red_tag(parent_p):
            continue
        wrapper = soup.new_tag(
            "span",
            attrs={
                "class": "ct-risk-redline",
                "data-risk-redline": "1",
                "data-risk-id": next_id(),
            },
        )
        span.wrap(wrapper)


def apply_semantic_classes(root: Tag, semantic: Dict[str, str]) -> None:
    for tag in root.find_all(True):
        pc = primary_class(tag)
        if pc and pc in semantic:
            classes = class_list(tag)
            extra = semantic[pc]
            if extra not in classes:
                tag["class"] = classes + [extra]


def map_tables(root: Tag) -> None:
    for i, table in enumerate(root.find_all("table")):
        classes = class_list(table)
        if "ct-word-table" not in classes:
            table["class"] = classes + ["ct-doc-table", "ct-word-table"]
        for td in table.find_all("td"):
            td["class"] = class_list(td) + ["ct-word-td"]


def apply_template_vars(html: str) -> str:
    regex_replacements = [
        (r"合同编号<span[^>]*>：</span>【LNZLHT\s*<span[^>]*>[\s\S]*?</span>\s*】",
         "合同编号：【LNZLHT {{contractCode}} 】"),
        (r"合同编号：【LNZLHT[^】]*】", "合同编号：【LNZLHT {{contractCode}} 】"),
        (r"协议编号：【LNZLHT[^】]*】", "协议编号：【LNZLHT {{contractCode}} 】"),
    ]
    literal_replacements = [
        ("甲方（出租方）：羚牛氢能科技（广东）有限公司", "甲方（出租方）：{{lessorName}}"),
        ("甲方(出租方): 羚牛氢能科技（广东）有限公司", "甲方(出租方): {{lessorName}}"),
        ("甲方：羚牛氢能科技（广东）有限公司", "甲方：{{lessorName}}"),
        ("致：羚牛氢能科技（广东）有限公司", "致：{{lessorName}}"),
        ("甲方（车辆提供方）：", "甲方（车辆提供方）：{{lessorName}}"),
        ("乙方（车辆使用方）：", "乙方（车辆使用方）：{{customerName}}"),
        ("乙方(承租方):</b>", "乙方(承租方): {{customerName}}</b>"),
        ("乙方（承租方）：</b>", "乙方（承租方）：{{customerName}}</b>"),
    ]
    out = html
    for pattern, repl in regex_replacements:
        out = re.sub(pattern, repl, out)
    for old, new in literal_replacements:
        out = out.replace(old, new)
    return out


def scope_css(css_text: str) -> str:
    scoped = []
    for block in re.findall(r"([^{]+)\{([^}]+)\}", css_text):
        selector = block[0].strip()
        props = block[1].strip()
        if selector.startswith("@") or "," in selector:
            continue
        scoped.append(f".ct-word-doc--v266 {selector}{{{props}}}")
    return "\n".join(scoped)


def convert_html(raw: str) -> str:
    css_match = re.search(r"<style[^>]*>([\s\S]*?)</style>", raw)
    body_match = re.search(r"<body>([\s\S]*?)</body>", raw)
    if not css_match or not body_match:
        raise SystemExit("Invalid source HTML")

    rules = parse_css_rules(css_match.group(1))
    red_classes = build_red_classes(rules)
    scoped = scope_css(css_match.group(1))

    soup = BeautifulSoup(body_match.group(1), "lxml")
    strip_apple_noise(soup)

    for tag in soup.find_all(True):
        merge_style(tag, rules)

    wrap_risk_redlines(soup, red_classes)
    apply_semantic_classes(soup, DEFAULT_SEMANTIC)
    map_tables(soup)

    body_html = "".join(str(c) for c in (soup.body or soup).contents)
    body_html = apply_template_vars(body_html)
    body_html = re.sub(r"<p class=\"p\d+\"><br\s*/?></p>\s*", "", body_html, count=3)

    return (
        '<div class="ct-word-doc ct-word-doc--v266">'
        f"<style>{scoped}</style>"
        f"{body_html}"
        "</div>"
    )


def export_docx(docx: Path, out: Path, export_name: str) -> None:
    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    subprocess.run(
        ["textutil", "-convert", "html", "-output", str(tmp_path), str(docx)],
        check=True,
    )
    raw = tmp_path.read_text(encoding="utf-8")
    tmp_path.unlink(missing_ok=True)
    html = convert_html(raw)
    escaped = json.dumps(html, ensure_ascii=False)
    out.write_text(
        f"// AUTO-GENERATED from {docx.name} — do not edit by hand\n"
        f"export var {export_name} = {escaped};\n",
        encoding="utf-8",
    )
    print(f"Wrote {out} ({out.stat().st_size} bytes), redlines={html.count('data-risk-redline')}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    parser.add_argument("out", type=Path)
    parser.add_argument("export_name")
    args = parser.parse_args()
    export_docx(args.docx, args.out, args.export_name)


if __name__ == "__main__":
    main()
