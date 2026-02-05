# MTA_NOISE_SENSOR – Moduł Detekcji Entropii Rynkowej (MER)

**Rola:** Czwarty kontener systemu MTAQuestWebsideX  
**Cel:** Pomiar i kwantyfikacja entropii zewnętrznej (szum informacyjny, trendy giełdowe, sentyment społecznościowy)

## Architektura

```
MTA_NOISE_SENSOR/
├── src/
│   ├── sensor.py           # Główny skrypt sensora (scheduler)
│   ├── collectors/
│   │   ├── __init__.py
│   │   ├── rss_collector.py     # Zbieranie danych z kanałów RSS
│   │   ├── market_collector.py  # Dane giełdowe (yfinance)
│   │   └── social_collector.py  # Analiza trendów społecznych
│   ├── analyzers/
│   │   ├── __init__.py
│   │   └── entropy_analyzer.py  # Obliczanie wektora entropii
│   └── api_client.py       # Klient GraphQL do wysyłania mutacji
├── config/
│   └── sensor_config.yaml  # Konfiguracja źródeł i interwałów
├── Dockerfile
├── requirements.txt
└── README.md
```

## Jak to działa

1. **Collector** zbiera dane z zewnętrznych źródeł (RSS, API giełdowe, social media)
2. **Analyzer** oblicza wektor entropii (0.0 = pełny chaos, 1.0 = pełna koherencja)
3. **API Client** wysyła mutację `reportExternalEntropy` do GraphQL API (port 4000)
4. Wynik jest zapisywany jako `ENTROPY_REPORT` w Neo4j, powiązany z odpowiednim KONCEPTem

## Delta = |Koherencja wewnętrzna - Entropia zewnętrzna|

Jeśli KONCEPT "Ekonomia Obfitości" ma koherencję P=1.0, a rynki finansowe wskazują na P=0.3 →  
**Delta = 0.7** → wysoka rozbieżność między modelem a rzeczywistością.

## Uruchomienie

```bash
# Standalone
cd MTA_NOISE_SENSOR
pip install -r requirements.txt
python src/sensor.py

# Docker
docker-compose up noise-sensor
```

## Zmienne środowiskowe

| Zmienna | Domyślna | Opis |
|---------|----------|------|
| `GRAPHQL_API_URL` | `http://localhost:4000/graphql` | Endpoint API |
| `SCAN_INTERVAL` | `300` | Interwał skanowania (sekundy) |
| `LOG_LEVEL` | `INFO` | Poziom logowania |
