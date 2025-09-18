import google.generativeai as genai
import os

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Line

import markdown
from bs4 import BeautifulSoup

from dotenv import load_dotenv

load_dotenv()

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 50  

# Configure the API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY")) 

# Create the model
model = genai.GenerativeModel('gemini-1.5-flash')

# Create the model
model = genai.GenerativeModel('gemini-1.5-flash')

RISK_CATEGORY_MAP = {
    0: "Pass", 1: "Especially Mentioned", 2: "Substandard",
    3: "Doubtful", 4: "Loss"
}

def explain_ai(gen_type, df, application_id, lime_explanation, aggregated_lime_scores, X_train, probabilities, lime_image_path=None, 
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
        lime_image_path=f'outdir/lime_explanation_{application_id}.png',
        aggregatedlime_image_path=f'outdir/lime_aggregated_plot_{application_id}.png',
        shap_image_path=f'outdir/shap_explanation_{application_id}.png'
        prompt = generate_full_report_prompt(df, 
                                             application_id=application_id, 
                                             lime_explanation=lime_explanation,
                                             aggregated_lime_scores=aggregated_lime_scores, 
                                             probabilities=probabilities,
                                             lime_image_path=lime_image_path,
                                             aggregatedlime_image_path=aggregatedlime_image_path,
                                             shap_image_path=shap_image_path,
                                             additional_instructions=additional_instructions)

        response = model.generate_content(prompt)
        os.makedirs(outdir, exist_ok=True)
        filename = os.path.join(outdir, f"report_{application_id}.pdf")
        extra_images = [
            path for path in [lime_image_path, aggregatedlime_image_path, shap_image_path] 
            if path
        ]
        generate_pdf_from_text(response.text, filename=filename, extra_images=extra_images)
        
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
    for col in df.columns:
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


def generate_full_report_prompt(
    df,
    application_id,
    lime_explanation,
    aggregated_lime_scores,
    probabilities,
    lime_image_path=None,
    aggregatedlime_image_path=None,
    shap_image_path=None,
    RISK_CATEGORY_MAP=RISK_CATEGORY_MAP,
    outdir='outdir',
    additional_instructions=''
):
    """
    Generates a prompt for Gemini API to produce a full report for a loan application.

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
    probabilities : np.ndarray
        Array of predicted probabilities for each risk category.
    lime_image_path : str
        File path to the LIME image/chart for this application.
    shap_image_path : str
        File path to the SHAP image/chart for this application.
    RISK_CATEGORY_MAP : dict
        Mapping of numeric class to risk category names.
    outdir : str
        Directory where LIME HTML explanations are saved.
    additional_instructions : str
        Extra instructions to include in the prompt.

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

    # --- Predicted class ---
    predicted_numeric_class = list(lime_explanation.local_exp.keys())[0]
    predicted_category = RISK_CATEGORY_MAP[predicted_numeric_class]

    # --- Prediction probabilities as plain text ---
    categories = list(RISK_CATEGORY_MAP.values())
    prob_text = ", ".join(f"{cat}: {prob:.2%}" for cat, prob in zip(categories, probabilities))

    # --- LIME feature details ---
    lime_list = lime_explanation.as_list(label=predicted_numeric_class)
    lime_features = [f"{name.split(' ')[0]} ({weight:+.3f})" for name, weight in lime_list]

    # --- Aggregated 5C summary ---
    c_summary = [f"{c}: {score:+.3f}" for c, score in aggregated_lime_scores.items()]

    # --- Application feature summary ---
    feature_summary = [f"{col}: {data_row[col]}" for col in df.columns if col != "application_id"]

    # --- Construct prompt ---
    prompt = f"""
You are a financial risk analyst. Generate a **detailed report** for the following loan application. Present the report in a professional format, with tables or charts if appropriate. Present it as a text strictly following the Markdown format.

For images, include a clear markdown format needed to insert the image (given its file path) and provide a detailed caption.

## Executive Summary
Application ID: {application_id}  
Predicted Risk Category: {predicted_category}  
Prediction Probabilities: {prob_text}

## Applicant Profile
{', '.join(feature_summary)}
Summarize this in table format. Do not include SHAP or LIME details here.

## Financial Behavior Analysis
Please analyze the applicant's financial behavior based on the features provided above.

## Key Feature Impacts & Visualizations
### LIME Analysis
Key contributing features: {', '.join(lime_features)}  
Refer to the LIME chart here: ![LIME Explanation]({lime_image_path})  
Please provide a detailed interpretation of the LIME visualization.

### SHAP Analysis
Refer to the SHAP chart here: ![SHAP Explanation]({shap_image_path})  
Provide a detailed interpretation of the SHAP visualization, highlighting feature importance and contributions to the risk assessment.

## Aggregated 5C Contributions
Refer to the LIME chart here: ![LIME Explanation]({aggregatedlime_image_path}) 
{', '.join(c_summary)}

## Risk Assessment and Recommendations
Summarize the risk factors. Give at least 5 actionable recommendations for the loan officer. Provide an overall summary of the assessment of the loan application.

Present it as a text strictly following the Markdown format. Use PHP (Philippine Peso) as currency. {additional_instructions}
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

import os
import markdown
from bs4 import BeautifulSoup
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 40

def generate_pdf_from_text(markdown_text, filename="report.pdf", extra_images=None):
    """
    Convert Markdown text into a styled PDF with inline images, headings, lists, tables, and proper formatting.
    Supports tuple-style image paths and avoids duplicate insertions of the same image.
    """
    # Convert Markdown → HTML
    html = markdown.markdown(markdown_text, extensions=["tables"])
    soup = BeautifulSoup(html, "html.parser")

    # Setup PDF
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN
    )
    styles = getSampleStyleSheet()
    story = []

    normal = styles["Normal"]
    heading = ParagraphStyle("Heading", parent=normal,
                             fontName="Helvetica-Bold", fontSize=14,
                             leading=18, spaceAfter=10)
    bullet = ParagraphStyle("Bullet", parent=normal, leftIndent=20,
                            bulletIndent=10, leading=14)

    inserted_images = set()  # Track inserted images to avoid duplicates

    def insert_image(img_path, caption_text=""):
        """Insert image at current position in PDF story."""
        if not img_path:
            return
        # Handle tuple-style paths
        if isinstance(img_path, tuple) and len(img_path) > 0:
            img_path = str(img_path[0])
        # Handle tuple-like strings
        if isinstance(img_path, str) and img_path.startswith("(") and img_path.endswith(")"):
            try:
                t = eval(img_path)
                if isinstance(t, tuple) and len(t) > 0:
                    img_path = str(t[0])
            except:
                img_path = img_path.strip("(),'\" ")
        img_path = os.path.normpath(img_path)
        if not os.path.isabs(img_path):
            img_path = os.path.abspath(img_path)
        if img_path in inserted_images:
            return
        inserted_images.add(img_path)

        # Insert caption if provided
        if caption_text:
            story.append(Paragraph(caption_text, normal))

        # Insert image
        if os.path.exists(img_path):
            story.append(Image(img_path, width=400, height=250))
            story.append(Spacer(1, 15))
        else:
            story.append(Paragraph(f"<i>[Image not found: {img_path}]</i>", normal))

    def convert_html_to_reportlab(element):
        """Convert HTML element to ReportLab-compatible HTML with proper formatting."""
        if element.name is None:
            # Text node
            return str(element)
        
        text = ""
        for child in element.children:
            text += convert_html_to_reportlab(child)
        
        # Convert HTML tags to ReportLab-compatible markup
        if element.name == "strong" or element.name == "b":
            return f"<b>{text}</b>"
        elif element.name == "em" or element.name == "i":
            return f"<i>{text}</i>"
        elif element.name == "u":
            return f"<u>{text}</u>"
        elif element.name == "br":
            return "<br/>"
        else:
            return text

    # Process all top-level elements sequentially
    for elem in soup.find_all(recursive=False):
        # Skip if this element is None or empty
        if elem is None:
            continue
            
        # Headings
        if elem.name in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            story.append(Paragraph(convert_html_to_reportlab(elem), heading))
            story.append(Spacer(1, 6))

        # Paragraphs
        elif elem.name == "p":
            # Check if paragraph contains images
            img_tags = elem.find_all("img")
            if img_tags:
                # Process images within paragraph
                for img_tag in img_tags:
                    img_path = img_tag.get("src")
                    caption_text = img_tag.get("alt", "")
                    insert_image(img_path, caption_text)
            
            # Get text content with formatting, excluding images
            for img in elem.find_all("img"):
                img.decompose()  # Remove img tags to avoid processing them as text
            
            formatted_text = convert_html_to_reportlab(elem)
            if formatted_text.strip():
                story.append(Paragraph(formatted_text, normal))
                story.append(Spacer(1, 6))

        # Lists (avoid duplication by processing only once)
        elif elem.name in ["ul", "ol"]:
            for i, li in enumerate(elem.find_all("li", recursive=False), 1):
                formatted_text = convert_html_to_reportlab(li)
                if elem.name == "ul":
                    story.append(Paragraph(f"• {formatted_text}", bullet))
                else:
                    story.append(Paragraph(f"{i}. {formatted_text}", normal))
            story.append(Spacer(1, 6))

        # Tables (process only once to avoid duplication)
        elif elem.name == "table":
            rows = []
            for row in elem.find_all("tr"):
                cols = []
                for cell in row.find_all(["td", "th"]):
                    # Convert cell content with formatting
                    cell_text = convert_html_to_reportlab(cell)
                    cols.append(cell_text)
                if cols:  # Only add non-empty rows
                    rows.append(cols)
            
            if rows:
                # Calculate column widths
                ncols = len(rows[0]) if rows else 1
                available_width = PAGE_WIDTH - 2 * MARGIN
                col_width = available_width / ncols
                
                table = Table(rows, colWidths=[col_width]*ncols, hAlign="LEFT")
                table.setStyle(TableStyle([
                    ("GRID", (0,0), (-1,-1), 0.5, colors.black),
                    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#f0f0f0")),
                    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
                    ("VALIGN", (0,0), (-1,-1), "TOP"),
                    ("FONTSIZE", (0,0), (-1,-1), 9),  # Smaller font for tables
                    ("WORDWRAP", (0,0), (-1,-1), True)
                ]))
                story.append(table)
                story.append(Spacer(1, 10))

        # Block quotes
        elif elem.name == "blockquote":
            formatted_text = convert_html_to_reportlab(elem)
            quote_style = ParagraphStyle("Quote", parent=normal,
                                       leftIndent=30, rightIndent=30,
                                       fontName="Helvetica-Oblique",
                                       fontSize=10)
            story.append(Paragraph(formatted_text, quote_style))
            story.append(Spacer(1, 6))

        # Code blocks
        elif elem.name == "pre":
            code_text = elem.get_text()
            code_style = ParagraphStyle("Code", parent=normal,
                                      fontName="Courier",
                                      fontSize=9,
                                      leftIndent=20,
                                      backgroundColor=colors.HexColor("#f5f5f5"))
            story.append(Paragraph(code_text.replace('\n', '<br/>'), code_style))
            story.append(Spacer(1, 6))

        # Horizontal rules
        elif elem.name == "hr":
            from reportlab.platypus import Drawing
            from reportlab.lib.colors import black
            d = Drawing(available_width, 1)
            d.add(Line(0, 0, available_width, 0, strokeColor=black))
            story.append(d)
            story.append(Spacer(1, 6))

    # Handle any remaining text nodes that might be direct children of body/root
    for elem in soup.children:
        if elem.name is None and str(elem).strip():
            story.append(Paragraph(str(elem).strip(), normal))
            story.append(Spacer(1, 6))

    # Insert any extra_images not already inlined
    if extra_images:
        for img_path in extra_images:
            insert_image(img_path)

    # Build PDF
    if story:  # Only build if there's content
        doc.build(story)
        print(f"✅ PDF generated: {filename}")
    else:
        print("⚠️ No content found to generate PDF")