"""
════════════════════════════════════════════════════════════════════════════
MTA NOISE SENSOR – RSS/News Collector
Zbieranie i analiza sentymentu wiadomości
════════════════════════════════════════════════════════════════════════════
"""

import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def collect_rss_data(sources: list[dict]) -> list[dict]:
    """
    Zbiera nagłówki RSS i analizuje sentyment.
    
    Args:
        sources: Lista źródeł RSS z config (url, kategoria, koncept_mapping)
    
    Returns:
        Lista pomiarów entropii
    """
    try:
        import feedparser
    except ImportError:
        logger.warning("feedparser nie jest zainstalowany — pomijam RSS")
        return []

    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        analyzer = SentimentIntensityAnalyzer()
    except ImportError:
        logger.warning("vaderSentiment nie jest zainstalowany — pomijam analizę sentymentu")
        return []

    results = []

    for source in sources:
        url = source["url"]
        kategoria = source["kategoria"]
        koncept_id = source["koncept_mapping"]

        try:
            feed = feedparser.parse(url)
            entries = feed.entries[:20]  # Ostatnie 20 artykułów

            if not entries:
                logger.warning(f"Brak artykułów z {url}")
                continue

            # Analizuj sentyment nagłówków
            sentiments = []
            headlines = []
            for entry in entries:
                title = entry.get("title", "")
                if title:
                    score = analyzer.polarity_scores(title)
                    sentiments.append(score["compound"])
                    headlines.append(title)

            if not sentiments:
                continue

            # Compound score: -1.0 (negatywny) do +1.0 (pozytywny)
            avg_sentiment = sum(sentiments) / len(sentiments)
            sentiment_volatility = max(sentiments) - min(sentiments)

            # Mapowanie na entropię:
            # Skrajne sentymenenty (silnie negatywne/pozytywne) = wysoka entropia
            # Neutralny, stabilny sentyment = niska entropia = wysoka koherencja
            sentiment_extremity = abs(avg_sentiment)
            entropia_wektor = round(1.0 - (sentiment_extremity * 0.5 + sentiment_volatility * 0.5), 4)
            entropia_wektor = max(0.0, min(1.0, entropia_wektor))

            # Top 3 nagłówki do opisu
            top_headlines = headlines[:3]
            opis = (
                f"RSS [{kategoria}]: {len(entries)} artykułów, "
                f"avg_sent={avg_sentiment:.3f}, vol={sentiment_volatility:.3f}. "
                f"Top: {'; '.join(top_headlines[:2])}"
            )

            results.append({
                "koncept_id": koncept_id,
                "entropia": entropia_wektor,
                "zrodlo": f"rss:{feed.feed.get('title', url)[:50]}",
                "kategoria": kategoria,
                "opis": opis[:500]
            })

            logger.info(
                f"  RSS {kategoria}: {len(entries)} art., "
                f"sent={avg_sentiment:.3f}, EV={entropia_wektor:.4f}"
            )

        except Exception as e:
            logger.error(f"  Błąd RSS {url}: {e}")

    return results
