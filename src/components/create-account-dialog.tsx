import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

interface CreateAccountDialogProps {
  trigger: React.ReactNode
}

interface CreateAccountForm {
  account_type: string
  currency: string
  initial_deposit: string
}

export default function CreateAccountDialog({ trigger }: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateAccountForm>({
    account_type: '',
    currency: '',
    initial_deposit: '',
  })

  const { mutate: createAccount, isPending } = useMutation({
    mutationFn: async (data: CreateAccountForm) => {
      console.log('Mutation data:', data)
      const response = await api.post('/api/accounts', {
        account_type: data.account_type,
        currency: data.currency,
        user_id: 'test-user',
        initial_deposit: data.initial_deposit // Send initial deposit
      })
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Account created successfully!',
        description: 'Your new account has been created.',
      })
      setOpen(false)
      setFormData({
        account_type: '',
        currency: '',
        initial_deposit: '',
      })
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create account',
        description: error.response?.data?.detail || 'Please try again.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting account data:', formData)
    createAccount(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
          <DialogDescription>
            Choose your account type and currency to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="account_type">Account Type</Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, account_type: value }))
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50">
                  <SelectItem value="SAVINGS" className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer">Savings Account</SelectItem>
                  <SelectItem value="CHECKING" className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer">Checking Account</SelectItem>
                  <SelectItem value="FIXED_DEPOSIT" className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50">
                  <SelectItem value="USD" className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR" className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer">EUR - Euro</SelectItem>
                  <SelectItem value="GBP" className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD" className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_deposit">Initial Deposit</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="initial_deposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.initial_deposit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      initial_deposit: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 