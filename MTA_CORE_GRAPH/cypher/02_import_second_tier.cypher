// ════════════════════════════════════════════════════════════════════════════
// MTA CORE GRAPH – IMPORT 50 WĘZŁÓW DRUGORZĘDNYCH
// GOK:AI Protocol: Import validated nodes from Phase 1.1 Synthesis
// ════════════════════════════════════════════════════════════════════════════

// Load JSON file and create nodes with all 9 properties
CALL apoc.load.json('file:///nodes_50_second_tier.json') YIELD value
UNWIND value.nodes AS node
CREATE (n:KONCEPT {
  id: node.id,
  label: node.label,
  domenaPierwotna: node.domenaPierwotna,
  definicja: node.definicja,
  aksjomatPodstawowy: node.aksjomatPodstawowy,
  koherencja: toFloat(node.koherencja),
  statusAntiD: node.statusAntiD,
  statusTrajektorii: node.statusTrajektorii,
  źródłoAksjomatyczne: node.źródłoAksjomatyczne,
  wektorHiperGęstości: node.wektorHiperGęstości
})
RETURN count(n) AS imported_nodes;

// ════════════════════════════════════════════════════════════════════════════
// Alternative: Direct CREATE statements (if APOC not available)
// ════════════════════════════════════════════════════════════════════════════
