import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev-secret';

export function signJwt(payload: string | object | Buffer, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
} 