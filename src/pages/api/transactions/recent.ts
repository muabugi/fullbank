import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../auth/jwt';
import { findRecentTransactionsByUser } from './mongo-transactions';

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

  try {
    // Get the 5 most recent transactions from database
    const transactions = await findRecentTransactionsByUser(userId, 5);
    
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
    console.error('Error fetching recent transactions:', error);
    return res.status(500).json({ message: 'Failed to fetch recent transactions' });
  }
} 