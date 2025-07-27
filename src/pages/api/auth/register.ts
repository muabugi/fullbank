import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, findUserByEmail } from './mongo-users';
import { signJwt } from './jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password, name } = req.body;
  console.log('[REGISTER] Payload:', { email, password, name });
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const existing = await findUserByEmail(email);
  console.log('[REGISTER] Existing user:', existing);
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const user = await createUser(email, password, name, false);
  console.log('[REGISTER] Created user:', user);
  const token = signJwt({ id: user._id?.toString(), email: user.email });
  return res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
} 