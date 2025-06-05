"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";

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
  ativo: boolean; 
}

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const API_URL = "http://172.20.10.2:5263";

  const [filtroTipo, setFiltroTipo] = useState("");
  const [valorFiltro, setValorFiltro] = useState("");
  const [modoCombinar, setModoCombinar] = useState(false);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroApartamento, setFiltroApartamento] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const formatarCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};


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
        const mappedUsers: User[] = data.map((user: any) => ({
          id: user.usuarioId,
          nome: user.nome || "Nome não informado",
          email: user.email || "Email não informado",
          phone: user.telefone || "Telefone não informado",
          accessLevel:
            user.nivelAcesso === 2 ? "Síndico" :
            user.nivelAcesso === 3 ? "Funcionário" :
            user.nivelAcesso === 4 ? "Morador" :
            "Desconhecido",
          bloco: user.apartamento?.bloco || "-",
          numero: String(user.apartamento?.numero ?? "-"),
          documento: String(user.documento ?? "Não informado"),
          ativo: user.status ?? false,
        }));

        setUsers(mappedUsers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao conectar com a API";
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (modoCombinar) {
      return (
        (!filtroNome || user.nome.toLowerCase().includes(filtroNome.toLowerCase())) &&
        (!filtroDocumento || user.documento.replace(/\D/g, "").includes(filtroDocumento.replace(/\D/g, ""))) &&
        (!filtroBloco || user.bloco.toLowerCase().includes(filtroBloco.toLowerCase())) &&
        (!filtroApartamento || user.numero.toLowerCase().includes(filtroApartamento.toLowerCase())) &&
        (!filtroNivel || user.accessLevel.toLowerCase() === filtroNivel.toLowerCase()) &&
        (!filtroStatus || user.ativo === (filtroStatus === "true"))
      );
    } else {
      if (!filtroTipo || !valorFiltro) return true;
      const val = valorFiltro.toLowerCase();
      switch (filtroTipo) {
        case "nome": return user.nome.toLowerCase().includes(val);
        case "documento": return user.documento.replace(/\D/g, "").includes(val.replace(/\D/g, ""));
        case "bloco": return user.bloco.toLowerCase().includes(val);
        case "apartamento": return user.numero.toLowerCase().includes(val);
        case "nivel": return user.accessLevel.toLowerCase() === val;
        case "status":
          return String(user.ativo) === (valorFiltro === "Ativo" ? "true" : "false");
        default: return true;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Button
            type="button"
            onClick={() => router.push("/home")}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <BsChevronDoubleLeft size={16} /> Voltar
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold mb-4">Usuários</h1>

        {!modoCombinar ? (
          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-8">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Selecione um filtro</option>
              <option value="nome">Nome</option>
              <option value="documento">Documento</option>
              <option value="bloco">Bloco</option>
              <option value="apartamento">Apartamento</option>
              <option value="nivel">Nível de Acesso</option>
              <option value="status">Status do usuário</option>
            </select>

            {filtroTipo === "status" && (
  <select
    value={valorFiltro}
    onChange={(e) => setValorFiltro(e.target.value)}
    className="border border-gray-300 rounded px-3 py-2"
  >
    <option value="">Selecione</option>
    <option value="Ativo">Ativo</option>
    <option value="Inativo">Inativo</option>
  </select>
)}

{filtroTipo && filtroTipo !== "nivel" && filtroTipo !== "status" && (
  <Input
    type="text"
    placeholder={`Digite o ${filtroTipo}`}
    value={
      filtroTipo === "documento"
        ? formatarCPF(valorFiltro)
        : valorFiltro
    }
    onChange={(e) => {
      const input = e.target.value;
      setValorFiltro(filtroTipo === "documento" ? input.replace(/\D/g, "") : input);
    }}
    className="col-span-2"
  />
)}


            {filtroTipo === "nivel" && (
              <select
                value={valorFiltro}
                onChange={(e) => setValorFiltro(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Selecione</option>
                <option value="Síndico">Síndico</option>
                <option value="Funcionário">Funcionário</option>
                <option value="Morador">Morador</option>
              </select>
            )}

            {filtroTipo && (
              <Button
                onClick={() => setModoCombinar(true)}
                variant="outline"
                className="text-xs"
              >
                Combinar filtros
              </Button>
            )}

            <div className="absolute right-0 -bottom-12 md:static md:col-span-1">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <FiSearch size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input type="text" placeholder="Nome" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
              <Input
                type="text"
                placeholder="Documento"
                value={formatarCPF(filtroDocumento)}
                onChange={(e) => setFiltroDocumento(e.target.value.replace(/\D/g, ""))}
              />
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Selecione nível</option>
                <option value="Síndico">Síndico</option>
                <option value="Funcionário">Funcionário</option>
                <option value="Morador">Morador</option>
              </select>
              <Input type="text" placeholder="Bloco" value={filtroBloco} onChange={(e) => setFiltroBloco(e.target.value)} />
              <Input type="text" placeholder="Apartamento" value={filtroApartamento} onChange={(e) => setFiltroApartamento(e.target.value)} />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Selecione status</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <FiSearch size={18} />
              </Button>
              <Button onClick={() => setModoCombinar(false)} variant="outline">
                Voltar para filtro único
              </Button>
            </div>
          </div>
        )}

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}

        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-600">
            Nenhum morador encontrado.
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
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/usuarios/${user.id}/editar`)}>
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
