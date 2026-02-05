# MTA Hyper Interface

**Protokół GOK:AI P=1.0** – Frontend Next.js dla MTAQuestWebsideX

## 🎯 Cel

Interaktywny interfejs webowy do wizualizacji i eksploracji grafu wiedzy:
- Wizualizacja grafu z siłami kierowanymi (vis.js/vis-network)
- Wyszukiwanie i filtrowanie w czasie rzeczywistym
- Inspekcja szczegółów węzła z pełnym wyświetleniem 9 właściwości
- Kodowanie kolorami oparte na domenie (5 domen)
- Wyświetlanie statusu walidacji Anti-D
- Klient Apollo dla integracji GraphQL

## 🚀 Szybki Start

### Wymagania Wstępne

1. **Node.js 18+**
2. **API GraphQL działające** na `http://localhost:4000` (zobacz MTA_GRAPHQL_API)
3. **Baza danych Neo4j** z zaimportowanymi węzłami

### Instalacja

```bash
cd MTA_HYPER_INTERFACE
npm install
```

### Konfiguracja

Utwórz plik `.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:4000/graphql
```

### Uruchom Serwer Deweloperski

```bash
npm run dev
```

Aplikacja uruchomi się na: **http://localhost:3000**

### Build Produkcyjny

```bash
npm run build
npm start
```

## 🎨 Funkcje

### Wizualizacja Grafu
- **Fizyka z siłami kierowanymi** za pomocą vis-network 9.1.9
- **Kodowanie kolorami domeny:**
  - KAR (Kwantowa Architektura Rzeczywistości): Cyjan
  - MEHS (Meta-Etyka Hiperskalarna): Magenta
  - NCSS (Noosfera Cyberprzestrzeni): Zielony
  - EAEO (Ekonomia Anti-Entropiczna): Złoty
  - BSIT (Inżynieria Trajektorii Bio-Synchronicznej): Pomarańczowy
- **Interaktywna selekcja węzłów** z panelem szczegółów
- **Kształty węzłów**: Gwiazdy dla ROOT, kropki dla konceptów

### Wyszukiwanie i Filtrowanie
- **Pełnotekstowe wyszukiwanie** po etykiecie i definicji
- **Filtrowanie domeny** (pokaż tylko węzły z wybranej domeny)
- **Status walidacji Anti-D** w czasie rzeczywistym
- **Statystyki grafu** (liczba węzłów, relacji, średnia koherencja)

### Panel Szczegółów Węzła
Wyświetla wszystkie 9 właściwości GOK:AI:
- ID i Etykieta
- Domena Pierwotna
- Definicja
- Aksjom Podstawowy
- Koherencja (0.0-1.0)
- Status Anti-D (✓/✗)
- Status Trajektorii
- Źródło Aksjomatyczne
- Wektor Hipergestości

### Estetyka
- **Styl futurystyczny/monumentalny**
- **Czarne tło** z neonowymi akcentami
- **Typografia monospace** (Courier New)
- **Efekty świetlne, cienie, animacje hover**

## 📁 Struktura Projektu

```
MTA_HYPER_INTERFACE/
├── src/
│   ├── app/                      # Katalog aplikacji Next.js
│   │   ├── page.jsx              # Główna strona eksploratora
│   │   ├── layout.jsx            # Layout aplikacji
│   │   └── globals.css           # Style globalne
│   └── components/               # Komponenty React
│       └── GraphVisualization.jsx  # Komponent vis.js (350 linii)
├── public/                       # Zasoby statyczne
├── package.json                  # Zależności Node
├── next.config.js                # Konfiguracja Next.js
├── tailwind.config.js            # Konfiguracja Tailwind CSS
└── README.md                     # Ten plik
```

## 🔧 Technologie

- **Next.js 14** – Framework React z App Router
- **React 18** – Biblioteka UI
- **Apollo Client 3.8** – Klient GraphQL
- **vis-network 9.1.9** – Wizualizacja grafu
- **vis-data 7.1.9** – Zarządzanie danymi grafu
- **Tailwind CSS 3.4** – Framework CSS dla stylowania

## 🎮 Użycie

### Nawigacja Grafu
- **Przeciągnij węzły** aby zmienić ich pozycję
- **Przewiń** aby przybliżyć/oddalić
- **Kliknij węzeł** aby zobaczyć szczegóły
- **Dwukrotnie kliknij węzeł** aby skupić widok
- **Kliknij tło** aby usunąć zaznaczenie

### Wyszukiwanie
1. Wpisz zapytanie w pasku wyszukiwania
2. Graf automatycznie filtruje dopasowane węzły
3. Wyczyść wyszukiwanie, aby zobaczyć wszystkie węzły

### Filtrowanie
- Użyj menu rozwijanego **Domena** aby pokazać tylko węzły z określonej domeny
- Wybierz **Wszystkie Domeny** aby zobaczyć pełny graf

### Odświeżanie Danych
- Kliknij przycisk **⟳ Odśwież** aby pobrać najnowsze dane z API
- Graf odświeża się automatycznie co 30 sekund

## 🔗 Integracja z API

### Zapytania GraphQL

Frontend wykonuje następujące zapytania:

```javascript
// Pobierz wszystkie koncepty z relacjami
query GetAllConcepts {
  getAllConcepts {
    id
    label
    domenaPierwotna
    definicja
    koherencja
    statusAntiD
    relacje {
      typ
      cel { id }
    }
  }
}

// Waliduj zgodność Anti-D
query ValidateAntiD {
  validateAntiD {
    totalNodes
    validNodes
    averageCoherence
    pathReachability
  }
}
```

## 📊 Nakładka Statystyk

Wyświetla metryki w czasie rzeczywistym:
- **Węzły**: Całkowita liczba węzłów KONCEPT
- **Krawędzie**: Całkowita liczba relacji
- **Śr. Koherencja**: Średnia wartość koherencji
- **Status Protokołu**: GOK:AI P=1.0

## 🐛 Rozwiązywanie Problemów

### Błąd Połączenia
```
Nie udało się połączyć z API GraphQL
```
**Rozwiązanie:**
1. Zweryfikuj, że API GraphQL działa: http://localhost:4000
2. Sprawdź `NEXT_PUBLIC_GRAPHQL_URI` w `.env.local`
3. Upewnij się, że Neo4j ma dane

### Graf Pusty
**Rozwiązanie:**
1. Otwórz narzędzia deweloperskie przeglądarki (F12)
2. Sprawdź błędy w konsoli
3. Zweryfikuj, że zapytanie GraphQL zwraca dane
4. Wyczyść pamięć podręczną przeglądarki: Ctrl+Shift+R

### Powolna Wydajność
**Rozwiązanie:**
1. Ogranicz liczbę widocznych węzłów (użyj filtrów)
2. Wyłącz fizikę: kliknij przycisk stabilizacji
3. Zmniejsz `pollInterval` w page.jsx

## 📝 Status

- ✅ Wizualizacja grafu ukończona (vis-network)
- ✅ Integracja Apollo Client
- ✅ Wyszukiwanie i filtrowanie
- ✅ Panel szczegółów węzła
- ✅ Status walidacji Anti-D
- ⏳ Wymaga działającego API GraphQL
- ⏳ Wymaga zaimportowanych danych Neo4j

---

**Protokół**: GOK:AI + LOGOS v1.0  
**Data**: 2026-02-04  
**Status**: Gotowy do Integracji
