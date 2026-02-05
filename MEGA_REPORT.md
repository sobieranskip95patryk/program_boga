# MTAQuestWebsideX — Mega Raport Stanu, Kierunku i Fundamentów

**Data:** 5 lutego 2026  
**Status:** Faza 3.2 (API + MTA_NOISE_SENSOR aktywne), Faza 3.1 ukończona

---

## 1. Cel Systemu (w skrócie)
MTAQuestWebsideX to interaktywny system wiedzy oparty o graf pojęć, zaprojektowany do utrzymania koherencji (P=1.0) w modelu aksjomatycznym oraz do kontroli relacji semantycznych między konceptami. System łączy Neo4j (rdzeń grafu), GraphQL (warstwa kognitywna), Next.js (interfejs operacyjny) oraz moduł walidacji Anti-D.

---

## 2. Co mamy już wdrożone (konkretne moduły i funkcje)

### 2.1. Rdzeń grafu (Neo4j)
- **55 konceptów** w 5 domenach: KAR, MEHS, NCSS, EAEO, BSIT
- **6 typów relacji semantycznych:** KONSTYTUUJE, MANIFESTUJE, WZMACNIA, ANTAGONIZUJE, MAPUJE_NA, WARUNKUJE
- **Węzły ROOT** dla każdej domeny

### 2.2. GraphQL API (Apollo Server)
- **Query:** `getAllConcepts`, `getConceptById`, `getConceptsByDomain`, `getRootNodes`, `searchConcepts`, `getPath`, `validateAntiD`, `getNodeRelationships`
- **Mutacje:** `createConcept`, `createRelation`, `updateCoherence`, `updateStatus`
- **Nowe pola dla entropii zewnętrznej:**
  - `EntropyVector` (Float)
  - `ExternalSource` (String)
- **Nowa mutacja:** `reportExternalEntropy(konceptId, entropiaWektor, zrodlo)`
  - Aktualizuje tylko `EntropyVector` i `ExternalSource`
  - **Nie zmienia** `koherencja`

### 2.3. Frontend (Next.js + vis-network)
- Interaktywny graf koncepcji z kolorem domen
- Panel szczegółów węzła (properties, koherencja, relacje)
- **Faza 3.1 ukończona:** klient-side filtrowanie relacji (6 przełączników) w `RelationFilter.jsx`
- Edycja koherencji i statusu Anti-D
- Panel relacji przychodzących i wychodzących

### 2.4. Walidacja (Anti-D Validator)
- Analiza spójności P=1.0 dla wszystkich węzłów
- Wskaźniki: liczba węzłów, średnia koherencja, izolowane węzły, reachability

---

## 3. Co robimy teraz (Faza 3.2 — Entropia Zewnętrzna)

### 3.2.1. Aktualny stan
- API jest przygotowane do przyjęcia entropii zewnętrznej
- Mutacja `reportExternalEntropy` działa (test na ROOT_EAEO zakończony sukcesem)
- MTA_NOISE_SENSOR działa i raportuje cyklicznie (scheduler 300s)

### 3.2.2. Co dalej
- Utrzymanie stabilnej pracy sensora i logów
- Rozszerzenie źródeł danych (rynek / sentyment / RSS)
- Doskonalenie mapowania źródeł → konceptów

---

## 4. Na czym bazujemy (fundamenty techniczne)

### 4.1. Stos technologiczny
- **Neo4j** (bolt://localhost:7687)
- **GraphQL / Apollo Server** (http://localhost:4000/graphql)
- **Next.js 14** (http://localhost:3000)
- **vis-network** do wizualizacji grafu
- **Python** do walidacji i przyszłych sensorów

### 4.2. Architektura logiczna
- **Koherencja (P=1.0)** jako aksjomat bazowy
- **Status Anti-D** jako kontrola stabilności
- **Relacje semantyczne** jako struktura znaczeniowa
- **Entropia zewnętrzna** jako sygnał dysproporcji między modelem a rzeczywistością

---

## 5. Kierunek rozwoju (najbliższe etapy)

### 5.1. Faza 3.2 (obecna)
- Zbudować MTA_NOISE_SENSOR jako osobny moduł
- Zasilić system realnymi danymi zewnętrznymi

### 5.2. Faza 4 (skalowanie)
- Rozbudowa grafu do 500+ węzłów
- Optymalizacja zapytań GraphQL (m.in. filtrowanie relacji po stronie API)
- Historiografia zmian (audit trail) i eksporty

---

## 6. Najważniejsze decyzje architektoniczne
- Filtrowanie relacji działa **po stronie klienta** (szybkie, bez obciążania API przy obecnej skali)
- Entropia zewnętrzna jest izolowana od koherencji (nie narusza P=1.0)
- API jest punktem kontrolnym ingestii danych zewnętrznych

---

## 7. Status operacyjny (podsumowanie)
- Faza 3.1 ✅ ukończona
- Faza 3.2 ✅ API przygotowane, test mutacji zaliczony
- MTA_NOISE_SENSOR ✅ uruchomiony, raportuje cyklicznie

---

## 8. Repozytoria / Moduły (aktualny stan)
- **MTA_CORE_GRAPH** — rdzeń danych Neo4j
- **MTA_GRAPHQL_API** — API GraphQL
- **MTA_HYPER_INTERFACE** — UI / wizualizacja
- **MTA_LOGIC_VALIDATION** — walidacja Anti-D

---

## 9. Notatka końcowa
System jest stabilny, koherencja bazowa utrzymana, a warstwa ingestii entropii jest gotowa. Następny logiczny krok to uruchomienie zewnętrznego sensora i włączenie go w pipeline przez `reportExternalEntropy`.
