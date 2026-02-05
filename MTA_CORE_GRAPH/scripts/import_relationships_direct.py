#!/usr/bin/env python3
"""
════════════════════════════════════════════════════════════════════════════
MTA CORE GRAPH – DIRECT RELATIONSHIP IMPORT
GOK:AI Protocol: Connect ROOT nodes + second-tier nodes with semantic relations
════════════════════════════════════════════════════════════════════════════
"""

import json
import os
from neo4j import GraphDatabase

ROOT_IDS_BY_DOMAIN = {
    "KAR": "ROOT_KAR",
    "MEHS": "ROOT_MEHS",
    "NCSS": "ROOT_NCSS",
    "EAEO": "ROOT_EAEO",
    "BSIT": "ROOT_BSIT",
}

ROOT_RING = [
    "ROOT_NCSS",
    "ROOT_KAR",
    "ROOT_MEHS",
    "ROOT_EAEO",
    "ROOT_BSIT",
    "ROOT_NCSS",
]

class MTARelationshipImporter:
    def __init__(self, uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_root_ring(self):
        with self.driver.session() as session:
            created = 0
            for i in range(len(ROOT_RING) - 1):
                from_id = ROOT_RING[i]
                to_id = ROOT_RING[i + 1]
                direction = f"{from_id}->{to_id}"
                session.run(
                    """
                    MATCH (from:KONCEPT {id: $fromId})
                    MATCH (to:KONCEPT {id: $toId})
                    MERGE (from)-[r:WARUNKUJE {kierunek: $direction}]->(to)
                    ON CREATE SET r.waga = 1.0
                    """,
                    fromId=from_id,
                    toId=to_id,
                    direction=direction,
                )
                created += 1
            print(f"✓ Created {created} ROOT ring relations (WARUNKUJE)")

    def connect_nodes_to_roots(self, json_path: str):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        nodes = data.get("nodes", [])
        created = 0

        with self.driver.session() as session:
            for node in nodes:
                domain = node.get("domenaPierwotna")
                root_id = ROOT_IDS_BY_DOMAIN.get(domain)
                if not root_id:
                    continue

                direction = f"{root_id}->{node['id']}"
                session.run(
                    """
                    MATCH (root:KONCEPT {id: $rootId})
                    MATCH (n:KONCEPT {id: $nodeId})
                    MERGE (root)-[r:MANIFESTUJE {direction: $direction}]->(n)
                    ON CREATE SET r.waga = 1.0
                    """,
                    rootId=root_id,
                    nodeId=node["id"],
                    direction=direction,
                )
                created += 1

        print(f"✓ Connected {created} second-tier nodes to ROOTs (MANIFESTUJE)")


def main():
    print("════════════════════════════════════════════════════════════════")
    print("  MTA CORE GRAPH – RELATIONSHIP IMPORT")
    print("  GOK:AI Protocol P=1.0")
    print("════════════════════════════════════════════════════════════════\n")

    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j")

    json_path = os.path.join(
        os.path.dirname(__file__),
        "..", "..",
        "Phase_1_Synthesis",
        "nodes_50_second_tier.json",
    )

    try:
        importer = MTARelationshipImporter(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

        print("1. Creating ROOT ring relations...")
        importer.create_root_ring()

        print("\n2. Connecting second-tier nodes to ROOTs...")
        importer.connect_nodes_to_roots(json_path)

        importer.close()

        print("\n✅ RELATIONSHIP IMPORT COMPLETE")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\n💡 SOLUTION:")
        print("   1. Start Neo4j database")
        print("   2. Set environment variables:")
        print("      NEO4J_URI=bolt://localhost:7687")
        print("      NEO4J_USER=neo4j")
        print("      NEO4J_PASSWORD=your_password")
        print("   3. Run: python import_relationships_direct.py")


if __name__ == "__main__":
    main()
