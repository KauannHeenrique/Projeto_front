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
    const [mostrarPopupRelatorio, setMostrarPopupRelatorio] = useState(false);

    const [menuAberto, setMenuAberto] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState<"usuarios" | "visitantes">("usuarios");
    const [modoCombinar, setModoCombinar] = useState(false);
    const [tipoFiltro, setTipoFiltro] = useState("nome");
    const [valorFiltro, setValorFiltro] = useState("");
    const [buscou, setBuscou] = useState(false);
    

    const [mensagemErroUsuario, setmensagemErroUsuario] = useState("");
    const [mensagemErroVisitante, setMensagemErroVisitante] = useState("");

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    const [filtroNome, setFiltroNome] = useState("");
    const [filtroDocumento, setFiltroDocumento] = useState("");
    const [filtroBloco, setFiltroBloco] = useState("");
    const [filtroApto, setFiltroApto] = useState("");
    const [filtroNivel, setFiltroNivel] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [visitantes, setVisitantes] = useState([]);
const [filtroNomeVisitante, setFiltroNomeVisitante] = useState("");
const [filtroDocumentoVisitante, setFiltroDocumentoVisitante] = useState("");
const [filtroTelefoneVisitante, setFiltroTelefoneVisitante] = useState("");
const [filtroStatusVisitante, setFiltroStatusVisitante] = useState("");
const [filtroPrestadorVisitante, setFiltroPrestadorVisitante] = useState("");
const [tipoFiltroVisitante, setTipoFiltroVisitante] = useState("nome");
const [valorFiltroVisitante, setValorFiltroVisitante] = useState("");
const [buscouVisitante, setBuscouVisitante] = useState(false);

