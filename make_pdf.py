from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)

# Colors
BG = HexColor("#09090b")
ACCENT = HexColor("#34d399")
TEXT = HexColor("#18181b")
TEXT2 = HexColor("#52525b")
TEXT3 = HexColor("#a1a1aa")
LIGHT_BG = HexColor("#f4f4f5")
WHITE = HexColor("#ffffff")

W, H = A4

styles = getSampleStyleSheet()

# Custom styles
s_name = ParagraphStyle("name", parent=styles["Title"],
    fontSize=26, leading=32, textColor=TEXT, spaceAfter=4,
    fontName="Helvetica-Bold")

s_tagline = ParagraphStyle("tagline", parent=styles["Normal"],
    fontSize=11, leading=15, textColor=ACCENT,
    fontName="Helvetica-Bold", spaceAfter=16)

s_section = ParagraphStyle("section", parent=styles["Heading1"],
    fontSize=14, leading=18, textColor=TEXT, spaceBefore=18, spaceAfter=8,
    fontName="Helvetica-Bold", borderColor=ACCENT, borderWidth=0,
    borderPadding=0)

s_sub = ParagraphStyle("sub", parent=styles["Heading2"],
    fontSize=11, leading=14, textColor=TEXT, spaceBefore=10, spaceAfter=4,
    fontName="Helvetica-Bold")

s_body = ParagraphStyle("body", parent=styles["Normal"],
    fontSize=9.5, leading=14, textColor=TEXT2,
    fontName="Helvetica", spaceAfter=6)

s_body_bold = ParagraphStyle("bodybold", parent=s_body,
    fontName="Helvetica-Bold", textColor=TEXT)

s_small = ParagraphStyle("small", parent=styles["Normal"],
    fontSize=8, leading=11, textColor=TEXT3,
    fontName="Helvetica")

s_tag = ParagraphStyle("tag", parent=styles["Normal"],
    fontSize=8, leading=10, textColor=ACCENT,
    fontName="Helvetica-Bold")

s_center = ParagraphStyle("center", parent=styles["Normal"],
    fontSize=9, leading=12, textColor=TEXT3,
    fontName="Helvetica", alignment=TA_CENTER)

# Build doc
doc = SimpleDocTemplate(
    "portfolio.pdf", pagesize=A4,
    leftMargin=22*mm, rightMargin=22*mm,
    topMargin=20*mm, bottomMargin=20*mm,
    title="Portfolio — Bishowdeep Bhusal",
    author="Bishowdeep Bhusal",
)

story = []

# === HEADER ===
story.append(Paragraph("BISHOWDEEP BHUSAL", s_name))
story.append(Paragraph("Self-Taught Builder  |  Hardware  |  Python  |  IoT", s_tagline))

# Divider
story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#e4e4e7"),
                         spaceAfter=12, spaceBefore=4))

# === ABOUT ===
story.append(Paragraph("ABOUT", s_section))
story.append(Paragraph(
    "16-year-old self-taught builder. Started with a broken Arduino at 13. "
    "Built my first robot at 14 with a budget of ₹3,000 and zero formal training. "
    "I learn by doing, break things to understand them, and never stop asking why. "
    "No mentors, no classes — just curiosity, YouTube, and an obsession with how things work.",
    s_body))

