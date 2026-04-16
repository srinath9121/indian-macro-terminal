const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

async function extractDocx(filePath) {
    try {
        // Use powershell to extract since Node's built-in zlib doesn't handle zip files directly without extra libs
        const tempDir = path.join(__dirname, 'temp_docx_node');
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
        fs.mkdirSync(tempDir);

        const zipPath = path.join(__dirname, 'temp.zip');
        fs.copyFileSync(filePath, zipPath);
        
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempDir}' -Force"`);
        
        const xmlPath = path.join(tempDir, 'word', 'document.xml');
        if (fs.existsSync(xmlPath)) {
            const xmlContent = fs.readFileSync(xmlPath, 'utf8');
            // Basic regex to extract text from <w:t> tags
            const matches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
            if (matches) {
                const text = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
                fs.writeFileSync(path.join(__dirname, 'output.txt'), text);
                console.log("Success: wrote to output.txt");
            } else {
                console.log("No text found in document.xml");
            }
        } else {
            console.log("document.xml not found");
        }

        fs.rmSync(tempDir, { recursive: true });
        fs.unlinkSync(zipPath);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

const targetFile = process.argv[2];
if (targetFile) {
    extractDocx(path.resolve(targetFile));
} else {
    console.log("Usage: node extract_docx.js <path_to_docx>");
}
