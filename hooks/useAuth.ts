import { useEffect, useState } from "react";
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

export function useAuth() {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
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
          setUser(null); // não autorizado
        } else {
          console.error("Erro ao buscar perfil:", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  return { user, loading };
}
