"""
════════════════════════════════════════════════════════════════════════════
MTA NOISE SENSOR – Market Data Collector
Zbieranie danych giełdowych i kryptowalutowych
════════════════════════════════════════════════════════════════════════════
"""

import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def collect_market_data(sources: list[dict]) -> list[dict]:
    """
    Zbiera dane rynkowe z yfinance.
    
    Args:
        sources: Lista źródeł z config (symbol, koncept_mapping, name)
    
    Returns:
        Lista pomiarów z polami: koncept_id, entropia, zrodlo, kategoria, opis
    """
    try:
        import yfinance as yf
    except ImportError:
        logger.warning("yfinance nie jest zainstalowany — pomijam dane giełdowe")
        return []

    results = []

    for source in sources:
        symbol = source["symbol"]
        koncept_id = source["koncept_mapping"]
        name = source.get("name", symbol)

        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="5d")

            if hist.empty or len(hist) < 2:
                logger.warning(f"Brak danych dla {symbol}")
                continue

            # Oblicz zmienność (volatility) jako metrykę entropii
            close_prices = hist["Close"]
            returns = close_prices.pct_change().dropna()

            volatility = returns.std()
            avg_return = returns.mean()
            last_price = close_prices.iloc[-1]
            prev_price = close_prices.iloc[-2]
            daily_change = (last_price - prev_price) / prev_price

            # Normalizuj zmienność do skali 0.0-1.0
            # Niska zmienność (~0) = wysoka koherencja = 1.0
            # Wysoka zmienność (>5%) = niski porządek = 0.0
            normalized_volatility = min(volatility * 20, 1.0)  # 5% vol → 1.0
            entropia_wektor = round(1.0 - normalized_volatility, 4)

            opis = (
                f"{name}: cena={last_price:.2f}, zmiana={daily_change*100:.2f}%, "
                f"vol={volatility*100:.2f}%, avg_ret={avg_return*100:.3f}%"
            )

            results.append({
                "koncept_id": koncept_id,
                "entropia": entropia_wektor,
                "zrodlo": f"yfinance:{symbol}",
                "kategoria": "finanse",
                "opis": opis
            })

            logger.info(f"  {symbol}: EV={entropia_wektor:.4f} (vol={volatility*100:.2f}%)")

        except Exception as e:
            logger.error(f"  Błąd pobierania {symbol}: {e}")

    return results
