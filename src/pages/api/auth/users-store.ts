import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var users: User[] | undefined;
}

const users: User[] = globalThis.users || [];
if (!globalThis.users) globalThis.users = users;

export function addUser(email: string, password: string, name?: string): User {
  const id = Math.random().toString(36).slice(2);
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id, email, passwordHash, name };
  users.push(user);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function verifyUser(email: string, password: string): User | null {
  const user = findUserByEmail(email);
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    return user;
  }
  return null;
} 