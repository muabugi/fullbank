import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../auth/jwt';
import { findAccountByNumber, updateAccountBalance } from '../mongo-accounts';
import { createTransaction } from '../../transactions/mongo-transactions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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
  const { accountNumber } = req.query;
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid amount is required' });
  }

  try {
    // Find the account
    const account = await findAccountByNumber(accountNumber as string);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify user owns this account
    if (account.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update account balance
    const newBalance = account.balance + amount;
    const balanceUpdated = await updateAccountBalance(account._id!.toString(), newBalance);
    
    if (!balanceUpdated) {
      return res.status(500).json({ message: 'Failed to update account balance' });
    }

    // Create transaction record
    const transaction = await createTransaction(
      account._id!.toString(),
      userId,
      'deposit',
      amount,
      description || 'Deposit'
    );

    return res.status(200).json({ 
      message: 'Deposit successful',
      newBalance,
      transaction
    });

  } catch (error) {
    console.error('Error processing deposit:', error);
    return res.status(500).json({ message: 'Failed to process deposit' });
  }
} 