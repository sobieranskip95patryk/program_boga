/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA GRAPHQL API – RESOLVERS
 * GOK:AI Protocol: Neo4j integration with Anti-D validation
 * ════════════════════════════════════════════════════════════════════════════
 */

const createAuditEvent = async (session, {
  action,
  entityType,
  entityId,
  actor = 'system',
  details = null,
  relatedConceptIds = []
}) => {
  const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const timestamp = new Date().toISOString();
  const detailsJson = details ? JSON.stringify(details) : null;

  await session.run(
    `CREATE (e:AUDIT_EVENT {
       id: $id,
       timestamp: $timestamp,
       action: $action,
       entityType: $entityType,
       entityId: $entityId,
       actor: $actor,
       details: $details
     })
     WITH e
     UNWIND $relatedConceptIds AS konceptId
     MATCH (k:KONCEPT {id: konceptId})
     CREATE (e)-[:DOTYCZY]->(k)
     RETURN e`,
    {
      id,
      timestamp,
      action,
      entityType,
      entityId,
      actor,
      details: detailsJson,
      relatedConceptIds
    }
  );
};

export const resolvers = {
  Query: {
    getAllConcepts: async (_, __, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:KONCEPT)
           RETURN n
           ORDER BY n.label`
        );
        
        return result.records.map(record => ({
          ...record.get('n').properties,
          id: record.get('n').properties.id,
          zrodloAksjomatyczne: record.get('n').properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: record.get('n').properties['wektorHiperGęstości']
        }));
      } finally {
        await session.close();
      }
    },
    
    getConceptById: async (_, { id }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:KONCEPT {id: $id})
           RETURN n`,
          { id }
        );
        
        if (result.records.length === 0) return null;
        
        const node = result.records[0].get('n');
        return {
          ...node.properties,
          id: node.properties.id,
          zrodloAksjomatyczne: node.properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: node.properties['wektorHiperGęstości']
        };
      } finally {
        await session.close();
      }
    },
    
    getConceptsByDomain: async (_, { domena }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:KONCEPT {domenaPierwotna: $domena})
           RETURN n
           ORDER BY n.label`,
          { domena }
        );
        
        return result.records.map(record => ({
          ...record.get('n').properties,
          id: record.get('n').properties.id,
          zrodloAksjomatyczne: record.get('n').properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: record.get('n').properties['wektorHiperGęstości']
        }));
      } finally {
        await session.close();
      }
    },
    
    getRootNodes: async (_, __, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:ROOT)
           RETURN n
           ORDER BY n.label`
        );
        
        return result.records.map(record => ({
          ...record.get('n').properties,
          id: record.get('n').properties.id,
          zrodloAksjomatyczne: record.get('n').properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: record.get('n').properties['wektorHiperGęstości']
        }));
      } finally {
        await session.close();
      }
    },
    
    searchConcepts: async (_, { query }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:KONCEPT)
           WHERE n.label CONTAINS $query OR n.definicja CONTAINS $query
           RETURN n
           ORDER BY n.label
           LIMIT 50`,
          { query }
        );
        
        return result.records.map(record => ({
          ...record.get('n').properties,
          id: record.get('n').properties.id,
          zrodloAksjomatyczne: record.get('n').properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: record.get('n').properties['wektorHiperGęstości']
        }));
      } finally {
        await session.close();
      }
    },
    
    getPath: async (_, { fromId, toId, maxHops }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH path = shortestPath((from:KONCEPT {id: $fromId})-[*..${maxHops}]-(to:KONCEPT {id: $toId}))
           RETURN nodes(path) as nodes, length(path) as length`,
          { fromId, toId }
        );
        
        if (result.records.length === 0) {
          return { nodes: [], length: 0, valid: false };
        }
        
        const record = result.records[0];
        const nodes = record.get('nodes').map(node => ({
          ...node.properties,
          id: node.properties.id,
          zrodloAksjomatyczne: node.properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: node.properties['wektorHiperGęstości']
        }));
        const length = record.get('length').toNumber();
        
        return {
          nodes,
          length,
          valid: length <= maxHops
        };
      } finally {
        await session.close();
      }
    },
    
    validateAntiD: async (_, __, { driver }) => {
      const session = driver.session();
      try {
        // Get total nodes
        const totalResult = await session.run(
          `MATCH (n:KONCEPT)
           RETURN count(n) as total`
        );
        const totalNodes = totalResult.records[0].get('total').toNumber();
        
        // Get valid nodes (coherence >= 0.80)
        const validResult = await session.run(
          `MATCH (n:KONCEPT)
           WHERE n.koherencja >= 0.80
           RETURN count(n) as valid`
        );
        const validNodes = validResult.records[0].get('valid').toNumber();
        
        // Get average coherence
        const avgResult = await session.run(
          `MATCH (n:KONCEPT)
           RETURN avg(n.koherencja) as avgCoherence`
        );
        const averageCoherence = avgResult.records[0].get('avgCoherence');
        
        // Get isolated nodes
        const isolatedResult = await session.run(
          `MATCH (n:KONCEPT)
           WHERE NOT (n)-[]-()
           RETURN n`
        );
        const isolatedNodes = isolatedResult.records.map(record => ({
          ...record.get('n').properties,
          id: record.get('n').properties.id,
          zrodloAksjomatyczne: record.get('n').properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: record.get('n').properties['wektorHiperGęstości']
        }));
        
        // Calculate path reachability to ROOT nodes
        const reachResult = await session.run(
          `MATCH (n:KONCEPT)
           WHERE NOT n:ROOT
           MATCH (root:ROOT)
           WITH n, root
           MATCH path = shortestPath((n)-[*..5]-(root))
           RETURN count(DISTINCT n) as reachable`
        );
        const reachable = reachResult.records[0]?.get('reachable')?.toNumber() || 0;
        const pathReachability = totalNodes > 5 ? reachable / (totalNodes - 5) : 1.0;
        
        return {
          totalNodes,
          validNodes,
          invalidNodes: totalNodes - validNodes,
          averageCoherence,
          isolatedNodes,
          pathReachability
        };
      } finally {
        await session.close();
      }
    },

    getNodeRelationships: async (_, { id }, { driver }) => {
      const session = driver.session();
      try {
        // Outgoing relations
        const outResult = await session.run(
          `MATCH (from:KONCEPT {id: $id})-[r]->(to:KONCEPT)
           RETURN type(r) as typ, r, from, to`,
          { id }
        );
        const outgoing = outResult.records.map(record => ({
          typ: record.get('typ'),
          waga: record.get('r').properties.waga || 1.0,
          source: {
            ...record.get('from').properties,
            zrodloAksjomatyczne: record.get('from').properties['źródłoAksjomatyczne'],
            wektorHiperGestosci: record.get('from').properties['wektorHiperGęstości']
          },
          target: {
            ...record.get('to').properties,
            zrodloAksjomatyczne: record.get('to').properties['źródłoAksjomatyczne'],
            wektorHiperGestosci: record.get('to').properties['wektorHiperGęstości']
          }
        }));

        // Incoming relations
        const inResult = await session.run(
          `MATCH (from:KONCEPT)-[r]->(to:KONCEPT {id: $id})
           RETURN type(r) as typ, r, from, to`,
          { id }
        );
        const incoming = inResult.records.map(record => ({
          typ: record.get('typ'),
          waga: record.get('r').properties.waga || 1.0,
          source: {
            ...record.get('from').properties,
            zrodloAksjomatyczne: record.get('from').properties['źródłoAksjomatyczne'],
            wektorHiperGestosci: record.get('from').properties['wektorHiperGęstości']
          },
          target: {
            ...record.get('to').properties,
            zrodloAksjomatyczne: record.get('to').properties['źródłoAksjomatyczne'],
            wektorHiperGestosci: record.get('to').properties['wektorHiperGęstości']
          }
        }));

        return { nodeId: id, outgoing, incoming };
      } finally {
        await session.close();
      }
    },

    getAuditEvents: async (_, { limit, konceptId }, { driver }) => {
      const session = driver.session();
      const limitVal = Math.max(1, Math.min(200, parseInt(limit || 50)));
      try {
        const cypher = konceptId
          ? `MATCH (e:AUDIT_EVENT)-[:DOTYCZY]->(k:KONCEPT {id: $konceptId})
             RETURN e
             ORDER BY e.timestamp DESC
             LIMIT ${limitVal}`
          : `MATCH (e:AUDIT_EVENT)
             RETURN e
             ORDER BY e.timestamp DESC
             LIMIT ${limitVal}`;

        const result = await session.run(cypher, { konceptId });
        return result.records.map(record => record.get('e').properties);
      } finally {
        await session.close();
      }
    }
  },
  
  Mutation: {
    createConcept: async (_, { input }, { driver }) => {
      const session = driver.session();
      try {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const result = await session.run(
          `CREATE (n:KONCEPT {
             id: $id,
             label: $label,
             domenaPierwotna: $domenaPierwotna,
             definicja: $definicja,
             aksjomatPodstawowy: $aksjomatPodstawowy,
             koherencja: $koherencja,
             statusAntiD: $statusAntiD,
             statusTrajektorii: $statusTrajektorii,
             źródłoAksjomatyczne: $zrodloAksjomatyczne,
             wektorHiperGęstości: $wektorHiperGestosci
           })
           RETURN n`,
          {
            id,
            label: input.label,
            domenaPierwotna: input.domenaPierwotna,
            definicja: input.definicja,
            aksjomatPodstawowy: input.aksjomatPodstawowy,
            koherencja: input.koherencja,
            statusTrajektorii: input.statusTrajektorii,
            zrodloAksjomatyczne: input.zrodloAksjomatyczne,
            wektorHiperGestosci: input.wektorHiperGestosci,
            statusAntiD: input.koherencja >= 0.80
          }
        );
        
        const node = result.records[0].get('n');
        await createAuditEvent(session, {
          action: 'CREATE_CONCEPT',
          entityType: 'KONCEPT',
          entityId: id,
          relatedConceptIds: [id],
          details: {
            label: input.label,
            domenaPierwotna: input.domenaPierwotna,
            koherencja: input.koherencja
          }
        });
        return {
          ...node.properties,
          id: node.properties.id,
          zrodloAksjomatyczne: node.properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: node.properties['wektorHiperGęstości']
        };
      } finally {
        await session.close();
      }
    },
    
    createRelation: async (_, { input }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (from:KONCEPT {id: $fromId})
           MATCH (to:KONCEPT {id: $toId})
           CREATE (from)-[r:${input.typ} {waga: $waga}]->(to)
           RETURN r, to`,
          {
            fromId: input.fromId,
            toId: input.toId,
            waga: input.waga || 1.0
          }
        );
        
        const rel = result.records[0].get('r');
        const target = result.records[0].get('to');

        await createAuditEvent(session, {
          action: 'CREATE_RELATION',
          entityType: 'RELATION',
          entityId: `${input.fromId}-${rel.type}-${input.toId}`,
          relatedConceptIds: [input.fromId, input.toId],
          details: {
            fromId: input.fromId,
            toId: input.toId,
            typ: rel.type,
            waga: rel.properties.waga || 1.0
          }
        });
        
        return {
          typ: rel.type,
          cel: {
            ...target.properties,
            id: target.properties.id
          },
          waga: rel.properties.waga
        };
      } finally {
        await session.close();
      }
    },
    
    updateCoherence: async (_, { id, koherencja }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:KONCEPT {id: $id})
           SET n.koherencja = $koherencja,
               n.statusAntiD = $statusAntiD
           RETURN n`,
          {
            id,
            koherencja,
            statusAntiD: koherencja >= 0.80
          }
        );
        
        const node = result.records[0].get('n');
        await createAuditEvent(session, {
          action: 'UPDATE_COHERENCE',
          entityType: 'KONCEPT',
          entityId: id,
          relatedConceptIds: [id],
          details: {
            koherencja,
            statusAntiD: koherencja >= 0.80
          }
        });
        return {
          ...node.properties,
          id: node.properties.id,
          zrodloAksjomatyczne: node.properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: node.properties['wektorHiperGęstości']
        };
      } finally {
        await session.close();
      }
    },

    updateStatus: async (_, { id, statusTrajektorii }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:KONCEPT {id: $id})
           SET n.statusTrajektorii = $statusTrajektorii
           RETURN n`,
          { id, statusTrajektorii }
        );
        
        if (result.records.length === 0) {
          throw new Error(`Node with id '${id}' not found`);
        }
        
        const node = result.records[0].get('n');
        await createAuditEvent(session, {
          action: 'UPDATE_STATUS',
          entityType: 'KONCEPT',
          entityId: id,
          relatedConceptIds: [id],
          details: { statusTrajektorii }
        });
        return {
          ...node.properties,
          id: node.properties.id,
          zrodloAksjomatyczne: node.properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: node.properties['wektorHiperGęstości']
        };
      } finally {
        await session.close();
      }
    },

    reportExternalEntropy: async (_, { konceptId, entropiaWektor, zrodlo }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n:KONCEPT {id: $konceptId})
           SET n.EntropyVector = $entropiaWektor,
               n.ExternalSource = $zrodlo
           RETURN n`,
          { konceptId, entropiaWektor, zrodlo }
        );

        if (result.records.length === 0) {
          throw new Error(`Koncept '${konceptId}' not found`);
        }

        const node = result.records[0].get('n');
        await createAuditEvent(session, {
          action: 'REPORT_EXTERNAL_ENTROPY',
          entityType: 'KONCEPT',
          entityId: konceptId,
          relatedConceptIds: [konceptId],
          details: { entropiaWektor, zrodlo }
        });
        return {
          ...node.properties,
          id: node.properties.id,
          zrodloAksjomatyczne: node.properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: node.properties['wektorHiperGęstości']
        };
      } finally {
        await session.close();
      }
    },

    updateNodeProperties: async (_, { input }, { driver }) => {
      const session = driver.session();
      try {
        const { id, ...fields } = input;
        const setParts = [];
        const params = { id };

        if (fields.label !== undefined) { setParts.push('n.label = $label'); params.label = fields.label; }
        if (fields.domenaPierwotna !== undefined) { setParts.push('n.domenaPierwotna = $domenaPierwotna'); params.domenaPierwotna = fields.domenaPierwotna; }
        if (fields.definicja !== undefined) { setParts.push('n.definicja = $definicja'); params.definicja = fields.definicja; }
        if (fields.aksjomatPodstawowy !== undefined) { setParts.push('n.aksjomatPodstawowy = $aksjomatPodstawowy'); params.aksjomatPodstawowy = fields.aksjomatPodstawowy; }
        if (fields.koherencja !== undefined) {
          setParts.push('n.koherencja = $koherencja');
          setParts.push('n.statusAntiD = $statusAntiD');
          params.koherencja = fields.koherencja;
          params.statusAntiD = fields.koherencja >= 0.80;
        }
        if (fields.statusTrajektorii !== undefined) { setParts.push('n.statusTrajektorii = $statusTrajektorii'); params.statusTrajektorii = fields.statusTrajektorii; }
        if (fields.zrodloAksjomatyczne !== undefined) { setParts.push('n.`źródłoAksjomatyczne` = $zrodloAksjomatyczne'); params.zrodloAksjomatyczne = fields.zrodloAksjomatyczne; }
        if (fields.wektorHiperGestosci !== undefined) { setParts.push('n.`wektorHiperGęstości` = $wektorHiperGestosci'); params.wektorHiperGestosci = fields.wektorHiperGestosci; }
        if (fields.EntropyVector !== undefined) { setParts.push('n.EntropyVector = $EntropyVector'); params.EntropyVector = fields.EntropyVector; }
        if (fields.ExternalSource !== undefined) { setParts.push('n.ExternalSource = $ExternalSource'); params.ExternalSource = fields.ExternalSource; }

        if (setParts.length === 0) {
          throw new Error('No properties provided for update');
        }

        const result = await session.run(
          `MATCH (n:KONCEPT {id: $id})
           SET ${setParts.join(', ')}
           RETURN n`,
          params
        );

        if (result.records.length === 0) {
          throw new Error(`Koncept '${id}' not found`);
        }

        const node = result.records[0].get('n');
        await createAuditEvent(session, {
          action: 'UPDATE_NODE_PROPERTIES',
          entityType: 'KONCEPT',
          entityId: id,
          relatedConceptIds: [id],
          details: fields
        });

        return {
          ...node.properties,
          id: node.properties.id,
          zrodloAksjomatyczne: node.properties['źródłoAksjomatyczne'],
          wektorHiperGestosci: node.properties['wektorHiperGęstości']
        };
      } finally {
        await session.close();
      }
    },

    updateRelationshipProperties: async (_, { input }, { driver }) => {
      const session = driver.session();
      try {
        const { fromId, toId, typ, waga } = input;

        if (waga === undefined || waga === null) {
          throw new Error('Property "waga" is required for relationship update');
        }

        const result = await session.run(
          `MATCH (from:KONCEPT {id: $fromId})-[r:${typ}]->(to:KONCEPT {id: $toId})
           SET r.waga = $waga
           RETURN r, to`,
          { fromId, toId, waga }
        );

        if (result.records.length === 0) {
          throw new Error(`Relation '${typ}' from '${fromId}' to '${toId}' not found`);
        }

        const rel = result.records[0].get('r');
        const target = result.records[0].get('to');

        await createAuditEvent(session, {
          action: 'UPDATE_RELATION_PROPERTIES',
          entityType: 'RELATION',
          entityId: `${fromId}-${rel.type}-${toId}`,
          relatedConceptIds: [fromId, toId],
          details: { fromId, toId, typ: rel.type, waga: rel.properties.waga || 1.0 }
        });

        return {
          typ: rel.type,
          cel: {
            ...target.properties,
            id: target.properties.id
          },
          waga: rel.properties.waga
        };
      } finally {
        await session.close();
      }
    },

    deleteRelationship: async (_, { input }, { driver }) => {
      const session = driver.session();
      try {
        const { fromId, toId, typ } = input;
        const result = await session.run(
          `MATCH (from:KONCEPT {id: $fromId})-[r:${typ}]->(to:KONCEPT {id: $toId})
           DELETE r
           RETURN count(r) as deleted`,
          { fromId, toId }
        );

        const deleted = result.records[0]?.get('deleted')?.toNumber?.() ?? 0;
        if (deleted === 0) {
          throw new Error(`Relation '${typ}' from '${fromId}' to '${toId}' not found`);
        }

        await createAuditEvent(session, {
          action: 'DELETE_RELATION',
          entityType: 'RELATION',
          entityId: `${fromId}-${typ}-${toId}`,
          relatedConceptIds: [fromId, toId],
          details: { fromId, toId, typ }
        });

        return true;
      } finally {
        await session.close();
      }
    }
  },
  
  Koncept: {
    relacje: async (parent, _, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (from:KONCEPT {id: $id})-[r]->(to:KONCEPT)
           RETURN type(r) as typ, r, to`,
          { id: parent.id }
        );
        
        return result.records.map(record => ({
          typ: record.get('typ'),
          cel: {
            ...record.get('to').properties,
            id: record.get('to').properties.id,
            zrodloAksjomatyczne: record.get('to').properties['źródłoAksjomatyczne'],
            wektorHiperGestosci: record.get('to').properties['wektorHiperGęstości']
          },
          waga: record.get('r').properties.waga || 1.0
        }));
      } finally {
        await session.close();
      }
    }
  }
};
