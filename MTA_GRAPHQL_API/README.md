# MTA GRAPHQL API

**Protokół GOK:AI P=1.0** – Serwer Apollo dla Grafu Wiedzy MTAQuestWebsideX

## 🎯 Cel

Bramka GraphQL zapewniająca ustrukturyzowany dostęp do grafu wiedzy Neo4j z:
- Schematem węzła KONCEPT z 9 właściwościami
- 6 typami relacji semantycznych (filtrowane Anti-D)
- Walidacją osiągalności ścieżki (≤5 skoków)
- Monitorowaniem koherencji w czasie rzeczywistym

## 🚀 Szybki Start

### Wymagania Wstępne

1. **Baza Danych Neo4j** (działająca na `bolt://localhost:7687`)
   - Instalacja: [Neo4j Desktop](https://neo4j.com/download/) lub Neo4j Community
   - Utwórz bazę danych z danymi uwierzytelniającymi

2. **Node.js 18+**

### Instalacja

```bash
cd MTA_GRAPHQL_API
npm install
```

### Konfiguracja

Utwórz plik `.env`:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=twoje_haslo
PORT=4000
```

### Uruchom Serwer

```bash
# Deweloperski
npm run dev

# Produkcyjny
npm start
```

Serwer uruchomi się na: **http://localhost:4000**

## 📊 Schemat GraphQL

### Zapytania (Queries)

```graphql
# Pobierz wszystkie koncepty
getAllConcepts: [Koncept!]!

# Pobierz koncept po ID
getConceptById(id: ID!): Koncept

# Pobierz koncepty według domeny
getConceptsByDomain(domena: Domena!): [Koncept!]!

# Pobierz węzły aksjomatów ROOT
getRootNodes: [Koncept!]!

# Wyszukaj koncepty
searchConcepts(query: String!): [Koncept!]!

# Pobierz ścieżkę między konceptami (Anti-D: ≤5 skoków)
getPath(fromId: ID!, toId: ID!, maxHops: Int = 5): Path

# Waliduj zgodność Anti-D
validateAntiD: ValidationReport!
```

### Mutacje (Mutations)

```graphql
# Utwórz nowy koncept
createConcept(input: ConceptInput!): Koncept!

# Utwórz relację
createRelation(input: RelationInput!): Relacja!

# Aktualizuj koherencję
updateCoherence(id: ID!, koherencja: Float!): Koncept!
```

### Typy

```graphql
type Koncept {
  id: ID!
  label: String!
  domenaPierwotna: String!
  definicja: String!
  aksjomatPodstawowy: String!
  koherencja: Float!
  statusAntiD: Boolean!
  statusTrajektorii: String!
  źródłoAksjomatyczne: String!
  wektorHiperGęstości: Float!
  relacje: [Relacja!]!
}

enum Domena {
  KAR    # Kwantowa Architektura Rzeczywistości
  MEHS   # Meta-Etyka Hiperskalarna
  NCSS   # Noosfera Cyberprzestrzeni & SpiralMind OS
  EAEO   # Ekonomia Anti-Entropiczna Obfitości
  BSIT   # Inżynieria Trajektorii Bio-Synchronicznej
}

enum TypRelacji {
  KONSTYTUUJE
  MANIFESTUJE
  WZMACNIA
  ANTAGONIZUJE
  MAPUJE_NA
  WARUNKUJE
}
```

## 🧪 Przykładowe Zapytania

### Pobierz Wszystkie Węzły ROOT

```graphql
query {
  getRootNodes {
    id
    label
    domenaPierwotna
    koherencja
  }
}
```

### Wyszukaj Koncepty

```graphql
query {
  searchConcepts(query: "Kwantyzacja") {
    id
    label
    definicja
    domenaPierwotna
  }
}
```

### Pobierz Ścieżkę Między Konceptami

```graphql
query {
  getPath(
    fromId: "058f4701-d6e9-4220-8342-275c1d0b8017"
    toId: "ROOT_KAR"
    maxHops: 5
  ) {
    nodes {
      label
    }
    length
    valid
  }
}
```

### Waliduj Zgodność Anti-D

```graphql
query {
  validateAntiD {
    totalNodes
    validNodes
    averageCoherence
    pathReachability
    isolatedNodes {
      id
      label
    }
  }
}
```

### Utwórz Nowy Koncept

```graphql
mutation {
  createConcept(input: {
    label: "Emergencja Kwantowa"
    domenaPierwotna: KAR
    definicja: "Proces spontanicznego powstawania złożonych struktur"
    aksjomatPodstawowy: "ROOT_KAR"
    koherencja: 0.95
    statusTrajektorii: Nowy
    źródłoAksjomatyczne: "Internal"
    wektorHiperGęstości: 0.8
  }) {
    id
    label
    statusAntiD
  }
}
```

### Utwórz Relację

```graphql
mutation {
  createRelation(input: {
    fromId: "058f4701-d6e9-4220-8342-275c1d0b8017"
    toId: "ROOT_KAR"
    typ: KONSTYTUUJE
    waga: 1.0
  }) {
    typ
    cel {
      label
    }
  }
}
```

## 🔧 Architektura

```
┌─────────────────────────────────────────────┐
│         Serwer Apollo GraphQL               │
│         (Port 4000)                         │
└─────────────────────────────────────────────┘
                    │
                    │ Sterownik Neo4j
                    ▼
┌─────────────────────────────────────────────┐
│        Baza Danych Grafu Neo4j              │
│         (bolt://localhost:7687)             │
│                                             │
│  • 55 węzłów KONCEPT (5 ROOT + 50 tier-2)  │
│  • 6 typów relacji semantycznych           │
│  • Standard GOK:AI z 9 właściwościami      │
└─────────────────────────────────────────────┘
```

## 📈 Walidacja Anti-D

API GraphQL wymusza protokół **GOK:AI P=1.0**:

1. **Sprawdzenie Koherencji**: Wszystkie węzły muszą mieć `koherencja >= 0.80`
2. **Osiągalność Ścieżki**: Każdy węzeł musi być osiągalny z ROOT w obrębie ≤5 skoków
3. **Wykrywanie Izolowanych Węzłów**: Węzły bez relacji są oznaczane
4. **Wykrywanie Cykli**: Relacje ANTAGONIZUJE nie mogą tworzyć cykli

## 🔗 Integracja

### Z Frontendem (Next.js)

```javascript
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});
```

### Z Walidatorem Python

```python
import requests

response = requests.post('http://localhost:4000/graphql', json={
  'query': '{ validateAntiD { totalNodes validNodes } }'
})
```

## 📝 Status

- ✅ Definicja schematu ukończona
- ✅ Resolvery dla wszystkich zapytań/mutacji
- ✅ Integracja sterownika Neo4j
- ✅ Logika walidacji Anti-D
- ⏳ Wymaga działającej bazy danych Neo4j
- ⏳ Import węzłów oczekujący (użyj `import_nodes_direct.py`)

---

**Protokół**: GOK:AI + LOGOS v1.0  
**Data**: 2026-02-04  
**Status**: Gotowy do Integracji z Neo4j
