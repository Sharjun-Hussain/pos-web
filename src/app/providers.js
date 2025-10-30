'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './providers/theme-provider';

export default function Providers({ children }) {
  return <SessionProvider>
    <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
      {children}
      </ThemeProvider></SessionProvider>;
}