import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { AppProps } from 'next/app';
import '../app/globals.css';
import { AuthProvider } from '../contexts/auth-context';
import Layout from '../components/layout';
import { Toaster } from '../components/ui/toaster';

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Layout>
          {/* If you have a navigation bar or sidebar, add:
          <Link href="/tax">Tax</Link>
          Place this before the link to settings. */}
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp; 