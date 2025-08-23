import google.generativeai as genai
import os

import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

import os
import markdown
import re
from bs4 import BeautifulSoup
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
)
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

import pdb
from dotenv import load_dotenv

load_dotenv()

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 50  # page margin in points

# Configure the API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY")) # Or use os.environ["GEMINI_API_KEY"]

# Create the model
model = genai.GenerativeModel('gemini-1.5-flash')

RISK_CATEGORY_MAP = {
    0: "Secure", 1: "Unstable", 2: "Risky",
    3: "Critical", 4: "Default"
}

def explain_ai(gen_type, df, application_id, lime_explanation, aggregated_lime_scores, X_train, lime_image_path=None, 
               outdir='outdir', additional_instructions=None): 
    
    if gen_type == 'lengthy_summary': 
        prompt = generate_explanation_prompt(df, application_id=application_id, 
                                             lime_explanation=lime_explanation, 
                                             aggregated_lime_scores=aggregated_lime_scores, 
                                             X_train=X_train,
                                             additional_instructions=additional_instructions) 
        response = model.generate_content(prompt)
        return response.text
    
    elif gen_type == 'full_report': 
        prompt = generate_full_report_prompt(df, application_id=application_id, lime_explanation=lime_explanation,
                                             aggregated_lime_scores=aggregated_lime_scores, X_train=X_train,
                                             lime_image_path=lime_image_path,
                                             additional_instructions=additional_instructions) 
        response = model.generate_content(prompt)
        os.makedirs(outdir, exist_ok=True)
        filename = os.path.join(outdir, f"report_{application_id}.pdf")
        generate_pdf_from_text(response.text, filename=filename, extra_images=[lime_image_path] if lime_image_path else [])
        
        return response.text
    
    elif gen_type == 'summary': 
        prompt = generate_summary_prompt(df, application_id, lime_explanation, aggregated_lime_scores, X_train,
                                        additional_instructions=additional_instructions) 
        response = model.generate_content(prompt) 
        return response.text


def generate_explanation_prompt(df, application_id, lime_explanation, aggregated_lime_scores, X_train, 
                                RISK_CATEGORY_MAP=RISK_CATEGORY_MAP, additional_instructions=''):
    """
    Generates a textual prompt to induce explanation for a loan application using Gemini API.
    """
    
    # --- Extract the application row ---
    row_mask = df['application_id'] == application_id
    if not row_mask.any():
        raise ValueError(f"Application ID {application_id} not found in df['application_id']")
    
    data_row = df.loc[row_mask].iloc[0]
    
    # --- Predict numeric class from LIME explanation ---
    predicted_numeric_class = list(lime_explanation.local_exp.keys())[0]  # first valid key
    predicted_category = RISK_CATEGORY_MAP[predicted_numeric_class]
    
    # --- Extract top LIME features and weights ---
    lime_list = lime_explanation.as_list(label=predicted_numeric_class)
    lime_features = [f"{name.split(' ')[0]} ({weight:+.3f})" for name, weight in lime_list]
    
    # --- Construct 5C summary ---
    c_summary = [f"{c}: {score:+.3f}" for c, score in aggregated_lime_scores.items()]
    
    # --- Construct row feature summary ---
    feature_summary = []
    for col in X_train.columns:
        value = data_row[col]
        feature_summary.append(f"{col} = {value}")
    
    # --- Generate prompt ---
    prompt = f"""
You are a financial risk analyst. Analyze the following loan application and provide a detailed explanation of why it was assigned the "{predicted_category}" risk category.

Application ID: {application_id}

--- Application Data ---
{', '.join(feature_summary)}

--- Key Feature Impacts (LIME) ---
{', '.join(lime_features)}

--- Aggregated 5C Contributions ---
{', '.join(c_summary)}

Explain in clear, concise terms how the application data and these key factors contributed to the risk assessment. Highlight any negative or positive influences and indicate which features were most critical in the rating. {additional_instructions}
"""
    return prompt