# Quick stats row
stats_data = [
    [Paragraph("<b>5</b>", ParagraphStyle("sn", fontSize=16, textColor=ACCENT, fontName="Helvetica-Bold", alignment=TA_CENTER)),
     Paragraph("<b>4</b>", ParagraphStyle("sn", fontSize=16, textColor=ACCENT, fontName="Helvetica-Bold", alignment=TA_CENTER)),
     Paragraph("<b>8+</b>", ParagraphStyle("sn", fontSize=16, textColor=ACCENT, fontName="Helvetica-Bold", alignment=TA_CENTER)),
     Paragraph("<b>₹3K</b>", ParagraphStyle("sn", fontSize=16, textColor=ACCENT, fontName="Helvetica-Bold", alignment=TA_CENTER))],
    [Paragraph("Robots Built", ParagraphStyle("sl", fontSize=7.5, textColor=TEXT3, fontName="Helvetica", alignment=TA_CENTER)),
     Paragraph("ESP32s Destroyed", ParagraphStyle("sl", fontSize=7.5, textColor=TEXT3, fontName="Helvetica", alignment=TA_CENTER)),
     Paragraph("Months Coding", ParagraphStyle("sl", fontSize=7.5, textColor=TEXT3, fontName="Helvetica", alignment=TA_CENTER)),
     Paragraph("Robot Budget", ParagraphStyle("sl", fontSize=7.5, textColor=TEXT3, fontName="Helvetica", alignment=TA_CENTER))],
]
stats_tbl = Table(stats_data, colWidths=[42*mm]*4, rowHeights=[10*mm, 7*mm])
stats_tbl.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("BACKGROUND", (0,0), (-1,-1), LIGHT_BG),
    ("ROUNDEDCORNERS", [4,4,4,4]),
    ("TOPPADDING", (0,0), (-1,0), 6),
    ("BOTTOMPADDING", (0,-1), (-1,-1), 6),
]))
story.append(stats_tbl)
story.append(Spacer(1, 10))

# === PROJECTS ===
story.append(Paragraph("PROJECTS", s_section))

projects = [
    ("ESP32 AI Robot That Talks", "AI + Hardware",
     "Built a robot that can see, hear, and speak using ESP32 + Gemini Flash API. Camera sensor captures "
     "frames, mic module listens for voice commands, and the AI processes everything in real-time. "
     "Motor driver controls movement. The robot answers questions, recognizes objects, and responds to voice.",
     "ESP32, Gemini Flash API, Camera Module, Mic Module, Motor Driver, WiFi",
     "AI-powered  |  Voice + Vision  |  Real-time"),
    ("ESP32 Web-Controlled Robot", "Hardware",
     "Built a robot that hosts its own Wi-Fi network and serves a control interface from any browser. "
     "Motor driver integration, web server on ESP32, responsive controls. The project that started everything.",
     "ESP32, Arduino, Web Server, Wi-Fi AP, Motor Driver",
     "₹3K budget  |  2 weeks build  |  4 broken ESP32s"),
    ("Course Recommendation Engine", "Software",
     "Matrix-based recommendation system in Python. 24 courses across 4 categories. Takes grade, interest, "
     "time, seriousness — outputs personalized picks. Discovered 2D arrays independently while learning.",
     "Python, 2D Arrays, Matrices, Input Logic",
     "5 iterations  |  2 hours total  |  24 courses"),
    ("Smart Home Automation", "IoT",
     "Arduino-based home automation with relay modules. Control lights and fans from a phone via custom "
     "web interface. Learned about relay switching, AC wiring basics, and web-to-hardware communication.",
     "Arduino Mega, Relay Module, Web Interface, WiFi",
     "4 channels  |  1 week build  |  Phone control"),
    ("Self-Learning Experiments", "Research",
     "Tracked my own learning patterns. Juggling: 0→5→10→13 catches over 3 days. Proved step-function "
     "learning — struggle, plateau, regression, breakthrough. Nap was critical for consolidation.",
     "Self-Experiment, Motor Learning, Data Tracking",
     "3 days  |  13 max catches  |  0→13 growth"),
]

for name, badge, desc, tags, stats in projects:
    badge_color = {"Hardware": "#fb923c", "Software": "#60a5fa", "IoT": "#a78bfa", "Research": "#34d399", "AI + Hardware": "#a78bfa"}[badge]
    s_badge = ParagraphStyle("badge", fontSize=7, textColor=HexColor(badge_color),
                             fontName="Helvetica-Bold", alignment=TA_CENTER)

    row = [[
        Paragraph(f"<b>{name}</b>", s_body_bold),
        Paragraph(badge, s_badge),
    ]]
    row_tbl = Table(row, colWidths=[145*mm, 20*mm])
    row_tbl.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(row_tbl)
    story.append(Paragraph(desc, s_body))
    story.append(Paragraph(tags, s_small))
    story.append(Paragraph(stats, s_tag))
    story.append(Spacer(1, 6))

