# RELATION TYPES (Anti-D Semantic Relations)

// These relation types define the semantic meaning of connections
// Each relation type enforces a specific logical transformation

// 1. KONSTYTUUJE – Fundamental (A must exist for B to be possible)
// Example: Kwantyzacja Informacji KONSTYTUUJE Fotonikę Holograficzną
CREATE CONSTRAINT konstytuuje_unique IF NOT EXISTS FOR (r:KONSTYTUUJE) REQUIRE r.direction IS UNIQUE;

// 2. MANIFESTUJE – Emergent (A manifests itself as B)
// Example: Świadomość MANIFESTUJE SpiralMind OS
CREATE CONSTRAINT manifestuje_unique IF NOT EXISTS FOR (r:MANIFESTUJE) REQUIRE r.direction IS UNIQUE;

// 3. WZMACNIA – Synergistic (A+B > A and B separately, increases coherence)
// Example: Kwantowa Informatyka WZMACNIA Ekonomię Anti-Entropiczną
CREATE CONSTRAINT wzmacnia_unique IF NOT EXISTS FOR (r:WZMACNIA) REQUIRE r.direction IS UNIQUE;

// 4. ANTAGONIZUJE – Dissonance (A and B exclude each other, conflict)
// Example: Redukcjonizm ANTAGONIZUJE Holistyczną Syntetyzę
// Note: Must include rozstrzygniecieLogiczne field with resolution method
CREATE CONSTRAINT antagonizuje_requires_resolution IF NOT EXISTS FOR (r:ANTAGONIZUJE) REQUIRE r.rozstrzygniecieLogiczne IS NOT NULL;

// 5. MAPUJE_NA – Isomorphism (A and B structurally identical but different material)
// Example: Biologiczna Ewolucja MAPUJE NA Ewolucję Świadomości
CREATE CONSTRAINT mapuje_na_unique IF NOT EXISTS FOR (r:MAPUJE_NA) REQUIRE r.kierunek IS UNIQUE;

// 6. WARUNKUJE – Causality (A is necessary but not sufficient condition for B)
// Example: Koherencja Wewnętrzna WARUNKUJE Etykę Kosmiczną
CREATE CONSTRAINT warunkuje_unique IF NOT EXISTS FOR (r:WARUNKUJE) REQUIRE r.kierunek IS UNIQUE;

// Global node constraint: All nodes must have all 9 properties
CREATE CONSTRAINT node_properties_required IF NOT EXISTS FOR (n:KONCEPT) 
REQUIRE (n.id IS NOT NULL AND 
         n.label IS NOT NULL AND 
         n.domenaPierwotna IS NOT NULL AND
         n.definicja IS NOT NULL AND
         n.aksjomatPodstawowy IS NOT NULL AND
         n.koherencja IS NOT NULL AND
         n.statusAntiD IS NOT NULL AND
         n.statusTrajektorii IS NOT NULL AND
         n.źródłoAksjomatyczne IS NOT NULL AND
         n.wektorHiperGęstości IS NOT NULL);
