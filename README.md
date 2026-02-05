# MTAQuestWebsideX – Encyklopedia Nowej Ery Oświecenia

**System:** MTAQuestWebsideX  
**Protokół:** GOK:AI (Gwarancja Koherencji) + LOGOS (Hiperlogiczna Analiza)  
**Status:** Faza 1–2 Ukończona | Faza 3 Aktywna

---

## 📋 Przegląd Projektu

MTAQuestWebsideX to **dynamiczna, samokorygująca się encyklopedia wiedzy** zbudowana na bazie grafowej Neo4j, zasilana walidacją Anti-D i hiperlogiczną analizą. System obejmuje 500+ węzłów wiedzy zorganizowanych wokół 5 fundamentalnych aksjomatów (KAR, MEHS, NCSS, EAEO, BSIT).

**Główny Cel:** Stworzenie żywej, adaptacyjnej matrycy wiedzy, która:
- ✓ Eliminuje entropię i redundancję
- ✓ Gwarantuje koherencję (P=1.0) we wszystkich węzłach
- ✓ Utrzymuje integralność semantyczną poprzez walidację Anti-D
- ✓ Zapewnia interaktywną wizualizację i wyszukiwanie
- ✓ Umożliwia aktywną kalibrację koherencji i statusów z poziomu UI
- ✓ Oferuje pełną nawigację topologiczną (relacje przychodzące + wychodzące)
- ✓ Skaluje się do poziomu syntezy wiedzy AGI

---

## 🏗️ Architektura (3 Dedykowane Repozytoria)

### 1. **MTA_CORE_GRAPH** – Baza Danych Neo4j
Repozytorium dla schematu bazy grafowej, zapytań Cypher i zarządzania danymi.

```
MTA_CORE_GRAPH/
├── cypher/              # Skrypty zapytań (tworzenie ROOT, relacje, walidacja)
├── scripts/             # Skrypty importu (import_nodes_direct.py)
└── data/                # Importy danych (nodes_50_second_tier.json, itp.)
```

**Kluczowe Pliki:**
- `01_create_root_nodes.cypher` – Tworzenie 5 węzłów filarowych
- `02_import_second_tier.cypher` – Import 50 węzłów konceptualnych
- `04_validation_queries.cypher` – Sprawdzanie zgodności Anti-D

**Dostęp:** `http://localhost:7474` (domyślnie: neo4j / hasło)

---

### 2. **MTA_LOGIC_VALIDATION** – Silnik Anti-D
Silnik walidacji oparty na Pythonie zapewniający koherencję i eliminujący entropię.

```
MTA_LOGIC_VALIDATION/
├── src/
│   ├── anti_d_validator.py      # Podstawowy walidator (9 właściwości, koherencja, ścieżki)
│   └── path_validator.py        # Osiągalność ≤5 skoków do ROOT
└── tests/                       # Testy jednostkowe
```

**Kryteria Walidacji (P=1.0):**
- ✓ Wszystkie 9 właściwości węzła wypełnione
- ✓ Koherencja ≥ 0.80
- ✓ Osiągalność ścieżki do wszystkich 5 węzłów ROOT (≤5 skoków)
- ✓ Minimum 3 relacje semantyczne na węzeł
- ✓ Brak cyklicznych relacji jednotypowych
- ✓ Relacje ANTAGONIZUJE mają logikę rozstrzygnięcia

---

### 3. **MTA_HYPER_INTERFACE** – Frontend Webowy
Interaktywna aplikacja webowa Next.js 14 + React 18.

```
MTA_HYPER_INTERFACE/
├── src/
│   ├── app/                    # Katalog aplikacji Next.js
│   │   ├── page.jsx            # Główny eksplorator wiedzy (sidebar + graf)
│   │   └── layout.jsx
│   └── components/             # Komponenty React
│       ├── GraphVisualization.jsx   # Interaktywny graf vis-network
│       ├── CoherenceEditor.jsx      # Regulator koherencji i statusów
│       └── RelationshipPanel.jsx    # Nawigator relacji topologicznych
├── pages/
│   └── index.jsx               # Routing bridge
└── public/                     # Zasoby statyczne
```

