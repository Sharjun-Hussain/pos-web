'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './providers/theme-provider';
import { SWRProvider } from './providers/swr-provider';

export default function Providers({ children }) {
  return <SessionProvider>
    <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
             <SWRProvider>

      {children}
             </SWRProvider>
      </ThemeProvider></SessionProvider>;
}