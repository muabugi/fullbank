import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { formatCurrency, formatDate, cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, CreditCard, Shield, AlertCircle, Lock, Unlock, Eye } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context';

interface Card {
  id: number
  card_number: string
  card_holder_name: string
  card_type: 'DEBIT' | 'CREDIT'
  card_network: 'VISA' | 'MASTERCARD' | 'AMEX'
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'EXPIRED' | 'LOST' | 'STOLEN' | 'FROZEN'
  expiry_date: string
  daily_transaction_limit: number
  daily_withdrawal_limit: number
  is_international_enabled: boolean
  is_contactless_enabled: boolean
  issued_date: string
  last_used_date: string | null
  blocked_date: string | null
  account: {
    account_number: string
    account_type: string
  }
  frozen_until: string | null
  rewards_points: number
  cashback_rate: number
  has_travel_insurance: boolean
  has_purchase_protection: boolean
  has_extended_warranty: boolean
  lounge_access: boolean
  concierge_service: boolean
}

interface CardTransaction {
  transaction_id: string
  card_number: string
  transaction_type: 'PURCHASE' | 'WITHDRAWAL' | 'REFUND' | 'FEE' | 'INTEREST'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'
  amount: number
  currency: string
  merchant_name: string
  merchant_category: string
  merchant_location: string
  description: string
  created_at: string
}

