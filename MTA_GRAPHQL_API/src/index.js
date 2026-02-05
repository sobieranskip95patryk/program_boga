/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA GRAPHQL API – APOLLO SERVER
 * GOK:AI Protocol: GraphQL gateway for Neo4j knowledge graph
 * ════════════════════════════════════════════════════════════════════════════
 */

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

dotenv.config();

// Neo4j connection
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'neo4j';

console.log(`Neo4j config: uri=${NEO4J_URI}, user=${NEO4J_USER}, password=${NEO4J_PASSWORD ? 'set' : 'missing'}`);

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// Verify connection
async function verifyConnection() {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('✓ Connected to Neo4j');
  } catch (error) {
    console.error('❌ Failed to connect to Neo4j:', error.message);
    console.log('\n💡 SOLUTION:');
    console.log('   1. Install Neo4j Desktop or Neo4j Community');
    console.log('   2. Start Neo4j database');
    console.log('   3. Create .env file with:');
    console.log('      NEO4J_URI=bolt://localhost:7687');
    console.log('      NEO4J_USER=neo4j');
    console.log('      NEO4J_PASSWORD=your_password');
    process.exit(1);
  } finally {
    await session.close();
  }
}

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return error;
  }
});

// Start server
async function startServer() {
  try {
    console.log('════════════════════════════════════════════════════════════════');
    console.log('  MTA GRAPHQL API');
    console.log('  GOK:AI Protocol P=1.0');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    await verifyConnection();
    
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      context: async () => ({ driver })
    });
    
    console.log(`\n🚀 GraphQL Server ready at ${url}`);
    console.log('\n📊 Available Queries:');
    console.log('   • getAllConcepts');
    console.log('   • getConceptById(id)');
    console.log('   • getConceptsByDomain(domena)');
    console.log('   • getRootNodes');
    console.log('   • searchConcepts(query)');
    console.log('   • getPath(fromId, toId, maxHops)');
    console.log('   • validateAntiD');
    
    console.log('\n✏️  Available Mutations:');
    console.log('   • createConcept(input)');
    console.log('   • createRelation(input)');
    console.log('   • updateCoherence(id, koherencja)');
    
    console.log('\n🔗 Apollo Studio Explorer:');
    console.log(`   ${url}graphql`);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await driver.close();
  process.exit(0);
});

startServer();