const buscarTodos = async () => {
  try {
    setmensagemErroUsuario("");
    setMensagemErroVisitante("");

    if (abaAtiva === "usuarios") {
      // Reset filtros usuários
      setModoCombinar(false);
      setValorFiltro("");
      setFiltroNome("");
      setFiltroDocumento("");
      setFiltroBloco("");
      setFiltroApto("");
      setFiltroNivel("");
      setFiltroStatus("");
      setBuscou(true);

      const response = await api.get("/Usuario/ExibirTodosUsuarios");
      const data = response.data;

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
    } else {
      // Reset filtros visitantes
      setModoCombinar(false);
      setTipoFiltroVisitante("nome");
      setValorFiltroVisitante("");
      setFiltroNomeVisitante("");
      setFiltroDocumentoVisitante("");
      setFiltroTelefoneVisitante("");
      setFiltroStatusVisitante("");
      setFiltroPrestadorVisitante("");
      setBuscouVisitante(true);

      const response = await api.get("/Visitante/ExibirTodosVisitantes");
      const data = response.data;

      setVisitantes(data || []);
    }
  } catch (error) {
    console.error("Erro ao buscar todos", error);
    if (abaAtiva === "usuarios") {
      setUsuarios([]);
    } else {
      setVisitantes([]);
    }
  }
};


    const buscarUsuarios = async () => {

      setmensagemErroUsuario("");
      
    if (abaAtiva !== "usuarios") return;

    if (!modoCombinar) {
  const valor = valorFiltro.trim();
  if (valor === "") {
    setmensagemErroUsuario("Por favor, preencha o campo de filtro antes de buscar.");
    return;
  }
}

setBuscou(true); // Aqui!


    const filtros = modoCombinar
      ? {
          nome: filtroNome,
          documento: filtroDocumento.replace(/\D/g, ""),
          bloco: filtroBloco,
          apartamento: filtroApto,
          nivelAcesso: filtroNivel,
          status:
            filtroStatus === "ativo"
              ? "true"
              : filtroStatus === "inativo"
              ? "false"
              : "",
        }
      : {
  [tipoFiltro === "nivel" ? "nivelAcesso" : tipoFiltro]:
    tipoFiltro === "status"
      ? valorFiltro === "ativo"
        ? "true"
        : valorFiltro === "inativo"
        ? "false"
        : ""
      : tipoFiltro === "documento"
      ? valorFiltro.replace(/\D/g, "")
      : valorFiltro,
};

    const filtrosLimpos = Object.fromEntries(
      Object.entries(filtros).filter(([_, v]) => v !== "" && v !== undefined)
    );

    const query = new URLSearchParams(filtrosLimpos).toString();

    try {
  const response = await api.get(`/Usuario/BuscarUsuarioPor?${query}`);
  const data = response.data;

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
} catch (error: any) {
  if (error.response && error.response.status === 404) {
    // Nenhum usuário encontrado
    setUsuarios([]);
  } else {
    console.error("Erro ao buscar usuários", error);
  }
}
  };

  

    const handleGerarRelatorio = () => {
      setMostrarPopupRelatorio(true);
      setMenuAberto(false);
    };

    const handleAdicionarUsuario = () => {
      router.push("/users/mobile/adicionar");
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
            {abaAtiva === "usuarios" ? (
  <select
    value={tipoFiltro}
    onChange={(e) => {
      setTipoFiltro(e.target.value);
      setValorFiltro("");
      setUsuarios([]);
      setBuscou(false);
      setmensagemErroUsuario("");
    }}
    className="text-sm border rounded px-2 py-1 w-1/2"
  >
    <option value="nome">Nome</option>
    <option value="documento">Documento</option>
    <option value="bloco">Bloco</option>
    <option value="apartamento">Apartamento</option>
    <option value="nivel">Nível de acesso</option>
    <option value="status">Status</option>
  </select>
) : (
  <select
    value={tipoFiltroVisitante}
    onChange={(e) => {
      setTipoFiltroVisitante(e.target.value);
      setValorFiltroVisitante("");
      setVisitantes([]);
      setBuscouVisitante(false);
      setMensagemErroVisitante("");
    }}
    className="text-sm border rounded px-2 py-1 w-1/2"
  >
    <option value="nome">Nome</option>
    <option value="documento">Documento</option>
    <option value="status">Status</option>
    <option value="prestadorServico">Prestador de Serviço</option>
  </select>
)}


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
  abaAtiva === "usuarios" ? (
    // FILTRO PARA USUÁRIOS
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
          <option value="">Selecione o nível</option>
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
          <option value="">Selecione o status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      )}
      <Button onClick={buscarUsuarios}>
        <FaSearch size={14} />
      </Button>
    </div>
  ) : (
    // FILTRO PARA VISITANTES
    <div className="flex gap-2">
      {tipoFiltroVisitante === "nome" || tipoFiltroVisitante === "documento" ? (
        <Input
          placeholder={tipoFiltroVisitante === "nome" ? "Nome" : "Documento"}
          value={valorFiltroVisitante}
          onChange={(e) => setValorFiltroVisitante(e.target.value)}
        />
      ) : tipoFiltroVisitante === "status" ? (
        <select
          value={valorFiltroVisitante}
          onChange={(e) => setValorFiltroVisitante(e.target.value)}
          className="text-sm border rounded px-2 py-1 w-full"
        >
          <option value="">Selecione a opção</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      ) : (
        <select
          value={valorFiltroVisitante}
          onChange={(e) => setValorFiltroVisitante(e.target.value)}
          className="text-sm border rounded px-2 py-1 w-full"
        >
          <option value="">Selecione a opção</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      )}
      <Button onClick={() => {/* Criar função buscarVisitantes */}}>
        <FaSearch size={14} />
      </Button>
    </div>
  )
) : (
  abaAtiva === "usuarios" ? (
    // 🔹 COMBINADO PARA USUÁRIOS
    <div className="space-y-2">
      <Input placeholder="Nome" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
      <Input placeholder="CPF" value={formatCPF(filtroDocumento)} onChange={(e) => setFiltroDocumento(e.target.value)} />
      <Input placeholder="Bloco" value={filtroBloco} onChange={(e) => setFiltroBloco(e.target.value)} />
      <Input placeholder="Apartamento" value={filtroApto} onChange={(e) => setFiltroApto(e.target.value)} />
      <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="w-full text-sm border rounded px-2 py-2">
        <option value="">Selecione o nível</option>
        <option value="2">Síndico</option>
        <option value="3">Funcionário</option>
        <option value="4">Morador</option>
      </select>
      <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full text-sm border rounded px-2 py-2">
        <option value="">Selecione o status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      <Button onClick={buscarUsuarios}>
        <FaSearch size={14} />
      </Button>
    </div>
  ) : (
    // 🔹 COMBINADO PARA VISITANTES
    <div className="space-y-2">
      <Input placeholder="Nome" value={filtroNomeVisitante} onChange={(e) => setFiltroNomeVisitante(e.target.value)} />
      <Input placeholder="Documento" value={formatCPF(filtroDocumentoVisitante)} onChange={(e) => setFiltroDocumentoVisitante(e.target.value)} />
      <select
        value={filtroStatusVisitante}
        onChange={(e) => setFiltroStatusVisitante(e.target.value)}
        className="w-full text-sm border rounded px-2 py-2"
      >
        <option value="">Selecione o status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      <select
        value={filtroPrestadorVisitante}
        onChange={(e) => setFiltroPrestadorVisitante(e.target.value)}
        className="w-full text-sm border rounded px-2 py-2"
      >
        <option value="">Prestador de Serviço?</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      <Button onClick={() => {/* Criar função buscarVisitantesCombinado */}}>
        <FaSearch size={14} />
      </Button>
    </div>
  )
)
  }

          {/* Botão Exibir Todas */}
        <Button
  onClick={buscarTodos}
  variant="outline"
  className="w-full text-sm mt-2 border-[#167f6c] text-[#167f6c] bg-white hover:bg-[#167f6c15] active:bg-[#167f6c15] focus:bg-[#167f6c15]"
