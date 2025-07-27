import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../auth/jwt';
import { findAccountByNumber, updateAccountBalance } from '../mongo-accounts';
import { createTransaction } from '../../transactions/mongo-transactions';
import { createNotification } from '../../transactions/mongo-transactions';

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
  const { to_account, amount, description } = req.body;

  if (!to_account || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid recipient account and amount are required' });
  }

  try {
    // Find the source account
    const fromAccount = await findAccountByNumber(accountNumber as string);
    if (!fromAccount) {
      return res.status(404).json({ message: 'Source account not found' });
    }

    // Verify user owns the source account
    if (fromAccount.userId !== userId) {
      return res.status(403).json({ message: 'Access denied to source account' });
    }

    // Check if source account is blocked
    if (fromAccount.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been locked for security reasons. Please contact support.' });
    }

    // Find the destination account
    const toAccount = await findAccountByNumber(to_account);
    if (!toAccount) {
      return res.status(404).json({ message: 'Destination account not found' });
    }

    // Check if destination account is blocked
    if (toAccount.status === 'blocked') {
      return res.status(400).json({ message: 'Cannot transfer to a blocked account' });
    }

    // Check if user has sufficient funds
    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Update balances
    const newFromBalance = fromAccount.balance - amount;
    const newToBalance = toAccount.balance + amount;

    const fromBalanceUpdated = await updateAccountBalance(fromAccount._id!.toString(), newFromBalance);
    const toBalanceUpdated = await updateAccountBalance(toAccount._id!.toString(), newToBalance);

    if (!fromBalanceUpdated || !toBalanceUpdated) {
      return res.status(500).json({ message: 'Failed to update account balances' });
    }

    // Create transaction records
    const fromTransaction = await createTransaction(
      fromAccount._id!.toString(),
      userId,
      'transfer',
      -amount, // Negative amount for outgoing transfer
      description || `Transfer to ${to_account}`
    );

    const toTransaction = await createTransaction(
      toAccount._id!.toString(),
      toAccount.userId,
      'transfer',
      amount, // Positive amount for incoming transfer
      description || `Transfer from ${accountNumber}`
    );

    // Create notification for recipient
    await createNotification(
      toAccount.userId,
      `You received $${amount} from account ${accountNumber}`
    );

    return res.status(200).json({ 
      message: 'Transfer successful', 
      newFromBalance, 
      newToBalance,
      fromTransaction,
      toTransaction
    });

  } catch (error) {
    console.error('Error processing transfer:', error);
    return res.status(500).json({ message: 'Failed to process transfer' });
  }
} 