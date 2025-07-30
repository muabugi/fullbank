import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../auth/jwt';
import { createTransaction } from './mongo-transactions';
import { getMongoClient } from '../utils/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[TRANSACTIONS] Request method:', req.method);
  console.log('[TRANSACTIONS] Request body:', req.body);

  // Try to get JWT from Authorization header
  let token: string | null = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.slice(7);
    console.log('[TRANSACTIONS] Token from Authorization header:', token.substring(0, 20) + '...');
  } else {
    console.log('[TRANSACTIONS] No valid authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const payload = verifyJwt(token!);
  console.log('[TRANSACTIONS] JWT payload:', payload);
  
  if (!payload || typeof payload !== 'object' || !('id' in payload)) {
    console.log('[TRANSACTIONS] Invalid JWT payload');
    return res.status(401).json({ message: 'Invalid token' });
  }

  const userId = payload.id as string;
  console.log('[TRANSACTIONS] User ID:', userId);

  if (req.method === 'POST') {
    const { transaction_type, amount, currency, description, created_at, userId: targetUserId, bulk, transactions, accountId } = req.body;
    
    console.log('[TRANSACTIONS] Creating transaction with:', { transaction_type, amount, currency, description, created_at, targetUserId, bulk, accountId });
    
    // Handle bulk transactions first
    if (bulk && transactions && Array.isArray(transactions)) {
      console.log('[TRANSACTIONS] Processing bulk transactions:', transactions.length);
      
      try {
        // Check if admin is creating transactions for another user
        let transactionUserId = userId;
        if (transactions[0]?.userId && transactions[0].userId !== userId) {
          const client = await getMongoClient();
          const db = client.db();
          const usersCol = db.collection('users');
          const currentUser = await usersCol.findOne({ _id: new ObjectId(userId) });
          
          if (!currentUser || !currentUser.is_admin) {
            console.log('[TRANSACTIONS] Non-admin user trying to create transactions for another user');
            return res.status(403).json({ message: 'Only admins can create transactions for other users' });
          }
          
          // Verify target user exists
          const targetUser = await usersCol.findOne({ _id: new ObjectId(transactions[0].userId) });
          if (!targetUser) {
            console.log('[TRANSACTIONS] Target user not found:', transactions[0].userId);
            return res.status(404).json({ message: 'Target user not found' });
          }
          
          transactionUserId = transactions[0].userId;
          console.log('[TRANSACTIONS] Admin creating bulk transactions for user:', transactionUserId);
        }
        
        const createdTransactions = [];
        
        for (const tx of transactions) {
          // Validate each transaction in the bulk array
          if (!tx.transaction_type || !tx.amount || !tx.accountId) {
            console.log('[TRANSACTIONS] Missing required fields in bulk transaction:', tx);
            return res.status(400).json({ message: 'Each transaction must have transaction_type, amount, and accountId' });
          }
          
          const transaction = await createTransaction(
            tx.accountId,
            tx.userId || transactionUserId,
            tx.transaction_type,
            parseFloat(tx.amount),
            tx.description || '',
            tx.created_at // pass the date from the transaction object
          );
          createdTransactions.push(transaction);
        }
        
        console.log('[TRANSACTIONS] Bulk transactions created:', createdTransactions.length);
        return res.status(201).json({ transactions: createdTransactions });
      } catch (error) {
        console.error('[TRANSACTIONS] Error creating bulk transactions:', error);
        return res.status(500).json({ message: 'Failed to create bulk transactions' });
      }
    }
    
    // Handle single transaction
    if (!transaction_type || !amount || !currency || !accountId) {
      console.log('[TRANSACTIONS] Missing required fields');
      return res.status(400).json({ message: 'Transaction type, amount, currency, and account ID are required' });
    }

    try {
      // Check if admin is creating transaction for another user
      let transactionUserId = userId;
      if (targetUserId) {
        const client = await getMongoClient();
        const db = client.db();
        const usersCol = db.collection('users');
        const currentUser = await usersCol.findOne({ _id: new ObjectId(userId) });
        
        if (!currentUser || !currentUser.is_admin) {
          console.log('[TRANSACTIONS] Non-admin user trying to create transaction for another user');
          return res.status(403).json({ message: 'Only admins can create transactions for other users' });
        }
        
        // Verify target user exists
        const targetUser = await usersCol.findOne({ _id: new ObjectId(targetUserId) });
        if (!targetUser) {
          console.log('[TRANSACTIONS] Target user not found:', targetUserId);
          return res.status(404).json({ message: 'Target user not found' });
        }
        
        transactionUserId = targetUserId;
        console.log('[TRANSACTIONS] Admin creating transaction for user:', transactionUserId);
      }

      // Handle single transaction
      console.log('[TRANSACTIONS] Creating transaction for user:', transactionUserId);
      const transaction = await createTransaction(
        accountId,
        transactionUserId,
        transaction_type,
        parseFloat(amount),
        description || '',
        created_at // pass the date from the request
      );
      
      console.log('[TRANSACTIONS] Transaction created:', transaction);
      return res.status(201).json({ transaction });
    } catch (error) {
      console.error('[TRANSACTIONS] Error creating transaction:', error);
      return res.status(500).json({ message: 'Failed to create transaction' });
    }
  }

  console.log('[TRANSACTIONS] Method not allowed:', req.method);
  return res.status(405).json({ message: 'Method not allowed' });
} 