def generate_full_report_prompt(df, application_id, lime_explanation, aggregated_lime_scores, X_train, lime_image_path, RISK_CATEGORY_MAP=RISK_CATEGORY_MAP, additional_instructions=''):
    """
    Generates a prompt for Gemini API to produce a full report for a loan application.
    The report can include: application details, LIME chart/image, tables, and explanation.

    Parameters:
    -----------
    df : pd.DataFrame
        DataFrame containing the loan application data.
    application_id : int or str
        Application ID to generate report for.
    lime_explanation : LIME explanation object
        Output from generate_lime_explanation.
    aggregated_lime_scores : dict
        Output from generate_aggregated_lime.
    X_train : pd.DataFrame
        Training features used for LIME feature cleaning.
    lime_image_path : str
        File path to the LIME image/chart for this application.
    RISK_CATEGORY_MAP : dict
        Mapping of numeric class to risk category names.

    Returns:
    --------
    prompt : str
        Prompt text for generating a full report via Gemini.
    """
    # --- Extract application row ---
    row_mask = df['application_id'] == application_id
    if not row_mask.any():
        raise ValueError(f"Application ID {application_id} not found")
    data_row = df.loc[row_mask].iloc[0]

    # --- Predicted class and features ---
    predicted_numeric_class = list(lime_explanation.local_exp.keys())[0]
    predicted_category = RISK_CATEGORY_MAP[predicted_numeric_class]

    # LIME feature details
    lime_list = lime_explanation.as_list(label=predicted_numeric_class)
    lime_features = [f"{name.split(' ')[0]} ({weight:+.3f})" for name, weight in lime_list]

    # 5C summary
    c_summary = [f"{c}: {score:+.3f}" for c, score in aggregated_lime_scores.items()]

    # Row feature summary
    feature_summary = [f"{col}: {data_row[col]}" for col in X_train.columns]

    # Construct prompt
    prompt = f"""
You are a financial risk analyst. Generate a **detailed report** for the following loan application.

Application ID: {application_id}
Predicted Risk Category: {predicted_category}

--- Application Data ---
{', '.join(feature_summary)}

--- Key Feature Impacts (LIME) ---
{', '.join(lime_features)}

--- Aggregated 5C Contributions ---
{', '.join(c_summary)}

--- Visuals ---
Please present the report in a professional format, with tables or charts if appropriate. Present it as a text strictly following the Markdown format. Summarize the main reasons for the risk rating, highlight positive and negative factors, and provide actionable insights for the loan officer. 

Include the LIME chart from this image: {lime_image_path}. Apart from generating the markdown needed to insert the image (given its file path) and its caption, do not say anything else about the image.

{additional_instructions}
"""
    return prompt


def generate_summary_prompt(df, application_id, lime_explanation, aggregated_lime_scores, X_train, RISK_CATEGORY_MAP=RISK_CATEGORY_MAP,
                           additional_instructions=''):
    """
    Generates a short text summary prompt for Gemini API focusing on findings and results.

    Parameters:
    -----------
    df : pd.DataFrame
        DataFrame containing the loan application data.
    application_id : int or str
        Application ID to generate summary for.
    lime_explanation : LIME explanation object
        Output from generate_lime_explanation.
    aggregated_lime_scores : dict
        Output from generate_aggregated_lime.
    X_train : pd.DataFrame
        Training features used for LIME feature cleaning.
    RISK_CATEGORY_MAP : dict
        Mapping of numeric class to risk category names.

    Returns:
    --------
    prompt : str
        Prompt text for generating a concise text summary via Gemini.
    """
    # --- Extract application row ---
    row_mask = df['application_id'] == application_id
    if not row_mask.any():
        raise ValueError(f"Application ID {application_id} not found")
    data_row = df.loc[row_mask].iloc[0]

    # --- Predicted class and features ---
    predicted_numeric_class = list(lime_explanation.local_exp.keys())[0]
    predicted_category = RISK_CATEGORY_MAP[predicted_numeric_class]

    # LIME feature details
    lime_list = lime_explanation.as_list(label=predicted_numeric_class)
    lime_features = [f"{name.split(' ')[0]} ({weight:+.3f})" for name, weight in lime_list]

    # 5C summary
    c_summary = [f"{c}: {score:+.3f}" for c, score in aggregated_lime_scores.items()]

    # Construct prompt
    prompt = f"""
You are a financial risk analyst. Provide a **concise summary** for the following loan application.

Application ID: {application_id}
Predicted Risk Category: {predicted_category}

Key Feature Impacts (LIME): {', '.join(lime_features)}
Aggregated 5C Contributions: {', '.join(c_summary)}

Summarize the findings in clear, brief terms, highlighting the main positive and negative factors influencing the rating. {additional_instructions}
"""
    return prompt

