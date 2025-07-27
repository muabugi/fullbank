import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from './auth/jwt';
import { getMongoClient } from './utils/mongo';
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

  if (req.method === 'GET') {
  const userId = payload.id as string;
  try {
    const client = await getMongoClient();
    const db = client.db();
    const notifications = db.collection('notifications');
    const results = await notifications.find({ userId }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ count: results.length, results });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
  }

  if (req.method === 'POST') {
    // Debug logging
    console.log('[NOTIFICATIONS][POST] Payload:', payload);
    console.log('[NOTIFICATIONS][POST] Body:', req.body);
    // Look up user in DB for admin check
    try {
      const client = await getMongoClient();
      const db = client.db();
      const users = db.collection('users');
      const adminUser = await users.findOne({ _id: new ObjectId(payload.id) });
      console.log('[NOTIFICATIONS][POST] DB user:', adminUser);
      if (!adminUser || !adminUser.is_admin) {
        console.log('[NOTIFICATIONS][POST] Forbidden: Not admin (DB check)');
        return res.status(403).json({ message: 'Forbidden: Admins only' });
      }
      const { userId, title, message } = req.body;
      if (!userId || !title || !message) {
        console.log('[NOTIFICATIONS][POST] Missing fields');
        return res.status(400).json({ message: 'userId, title, and message are required' });
      }
      const notifications = db.collection('notifications');
      const doc = {
        userId,
        title,
        message,
        createdAt: new Date(),
        read: false,
      };
      const result = await notifications.insertOne(doc);
      console.log('[NOTIFICATIONS][POST] Notification created:', doc);
      return res.status(201).json({ notification: { ...doc, _id: result.insertedId } });
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ message: 'Failed to create notification' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 