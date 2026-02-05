# MTA_CORE_GRAPH – Repozytorium Bazy Danych Neo4j

**System:** MTAQuestWebsideX  
**Protokół:** GOK:AI (Gwarancja Koherencji)  
**Cel:** Rdzeń bazy grafowej (Neo4j) – przechowywanie i odpytywanie 500+ węzłów z walidacją Anti-D

## Struktura Repozytorium

```
MTA_CORE_GRAPH/
├── cypher/                  # Skrypty zapytań Cypher
│   ├── 01_create_root_nodes.cypher
│   ├── 02_import_second_tier.cypher
│   ├── 03_create_relations.cypher
│   ├── 04_validation_queries.cypher
│   └── 05_anti_d_checks.cypher
├── scripts/                 # Skrypty Python
│   └── import_nodes_direct.py
├── data/                    # Importy danych (JSON)
│   └── nodes_50_second_tier.json
└── README.md               # Ten plik
```

## Szybki Start

### Opcja 1: Docker (Zalecana)
```bash
docker-compose -f ../docker-compose.yml up neo4j
# Dostęp: http://localhost:7474
# Domyślne dane: neo4j / hasło
```

### Opcja 2: Lokalna Instalacja Neo4j
```bash
neo4j start
# Import danych:
cypher-shell < cypher/01_create_root_nodes.cypher
cypher-shell < cypher/02_import_second_tier.cypher
```

### Opcja 3: Python Import Script
```bash
cd scripts
python import_nodes_direct.py
# Tworzy 55 węzłów (5 ROOT + 50 drugiego poziomu)
```

## Przegląd Skryptów Cypher

| Skrypt | Cel |
|--------|-----|
| `01_create_root_nodes.cypher` | Tworzenie 5 węzłów ROOT (KAR, MEHS, NCSS, EAEO, BSIT) |
| `02_import_second_tier.cypher` | Import 50 węzłów drugiego poziomu z JSON |
| `03_create_relations.cypher` | Definicja typów relacji (semantyka Anti-D) |
| `04_validation_queries.cypher` | Walidacja ścieżek (≤5 skoków do ROOT) |

## Walidacja (Anti-D P=1.0)

Każdy węzeł musi spełniać:
1. ✓ Przechodzenie ścieżki do wszystkich 5 węzłów ROOT (≤5 skoków)
2. ✓ Minimum 3 relacje (semantycznie typu)
3. ✓ Koherencja ≥ 0.80
4. ✓ Brak cyklicznych relacji jednotypowych
5. ✓ Wszystkie 9 właściwości zdefiniowane

Uruchom walidację:
```cypher
MATCH (n:KONCEPT)-[r*1..5]->(root:ROOT)
WITH n, COUNT(DISTINCT root) as reachable_roots
WHERE reachable_roots = 5
RETURN COUNT(n) as valid_nodes
```

## Integracja z Innymi Repozytoriami

- **MTA_LOGIC_VALIDATION:** Przesyła dane wyjściowe do walidatorów Python (sprawdzenia Anti-D)
- **MTA_HYPER_INTERFACE:** Konsumuje Neo4j poprzez API GraphQL
- **MTA_GRAPHQL_API:** Łączy się z Neo4j przez sterownik bolt://localhost:7687

## Import Węzłów

### Metoda 1: Python Script (Zalecana)
```bash
cd scripts
python import_nodes_direct.py
```

### Metoda 2: Ręczne Zapytania Cypher
```cypher
// Otwórz przeglądarkę Neo4j: http://localhost:7474
// Skopiuj i wykonaj:
:source cypher/01_create_root_nodes.cypher
:source cypher/02_import_second_tier.cypher
```

## Połączenie z Neo4j

**URI:** `bolt://localhost:7687`  
**Użytkownik:** `neo4j`  
**Hasło:** (ustaw przy pierwszym logowaniu)

**Zmienne Środowiskowe:**
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=twoje_haslo
```

---

**Protokół:** GOK:AI + LOGOS v1.0  
**Status:** Gotowy do Importu Danych
