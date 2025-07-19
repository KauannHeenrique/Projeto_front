  "use client";

  import { useState, useEffect } from "react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { useRouter } from "next/navigation";
  import { FiSearch, FiFileText } from "react-icons/fi";
  import { FaFilter, FaSearch } from "react-icons/fa";
  import { BsChevronDoubleLeft } from "react-icons/bs";
  import { FiUserPlus, FiUsers} from "react-icons/fi";
  import api from "@/services/api";
  import { formatCPF, cleanDocument, formatPhone } from "@/services/formatValues";

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
  const [mensagemErroUsuario, setMensagemErroUsuario] = useState("");
  const [mensagemErroVisitante, setMensagemErroVisitante] = useState("");
    const [success, setSuccess] = useState<string | null>(null);
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const [abaAtiva, setAbaAtiva] = useState<"usuarios" | "visitantes">("usuarios");
    const [modoCombinarVisitante, setModoCombinarVisitante] = useState(false);
    const [filtroTipoVisitante, setFiltroTipoVisitante] = useState("");
  const [valorFiltroVisitante, setValorFiltroVisitante] = useState("");
  const [buscouUsuario, setbuscouUsuario] = useState(false);
  const [buscouVisitante, setBuscouVisitante] = useState(false);
    
  const [filtroNomeVisitante, setFiltroNomeVisitante] = useState("");
  const [filtroDocumentoVisitante, setFiltroDocumentoVisitante] = useState("");
  const [filtroTelefoneVisitante, setFiltroTelefoneVisitante] = useState("");
  const [filtroStatusVisitante, setFiltroStatusVisitante] = useState("");
  const [filtroPrestadorVisitante, setFiltroPrestadorVisitante] = useState("");

  const [mostrarPopupRelatorio, setMostrarPopupRelatorio] = useState(false);

    const [filtroTipo, setFiltroTipo] = useState("");
    const [valorFiltro, setValorFiltro] = useState("");
    const [modoCombinar, setModoCombinar] = useState(false);
const [filtroNomeUsuario, setFiltroNomeUsuario] = useState("");
const [filtroDocumentoUsuario, setFiltroDocumentoUsuario] = useState("");
const [filtroBlocoUsuario, setFiltroBlocoUsuario] = useState("");
const [filtroApartamento, setFiltroApartamento] = useState("");
const [filtroNivel, setFiltroNivel] = useState("");
const [filtroStatusUsuario, setFiltroStatusUsuario] = useState("");

