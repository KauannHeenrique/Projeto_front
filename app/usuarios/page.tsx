"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FiSearch, FiSave } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";



// Hook to get window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

interface User {
  id: number;
  nome: string;
  email: string;
  phone: string;
  accessLevel: string;
  bloco: string;
  numero: string;
  documento: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const API_URL = "http://172.20.10.2:5263";

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const response = await fetch(`${API_URL}/api/Usuario/ExibirTodosUsuarios`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ${response.status}: ${errorData.mensagem || "Falha ao buscar usuários"}`);
        }

const data = await response.json();
console.log("Usuários recebidos:", data);

        const mappedUsers: User[] = data.map((user: any) => ({
  id: user.usuarioId,
  nome: user.nome || "Nome não informado",
  email: user.email || "Email não informado",
  phone: user.telefone || "Telefone não informado",
  accessLevel:
    user.nivelAcesso === 1
      ? "Funcionário"
      : user.nivelAcesso === 2
      ? "Morador"
      : user.nivelAcesso === 3
      ? "Síndico"
      : "Desconhecido",
  bloco: user.apartamento?.bloco || "-",
  numero: String(user.apartamento?.numero ?? "-"),
  documento: String(user.documento ?? "Não informado"),
}));



        setUsers(mappedUsers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao conectar com a API";
        console.error("Erro ao buscar usuários:", errorMessage);
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const nome = String(user.nome ?? "").toLowerCase();
    const email = String(user.email ?? "").toLowerCase();
    const bloco = String(user.bloco ?? "").toLowerCase();
    const numero = String(user.numero ?? "").toLowerCase();
    const documento = String(user.documento ?? "").toLowerCase().replace(/[\.\-]/g, "");
    const search = searchTerm.toLowerCase().replace(/[\.\-]/g, "");
    return (
      nome.includes(search) ||
      email.includes(search) ||
      bloco.includes(search) ||
      numero.includes(search) ||
      documento.includes(search)
    );
  });

  const handleRemoveUser = async (userId: number) => {
    if (confirm("Tem certeza que deseja remover este morador?")) {
      try {
        const response = await fetch(`${API_URL}/api/Usuario/ExcluirUsuario/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ${response.status}: ${errorData.mensagem || "Falha ao remover morador"}`);
        }

        setUsers(users.filter((user) => user.id !== userId));
        setSuccess("Morador removido com sucesso!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao remover morador";
        console.error("Erro ao remover morador:", errorMessage);
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Barra fixa full-width */}
    <div className="sticky top-0 z-20 bg-white border-b shadow-sm w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
        <Button
          type="button"
          onClick={() => router.push("/home")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={16} />
          Voltar
        </Button>

        <Button
          type="button"
          onClick={() => router.push("/usuarios/adicionar")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded font-semibold"
        >
          <span className="mr-1 text-lg">+</span> Novo usuário
        </Button>
      </div>
    </div>

    {/* Conteúdo principal centralizado */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Usuários</h1>
        <span className="text-sm text-gray-600">
          Total de usuários: {filteredUsers.length}
        </span>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 text-sm md:text-base py-2 md:py-3"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-600">
          {searchTerm ? "Nenhum morador encontrado." : "Nenhum morador cadastrado."}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-center text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3">Bloco</th>
                <th className="px-4 py-3">Apartamento</th>
                <th className="px-4 py-3">Nível de Acesso</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={`${user.id}-${index}`}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/usuarios/${user.id}`)}
                >
                  <td className="px-4 py-3 text-left font-bold capitalize">{user.nome}</td>
                  <td className="px-4 py-3">{user.bloco}</td>
                  <td className="px-4 py-3">{user.numero}</td>
                  <td className="px-4 py-3">{user.accessLevel}</td>
                  <td
                    className="px-4 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/usuarios/${user.id}/editar`)}
                    >
                      Ver detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);
}
