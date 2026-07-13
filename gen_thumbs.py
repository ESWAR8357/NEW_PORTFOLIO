"""
Certificate Thumbnail Generator
--------------------------------
Converts the first page of every PDF in assets/certificates/
into a matching .webp thumbnail, skipping files that already exist.

Usage:
  python gen_thumbs.py                  # process all missing WebPs
  python gen_thumbs.py --force          # regenerate all WebPs
  python gen_thumbs.py "filename.pdf"   # process a specific PDF
"""

import sys
import os
import fitz  # PyMuPDF
from PIL import Image

CERTS_DIR = "assets/certificates"
QUALITY = 85
SCALE = 2.0  # 2x scale for sharp thumbnails


def pdf_to_webp(pdf_path, webp_path):
    doc = fitz.open(pdf_path)
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), alpha=False)
    png_path = webp_path.replace(".webp", "_tmp.png")
    pix.save(png_path)
    doc.close()
    img = Image.open(png_path).convert("RGB")
    img.save(webp_path, "WEBP", quality=QUALITY)
    img.close()
    os.remove(png_path)


def main():
    force = "--force" in sys.argv
    specific = next((a for a in sys.argv[1:] if not a.startswith("--")), None)

    if specific:
        pdfs = [os.path.join(CERTS_DIR, specific)]
    else:
        pdfs = [
            os.path.join(CERTS_DIR, f)
            for f in os.listdir(CERTS_DIR)
            if f.lower().endswith(".pdf")
        ]

    if not pdfs:
        print("No PDF files found.")
        return

    for pdf_path in pdfs:
        webp_path = os.path.splitext(pdf_path)[0] + ".webp"

        if not force and os.path.exists(webp_path):
            print(f"SKIP (exists): {os.path.basename(webp_path)}")
            continue

        try:
            pdf_to_webp(pdf_path, webp_path)
            print(f"OK: {os.path.basename(webp_path)}")
        except Exception as e:
            print(f"ERROR: {os.path.basename(pdf_path)} -> {e}")


if __name__ == "__main__":
    main()
