import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../auth/jwt';
import { findRecentTransactionsByUser, findTaxTransactionsByUser } from './mongo-transactions';
import { getMongoClient } from '../utils/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const targetUserId = req.query.userId as string;

  try {
    // Check if admin is requesting transactions for a specific user
    let transactionUserId = userId;
    if (targetUserId) {
      const client = await getMongoClient();
      const db = client.db();
      const usersCol = db.collection('users');
      const currentUser = await usersCol.findOne({ _id: new ObjectId(userId) });
      
      if (currentUser && currentUser.is_admin) {
        // Admin can view transactions for any user
        transactionUserId = targetUserId;
      } else {
        // Non-admin users can only view their own transactions
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Get real transactions from database
    const transactions = await findRecentTransactionsByUser(transactionUserId, 50);
    
    // Map backend transaction format to frontend format
    const mappedTransactions = transactions.map(tx => ({
      id: tx._id?.toString() || tx.transactionId,
      transaction_type: tx.amount >= 0 ? 'CREDIT' : 'DEBIT',
      amount: Math.abs(tx.amount),
      currency: tx.currency,
      status: tx.status.toUpperCase(),
      created_at: tx.createdAt.toISOString(),
      description: tx.description,
    }));

    return res.status(200).json({ 
      count: mappedTransactions.length, 
      results: mappedTransactions 
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
} 

// Add a handler for /api/transactions/tax
export async function taxHandler(req: NextApiRequest, res: NextApiResponse) {
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

  try {
    const transactions = await findTaxTransactionsByUser(userId, 50);
    const mappedTransactions = transactions.map(tx => ({
      id: tx._id?.toString() || tx.transactionId,
      transaction_type: 'TAX',
      amount: Math.abs(tx.amount),
      currency: tx.currency,
      status: tx.status.toUpperCase(),
      created_at: tx.createdAt.toISOString(),
      description: tx.description,
    }));
    return res.status(200).json({
      count: mappedTransactions.length,
      results: mappedTransactions
    });
  } catch (error) {
    console.error('Error fetching tax transactions:', error);
    return res.status(500).json({ message: 'Failed to fetch tax transactions' });
  }
} 