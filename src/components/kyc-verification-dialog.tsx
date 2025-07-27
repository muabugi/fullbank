import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Upload, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/utils'

interface KYCDocument {
  document_id: string
  document_type: string
  document_number: string
  issuing_country: string
  issuing_date: string
  expiry_date: string
  status: string
  verification_date: string | null
  rejection_reason: string | null
}

interface KYCVerification {
  verification_id: string
  verification_type: string
  status: string
  documents: KYCDocument[]
  created_at: string
  updated_at: string
  completed_at: string | null
}

interface KYCVerificationDialogProps {
  trigger?: React.ReactNode
}

export function KYCVerificationDialog({ trigger }: KYCVerificationDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [issuingCountry, setIssuingCountry] = useState('')
  const [issuingDate, setIssuingDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [documentFront, setDocumentFront] = useState<File | null>(null)
  const [documentBack, setDocumentBack] = useState<File | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch user's KYC status and documents
  const { data: kycData } = useQuery<{
    status: string
    verifications: KYCVerification[]
  }>({
    queryKey: ['kyc-status'],
    queryFn: async () => {
      const response = await api.get('/api/kyc/status')
      return response.data
    },
  })

  const submitDocument = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/kyc/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Document submitted successfully',
        description: 'Your document is being reviewed. We will notify you once verified.',
      })
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] })
      // Reset form
      setSelectedDocumentType('')
      setDocumentNumber('')
      setIssuingCountry('')
      setIssuingDate('')
      setExpiryDate('')
      setDocumentFront(null)
      setDocumentBack(null)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to submit document',
        description: error.response?.data?.detail || 'Please try again.',
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documentFront) {
      toast({
        variant: 'destructive',
        title: 'Document required',
        description: 'Please upload the front of your document.',
      })
      return
    }

    const formData = new FormData()
    formData.append('document_type', selectedDocumentType)
    formData.append('document_number', documentNumber)
    formData.append('issuing_country', issuingCountry)
    formData.append('issuing_date', issuingDate)
    formData.append('expiry_date', expiryDate)
    formData.append('document_front', documentFront)
    if (documentBack) {
      formData.append('document_back', documentBack)
    }

    submitDocument.mutate(formData)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Complete KYC Verification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Verification</DialogTitle>
          <DialogDescription>
            Please submit your identification documents for verification.
          </DialogDescription>
        </DialogHeader>

        {kycData?.status === 'VERIFIED' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your KYC verification is complete. All documents have been verified.
            </AlertDescription>
          </Alert>
        )}

        {kycData?.verifications?.map((verification) => (
          <div key={verification.verification_id} className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{verification.verification_type}</h3>
              <div className="flex items-center gap-2">
                {getStatusIcon(verification.status)}
                <span className="text-sm capitalize">{verification.status.toLowerCase()}</span>
              </div>
            </div>
            {verification.documents.map((doc) => (
              <div key={doc.document_id} className="pl-4 border-l-2 border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span>{doc.document_type}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.status)}
                    <span className="capitalize">{doc.status.toLowerCase()}</span>
                  </div>
                </div>
                {doc.rejection_reason && (
                  <p className="text-sm text-red-500 mt-1">{doc.rejection_reason}</p>
                )}
                {doc.verification_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    Verified on {formatDate(doc.verification_date)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}

        {kycData?.status !== 'VERIFIED' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type</Label>
              <Select
                value={selectedDocumentType}
                onValueChange={setSelectedDocumentType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                  <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                  <SelectItem value="RESIDENCE_PERMIT">Residence Permit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_number">Document Number</Label>
              <Input
                id="document_number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuing_country">Issuing Country</Label>
              <Input
                id="issuing_country"
                value={issuingCountry}
                onChange={(e) => setIssuingCountry(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issuing_date">Issuing Date</Label>
                <Input
                  id="issuing_date"
                  type="date"
                  value={issuingDate}
                  onChange={(e) => setIssuingDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_front">Document Front</Label>
              <Input
                id="document_front"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocumentFront(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_back">Document Back (Optional)</Label>
              <Input
                id="document_back"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocumentBack(e.target.files?.[0] || null)}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please ensure your documents are:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Clear and legible</li>
                  <li>Not expired</li>
                  <li>In a supported format (JPG, PNG, PDF)</li>
                  <li>Less than 5MB in size</li>
                </ul>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="submit"
                disabled={submitDocument.isPending}
              >
                {submitDocument.isPending ? 'Submitting...' : 'Submit Document'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 