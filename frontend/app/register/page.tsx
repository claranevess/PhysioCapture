'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <p className="text-[#7F8C8D]">Redirecionando...</p>
    </div>
  );
}
