import { useEffect, useState } from "react";

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
        const response = await fetch("http://172.20.10.2:5263/api/Usuario/perfil", {
          credentials: "include",
        });

        if (response.status === 401) {
          setUser(null);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  return { user, loading };
}
