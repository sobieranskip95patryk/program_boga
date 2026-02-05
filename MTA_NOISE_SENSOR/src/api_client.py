"""
════════════════════════════════════════════════════════════════════════════
MTA NOISE SENSOR – GraphQL API Client
Wysyła pomiary entropii do MTA_GRAPHQL_API
════════════════════════════════════════════════════════════════════════════
"""

import requests
import logging
import os

logger = logging.getLogger(__name__)

GRAPHQL_URL = os.getenv('GRAPHQL_API_URL', 'http://localhost:4000/graphql')

REPORT_ENTROPY_MUTATION = """
mutation ReportExternalEntropy($konceptId: ID!, $entropiaWektor: Float!, $zrodlo: String!) {
    reportExternalEntropy(konceptId: $konceptId, entropiaWektor: $entropiaWektor, zrodlo: $zrodlo) {
        id
        label
        koherencja
        EntropyVector
        ExternalSource
    }
}
"""


def send_entropy_report(koncept_id: str, entropia_wektor: float, zrodlo: str,
                        kategoria: str, opis: str = "") -> dict | None:
    """
    Wysyła pomiar entropii do GraphQL API.
    
    Args:
        koncept_id: ID węzła KONCEPT w Neo4j
        entropia_wektor: Zmierzony poziom entropii (0.0-1.0)
        zrodlo: Nazwa źródła danych (np. "yfinance", "reuters_rss")
        kategoria: Kategoria pomiaru (np. "finanse", "technologia")
        opis: Opcjonalny opis kontekstu pomiaru
    
    Returns:
        dict z odpowiedzią API lub None w przypadku błędu
    """
    variables = {
        "konceptId": koncept_id,
        "entropiaWektor": round(entropia_wektor, 4),
        "zrodlo": zrodlo
    }

    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": REPORT_ENTROPY_MUTATION, "variables": variables},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response.raise_for_status()
        result = response.json()

        if "errors" in result:
            logger.error(f"GraphQL errors: {result['errors']}")
            return None

        report = result["data"]["reportExternalEntropy"]
        logger.info(
            f"✓ Entropy report sent: {koncept_id} | "
            f"EV={report['EntropyVector']:.4f} | "
            f"SRC={report['ExternalSource']}"
        )
        return report

    except requests.exceptions.ConnectionError:
        logger.error(f"✗ Cannot connect to GraphQL API at {GRAPHQL_URL}")
        return None
    except Exception as e:
        logger.error(f"✗ Error sending entropy report: {e}")
        return None
