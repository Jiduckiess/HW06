#!/usr/bin/env python3
"""Render the HW06 Markdown reports as self-contained submission PDFs."""

from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
FONT_DIR = Path("/System/Library/Fonts/Supplemental")
UNICODE_FONT_DIR = Path("/private/tmp/hw06-fonts/dejavu/dejavu-fonts-ttf-2.37/ttf")

pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Italic", str(FONT_DIR / "Arial Italic.ttf")))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold", italic="Arial-Italic", boldItalic="Arial-Bold")
pdfmetrics.registerFont(TTFont("DejaVuSans", str(UNICODE_FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", str(UNICODE_FONT_DIR / "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFontFamily("DejaVuSans", normal="DejaVuSans", bold="DejaVuSans-Bold", italic="DejaVuSans", boldItalic="DejaVuSans-Bold")


def inline(text: str) -> str:
    """Escape Markdown text and preserve the few inline styles used in the reports."""
    text = html.escape(text)
    def code_span(match):
        value = match.group(1)
        return f'<font name="Courier">{value}</font>' if value.isascii() else value

    text = re.sub(r"`([^`]+)`", code_span, text)
    # Keep Markdown bold as plain text: ReportLab's inline bold reset can switch
    # back to a non-Unicode base font after a bold span.
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\[(.*?)\]\([^)]*\)", r"\1", text)
    return text


def cells(line: str) -> list[str]:
    return [item.strip() for item in line.strip().strip("|").split("|")]


def paragraph(line: str, styles):
    if line.startswith("- "):
        return Paragraph(inline(line[2:]), styles["bullet"], bulletText="•")
    if re.match(r"\d+\. ", line):
        number, body = line.split(". ", 1)
        return Paragraph(inline(body), styles["bullet"], bulletText=f"{number}.")
    if line.startswith("> "):
        return Paragraph(inline(line[2:]), styles["quote"])
    return Paragraph(inline(line), styles["body"])


def make_table(raw: list[str], styles, available_width: float):
    rows = [cells(row) for row in raw if not re.fullmatch(r"\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?", row)]
    count = max(len(row) for row in rows)
    rendered = []
    for row_number, row in enumerate(rows):
        row = row + [""] * (count - len(row))
        style = styles["table_header"] if row_number == 0 else styles["table_body"]
        rendered.append([Paragraph(inline(cell), style) for cell in row])
    table = Table(rendered, colWidths=[available_width / count] * count, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12304A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#AAB7C4")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F4F7FA")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def build(source: Path, target: Path, title: str):
    styles_base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle("Title", parent=styles_base["Title"], fontName="DejaVuSans-Bold", fontSize=19, leading=24, textColor=colors.HexColor("#12304A"), alignment=TA_CENTER, spaceAfter=12),
        "h1": ParagraphStyle("H1", parent=styles_base["Heading1"], fontName="DejaVuSans-Bold", fontSize=14, leading=18, textColor=colors.HexColor("#12304A"), spaceBefore=12, spaceAfter=6),
        "h2": ParagraphStyle("H2", parent=styles_base["Heading2"], fontName="DejaVuSans-Bold", fontSize=11.5, leading=14, textColor=colors.HexColor("#164C73"), spaceBefore=9, spaceAfter=4),
        "body": ParagraphStyle("Body", parent=styles_base["BodyText"], fontName="DejaVuSans", fontSize=8.3, leading=11.2, spaceAfter=4),
        "bullet": ParagraphStyle("Bullet", parent=styles_base["BodyText"], fontName="DejaVuSans", fontSize=8.3, leading=11.2, leftIndent=13, firstLineIndent=-8, spaceAfter=3),
        "quote": ParagraphStyle("Quote", parent=styles_base["BodyText"], fontName="DejaVuSans", fontSize=8, leading=10.4, leftIndent=10, textColor=colors.HexColor("#455A64"), spaceAfter=4),
        "table_header": ParagraphStyle("TableHeader", parent=styles_base["BodyText"], fontName="DejaVuSans-Bold", fontSize=6.4, leading=7.5, textColor=colors.white),
        "table_body": ParagraphStyle("TableBody", parent=styles_base["BodyText"], fontName="DejaVuSans", fontSize=6.2, leading=7.2),
    }
    page = landscape(A4)
    margin = 12 * mm
    doc = SimpleDocTemplate(str(target), pagesize=page, leftMargin=margin, rightMargin=margin, topMargin=13 * mm, bottomMargin=13 * mm, title=title, author="23127172")
    story = [Paragraph(title, styles["title"])]
    lines = source.read_text(encoding="utf-8").splitlines()
    index = 0
    while index < len(lines):
        line = lines[index].rstrip()
        if not line:
            story.append(Spacer(1, 3))
            index += 1
            continue
        if line.startswith("|"):
            end = index
            while end < len(lines) and lines[end].startswith("|"):
                end += 1
            story.append(KeepTogether(make_table(lines[index:end], styles, doc.width)))
            story.append(Spacer(1, 6))
            index = end
            continue
        if line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), styles["h2"]))
        elif line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), styles["h1"]))
        elif line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), styles["h1"]))
        elif line.startswith("```"):
            end = index + 1
            block = []
            while end < len(lines) and not lines[end].startswith("```"):
                block.append(lines[end])
                end += 1
            story.append(Paragraph(inline("<br/>".join(block)), styles["quote"]))
            index = end
        else:
            story.append(paragraph(line, styles))
        index += 1

    def footer(canvas, document):
        canvas.saveState()
        canvas.setFont("DejaVuSans", 7)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawString(document.leftMargin, 8 * mm, "HW06 API Testing — Student ID 23127172")
        canvas.drawRightString(page[0] - document.rightMargin, 8 * mm, f"Page {document.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    build(ROOT / "report" / "main-report.md", OUTPUT / "HW06_Main_Report.pdf", "HW06 API Testing — Main Report")
    build(ROOT / "report" / "ai-audit-report.md", OUTPUT / "HW06_AI_Audit_Report.pdf", "HW06 API Testing — AI Audit Report")
