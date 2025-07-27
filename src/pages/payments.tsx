import { useQuery } from '@tanstack/react-query'
import { useRouter } from "next/router"
import { api } from '../api'
import { formatCurrency, formatDate } from '@/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { 
  CreditCard, 
  DollarSign, 
  Send, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Zap,
  Building2,
  Home,
  Car,
  ShoppingCart,
  Wifi,
  Phone,
  GraduationCap,
  Heart,
  Plane
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/contexts/theme-context'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'wallet'
  name: string
  number: string
  expiry?: string
  isDefault: boolean
}

interface PaymentHistory {
  id: string
  type: 'sent' | 'received' | 'bill' | 'transfer'
  amount: number
  currency: string
  description: string
  status: 'completed' | 'pending' | 'failed'
  date: string
  recipient?: string
  category?: string
}

interface QuickPayment {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

export default function Payments() {
  const router = useRouter()
  const { toast } = useToast()
  const { theme } = useTheme()
  const [showNewPayment, setShowNewPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    type: 'transfer',
    amount: '',
    currency: 'USD',
    description: '',
    recipient: '',
    paymentMethod: ''
  })

  // Mock data - in real app, this would come from API
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'Visa ending in 4242',
      number: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      name: 'Checking Account',
      number: '****1234',
      isDefault: false
    }
  ]

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      type: 'sent',
      amount: 150.00,
      currency: 'USD',
      description: 'Payment to John Doe',
      status: 'completed',
      date: '2024-06-01',
      recipient: 'john.doe@email.com',
      category: 'Personal'
    },
    {
      id: '2',
      type: 'bill',
      amount: 89.99,
      currency: 'USD',
      description: 'Electricity Bill',
      status: 'completed',
      date: '2024-05-28',
      category: 'Utilities'
    },
    {
      id: '3',
      type: 'received',
      amount: 2500.00,
      currency: 'USD',
      description: 'Salary Payment',
      status: 'completed',
      date: '2024-05-25',
      category: 'Income'
    },
    {
      id: '4',
      type: 'transfer',
      amount: 500.00,
      currency: 'USD',
      description: 'Transfer to Savings',
      status: 'pending',
      date: '2024-05-24',
      category: 'Transfer'
    }
  ]

  const quickPayments: QuickPayment[] = [
    { id: '1', name: 'Bills', icon: 'Building2', description: 'Pay utilities & services', color: 'from-blue-500 to-blue-600' },
    { id: '2', name: 'Transfer', icon: 'Send', description: 'Send money to anyone', color: 'from-green-500 to-green-600' },
    { id: '3', name: 'Shopping', icon: 'ShoppingCart', description: 'Online & retail payments', color: 'from-purple-500 to-purple-600' },
    { id: '4', name: 'Transport', icon: 'Car', description: 'Fuel, parking & rides', color: 'from-orange-500 to-orange-600' },
    { id: '5', name: 'Entertainment', icon: 'Heart', description: 'Movies, dining & fun', color: 'from-pink-500 to-pink-600' },
    { id: '6', name: 'Travel', icon: 'Plane', description: 'Flights & accommodation', color: 'from-indigo-500 to-indigo-600' }
  ]

  const totalSpent = paymentHistory
    .filter(p => p.type === 'sent' || p.type === 'bill')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalReceived = paymentHistory
    .filter(p => p.type === 'received')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = paymentHistory.filter(p => p.status === 'pending').length

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle payment submission
    toast({
      title: "Payment initiated",
      description: `$${paymentForm.amount} payment to ${paymentForm.recipient} has been initiated.`,
    })
    setShowNewPayment(false)
    setPaymentForm({
      type: 'transfer',
      amount: '',
      currency: 'USD',
      description: '',
      recipient: '',
      paymentMethod: ''
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <Send className="w-4 h-4 text-red-500" />
      case 'received':
        return <Download className="w-4 h-4 text-green-500" />
      case 'bill':
        return <Building2 className="w-4 h-4 text-blue-500" />
      case 'transfer':
        return <Zap className="w-4 h-4 text-purple-500" />
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Payment Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Spent */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-0 p-6 flex flex-col items-start justify-center min-h-[120px]">
          <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#ff6b6b_10%,_#ee5a24_40%,_#ff6348_70%,_#ff6b6b_100%)] opacity-90"></div>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full blur-2xl opacity-40 animate-shine" />
          </div>
          <div className="relative z-20">
            <div className="text-xs uppercase tracking-widest text-gray-200 mb-2">Total Spent</div>
            <div className="text-3xl font-bold text-white drop-shadow">{formatCurrency(totalSpent)}</div>
            <div className="text-xs text-gray-300 mt-1">This month</div>
          </div>
        </div>

        {/* Total Received */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-0 p-6 flex flex-col items-start justify-center min-h-[120px]">
          <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#00b894_10%,_#00cec9_40%,_#55a3ff_70%,_#00b894_100%)] opacity-90"></div>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full blur-2xl opacity-40 animate-shine" />
          </div>
          <div className="relative z-20">
            <div className="text-xs uppercase tracking-widest text-gray-200 mb-2">Total Received</div>
            <div className="text-3xl font-bold text-white drop-shadow">{formatCurrency(totalReceived)}</div>
            <div className="text-xs text-gray-300 mt-1">This month</div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-0 p-6 flex flex-col items-start justify-center min-h-[120px]">
          <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#fdcb6e_10%,_#e17055_40%,_#fab1a0_70%,_#fdcb6e_100%)] opacity-90"></div>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full blur-2xl opacity-40 animate-shine" />
          </div>
          <div className="relative z-20">
            <div className="text-xs uppercase tracking-widest text-gray-200 mb-2">Pending</div>
            <div className="text-3xl font-bold text-white drop-shadow">{pendingPayments}</div>
            <div className="text-xs text-gray-300 mt-1">Payments</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Send money, pay bills, and manage your payment history.
          </p>
        </div>
        <Button
          onClick={() => setShowNewPayment(true)}
          className={`font-semibold transition-colors duration-150 ${
            theme === 'dark'
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Payment
        </Button>
      </div>

      {/* Quick Payments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Payments</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickPayments.map((payment) => (
            <Card
              key={payment.id}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 relative overflow-hidden"
              onClick={() => setShowNewPayment(true)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${payment.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${payment.color} text-white`}>
                    {payment.icon === 'Building2' && <Building2 className="w-6 h-6" />}
                    {payment.icon === 'Send' && <Send className="w-6 h-6" />}
                    {payment.icon === 'ShoppingCart' && <ShoppingCart className="w-6 h-6" />}
                    {payment.icon === 'Car' && <Car className="w-6 h-6" />}
                    {payment.icon === 'Heart' && <Heart className="w-6 h-6" />}
                    {payment.icon === 'Plane' && <Plane className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{payment.name}</h3>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods & History */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(payment.type)}
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.date)} • {payment.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`font-semibold ${payment.type === 'received' ? 'text-green-600' : 'text-red-600'}`}>
                          {payment.type === 'received' ? '+' : '-'}{formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">{payment.currency}</p>
                      </div>
                      {getStatusIcon(payment.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'card' ? `•••• ${method.number}` : method.number}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Payment Dialog */}
      <Dialog open={showNewPayment} onOpenChange={setShowNewPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Type</label>
              <select
                value={paymentForm.type}
                onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="transfer">Transfer</option>
                <option value="bill">Bill Payment</option>
                <option value="card">Card Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipient</label>
              <input
                type="text"
                value={paymentForm.recipient}
                onChange={(e) => setPaymentForm({ ...paymentForm, recipient: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Email or phone number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="What's this payment for?"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Send Payment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewPayment(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 