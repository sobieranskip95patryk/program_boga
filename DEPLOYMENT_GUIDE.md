# ════════════════════════════════════════════════════════════════════════════
# PRZEWODNIK WDROŻENIA FAZY 2
# Protokół GOK:AI: Instrukcje aktywacji krok po kroku
# ════════════════════════════════════════════════════════════════════════════

## 📋 PRZEGLĄD

Faza 2 przekształca architekturę Fazy 1 w w pełni operacyjny system z:
- Bazą grafową Neo4j wypełnioną 55 węzłami (5 ROOT + 50 drugiego poziomu)
- Serwerem Apollo GraphQL zapewniającym ustrukturyzowany dostęp do API
- Hyper-Interface Next.js z interaktywną wizualizacją grafu
- Walidacją i monitoringiem Anti-D

---

## 🔧 WYMAGANIA WSTĘPNE

### 1. Zainstaluj Neo4j

**Opcja A: Neo4j Desktop** (Zalecana)
- Pobierz: https://neo4j.com/download/
- Utwórz nową bazę danych
- Ustaw hasło (zapamiętaj na później)
- Uruchom bazę danych

**Opcja B: Neo4j Community Edition**
```bash
# Windows (Chocolatey)
choco install neo4j-community

# Uruchom Neo4j
neo4j console
```

**Opcja C: Docker** (jeśli Docker jest zainstalowany)
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/twoje_haslo \
  neo4j:5.13
```

### 2. Zweryfikuj Połączenie z Neo4j

Otwórz przeglądarkę Neo4j: http://localhost:7474

Domyślne dane uwierzytelniające:
- Nazwa użytkownika: `neo4j`
- Hasło: `neo4j` (zmień przy pierwszym logowaniu)

---

## 🚀 WDROŻENIE KROK PO KROKU

### KROK 1: Importuj Węzły do Neo4j

#### Opcja A: Użycie Skryptu Python (Zalecana)

```bash
# Zainstaluj sterownik Neo4j Python
cd E:\program_Boga\MTAQuestWebsideX\MTA_LOGIC_VALIDATION
pip install neo4j==5.14.1

# Ustaw zmienne środowiskowe
$env:NEO4J_URI = "bolt://localhost:7687"
$env:NEO4J_USER = "neo4j"
$env:NEO4J_PASSWORD = "twoje_haslo"

# Uruchom skrypt importu
cd ..\MTA_CORE_GRAPH\scripts
python import_nodes_direct.py
```

Oczekiwany wynik:
```
✓ Utworzono ograniczenia Neo4j
✓ Utworzono 5 węzłów ROOT
✓ Zaimportowano 50 węzłów drugiego poziomu
✓ IMPORT UKOŃCZONY – Wszystkie 55 węzły utworzone
```

#### Opcja B: Użycie Skryptów Cypher

```bash
# Otwórz przeglądarkę Neo4j: http://localhost:7474
# Skopiuj i wklej oraz wykonaj każdy skrypt:

# 1. Utwórz węzły ROOT
# Skopiuj zawartość z: MTA_CORE_GRAPH\cypher\01_create_root_nodes.cypher

# 2. Importuj JSON (jeśli zainstalowana wtyczka APOC)
# Skopiuj zawartość z: MTA_CORE_GRAPH\cypher\02_import_second_tier.cypher

# 3. Zweryfikuj
MATCH (n:KONCEPT) RETURN count(n) as total
# Powinno zwrócić: 55
```

---

### KROK 2: Uruchom API GraphQL

```bash
# Przejdź do katalogu API GraphQL
cd E:\program_Boga\MTAQuestWebsideX\MTA_GRAPHQL_API

# Zainstaluj zależności
npm install

# Utwórz plik .env
Copy-Item .env.example .env

# Edytuj .env z danymi Neo4j
notepad .env
# Ustaw:
#   NEO4J_URI=bolt://localhost:7687
#   NEO4J_USER=neo4j
#   NEO4J_PASSWORD=twoje_haslo

# Uruchom serwer
npm run dev
```

Oczekiwany wynik:
```
════════════════════════════════════════════════════════════════
  MTA GRAPHQL API
  Protokół GOK:AI P=1.0
════════════════════════════════════════════════════════════════

✓ Połączono z Neo4j

🚀 Serwer GraphQL gotowy na http://localhost:4000/
```

#### Testuj API GraphQL

Otwórz http://localhost:4000/graphql w przeglądarce

Wypróbuj zapytanie:
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

Powinno zwrócić 5 węzłów ROOT (KAR, MEHS, NCSS, EAEO, BSIT)

---

### KROK 3: Uruchom Interface Frontend

**Otwórz NOWY terminal** (pozostaw serwer GraphQL uruchomiony)

```bash
# Przejdź do katalogu frontendu
cd E:\program_Boga\MTAQuestWebsideX\MTA_HYPER_INTERFACE

# Zainstaluj zależności
npm install

# Utwórz .env.local
Copy-Item .env.local.example .env.local

