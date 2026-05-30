FROM python:3.11-slim
# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean
WORKDIR /app
# Copy dan install Python deps
COPY backend/requirements.txt ./backend/
RUN pip install -r backend/requirements.txt
# Copy dan install Node deps
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install
# Copy dan build frontend
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build
# Copy semua file
ARG CACHEBUST=1
COPY . .
RUN chmod +x start.sh
EXPOSE 8080
CMD ["bash", "start.sh"]