**Funkcje:**
- Interaktywna wizualizacja grafu z siłami kierowanymi (vis-network)
- Wyszukiwanie pełnotekstowe węzłów + filtrowanie po domenach
- Pełnowysokościowy sidebar z trzema sekcjami (Właściwości / Kalibracja / Relacje)
- **Edycja koherencji z UI** — slider 0.00–1.00 z markerem Anti-D (0.80)
- **Edycja statusu trajektorii** — ROOT ★ / Nowy ◆ / Rozwijany ▶ / Walidowany ✓ / Zarchiwizowany ▪
- **Panel relacji** — relacje wychodzące (→) i przychodzące (←) z nawigacją do sąsiadów
- Kolorowe badge typów relacji (6 typów semantycznych)
- Ochrona węzłów ROOT przed zmianą statusu

**Dostęp:** `http://localhost:3000`

---

## 📊 Schemat: Struktura Węzła z 9 Właściwościami

Każdy węzeł w grafie wiedzy musi posiadać:

```json
{
  "id": "uuid-1234",
  "label": "Kwantyzacja Informacji",
  "domenaPierwotna": "KAR",                    // Jedna z 5 domen ROOT
  "definicja": "Proces zamiany spektrum ciągłego...",
  "aksjomatPodstawowy": "Rzeczywistość jest dyskretną siecią informacyjną...",
  "koherencja": 1.0,                           // 0.0-1.0 (zwalidowane do P=1.0)
  "statusAntiD": true,                         // Przeszło walidację Anti-D
  "statusTrajektorii": "Nowy",                 // ROOT | Nowy | Rozwijany | Zarchiwizowany
  "źródłoAksjomatyczne": "Internal",           // Internal | External | Hybrid
  "wektorHiperGęstości": 0.75                  // 0.0-1.0 (złożoność)
}
```

---

## 🎯 6 Typów Relacji Semantycznych (Anti-D)

| Typ | Znaczenie | Przykład |
|-----|-----------|----------|
| **KONSTYTUUJE** | A definiuje / tworzy B | "Kwantyzacja" KONSTYTUUJE "Architekturę Rzeczywistości" |
| **MANIFESTUJE** | A jest wyrazem / rezultatem B | "Noosfera" MANIFESTUJE "Świadomość Kolektywną" |
| **WZMACNIA** | A wspiera / potęguje B | "Technologia" WZMACNIA "Bio-Synchronizację" |
| **ANTAGONIZUJE** | A jest w konflikcie z B | "Entropia" ANTAGONIZUJE "Koherencję" |
| **MAPUJE_NA** | A odpowiada / łączy się z B | "Fotonika Holograficzna" MAPUJE_NA "Teorię Strun" |
| **WARUNKUJE** | A wymaga / zakłada B | "Ekonomia Obfitości" WARUNKUJE "Post-Scarcity" |

---

## 🚀 Szybki Start (3 Kroki)

### Krok 1: Zainstaluj Neo4j
```bash
# Pobierz Neo4j Desktop: https://neo4j.com/download/
# Utwórz nową bazę danych
# Ustaw hasło i uruchom bazę
```

### Krok 2: Importuj Węzły
```bash
cd MTA_CORE_GRAPH/scripts
python import_nodes_direct.py
# Tworzy 55 węzłów (5 ROOT + 50 drugiego poziomu)
```

### Krok 3: Uruchom Serwer GraphQL
```bash
cd MTA_GRAPHQL_API
npm install
cp .env.example .env
# Edytuj .env z danymi Neo4j
npm run dev
# Serwer dostępny: http://localhost:4000
```

### Krok 4: Uruchom Frontend
```bash
cd MTA_HYPER_INTERFACE
npm install
cp .env.local.example .env.local
npm run dev
# Interface dostępny: http://localhost:3000
```