# Uruchom serwer deweloperski
npm run dev
```

Oczekiwany wynik:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

#### Otwórz Interface

Otwórz przeglądarkę: **http://localhost:3000**

Powinieneś zobaczyć:
- Interaktywny graf z kierowanymi siłami z 55 węzłami
- Kodowanie kolorami według domeny (KAR=Cyan, MEHS=Magenta, itd.)
- Pasek wyszukiwania do filtrowania
- Nakładkę statystyk pokazującą liczbę węzłów, koherencję

---

## ✅ LISTA KONTROLNA WERYFIKACJI

### Baza Danych Neo4j
- [ ] Neo4j uruchomiony na porcie 7687
- [ ] Zaimportowano 55 węzłów (5 ROOT + 50 drugiego poziomu)
- [ ] Można odpytywać węzły w przeglądarce Neo4j

### API GraphQL
- [ ] Serwer uruchomiony na porcie 4000
- [ ] Można uzyskać dostęp do http://localhost:4000/graphql
- [ ] Zapytanie `getRootNodes` zwraca 5 węzłów
- [ ] Zapytanie `getAllConcepts` zwraca 55 węzłów

### Interface Frontend
- [ ] Serwer uruchomiony na porcie 3000
- [ ] Graf wizualizuje 55 węzłów
- [ ] Węzły kodowane kolorami według domeny
- [ ] Funkcjonalność wyszukiwania działa
- [ ] Kliknięcie węzła pokazuje panel szczegółów

### Walidacja Anti-D
- [ ] Zapytanie `validateAntiD` zwraca raport walidacji
- [ ] Wszystkie węzły mają koherencję ≥ 0.80
- [ ] Brak izolowanych węzłów (wszystkie połączone)

---

## 🔗 TWORZENIE RELACJI SEMANTYCZNYCH

Obecnie węzły istnieją, ale nie są połączone. Utwórz relacje:

```bash
# Otwórz przeglądarkę Neo4j
# Wykonaj zapytania tworzenia relacji

# Przykład: Połącz "Kwantyzacja Informacji" z ROOT_KAR
MATCH (from:KONCEPT {label: "Kwantyzacja Informacji"})
MATCH (to:KONCEPT {id: "ROOT_KAR"})
CREATE (from)-[:KONSTYTUUJE {waga: 1.0}]->(to)

# Lub użyj mutacji GraphQL:
mutation {
  createRelation(input: {
    fromId: "058f4701-d6e9-4220-8342-275c1d0b8017"
    toId: "ROOT_KAR"
    typ: KONSTYTUUJE
    waga: 1.0
  }) {
    typ
  }
}
```

**Zalecane Relacje:**
- Każdy węzeł drugiego poziomu → jego ROOT (KONSTYTUUJE)
- Połączenia międzydomenowe (MAPUJE_NA, WZMACNIA)
- Minimum 3 relacje na węzeł dla zgodności Anti-D

---

## 🐛 ROZWIĄZYWANIE PROBLEMÓW

### Błąd Połączenia z Neo4j
```
Error: Nie udało się połączyć z Neo4j
```
**Rozwiązanie:**
1. Zweryfikuj, że Neo4j działa: http://localhost:7474
2. Sprawdź dane uwierzytelniające w plikach `.env`
3. Zweryfikuj, że porty 7474/7687 nie są zablokowane

### Błąd API GraphQL
```
Error: Cannot find module '@apollo/client'
```
**Rozwiązanie:**
```bash
cd MTA_GRAPHQL_API
rm -r node_modules
npm install
```

### Błąd Połączenia Frontend
```
Nie udało się połączyć z API GraphQL
```
**Rozwiązanie:**
1. Zweryfikuj, że serwer GraphQL działa (port 4000)
2. Sprawdź `NEXT_PUBLIC_GRAPHQL_URI` w `.env.local`
3. Uruchom ponownie frontend: `npm run dev`

### Węzły Niewidoczne
**Rozwiązanie:**
1. Zweryfikuj, że Neo4j ma 55 węzłów: `MATCH (n) RETURN count(n)`
2. Sprawdź, czy zapytanie GraphQL zwraca dane
3. Wyczyść pamięć podręczną przeglądarki i przeładuj

---

## 📊 MONITORING

### Sprawdź Status Systemu

**Sprawdzanie Zdrowia GraphQL:**
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

**Statystyki Neo4j:**
```cypher
// Wszystkie węzły
MATCH (n:KONCEPT) RETURN count(n) as nodes

// Wszystkie relacje
MATCH ()-[r]->() RETURN count(r) as relations

// Średnia koherencja
MATCH (n:KONCEPT) RETURN avg(n.koherencja) as avg_coherence

// Izolowane węzły (powinno być 0 dla Anti-D)
MATCH (n:KONCEPT)
WHERE NOT (n)-[]-()
RETURN n.label
```

---

## 📈 NASTĘPNE KROKI (Faza 2 Tydzień 2-3)

### Tydzień 2: Ulepszanie Wizualizacji
- [ ] Dodaj UI filtrowania relacji
- [ ] Implementuj wyszukiwanie węzłów z podświetleniem
- [ ] Utwórz widoki specyficzne dla domeny
- [ ] Dodaj kontrolki zoom/pan

### Tydzień 3: Integracja i Testowanie
- [ ] Utwórz 100+ relacji semantycznych
- [ ] Uruchom pełną walidację Anti-D
- [ ] Testowanie wydajności (500+ węzłów)
- [ ] Testowanie akceptacyjne użytkownika

---

## 🎯 KRYTERIA SUKCESU

Faza 2 jest ukończona, gdy:
- ✅ Wszystkie 3 warstwy działają (Neo4j + GraphQL + Frontend)
- ✅ 55 węzłów widocznych w interaktywnym grafie
- ✅ Funkcjonalność wyszukiwania i filtrowania działa
- ✅ Szczegóły węzła wyświetlają się poprawnie
- ✅ Walidacja Anti-D pokazuje P ≥ 0.95
- ✅ System działa stabilnie przez 24+ godziny

---

**Protokół**: GOK:AI + LOGOS v1.0  
**Data**: 2026-02-04  
**Status**: Gotowy do Wdrożenia
