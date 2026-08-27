'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AiContextDrawer } from '@/components/ai/AiContextDrawer';
import { useWorkspace } from '@/context/WorkspaceContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useWorkspace();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname || '/overview')}`);
    }
  }, [user, isLoading, pathname, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 min-w-0 bg-[#F7F7F5] overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <AiContextDrawer />
    </div>
  );
}
