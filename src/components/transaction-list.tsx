import { formatCurrency, formatDate, cn } from '@/utils'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  currency: string
  status: string
  created_at: string
  description: string
  account_number: string
  reference_number: string
  category: string
  metadata?: {
    from_account?: string
    to_account?: string
    category?: string
    location?: string
  }
}

interface TransactionListProps {
  transactions: Transaction[]
  getStatusIcon: (status: string) => React.ReactNode
  getStatusColor: (status: string) => string
  onTransactionClick?: (transaction: Transaction) => void
}

export function TransactionList({ 
  transactions, 
  getStatusIcon, 
  getStatusColor,
  onTransactionClick 
}: TransactionListProps) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => onTransactionClick?.(transaction)}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                transaction.transaction_type === 'CREDIT'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  transaction.transaction_type === 'CREDIT'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.transaction_type[0]}
              </span>
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-gray-500">
                {formatDate(transaction.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <p className={`font-medium ${
              transaction.transaction_type === 'CREDIT'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {transaction.transaction_type === 'CREDIT' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
            <Badge className={cn(getStatusColor(transaction.status))}>
              {getStatusIcon(transaction.status)}
              <span className="ml-1 capitalize">{transaction.status.toLowerCase()}</span>
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
} 