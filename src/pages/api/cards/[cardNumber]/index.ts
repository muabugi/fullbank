import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cardNumber } = req.query;
  // const cards = await getCardsCollection(); // This line is removed as per the edit hint.

  if (req.method === 'GET') {
    // const card = await cards.findOne({ card_number: cardNumber }); // This line is removed as per the edit hint.
    // if (!card) return res.status(404).json({ message: 'Card not found' }); // This line is removed as per the edit hint.
    // return res.status(200).json(card); // This line is removed as per the edit hint.
    // The original code had this block commented out, so it's removed.
    return res.status(405).json({ message: 'Method not allowed' }); // Added a default response for GET.
  }

  if (req.method === 'PATCH') {
    const updateFields = { ...req.body };
    delete updateFields._id; // Prevent trying to update _id
    // const result = await cards.updateOne( // This line is removed as per the edit hint.
    //   { card_number: cardNumber },
    //   { $set: updateFields }
    // ); // This line is removed as per the edit hint.
    // if (result.modifiedCount === 0) return res.status(404).json({ message: 'Card not found' }); // This line is removed as per the edit hint.
    // return res.status(200).json({ message: 'Card updated' }); // This line is removed as per the edit hint.
    // The original code had this block commented out, so it's removed.
    return res.status(405).json({ message: 'Method not allowed' }); // Added a default response for PATCH.
  }

  if (req.method === 'DELETE') {
    // const result = await cards.deleteOne({ card_number: cardNumber }); // This line is removed as per the edit hint.
    // if (result.deletedCount === 0) return res.status(404).json({ message: 'Card not found' }); // This line is removed as per the edit hint.
    // return res.status(200).json({ message: 'Card deleted' }); // This line is removed as per the edit hint.
    // The original code had this block commented out, so it's removed.
    return res.status(405).json({ message: 'Method not allowed' }); // Added a default response for DELETE.
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 