import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/10 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-1/3 top-10 h-56 w-56 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute right-1/4 top-40 h-48 w-48 rounded-full bg-secondary/40 blur-3xl" />
      </div>
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
