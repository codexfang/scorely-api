from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem,
)
from reportlab.lib import colors
from models.assessment import AssessmentSession, ScoreResult
from services.questionnaire import get_questions
from utils.helpers import format_timestamp


def generate_report(session: AssessmentSession, score: ScoreResult) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Title"],
        fontSize=24, spaceAfter=6, textColor=HexColor("#1a1a2e"),
    )
    heading_style = ParagraphStyle(
        "CustomHeading", parent=styles["Heading2"],
        fontSize=14, spaceAfter=8, spaceBefore=16,
        textColor=HexColor("#16213e"),
    )
    body_style = ParagraphStyle(
        "CustomBody", parent=styles["Normal"],
        fontSize=10, leading=14, spaceAfter=6,
    )
    label_style = ParagraphStyle(
        "Label", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=HexColor("#555555"),
    )
    score_style = ParagraphStyle(
        "Score", parent=styles["Normal"],
        fontSize=10, leading=14, spaceAfter=4,
    )

    elements = []

    elements.append(Paragraph("Scorely API — Vendor Risk Assessment Report", title_style))
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=1, color=HexColor("#0f3460")))
    elements.append(Spacer(1, 12))

    meta_data = [
        ["Assessment ID", str(session.token)],
        ["Organization", session.organization or "N/A"],
        ["Assessor", session.assessor or "N/A"],
        ["Date Generated", format_timestamp()],
    ]
    meta_table = Table(meta_data, colWidths=[1.8 * inch, 3.5 * inch])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), HexColor("#555555")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("Risk Score Summary", heading_style))
    risk_color = "#e74c3c" if score.risk_level.value == "High" else "#f39c12" if score.risk_level.value == "Medium" else "#27ae60"
    summary_data = [
        ["Overall Risk Score", f"{score.overall_score}/100"],
        ["Risk Level", f'<font color="{risk_color}">{score.risk_level.value}</font>'],
    ]
    summary_table = Table(summary_data, colWidths=[2.5 * inch, 2.5 * inch])
    summary_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#dddddd")),
        ("BACKGROUND", (0, 0), (0, -1), HexColor("#f8f9fa")),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 12))

    if score.category_scores:
        elements.append(Paragraph("Category Breakdown", heading_style))
        cat_data = [["Category", "Score"]]
        for cat, sc in sorted(score.category_scores.items()):
            cat_data.append([cat, f"{sc}/100"])
        cat_table = Table(cat_data, colWidths=[3.5 * inch, 1.5 * inch])
        cat_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#16213e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dddddd")),
        ]))
        elements.append(cat_table)
        elements.append(Spacer(1, 12))

    if score.recommendations:
        elements.append(Paragraph("Recommendations", heading_style))
        rec_items = [Paragraph(f"• {rec}", body_style) for rec in score.recommendations]
        for item in rec_items:
            elements.append(item)
        elements.append(Spacer(1, 12))

    questions = get_questions()
    question_map = {q["id"]: q for q in questions}

    if session.answers:
        elements.append(Paragraph("Assessment Responses", heading_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
        elements.append(Spacer(1, 6))

        for idx, ans in enumerate(session.answers, 1):
            q = question_map.get(ans.question_id, {})
            q_text = q.get("question", ans.question_id)
            elements.append(Paragraph(
                f"<b>Q{idx}:</b> {q_text}", body_style
            ))
            elements.append(Paragraph(
                f"<b>Answer:</b> {ans.answer}", score_style
            ))
            if ans.notes:
                elements.append(Paragraph(
                    f"<i>Notes:</i> {ans.notes}", label_style
                ))
            elements.append(Spacer(1, 6))

    doc.build(elements)
    buffer.seek(0)
    return buffer
