import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { formatCurrency, formatDate } from '@/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, History, AlertCircle, ArrowRightLeft } from 'lucide-react'
import Link from "next/link"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KYCVerificationDialog } from '@/components/kyc-verification-dialog'
import { useEffect } from 'react'
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'next/router';

interface Account {
  account_number: string
  account_type: string
  balance: number
  currency: string
  status: string
}

interface UserProfile {
  email: string
  first_name: string
  last_name: string
  kyc_status: string
}

export default function Dashboard() {
  // Fetch user profile to check KYC status
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/api/accounts/users/me')
      return response.data
    },
  })

  // Fetch user's accounts
  const { data: accountsData } = useQuery<{
    count: number
    results: Account[]
  }>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts')
      return response.data
    },
  })

  // Fetch recent transactions
  const { data: transactionsData } = useQuery<{
    count: number
    results: Array<{
      id: number
      transaction_type: string
      amount: number
      currency: string
      status: string
      created_at: string
      description: string
    }>
  }>({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const response = await api.get('/api/transactions/recent')
      return response.data
    },
  })

  // Calculate totals
  const totalBalance = accountsData?.results?.reduce
    ? accountsData.results.reduce((sum, account) => sum + account.balance, 0)
    : 0;
  const activeAccounts = accountsData?.results?.filter
    ? accountsData.results.filter((acc) => acc.status?.toLowerCase() === 'active').length
    : 0;
  const closedAccounts = accountsData?.results?.filter
    ? accountsData.results.filter((acc) => acc.status?.toLowerCase() === 'closed').length
    : 0;

  // Show a warning if activeAccounts is not as expected (for debugging)
  useEffect(() => {
    if (activeAccounts !== 2) {
      console.warn('[DASHBOARD][DEBUG] Active accounts count is', activeAccounts, 'but expected 2. Raw accounts:', accountsData?.results);
    }
  }, [activeAccounts, accountsData]);

  // Deep debug logging for accounts and calculations
  useEffect(() => {
    console.log('[DASHBOARD][DEBUG] Raw accountsData:', accountsData);
    if (accountsData && accountsData.results && accountsData.results.length === 0) {
      console.warn('[DASHBOARD][DEBUG] No accounts found for this user!');
    }
    if (accountsData && !Array.isArray(accountsData.results)) {
      console.error('[DASHBOARD][DEBUG] accountsData.results is not an array:', accountsData.results);
    }
    console.log('[DASHBOARD][DEBUG] totalBalance:', totalBalance);
    console.log('[DASHBOARD][DEBUG] activeAccounts:', activeAccounts);
    console.log('[DASHBOARD][DEBUG] closedAccounts:', closedAccounts);
  }, [accountsData, totalBalance, activeAccounts, closedAccounts]);

  const { theme } = useTheme();
  const router = useRouter();

  return (
    <div className="space-y-6">
      {userProfile?.kyc_status !== 'VERIFIED' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Please complete your KYC verification to access all banking features.</span>
            <KYCVerificationDialog
              trigger={
                <Button variant="outline" size="sm">
                  Complete KYC
                </Button>
              }
            />
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance Card */}
        <Card className="rounded-2xl shadow-xl border-0 text-white bg-gradient-to-br from-[#232526] to-[#414345]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                totalBalance
              )}
            </div>
            <p className="text-xs text-white/70">
              Across {accountsData?.count || 0} accounts
            </p>
          </CardContent>
        </Card>

        {/* Active Accounts Card */}
        <Card className="rounded-2xl shadow-xl border-0 text-white bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#203a43]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CreditCard className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeAccounts}
            </div>
            <p className="text-xs text-white/70">
              {closedAccounts} closed accounts
            </p>
          </CardContent>
        </Card>

        {/* Recent Transactions Card */}
        <Card className="rounded-2xl shadow-xl border-0 text-white bg-gradient-to-br from-[#ffaf7b] via-[#d76d77] to-[#3a1c71]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <History className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transactionsData?.count || 0}</div>
            <p className="text-xs text-white/70">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        {/* KYC Status Card */}
        <Card className="rounded-2xl shadow-xl border-0 text-white bg-gradient-to-br from-[#43cea2] to-[#185a9d]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
            <AlertCircle className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">
              {userProfile?.kyc_status?.toLowerCase() || 'Not Started'}
            </div>
            <p className="text-xs text-white/70">
              {userProfile?.kyc_status === 'VERIFIED' ? 'Fully verified' : 'Verification required'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="flex gap-6 justify-center my-8">
        <div
          className={`flex-1 flex flex-col items-center p-6 rounded-xl border transition-all duration-200 cursor-pointer shadow-md 
           ${theme === 'dark'
             ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
             : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-white'}
         hover:border-black hover:shadow-lg hover:scale-105`}
         onClick={() => router.push('/accounts')}
       >
         <ArrowRightLeft className="w-8 h-8 mb-2" />
         <span className="font-medium">Transfer Money</span>
       </div>
       <div
         className={`flex-1 flex flex-col items-center p-6 rounded-xl border transition-all duration-200 cursor-pointer shadow-md 
           ${theme === 'dark'
             ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
             : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-white'}
         hover:border-black hover:shadow-lg hover:scale-105`}
         onClick={() => router.push('/payments')}
       >
         <CreditCard className="w-8 h-8 mb-2" />
         <span className="font-medium">Pay a Bill</span>
       </div>
     </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest account activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsData?.results && transactionsData.results.length > 0 ? (
              <div className="space-y-4">
                {transactionsData.results.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'CREDIT'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        }`}
                      >
                        {transaction.transaction_type === 'CREDIT' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-medium ${
                        transaction.transaction_type === 'CREDIT'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.transaction_type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent transactions</p>
            )}
            <div className="mt-4">
              <Button
                className={`w-full font-semibold transition-colors duration-150 ${
                  theme === 'dark'
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
                asChild
              >
                <Link href="/transactions">View All Transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>
              Overview of your banking accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accountsData?.results?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accountsData.results.map((account, idx) => {
                  // Pick a gradient based on index for variety
                  const gradients = [
                    'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
                    'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
                    'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                    'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)',
                    'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)',
                  ];
                  const gradient = gradients[idx % gradients.length];
                  return (
                    <div
                      key={account.account_number}
                      className="rounded-2xl shadow-xl p-5 text-white relative overflow-hidden min-h-[120px] flex flex-col justify-between"
                      style={{ background: gradient }}
                    >
                      <div className="flex flex-row justify-between items-center">
                        <div>
                          <div className="text-xs opacity-80">Account</div>
                          <div className="font-mono text-lg tracking-widest select-all">
                            ••••{account.account_number.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-80">Type</div>
                          <div className="font-semibold text-base capitalize">{account.account_type}</div>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between items-end mt-4">
                        <div>
                          <div className="text-xs opacity-80">Balance</div>
                          <div className="font-bold text-xl">{formatCurrency(account.balance)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-80">Status</div>
                          <div className="font-semibold text-base capitalize">{account.status.toLowerCase()}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No accounts found</p>
            )}
            <div className="mt-4">
              <Button
                className={`w-full font-semibold transition-colors duration-150 ${
                  theme === 'dark'
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
                asChild
              >
                <Link href="/accounts">View All Accounts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 