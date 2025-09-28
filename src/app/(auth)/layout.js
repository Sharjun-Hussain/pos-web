// app/(auth)/layout.jsx

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      {children}
    </main>
  );
}