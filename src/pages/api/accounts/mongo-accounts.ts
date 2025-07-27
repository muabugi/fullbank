import { getMongoClient } from '../utils/mongo';
import { ObjectId } from 'mongodb';

export interface MongoAccount {
  _id?: ObjectId;
  accountNumber: string;
  userId: string;
  type: 'savings' | 'checking' | 'business' | 'fixed';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export async function createAccount(userId: string, type: 'savings' | 'checking' | 'business' | 'fixed', initialDeposit: number = 0): Promise<MongoAccount> {
  console.log('[createAccount] Starting with:', { userId, type, initialDeposit });
  
  const client = await getMongoClient();
  const db = client.db();
  const accounts = db.collection('accounts');
  
  // Generate a unique account number (simple implementation)
  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  console.log('[createAccount] Generated account number:', accountNumber);
  
  const account: MongoAccount = {
    accountNumber,
    userId,
    type,
    balance: initialDeposit,
    currency: 'USD',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('[createAccount] Account object to insert:', account);
  
  const result = await accounts.insertOne(account);
  console.log('[createAccount] Insert result:', result);
  
  account._id = result.insertedId;
  console.log('[createAccount] Final account object:', account);
  
  return account;
}

export async function findAccountsByUser(userId: string): Promise<MongoAccount[]> {
  console.log('[findAccountsByUser] Looking for user:', userId);
  const client = await getMongoClient();
  const db = client.db();
  const accounts = db.collection('accounts');
  const results = await accounts.find({ userId }).toArray() as MongoAccount[];
  console.log('[findAccountsByUser] Found accounts:', results);
  return results;
}

export async function findAccountById(accountId: string): Promise<MongoAccount | null> {
  const client = await getMongoClient();
  const db = client.db();
  const accounts = db.collection('accounts');
  return accounts.findOne({ _id: new ObjectId(accountId) }) as Promise<MongoAccount | null>;
}

export async function findAccountByNumber(accountNumber: string): Promise<MongoAccount | null> {
  const client = await getMongoClient();
  const db = client.db();
  const accounts = db.collection('accounts');
  return accounts.findOne({ accountNumber }) as Promise<MongoAccount | null>;
}

export async function updateAccountBalance(accountId: string, newBalance: number): Promise<boolean> {
  const client = await getMongoClient();
  const db = client.db();
  const accounts = db.collection('accounts');
  
  const result = await accounts.updateOne(
    { _id: new ObjectId(accountId) },
    { 
      $set: { 
        balance: newBalance,
        updatedAt: new Date()
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

export async function updateAccountStatus(accountId: string, status: 'active' | 'inactive' | 'suspended' | 'blocked'): Promise<boolean> {
  const client = await getMongoClient();
  const db = client.db();
  const accounts = db.collection('accounts');
  
  const result = await accounts.updateOne(
    { _id: new ObjectId(accountId) },
    { 
      $set: { 
        status: status,
        updatedAt: new Date()
      } 
    }
  );
  
  return result.modifiedCount > 0;
} 