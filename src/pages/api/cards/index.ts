import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../auth/jwt';
import { getMongoClient } from '../utils/mongo';
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
  const userId = payload.id as string;
  const client = await getMongoClient();
  const db = client.db();
  const users = db.collection('users');
  const cardsCol = db.collection('cards');
  const user = await users.findOne({ _id: new ObjectId(userId) });

  if (req.method === 'POST') {
    // Create card in MongoDB, prevent duplicate for account_number
    const { card_holder_name, card_type, card_network, account_number, expiry_date } = req.body;
    // Check for duplicate card for this account
    const existingCard = await cardsCol.findOne({ account_number });
    if (existingCard) {
      return res.status(400).json({ message: 'Account already has a card. Please select another account.' });
    }
    const newCard = {
      card_holder_name,
      card_type,
      card_network,
      account_number,
      expiry_date,
      status: 'ACTIVE',
      createdAt: new Date(),
      userId: userId,
    };
    const result = await cardsCol.insertOne(newCard);
    return res.status(201).json({ ...newCard, _id: result.insertedId });
  }

  if (req.method === 'GET') {
    const targetUserId = req.query.userId as string;
    
    if (user && user.is_admin) {
      // Admin: return cards based on targetUserId if provided, otherwise all cards
      let cards;
      if (targetUserId) {
        // Filter cards for specific user
        cards = await cardsCol.find({ userId: targetUserId }).toArray();
      } else {
        // Return all cards
        cards = await cardsCol.find({}).toArray();
      }
      return res.status(200).json({ count: cards.length, results: cards });
    } else {
      // Regular user: return only their cards
      const userCards = await cardsCol.find({ userId }).toArray();
      return res.status(200).json({ count: userCards.length, results: userCards });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 