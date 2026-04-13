import zipfile
import os

def create_zip(zip_name, root_dir):
    exclude = { 'node_modules', '.git', '.vercel', 'dist', 'node.zip', zip_name }
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in exclude]
            for file in files:
                if file in exclude: continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, root_dir)
                zipf.write(file_path, arcname)
    print(f"SUCCESS: {zip_name} created.")

if __name__ == "__main__":
    create_zip("pakage-optimized.zip", ".")