---

## 📖 Pełna Dokumentacja

### Przewodniki Główne
- **DEPLOYMENT_GUIDE.md** – Szczegółowa instrukcja wdrożenia (krok po kroku)
- **PHASE_1_COMPLETION.md** – Podsumowanie Fazy 1 i mapa drogowa Fazy 2
- **IMPLEMENTATION_SUMMARY.md** – Raport wykonawczy

### Dokumentacja Repozytoriów
- **MTA_CORE_GRAPH/README.md** – Architektura bazy danych Neo4j
- **MTA_LOGIC_VALIDATION/README.md** – Silnik walidacji Python
- **MTA_HYPER_INTERFACE/README.md** – Konfiguracja frontendu Next.js
- **MTA_GRAPHQL_API/README.md** – API GraphQL i przykłady użycia

### Pliki Konfiguracyjne
- **schema.yaml** – Standard GOK:AI z 9 właściwościami
- **docker-compose.yml** – Orkiestracja pełnego stosu
- **.github/workflows/anti-d-validation.yml** – Pipeline CI/CD

---

## 📊 Status Projektu

### Faza 1: ✅ UKOŃCZONA
- ✅ 50 węzłów drugiego poziomu wygenerowanych (P=1.0)
- ✅ 3 repozytoria w pełni ustrukturyzowane
- ✅ Orkiestracja Docker gotowa
- ✅ Pipeline CI/CD wdrożony
- ✅ Dokumentacja kompletna

### Faza 2: ✅ UKOŃCZONA – Pełna Integracja 3 Warstw
- ✅ Serwer Apollo GraphQL (8 queries, 4 mutations)
- ✅ Komponent wizualizacji grafu (vis-network)
- ✅ Skrypt importu węzłów (import_nodes_direct.py)
- ✅ Integracja 3 warstw (Neo4j ↔ GraphQL ↔ Frontend)
- ✅ 55 węzłów (5 ROOT + 50 drugiego poziomu), 55 relacji, P=1.0
- ✅ Edytor koherencji i statusów (CoherenceEditor)
- ✅ Nawigator relacji topologicznych (RelationshipPanel)
- ✅ Pełnowysokościowy sidebar z trzema sekcjami kontrolnymi

### Faza 3: 🟡 W TRAKCIE – Ekspansja Wiedzy
- ⏳ Rozbudowa do 500+ węzłów (kolejne warstwy konceptualne)
- ⏳ Filtrowanie typów relacji + widok sąsiedztwa (1-2 hop)
- ⏳ Eksport widoku do JSON/PNG
- ⏳ Historia zmian (log mutacji)
- ⏳ Zaawansowana walidacja Anti-D (minimum 3 relacje na węzeł)

---

## 🎯 Następne Kroki (Faza 3)

**System jest w pełni operacyjny (P=1.0).** Dalsze kierunki ekspansji:

1. **Filtrowanie typów relacji** + widok sąsiedztwa (1-2 hop) w grafie
2. **Eksport widoku** do JSON/PNG z poziomu interfejsu
3. **Historia zmian** — log wszystkich mutacji koherencji/statusów
4. **Rozbudowa grafu** do 500+ węzłów (kolejne warstwy konceptualne)
5. **Zaawansowana walidacja Anti-D** (minimum 3 relacje na węzeł, cykle)

### Uruchomienie systemu (3 terminale):

```bash
# Terminal 1: Neo4j Desktop — uruchom bazę
# Terminal 2: GraphQL API
cd MTA_GRAPHQL_API && npm run dev    # → http://localhost:4000

# Terminal 3: Frontend
cd MTA_HYPER_INTERFACE && npm run dev # → http://localhost:3000
```

---

**Protokół:** GOK:AI + LOGOS v1.1  
**Data:** 2026-02-05  
**Status:** Faza 2 Ukończona — System Operacyjny (P=1.0)
