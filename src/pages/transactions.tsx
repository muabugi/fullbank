import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { formatCurrency, formatDate } from '@/utils'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  currency: string
  status: string
  created_at: string
  description: string
}

export default function Transactions() {
  const { data, isLoading } = useQuery<{ results: Transaction[] }>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/api/transactions/history')
      return response.data
    },
  })

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : !data?.results?.length ? (
        <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
      ) : (
        <ul className="divide-y divide-border bg-card rounded-md shadow">
          {data.results.map((tx) => {
            const type = (tx.transaction_type || '').toLowerCase();
            const isDeposit = ['deposit', 'credit'].includes(type);
            const isWithdrawal = ['withdrawal', 'debit'].includes(type);
            return (
              <li key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-medium">{tx.description || tx.transaction_type}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</div>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  {isDeposit && <ArrowDownLeft className="inline w-4 h-4 text-green-600 mr-1" />}
                  {isWithdrawal && <ArrowUpRight className="inline w-4 h-4 text-red-600 mr-1" />}
                  <span className={isDeposit ? 'text-green-600' : isWithdrawal ? 'text-red-600' : ''}>
                    {isDeposit ? '+' : isWithdrawal ? '-' : ''}{formatCurrency(tx.amount)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
} 