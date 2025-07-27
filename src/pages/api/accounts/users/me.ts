import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../auth/jwt';
import { findUserById } from '../../auth/mongo-users';

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

  const user = await findUserById(payload.id as string);
  console.log('[DEBUG][ACCOUNTS/USERS/ME] user from DB:', user);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  console.log('[DEBUG][ACCOUNTS/USERS/ME] user.createdAt:', user.createdAt, 'typeof:', typeof user.createdAt);

  return res.status(200).json({ 
    id: user._id, 
    email: user.email, 
    name: user.name,
    first_name: user.first_name,
    last_name: user.last_name,
    createdAt: user.createdAt
      ? (typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString())
      : ((user as any).created_at ? (user as any).created_at : null)
  });
} 