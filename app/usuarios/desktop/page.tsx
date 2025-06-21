"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FiSearch, FiFileText } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";
import api from "@/services/api";
import { formatCPF, cleanDocument } from "@/services/formatValues";

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

interface Visitante {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
  nomeEmpresa?: string;
  cnpj?: string;
  status: boolean; // ✅ adicionado
}



export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [abaAtiva, setAbaAtiva] = useState<"usuarios" | "visitantes">("usuarios");
  const [modoCombinarVisitante, setModoCombinarVisitante] = useState(false);
  const [filtroTipoVisitante, setFiltroTipoVisitante] = useState("");
const [valorFiltroVisitante, setValorFiltroVisitante] = useState("");
  
// Para VISITANTES
const [filtroNomeVisitante, setFiltroNomeVisitante] = useState("");
const [filtroDocumentoVisitante, setFiltroDocumentoVisitante] = useState("");
const [filtroTelefoneVisitante, setFiltroTelefoneVisitante] = useState("");
const [filtroStatusVisitante, setFiltroStatusVisitante] = useState("");

  const [filtroTipo, setFiltroTipo] = useState("");
  const [valorFiltro, setValorFiltro] = useState("");
  const [modoCombinar, setModoCombinar] = useState(false);
 const [filtroNomeUsuario, setFiltroNomeUsuario] = useState("");
const [filtroDocumentoUsuario, setFiltroDocumentoUsuario] = useState("");
const [filtroBlocoUsuario, setFiltroBlocoUsuario] = useState("");
const [filtroApartamento, setFiltroApartamento] = useState("");
const [filtroNivel, setFiltroNivel] = useState("");
const [filtroStatusUsuario, setFiltroStatusUsuario] = useState("");


  const [visitantes, setVisitantes] = useState<Visitante[]>([]);

