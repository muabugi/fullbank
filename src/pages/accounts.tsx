import { useQuery } from '@tanstack/react-query'
import { useRouter } from "next/router"
import { api } from '../api'
import { formatCurrency, formatDate } from '@/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context';

interface Account {
  account_number: string
  account_type: string
  balance: number
  currency: string
  status: string
  opened_date: string
}

export default function Accounts() {
  const router = useRouter()
  const { data: accountsData, isLoading } = useQuery<{
    count: number
    results: Account[]
  }>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts')
      console.log('Fetched accounts data:', response.data)
      return response.data
    },
  })

  const accounts = accountsData?.results || []
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  console.log('Accounts to display:', accounts)

  const { theme } = useTheme();

  return (
    <div className="container py-8 space-y-8">
      {/* Total Balance Summary Card */}
      <div className="mb-6">
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-0 p-6 flex flex-col items-start justify-center min-h-[120px]">
          <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#232526_10%,_#414345_40%,_#bfc1c2_70%,_#232526_100%)] opacity-90"></div>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full blur-2xl opacity-40 animate-shine" />
          </div>
          <div className="relative z-20">
            <div className="text-xs uppercase tracking-widest text-gray-200 mb-2">Total Balance</div>
            <div className="text-3xl font-bold text-white drop-shadow">{formatCurrency(totalBalance)}</div>
            <div className="text-xs text-gray-300 mt-1">Across {accounts.length} accounts</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts and view balances.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-[60px] bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-[120px] bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-[80px] bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : accounts.length > 0 ? (
          // Account cards
          accounts.map((account) => (
            <Card
              key={account.account_number}
              className="group cursor-pointer hover:shadow-2xl transition-shadow relative overflow-hidden border-0"
              onClick={() => router.push(`/accounts/${account.account_number}`)}
            >
              {/* Animated shiny gradient background */}
              <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#232526_10%,_#414345_40%,_#bfc1c2_70%,_#232526_100%)] opacity-90"></div>
              {/* Shiny overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full blur-2xl opacity-40 animate-shine" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20">
                <CardTitle className="text-sm font-medium text-white drop-shadow">
                  {account.account_type}
                </CardTitle>
                <span className="text-xs text-gray-200 drop-shadow">
                  ••••{account.account_number.slice(-4)}
                </span>
              </CardHeader>
              <CardContent className="relative z-20">
                <div className="text-2xl font-bold text-white drop-shadow">
                  {formatCurrency(account.balance)}
                </div>
                <p className="text-xs text-gray-200">Available Balance</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    Created: {formatDate(account.opened_date)}
                  </span>
                  <span className="text-xs text-gray-300">
                    {account.currency}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Empty state
          <div className="col-span-full">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">You don't have any accounts yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first account to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 