const Cards = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isPinChangeDialogOpen, setIsPinChangeDialogOpen] = useState(false)
  const [pinChangeError, setPinChangeError] = useState<string | null>(null)
  const [freezeDuration, setFreezeDuration] = useState<number>(24)
  const [isFreezeDialogOpen, setIsFreezeDialogOpen] = useState(false)
  const [selectedCardForFreeze, setSelectedCardForFreeze] = useState<Card | null>(null)
  const { theme } = useTheme();
  // Fetch cards
  const { data: cardsData, isLoading: isLoadingCards } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const response = await api.get('/api/cards/')
      return response.data
    },
  });
  // Always define safeCards after cardsData
  const safeCards = Array.isArray(cardsData?.results) ? cardsData.results : [];
  // Card analytics
  const totalCards = safeCards.length;
  const debitCount = safeCards.filter((card: Card) => card.card_type === 'DEBIT').length;
  const creditCount = safeCards.filter((card: Card) => card.card_type === 'CREDIT').length;
  const cardTypeData = [
    { label: 'Debit', value: debitCount, color: '#26d0ce' },
    { label: 'Credit', value: creditCount, color: '#ffd200' },
  ];
  // Sample promotions
  const promotions = [
    {
      title: '5% Cashback on Groceries',
      description: 'Use your credit card for groceries this month and earn 5% cashback.',
    },
    {
      title: 'Free Airport Lounge Access',
      description: 'Enjoy complimentary lounge access with your Platinum Credit Card.',
    },
  ];

  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts');
      return response.data;
    },
  });
  const accounts = Array.isArray(accountsData?.results) ? accountsData.results : [];

  // Fetch transactions for selected card
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<CardTransaction[]>({
    queryKey: ['card-transactions', selectedCard?.card_number],
    queryFn: async () => {
      if (!selectedCard || !isDetailsDialogOpen) return [];
      const response = await api.get(`/api/cards/${selectedCard.card_number}/transactions/`)
      return response.data
    },
    enabled: !!selectedCard && isDetailsDialogOpen,
  })

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: {
      account_number: string
      user_id: string
      card_holder_name: string
      card_type: 'DEBIT' | 'CREDIT'
      card_network: 'VISA' | 'MASTERCARD' | 'AMEX'
      pin: string
      expiry_date: string
    }) => {
      const response = await api.post('/api/cards/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      setIsCreateDialogOpen(false)
      toast({
        title: 'Card created successfully',
        description: 'Your new card has been issued.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create card',
        description: error.response?.data?.detail || 'Please try again.',
      })
    },
  })

  // Block card mutation
  const blockCardMutation = useMutation({
    mutationFn: async (cardNumber: string) => {
      const response = await api.post(`/api/cards/${cardNumber}/block/`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast({
        title: 'Card blocked successfully',
        description: 'The card has been blocked for security.',
      })
    },
  })

  // Unblock card mutation
  const unblockCardMutation = useMutation({
    mutationFn: async (cardNumber: string) => {
      const response = await api.post(`/api/cards/${cardNumber}/unblock/`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast({
        title: 'Card unblocked successfully',
        description: 'The card has been unblocked and is ready to use.',
      })
    },
  })

  // PIN change mutation
  const pinChangeMutation = useMutation({
    mutationFn: async (data: { old_pin: string; new_pin: string }) => {
      if (!selectedCard) throw new Error("No card selected")
      const response = await api.post(`/api/cards/${selectedCard.card_number}/change-pin/`, data)
      return response.data
    },
    onSuccess: () => {
      setIsPinChangeDialogOpen(false)
      toast({
        title: "PIN changed successfully",
        description: "Your card PIN has been updated.",
      })
    },
    onError: (error: any) => {
      setPinChangeError(error.response?.data?.detail || "Failed to change PIN. Please try again.")
    },
  })

  const freezeCardMutation = useMutation({
    mutationFn: async ({ cardNumber, duration }: { cardNumber: string; duration: number }) => {
      const response = await api.post(`/api/cards/${cardNumber}/freeze/`, { duration });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Card frozen successfully',
        description: 'Your card has been temporarily frozen.',
      });
      setIsFreezeDialogOpen(false);
      setSelectedCardForFreeze(null);
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (error) => {
      toast({
        title: 'Error freezing card',
        description: error instanceof Error ? error.message : 'Failed to freeze card',
        variant: 'destructive',
      });
    },
  });

  const unfreezeCardMutation = useMutation({
    mutationFn: async (cardNumber: string) => {
      const response = await api.post(`/api/cards/${cardNumber}/freeze/`, { unfreeze: true });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Card unfrozen successfully',
        description: 'Your card has been unfrozen and is ready to use.',
      });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (error) => {
      toast({
        title: 'Error unfreezing card',
        description: error instanceof Error ? error.message : 'Failed to unfreeze card',
        variant: 'destructive',
      });
    },
  });

  const handleCreateCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      account_number: formData.get('account_number') as string,
      user_id: formData.get('user_id') as string,
      card_holder_name: formData.get('card_holder_name') as string,
      card_type: formData.get('card_type') as 'DEBIT' | 'CREDIT',
      card_network: formData.get('card_network') as 'VISA' | 'MASTERCARD' | 'AMEX',
      pin: formData.get('pin') as string,
      expiry_date: formData.get('expiry_date') as string,
    }
    console.log('[CARD CREATE] Request payload:', payload)
    createCardMutation.mutate(payload, {
      onSuccess: (data) => {
        console.log('[CARD CREATE] Response:', data)
      },
      onError: (error) => {
        console.error('[CARD CREATE] Error:', error)
      }
    })
  }

  const getStatusColor = (status: Card['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOST':
      case 'STOLEN':
        return 'bg-orange-100 text-orange-800'
      case 'FROZEN':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePinChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPinChangeError(null)
    const formData = new FormData(e.currentTarget)
    pinChangeMutation.mutate({
      old_pin: formData.get('old_pin') as string,
      new_pin: formData.get('new_pin') as string,
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Card Summary & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Cards Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-0 p-6 flex flex-col items-start justify-center min-h-[120px]">
          <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#232526_10%,_#414345_40%,_#bfc1c2_70%,_#232526_100%)] opacity-90"></div>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full blur-2xl opacity-40 animate-shine" />
          </div>
          <div className="relative z-20">
            <div className="text-xs uppercase tracking-widest text-gray-200 mb-2">Total Cards</div>
            <div className="text-3xl font-bold text-white drop-shadow">{totalCards}</div>
            <div className="text-xs text-gray-300 mt-1">Debit: {debitCount} &bull; Credit: {creditCount}</div>
          </div>
        </div>
        {/* Card Types Pie Chart */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-xl p-6 min-h-[120px]">
          <div className="text-xs uppercase tracking-widest text-gray-200 mb-2">Card Types</div>
          {/* SVG Pie Chart */}
          <svg width="80" height="80" viewBox="0 0 36 36" className="mb-2">
            {(() => {
              const total = cardTypeData.reduce((sum, d) => sum + d.value, 0) || 1;
              let start = 0;
              return cardTypeData.map((d, i) => {
                const val = d.value / total;
                const dash = val * 100;
                const el = (
                  <circle
                    key={d.label}
                    r="16"
                    cx="18"
                    cy="18"
                    fill="transparent"
                    stroke={d.color}
                    strokeWidth="6"
                    strokeDasharray={`${dash} ${100 - dash}`}
                    strokeDashoffset={25 - start}
                    style={{ transition: 'stroke-dasharray 0.5s' }}
                  />
                );
                start += dash;
                return el;
              });
            })()}
          </svg>
          <div className="flex gap-4 text-xs text-gray-200">
            {cardTypeData.map(d => (
              <span key={d.label} className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                {d.label}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className={`font-semibold transition-colors duration-150 ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Request New Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request New Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account_number">Account</Label>
                <Select name="account_number" required>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingAccounts ? 'Loading accounts...' : 'Select account'} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc: any) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.account_type} - {acc.account_number} (••••{acc.account_number.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_id">User ID</Label>
                <Input
                  id="user_id"
                  name="user_id"
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_holder_name">Card Holder Name</Label>
                <Input
                  id="card_holder_name"
                  name="card_holder_name"
                  placeholder="Enter card holder name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_type">Card Type</Label>
                <Select name="card_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">Debit Card</SelectItem>
                    <SelectItem value="CREDIT">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_network">Card Network</Label>
                <Select name="card_network" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISA">VISA</SelectItem>
                    <SelectItem value="MASTERCARD">MASTERCARD</SelectItem>
                    <SelectItem value="AMEX">AMEX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  name="pin"
                  type="password"
                  placeholder="Set card PIN"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-900"
              >
                Create Card
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingCards ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-6 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : safeCards.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCards.map((card: Card) => (
            <Card
              key={card.id}
              className="relative overflow-hidden p-0 shadow-xl rounded-2xl border-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white min-h-[200px] flex flex-col justify-between"
              style={{
                background:
                  card.card_network === 'VISA'
                    ? 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)'
                    : card.card_network === 'MASTERCARD'
                    ? 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'
                    : card.card_network === 'AMEX'
                    ? 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
                    : undefined,
              }}
            >
              <CardHeader className="flex flex-row justify-between items-center p-4 pb-2">
                <div>
                  <div className="text-xs opacity-80">Card Number</div>
                  <div className="font-mono text-lg tracking-widest select-all">
                    {card.card_number}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={card.status === 'ACTIVE' ? 'default' : 'destructive'}
                    className="uppercase text-xs px-2 py-1 bg-white/20 text-white border-0"
                  >
                    {card.status}
                  </Badge>
                  <div className="mt-2">
                    {card.card_network === 'VISA' && (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6" />
                    )}
                    {card.card_network === 'MASTERCARD' && (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-6" />
                    )}
                    {card.card_network === 'AMEX' && (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end p-4 pt-0">
                <div className="flex flex-row justify-between items-end">
                  <div>
                    <div className="text-xs opacity-80">Card Holder</div>
                    <div className="font-semibold text-base">{card.card_holder_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">Expires</div>
                    <div className="font-semibold text-base">{formatDate(card.expiry_date)}</div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 text-white border-0 hover:bg-white/30"
                    onClick={() => {
                      setSelectedCard(card)
                      setIsDetailsDialogOpen(true)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                  {card.status === 'ACTIVE' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/20 text-white border-0 hover:bg-white/30"
                      onClick={() => {
                        setSelectedCardForFreeze(card)
                        setIsFreezeDialogOpen(true)
                      }}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Freeze
                    </Button>
                  ) : card.status === 'FROZEN' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/20 text-white border-0 hover:bg-white/30"
                      onClick={() => unfreezeCardMutation.mutate(card.card_number)}
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Unfreeze
                    </Button>
                  ) : null}
                </div>
              </CardContent>
              {/* Card Benefits */}
              <div className="flex flex-wrap gap-2 mt-4">
                {card.cashback_rate > 0 && (
                  <span className="px-2 py-1 rounded bg-white/20 text-xs">Cashback</span>
                )}
                {card.lounge_access && (
                  <span className="px-2 py-1 rounded bg-white/20 text-xs">Lounge Access</span>
                )}
                {card.has_travel_insurance && (
                  <span className="px-2 py-1 rounded bg-white/20 text-xs">Travel Insurance</span>
                )}
                {card.has_purchase_protection && (
                  <span className="px-2 py-1 rounded bg-white/20 text-xs">Purchase Protection</span>
                )}
                {card.has_extended_warranty && (
                  <span className="px-2 py-1 rounded bg-white/20 text-xs">Extended Warranty</span>
                )}
                {card.concierge_service && (
                  <span className="px-2 py-1 rounded bg-white/20 text-xs">Concierge</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* No cards found message */}
          <Card className="col-span-full text-center py-12">
            <CardHeader>
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <AlertDescription className="text-lg">No cards found. Please request a new one.</AlertDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Card Details</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-auto p-1">
                <TabsTrigger value="details" className="text-sm sm:text-base py-2">Details</TabsTrigger>
                <TabsTrigger value="transactions" className="text-sm sm:text-base py-2">Transactions</TabsTrigger>
                <TabsTrigger value="security" className="text-sm sm:text-base py-2">Security</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Card Number</p>
                    <p className="text-sm sm:text-base font-mono">•••• {selectedCard.card_number ? selectedCard.card_number.slice(-4) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Card Type</p>
                    <p className="text-sm sm:text-base">{selectedCard.card_type}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Network</p>
                    <p>{selectedCard.card_network}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedCard.status)}>
                      {selectedCard.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Expiry Date</p>
                    <p>{formatDate(selectedCard.expiry_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Issued Date</p>
                    <p>{formatDate(selectedCard.issued_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Daily Transaction Limit</p>
                    <p>{formatCurrency(selectedCard.daily_transaction_limit)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Daily Withdrawal Limit</p>
                    <p>{formatCurrency(selectedCard.daily_withdrawal_limit)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">International Usage</p>
                    <p>{selectedCard.is_international_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Contactless</p>
                    <p>{selectedCard.is_contactless_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="transactions" className="mt-4">
                {isLoadingTransactions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : transactions?.length ? (
                  <div className="space-y-3 sm:space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.transaction_id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-4"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-medium truncate max-w-[200px] sm:max-w-[300px]">
                              {transaction.merchant_name || transaction.description}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                          <p className="text-sm sm:text-base font-medium">
                            {formatCurrency(transaction.amount)} {transaction.currency}
                          </p>
                          <Badge
                            className={cn(
                              "text-xs sm:text-sm",
                              transaction.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            )}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm sm:text-base text-gray-500 py-4">No transactions found</p>
                )}
              </TabsContent>
              <TabsContent value="security" className="space-y-4 mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Keep your card details secure and never share your PIN with anyone.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Card Status</p>
                      <p className="text-sm text-gray-500">
                        {selectedCard.status === 'ACTIVE'
                          ? 'Your card is active and ready to use'
                          : selectedCard.status === 'BLOCKED'
                          ? 'Your card is currently blocked'
                          : selectedCard.status === 'FROZEN'
                          ? 'Your card is currently frozen'
                          : 'Your card is not active'}
                      </p>
                    </div>
                    {selectedCard.status === 'ACTIVE' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          blockCardMutation.mutate(selectedCard.card_number)
                          setIsDetailsDialogOpen(false)
                        }}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Block Card
                      </Button>
                    ) : selectedCard.status === 'BLOCKED' ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          unblockCardMutation.mutate(selectedCard.card_number)
                          setIsDetailsDialogOpen(false)
                        }}
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Unblock Card
                      </Button>
                    ) : selectedCard.status === 'FROZEN' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          unfreezeCardMutation.mutate(selectedCard.card_number)
                          setIsDetailsDialogOpen(false)
                        }}
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Unfreeze Card
                      </Button>
                    ) : null}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">PIN Management</p>
                        <p className="text-sm text-gray-500">
                          Change your card PIN for enhanced security
                        </p>
                      </div>
                      <Dialog open={isPinChangeDialogOpen} onOpenChange={setIsPinChangeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Shield className="w-4 h-4 mr-2" />
                            Change PIN
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Card PIN</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handlePinChange} className="space-y-4">
                            {pinChangeError && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{pinChangeError}</AlertDescription>
                              </Alert>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor="old_pin">Current PIN</Label>
                              <Input
                                id="old_pin"
                                name="old_pin"
                                type="password"
                                maxLength={4}
                                minLength={4}
                                placeholder="Enter current PIN"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new_pin">New PIN</Label>
                              <Input
                                id="new_pin"
                                name="new_pin"
                                type="password"
                                maxLength={4}
                                minLength={4}
                                placeholder="Enter new PIN"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm_pin">Confirm New PIN</Label>
                              <Input
                                id="confirm_pin"
                                name="confirm_pin"
                                type="password"
                                maxLength={4}
                                minLength={4}
                                placeholder="Confirm new PIN"
                                required
                                onChange={(e) => {
                                  const newPin = (e.target.form?.elements.namedItem('new_pin') as HTMLInputElement).value
                                  if (e.target.value !== newPin) {
                                    e.target.setCustomValidity("PINs don't match")
                                  } else {
                                    e.target.setCustomValidity("")
                                  }
                                }}
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={pinChangeMutation.isPending}>
                              {pinChangeMutation.isPending ? "Changing PIN..." : "Change PIN"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>• Your PIN must be 4 digits</p>
                      <p>• Don't use easily guessable numbers (e.g., 1234, 0000)</p>
                      <p>• Never share your PIN with anyone</p>
                      <p>• Change your PIN regularly for better security</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Security Tips</p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-500">
                    <li>• Never share your card PIN with anyone</li>
                    <li>• Keep your card in a safe place</li>
                    <li>• Report lost or stolen cards immediately</li>
                    <li>• Monitor your transactions regularly</li>
                    <li>• Use secure ATMs and payment terminals</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFreezeDialogOpen} onOpenChange={setIsFreezeDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[400px] max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Freeze Card</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Temporarily freeze your card to prevent unauthorized transactions.
              You can unfreeze it at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm sm:text-base">Freeze Duration (hours)</Label>
              <Select
                value={freezeDuration.toString()}
                onValueChange={(value) => setFreezeDuration(parseInt(value))}
              >
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-sm sm:text-base">1 hour</SelectItem>
                  <SelectItem value="6" className="text-sm sm:text-base">6 hours</SelectItem>
                  <SelectItem value="12" className="text-sm sm:text-base">12 hours</SelectItem>
                  <SelectItem value="24" className="text-sm sm:text-base">24 hours</SelectItem>
                  <SelectItem value="48" className="text-sm sm:text-base">48 hours</SelectItem>
                  <SelectItem value="72" className="text-sm sm:text-base">72 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base"
                onClick={() => {
                  setIsFreezeDialogOpen(false)
                  setSelectedCardForFreeze(null)
                }}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto text-sm sm:text-base"
                onClick={() => {
                  if (selectedCardForFreeze) {
                    freezeCardMutation.mutate({
                      cardNumber: selectedCardForFreeze.card_number,
                      duration: freezeDuration,
                    })
                  }
                }}
              >
                Freeze Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Promotions Section */}
      <div className="mt-10">
        <div className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Promotions & Offers</div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {promotions.map((promo, idx) => (
            <div key={idx} className="min-w-[260px] bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-lg p-5 text-white flex flex-col justify-between">
              <div className="font-bold text-base mb-1">{promo.title}</div>
              <div className="text-sm opacity-80">{promo.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Cards 