import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient: MongoClient | null = null;

function maskMongoUri(uri: string) {
  // Mask password in URI for logging
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@)/, '$1*****$2');
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }
  const maskedUri = maskMongoUri(uri);
  const dbName = uri.split('/').pop()?.split('?')[0];
  console.log(`[MongoDB] Connecting to: ${maskedUri}`);
  console.log(`[MongoDB] Database name: ${dbName}`);
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
} 