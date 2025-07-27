import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, always return an empty list of transactions
  if (req.method === 'GET') {
    return res.status(200).json({ count: 0, results: [] });
  }
  return res.status(405).json({ message: 'Method not allowed' });
} 