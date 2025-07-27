import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '../api';

type EditForm = {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_admin?: boolean;
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/api/users');
      return res.data;
    },
  });

  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_admin: false,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({});

  const createUser = useMutation({
    mutationFn: async (user: typeof form) => {
      const res = await api.post('/api/users', user);
      return res.data;
    },
    onSuccess: () => {
      setForm({ email: '', password: '', first_name: '', last_name: '', phone_number: '', is_admin: false });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...user }: any) => {
      const res = await api.patch(`/api/users/${id}`, user);
      return res.data;
    },
    onSuccess: () => {
      setEditId(null);
      setEditForm({});
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin: User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Add User Form */}
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
            onSubmit={e => {
              e.preventDefault();
              createUser.mutate(form);
            }}
          >
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div>
              <Label>First Name</Label>
              <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Phone Number</Label>
              <Input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="is_admin" checked={form.is_admin} onChange={e => setForm(f => ({ ...f, is_admin: e.target.checked }))} />
              <Label htmlFor="is_admin">Admin</Label>
            </div>
            <Button type="submit" className="md:col-span-2">Add User</Button>
          </form>

          {/* User List */}
          {isLoading ? (
            <div>Loading users...</div>
          ) : error ? (
            <Alert variant="destructive"><AlertDescription>Error loading users</AlertDescription></Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">First Name</th>
                    <th className="p-2 border">Last Name</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Admin</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.map((user: any) => (
                    <tr key={user._id}>
                      <td className="p-2 border">{user.email}</td>
                      <td className="p-2 border">
                        {editId === user._id ? (
                          <Input value={editForm.first_name ?? user.first_name ?? ''} onChange={e => setEditForm((f: EditForm) => ({ ...f, first_name: e.target.value }))} />
                        ) : (
                          user.first_name
                        )}
                      </td>
                      <td className="p-2 border">
                        {editId === user._id ? (
                          <Input value={editForm.last_name ?? user.last_name ?? ''} onChange={e => setEditForm((f: EditForm) => ({ ...f, last_name: e.target.value }))} />
                        ) : (
                          user.last_name
                        )}
                      </td>
                      <td className="p-2 border">
                        {editId === user._id ? (
                          <Input value={editForm.phone_number ?? user.phone_number ?? ''} onChange={e => setEditForm((f: EditForm) => ({ ...f, phone_number: e.target.value }))} />
                        ) : (
                          user.phone_number
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        {editId === user._id ? (
                          <input type="checkbox" checked={editForm.is_admin ?? user.is_admin ?? false} onChange={e => setEditForm((f: EditForm) => ({ ...f, is_admin: e.target.checked }))} />
                        ) : (
                          user.is_admin ? 'Yes' : 'No'
                        )}
                      </td>
                      <td className="p-2 border flex gap-2">
                        {editId === user._id ? (
                          <>
                            <Button size="sm" onClick={() => updateUser.mutate({ id: user._id, ...editForm })}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditId(null); setEditForm({}); }}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => { setEditId(user._id); setEditForm(user); }}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteUser.mutate(user._id)}>Delete</Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 