import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from './jwt';
import { findUserById } from './mongo-users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json({ id: user._id, email: user.email, name: user.name, createdAt: user.createdAt, is_admin: user.is_admin });
} 