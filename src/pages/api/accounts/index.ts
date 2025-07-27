import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../auth/jwt';
import { createAccount, findAccountsByUser } from './mongo-accounts';
import { getMongoClient } from '../utils/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[ACCOUNTS] Request method:', req.method);
  console.log('[ACCOUNTS] Request body:', req.body);
  console.log('[ACCOUNTS] Request headers:', req.headers);

  // Try to get JWT from Authorization header
  let token: string | null = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.slice(7);
    console.log('[ACCOUNTS] Token from Authorization header:', token.substring(0, 20) + '...');
  } else if (req.cookies && req.cookies['next-auth.session-token']) {
    token = req.cookies['next-auth.session-token'];
    console.log('[ACCOUNTS] Token from next-auth.session-token cookie:', token.substring(0, 20) + '...');
  } else {
    console.log('[ACCOUNTS] No valid authorization header or session cookie');
    return res.status(401).json({ message: 'No token provided' });
  }

  const payload = verifyJwt(token);
  console.log('[ACCOUNTS] JWT payload:', payload);
  
  if (!payload || typeof payload !== 'object' || !('id' in payload)) {
    console.log('[ACCOUNTS] Invalid JWT payload');
    return res.status(401).json({ message: 'Invalid token' });
  }

  const userId = payload.id as string;
  console.log('[ACCOUNTS] User ID:', userId);

  if (req.method === 'GET') {
    // Get user's accounts or all accounts if admin and adminView=true
    try {
      const client = await getMongoClient();
      const db = client.db();
      const usersCol = db.collection('users');
      const user = await usersCol.findOne({ _id: new ObjectId(userId) });
      const isAdminView = req.query.adminView === 'true';
      const targetUserId = req.query.userId as string;
      
      if (user && user.is_admin && isAdminView) {
        // Admin: return accounts based on targetUserId if provided, otherwise all accounts
        let accounts;
        if (targetUserId) {
          // Filter accounts for specific user
          accounts = await db.collection('accounts').find({ userId: targetUserId }).toArray();
        } else {
          // Return all accounts
          accounts = await db.collection('accounts').find({}).toArray();
        }
        
        // Fetch all users for email lookup
        const usersArr = await db.collection('users').find({}).toArray();
        const userMap = Object.fromEntries(usersArr.map(u => [u._id?.toString(), u.email]));
        const mappedAccounts = accounts.map((a) => ({
          account_number: a.accountNumber,
          account_type: a.type,
          balance: a.balance,
          currency: a.currency,
          status: a.status,
          opened_date: a.createdAt,
          userId: a.userId,
          userEmail: userMap[(typeof a.userId === 'string' ? a.userId : a.userId?.toString())] || '',
        }));
        return res.status(200).json({ count: mappedAccounts.length, results: mappedAccounts });
      } else {
        // Regular user or admin not in adminView: return only their accounts
      const accounts = await findAccountsByUser(userId);
      const mappedAccounts = accounts.map((a) => ({
        account_number: a.accountNumber,
        account_type: a.type,
        balance: a.balance,
        currency: a.currency,
        status: a.status,
        opened_date: a.createdAt,
      }));
      return res.status(200).json({ count: mappedAccounts.length, results: mappedAccounts });
      }
    } catch (error) {
      console.error('[ACCOUNTS] Error fetching accounts:', error);
      return res.status(500).json({ message: 'Failed to fetch accounts' });
    }
  }

  if (req.method === 'POST') {
    // Create new account - handle both frontend and backend field names
    const { type, account_type, initialDeposit, initial_deposit, userId: targetUserId } = req.body;
    
    // Use frontend field names if backend names are not provided
    let accountType = type || (account_type ? account_type.toLowerCase() : null);
    if (accountType === 'fixed_deposit') accountType = 'fixed';
    const deposit = initialDeposit || (initial_deposit ? parseFloat(initial_deposit) : 0);
    
    console.log('[ACCOUNTS] Creating account with:', { accountType, deposit, targetUserId });
    
    if (!accountType || !['savings', 'checking', 'business', 'fixed'].includes(accountType)) {
      console.log('[ACCOUNTS] Invalid account type:', accountType);
      return res.status(400).json({ message: 'Valid account type is required (savings, checking, business, or fixed)' });
    }

    try {
      // Check if admin is creating account for another user
      let accountUserId = userId;
      if (targetUserId) {
        const client = await getMongoClient();
        const db = client.db();
        const usersCol = db.collection('users');
        const currentUser = await usersCol.findOne({ _id: new ObjectId(userId) });
        
        if (!currentUser || !currentUser.is_admin) {
          console.log('[ACCOUNTS] Non-admin user trying to create account for another user');
          return res.status(403).json({ message: 'Only admins can create accounts for other users' });
        }
        
        // Verify target user exists
        const targetUser = await usersCol.findOne({ _id: new ObjectId(targetUserId) });
        if (!targetUser) {
          console.log('[ACCOUNTS] Target user not found:', targetUserId);
          return res.status(404).json({ message: 'Target user not found' });
        }
        
        accountUserId = targetUserId;
        console.log('[ACCOUNTS] Admin creating account for user:', accountUserId);
      }

      console.log('[ACCOUNTS] Creating account for user:', accountUserId);
      const account = await createAccount(accountUserId, accountType as 'savings' | 'checking' | 'business' | 'fixed', deposit);
      console.log('[ACCOUNTS] Account created:', account);
      return res.status(201).json({ account });
    } catch (error) {
      console.error('[ACCOUNTS] Error creating account:', error);
      return res.status(500).json({ message: 'Failed to create account' });
    }
  }

  console.log('[ACCOUNTS] Method not allowed:', req.method);
  return res.status(405).json({ message: 'Method not allowed' });
} 