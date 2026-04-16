import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def get_docx_text(path):
    """
    Take the path of a docx file as argument, return the text in unicode.
    """
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = ET.fromstring(xml_content)

    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text = []
    for paragraph in tree.findall('.//w:p', ns):
        paragraph_text = []
        for run in paragraph.findall('.//w:t', ns):
            paragraph_text.append(run.text)
        text.append("".join(paragraph_text))
    return "\n".join(text)

if __name__ == "__main__":
    docx_path = sys.argv[1]
    if os.path.exists(docx_path):
        print(get_docx_text(docx_path))
    else:
        print(f"File not found: {docx_path}")
