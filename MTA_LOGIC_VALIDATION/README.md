# MTA_LOGIC_VALIDATION – Silnik Walidacji Logiki Anti-D

**System:** MTAQuestWebsideX  
**Cel:** Walidacja koherencji Anti-D, wykrywanie cykli i zgodności LOGOS oparta na Pythonie

## Struktura Repozytorium

```
MTA_LOGIC_VALIDATION/
├── src/
│   ├── __init__.py
│   ├── anti_d_validator.py       # Podstawowa logika walidacji Anti-D
│   └── utils.py                  # Narzędzia
├── tests/
│   ├── test_anti_d.py
│   ├── test_coherence.py
│   └── test_path_validation.py
├── requirements.txt              # Zależności Python
└── README.md                     # Ten plik
```

## Szybki Start

### Instalacja
```bash
pip install -r requirements.txt
```

### Uruchom Wszystkie Walidacje
```bash
python src/anti_d_validator.py --neo4j-uri bolt://localhost:7687 --validate-all
```

### Uruchom Specyficzną Walidację
```bash
python src/anti_d_validator.py --check-reachability
python src/anti_d_validator.py --detect-cycles
python src/anti_d_validator.py --recalculate-coherence
```

## Kluczowe Funkcje Walidacji

| Funkcja | Cel | Wejście | Wyjście |
|---------|-----|---------|---------|
| `validate_node()` | Sprawdzenie Anti-D pojedynczego węzła | Dict węzła | (is_valid, message) |
| `validate_collection()` | Walidacja wszystkich węzłów | List[Node] | (valid[], rejected[]) |
| `check_path_reachability()` | ≤5 skoków do wszystkich 5 ROOT | Graf | nodes_reachable_all_roots[] |
| `detect_cycles()` | Znajdź cykliczne relacje tego samego typu | Graf | cycles_list[] |
| `calculate_coherence()` | Koherencja oparta na relacjach i entropii | Węzeł | float (0.0-1.0) |

## Lista Kontrolna Zgodności Anti-D

- [ ] Wszystkie 9 właściwości węzła wypełnione
- [ ] Koherencja ≥ 0.80
- [ ] Osiągalność ścieżki do wszystkich 5 węzłów ROOT (≤5 skoków)
- [ ] Minimum 3 relacje na węzeł
- [ ] Brak cyklicznych relacji jednotypowych
- [ ] Relacje ANTAGONIZUJE mają rozstrzygnięcie logiczne
- [ ] Brak zduplikowanych definicji (sprawdzenie entropii)

## Przykład Użycia

```python
from anti_d_validator import AntiDValidator

# Połącz z Neo4j
validator = AntiDValidator(
    uri="bolt://localhost:7687",
    user="neo4j",
    password="twoje_haslo"
)

# Waliduj wszystkie węzły
report = validator.get_validation_report()
print(f"Wszystkie węzły: {report['totalNodes']}")
print(f"Ważne węzły: {report['validNodes']}")
print(f"Średnia koherencja: {report['averageCoherence']}")

# Zamknij połączenie
validator.close()
```

## Integracja z CI/CD

Ten walidator jest uruchamiany przy każdym commicie git poprzez GitHub Actions:
```yaml
on: [push]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - run: python src/anti_d_validator.py --all
```

## Zmienne Środowiskowe

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=twoje_haslo
```

---

**Protokół:** GOK:AI + LOGOS v1.0  
**Status:** Gotowy do Walidacji
