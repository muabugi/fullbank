import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { formatCurrency, formatDate } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';

interface TaxTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description: string;
}

export default function Tax() {
  const { theme } = useTheme();
  const { data, isLoading } = useQuery<{ results: TaxTransaction[] }>({
    queryKey: ['tax-transactions'],
    queryFn: async () => {
      const response = await api.get('/api/transactions/tax');
      return response.data;
    },
  });

  const totalTax = data?.results?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <Card className="relative overflow-hidden rounded-2xl shadow-xl border-0 mb-8">
        {/* Animated gradient background for card */}
        <div className="absolute inset-0 z-0 animate-gradient-move bg-[conic-gradient(at_top_left,_#232526_10%,_#414345_40%,_#bfc1c2_70%,_#232526_100%)] opacity-90"></div>
        <CardHeader className="relative z-20">
          <CardTitle className="flex items-center gap-2 text-2xl text-white drop-shadow">
            Tax Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-20 flex flex-col items-center py-8">
          <div className="text-4xl font-bold text-white drop-shadow mb-2">{formatCurrency(totalTax)}</div>
          <div className="text-gray-200 text-lg">Total Amount Spent on Tax</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-xl border-0">
        <CardHeader>
          <CardTitle>Tax Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">Loading...</div>
          ) : !data?.results?.length ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">No tax transactions found.</div>
          ) : (
            <ul className="divide-y divide-border bg-card rounded-md">
              {data.results.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">{tx.description || 'Tax Payment'}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</div>
                  </div>
                  <div className="font-semibold text-red-600">-{formatCurrency(tx.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 