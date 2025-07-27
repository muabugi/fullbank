import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient } from '../../utils/mongo';
import { verifyJwt } from '../../auth/jwt';
import { ObjectId } from 'mongodb';

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
  const transactions = db.collection('transactions');
  const users = db.collection('users');
  const adminUser = await users.findOne({ _id: new ObjectId(payload.id) });
  if (!adminUser || !adminUser.is_admin) {
    return res.status(403).json({ message: 'Admins only' });
  }
  const { id } = req.query;
  if (req.method === 'DELETE') {
    const result = await transactions.deleteOne({ _id: new ObjectId(id as string) });
    if (result.deletedCount === 1) {
      return res.status(200).json({ message: 'Tax transaction deleted' });
    } else {
      return res.status(404).json({ message: 'Tax transaction not found' });
    }
  }
  if (req.method === 'PATCH') {
    const update = req.body;
    delete update._id;
    const result = await transactions.updateOne({ _id: new ObjectId(id as string) }, { $set: update });
    if (result.matchedCount === 1) {
      return res.status(200).json({ message: 'Tax transaction updated' });
    } else {
      return res.status(404).json({ message: 'Tax transaction not found' });
    }
  }
  return res.status(405).json({ message: 'Method not allowed' });
} 