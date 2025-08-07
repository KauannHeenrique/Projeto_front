"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/services/api";

interface UsuarioLogado {
  usuarioId: number;
  nome: string;
  email: string;
  documento: string;
  nivelAcesso: string;
  bloco?: string;
  apartamento?: string;
  apartamentoId?: number;
}

interface AuthContextType {
  user: UsuarioLogado | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/changePassword"];

  const handleLogout = async () => {
  try {
    await api.post("/Usuario/Logout", null, { withCredentials: true });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  } finally {
    router.push("/login");
  }
};


  const checkAuth = async () => {
  console.log("=== INICIANDO VERIFICAÇÃO DE AUTENTICAÇÃO ===");
  console.log("URL da API:", api.defaults.baseURL);

  try {
    console.log("Fazendo requisição para /Usuario/perfil...");
    const { data } = await api.get("/Usuario/perfil", {
      withCredentials: true, // <- garante envio do cookie mesmo HttpOnly
    });

    console.log("✅ Dados do perfil recebidos:", data);

    setUser({
      usuarioId: data.usuarioId,
      nome: data.nome,
      email: data.email,
      documento: data.documento,
      nivelAcesso: data.nivelAcesso,
      bloco: data.bloco,
      apartamento: data.apartamento,
      apartamentoId: data.apartamentoId,
    });

    console.log("✅ Usuário definido no contexto com sucesso");
  } catch (err: any) {
    console.error("❌ Erro ao verificar autenticação:", err);
    if (err?.response?.status === 401) {
      console.log("🔒 Token inválido, fazendo logout...");
      logout();
    } else {
      setUser(null);
    }
  } finally {
    setLoading(false);
    console.log("=== VERIFICAÇÃO DE AUTENTICAÇÃO CONCLUÍDA ===");
  }
};


  useEffect(() => {
    console.log("🔄 AuthProvider - Rota atual:", pathname);
    console.log("🔄 AuthProvider - Estado inicial:", { user, loading, isAuthenticated: !!user });
    
    if (publicRoutes.includes(pathname)) {
      console.log("📖 Rota pública, não verificando autenticação");
      setLoading(false);
      return;
    }
    
    console.log("🔐 Rota protegida, verificando autenticação...");
    checkAuth();
  }, [pathname]);

  const value = {
    user,
    loading,
    logout: handleLogout, // <- Aqui está o nome certo da função
    checkAuth,
    isAuthenticated: !!user,
  };

  console.log("📊 Estado atual do contexto:", { 
    user: user ? `${user.nome} (${user.nivelAcesso})` : null, 
    loading, 
    isAuthenticated: !!user 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
