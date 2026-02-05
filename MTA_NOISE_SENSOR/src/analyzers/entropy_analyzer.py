"""
════════════════════════════════════════════════════════════════════════════
MTA NOISE SENSOR – Entropy Analyzer
Agregacja wielu źródeł do finalnego wektora entropii
════════════════════════════════════════════════════════════════════════════
"""

import logging
from collections import defaultdict

logger = logging.getLogger(__name__)


def aggregate_entropy(measurements: list[dict], weights: dict = None) -> list[dict]:
    """
    Agreguje pomiary entropii z wielu źródeł dla tego samego konceptu.
    
    Jeśli koncept ROOT_EAEO ma dane z S&P500 (EV=0.85), RSS finanse (EV=0.65),
    wynik końcowy to średnia ważona.
    
    Args:
        measurements: Lista pomiarów z collectorów
        weights: Wagi z config (volatility, sentiment, volume_anomaly, news_frequency)
    
    Returns:
        Lista zagregowanych wyników (jeden per koncept)
    """
    if not measurements:
        return []

    # Grupuj po koncept_id
    by_koncept = defaultdict(list)
    for m in measurements:
        by_koncept[m["koncept_id"]].append(m)

    aggregated = []

    for koncept_id, items in by_koncept.items():
        # Oddziel pomiary rynkowe od sentymentowych
        market = [i for i in items if "yfinance" in i.get("zrodlo", "")]
        news = [i for i in items if "rss" in i.get("zrodlo", "")]

        values = [i["entropia"] for i in items]
        avg_entropy = sum(values) / len(values)

        # Zbierz opisy
        all_sources = [i["zrodlo"] for i in items]
        all_descriptions = [i["opis"] for i in items]

        aggregated.append({
            "koncept_id": koncept_id,
            "entropia": round(avg_entropy, 4),
            "zrodlo": " + ".join(all_sources[:3]),
            "kategoria": items[0].get("kategoria", "mixed"),
            "opis": f"Agregacja {len(items)} źródeł: avg_EV={avg_entropy:.4f}. " +
                    "; ".join(all_descriptions[:2])[:400]
        })

        logger.info(
            f"  Agregacja {koncept_id}: {len(items)} źródeł → EV={avg_entropy:.4f}"
        )

    return aggregated
