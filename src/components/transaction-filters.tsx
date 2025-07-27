import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/utils'

export interface TransactionFilters {
  startDate?: Date
  endDate?: Date
  type: string
  category: string
  minAmount: string
  maxAmount: string
  search: string
}

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilters) => void
  className?: string
}

const TRANSACTION_TYPES = [
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'DEPOSIT', label: 'Deposit' },
  { value: 'WITHDRAWAL', label: 'Withdrawal' },
]

const TRANSACTION_CATEGORIES = [
  { value: 'SALARY', label: 'Salary' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'BILL_PAYMENT', label: 'Bill Payment' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'TRANSPORT', label: 'Transportation' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'OTHER', label: 'Other' },
]

export function TransactionFilters({ onFilterChange, className }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: undefined,
    endDate: undefined,
    type: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    search: '',
  })

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      startDate: undefined,
      endDate: undefined,
      type: '',
      category: '',
      minAmount: '',
      maxAmount: '',
      search: '',
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-white">Search</Label>
          <Input
            id="search"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="bg-white dark:bg-black border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-white">Date Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-white dark:bg-black border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900',
                    !filters.startDate && 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'PPP') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => handleFilterChange('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-white dark:bg-black border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900',
                    !filters.endDate && 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'PPP') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => handleFilterChange('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-white">Transaction Type</Label>
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-white">Category</Label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
              {TRANSACTION_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minAmount" className="text-sm font-medium text-gray-700 dark:text-white">Min Amount</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0.00"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              className="bg-white dark:bg-black border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAmount" className="text-sm font-medium text-gray-700 dark:text-white">Max Amount</Label>
            <Input
              id="maxAmount"
              type="number"
              placeholder="0.00"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              className="bg-white dark:bg-black border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 