# === SKILLS ===
story.append(Paragraph("SKILLS", s_section))

skills = [
    ("Hardware & Electronics", "ESP32, Arduino, motor drivers, soldering, multimeter, circuit debugging, sensor integration"),
    ("Python", "Variables, loops, conditionals, 2D arrays, matrices, input handling, API basics"),
    ("C++ / Arduino", "GPIO control, motor protocols, serial communication, sensor libraries, basic embedded"),
    ("Web Basics", "HTML/CSS, ESP32 web servers, browser-based control, responsive interfaces"),
    ("AI & APIs", "API integration concepts, AI embedding research, using ChatGPT/Claude for coding help"),
    ("Problem Solving", "Debugging, first-principles thinking, rapid prototyping, learning from failure, iteration"),
]

for name, desc in skills:
    story.append(Paragraph(f"<b>{name}</b>", s_body_bold))
    story.append(Paragraph(desc, s_small))
    story.append(Spacer(1, 2))

# === CERTIFICATIONS ===
story.append(Paragraph("CERTIFICATIONS & LEARNING", s_section))

certs = [
    ("CS50: Intro to Computer Science", "Harvard — edX", "Completed"),
    ("Python for Everybody", "U of Michigan — Coursera", "In Progress"),
    ("Arduino Programming Fundamentals", "Microsoft Learn", "In Progress"),
    ("Intro to Electronics", "Khan Academy", "Queued"),
    ("Scientific Computing with Python", "freeCodeCamp", "Queued"),
    ("Raspberry Pi Physical Computing", "Raspberry Pi Foundation", "Queued"),
]

cert_data = [[
    Paragraph("<b>Certificate</b>", ParagraphStyle("th", fontSize=8, textColor=TEXT3, fontName="Helvetica-Bold")),
    Paragraph("<b>Provider</b>", ParagraphStyle("th", fontSize=8, textColor=TEXT3, fontName="Helvetica-Bold")),
    Paragraph("<b>Status</b>", ParagraphStyle("th", fontSize=8, textColor=TEXT3, fontName="Helvetica-Bold")),
]]
for name, provider, status in certs:
    cert_data.append([
        Paragraph(name, ParagraphStyle("tc", fontSize=8.5, textColor=TEXT, fontName="Helvetica")),
        Paragraph(provider, ParagraphStyle("tc", fontSize=8.5, textColor=TEXT2, fontName="Helvetica")),
        Paragraph(status, ParagraphStyle("tc", fontSize=8.5,
            textColor=HexColor("#34d399") if status == "Completed"
            else HexColor("#fbbf24") if status == "In Progress"
            else TEXT3,
            fontName="Helvetica-Bold")),
    ])

cert_tbl = Table(cert_data, colWidths=[70*mm, 60*mm, 35*mm])
cert_tbl.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), LIGHT_BG),
    ("GRID", (0,0), (-1,-1), 0.25, HexColor("#e4e4e7")),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
]))
story.append(cert_tbl)

# === CONTACT ===
story.append(Spacer(1, 20))
story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#e4e4e7"),
                         spaceAfter=10))
story.append(Paragraph("CONTACT", s_section))
story.append(Paragraph("limitlessneverdies369@gmail.com", s_body_bold))
story.append(Paragraph("Always looking for the next challenge. If it involves building, learning, "
                        "or breaking things to understand them — I'm in.", s_body))

# Footer
def footer(canv, doc):
    canv.saveState()
    canv.setFont("Helvetica", 7)
    canv.setFillColor(HexColor("#a1a1aa"))
    canv.drawString(22*mm, 12*mm, "Bishowdeep Bhusal — Portfolio")
    canv.drawRightString(W - 22*mm, 12*mm, f"Page {doc.page}")
    canv.restoreState()

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("PDF created: portfolio.pdf")
