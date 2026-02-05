/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA GRAPHQL API – SCHEMA DEFINITION
 * GOK:AI Protocol: 9-Property KONCEPT + 6 Semantic Relations
 * ════════════════════════════════════════════════════════════════════════════
 */

import gql from 'graphql-tag';

export const typeDefs = gql`
  """
  KONCEPT: Knowledge node with GOK:AI 9-property standard
  """
  type Koncept {
    id: ID!
    label: String!
    domenaPierwotna: String!
    definicja: String!
    aksjomatPodstawowy: String!
    koherencja: Float!
    statusAntiD: Boolean!
    statusTrajektorii: String!
    zrodloAksjomatyczne: String!
    wektorHiperGestosci: Float!
    
    """External entropy measurement (from MTA_NOISE_SENSOR)"""
    EntropyVector: Float
    ExternalSource: String
    
    """Relations to other concepts"""
    relacje: [Relacja!]!
  }
  
  """
  RELACJA: Semantic relation between concepts (6 types)
  """
  type Relacja {
    typ: TypRelacji!
    cel: Koncept!
    waga: Float
  }
  
  """
  6 Semantic relation types (Anti-D filtered)
  """
  enum TypRelacji {
    KONSTYTUUJE
    MANIFESTUJE
    WZMACNIA
    ANTAGONIZUJE
    MAPUJE_NA
    WARUNKUJE
  }
  
  """
  5 Primary domains
  """
  enum Domena {
    KAR
    MEHS
    NCSS
    EAEO
    BSIT
  }
  
  """
  Node status in trajectory
  """
  enum StatusTrajektorii {
    ROOT
    Nowy
    Rozwijany
    Walidowany
    Zarchiwizowany
  }
  
  """
  Query root type
  """
  type Query {
    """Get all concepts"""
    getAllConcepts: [Koncept!]!
    
    """Get concept by ID"""
    getConceptById(id: ID!): Koncept
    
    """Get concepts by domain"""
    getConceptsByDomain(domena: Domena!): [Koncept!]!
    
    """Get ROOT axiom nodes"""
    getRootNodes: [Koncept!]!
    
    """Search concepts by label or definition"""
    searchConcepts(query: String!): [Koncept!]!
    
    """Get path between two concepts (≤5 hops for Anti-D)"""
    getPath(fromId: ID!, toId: ID!, maxHops: Int = 5): Path
    
    """Validate Anti-D compliance for all nodes"""
    validateAntiD: ValidationReport!

    """Get all relationships for a node (incoming + outgoing)"""
    getNodeRelationships(id: ID!): NodeRelationships!

    """Get audit events (optionally for a specific concept)"""
    getAuditEvents(limit: Int = 50, konceptId: ID): [AuditEvent!]!
  }

  """
  Audit trail event
  """
  type AuditEvent {
    id: ID!
    timestamp: String!
    action: String!
    entityType: String!
    entityId: ID!
    actor: String!
    details: String
  }

  """
  Full relationship context for a node (incoming + outgoing)
  """
  type NodeRelationships {
    nodeId: ID!
    outgoing: [RelationDetail!]!
    incoming: [RelationDetail!]!
  }

  """
  Detailed relation with source and target info
  """
  type RelationDetail {
    typ: TypRelacji!
    waga: Float
    source: Koncept!
    target: Koncept!
  }
  
  """
  Path between concepts
  """
  type Path {
    nodes: [Koncept!]!
    length: Int!
    valid: Boolean!
  }
  
  """
  Anti-D validation report
  """
  type ValidationReport {
    totalNodes: Int!
    validNodes: Int!
    invalidNodes: Int!
    averageCoherence: Float!
    isolatedNodes: [Koncept!]!
    pathReachability: Float!
  }
  
  """
  Mutation root type
  """
  type Mutation {
    """Create new concept node"""
    createConcept(input: ConceptInput!): Koncept!
    
    """Create relation between concepts"""
    createRelation(input: RelationInput!): Relacja!
    
    """Update concept coherence"""
    updateCoherence(id: ID!, koherencja: Float!): Koncept!

    """Update concept trajectory status"""
    updateStatus(id: ID!, statusTrajektorii: StatusTrajektorii!): Koncept!

    """Report external entropy measurement (from MTA_NOISE_SENSOR)"""
    reportExternalEntropy(konceptId: ID!, entropiaWektor: Float!, zrodlo: String!): Koncept!
  }
  
  """
  Input for creating new concept
  """
  input ConceptInput {
    label: String!
    domenaPierwotna: Domena!
    definicja: String!
    aksjomatPodstawowy: String!
    koherencja: Float!
    statusTrajektorii: StatusTrajektorii!
    zrodloAksjomatyczne: String!
    wektorHiperGestosci: Float!
  }
  
  """
  Input for creating relation
  """
  input RelationInput {
    fromId: ID!
    toId: ID!
    typ: TypRelacji!
    waga: Float
  }
`;
