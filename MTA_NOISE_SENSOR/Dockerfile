FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV GRAPHQL_API_URL=http://graphql-api:4000/graphql
ENV SCAN_INTERVAL=300
ENV LOG_LEVEL=INFO

CMD ["python", "src/sensor.py"]
