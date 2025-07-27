import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient } from '../../utils/mongo';
import { verifyJwt } from '../../auth/jwt';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('[ADMIN] No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = auth.slice(7);
  const payload = verifyJwt(token);
  console.log('[ADMIN] JWT payload:', payload);
  if (!payload || typeof payload !== 'object' || !('id' in payload)) {
    console.log('[ADMIN] Invalid token or payload:', payload);
    return res.status(401).json({ message: 'Invalid token' });
  }
  const client = await getMongoClient();
  const db = client.db();
  const accounts = db.collection('accounts');
  const users = db.collection('users');
  const adminUser = await users.findOne({ _id: new ObjectId(payload.id) });
  console.log('[ADMIN] Looking up user with _id:', payload.id);
  console.log('[ADMIN] User found:', adminUser);
  if (!adminUser || !adminUser.is_admin) {
    console.log('[ADMIN] User is not admin or not found:', adminUser);
    return res.status(403).json({ message: 'Admins only' });
  }
  const { accountNumber } = req.query;
  if (req.method === 'DELETE') {
    const result = await accounts.deleteOne({ accountNumber });
    if (result.deletedCount === 1) {
      return res.status(200).json({ message: 'Account deleted' });
    } else {
      return res.status(404).json({ message: 'Account not found' });
    }
  }
  if (req.method === 'PATCH') {
    const update = req.body;
    delete update._id;
    const result = await accounts.updateOne({ accountNumber }, { $set: update });
    if (result.matchedCount === 1) {
      return res.status(200).json({ message: 'Account updated' });
    } else {
      return res.status(404).json({ message: 'Account not found' });
    }
  }
  return res.status(405).json({ message: 'Method not allowed' });
} 