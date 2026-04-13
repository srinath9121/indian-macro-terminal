# Build stage for the frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final stage for the backend + frontend server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and built frontend
COPY src/ ./src/
COPY data/ ./data/
COPY api/ ./api/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port and run the server
ENV PORT=8080
EXPOSE 8080

# Command to run the application (assuming server.py is the entry)
CMD ["python", "src/server.py"]
