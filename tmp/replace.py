import sys
import re

files_list = [
    "/src/db.ts",
    "/src/db.json",
    "/server.ts",
    "/src/components/InquiryAgent.tsx",
    "/src/components/RfqForm.tsx",
    "/src/components/HomeSection.tsx",
    "/src/components/BlogSection.tsx"
]

replacements = [
    ("auralux-global.com", "eslami-global.com"),
    ("auralux.com", "eslamiglobal.com"),
    ("AuraPdfLinkSource", "EslamiPdfLinkSource"),
    ("AuraLux Global", "Eslami Global Trading"),
    ("AuraLux Luxury Exporter", "Eslami Luxury Exporter"),
    ("AuraLux Operations Trade IQ Desk", "Eslami Global Trade IQ Desk"),
    ("AuraLux Operations", "Eslami Operations"),
    ("AuraLux Trade IQ", "Eslami Trade IQ"),
    ("AuraLux Compliance Team", "Eslami Compliance Team"),
    ("AuraLux Technical Fab Center", "Eslami Technical Fab Center"),
    ("AuraLux Cold-Press Laboratory", "Eslami Cold-Press Laboratory"),
    ("AuraLux Industrial Milling Center", "Eslami Industrial Milling Center"),
    ("AuraLux Crafts Workshop", "Eslami Crafts Workshop"),
    ("AuraLux Corporate Sourcing", "Eslami Corporate Sourcing"),
    ("AuraLux", "Eslami"),
    ("Nazari Agro", "Eslami Global Trading"),
    ("Nazari Export", "Eslami Export"),
    ("Nazari Commerce", "Eslami Trading"),
    ("Nazari Trading", "Eslami Trading"),
    ("آئورالاکس", "بازرگانی اسلامی"),
    ("نظری", "اسلامی")
]

for filepath in files_list:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        orig_content = content
        for search, replace in replacements:
            content = content.replace(search, replace)
            
        if orig_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated filepath: {filepath}")
        else:
            print(f"No changes in: {filepath}")
    except Exception as e:
        print(f"Error handling {filepath}: {e}")
