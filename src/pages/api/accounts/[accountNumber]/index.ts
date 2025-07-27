import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../auth/jwt';
import { findAccountByNumber } from '../mongo-accounts';
import { findTransactionsByAccount } from '../../transactions/mongo-transactions';

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
  const { accountNumber } = req.query;

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

    // Get account transactions (limit to 10 for performance)
    const transactions = await findTransactionsByAccount(account._id!.toString(), 10);

    // Map backend fields to frontend fields for account
    const mappedAccount = {
      account_number: account.accountNumber,
      account_type: account.type,
      balance: account.balance,
      currency: account.currency,
      status: account.status,
      opened_date: account.createdAt,
      available_balance: account.balance, // or use a different field if available
    };
    // Wrap transactions in { count, results }
    return res.status(200).json({ 
      account: mappedAccount,
      transactions: { count: transactions.length, results: transactions }
    });

  } catch (error) {
    console.error('Error fetching account details:', error);
    return res.status(500).json({ message: 'Failed to fetch account details' });
  }
} 