'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArgonLayout from "@/components/Argon/ArgonLayout";
import GestorDashboard from "./gestor-dashboard";
import FisioDashboard from "./fisio-dashboard";
import AtendenteDashboard from "./atendente-dashboard";

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/welcome');
      return;
    }
    setCurrentUser(JSON.parse(user));
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return (
      <ArgonLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="font-medium">Carregando...</p>
          </div>
        </div>
      </ArgonLayout>
    );
  }

  // Roteamento baseado no papel do usuário
  const renderDashboard = () => {
    switch (currentUser.user_type) {
      case 'GESTOR':
        return <GestorDashboard currentUser={currentUser} />;
      case 'FISIOTERAPEUTA':
        return <FisioDashboard currentUser={currentUser} />;
      case 'ATENDENTE':
        return <AtendenteDashboard currentUser={currentUser} />;
      default:
        return <FisioDashboard currentUser={currentUser} />;
    }
  };

  return (
    <ArgonLayout>
      {renderDashboard()}
    </ArgonLayout>
  );
}