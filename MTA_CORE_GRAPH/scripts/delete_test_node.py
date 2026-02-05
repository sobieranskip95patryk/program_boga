#!/usr/bin/env python3
"""Delete TestowyKoncept node from Neo4j."""
import os
from neo4j import GraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j")

cypher = "MATCH (n {label: 'TestowyKoncept'}) DETACH DELETE n"

with GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)) as driver:
    with driver.session() as session:
        result = session.run(cypher)
        summary = result.consume()
        print(f"Deleted nodes: {summary.counters.nodes_deleted}")
