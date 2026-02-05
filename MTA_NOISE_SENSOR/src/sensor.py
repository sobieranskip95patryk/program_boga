"""
════════════════════════════════════════════════════════════════════════════
MTA NOISE SENSOR – Main Sensor Process
Główny proces sensora: scheduler → collect → analyze → report
════════════════════════════════════════════════════════════════════════════
"""

import os
import sys
import time
import logging
import yaml
import schedule

# Setup path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from collectors.market_collector import collect_market_data
from collectors.rss_collector import collect_rss_data
from analyzers.entropy_analyzer import aggregate_entropy
from api_client import send_entropy_report

# ── Logging ──
log_level = os.getenv('LOG_LEVEL', 'INFO')
logging.basicConfig(
    level=getattr(logging, log_level),
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('MTA_NOISE_SENSOR')


def load_config() -> dict:
    """Załaduj konfigurację z YAML."""
    config_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'config', 'sensor_config.yaml'
    )
    
    if not os.path.exists(config_path):
        logger.warning(f"Config not found at {config_path}, using defaults")
        return {
            'sensor': {'scan_interval': 300},
            'market_sources': {'stocks': []},
            'rss_sources': [],
            'entropy_weights': {}
        }
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def run_scan_cycle(config: dict):
    """
    Jeden pełny cykl skanowania:
    1. Zbierz dane rynkowe
    2. Zbierz dane z RSS
    3. Zagreguj per koncept
    4. Wyślij do GraphQL API
    """
    logger.info("═══ CYKL SKANOWANIA START ═══")
    
    all_measurements = []
    
    # 1. Dane giełdowe
    stocks = config.get('market_sources', {}).get('stocks', [])
    if stocks:
        logger.info(f"📊 Skanowanie {len(stocks)} instrumentów giełdowych...")
        market_data = collect_market_data(stocks)
        all_measurements.extend(market_data)
    
    # 2. Dane RSS
    rss_sources = config.get('rss_sources', [])
    if rss_sources:
        logger.info(f"📰 Skanowanie {len(rss_sources)} kanałów RSS...")
        rss_data = collect_rss_data(rss_sources)
        all_measurements.extend(rss_data)
    
    # 3. Agregacja
    if all_measurements:
        logger.info(f"🔬 Agregacja {len(all_measurements)} pomiarów...")
        aggregated = aggregate_entropy(
            all_measurements,
            config.get('entropy_weights', {})
        )
        
        # 4. Wyślij do API
        success = 0
        errors = 0
        for report in aggregated:
            result = send_entropy_report(
                koncept_id=report['koncept_id'],
                entropia_wektor=report['entropia'],
                zrodlo=report['zrodlo'],
                kategoria=report['kategoria'],
                opis=report['opis']
            )
            if result:
                success += 1
            else:
                errors += 1
        
        logger.info(
            f"═══ CYKL ZAKOŃCZONY: {success} raportów wysłanych, "
            f"{errors} błędów ═══"
        )
    else:
        logger.warning("═══ CYKL ZAKOŃCZONY: Brak danych do przetworzenia ═══")


def main():
    """Entry point – uruchamia scheduler."""
    logger.info("╔════════════════════════════════════════════════╗")
    logger.info("║  MTA NOISE SENSOR – Moduł Detekcji Entropii   ║")
    logger.info("║  Rynkowej (MER)                               ║")
    logger.info("╚════════════════════════════════════════════════╝")
    
    config = load_config()
    interval = int(os.getenv('SCAN_INTERVAL', config.get('sensor', {}).get('scan_interval', 300)))
    
    logger.info(f"Interwał skanowania: {interval}s")
    logger.info(f"GraphQL API: {os.getenv('GRAPHQL_API_URL', 'http://localhost:4000/graphql')}")
    
    # Pierwszy skan natychmiast
    logger.info("Uruchamiam pierwszy skan...")
    run_scan_cycle(config)
    
    # Scheduler
    schedule.every(interval).seconds.do(run_scan_cycle, config)
    
    logger.info(f"Scheduler aktywny — następny skan za {interval}s")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Sensor zatrzymany przez użytkownika")


if __name__ == '__main__':
    main()
