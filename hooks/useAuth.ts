import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Cookies from "js-cookie";

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

export function useAuth() {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    Cookies.remove("auth_token");
    setUser(null);
    router.push("/login");
  };

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/Usuario/perfil", {
        withCredentials: true,
      });

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
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
      } else {
        console.error("Erro ao buscar perfil:", err);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, logout, checkAuth };
}
