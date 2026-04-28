import zipfile
import xml.etree.ElementTree as ET
import os
import sys

# Ensure output is UTF-8
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            xml_content = zip_ref.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespaces for OOXML
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            texts = []
            for paragraph in tree.findall('.//w:p', namespaces):
                p_text = ""
                for run in paragraph.findall('.//w:t', namespaces):
                    if run.text:
                        p_text += run.text
                if p_text:
                    texts.append(p_text)
            
            return "\n".join(texts)
    except Exception as e:
        return f"Error: {e}"

docx_path = r"c:\Users\Srikanth\Downloads\india_macro_model_layer (1).docx"
text = extract_text_from_docx(docx_path)
print(text)
