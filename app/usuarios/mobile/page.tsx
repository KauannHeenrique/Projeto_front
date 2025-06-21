"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FiFileText, FiUserPlus } from "react-icons/fi";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaFilter, FaSearch } from "react-icons/fa";
import { formatCPF, formatPhone } from "@/services/formatValues";
import api from "@/services/api";

interface Usuario {
  id: number;
  nome: string;
  bloco: string;
  apartamento: string;
  documento: string;
  nivelAcesso: number;
  status: boolean;
}

export default function TelaUsuariosVisitantesMobile() {
  const router = useRouter();
  const { user } = useAuth();
  const nivelAcesso = user?.nivelAcesso;

  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"usuarios" | "visitantes">("usuarios");
  const [modoCombinar, setModoCombinar] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("nome");
  const [valorFiltro, setValorFiltro] = useState("");

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroApto, setFiltroApto] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const { data } = await api.get("/Usuario/ExibirTodosUsuarios");
        const formatados = data.map((u: any) => ({
          id: u.usuarioId,
          nome: u.nome,
          bloco: u.apartamento?.bloco || "-",
          apartamento: String(u.apartamento?.numero || "-"),
          documento: u.documento,
          nivelAcesso: u.nivelAcesso,
          status: u.status ?? false,
        }));
        setUsuarios(formatados);
        setTodosUsuarios(formatados);
      } catch (err) {
        console.error("Erro ao carregar usuários", err);
      }
    };
    carregarUsuarios();
  }, []);

  useEffect(() => {
    const filtrados = todosUsuarios.filter((u) => {
      if (modoCombinar) {
        return (
          (!filtroNome || u.nome.toLowerCase().includes(filtroNome.toLowerCase())) &&
          (!filtroDocumento || u.documento.replace(/\D/g, "").includes(filtroDocumento.replace(/\D/g, ""))) &&
          (!filtroBloco || u.bloco.toLowerCase().includes(filtroBloco.toLowerCase())) &&
          (!filtroApto || u.apartamento.includes(filtroApto)) &&
          (!filtroNivel || String(u.nivelAcesso) === filtroNivel) &&
          (!filtroStatus || String(u.status) === (filtroStatus === "ativo" ? "true" : "false"))
        );
      } else {
        if (!tipoFiltro || !valorFiltro) return true;
        const val = valorFiltro.toLowerCase();
        switch (tipoFiltro) {
          case "nome": return u.nome.toLowerCase().includes(val);
          case "documento": return u.documento.replace(/\D/g, "").includes(val.replace(/\D/g, ""));
          case "bloco": return u.bloco.toLowerCase().includes(val);
          case "apartamento": return u.apartamento.includes(val);
          case "nivel": return String(u.nivelAcesso) === val;
          case "status": return String(u.status) === (val === "ativo" ? "true" : "false");
          default: return true;
        }
      }
    });
    setUsuarios(filtrados);
  }, [modoCombinar, tipoFiltro, valorFiltro, filtroNome, filtroDocumento, filtroBloco, filtroApto, filtroNivel, filtroStatus, todosUsuarios]);

  const handleGerarRelatorio = () => {
    const rota = abaAtiva === "usuarios" ? "/relatorios/usuarios" : "/relatorios/visitantes";
    router.push(rota);
    setMenuAberto(false);
  };

  const handleAdicionarUsuario = () => {
    router.push("/usuarios/adicionar");
    setMenuAberto(false);
  };

  if (!user) return null;

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between">
        <Button
          type="button"
          onClick={() => router.push("/home")}
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setMenuAberto(!menuAberto)}>
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {menuAberto && (
            <div className="absolute top-12 right-0 w-64 bg-white shadow-md z-50 rounded border">
              <div className="px-4 py-3 space-y-3">
                <button onClick={handleAdicionarUsuario} className="flex items-center w-full text-left px-2 py-2 text-base font-medium text-gray-700 hover:text-[#26c9a8]">
                  <FiUserPlus className="h-4 w-4 mr-2" /> Adicionar usuário
                </button>
                <button onClick={handleGerarRelatorio} className="flex items-center w-full text-left px-2 py-2 text-base font-medium text-gray-700 hover:text-[#26c9a8]">
                  <FiFileText className="h-4 w-4 mr-2" /> Gerar relatório
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {nivelAcesso === 2 && (
        <div className="flex w-full border-b">
          <button
            className={`w-1/2 py-2 text-sm font-medium ${abaAtiva === "usuarios" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"}`}
            onClick={() => setAbaAtiva("usuarios")}
          >
            Usuários
          </button>
          <button
            className={`w-1/2 py-2 text-sm font-medium ${abaAtiva === "visitantes" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"}`}
            onClick={() => setAbaAtiva("visitantes")}
          >
            Visitantes
          </button>
        </div>
      )}

      <div className="bg-white px-4 py-4 border-b shadow-sm space-y-4 rounded-b-md">
        <div className="flex items-center justify-between">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="text-sm border rounded px-2 py-1 w-1/2"
          >
            <option value="nome">Nome</option>
            <option value="documento">Documento</option>
            <option value="bloco">Bloco</option>
            <option value="apartamento">Apartamento</option>
            <option value="nivel">Nível de acesso</option>
            <option value="status">Status</option>
          </select>

          <Button
            type="button"
            variant={modoCombinar ? "default" : "outline"}
            size="sm"
            onClick={() => setModoCombinar(!modoCombinar)}
            className="text-xs flex items-center gap-1 "
          >
            <FaFilter size={12} /> Combinar filtros
          </Button>
        </div>

        {!modoCombinar ? (
          <div className="flex gap-2">
            {tipoFiltro === "nome" || tipoFiltro === "bloco" || tipoFiltro === "apartamento" ? (
              <Input
                placeholder={tipoFiltro.charAt(0).toUpperCase() + tipoFiltro.slice(1)}
                value={valorFiltro}
                onChange={(e) => setValorFiltro(e.target.value)}
              />
            ) : tipoFiltro === "documento" ? (
              <Input
                placeholder="CPF"
                value={formatCPF(valorFiltro)}
                onChange={(e) => setValorFiltro(e.target.value)}
              />
            ) : tipoFiltro === "nivel" ? (
              <select
                value={valorFiltro}
                onChange={(e) => setValorFiltro(e.target.value)}
                className="text-sm border rounded px-2 py-1 w-full"
              >
                <option value="">Todos</option>
                <option value="2">Síndico</option>
                <option value="3">Funcionário</option>
                <option value="4">Morador</option>
              </select>
            ) : tipoFiltro === "status" && (
              <select
                value={valorFiltro}
                onChange={(e) => setValorFiltro(e.target.value)}
                className="text-sm border rounded px-2 py-1 w-full"
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            )}
            <Button><FaSearch size={14} /></Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input placeholder="Nome" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
            <Input placeholder="CPF" value={formatCPF(filtroDocumento)} onChange={(e) => setFiltroDocumento(e.target.value)} />
            <Input placeholder="Bloco" value={filtroBloco} onChange={(e) => setFiltroBloco(e.target.value)} />
            <Input placeholder="Apartamento" value={filtroApto} onChange={(e) => setFiltroApto(e.target.value)} />
            <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="w-full text-sm border rounded px-2 py-2">
              <option value="">Todos os níveis</option>
              <option value="2">Síndico</option>
              <option value="3">Funcionário</option>
              <option value="4">Morador</option>
            </select>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full text-sm border rounded px-2 py-2">
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <Button className="w-full flex justify-center gap-2">
              <FaSearch size={14} /> Buscar
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {abaAtiva === "usuarios" && usuarios.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-xl shadow-md border p-4 flex flex-col gap-2"
          >
            <div className="font-semibold text-base">{u.nome}</div>
            <div className="text-sm text-gray-600">
              Bloco {u.bloco}, Apartamento {u.apartamento}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span
                className={`w-2 h-2 rounded-full ${u.status ? "bg-green-500" : "bg-gray-400"}`}
              />
              {u.status ? "Ativo" : "Inativo"}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/usuarios/${u.id}`)}
              className="w-fit text-xs"
            >
              Ver detalhes
            </Button>
          </div>
        ))}

        {abaAtiva === "usuarios" && usuarios.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-4">Nenhum usuário encontrado.</div>
        )}
      </div>
    </>
  );
}