def generate_pdf_from_text(text, filename="report.pdf", extra_images=None):
    """
    Convert AI explanation text into a styled PDF with tables, bullets, and images.
    """
    # Create PDF document
    doc = SimpleDocTemplate(filename, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Custom styles
    normal = styles["Normal"]
    bold = ParagraphStyle("Bold", parent=normal, fontName="Helvetica-Bold", fontSize=11, leading=14)
    heading = ParagraphStyle("Heading", parent=normal, fontName="Helvetica-Bold", fontSize=14, leading=18, spaceAfter=10)
    bullet = ParagraphStyle("Bullet", parent=normal, bulletIndent=15, leftIndent=20, leading=14)

    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1

        if not line:
            story.append(Spacer(1, 10))
            continue

        # ✅ Detect inline image references
        img_match = re.search(r'"([^"]+\.(png|jpg|jpeg))"', line, re.IGNORECASE)
        if img_match:
            img_path = img_match.group(1)
            if os.path.exists(img_path):
                story.append(Image(img_path, width=400, height=250))
                story.append(Spacer(1, 15))
            else:
                story.append(Paragraph(f"<i>[Image not found: {img_path}]</i>", normal))
            continue

        # ✅ Detect bullet points: lines starting with "* "
        if line.startswith("* "):
            bullet_line = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", line[2:].strip())  # keep bold text
            story.append(Paragraph(bullet_line, bullet))
            continue

        # ✅ Handle bold markdown (**text**)
        bold_line = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", line)

        # ✅ Handle markdown tables
        if "|" in line and "---" not in line:
            rows = []
            # capture consecutive rows
            while i <= len(lines) and "|" in line and "---" not in line:
                row = [cell.strip() for cell in line.split("|") if cell.strip()]
                if row:
                    rows.append(row)
                if i >= len(lines):
                    break
                line = lines[i].strip()
                i += 1

            if rows:
                table = Table(rows, hAlign="LEFT")
                table_style = [
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
                    ("ALIGN", (1, 1), (-1, -1), "RIGHT"),  # numbers align right
                    ("ALIGN", (0, 0), (0, -1), "LEFT"),   # first column left
                ]
                table.setStyle(TableStyle(table_style))
                story.append(table)
                story.append(Spacer(1, 10))
            continue

        # ✅ Handle section titles
        if re.match(r"^\d+\.", line) or line.endswith(":"):
            story.append(Paragraph(bold_line, heading))
        else:
            story.append(Paragraph(bold_line, normal))

    # ✅ Insert extra images (e.g., LIME plots) at the end
    if extra_images:
        for img_path in extra_images:
            if img_path and os.path.exists(img_path):
                story.append(Spacer(1, 20))
                story.append(Image(img_path, width=400, height=250))
                story.append(Spacer(1, 15))

    # Build PDF
    doc.build(story)
    print(f"✅ PDF generated: {filename}")

def generate_pdf_from_text(markdown_text, filename="report.pdf", extra_images=None):
    """
    Convert Markdown text into a styled PDF with inline images, scaled tables, and proper formatting.
    """
    # Convert Markdown → HTML
    html = markdown.markdown(markdown_text, extensions=["tables"])
    soup = BeautifulSoup(html, "html.parser")

    # Setup PDF
    doc = SimpleDocTemplate(filename, pagesize=A4,
                            leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=MARGIN, bottomMargin=MARGIN)
    styles = getSampleStyleSheet()
    story = []

    # Custom styles
    normal = styles["Normal"]
    heading = ParagraphStyle("Heading", parent=normal,
                             fontName="Helvetica-Bold", fontSize=14, leading=18, spaceAfter=10)
    bullet = ParagraphStyle("Bullet", parent=normal, leftIndent=20,
                            bulletIndent=10, leading=14)

    # Walk through HTML elements
    for elem in soup.children:
        if elem.name is None:
            continue

        # ✅ Headings
        if elem.name in ["h1", "h2", "h3"]:
            story.append(Paragraph(elem.get_text(), heading))
            continue

        # ✅ Paragraphs with inline image markers
        if elem.name == "p":
            # If the <p> contains an <img>, handle separately
            img_tag = elem.find("img")
            if img_tag:
                img_path = img_tag.get("src")
                caption_text = elem.get_text().strip()  # get alt/caption text if any
                if caption_text:
                    story.append(Paragraph(caption_text, normal))
                if img_path and os.path.exists(img_path):
                    story.append(Image(img_path, width=400, height=250))
                    story.append(Spacer(1, 15))
                else:
                    story.append(Paragraph(f"<i>[Image not found: {img_path}]</i>", normal))
                continue

            # Otherwise, treat it like a normal paragraph
            story.append(Paragraph(elem.decode_contents(), normal))
            story.append(Spacer(1, 6))
            continue

            # Regular paragraph
            story.append(Paragraph(elem.decode_contents(), normal))
            story.append(Spacer(1, 6))
            continue

        # ✅ Unordered list
        if elem.name == "ul":
            for li in elem.find_all("li"):
                story.append(Paragraph(li.decode_contents(), bullet))
            story.append(Spacer(1, 6))
            continue

        # ✅ Ordered list
        if elem.name == "ol":
            idx = 1
            for li in elem.find_all("li"):
                story.append(Paragraph(f"{idx}. {li.decode_contents()}", normal))
                idx += 1
            story.append(Spacer(1, 6))
            continue

        # ✅ Tables (scaled to fit page)
        if elem.name == "table":
            rows = []
            for row in elem.find_all("tr"):
                cols = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
                rows.append(cols)

            if rows:
                ncols = len(rows[0])
                # calculate available width
                available_width = PAGE_WIDTH - 2 * MARGIN
                col_width = available_width / ncols
                col_widths = [col_width] * ncols

                table = Table(rows, colWidths=col_widths, hAlign="LEFT")
                table.setStyle(TableStyle([
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]))
                story.append(table)
                story.append(Spacer(1, 10))
            continue

        # ✅ Images (from markdown ![]())
        if elem.name == "img":
            img_path = elem.get("src")
            if img_path and os.path.exists(img_path):
                story.append(Image(img_path, width=400, height=250))
                story.append(Spacer(1, 15))
            else:
                story.append(Paragraph(f"<i>[Image not found: {img_path}]</i>", normal))
            continue

    # ✅ Extra images manually appended
    if extra_images:
        for img_path in extra_images:
            if img_path and os.path.exists(img_path):
                story.append(Spacer(1, 20))
                story.append(Image(img_path, width=400, height=250))
                story.append(Spacer(1, 15))

    # Build PDF
    doc.build(story)
    print(f"✅ PDF generated: {filename}")
   