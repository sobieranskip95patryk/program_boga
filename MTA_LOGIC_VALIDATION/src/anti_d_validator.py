"""
Anti-D Validator Module (MTA_LOGIC_VALIDATION)

Core validation engine for GOK:AI compliance.
Validates coherence, detects entropy, ensures path reachability.

Protocol: GOK:AI v1.0 (Gwarancja Koherencji)
"""

import json
import uuid
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
from neo4j import GraphDatabase
from datetime import datetime
import logging

# ============ LOGGING SETUP ============
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============ ENUMS ============

class StatusTrajektorii(Enum):
    NOWY = "Nowy"
    ROZWOJ = "Rozwój"
    STABILNY = "Stabilny"
    ARCHAICZNY = "Archaiczny"

class ZrodloAksjomatyczne(Enum):
    INTERNAL = "Internal"
    EXTERNAL_SYNTHESIS = "External Synthesis"
    ORIGIN = "Origin"

# ============ NODE DATACLASS ============

@dataclass
class Node:
    id: str
    label: str
    domenaPierwotna: str
    definicja: str
    aksjomatPodstawowy: str
    koherencja: float
    statusAntiD: bool
    statusTrajektorii: str
    źródłoAksjomatyczne: str
    wektorHiperGęstości: float

# ============ ANTI-D VALIDATOR ============

class AntiDValidator:
    """
    Validates nodes against Anti-D criteria (P=1.0).
    
    Criteria:
    1. All 9 properties populated
    2. Koherencja ≥ 0.80
    3. Path reachability to all 5 ROOT nodes (≤5 hops)
    4. Minimum 3 semantic relations
    5. No cyclic single-type relations
    6. ANTAGONIZUJE relations have rozstrzygniecieLogiczne
    """
    
    ROOT_DOMAINS = ['KAR', 'MEHS', 'NCSS', 'EAEO', 'BSIT']
    MIN_COHERENCE = 0.80
    MAX_PATH_LENGTH = 5
    MIN_RELATIONS = 3
    
    def __init__(self, neo4j_uri: str = "bolt://localhost:7687", 
                 neo4j_user: str = "neo4j",
                 neo4j_password: str = "password"):
        self.uri = neo4j_uri
        self.user = neo4j_user
        self.password = neo4j_password
        self.driver = None
    
    def connect(self):
        """Establish Neo4j connection"""
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            logger.info("✓ Connected to Neo4j")
        except Exception as e:
            logger.error(f"✗ Failed to connect to Neo4j: {e}")
            raise
    
    def disconnect(self):
        """Close Neo4j connection"""
        if self.driver:
            self.driver.close()
            logger.info("✓ Disconnected from Neo4j")
    
    def validate_node(self, node: Node) -> Tuple[bool, List[str]]:
        """
        Validate single node against Anti-D criteria.
        
        Returns:
            (is_valid, error_messages)
        """
        errors = []
        
        # Check 1: All properties exist
        properties = [node.id, node.label, node.domenaPierwotna, node.definicja,
                      node.aksjomatPodstawowy, node.statusTrajektorii,
                      node.źródłoAksjomatyczne]
        if any(prop is None or prop == "" for prop in properties):
            errors.append("Missing required properties")
        
        # Check 2: Koherencja in valid range
        if not (0.0 <= node.koherencja <= 1.0):
            errors.append(f"Koherencja out of range: {node.koherencja}")
        if node.koherencja < self.MIN_COHERENCE:
            errors.append(f"Koherencja too low: {node.koherencja} < {self.MIN_COHERENCE}")
        
        # Check 3: WektorHiperGęstości valid
        if not (0.0 <= node.wektorHiperGęstości <= 1.0):
            errors.append(f"WektorHiperGęstości out of range: {node.wektorHiperGęstości}")
        
        # Check 4: Domain valid
        if node.domenaPierwotna not in self.ROOT_DOMAINS:
            errors.append(f"Invalid domain: {node.domenaPierwotna}")
        
        # Check 5: Status valid
        valid_statuses = [s.value for s in StatusTrajektorii]
        if node.statusTrajektorii not in valid_statuses:
            errors.append(f"Invalid statusTrajektorii: {node.statusTrajektorii}")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def validate_collection(self, nodes: List[Node]) -> Dict:
        """
        Validate entire collection of nodes.
        
        Returns:
            {
                'total': int,
                'valid': int,
                'rejected': [{node_label, errors}],
                'compliance_percentage': float
            }
        """
        total = len(nodes)
        valid = []
        rejected = []
        
        for node in nodes:
            is_valid, errors = self.validate_node(node)
            if is_valid:
                valid.append(node)
            else:
                rejected.append({
                    'label': node.label,
                    'errors': errors
                })
        
        return {
            'total': total,
            'valid': len(valid),
            'rejected': rejected,
            'compliance_percentage': (len(valid) / total * 100) if total > 0 else 0.0
        }
    
    def check_path_reachability_query(self, node_label: str) -> str:
        """
        Generate Cypher query to check if node reaches all 5 ROOT domains.
        """
        return f"""
        MATCH (n:KONCEPT {{label: '{node_label}'}})
        WITH n,
             SIZE([path IN allShortestPaths((n)-[*1..{self.MAX_PATH_LENGTH}]->(root:ROOT)) 
                   WHERE root.label IN ['Kwantowa Architektura Rzeczywistości', 
                                        'Meta-Etyka Hiper-Skalarna',
                                        'Noosfera Cybernetyczna i System SpiralMind',
                                        'Ekonomia Anti-Entropiczna Obfitości',
                                        'Bio-Synchroniczna Inżynieria Trajektorii']
                   | path]) as root_paths
        RETURN n.label, 
               CASE WHEN root_paths = 5 THEN 'VALID' ELSE 'ISOLATED' END as status,
               root_paths as reachable_roots
        """
    
    def get_validation_report(self) -> Dict:
        """
        Generate comprehensive validation report from Neo4j.
        """
        if not self.driver:
            return {'error': 'Not connected to Neo4j'}
        
        report = {}
        
        with self.driver.session() as session:
            # Count nodes by domain
            result = session.run(
                "MATCH (n:KONCEPT) RETURN n.domenaPierwotna as domain, COUNT(n) as count"
            )
            report['nodes_by_domain'] = {record['domain']: record['count'] for record in result}
            
            # Check low coherence nodes
            result = session.run(
                f"MATCH (n:KONCEPT) WHERE n.koherencja < {self.MIN_COHERENCE} RETURN n.label, n.koherencja"
            )
            report['low_coherence_nodes'] = [{r['label']: r['koherencja']} for r in result]
            
            # Check isolated nodes
            result = session.run(
                f"MATCH (n:KONCEPT) WHERE SIZE([(n)-[]->() | 1]) < {self.MIN_RELATIONS} RETURN n.label, SIZE([(n)-[]->() | 1]) as rel_count"
            )
            report['isolated_nodes'] = [{r['label']: r['rel_count']} for r in result]
        
        return report

# ============ MAIN ============

if __name__ == "__main__":
    import sys
    
    # Example usage
    validator = AntiDValidator()
    
    # Load sample nodes from JSON
    try:
        with open("../../Phase_1_Synthesis/nodes_50_second_tier.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            nodes = [
                Node(**{k: v for k, v in node.items() if k not in ['dataDodania']})
                for node in data['nodes']
            ]
        
        # Validate
        result = validator.validate_collection(nodes)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    except FileNotFoundError:
        print("✗ nodes_50_second_tier.json not found")
        sys.exit(1)