const [showErrorPopup, setShowErrorPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState("");
const [visitantes, setVisitantes] = useState<Visitante[]>([]);

const buscarTodosUsuarios = async () => {
  setMensagemErroUsuario(""); // Limpar a mensagem de erro
  setIsLoading(true);
  setError(null);
  setSuccess(null);
  setUsers([]); // Limpa os usuários antes de uma nova busca
  setbuscouUsuario(false);

  try {
    // Realiza a chamada à API para buscar todos os usuários
    const { data } = await api.get(`/Usuario/ExibirTodosUsuarios`);

    const mappedUsers: User[] = data.map((user: any) => ({
      id: user.usuarioId,
      nome: user.nome || "Nome não informado",
      email: user.email || "Email não informado",
      phone: user.telefone || "Telefone não informado",
      accessLevel:
        user.nivelAcesso === 2
          ? "Síndico"
          : user.nivelAcesso === 3
          ? "Funcionário"
          : user.nivelAcesso === 4
          ? "Morador"
          : "Desconhecido",
      bloco: user.apartamento?.bloco || "-",
      numero: String(user.apartamento?.numero ?? "-"),
      documento: String(user.documento ?? "Não informado"),
      ativo: user.status ?? false,
    }));

    setUsers(mappedUsers);
    setbuscouUsuario(true);
  } catch (err: any) {
    setError("Erro ao buscar todos os usuários");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

const buscarTodosVisitantes = async () => {
  setMensagemErroVisitante(""); // Limpar a mensagem de erro
  setVisitantes([]); // Limpar os visitantes antes de uma nova busca
  setBuscouVisitante(false); // Resetar o controle de busca

  // Verificando se a aba ativa é "visitantes" para realizar a busca
  if (abaAtiva === "visitantes") {
    try {
      // Realiza a chamada à API para buscar todos os visitantes
      const { data } = await api.get(`/Visitante/ExibirTodosVisitantes`);

      if (data.length === 0) {
        setMensagemErroVisitante("Nenhum visitante encontrado.");
      } else {
        // Atualizando o estado corretamente
        const mappedVisitantes: Visitante[] = data.map((visitante: any) => ({
          id: visitante.id,
          nome: visitante.nome || "Nome não informado",
          documento: visitante.documento || "Não informado",
          telefone: visitante.telefone || "Telefone não informado",
          status: visitante.status ?? false,
          nomeEmpresa: visitante.nomeEmpresa || "Não informado",
          cnpj: visitante.cnpj || "Não informado",
        }));

        // Atualiza o estado de visitantes com os dados mapeados
        setVisitantes(mappedVisitantes);
      }

      setBuscouVisitante(true); // Marca que a busca foi feita
    } catch (err: any) {
      setError("Erro ao buscar todos os visitantes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }
};

// Alterando a ação do botão para chamar a busca correta para todos os visitantes ou usuários
<Button
  onClick={() => {
    if (abaAtiva === "usuarios") {
      buscarTodosUsuarios(); // Busca todos os usuários
    } else {
      buscarTodosVisitantes(); // Busca todos os visitantes
    }
  }}
  type="button"
  variant="ghost"
  className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
>
  <FiUsers size={16} />
  {abaAtiva === "usuarios" ? "Ver todos os usuários" : "Ver todos os visitantes"}
</Button>

 const buscarUsuarios = async () => {
  setMensagemErroUsuario(""); // Limpa a mensagem de erro antes de começar a busca
  setIsLoading(true);
  setError(null);
  setSuccess(null);
  setUsers([]); // Limpa os usuários antes da nova busca
  setbuscouUsuario(false);

  // Verificando os valores dos filtros antes de realizar a busca
  console.log("Filtro Nome Usuario:", filtroNomeUsuario);
  console.log("Filtro Documento Usuario:", filtroDocumentoUsuario);
  console.log("Filtro Bloco Usuario:", filtroBlocoUsuario);
  console.log("Filtro Apartamento:", filtroApartamento);
  console.log("Filtro Nivel:", filtroNivel);
  console.log("Filtro Status Usuario:", filtroStatusUsuario);

  // Verificando se algum filtro foi preenchido
  if (!modoCombinar) {
    const valor = valorFiltro.trim();
    if (valor === "") {
      setMensagemErroUsuario("Por favor, preencha o campo de filtro antes de buscar.");
      return; // Impede a execução da busca
    }
  }

  // No modo combinado, verificamos se ao menos um filtro foi preenchido
  if (modoCombinar) {
  const filtrosCompletos = [
    filtroNomeUsuario,
    filtroDocumentoUsuario,
    filtroBlocoUsuario,
    filtroApartamento,
    filtroNivel,
    filtroStatusUsuario,
  ];

  const algumFiltroPreenchido = filtrosCompletos.some(filtro => filtro.trim() !== "");

  if (!algumFiltroPreenchido) {
    console.log("Não preencher nada ne porra")
    setMensagemErroUsuario("Por favor, preencha ao menos um campo do filtro.");
    return;
  }
}


  // Iniciar a busca
  try {
    const filtros = modoCombinar
      ? {
          nome: filtroNomeUsuario.trim(),
          documento: filtroDocumentoUsuario.replace(/\D/g, "").trim(),
          bloco: filtroBlocoUsuario.trim(),
          apartamento: filtroApartamento.trim(),
          nivel:
            filtroNivel === "Síndico"
              ? "2"
              : filtroNivel === "Funcionário"
              ? "3"
              : filtroNivel === "Morador"
              ? "4"
              : "",
          status:
            filtroStatusUsuario === "true"
              ? "true"
              : filtroStatusUsuario === "false"
              ? "false"
              : "",
        }
      : {
          [filtroTipo]:
            filtroTipo === "status"
              ? valorFiltro === "Ativo"
                ? "true"
                : "false"
              : filtroTipo === "documento"
              ? valorFiltro.replace(/\D/g, "")
              : valorFiltro,
        };

    // Limpar filtros vazios
    const filtrosLimpos = Object.fromEntries(
      Object.entries(filtros).filter(([_, v]) => v !== "")
    );

    const query = new URLSearchParams(filtrosLimpos).toString();

    // Realiza a chamada à API com os filtros aplicados
    const { data } = await api.get(`/Usuario/BuscarUsuarioPor?${query}`);

    const mappedUsers: User[] = data.map((user: any) => ({
      id: user.usuarioId,
      nome: user.nome || "Nome não informado",
      email: user.email || "Email não informado",
      phone: user.telefone || "Telefone não informado",
      accessLevel:
        user.nivelAcesso === 2
          ? "Síndico"
          : user.nivelAcesso === 3
          ? "Funcionário"
          : user.nivelAcesso === 4
          ? "Morador"
          : "Desconhecido",
      bloco: user.apartamento?.bloco || "-",
      numero: String(user.apartamento?.numero ?? "-"),
      documento: String(user.documento ?? "Não informado"),
      ativo: user.status ?? false,
    }));

    setUsers(mappedUsers);
    setbuscouUsuario(true);
  } catch (err: any) {
    if (err.response?.status === 404) {
      setUsers([]);
      setbuscouUsuario(true);
    } else {
      setError("Erro ao buscar usuários");
      console.error(err);
    }
  } finally {
    setIsLoading(false);
  }
};

const buscarVisitantes = async () => {
  setMensagemErroVisitante("");
  setVisitantes([]);
  setBuscouVisitante(false);

  // Mapeamento dos campos de frontend para backend
  const mapaFiltroVisitante: Record<string, string> = {
    nome: "nomeVisitante",
    documento: "documento",
    telefone: "telefone",
    status: "status",
    prestador: "prestadorServico",
  };

  // Verificação de campo obrigatório no modo único
  if (!modoCombinarVisitante) {
    const valor = valorFiltroVisitante.trim();
    if (valor === "") {
      setMensagemErroVisitante("Por favor, preencha o campo filtro antes de buscar.");
      return;
    }
  }

  // Verificação no modo combinado
  if (modoCombinarVisitante) {
    const filtrosCompletosVisitante = [
      filtroNomeVisitante,
      filtroDocumentoVisitante,
      filtroTelefoneVisitante,
      filtroStatusVisitante,
      filtroPrestadorVisitante,
    ];

    const algumFiltroPreenchidoVisitante = filtrosCompletosVisitante.some(
      (filtro) => filtro.trim() !== ""
    );

    if (!algumFiltroPreenchidoVisitante) {
      setMensagemErroVisitante("Por favor, preencha ao menos um campo do filtro.");
      return;
    }
  }

  setIsLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const filtros = modoCombinarVisitante
      ? {
          nomeVisitante: filtroNomeVisitante,
          documento: filtroDocumentoVisitante.replace(/\D/g, ""),
          telefone: filtroTelefoneVisitante,
          status:
            filtroStatusVisitante === "true"
              ? "true"
              : filtroStatusVisitante === "false"
              ? "false"
              : "",
          prestadorServico: filtroPrestadorVisitante?.toLowerCase() || "",
        }
      : {
          // Mapeia corretamente o nome da propriedade do backend
          [mapaFiltroVisitante[filtroTipoVisitante] || filtroTipoVisitante]:
            filtroTipoVisitante === "status"
  ? valorFiltroVisitante

              : filtroTipoVisitante === "documento"
              ? valorFiltroVisitante.replace(/\D/g, "")
              : filtroTipoVisitante === "prestador"
              ? valorFiltroVisitante.toLowerCase()
              : valorFiltroVisitante,
        };

    const filtrosLimpos = Object.fromEntries(
      Object.entries(filtros).filter(([_, v]) => v !== "")
    );

    const query = new URLSearchParams(filtrosLimpos).toString();

    const { data } = await api.get(`/Visitante/BuscarVisitantePor?${query}`);

    if (data.length === 0) {
      setMensagemErroVisitante("Nenhum visitante encontrado.");
    }

    const mappedVisitantes: Visitante[] = data.map((visitante: any) => ({
      id: visitante.id,
      nome: visitante.nome || "Nome não informado",
      documento: visitante.documento || "Não informado",
      telefone: visitante.telefone || "Telefone não informado",
      status: visitante.status ?? false,
      nomeEmpresa: visitante.nomeEmpresa || "Não informado",
      cnpj: visitante.cnpj || "Não informado",
    }));

    setVisitantes(mappedVisitantes);
    setBuscouVisitante(true);
  } catch (err: any) {
    if (err.response?.status === 404) {
      setVisitantes([]);
      setBuscouVisitante(true);
    } else {
      setError("Erro ao buscar visitantes");
      console.error(err);
    }
  } finally {
    setIsLoading(false);
  }
};





const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  {mensagemErroVisitante && (
    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
    {mensagemErroVisitante}
  </div>
  )}
  
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

        useEffect(() => {
    setMensagemErroUsuario("");
    setMensagemErroVisitante("");
  }, [abaAtiva]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Button
            type="button"
            onClick={() => router.push("/home/desktop")}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <BsChevronDoubleLeft size={16} /> Voltar
          </Button>

          <div className="flex items-center gap-2">
            <Button
  type="button"
  onClick={() => setMostrarPopupRelatorio(true)}
  variant="ghost"
  className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
>
  <FiFileText size={16} /> Gerar relatório
</Button>

{mostrarPopupRelatorio && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      {/* Botão de fechar */}
      <button
        onClick={() => setMostrarPopupRelatorio(false)}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        x
      </button>

      <h2 className="text-lg text-center font-semibold mb-2 text-[#217346]">
  Relatório gerado com sucesso
</h2>

<p className="text-sm text-center text-gray-700 mb-6">
  Clique no botão para fazer o download do arquivo.
</p>


<div className="flex justify-center">
  <Button
    className="bg-[#217346] hover:bg-[#1a5c38] text-white px-4 py-2 text-sm rounded"
    onClick={() => {
      const link = document.createElement("a");
      link.href = `${api.defaults.baseURL}/relatorios/${abaAtiva}`;
      link.setAttribute("download", `Relatorio_${abaAtiva}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMostrarPopupRelatorio(false);
    }}
  >
    Baixar Excel
  </Button>
      </div>
    </div>
  </div>
)}


            <Button
    type="button"
    onClick={() => router.push("/usuarios/desktop/adicionar")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded font-semibold"
  >
    <FiUserPlus size={16} /> Adicionar usuário
  </Button>

          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Abas de navegação */}
      <div className="flex justify-between gap-4 border-b border-gray-200 mb-6">
  {/* Abas Usuários e Visitantes */}
  <div className="flex gap-4">
    <button
      className={`py-2 px-4 text-sm font-medium ${
        abaAtiva === "usuarios" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
      }`}
      onClick={() => setAbaAtiva("usuarios")}
    >
      Usuários
    </button>
    <button
      className={`py-2 px-4 text-sm font-medium ${
        abaAtiva === "visitantes" ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"
      }`}
      onClick={() => setAbaAtiva("visitantes")}
    >
      Visitantes
    </button>
  </div>

  <Button
    onClick={() => {
      if (abaAtiva === "usuarios") {
      buscarTodosUsuarios(); // Busca todos os usuários
    } else {
      buscarTodosVisitantes(); // Busca todos os visitantes
    }
    }}
    type="button"
              variant="ghost"
              className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
  >
    <FiUsers size={16} />
    {abaAtiva === "usuarios" ? "Ver todos os usuários" : "Ver todos os visitantes"}
  </Button>
  
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
    <div className="w-full flex flex-col gap-4 mb-6">
    {/* Linha principal de filtros */}
    <div className="w-full flex flex-col md:flex-row items-end gap-4 justify-between">
      {/* Tipo de filtro */}
      <select
        value={filtroTipo}
        onChange={(e) => {
          setFiltroTipo(e.target.value);
          setValorFiltro("");
          setbuscouUsuario(false);
          setMensagemErroUsuario("");
        }}
        className="text-sm border rounded px-2 py-2 w-full md:w-60"
      >
        <option value="">Selecione um filtro</option>
        <option value="nome">Nome</option>
        <option value="documento">Documento</option>
        <option value="bloco">Bloco</option>
        <option value="apartamento">Apartamento</option>
        <option value="nivel">Nível de Acesso</option>
        <option value="status">Status do usuário</option>
      </select>

      {/* Campo dinâmico no meio */}
      <div className="flex-1">
        {filtroTipo === "status" && (
          <select
            value={valorFiltro}
            onChange={(e) => setValorFiltro(e.target.value)}
            className="text-sm border rounded px-2 py-2 w-full"
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
              setValorFiltro(
                filtroTipo === "documento"
                  ? input.replace(/\D/g, "")
                  : input
              );
              setMensagemErroUsuario("");
            }}
          />
        )}

        {filtroTipo === "nivel" && (
          <select
            value={valorFiltro}
            onChange={(e) => setValorFiltro(e.target.value)}
            className="text-sm border rounded px-2 py-2 w-full"
          >
            <option value="">Selecione</option>
            <option value="Síndico">Síndico</option>
            <option value="Funcionário">Funcionário</option>
            <option value="Morador">Morador</option>
          </select>
        )}
      </div>

      {/* Botões à direita */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          onClick={() => setModoCombinar(true)}
          className="text-sm flex items-center gap-1"
          variant={modoCombinar ? "default" : "outline"}
        >
          <FaFilter size={14} />
          Combinar filtros
        </Button>

        <Button
          onClick={buscarUsuarios}
          className="text-sm flex items-center gap-1 bg-black text-white hover:bg-zinc-800"
        >
          <FaSearch size={14} />
        </Button>
      </div>
    </div>

    {/* Mensagem de erro */}
    {mensagemErroUsuario && (
    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
    {mensagemErroUsuario}
  </div>
  )}
  </div>

  ): (
      <div className="space-y-4 mb-6">
        {/* Linha 1: Nome, Documento, Combinar filtros, Buscar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Nome (maior espaço) */}
          <div className="md:col-span-6">
            <Input
              type="text"
              placeholder="Nome"
              value={filtroNomeUsuario}
              onChange={(e) => setFiltroNomeUsuario(e.target.value)}
            />
          </div>

          {/* Documento (mais próximo dos botões) */}
          <div className="md:col-span-3">
            <Input
              type="text"
              placeholder="Documento"
              value={formatCPF(filtroDocumentoUsuario)}
              onChange={(e) =>
                setFiltroDocumentoUsuario(e.target.value.replace(/\D/g, ""))
              }
            />
          </div>

          {/* Botões à direita */}
          <div className="md:col-span-3 flex justify-end items-end gap-2">
            <Button
              onClick={() => setModoCombinar(false)}
              variant="outline"
              className="text-sm flex items-center gap-1"
            >
              <FaFilter size={12} /> Combinar filtros
            </Button>
            <Button
              onClick={buscarUsuarios}
              className="text-sm flex items-center gap-1 bg-black text-white hover:bg-zinc-800"
            >
              <FaSearch size={14} />
            </Button>
          </div>
        </div>

        {/* Linha 2: Bloco, Apartamento, Nível, Status */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <Input
              type="text"
              placeholder="Bloco"
              value={filtroBlocoUsuario}
              onChange={(e) => setFiltroBlocoUsuario(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Input
              type="text"
              placeholder="Apartamento"
              value={filtroApartamento}
              onChange={(e) => setFiltroApartamento(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="">Selecione nível</option>
              <option value="Síndico">Síndico</option>
              <option value="Funcionário">Funcionário</option>
              <option value="Morador">Morador</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={filtroStatusUsuario}
              onChange={(e) => setFiltroStatusUsuario(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="">Selecione status</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        {/* Mensagem de erro */}
        {mensagemErroUsuario && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
            {mensagemErroUsuario}
          </div>
        )}
      </div>


            )}

            {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}

  {buscouUsuario && users.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-4 text-center text-gray-600">
                Nenhum usuario encontrado.
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
                      <th className="px-4 py-3">Status</th>
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
                        <td className="px-4 py-3">
    {user.ativo ? (
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
      {/* Tipo de filtro */}
      <div className="md:col-span-3">
        <select
          value={filtroTipoVisitante}
          onChange={(e) => {
            setFiltroTipoVisitante(e.target.value);
            setValorFiltroVisitante("");
            setVisitantes([]);
            setMensagemErroVisitante("");
          }}
          className="text-sm border rounded px-2 py-2 w-full"
        >
          <option value="">Selecione um filtro</option>
          <option value="nome">Nome</option>
          <option value="documento">Documento</option>
          <option value="telefone">Telefone</option>
          <option value="status">Status</option>
          <option value="prestador">Prestador de serviço</option>
        </select>
      </div>

      {/* Campo de valor */}
      <div className="md:col-span-6">
  {filtroTipoVisitante === "status" || filtroTipoVisitante === "prestador" ? (
    <select
      value={valorFiltroVisitante}
      onChange={(e) => setValorFiltroVisitante(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2 w-40"  
    >
      <option value="">Selecione</option>
      <option value="true">{filtroTipoVisitante === "prestador" ? "Sim" : "Ativo"}</option>
      <option value="false">{filtroTipoVisitante === "prestador" ? "Não" : "Inativo"}</option>
    </select>
    ) : filtroTipoVisitante ? (
    <Input
  type="text"
  placeholder={`Digite o ${filtroTipoVisitante}`}
  value={
    filtroTipoVisitante === "documento"
      ? formatCPF(valorFiltroVisitante)
      : filtroTipoVisitante === "telefone"
      ? formatPhone(valorFiltroVisitante)
      : valorFiltroVisitante
  }
  onChange={(e) => setValorFiltroVisitante(e.target.value)}
/>
  ) : null}
</div>


      {/* Botões */}
      <div className="md:col-span-3 flex justify-end gap-2">
        <Button
          onClick={() => setModoCombinarVisitante(true)}
          variant="outline"
          className="text-sm flex items-center gap-1"
        >
          <FaFilter size={12} /> Combinar filtros
        </Button>
        <Button
          onClick={buscarVisitantes}
          className="text-sm flex items-center gap-1 bg-black text-white hover:bg-zinc-800"
        >
          <FaSearch size={14} />
        </Button>
      </div>
    </div>
  ) : (
    <div className="space-y-4 mb-6">
    {/* Linha 1: Nome, Documento, Botões */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      {/* Nome (largura maior) */}
      <div className="md:col-span-6">
        <Input
          type="text"
          placeholder="Nome"
          value={filtroNomeVisitante}
          onChange={(e) => setFiltroNomeVisitante(e.target.value)}
        />
      </div>

      {/* Documento */}
      <div className="md:col-span-3">
        <Input
          type="text"
          placeholder="Documento"
          value={filtroDocumentoVisitante}
          onChange={(e) => setFiltroDocumentoVisitante(e.target.value)}
        />
      </div>

      {/* Botões alinhados à direita */}
      <div className="md:col-span-3 flex justify-end items-end gap-2">
        <Button
          onClick={() => setModoCombinarVisitante(false)}
          variant="outline"
          className="text-sm flex items-center gap-1"
        >
          <FaFilter size={12} /> Combinar filtros
        </Button>
        <Button
          onClick={buscarVisitantes}
          className="text-sm flex items-center gap-1 bg-black text-white hover:bg-zinc-800"
        >
          <FaSearch size={14} />
        </Button>
      </div>
    </div>

    {/* Linha 2: Telefone e Status */}
    <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
      <div className="md:col-span-6">
        <Input
          type="text"
          placeholder="Telefone"
          value={filtroTelefoneVisitante}
          onChange={(e) => setFiltroTelefoneVisitante(e.target.value)}
        />
      </div>

      <div className="md:col-span-3">
  <select
    value={filtroPrestadorVisitante}
    onChange={(e) => setFiltroPrestadorVisitante(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"

  >
    <option value="" disabled>Prestador de serviço</option>  
    <option value="true">Sim</option>
    <option value="false">Não</option>
  </select>
</div>

      {/* Status */}
  <div className="md:col-span-3 flex justify-start md:justify-end">
    <select
      value={filtroStatusVisitante}
      onChange={(e) => setFiltroStatusVisitante(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2 w-full"
    >
      <option value="">Status</option>
      <option value="true">Ativo</option>
      <option value="false">Inativo</option>
    </select>
  </div>
</div>
    </div>
  )}


  {mensagemErroVisitante && (
    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
    {mensagemErroVisitante}
  </div>
  )}


      {/* Lista de visitantes */}
 {/* Exibição de visitantes */}
{buscouVisitante && visitantes.length === 0 ? (
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
        {visitantes.map((v, index) => (
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
              <Button size="sm" variant="outline" onClick={() => router.push(`/visitantes/${v.id}/editar`)}>
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
