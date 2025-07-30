import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Trash2, Pencil, CheckCircle } from 'lucide-react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

export default function OnlyAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [tax, setTax] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingTab, setLoadingTab] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [editUser, setEditUser] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editAccount, setEditAccount] = useState<any>(null);
  const [editAccountForm, setEditAccountForm] = useState<any>({});
  const [editCard, setEditCard] = useState<any>(null);
  const [editCardForm, setEditCardForm] = useState<any>({});
  const [editTax, setEditTax] = useState<any>(null);
  const [editTaxForm, setEditTaxForm] = useState<any>({});
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [editTransactionForm, setEditTransactionForm] = useState<any>({});
  const [userSearch, setUserSearch] = useState('');
  const [showAddTax, setShowAddTax] = useState(false);
  const [addTaxForm, setAddTaxForm] = useState({ userId: '', amount: '', currency: 'USD', description: '', created_at: new Date().toISOString().slice(0,10) });
  const [usersAccounts, setUsersAccounts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetailTab, setUserDetailTab] = useState('accounts');
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [userTax, setUserTax] = useState<any[]>([]);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [addNotificationForm, setAddNotificationForm] = useState({ title: '', message: '' });
  const [showBulkAddTax, setShowBulkAddTax] = useState(false);
  const [bulkTaxJson, setBulkTaxJson] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addAccountForm, setAddAccountForm] = useState({ 
    account_type: 'savings', 
    initial_deposit: '', 
    currency: 'USD' 
  });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [addTransactionForm, setAddTransactionForm] = useState({ 
    transaction_type: 'deposit', 
    amount: '', 
    currency: 'USD', 
    description: '', 
    created_at: new Date().toISOString().slice(0,10),
    accountId: ''
    //created_at: new Date().toISOString().slice(0,10),
  });
  const [showBulkAddTransaction, setShowBulkAddTransaction] = useState(false);
  const [bulkTransactionJson, setBulkTransactionJson] = useState('');
  // Add state for selected transactions and tax IDs
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>([]);

  // Function to generate bulk transaction template
  const generateBulkTransactionTemplate = () => {
    if (!selectedUser || userAccounts.length === 0) {
      toast({ title: 'No user or accounts selected', variant: 'destructive' });
      return;
    }
    
    const template = [
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "deposit",
        "amount": 2250.00,
        "currency": "USD",
        "description": "Salary deposit - Google LLC",
        "created_at": "2020-01-28"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 80.00,
        "currency": "USD",
        "description": "ATM withdrawal - Chase Bank ATM",
        "created_at": "2020-02-01"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 56.23,
        "currency": "USD",
        "description": "Grocery purchase - Walmart",
        "created_at": "2020-02-06"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "transfer",
        "amount": 110.00,
        "currency": "USD",
        "description": "Transfer to savings account",
        "created_at": "2020-02-09"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "deposit",
        "amount": 2200.00,
        "currency": "USD",
        "description": "Salary deposit - Apple Inc.",
        "created_at": "2020-03-01"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 120.00,
        "currency": "USD",
        "description": "Electric bill payment - Con Edison",
        "created_at": "2020-03-02"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "transfer",
        "amount": 65.50,
        "currency": "USD",
        "description": "Monthly subscription - Netflix & Spotify",
        "created_at": "2020-03-05"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 25.00,
        "currency": "USD",
        "description": "Coffee shop - Starbucks",
        "created_at": "2020-03-07"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "deposit",
        "amount": 100.00,
        "currency": "USD",
        "description": "Reimbursement - Venmo",
        "created_at": "2021-01-14"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 42.89,
        "currency": "USD",
        "description": "Gas station - Chevron",
        "created_at": "2021-01-16"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "transfer",
        "amount": 300.00,
        "currency": "USD",
        "description": "Zelle transfer - Rent split",
        "created_at": "2021-01-28"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "deposit",
        "amount": 2100.00,
        "currency": "USD",
        "description": "Direct deposit - Amazon Inc.",
        "created_at": "2021-02-01"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 89.10,
        "currency": "USD",
        "description": "Amazon purchase - electronics",
        "created_at": "2021-02-08"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "deposit",
        "amount": 600.00,
        "currency": "USD",
        "description": "Tax refund - IRS",
        "created_at": "2022-04-15"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 30.75,
        "currency": "USD",
        "description": "Fast food - McDonald's",
        "created_at": "2022-04-16"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "transfer",
        "amount": 99.99,
        "currency": "USD",
        "description": "Subscription - Adobe Creative Cloud",
        "created_at": "2022-04-17"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 500.00,
        "currency": "USD",
        "description": "ATM withdrawal - Downtown",
        "created_at": "2022-05-05"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "deposit",
        "amount": 2150.00,
        "currency": "USD",
        "description": "Salary - Meta Platforms Inc.",
        "created_at": "2023-08-01"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 300.00,
        "currency": "USD",
        "description": "Home Depot - Hardware supplies",
        "created_at": "2023-08-03"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "transfer",
        "amount": 125.00,
        "currency": "USD",
        "description": "Venmo - Dinner split",
        "created_at": "2023-08-06"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "deposit",
        "amount": 150.00,
        "currency": "USD",
        "description": "Cash deposit - Branch Teller",
        "created_at": "2023-08-09"
      },
      {
        "userId": selectedUser._id || selectedUser.id,
        "accountId": userAccounts[0].account_number,
        "transaction_type": "withdrawal",
        "amount": 200.00,
        "currency": "USD",
        "description": "Credit card payment - Bank of America",
        "created_at": "2023-08-20"
      }
    ];
    
    
    setBulkTransactionJson(JSON.stringify(template, null, 2));
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (user?.is_admin) {
      setLoading(true);
      Promise.all([
        api.get('/api/users').then(res => setUsers(res.data.results)),
        api.get('/api/accounts').then(res => setAccounts(res.data.results)),
        api.get('/api/cards').then(res => setCards(res.data.results)),
        api.get('/api/transactions/tax').then(res => setTax(res.data.results)),
        api.get('/api/transactions/history').then(res => setTransactions(res.data.results)),
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  // Lazy-load data for each tab
  useEffect(() => {
    if (!user?.is_admin) return;
    if (tab === 'users' && users.length === 0) {
      setLoadingTab('users');
      api.get('/api/users').then(res => setUsers(res.data.results)).finally(() => setLoadingTab(''));
    }
    if (tab === 'accounts' && accounts.length === 0) {
      setLoadingTab('accounts');
      api.get('/api/accounts?adminView=true').then(res => setAccounts(res.data.results)).finally(() => setLoadingTab(''));
    }
    if (tab === 'cards' && cards.length === 0) {
      setLoadingTab('cards');
      api.get('/api/cards').then(res => setCards(res.data.results)).finally(() => setLoadingTab(''));
    }
    if (tab === 'tax' && tax.length === 0) {
      setLoadingTab('tax');
      api.get('/api/transactions/tax').then(res => setTax(res.data.results)).finally(() => setLoadingTab(''));
    }
    if (tab === 'transactions' && transactions.length === 0) {
      setLoadingTab('transactions');
      api.get('/api/transactions/history').then(res => setTransactions(res.data.results)).finally(() => setLoadingTab(''));
    }
    if (tab === 'users-accounts' && usersAccounts.length === 0) {
      setLoadingTab('users-accounts');
      Promise.all([
        api.get('/api/users').then(res => res.data.results),
        api.get('/api/accounts?adminView=true').then(res => res.data.results),
      ]).then(([usersList, accountsList]) => {
        // Map userId to accounts
        const accountsByUser: Record<string, any[]> = {};
        accountsList.forEach((a: any) => {
          const uid = a.userId?.toString() || '';
          if (!accountsByUser[uid]) accountsByUser[uid] = [];
          accountsByUser[uid].push(a);
        });
        setUsersAccounts(usersList.map((u: any) => ({
          ...u,
          accounts: accountsByUser[u._id?.toString()] || [],
        })));
      }).finally(() => setLoadingTab(''));
    }
  }, [tab, user]);

  const refreshUsers = () => api.get('/api/users').then(res => setUsers(res.data.results));
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast({ title: 'User deleted', description: 'The user was successfully deleted.' });
      console.log(`[AUDIT] Admin deleted user ${id} at ${new Date().toISOString()}`);
      refreshUsers();
    } catch (e) {
      toast({ title: 'Error deleting user', variant: 'destructive' });
    }
  };
  const handleEditUser = (user: any) => {
    setEditUser(user);
    setEditForm({ ...user });
  };
  const handleEditFormChange = (e: any) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const patchData = { ...editForm };
      if (patchData.created_at) {
        patchData.createdAt = patchData.created_at;
        delete patchData.created_at;
      }
      await api.patch(`/api/users/${editUser._id || editUser.id}`, patchData);
      toast({ title: 'User updated', description: 'The user was successfully updated.' });
      setEditUser(null);
      refreshUsers();
    } catch (e) {
      toast({ title: 'Error updating user', variant: 'destructive' });
    }
  };

  const refreshAccounts = () => api.get('/api/accounts?adminView=true').then(res => setAccounts(res.data.results));
  const handleDeleteAccount = async (account_number: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/api/accounts/${account_number}/admin`);
      toast({ title: 'Account deleted', description: 'The account was successfully deleted.' });
      console.log(`[AUDIT] Admin deleted account ${account_number} at ${new Date().toISOString()}`);
      setAccounts(prev => prev.filter((a: any) => a.account_number !== account_number));
      setUserAccounts(prev => prev.filter((a: any) => a.account_number !== account_number));
    } catch (e) {
      toast({ title: 'Error deleting account', variant: 'destructive' });
    }
  };
  const handleEditAccount = (account: any) => {
    setEditAccount(account);
    setEditAccountForm({ ...account });
  };
  const handleEditAccountFormChange = (e: any) => {
    setEditAccountForm({ ...editAccountForm, [e.target.name]: e.target.value });
  };
  const handleEditAccountFormSubmit = async (e: any) => {
    e.preventDefault();
    if (!editAccountForm.account_number || isNaN(Number(editAccountForm.balance))) {
      toast({ title: 'Account number and valid balance are required', variant: 'destructive' });
      return;
    }
    try {
      await api.patch(`/api/accounts/${editAccount.account_number}/admin`, editAccountForm);
      toast({ title: 'Account updated', description: 'The account was successfully updated.' });
      console.log(`[AUDIT] Admin edited account ${editAccountForm.account_number} at ${new Date().toISOString()}`);
      setEditAccount(null);
      refreshAccounts();
    } catch (e) {
      toast({ title: 'Error updating account', variant: 'destructive' });
    }
  };

  const handleToggleBlockAccount = async (account: any) => {
    const isBlocked = account.status === 'blocked';
    const action = isBlocked ? 'unblock' : 'block';
    
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;
    
    try {
      await api.patch(`/api/accounts/${account.account_number}/admin`, {
        status: isBlocked ? 'active' : 'blocked'
      });
      
      const message = isBlocked 
        ? 'Account unblocked successfully.' 
        : 'Account blocked successfully. User will not be able to make transfers.';
      
      toast({ 
        title: `Account ${action}ed`, 
        description: message 
      });
      
      console.log(`[AUDIT] Admin ${action}ed account ${account.account_number} at ${new Date().toISOString()}`);
      refreshAccounts();
    } catch (e) {
      toast({ title: `Error ${action}ing account`, variant: 'destructive' });
    }
  };

  const refreshCards = () => api.get('/api/cards').then(res => setCards(res.data.results));
  const handleDeleteCard = async (card_number: string) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await api.delete(`/api/cards/${card_number}/admin`);
      toast({ title: 'Card deleted', description: 'The card was successfully deleted.' });
      console.log(`[AUDIT] Admin deleted card ${card_number} at ${new Date().toISOString()}`);
      refreshCards();
    } catch (e) {
      toast({ title: 'Error deleting card', variant: 'destructive' });
    }
  };
  const handleEditCard = (card: any) => {
    setEditCard(card);
    setEditCardForm({ ...card });
  };
  const handleEditCardFormChange = (e: any) => {
    setEditCardForm({ ...editCardForm, [e.target.name]: e.target.value });
  };
  const handleEditCardFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.patch(`/api/cards/${editCard.card_number}/admin`, editCardForm);
      toast({ title: 'Card updated', description: 'The card was successfully updated.' });
      setEditCard(null);
      refreshCards();
    } catch (e) {
      toast({ title: 'Error updating card', variant: 'destructive' });
    }
  };

  const refreshTax = () => api.get('/api/transactions/tax').then(res => setTax(res.data.results));
  const handleDeleteTax = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tax transaction?')) return;
    try {
      await api.delete(`/api/transactions/tax/${id}`);
      toast({ title: 'Tax transaction deleted', description: 'The tax transaction was successfully deleted.' });
      console.log(`[AUDIT] Admin deleted tax transaction ${id} at ${new Date().toISOString()}`);
      refreshTax();
    } catch (e) {
      toast({ title: 'Error deleting tax transaction', variant: 'destructive' });
    }
  };
  const handleEditTax = (tax: any) => {
    setEditTax(tax);
    setEditTaxForm({ ...tax });
  };
  const handleEditTaxFormChange = (e: any) => {
    setEditTaxForm({ ...editTaxForm, [e.target.name]: e.target.value });
  };
  const handleEditTaxFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.patch(`/api/transactions/tax/${editTax.id}`, editTaxForm);
      toast({ title: 'Tax transaction updated', description: 'The tax transaction was successfully updated.' });
      setEditTax(null);
      refreshTax();
    } catch (e) {
      toast({ title: 'Error updating tax transaction', variant: 'destructive' });
    }
  };

  const handleAddTaxFormChange = (e: any) => {
    setAddTaxForm({ ...addTaxForm, [e.target.name]: e.target.value });
  };
  const handleAddTaxFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/api/transactions/tax', {
        userId: selectedUser._id || selectedUser.id,
        amount: addTaxForm.amount,
        currency: addTaxForm.currency,
        description: addTaxForm.description,
        created_at: addTaxForm.created_at,
      });
      toast({ title: 'Tax transaction added', description: 'The tax transaction was successfully added.' });
      setShowAddTax(false);
      setAddTaxForm({ userId: '', amount: '', currency: 'USD', description: '', created_at: new Date().toISOString().slice(0,10) });
      // Refresh user tax transactions
      const res = await api.get(`/api/transactions/tax?userId=${selectedUser._id || selectedUser.id}`);
      setUserTax(res.data.results);
    } catch (e) {
      toast({ title: 'Error adding tax transaction', variant: 'destructive' });
    }
  };

  const handleAddAccountFormChange = (e: any) => {
    setAddAccountForm({ ...addAccountForm, [e.target.name]: e.target.value });
  };
  const handleAddAccountFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/api/accounts', {
        userId: selectedUser._id || selectedUser.id,
        account_type: addAccountForm.account_type,
        initial_deposit: parseFloat(addAccountForm.initial_deposit),
        currency: addAccountForm.currency,
      });
      toast({ title: 'Account created', description: 'The account was successfully created for the user.' });
      setShowAddAccount(false);
      setAddAccountForm({ account_type: 'savings', initial_deposit: '', currency: 'USD' });
      // Refresh user accounts
      const res = await api.get(`/api/accounts?adminView=true&userId=${selectedUser._id || selectedUser.id}`);
      setUserAccounts(res.data.results);
    } catch (e) {
      toast({ title: 'Error creating account', variant: 'destructive' });
    }
  };

  const handleAddTransactionFormChange = (e: any) => {
    setAddTransactionForm({ ...addTransactionForm, [e.target.name]: e.target.value });
  };
  const handleAddTransactionFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/api/transactions', {
        userId: selectedUser._id || selectedUser.id,
        transaction_type: addTransactionForm.transaction_type,
        amount: parseFloat(addTransactionForm.amount),
        currency: addTransactionForm.currency,
        description: addTransactionForm.description,
        created_at: addTransactionForm.created_at,
        accountId: addTransactionForm.accountId,
      });
      toast({ title: 'Transaction added', description: 'The transaction was successfully added for the user.' });
      setShowAddTransaction(false);
      setAddTransactionForm({ transaction_type: 'deposit', amount: '', currency: 'USD', description: '', created_at: new Date().toISOString().slice(0,10) , accountId: '' });
      // Refresh user transactions
      const res = await api.get(`/api/transactions/history?userId=${selectedUser._id || selectedUser.id}`);
      setUserTransactions(res.data.results);
    } catch (e) {
      toast({ title: 'Error adding transaction', variant: 'destructive' });
    }
  };

  // Auto-populate accountId when opening transaction form
  const openAddTransactionForm = () => {
    if (userAccounts.length === 1) {
      setAddTransactionForm(prev => ({
        ...prev,
        accountId: userAccounts[0].account_number
      }));
    }
    setShowAddTransaction(true);
  };

  const refreshTransactions = () => api.get('/api/transactions/history').then(res => setTransactions(res.data.results));
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      toast({ title: 'Transaction deleted', description: 'The transaction was successfully deleted.' });
      console.log(`[AUDIT] Admin deleted transaction ${id} at ${new Date().toISOString()}`);
      refreshTransactions();
    } catch (e) {
      toast({ title: 'Error deleting transaction', variant: 'destructive' });
    }
  };
  const handleEditTransaction = (tr: any) => {
    setEditTransaction(tr);
    setEditTransactionForm({ ...tr });
  };
  const handleEditTransactionFormChange = (e: any) => {
    setEditTransactionForm({ ...editTransactionForm, [e.target.name]: e.target.value });
  };
  const handleEditTransactionFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.patch(`/api/transactions/${editTransaction.id}`, editTransactionForm);
      toast({ title: 'Transaction updated', description: 'The transaction was successfully updated.' });
      setEditTransaction(null);
      refreshTransactions();
    } catch (e) {
      toast({ title: 'Error updating transaction', variant: 'destructive' });
    }
  };

  const openUserDetail = async (user: any) => {
    setSelectedUser(user);
    setUserDetailTab('accounts');
    setLoadingUserDetail(true);
    Promise.all([
      api.get(`/api/accounts?adminView=true&userId=${user._id || user.id}`).then(res => res.data.results),
      api.get(`/api/cards?userId=${user._id || user.id}`).then(res => res.data.results),
      api.get(`/api/transactions/history?userId=${user._id || user.id}`).then(res => res.data.results),
      api.get(`/api/transactions/tax?userId=${user._id || user.id}`).then(res => res.data.results),
    ]).then(([accounts, cards, transactions, tax]) => {
      setUserAccounts(accounts);
      setUserCards(cards);
      setUserTransactions(transactions);
      setUserTax(tax);
    }).finally(() => setLoadingUserDetail(false));
  };

  // Handler for selecting/deselecting transactions
  const handleSelectTransaction = (id: string) => {
    setSelectedTransactionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const handleSelectAllTransactions = () => {
    if (selectedTransactionIds.length === userTransactions.length) {
      setSelectedTransactionIds([]);
    } else {
      setSelectedTransactionIds(userTransactions.map((tr: any) => tr.id));
    }
  };

  // Handler for selecting/deselecting tax
  const handleSelectTax = (id: string) => {
    setSelectedTaxIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const handleSelectAllTax = () => {
    if (selectedTaxIds.length === userTax.length) {
      setSelectedTaxIds([]);
    } else {
      setSelectedTaxIds(userTax.map((t: any) => t.id));
    }
  };

  // Bulk delete handlers
  const handleBulkDeleteTransactions = async () => {
    if (!window.confirm('Are you sure you want to delete the selected transactions?')) return;
    try {
      await Promise.all(selectedTransactionIds.map(id => api.delete(`/api/transactions/${id}`)));
      toast({ title: 'Transactions deleted', description: `${selectedTransactionIds.length} transactions deleted.` });
      setSelectedTransactionIds([]);
      // Refresh userTransactions
      const res = await api.get(`/api/transactions/history?userId=${selectedUser._id || selectedUser.id}`);
      setUserTransactions(res.data.results);
    } catch (e) {
      toast({ title: 'Error deleting transactions', variant: 'destructive' });
    }
  };
  const handleBulkDeleteTax = async () => {
    if (!window.confirm('Are you sure you want to delete the selected tax transactions?')) return;
    try {
      await Promise.all(selectedTaxIds.map(id => api.delete(`/api/transactions/tax/${id}`)));
      toast({ title: 'Tax transactions deleted', description: `${selectedTaxIds.length} tax transactions deleted.` });
      setSelectedTaxIds([]);
      // Refresh userTax
      const res = await api.get(`/api/transactions/tax?userId=${selectedUser._id || selectedUser.id}`);
      setUserTax(res.data.results);
    } catch (e) {
      toast({ title: 'Error deleting tax transactions', variant: 'destructive' });
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user?.is_admin) {
    return <div className="flex items-center justify-center min-h-screen text-red-600 font-bold text-xl">Access denied. Admins only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-neutral-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            aria-label="Logout"
            onClick={() => { localStorage.removeItem('token'); router.replace('/auth/login'); }}
            className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
          >
            <LogOut className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Show main tabs only if not viewing a user */}
        {!selectedUser && (
          <Card className="bg-white dark:bg-black rounded-xl shadow">
            <CardHeader>
              <CardTitle>Manage Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                  <h2 className="font-semibold mb-2">All Users</h2>
                  {loadingTab === 'users' ? (
                    <div className="py-8 text-center">Loading...</div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="mb-4 w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800"
                      />
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">Admin</th>
                              <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.filter((u: any) => {
                              const q = userSearch.toLowerCase();
                              return (
                                u.email?.toLowerCase().includes(q) ||
                                (u.name && u.name.toLowerCase().includes(q)) ||
                                ((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase().includes(q)
                              );
                            }).map((u: any) => (
                              <tr key={u._id || u.id} className="border-b">
                                <td className="p-2">{u.email}</td>
                                <td className="p-2">{u.name || `${u.first_name || ''} ${u.last_name || ''}`}</td>
                                <td className="p-2">{u.is_admin ? 'Yes' : 'No'}</td>
                                <td className="p-2">
                                  <button className="text-blue-600 mr-2" onClick={() => handleEditUser(u)} title="Edit">
                                    <Pencil className="inline w-4 h-4 mr-1" /> Edit
                                  </button>
                                  <button className="text-green-600 mr-2" onClick={() => openUserDetail(u)} title="View">
                                    View
                                  </button>
                                  <button className="text-red-600" onClick={() => handleDeleteUser(u._id || u.id)} title="Delete">
                                    <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
        {/* User Detail Modal (full screen) */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={v => !v && setSelectedUser(null)}>
            <DialogContent className="max-w-5xl w-full min-h-[80vh] bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col">
              <DialogHeader className="flex flex-row items-center justify-between w-full">
                <DialogTitle>User: {selectedUser.email}</DialogTitle>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedUser(null)} className="ml-auto p-2 rounded hover:bg-gray-200 dark:hover:bg-neutral-800">Close</button>
                  <button
                    className="ml-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded"
                    onClick={() => setShowAddNotification(true)}
                  >
                    Add Notification
                  </button>
                </div>
              </DialogHeader>
              <Tabs value={userDetailTab} onValueChange={setUserDetailTab} className="w-full mt-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="accounts">Accounts</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="tax">Tax</TabsTrigger>
                </TabsList>
                <TabsContent value="accounts">
                  {loadingUserDetail ? <div className="py-8 text-center">Loading...</div> : (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left">Account #</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Balance</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userAccounts.map((a: any) => (
                            <tr key={a.account_number} className="border-b">
                              <td className="p-2">{a.account_number}</td>
                              <td className="p-2">{a.account_type}</td>
                              <td className="p-2">{a.balance}</td>
                              <td className="p-2">{a.status}</td>
                              <td className="p-2">
                                <button className="text-blue-600 mr-2" onClick={() => handleEditAccount(a)}><Pencil className="inline w-4 h-4 mr-1" /> Edit</button>
                                <button 
                                  className={`mr-2 ${a.status === 'blocked' ? 'text-green-600' : 'text-orange-600'}`} 
                                  onClick={() => handleToggleBlockAccount(a)}
                                >
                                  {a.status === 'blocked' ? 'Unblock' : 'Block'}
                                </button>
                                <button className="text-red-600" onClick={() => handleDeleteAccount(a.account_number)}><Trash2 className="inline w-4 h-4 mr-1" /> Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!loadingUserDetail && (
                    <div className="flex gap-2 mb-4 mt-4">
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        onClick={() => setShowAddAccount(true)}
                      >
                        Add Account
                      </button>
                    </div>
                  )}
                  {editAccount && (
                    <Dialog open={!!editAccount} onOpenChange={v => !v && setEditAccount(null)}>
                      <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
                        <DialogHeader>
                          <DialogTitle>Edit Account</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditAccountFormSubmit} className="space-y-4">
                          <div>
                            <label className="block mb-1">Account Number</label>
                            <input name="account_number" value={editAccountForm.account_number || ''} onChange={handleEditAccountFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" disabled />
                          </div>
                          <div>
                            <label className="block mb-1">Account Type</label>
                            <input name="account_type" value={editAccountForm.account_type || ''} onChange={handleEditAccountFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
                          </div>
                          <div>
                            <label className="block mb-1">Balance</label>
                            <input name="balance" value={editAccountForm.balance || ''} onChange={handleEditAccountFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" type="number" />
                          </div>
                          <div>
                            <label className="block mb-1">Status</label>
                            <input name="status" value={editAccountForm.status || ''} onChange={handleEditAccountFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditAccount(null)}>Cancel</button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </TabsContent>
                <TabsContent value="cards">
                  {loadingUserDetail ? <div className="py-8 text-center">Loading...</div> : (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left">Card #</th>
                            <th className="p-2 text-left">Holder</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userCards.map((c: any) => (
                            <tr key={c.card_number || c.id} className="border-b">
                              <td className="p-2">{c.card_number || c.id}</td>
                              <td className="p-2">{c.card_holder_name}</td>
                              <td className="p-2">{c.card_type}</td>
                              <td className="p-2">{c.status}</td>
                              <td className="p-2">
                                <button className="text-blue-600 mr-2" onClick={() => handleEditCard(c)}><Pencil className="inline w-4 h-4 mr-1" /> Edit</button>
                                <button className="text-red-600" onClick={() => handleDeleteCard(c.card_number || c.id)}><Trash2 className="inline w-4 h-4 mr-1" /> Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="transactions">
                  {loadingUserDetail ? <div className="py-8 text-center">Loading...</div> : (
                    <>
                      {selectedTransactionIds.length > 0 && (
                        <div className="mb-2">
                          <button
                            className="bg-red-600 text-white px-4 py-2 rounded"
                            onClick={handleBulkDeleteTransactions}
                          >
                            Delete Selected ({selectedTransactionIds.length})
                          </button>
                        </div>
                      )}
                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedTransactionIds.length === userTransactions.length && userTransactions.length > 0}
                                  onChange={handleSelectAllTransactions}
                                />
                              </th>
                              <th className="p-2 text-left">ID</th>
                              <th className="p-2 text-left">Type</th>
                              <th className="p-2 text-left">Amount</th>
                              <th className="p-2 text-left">Currency</th>
                              <th className="p-2 text-left">Date</th>
                              <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userTransactions.map((tr: any) => (
                              <tr key={tr.id} className="border-b">
                                <td className="p-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedTransactionIds.includes(tr.id)}
                                    onChange={() => handleSelectTransaction(tr.id)}
                                  />
                                </td>
                                <td className="p-2">{tr.id}</td>
                                <td className="p-2">{tr.transaction_type}</td>
                                <td className="p-2">{tr.amount}</td>
                                <td className="p-2">{tr.currency}</td>
                                <td className="p-2">{tr.created_at}</td>
                                <td className="p-2">
                                  <button className="text-blue-600 mr-2" onClick={() => handleEditTransaction(tr)}><Pencil className="inline w-4 h-4 mr-1" /> Edit</button>
                                  <button className="text-red-600" onClick={() => handleDeleteTransaction(tr.id)}><Trash2 className="inline w-4 h-4 mr-1" /> Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  {!loadingUserDetail && (
                    <div className="flex gap-2 mb-4 mt-4">
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        onClick={openAddTransactionForm}
                      >
                        Add Transaction
                      </button>
                      <button
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded"
                        onClick={() => setShowBulkAddTransaction(true)}
                      >
                        Bulk Add Transaction
                      </button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="tax">
                  {loadingUserDetail ? <div className="py-8 text-center">Loading...</div> : (
                    <>
                      {selectedTaxIds.length > 0 && (
                        <div className="mb-2">
                          <button
                            className="bg-red-600 text-white px-4 py-2 rounded"
                            onClick={handleBulkDeleteTax}
                          >
                            Delete Selected ({selectedTaxIds.length})
                          </button>
                        </div>
                      )}
                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedTaxIds.length === userTax.length && userTax.length > 0}
                                  onChange={handleSelectAllTax}
                                />
                              </th>
                              <th className="p-2 text-left">ID</th>
                              <th className="p-2 text-left">Amount</th>
                              <th className="p-2 text-left">Currency</th>
                              <th className="p-2 text-left">Date</th>
                              <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userTax.map((t: any) => (
                              <tr key={t.id} className="border-b">
                                <td className="p-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedTaxIds.includes(t.id)}
                                    onChange={() => handleSelectTax(t.id)}
                                  />
                                </td>
                                <td className="p-2">{t.id}</td>
                                <td className="p-2">{t.amount}</td>
                                <td className="p-2">{t.currency}</td>
                                <td className="p-2">{t.created_at}</td>
                                <td className="p-2">
                                  <button className="text-blue-600 mr-2" onClick={() => handleEditTax(t)}><Pencil className="inline w-4 h-4 mr-1" /> Edit</button>
                                  <button className="text-red-600" onClick={() => handleDeleteTax(t.id)}><Trash2 className="inline w-4 h-4 mr-1" /> Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {!loadingUserDetail && (
                        <div className="flex gap-2 mb-4">
                          <button
                            className="bg-green-600 text-white px-4 py-2 rounded"
                            onClick={() => setShowAddTax(true)}
                          >
                            Add Tax Transaction
                          </button>
                          <button
                            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded"
                            onClick={() => setShowBulkAddTax(true)}
                          >
                            Bulk Add Tax
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {editUser && (
        <Dialog open={!!editUser} onOpenChange={v => !v && setEditUser(null)}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input name="email" value={editForm.email || ''} onChange={handleEditFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div>
                <label className="block mb-1">Name</label>
                <input name="name" value={editForm.name || ''} onChange={handleEditFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div>
                <label className="block mb-1">Registration Date</label>
                <input
                  name="created_at"
                  type="date"
                  value={editForm.created_at ? editForm.created_at.slice(0, 10) : ''}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800"
                />
              </div>
              <div>
                <label className="block mb-1">Admin</label>
                <select name="is_admin" value={editForm.is_admin ? 'true' : 'false'} onChange={e => setEditForm({ ...editForm, is_admin: e.target.value === 'true' })} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditUser(null)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {editCard && (
        <Dialog open={!!editCard} onOpenChange={v => !v && setEditCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditCardFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Card Number</label>
                <input name="card_number" value={editCardForm.card_number || ''} onChange={handleEditCardFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Card Holder Name</label>
                <input name="card_holder_name" value={editCardForm.card_holder_name || ''} onChange={handleEditCardFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Card Type</label>
                <input name="card_type" value={editCardForm.card_type || ''} onChange={handleEditCardFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Status</label>
                <input name="status" value={editCardForm.status || ''} onChange={handleEditCardFormChange} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditCard(null)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {editTax && (
        <Dialog open={!!editTax} onOpenChange={v => !v && setEditTax(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tax Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditTaxFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">ID</label>
                <input name="id" value={editTaxForm.id || ''} onChange={handleEditTaxFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Amount</label>
                <input name="amount" value={editTaxForm.amount || ''} onChange={handleEditTaxFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Currency</label>
                <input name="currency" value={editTaxForm.currency || ''} onChange={handleEditTaxFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Date</label>
                <input name="created_at" value={editTaxForm.created_at || ''} onChange={handleEditTaxFormChange} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditTax(null)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {editTransaction && (
        <Dialog open={!!editTransaction} onOpenChange={v => !v && setEditTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditTransactionFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">ID</label>
                <input name="id" value={editTransactionForm.id || ''} onChange={handleEditTransactionFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Type</label>
                <input name="transaction_type" value={editTransactionForm.transaction_type || ''} onChange={handleEditTransactionFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Amount</label>
                <input name="amount" value={editTransactionForm.amount || ''} onChange={handleEditTransactionFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Currency</label>
                <input name="currency" value={editTransactionForm.currency || ''} onChange={handleEditTransactionFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1">Date</label>
                <input name="created_at" value={editTransactionForm.created_at || ''} onChange={handleEditTransactionFormChange} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditTransaction(null)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {showAddNotification && (
        <Dialog open={showAddNotification} onOpenChange={v => !v && setShowAddNotification(false)}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Add Notification</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async e => {
                e.preventDefault();
                try {
                  await api.post('/api/notifications', {
                    userId: selectedUser._id || selectedUser.id,
                    title: addNotificationForm.title,
                    message: addNotificationForm.message,
                  });
                  toast({ title: 'Notification sent', description: 'The notification was sent to the user.' });
                  setShowAddNotification(false);
                  setAddNotificationForm({ title: '', message: '' });
                } catch (e) {
                  toast({ title: 'Error sending notification', variant: 'destructive' });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1">Title</label>
                <input name="title" value={addNotificationForm.title} onChange={e => setAddNotificationForm({ ...addNotificationForm, title: e.target.value })} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div>
                <label className="block mb-1">Message</label>
                <textarea name="message" value={addNotificationForm.message} onChange={e => setAddNotificationForm({ ...addNotificationForm, message: e.target.value })} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAddNotification(false)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {showAddAccount && (
        <Dialog open={showAddAccount} onOpenChange={v => !v && setShowAddAccount(false)}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Add Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAccountFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Account Type</label>
                <select name="account_type" value={addAccountForm.account_type} onChange={handleAddAccountFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800">
                  <option value="savings">Savings</option>
                  <option value="checking">Checking</option>
                  <option value="business">Business</option>
                  <option value="fixed">Fixed Deposit</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Initial Deposit</label>
                <input name="initial_deposit" value={addAccountForm.initial_deposit} onChange={handleAddAccountFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" type="number" step="0.01" />
              </div>
              <div>
                <label className="block mb-1">Currency</label>
                <select name="currency" value={addAccountForm.currency} onChange={handleAddAccountFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Account</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAddAccount(false)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {showAddTransaction && (
        <Dialog open={showAddTransaction} onOpenChange={v => !v && setShowAddTransaction(false)}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTransactionFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Type</label>
                <select name="transaction_type" value={addTransactionForm.transaction_type} onChange={handleAddTransactionFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800">
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="transfer">Transfer</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Amount</label>
                <input name="amount" value={addTransactionForm.amount} onChange={handleAddTransactionFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" type="number" step="0.01" />
              </div>
              <div>
                <label className="block mb-1">Currency</label>
                <select name="currency" value={addTransactionForm.currency} onChange={handleAddTransactionFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <input name="description" value={addTransactionForm.description} onChange={handleAddTransactionFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div>
                <label className="block mb-1">Date</label>
                <input name="created_at" value={addTransactionForm.created_at} onChange={handleAddTransactionFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" type="date" />
              </div>
              <div>
                <label className="block mb-1">Account</label>
                <select name="accountId" value={addTransactionForm.accountId} onChange={handleAddTransactionFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800">
                  <option value="">Select an account</option>
                  {userAccounts.map((account: any) => (
                    <option key={account.account_number} value={account.account_number}>{account.account_number} ({account.account_type})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Transaction</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAddTransaction(false)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {showBulkAddTransaction && (
        <Dialog open={showBulkAddTransaction} onOpenChange={v => !v && setShowBulkAddTransaction(false)}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Bulk Add Transactions</DialogTitle>
            </DialogHeader>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>User:</strong> {selectedUser?.email}<br/>
                <strong>Available Accounts:</strong> {userAccounts.map((acc: any) => acc.account_number).join(', ')}
              </p>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                try {
                  const parsed = JSON.parse(bulkTransactionJson);
                  if (!Array.isArray(parsed)) throw new Error('JSON must be an array');
                  
                  // Auto-populate userId and accountId if not provided
                  const processedTransactions = parsed.map(tx => ({
                    ...tx,
                    userId: tx.userId || selectedUser._id || selectedUser.id,
                    accountId: tx.accountId || userAccounts[0]?.account_number
                  }));
                  
                  await api.post('/api/transactions', { bulk: true, transactions: processedTransactions });
                  toast({ title: 'Bulk transactions added', description: `${processedTransactions.length} transactions added.` });
                  setShowBulkAddTransaction(false);
                  setBulkTransactionJson('');
                  // Refresh userTransactions
                  const res = await api.get(`/api/transactions/history?userId=${selectedUser._id || selectedUser.id}`);
                  setUserTransactions(res.data.results);
                } catch (e: any) {
                  toast({ title: 'Error adding bulk transactions', description: e.message || 'Invalid JSON', variant: 'destructive' });
                }
              }}
              className="space-y-4"
            >
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={generateBulkTransactionTemplate}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Generate Template
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTransactionJson('')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Clear
                </button>
              </div>
              <div>
                <label className="block mb-1">Paste JSON Array (userId and accountId will be auto-filled)</label>
                <textarea
                  value={bulkTransactionJson}
                  onChange={e => setBulkTransactionJson(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800 min-h-[200px]"
                  placeholder='[
  {
    "transaction_type": "deposit",
    "amount": 100,
    "currency": "USD",
    "description": "Salary deposit",
    "created_at": "2024-06-01"
  },
  {
    "transaction_type": "withdrawal", 
    "amount": 50,
    "currency": "USD",
    "description": "ATM withdrawal",
    "created_at": "2024-06-02"
  }
]'
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Bulk</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowBulkAddTransaction(false)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {showAddTax && (
        <Dialog open={showAddTax} onOpenChange={v => !v && setShowAddTax(false)}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Add Tax Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTaxFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Amount</label>
                <input name="amount" value={addTaxForm.amount} onChange={handleAddTaxFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" type="number" step="0.01" />
              </div>
              <div>
                <label className="block mb-1">Currency</label>
                <select name="currency" value={addTaxForm.currency} onChange={handleAddTaxFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <input name="description" value={addTaxForm.description} onChange={handleAddTaxFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" />
              </div>
              <div>
                <label className="block mb-1">Date</label>
                <input name="created_at" value={addTaxForm.created_at} onChange={handleAddTaxFormChange} className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800" type="date" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Tax Transaction</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAddTax(false)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {showBulkAddTax && (
        <Dialog open={showBulkAddTax} onOpenChange={v => !v && setShowBulkAddTax(false)}>
          <DialogContent className="max-w-lg w-full bg-white dark:bg-black text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Bulk Add Tax Transactions</DialogTitle>
            </DialogHeader>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>User:</strong> {selectedUser?.email}
              </p>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                try {
                  const parsed = JSON.parse(bulkTaxJson);
                  if (!Array.isArray(parsed)) throw new Error('JSON must be an array');
                  
                  // Auto-populate userId if not provided
                  const processedTaxes = parsed.map(tax => ({
                    ...tax,
                    userId: tax.userId || selectedUser._id || selectedUser.id,
                  }));
                  
                  await api.post('/api/transactions/tax', { bulk: true, taxes: processedTaxes });
                  toast({ title: 'Bulk tax transactions added', description: `${processedTaxes.length} tax transactions added.` });
                  setShowBulkAddTax(false);
                  setBulkTaxJson('');
                  // Refresh userTax
                  const res = await api.get(`/api/transactions/tax?userId=${selectedUser._id || selectedUser.id}`);
                  setUserTax(res.data.results);
                } catch (e: any) {
                  toast({ title: 'Error adding bulk tax transactions', description: e.message || 'Invalid JSON', variant: 'destructive' });
                }
              }}
              className="space-y-4"
            >
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedUser) {
                      toast({ title: 'No user selected', variant: 'destructive' });
                      return;
                    }
                    const template = [
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 150.00,
                        "currency": "USD",
                        "description": "Federal income tax payment",
                        "created_at": "2020-04-15"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 89.75,
                        "currency": "USD",
                        "description": "State tax withholding",
                        "created_at": "2020-08-12"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 65.00,
                        "currency": "USD",
                        "description": "Local property tax charge",
                        "created_at": "2021-02-20"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 200.00,
                        "currency": "USD",
                        "description": "Sales tax remittance",
                        "created_at": "2021-06-30"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 78.50,
                        "currency": "USD",
                        "description": "Vehicle registration tax",
                        "created_at": "2022-01-10"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 300.00,
                        "currency": "USD",
                        "description": "Quarterly estimated tax payment",
                        "created_at": "2022-09-15"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 45.25,
                        "currency": "USD",
                        "description": "Tourism occupancy tax",
                        "created_at": "2023-03-22"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 99.99,
                        "currency": "USD",
                        "description": "Digital services tax",
                        "created_at": "2023-07-14"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 125.00,
                        "currency": "USD",
                        "description": "Self-employment tax contribution",
                        "created_at": "2024-02-05"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 59.00,
                        "currency": "USD",
                        "description": "State franchise tax",
                        "created_at": "2024-11-30"
                      },
                      {
                        "userId": selectedUser._id || selectedUser.id,
                        "amount": 82.00,
                        "currency": "USD",
                        "description": "Back tax settlement - IRS",
                        "created_at": "2025-07-01"
                      }
                    ];
                    
                    setBulkTaxJson(JSON.stringify(template, null, 2));
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Generate Template
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTaxJson('')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Clear
                </button>
              </div>
              <div>
                <label className="block mb-1">Paste JSON Array (userId will be auto-filled)</label>
                <textarea
                  value={bulkTaxJson}
                  onChange={e => setBulkTaxJson(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-800 min-h-[200px]"
                  placeholder='[
  {
    "amount": 100,
    "currency": "USD",
    "description": "Income tax",
    "created_at": "2024-06-01"
  },
  {
    "amount": 50,
    "currency": "USD",
    "description": "Property tax",
    "created_at": "2024-06-02"
  }
]'
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Bulk Tax</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowBulkAddTax(false)}>Cancel</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 