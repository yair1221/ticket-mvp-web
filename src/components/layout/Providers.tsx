'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import PostHogProvider from './PostHogProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          dir="rtl"
          richColors
          closeButton
          toastOptions={{ className: 'font-sans' }}
        />
      </AuthProvider>
    </PostHogProvider>
  );
}
