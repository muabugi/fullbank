import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient } from '../../utils/mongo';
import { verifyJwt } from '../../auth/jwt';

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
  const client = await getMongoClient();
  const db = client.db();
  const cards = db.collection('cards');
  const users = db.collection('users');
  const adminUser = await users.findOne({ _id: payload.id });
  if (!adminUser || !adminUser.is_admin) {
    return res.status(403).json({ message: 'Admins only' });
  }
  const { cardNumber } = req.query;
  if (req.method === 'DELETE') {
    const result = await cards.deleteOne({ card_number: cardNumber });
    if (result.deletedCount === 1) {
      return res.status(200).json({ message: 'Card deleted' });
    } else {
      return res.status(404).json({ message: 'Card not found' });
    }
  }
  if (req.method === 'PATCH') {
    const update = req.body;
    delete update._id;
    const result = await cards.updateOne({ card_number: cardNumber }, { $set: update });
    if (result.matchedCount === 1) {
      return res.status(200).json({ message: 'Card updated' });
    } else {
      return res.status(404).json({ message: 'Card not found' });
    }
  }
  return res.status(405).json({ message: 'Method not allowed' });
} 