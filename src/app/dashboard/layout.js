'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import { DEMO_MODE } from '@/lib/config';

export default function DashboardLayout({ children }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace('/login');
    }
  }, [usuario, cargando, router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      {!DEMO_MODE && <ChatBot />}
    </div>
  );
}
