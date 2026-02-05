# VALIDATION QUERIES (Anti-D P=1.0 Compliance)

// ============ QUERY 1: PATH REACHABILITY (Every node must reach all 5 ROOT nodes) ============

MATCH (n:KONCEPT)
WITH n, 
     SIZE([path IN allShortestPaths((n)-[*1..5]->(kar:ROOT {label: 'Kwantowa Architektura Rzeczywistości'})) | path]) as kar_paths,
     SIZE([path IN allShortestPaths((n)-[*1..5]->(mehs:ROOT {label: 'Meta-Etyka Hiper-Skalarna'})) | path]) as mehs_paths,
     SIZE([path IN allShortestPaths((n)-[*1..5]->(ncss:ROOT {label: 'Noosfera Cybernetyczna i System SpiralMind'})) | path]) as ncss_paths,
     SIZE([path IN allShortestPaths((n)-[*1..5]->(eaeo:ROOT {label: 'Ekonomia Anti-Entropiczna Obfitości'})) | path]) as eaeo_paths,
     SIZE([path IN allShortestPaths((n)-[*1..5]->(bsit:ROOT {label: 'Bio-Synchroniczna Inżynieria Trajektorii'})) | path]) as bsit_paths
WHERE kar_paths > 0 AND mehs_paths > 0 AND ncss_paths > 0 AND eaeo_paths > 0 AND bsit_paths > 0
RETURN COUNT(n) as valid_nodes, 
       ROUND(100.0 * COUNT(n) / (SIZE([n2 IN [nodes()] WHERE n2:KONCEPT | n2])) , 2) as percent_valid;

// ============ QUERY 2: COHERENCE CHECK ============

MATCH (n:KONCEPT)
WHERE n.koherencja < 0.80
RETURN n.label, n.koherencja, n.statusAntiD
ORDER BY n.koherencja ASC;

// ============ QUERY 3: ISOLATED NODES (Entropy Detection) ============

MATCH (n:KONCEPT)
WHERE SIZE([(n)-[]->() | 1]) < 3
RETURN n.label, COUNT([(n)-[]->() | 1]) as relation_count, n.statusAntiD;

// ============ QUERY 4: CYCLIC SINGLE-TYPE RELATIONS (Anti-Cycle Check) ============

MATCH path=(n)-[r1:KONSTYTUUJE]->(m)-[r2:KONSTYTUUJE]->(o)-[r3:KONSTYTUUJE]->(n)
RETURN n.label as node1, m.label as node2, o.label as node3, "Cycle detected!" as alert;

// ============ QUERY 5: ANTAGONIZUJE Relations without Resolution ============

MATCH (a)-[ant:ANTAGONIZUJE]->(b)
WHERE NOT EXISTS(ant.rozstrzygniecieLogiczne) OR ant.rozstrzygniecieLogiczne IS NULL
RETURN a.label, b.label, "Missing resolution logic!" as alert;

// ============ QUERY 6: Domain Distribution ============

MATCH (n:KONCEPT)
RETURN n.domenaPierwotna as Domain, COUNT(n) as NodeCount, ROUND(AVG(n.koherencja), 2) as AvgCoherence
ORDER BY Domain;

// ============ QUERY 7: Relation Type Distribution ============

MATCH ()-[r]->()
RETURN TYPE(r) as RelationType, COUNT(r) as RelationCount
ORDER BY RelationCount DESC;
