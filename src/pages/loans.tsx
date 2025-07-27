import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Banknote, Calculator, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/utils'

// Mock data for loan products
const loanProducts = [
  {
    id: 1,
    name: "Personal Loan",
    description: "Flexible personal loan for any purpose with competitive rates",
    min_amount: 1000,
    max_amount: 50000,
    interest_rate: 8.5,
    term_months: [12, 24, 36, 48, 60],
    requirements: [
      "Minimum credit score of 650",
      "Stable income",
      "Valid government ID",
      "Proof of address"
    ]
  },
  {
    id: 2,
    name: "Home Loan",
    description: "Mortgage solutions for your dream home",
    min_amount: 50000,
    max_amount: 1000000,
    interest_rate: 5.5,
    term_months: [120, 180, 240, 300, 360],
    requirements: [
      "Minimum credit score of 700",
      "Down payment of at least 20%",
      "Proof of income",
      "Property appraisal"
    ]
  },
  {
    id: 3,
    name: "Business Loan",
    description: "Funding solutions for your business growth",
    min_amount: 10000,
    max_amount: 500000,
    interest_rate: 7.5,
    term_months: [24, 36, 48, 60, 72],
    requirements: [
      "Business plan",
      "2 years of business history",
      "Business financial statements",
      "Collateral"
    ]
  }
]

// Mock data for loan applications
const mockLoanApplications = [
  {
    id: 1,
    loan_product: 1,
    amount: 25000,
    term_months: 36,
    status: 'ACTIVE',
    created_at: '2024-03-01T00:00:00Z',
    monthly_payment: 790.83,
    total_payment: 28469.88,
    progress: 25
  },
  {
    id: 2,
    loan_product: 2,
    amount: 300000,
    term_months: 240,
    status: 'PENDING',
    created_at: '2024-03-15T00:00:00Z',
    monthly_payment: 2050.00,
    total_payment: 492000.00,
    progress: 0
  }
]

export default function Loans() {
  const [selectedProduct, setSelectedProduct] = useState<typeof loanProducts[0] | null>(null)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [calculatorValues, setCalculatorValues] = useState({
    amount: '',
    term: '',
    interestRate: ''
  })

  // Use mock data instead of API call
  const loanApplications = mockLoanApplications

  const calculateLoan = () => {
    const amount = parseFloat(calculatorValues.amount)
    const term = parseInt(calculatorValues.term)
    const rate = parseFloat(calculatorValues.interestRate) / 100 / 12 // Monthly interest rate

    if (amount && term && rate) {
      const monthlyPayment = (amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
      const totalPayment = monthlyPayment * term
      return { monthlyPayment, totalPayment }
    }
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600'
      case 'REJECTED':
        return 'text-red-600'
      case 'PENDING':
        return 'text-yellow-600'
      case 'ACTIVE':
        return 'text-blue-600'
      case 'PAID':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'ACTIVE':
        return <Banknote className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Loans</h1>
        </div>
        <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Loan Calculator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Loan Calculator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loan Amount</label>
                <Input
                  type="number"
                  value={calculatorValues.amount}
                  onChange={(e) => setCalculatorValues({ ...calculatorValues, amount: e.target.value })}
                  placeholder="Enter loan amount"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Term (months)</label>
                <Input
                  type="number"
                  value={calculatorValues.term}
                  onChange={(e) => setCalculatorValues({ ...calculatorValues, term: e.target.value })}
                  placeholder="Enter loan term"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Interest Rate (%)</label>
                <Input
                  type="number"
                  value={calculatorValues.interestRate}
                  onChange={(e) => setCalculatorValues({ ...calculatorValues, interestRate: e.target.value })}
                  placeholder="Enter interest rate"
                />
              </div>
              {calculateLoan() && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Payment:</span>
                    <span className="font-medium">{formatCurrency(calculateLoan()!.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Payment:</span>
                    <span className="font-medium">{formatCurrency(calculateLoan()!.totalPayment)}</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loan Products */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loanProducts.map((product, idx) => {
          // Unique luxury gradients for each product
          const gradients = [
            'linear-gradient(135deg, #232526 0%, #414345 100%)', // Personal
            'linear-gradient(135deg, #434343 0%, #bfc1c2 100%)', // Home
            'linear-gradient(135deg, #232526 0%, #bfc1c2 100%)', // Business
          ];
          const gradient = gradients[idx % gradients.length];
          return (
            <Card
              key={product.id}
              className="relative overflow-hidden rounded-2xl shadow-xl border-0 transition-transform duration-200 hover:scale-105 hover:shadow-2xl min-h-[220px]"
              style={{ background: gradient }}
            >
              {/* Shiny overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-full blur-2xl opacity-30 animate-shine" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white drop-shadow text-lg font-bold">{product.name}</CardTitle>
                <CardDescription className="text-gray-200 opacity-90 font-medium">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Amount Range:</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Interest Rate:</span>
                    <span className="font-semibold text-white">{product.interest_rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Term Options:</span>
                    <span className="font-semibold text-white">{product.term_months.join(', ')} months</span>
                  </div>
                </div>
                <Button
                  className="w-full font-semibold bg-white/90 text-black hover:bg-white"
                  onClick={() => setSelectedProduct(product)}
                >
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Loans */}
      {loanApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loanApplications.map((application) => {
                const product = loanProducts.find(p => p.id === application.loan_product)
                return (
                  <div key={application.id} className="relative p-4 rounded-2xl overflow-hidden shadow-xl border-0 mb-4">
                    {/* Animated shiny gradient background */}
                    <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#232526_10%,_#414345_40%,_#bfc1c2_70%,_#232526_100%)] opacity-90"></div>
                    {/* Shiny overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full blur-2xl opacity-40 animate-shine" />
                    </div>
                    <div className="relative z-20">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-white drop-shadow">{product?.name}</h3>
                          <p className="text-sm text-gray-200">
                            {formatCurrency(application.amount)} • {application.term_months} months
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">Monthly Payment:</span>
                              <span className="font-medium text-white">{formatCurrency(application.monthly_payment)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">Total Payment:</span>
                              <span className="font-medium text-white">{formatCurrency(application.total_payment)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(application.status)}
                          <span className={`font-medium ${getStatusColor(application.status)} text-white drop-shadow`}>{application.status}</span>
                        </div>
                      </div>
                      {application.progress > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1 text-gray-200">
                            <span>Payment Progress</span>
                            <span>{application.progress}%</span>
                          </div>
                          <Progress value={application.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Application Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loan Amount</label>
              <Input
                type="number"
                min={selectedProduct?.min_amount}
                max={selectedProduct?.max_amount}
                placeholder={`Enter amount between ${formatCurrency(selectedProduct?.min_amount || 0)} and ${formatCurrency(selectedProduct?.max_amount || 0)}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Term (months)</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct?.term_months.map((term) => (
                    <SelectItem key={term} value={term.toString()}>
                      {term} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {selectedProduct?.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            <Button className="w-full">Submit Application</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 