import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Savings Account' },
  { value: 'CHECKING', label: 'Checking Account' },
  { value: 'FIXED_DEPOSIT', label: 'Fixed Deposit' },
]

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
]

interface CreateAccountDialogProps {
  trigger?: React.ReactNode
}

export function CreateAccountDialog({ trigger }: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [accountType, setAccountType] = useState<string>('')
  const [currency, setCurrency] = useState<string>('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createAccount = useMutation({
    mutationFn: async (data: { account_type: string; currency: string }) => {
      const response = await fetch('/api/accounts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create account')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast({
        title: 'Success',
        description: 'Account created successfully',
      })
      setOpen(false)
      setAccountType('')
      setCurrency('')
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountType || !currency) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }
    createAccount.mutate({ account_type: accountType, currency })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Account</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
          <DialogDescription>
            Choose the type of account you want to create and its currency.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-type">Account Type</Label>
            <Select
              value={accountType}
              onValueChange={setAccountType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={currency}
              onValueChange={setCurrency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={createAccount.isPending}
              className={
                'w-full font-semibold transition-colors duration-150 ' +
                'bg-black text-white hover:bg-gray-900 ' +
                'dark:bg-white dark:text-black dark:hover:bg-gray-200'
              }
            >
              {createAccount.isPending ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 