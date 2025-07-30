import { getMongoClient } from '../utils/mongo';
import { ObjectId } from 'mongodb';

export interface MongoTransaction {
  _id?: ObjectId;
  transactionId: string;
  accountId: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoNotification {
  _id?: ObjectId;
  userId: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export async function createTransaction(
  accountId: string, 
  userId: string, 
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment',
  amount: number,
  description: string,
  createdAt?: string | Date
): Promise<MongoTransaction> {
  const client = await getMongoClient();
  const db = client.db();
  const transactions = db.collection('transactions');
  
  // Generate a unique transaction ID
  const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  const transaction: MongoTransaction = {
    transactionId,
    accountId,
    userId,
    type,
    amount,
    currency: 'USD',
    description,
    status: 'completed',
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: new Date()
  };
  
  const result = await transactions.insertOne(transaction);
  transaction._id = result.insertedId;
  return transaction;
}

export async function findTransactionsByAccount(accountId: string, limit: number = 10): Promise<MongoTransaction[]> {
  const client = await getMongoClient();
  const db = client.db();
  const transactions = db.collection('transactions');
  return transactions.find({ accountId }).sort({ createdAt: -1 }).limit(limit).toArray() as Promise<MongoTransaction[]>;
}

export async function findRecentTransactionsByUser(userId: string, limit: number = 10): Promise<MongoTransaction[]> {
  const client = await getMongoClient();
  const db = client.db();
  const transactions = db.collection('transactions');
  return transactions.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray() as Promise<MongoTransaction[]>;
} 

export async function createNotification(userId: string, message: string): Promise<MongoNotification> {
  const client = await getMongoClient();
  const db = client.db();
  const notifications = db.collection('notifications');
  const notification: MongoNotification = {
    userId,
    message,
    createdAt: new Date(),
    read: false,
  };
  const result = await notifications.insertOne(notification);
  notification._id = result.insertedId;
  return notification;
} 

export async function findTaxTransactionsByUser(userId: string, limit: number = 10): Promise<MongoTransaction[]> {
  const client = await getMongoClient();
  const db = client.db();
  const transactions = db.collection('transactions');
  // Find transactions where type is 'tax' or description contains 'tax'
  return transactions.find({
    userId,
    $or: [
      { type: 'tax' },
      { description: /tax/i }
    ]
  }).sort({ createdAt: -1 }).limit(limit).toArray() as Promise<MongoTransaction[]>;
} 