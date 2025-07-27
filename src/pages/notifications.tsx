import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export default function NotificationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/api/notifications')
      return response.data
    },
  })
  const { theme } = useTheme();

  return (
    <div className="container py-8">
      <Card className={theme === 'dark' ? 'bg-[#18181b] text-white' : ''}>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Failed to load notifications.</div>
          ) : !data?.results?.length ? (
            <div className="text-center py-8 text-muted-foreground">No notifications found.</div>
          ) : (
            <ul className="divide-y divide-border">
              {data.results.map((n: any) => {
                // Detect incoming or outgoing by message content
                const isIncoming = n.message?.toLowerCase().includes('received');
                const isOutgoing = n.message?.toLowerCase().includes('sent') || n.message?.toLowerCase().includes('transfer to');
                return (
                  <li key={n._id} className={`py-4 px-2 flex items-center gap-3 ${theme === 'dark' ? 'bg-[#232326]' : ''}`}>
                    <span>
                      {isIncoming ? (
                        <ArrowDownRight className="h-6 w-6 text-green-500" />
                      ) : isOutgoing ? (
                        <ArrowUpRight className="h-6 w-6 text-red-500" />
                      ) : (
                        <ArrowUpRight className="h-6 w-6 text-gray-400" />
                      )}
                    </span>
                    <div className="flex-1">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {n.message || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 