import { getMongoClient } from '../utils/mongo';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export interface MongoUser {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  password?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  createdAt?: Date | string;
  is_admin?: boolean;
}

export async function createUser(email: string, password: string, name?: string, is_admin: boolean = false): Promise<MongoUser> {
  const client = await getMongoClient();
  const db = client.db();
  const users = db.collection('users');
  const passwordHash = await bcrypt.hash(password, 10);
  console.log('[createUser] passwordHash:', passwordHash);
  const user: MongoUser = { email, passwordHash, name, createdAt: new Date(), is_admin };
  const result = await users.insertOne(user);
  user._id = result.insertedId;
  return user;
}

export async function findUserByEmail(email: string): Promise<MongoUser | null> {
  const client = await getMongoClient();
  const db = client.db();
  const users = db.collection('users');
  return users.findOne({ email }) as Promise<MongoUser | null>;
}

export async function findUserById(id: string): Promise<MongoUser | null> {
  const client = await getMongoClient();
  const db = client.db();
  const users = db.collection('users');
  return users.findOne({ _id: new ObjectId(id) }) as Promise<MongoUser | null>;
}

export async function verifyUser(email: string, password: string): Promise<MongoUser | null> {
  const user = await findUserByEmail(email);
  if (user && user.passwordHash) {
    const match = await bcrypt.compare(password, user.passwordHash);
    console.log('[verifyUser] Password match:', match);
    if (match) return user;
  }
  return null;
} 