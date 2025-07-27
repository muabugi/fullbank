import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyUser, findUserByEmail } from './mongo-users';
import { signJwt } from './jwt';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  console.log('[LOGIN] Payload:', { email, password });
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await findUserByEmail(email);
  console.log('[LOGIN] User from DB:', user);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Handle both old (plain password) and new (passwordHash) user formats
  let passwordMatch = false;
  if (user.passwordHash) {
    // New format: compare with hashed password
    passwordMatch = await bcrypt.compare(password, user.passwordHash);
  } else if (user.password) {
    // Old format: compare plain passwords
    passwordMatch = password === user.password;
  }
  
  console.log('[LOGIN] Password match:', passwordMatch);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signJwt({ id: user._id?.toString(), email: user.email, is_admin: user.is_admin });
  return res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name } });
} 