useEffect(() => {
  const fetchVisitantes = async () => {
    try {
      const { data } = await api.get("/Visitante/ExibirTodosVisitantes");
      const mappedVisitantes = data.map((v: any) => ({
        id: v.id,
        nome: v.nome,
        documento: v.documento,
        telefone: v.telefone,
        nomeEmpresa: v.nomeEmpresa,
        cnpj: v.cnpj,
        status: v.status ?? false, // 👈 aqui mapeamos o status
      }));
      setVisitantes(mappedVisitantes);
    } catch (err) {
      console.error("Erro ao buscar visitantes:", err);
    }
  };

  fetchVisitantes();
}, []);



  useEffect(() => {
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await api.get("/Usuario/ExibirTodosUsuarios");

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
      (!filtroNomeUsuario || user.nome.toLowerCase().includes(filtroNomeUsuario.toLowerCase())) &&
      (!filtroDocumentoUsuario || user.documento.replace(/\D/g, "").includes(filtroDocumentoUsuario.replace(/\D/g, ""))) &&
      (!filtroBlocoUsuario || user.bloco.toLowerCase().includes(filtroBlocoUsuario.toLowerCase())) &&
      (!filtroApartamento || user.numero.toLowerCase().includes(filtroApartamento.toLowerCase())) &&
      (!filtroNivel || user.accessLevel.toLowerCase() === filtroNivel.toLowerCase()) &&
      (!filtroStatusUsuario || user.ativo === (filtroStatusUsuario === "true"))
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


  const totalExibidos = filteredUsers.length;

  const [modoOrdenacao, setModoOrdenacao] = useState<"az" | "recentes" | "antigos">("az");

const toggleOrdenacao = () => {
  const proximoModo = modoOrdenacao === "az"
    ? "recentes"
    : modoOrdenacao === "recentes"
    ? "antigos"
    : "az";
  setModoOrdenacao(proximoModo);
};

const getOrdenados = () => {
  const copia = [...filteredUsers];
  switch (modoOrdenacao) {
    case "az":
      return copia.sort((a, b) => a.nome.localeCompare(b.nome));
    case "recentes":
      return copia.sort((a, b) => b.id - a.id);
    case "antigos":
      return copia.sort((a, b) => a.id - b.id);
    default:
      return copia;
  }
};

const usuariosOrdenados = getOrdenados();

const visitantesFiltrados = visitantes.filter((v) => {
  if (modoCombinarVisitante) {
    const nomeOK = !filtroNomeVisitante || v.nome.toLowerCase().includes(filtroNomeVisitante.toLowerCase());
    const docOK = !filtroDocumentoVisitante || v.documento.replace(/\D/g, "").includes(filtroDocumentoVisitante.replace(/\D/g, ""));
    const telOK = !filtroTelefoneVisitante || v.telefone?.replace(/\D/g, "").includes(filtroTelefoneVisitante.replace(/\D/g, ""));
    const statusOK = !filtroStatusVisitante || String(v.status) === filtroStatusVisitante;
    return nomeOK && docOK && telOK && statusOK;
  } else {
    if (!filtroTipoVisitante || !valorFiltroVisitante) return true;
    const val = valorFiltroVisitante.toLowerCase();
    switch (filtroTipoVisitante) {
      case "nome": return v.nome.toLowerCase().includes(val);
      case "documento": return v.documento.replace(/\D/g, "").includes(val.replace(/\D/g, ""));
      case "telefone": return v.telefone?.replace(/\D/g, "").includes(val.replace(/\D/g, ""));
      case "status": return String(v.status) === valorFiltroVisitante;
      default: return true;
    }
  }
});

 return (
  <div className="min-h-screen bg-gray-50">
    {/* Header fixo */}
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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
          >
            <FiFileText size={16} /> Gerar relatório
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
    </div>

    {/* Conteúdo principal */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Abas de navegação */}
      <div className="flex justify-start gap-4 border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            abaAtiva === "usuarios"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-600"
          }`}
          onClick={() => setAbaAtiva("usuarios")}
        >
          Usuários
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            abaAtiva === "visitantes"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-600"
          }`}
          onClick={() => setAbaAtiva("visitantes")}
        >
          Visitantes
        </button>
      </div>

      {/* Aba Usuários */}
      {abaAtiva === "usuarios" && (
        <>
          <div className="flex justify-between items-center mb-4 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold">Usuários</h1>
            <span className="text-sm text-gray-600">
              Total de usuários exibidos: {totalExibidos}
            </span>
          </div>

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
                      ? formatCPF(valorFiltro)
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
                <Input type="text" placeholder="Nome" value={filtroNomeUsuario} onChange={(e) => setFiltroNomeUsuario(e.target.value)} />
                <Input
                  type="text"
                  placeholder="Documento"
                  value={formatCPF(filtroDocumentoUsuario)}
                  onChange={(e) => setFiltroDocumentoUsuario(e.target.value.replace(/\D/g, ""))}
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
                <Input type="text" placeholder="Bloco" value={filtroBlocoUsuario} onChange={(e) => setFiltroBlocoUsuario(e.target.value)} />
                <Input type="text" placeholder="Apartamento" value={filtroApartamento} onChange={(e) => setFiltroApartamento(e.target.value)} />
                <select
                  value={filtroStatusUsuario}
                  onChange={(e) => setFiltroStatusUsuario(e.target.value)}
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
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none"
                      onClick={toggleOrdenacao}
                    >
                      Nome&nbsp;
                      {modoOrdenacao === "az" && "↑"}
                      {modoOrdenacao === "recentes" && "↑"}
                      {modoOrdenacao === "antigos" && "↓"}
                    </th>
                    <th className="px-4 py-3">Bloco</th>
                    <th className="px-4 py-3">Apartamento</th>
                    <th className="px-4 py-3">Nível de Acesso</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosOrdenados.map((user, index) => (
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
        </>
      )}

      {abaAtiva === "visitantes" && (
  <>
    <div className="flex justify-between items-center mb-4 flex-wrap">
  <h1 className="text-xl md:text-2xl font-bold">Visitantes</h1>
  <span className="text-sm text-gray-600">
    Total de visitantes exibidos: {visitantesFiltrados.length}
  </span>
</div>


    {/* Filtros para visitantes */}
    {!modoCombinarVisitante ? (
  <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
    <select
      value={filtroTipoVisitante}
      onChange={(e) => setFiltroTipoVisitante(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2"
    >
      <option value="">Selecione um filtro</option>
      <option value="nome">Nome</option>
      <option value="documento">Documento</option>
      <option value="telefone">Telefone</option>
      <option value="status">Status</option>
    </select>

    {filtroTipoVisitante === "status" && (
      <select
        value={valorFiltroVisitante}
        onChange={(e) => setValorFiltroVisitante(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2"
      >
        <option value="">Selecione</option>
        <option value="true">Ativo</option>
        <option value="false">Inativo</option>
      </select>
    )}

    {filtroTipoVisitante && filtroTipoVisitante !== "status" && (
      <Input
        type="text"
        placeholder={`Digite o ${filtroTipoVisitante}`}
        value={valorFiltroVisitante}
        onChange={(e) => setValorFiltroVisitante(e.target.value)}
        className="col-span-2"
      />
    )}

    {filtroTipoVisitante && (
      <Button
        onClick={() => setModoCombinarVisitante(true)}
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Input
        type="text"
        placeholder="Nome"
        value={filtroNomeVisitante}
        onChange={(e) => setFiltroNomeVisitante(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Documento"
        value={filtroDocumentoVisitante}
        onChange={(e) => setFiltroDocumentoVisitante(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Telefone"
        value={filtroTelefoneVisitante}
        onChange={(e) => setFiltroTelefoneVisitante(e.target.value)}
      />
      <select
        value={filtroStatusVisitante}
        onChange={(e) => setFiltroStatusVisitante(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2"
      >
        <option value="">Status</option>
        <option value="true">Ativo</option>
        <option value="false">Inativo</option>
      </select>
    </div>
    <div className="flex gap-4">
      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
        <FiSearch size={18} />
      </Button>
      <Button
        onClick={() => setModoCombinarVisitante(false)}
        variant="outline"
      >
        Voltar para filtro único
      </Button>
    </div>
  </div>
)}


    {/* Lista de visitantes */}
    {visitantes.length === 0 ? (
      <div className="bg-white rounded-lg shadow p-4 text-center text-gray-600">
        Nenhum visitante encontrado.
      </div>
    ) : (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-center text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
  <tbody>
  {visitantes
    .filter((v) => {
      if (modoCombinarVisitante) {
        const nomeOK = !filtroNomeVisitante || v.nome.toLowerCase().includes(filtroNomeVisitante.toLowerCase());
        const docOK = !filtroDocumentoVisitante || v.documento.replace(/\D/g, "").includes(filtroDocumentoVisitante.replace(/\D/g, ""));
        const telOK = !filtroTelefoneVisitante || v.telefone?.replace(/\D/g, "").includes(filtroTelefoneVisitante.replace(/\D/g, ""));
        const statusOK = !filtroStatusVisitante || String(v.status) === filtroStatusVisitante;
        return nomeOK && docOK && telOK && statusOK;
      } else {
        if (!filtroTipoVisitante || !valorFiltroVisitante) return true;
        const val = valorFiltroVisitante.toLowerCase();
        switch (filtroTipoVisitante) {
          case "nome":
            return v.nome.toLowerCase().includes(val);
          case "documento":
            return v.documento.replace(/\D/g, "").includes(val.replace(/\D/g, ""));
          case "telefone":
            return v.telefone?.replace(/\D/g, "").includes(val.replace(/\D/g, ""));
          case "status":
            return String(v.status) === valorFiltroVisitante;
          default:
            return true;
        }
      }
    })
    .map((v, index) => (
      <tr key={`${v.id}-${index}`} className="border-b hover:bg-gray-50 transition">
        <td className="px-4 py-3 text-left font-medium">{v.nome}</td>
        <td className="px-4 py-3">{v.telefone}</td>
        <td className="px-4 py-3 text-center">
          {v.status ? (
            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Ativo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-gray-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Inativo
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/usuarios/${v.id}/editar`)}
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
  </>
)}



    </div>
  </div>
);
}
