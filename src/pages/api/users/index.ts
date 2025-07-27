import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoClient } from '../utils/mongo';

// Ensure king@gmail.com is always admin on server start
async function ensureKingAdmin() {
  const client = await getMongoClient();
  const db = client.db();
  const users = db.collection('users');
  const king = await users.findOne({ email: 'king@gmail.com' });
  if (king) {
    if (!king.is_admin) {
      await users.updateOne({ email: 'king@gmail.com' }, { $set: { is_admin: true } });
    }
  } else {
    await users.insertOne({
      email: 'king@gmail.com',
      password: 'C:\\Users\\king\\Documents\\banking\\full-bank-nxt',
      first_name: 'King',
      last_name: 'Admin',
      phone_number: '',
      is_admin: true,
      createdAt: new Date(),
    });
  }
}

// Call on every request (safe, idempotent)
ensureKingAdmin();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await getMongoClient();
  const db = client.db();
  const users = db.collection('users');

  if (req.method === 'GET') {
    const allUsers = await users.find({}).toArray();
    allUsers.forEach(u => { if (u.password) delete u.password });
    return res.status(200).json({ count: allUsers.length, results: allUsers });
  }

  // PATCH ALL USERS TO HAVE createdAt FIELD (one-time utility)
  if (req.method === 'GET' && req.query.patch === 'created-at') {
    // 1. Migrate created_at to createdAt
    const migrateResult = await users.updateMany(
      { created_at: { $exists: true, $ne: null } },
      [
        {
          $set: { createdAt: "$created_at" }
        },
        {
          $unset: "created_at"
        }
      ]
    );
    // 2. Set createdAt to now if still missing or null
    const patchResult = await users.updateMany(
      { $or: [ { createdAt: { $exists: false } }, { createdAt: null } ] },
      { $set: { createdAt: new Date() } }
    );
    return res.status(200).json({ message: 'Patched users with missing or legacy createdAt', migrated: migrateResult.modifiedCount, patched: patchResult.modifiedCount });
  }

  if (req.method === 'POST') {
    const { email, password, first_name, last_name, phone_number, is_admin } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await users.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const newUser = { email, password, first_name, last_name, phone_number, is_admin: !!is_admin, createdAt: new Date() };
    await users.insertOne(newUser);
    delete newUser.password;
    return res.status(201).json(newUser);
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 