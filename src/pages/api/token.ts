import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient } from './utils/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const client = await getMongoClient();
    const db = client.db();
    const users = db.collection('users');
    const user = await users.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For now, just return a dummy token
    return res.status(200).json({
      access: 'dummy-access-token',
      refresh: 'dummy-refresh-token',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
} 