import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // For now, always return an empty list of transactions
    return res.status(200).json({ count: 0, results: [] });
  }
  return res.status(405).json({ message: 'Method not allowed' });
} 