>
  {abaAtiva === "usuarios" ? "Exibir todos os usuários" : "Exibir todos os visitantes"}
</Button>

        </div>

        

        {mensagemErroUsuario && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 mx-4">
    {mensagemErroUsuario}
  </div>
)}


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
                onClick={() => router.push(`/users/mobile/${u.id}/editar`)}
                className="w-fit text-xs"
              >
                Ver detalhes
              </Button>
            </div>
          ))}

          {abaAtiva === "visitantes" && visitantes.map((v: any) => (
  <div
    key={v.visitanteId}
    className="bg-white rounded-xl shadow-md border p-4 flex flex-col gap-2"
  >
    <div className="font-semibold text-base">{v.nome}</div>
    <div className="text-sm text-gray-600">Documento: {v.documento}</div>
    <div className="text-sm text-gray-600">Telefone: {formatPhone(v.telefone)}</div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push(`/visitantes/mobile/${v.visitanteId}/editar`)}
      className="w-fit text-xs"
    >
      Ver detalhes
    </Button>
  </div>
))}

{abaAtiva === "visitantes" && buscouVisitante && visitantes.length === 0 && (
  <div className="text-center text-gray-500 text-sm mt-4">
    Nenhum visitante encontrado.
  </div>
)}


          {abaAtiva === "usuarios" && buscou && usuarios.length === 0 && (
  <div className="text-center text-gray-500 text-sm mt-4">Nenhum usuário encontrado.</div>
)}
        </div>

        {mostrarPopupRelatorio && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white relative rounded-lg shadow-lg p-6 w-[90%] max-w-sm">
      <button
        onClick={() => setMostrarPopupRelatorio(false)}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none font-bold"
        aria-label="Fechar"
      >
        ×
      </button>

      <h2 className="text-lg text-center font-semibold mb-4 text-[#217346]">
        Relatório gerado com sucesso
      </h2>

      <p className="text-sm text-center text-gray-700 mb-6">
        Clique no botão abaixo para baixar o relatório de{" "}
        <span className="font-medium">{abaAtiva === "usuarios" ? "usuários" : "visitantes"}</span>{" "}
        em formato Excel.
      </p>

      <div className="flex justify-center">
        <Button
          className="bg-[#217346] hover:bg-[#1a5c38] text-white text-sm px-5 py-3 rounded-md w-full font-medium"
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
      </>
    );
  }
