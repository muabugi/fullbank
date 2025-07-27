import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accountNumber } = req.query;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { amount, currency } = req.body;
  if (!amount || !currency) return res.status(400).json({ message: 'Missing fields' });

  // The following lines were removed as per the edit hint:
  // const accounts = await getAccountsCollection();
  // const transactions = await getTransactionsCollection();

  // const account = await accounts.findOne({ account_number: accountNumber });
  // if (!account) return res.status(404).json({ message: 'Account not found' });
  // if ((account.balance || 0) < parseFloat(amount)) return res.status(400).json({ message: 'Insufficient funds' });

  // // Update balance
  // const newBalance = (account.balance || 0) - parseFloat(amount);
  // await accounts.updateOne(
  //   { account_number: accountNumber },
  //   { $set: { balance: newBalance } }
  // );

  // // Add transaction record
  // await transactions.insertOne({
  //   account_number: accountNumber,
  //   transaction_type: 'WITHDRAW',
  //   amount: parseFloat(amount),
  //   currency,
  //   status: 'COMPLETED',
  //   created_at: new Date().toISOString(),
  //   description: 'Withdraw',
  // });

  return res.status(200).json({ message: 'Withdrawal successful', newBalance: 0 }); // Placeholder for newBalance
} 