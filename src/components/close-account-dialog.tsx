import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '../api'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface CloseAccountDialogProps {
  accountNumber: string
  accountType: string
  balance: number
  currency: string
  trigger?: React.ReactNode
}

export function CloseAccountDialog({
  accountNumber,
  accountType,
  balance,
  currency,
  trigger,
}: CloseAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  const closeAccount = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/accounts/${accountNumber}/close/`)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Account closed successfully',
        description: 'Your account has been closed.',
      })
      setOpen(false)
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      // Navigate back to accounts list
      router.push('/accounts')
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to close account',
        description: error.response?.data?.detail || 'Please try again.',
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive">
            Close Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to close this account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {balance !== 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must have a zero balance before closing your account. Please transfer or withdraw any remaining funds.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Account Details</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Account Type: {accountType}</p>
              <p>Account Number: ••••{accountNumber.slice(-4)}</p>
              <p>Current Balance: {balance} {currency}</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please note:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your account must have a zero balance</li>
                <li>All pending transactions must be completed</li>
                <li>This action cannot be undone</li>
                <li>You will no longer be able to use this account for transactions</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => closeAccount.mutate()}
            disabled={balance !== 0 || closeAccount.isPending}
          >
            {closeAccount.isPending ? 'Closing...' : 'Close Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 