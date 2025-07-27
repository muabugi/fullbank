import { useRouter } from "next/router"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import { formatCurrency, formatDate } from '@/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, Download, CreditCard, Send, Wallet, Filter, Trash2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransactionFilters } from '@/components/transaction-filters'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CloseAccountDialog } from '@/components/close-account-dialog'
import { useToast } from '@/components/ui/use-toast'

interface Account {
  account_number: string
  account_type: string
  balance: number
  currency: string
  status: string
  opened_date: string
  interest_rate: string
  minimum_balance: string
  available_balance: number
}

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  currency: string
  status: string
  created_at: string
  description: string
}

export default function AccountDetails() {
  const router = useRouter()
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: undefined,
    endDate: undefined,
    type: '',
    minAmount: '',
    maxAmount: '',
    category: '',
    search: ''
  })
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch account details
  const { data, isLoading: isLoadingAccount, error: accountError } = useQuery({
    queryKey: ['account', router.query.accountNumber],
    queryFn: async () => {
      const response = await api.get(`/api/accounts/${router.query.accountNumber}`)
      return response.data
    },
    enabled: !!router.query.accountNumber,
  })
  const account = data?.account;
  const transactionsData = data?.transactions;

  // Fetch user's other accounts for transfers
  const { data: otherAccounts } = useQuery<Account[]>({
    queryKey: ['other-accounts', router.query.accountNumber],
    queryFn: async () => {
      const response = await api.get('/api/accounts')
      return response.data.results.filter((acc: Account) => acc.account_number !== router.query.accountNumber)
    },
    enabled: !!router.query.accountNumber,
  })

  if (accountError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load account details. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/accounts')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Accounts
        </Button>
      </div>
    )
  }

  if (isLoadingAccount || !account || !account.account_number) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Account not found.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/accounts')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Accounts
        </Button>
      </div>
    )
  }

  const handleDeposit = async () => {
    try {
      await api.post(`/api/accounts/${router.query.accountNumber}/deposit`, {
        amount: parseFloat(amount),
        currency: account.currency,
      })
      setIsDepositOpen(false)
      setAmount('')
      // Refresh account data
      // You might want to use queryClient.invalidateQueries here
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  const handleWithdraw = async () => {
    try {
      await api.post(`/api/accounts/${router.query.accountNumber}/withdraw`, {
        amount: parseFloat(amount),
        currency: account.currency,
      })
      setIsWithdrawOpen(false)
      setAmount('')
      // Refresh account data
    } catch (error) {
      console.error('Withdrawal failed:', error)
    }
  }

  const handleTransfer = async () => {
    try {
      await api.post(`/api/accounts/${router.query.accountNumber}/transfer`, {
        to_account: selectedAccount,
        amount: parseFloat(amount),
        currency: account.currency,
      })
      setIsTransferOpen(false)
      setAmount('')
      setSelectedAccount('')
      // Refresh account data
      queryClient.invalidateQueries({ queryKey: ['account', router.query.accountNumber] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      
      // Show PayPal-style success notification
      toast({
        title: "Transfer Confirmed",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-800 dark:text-green-200">
              Successfully transferred {formatCurrency(parseFloat(amount))} to account {selectedAccount}
            </span>
          </div>
        ),
        className: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      })
    } catch (error) {
      console.error('Transfer failed:', error)
      // Show error notification
      toast({
        title: "Transfer Failed",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800 dark:text-red-200">
              There was a problem processing the transfer.
            </span>
          </div>
        ),
        className: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      })
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button onClick={() => router.push('/accounts')} variant="outline" className="w-full md:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Accounts
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {account.status !== 'CLOSED' ? (
            <>
              {account.status === 'blocked' && (
                <Alert className="w-full mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This account has been locked for security reasons. Transfers are disabled.
                  </AlertDescription>
                </Alert>
              )}
              <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto border-2 hover:bg-green-50 dark:hover:bg-green-900/20">
                    <Wallet className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Make a Deposit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <Button onClick={handleDeposit} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Confirm Deposit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Wallet className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Make a Withdrawal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <Button onClick={handleWithdraw} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Confirm Withdrawal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-full sm:w-auto border-2 ${
                      account.status === 'blocked' 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                        : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    disabled={account.status === 'blocked'}
                  >
                    <Send className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                    Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Money</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="toAccount">Recipient Account Number</Label>
                      <Input
                        id="toAccount"
                        type="text"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        placeholder="Enter recipient's account number"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the account number of the person you want to send money to
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <Button onClick={handleTransfer} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Confirm Transfer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <CloseAccountDialog
                accountNumber={account.account_number}
                accountType={account.account_type}
                balance={account.balance}
                currency={account.currency}
                trigger={
                  <Button variant="outline" className="w-full sm:w-auto border-2 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                    Close Account
                  </Button>
                }
              />
            </>
          ) : (
            <Alert className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This account is closed and cannot be used for transactions.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">••••{account.account_number.slice(-4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium">{account.account_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-medium">{account.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${
                  account.status === 'blocked' 
                    ? 'text-red-600 dark:text-red-400' 
                    : account.status === 'active' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {account.status === 'blocked' ? 'BLOCKED' : account.status.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Interest Rate</p>
                <p className="font-medium">{account.interest_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Minimum Balance</p>
                <p className="font-medium">{formatCurrency(parseFloat(account.minimum_balance))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Opened Date</p>
                <p className="font-medium">{formatDate(account.opened_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(account.available_balance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
            </div>
            <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 border border-black dark:border-white">
              <Download className="w-4 h-4 mr-2" />
              Download Statement
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Recent Transactions</CardTitle>
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-xl">
              <TransactionFilters
                onFilterChange={(newFilters) => {
                  setFilters(newFilters)
                  setIsFiltersOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          {isLoadingAccount ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : transactionsData?.results.length ? (
            <div className="space-y-4">
              {transactionsData.results.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-lg gap-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => {
                    // You might want to add a transaction details dialog here
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.transaction_type === 'CREDIT'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-red-100 dark:bg-red-900'
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          transaction.transaction_type === 'CREDIT'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.transaction_type ? transaction.transaction_type[0] : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium dark:text-gray-100">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`font-medium ${
                        transaction.transaction_type === 'CREDIT'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.transaction_type === 'CREDIT' ? '+' : transaction.transaction_type === 'DEBIT' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'COMPLETED'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No transactions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 