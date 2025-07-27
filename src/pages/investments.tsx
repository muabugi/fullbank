import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, TrendingUp, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Info, AlertCircle } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/utils'

// Mock data for investment products
const investmentProducts = [
  {
    id: 1,
    name: "Tech Growth Fund",
    type: "MUTUAL_FUNDS",
    description: "A diversified fund focusing on technology sector growth",
    risk_level: "HIGH",
    min_investment: 1000,
    expected_return: 12,
    historical_performance: {
      year1: 15.2,
      year3: 45.6,
      year5: 89.3
    }
  },
  {
    id: 2,
    name: "Global Bond Fund",
    type: "BONDS",
    description: "Low-risk government and corporate bonds portfolio",
    risk_level: "LOW",
    min_investment: 5000,
    expected_return: 4.5,
    historical_performance: {
      year1: 4.2,
      year3: 13.5,
      year5: 24.8
    }
  },
  {
    id: 3,
    name: "S&P 500 ETF",
    type: "ETF",
    description: "Tracks the performance of S&P 500 index",
    risk_level: "MEDIUM",
    min_investment: 100,
    expected_return: 8.5,
    historical_performance: {
      year1: 9.8,
      year3: 32.4,
      year5: 65.7
    }
  }
]

// Mock data for portfolio
const mockPortfolio = {
  total_value: 125000,
  total_invested: 100000,
  total_return: 25000,
  return_percentage: 25,
  investments: [
    {
      id: 1,
      product: investmentProducts[0],
      amount: 50000,
      current_value: 62500,
      return_amount: 12500,
      return_percentage: 25
    },
    {
      id: 2,
      product: investmentProducts[1],
      amount: 30000,
      current_value: 31500,
      return_amount: 1500,
      return_percentage: 5
    },
    {
      id: 3,
      product: investmentProducts[2],
      amount: 20000,
      current_value: 31000,
      return_amount: 11000,
      return_percentage: 55
    }
  ]
}

export default function Investments() {
  const [selectedProduct, setSelectedProduct] = useState<typeof investmentProducts[0] | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState('')

  // Use mock data instead of API call
  const portfolio = mockPortfolio

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'HIGH':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getReturnColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getReturnIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <LineChart className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Investments</h1>
      </div>

      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolio.total_value)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolio.total_invested)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Return</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{formatCurrency(portfolio.total_return)}</p>
                <span className={`text-sm ${getReturnColor(portfolio.return_percentage)}`}>
                  ({formatPercentage(portfolio.return_percentage)})
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Number of Investments</p>
              <p className="text-2xl font-bold">{portfolio.investments.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Investment Products</TabsTrigger>
          <TabsTrigger value="portfolio">Your Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {investmentProducts.map((product, idx) => {
              // Unique luxury gradients for each product
              const gradients = [
                'linear-gradient(135deg, #232526 0%, #414345 100%)', // Tech Growth
                'linear-gradient(135deg, #434343 0%, #bfc1c2 100%)', // Global Bond
                'linear-gradient(135deg, #232526 0%, #bfc1c2 100%)', // S&P 500
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
                        <span className="text-gray-300">Type:</span>
                        <span className="font-semibold text-white">{product.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Risk Level:</span>
                        <span className={`font-semibold ${getRiskLevelColor(product.risk_level)} text-white`}>{product.risk_level}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Min Investment:</span>
                        <span className="font-semibold text-white">{formatCurrency(product.min_investment)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Expected Return:</span>
                        <span className="font-semibold text-green-300">{formatPercentage(product.expected_return)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Historical Performance</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground">1Y</p>
                          <p className="font-medium text-green-600">
                            {formatPercentage(product.historical_performance.year1)}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground">3Y</p>
                          <p className="font-medium text-green-600">
                            {formatPercentage(product.historical_performance.year3)}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground">5Y</p>
                          <p className="font-medium text-green-600">
                            {formatPercentage(product.historical_performance.year5)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Invest Now
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="space-y-4">
            {portfolio.investments.map((investment) => (
              <Card key={investment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{investment.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {investment.product.type.replace('_', ' ')} • {formatCurrency(investment.amount)} invested
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{formatCurrency(investment.current_value)}</p>
                        {getReturnIcon(investment.return_percentage)}
                      </div>
                      <p className={`text-sm ${getReturnColor(investment.return_percentage)}`}>
                        {formatPercentage(investment.return_percentage)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Investment Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Investment Amount</label>
              <Input
                type="number"
                min={selectedProduct?.min_investment}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder={`Minimum ${formatCurrency(selectedProduct?.min_investment || 0)}`}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Annual Return:</span>
                <span className="font-medium text-green-600">
                  {formatPercentage(selectedProduct?.expected_return || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Risk Level:</span>
                <span className={`font-medium ${getRiskLevelColor(selectedProduct?.risk_level || 'LOW')}`}>
                  {selectedProduct?.risk_level}
                </span>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please review the investment details carefully. Past performance does not guarantee future results.
              </AlertDescription>
            </Alert>
            <Button className="w-full">Confirm Investment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 