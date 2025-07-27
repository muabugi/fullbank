import { taxHandler } from './history';
import { getMongoClient } from '../utils/mongo';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../auth/jwt';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Admin: create a new tax transaction for any user
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = auth.slice(7);
    const payload = verifyJwt(token);
    if (!payload || typeof payload !== 'object' || !('id' in payload)) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const userId = payload.id as string;
    const client = await getMongoClient();
    const db = client.db();
    const users = db.collection('users');
    const transactions = db.collection('transactions');
    const adminUser = await users.findOne({ _id: new ObjectId(userId) });
    if (!adminUser || !adminUser.is_admin) {
      return res.status(403).json({ message: 'Admins only' });
    }
    if (req.body.bulk && Array.isArray(req.body.taxes)) {
      const taxes = req.body.taxes.map((t: { userId: string; amount: number | string; currency: string; description: string; created_at?: string; }) => ({
        userId: t.userId,
        type: 'tax',
        amount: -Math.abs(Number(t.amount)),
        currency: t.currency,
        description: t.description,
        status: 'completed',
        createdAt: t.created_at ? new Date(t.created_at) : new Date(),
        updatedAt: new Date(),
      }));
      const result = await transactions.insertMany(taxes);
      taxes.forEach((tx: { userId: string; amount: number | string; currency: string; description: string; created_at?: string; _id?: any }, i: number) => { tx._id = result.insertedIds[i]; });
      return res.status(201).json({ count: taxes.length, transactions: taxes });
    }
    const { userId: targetUserId, amount, currency, description } = req.body;
    if (!targetUserId || !amount || !currency || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const tx = {
      userId: targetUserId,
      type: 'tax',
      amount: -Math.abs(Number(amount)),
      currency,
      description,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await transactions.insertOne(tx);
    (tx as typeof tx & { _id: any })._id = result.insertedId;
    return res.status(201).json({ transaction: tx });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = auth.slice(7);
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== 'object' || !('id' in payload)) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const userId = payload.id as string;
  const client = await getMongoClient();
  const db = client.db();
  const users = db.collection('users');
  const transactions = db.collection('transactions');
  const user = await users.findOne({ _id: new ObjectId(userId) });
  const targetUserId = req.query.userId as string;
  
  if (user && user.is_admin) {
    // Admin: return tax transactions based on targetUserId if provided, otherwise all tax transactions
    let taxTransactions;
    if (targetUserId) {
      // Filter tax transactions for specific user
      taxTransactions = await transactions.find({ 
        userId: targetUserId,
        $or: [ { type: 'tax' }, { description: /tax/i } ] 
      }).toArray();
    } else {
      // Return all tax transactions
      taxTransactions = await transactions.find({ $or: [ { type: 'tax' }, { description: /tax/i } ] }).toArray();
    }
    
    const mapped = taxTransactions.map(tx => ({
      id: tx._id?.toString() || tx.transactionId,
      transaction_type: 'TAX',
      amount: Math.abs(tx.amount),
      currency: tx.currency,
      status: tx.status?.toUpperCase(),
      created_at: tx.createdAt?.toISOString?.() || '',
      description: tx.description,
    }));
    return res.status(200).json({ count: mapped.length, results: mapped });
  } else {
    // Regular user: return only their tax transactions
    return taxHandler(req, res);
  }
} 