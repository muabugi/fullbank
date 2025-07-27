import { ReactNode, useState } from 'react'
import { useRouter } from "next/router"
import { 
  Home, 
  Wallet, 
  CreditCard, 
  Settings, 
  Banknote, 
  HelpCircle, 
  LineChart, 
  Bell,
  MessageSquare,
  Menu,
  Sun,
  Moon,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ThemeProvider, useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { api } from '../api';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Cards', href: '/cards', icon: CreditCard },
  { name: 'Loans', href: '/loans', icon: Banknote },
  { name: 'Investments', href: '/investments', icon: LineChart },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Tax', href: '/tax', icon: Banknote }, // Added Tax before Settings
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface LayoutProps {
  children: ReactNode
}

function NavigationMenu({ 
  className, 
  isMobile = false, 
  onNavigate 
}: { 
  className?: string
  isMobile?: boolean
  onNavigate?: () => void 
}) {
  const router = useRouter()
  const location = router.pathname

  const handleNavigation = (href: string) => {
    router.push(href)
    onNavigate?.()
  }

  return (
    <nav className={cn(
      "flex gap-1",
      isMobile ? "flex-col space-y-1" : "flex-row items-center",
      className
    )}>
      {navigation.map((item) => (
        <button
          key={item.name}
          onClick={() => handleNavigation(item.href)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "active:bg-accent/80",
            location === item.href && "bg-accent text-accent-foreground font-medium",
            !isMobile && "text-sm"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{item.name}</span>
        </button>
      ))}
    </nav>
  )
}

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader>
          <SheetTitle className="sr-only">Main Navigation</SheetTitle>
        </SheetHeader>
        <div className="p-4 border-b">
          <h1 className="font-bold">Green Valley Bank</h1>
        </div>
        <NavigationMenu 
          className="p-4" 
          isMobile 
          onNavigate={() => setIsOpen(false)} 
        />
      </SheetContent>
    </Sheet>
  )
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="ml-4 p-2 rounded-full hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}

function NotificationBell() {
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/api/notifications');
      return response.data;
    },
    refetchInterval: 10000, // poll every 10s
  });
  const [open, setOpen] = useState(false);
  const prevCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (data && typeof window !== 'undefined') {
      if (data.count > prevCount.current) {
        audioRef.current?.play();
      }
      prevCount.current = data.count;
    }
  }, [data]);
  const notifications = data?.results || [];
  const unreadCount = notifications.length; // or filter for unread if available
  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-accent transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.2em] text-center border-2 border-background dark:border-black">
            {unreadCount}
          </span>
        )}
      </button>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-neutral-900 shadow-lg rounded-lg z-50 border border-gray-200 dark:border-neutral-800">
          <div className="p-3 border-b border-gray-100 dark:border-neutral-800 font-semibold">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.slice(0, 10).map((n: any) => (
                <li key={n._id} className="py-3 px-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{n.title || 'Notification'}</div>
                    <div className="text-xs text-muted-foreground">{n.message || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'N/A'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = router.pathname;
  const { user, logout } = useAuth();
  const isAdminPage = pathname === '/only-admin';
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        {/* Top Navigation Bar (hide on landing, login, register, and only-admin pages) */}
        {pathname !== '/' && pathname !== '/auth/login' && pathname !== '/auth/register' && !isAdminPage && (
          <header className="border-b bg-background">
            <div className="container flex h-14 items-center px-4">
              {/* Mobile: Logo + Menu Button */}
              <div className="flex md:hidden items-center gap-2 w-full justify-between">
                <div className="flex items-center gap-2">
                  <MobileNav />
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-black flex items-center justify-center font-bold text-lg shadow text-black dark:text-white">GV</div>
                </div>
                <div className="flex items-center gap-2">
                  {user && (
                    <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <UserIcon className="h-5 w-5" />
                      Hi, {user.first_name || user.email?.split('@')[0] || 'User'}
                    </span>
                  )}
                  <NotificationBell />
                  <button
                    onClick={logout}
                    className="ml-2 p-2 rounded-full hover:bg-accent transition-colors text-red-600 hover:text-red-700"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                  <ThemeToggleButton />
                </div>
              </div>
              {/* Desktop: Horizontal Navigation */}
              <div className="hidden md:flex items-center justify-between w-full">
                <div className="flex items-center">
                  <h1 className="font-bold mr-8">Green Valley Bank</h1>
                  <NavigationMenu />
                </div>
                <div className="flex items-center gap-4">
                  {/* User greeting and icon */}
                  {user && (
                    <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <UserIcon className="h-5 w-5" />
                      Hi, {user.first_name || user.email?.split('@')[0] || 'User'}
                    </span>
                  )}
                  <NotificationBell />
                  {/* Logout icon */}
                  <button
                    onClick={logout}
                    className="ml-2 p-2 rounded-full hover:bg-accent transition-colors text-red-600 hover:text-red-700"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                  <ThemeToggleButton />
                </div>
              </div>
            </div>
          </header>
        )}
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
} 