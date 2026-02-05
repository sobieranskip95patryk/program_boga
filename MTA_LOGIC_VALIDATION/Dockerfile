FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "from src.anti_d_validator import AntiDValidator; validator = AntiDValidator('bolt://neo4j:7687', 'neo4j', 'neo4j_password_secure_123'); validator.connect(); validator.disconnect()" || exit 1

# Default command
CMD ["python", "-m", "src.anti_d_validator"]
