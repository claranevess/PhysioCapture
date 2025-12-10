'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArgonLayout from "@/components/Argon/ArgonLayout";
import GestorDashboard from "./gestor-dashboard";
import GestorFilialDashboard from "./gestor-filial-dashboard";
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
    const userType = currentUser.user_type;

    // Gestor Geral - visão de rede
    if (userType === 'GESTOR_GERAL' || userType === 'GESTOR') {
      return <GestorDashboard currentUser={currentUser} />;
    }

    // Gestor de Filial - visão da filial
    if (userType === 'GESTOR_FILIAL') {
      return <GestorFilialDashboard currentUser={currentUser} />;
    }

    // Fisioterapeuta
    if (userType === 'FISIOTERAPEUTA') {
      return <FisioDashboard currentUser={currentUser} />;
    }

    // Atendente
    if (userType === 'ATENDENTE') {
      return <AtendenteDashboard currentUser={currentUser} />;
    }

    // Fallback
    return <FisioDashboard currentUser={currentUser} />;
  };

  return (
    <ArgonLayout>
      {renderDashboard()}
    </ArgonLayout>
  );
}