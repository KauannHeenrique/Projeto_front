"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { BsChevronDoubleLeft } from "react-icons/bs";
import { FaSearch, FaFilter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { FiBell, FiSearch, FiFileText, FiUser } from "react-icons/fi";

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: number;
  status: number;
  dataCriacao: string;
  apartamentoDestino?: { bloco: string; numero: string };
  moradorOrigem?: { nome: string };
}

const tiposNotificacao = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outros" },
];

const tiposNotificacaoRecebidas = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outros" },
  { value: 5, label: "Comunicado geral" },
];

const statusOptions = [
  { value: "", label: "Selecione o status" },
  { value: "1", label: "Enviada" },
  { value: "2", label: "Aprovada" },
  { value: "3", label: "Rejeitada" },
  { value: "4", label: "Em andamento" },
  { value: "5", label: "Concluída" },

];

export default function NotificacoesMobile() {
  const router = useRouter();
  const { user } = useAuth();
  const isSindicoOuFuncionario = user?.nivelAcesso === 2 || user?.nivelAcesso === 3;
  
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [mostrarPopupRelatorio, setMostrarPopupRelatorio] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const statusOptionsAbertas = statusOptions;
  const statusOptionsRecebidas = statusOptions.filter(opt => opt.value !== "3" && opt.value !== "1");

  

  const [abaAtiva, setAbaAtiva] = useState<"abertas" | "recebidas" | "criar">("abertas");
  const [modoCombinar, setModoCombinar] = useState(false);


  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);

  // --- Mensagens ---
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  // --- Filtros simples ---
  const [filtroCampo, setFiltroCampo] = useState("status");
  const [valorFiltro, setValorFiltro] = useState("");

  // --- Filtros combinados ---
  const [statusFiltro, setStatusFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("7");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
  if (!user?.usuarioId) return; // ✅ só chama se tiver ID

  setMostrarNotificacoes(false);
  setNotificacoes([]);
  
}, [abaAtiva, user]);




  // Buscar notificações
  const buscarNotificacoes = async (reset = true, ignorarValidacao = false) => {
  if (!user?.usuarioId) return;

  // ✅ VALIDAÇÃO DE FILTROS
  if (!ignorarValidacao) {
    const nenhumFiltroPreenchidoSimples =
      !modoCombinar &&
      (
        valorFiltro.trim() === "" ||
        valorFiltro === "Selecione o status" ||
        valorFiltro === "Selecione o tipo" ||
        (filtroCampo === "data" && valorFiltro === "customizado" && (!dataInicio && !dataFim))
      );

    const nenhumFiltroPreenchidoCombinado =
      modoCombinar &&
      statusFiltro === "" &&
      tipoFiltro === "" &&
      (periodoFiltro === "" ||
        (periodoFiltro === "customizado" && (!dataInicio && !dataFim)));

    if (nenhumFiltroPreenchidoSimples || nenhumFiltroPreenchidoCombinado) {
      setMensagemErro("Preencha pelo menos um filtro válido antes de buscar.");
      setMostrarNotificacoes(false);
      setNotificacoes([]);
      return;
    }
  }

  setMensagemErro("");

  try {
    setLoading(true);
    setNotificacoes([]);
    if (reset) {
      setPagina(1);
    }

    const queryParams: Record<string, string> = {
      page: String(reset ? 1 : pagina),
      pageSize: "30",
    };

    if (!ignorarValidacao) {
  if (modoCombinar) {
    if (statusFiltro) queryParams.status = statusFiltro;
    if (tipoFiltro) queryParams.tipo = tipoFiltro;

    if (periodoFiltro === "customizado") {
      if (dataInicio) queryParams.dataInicio = dataInicio;
      if (dataFim) queryParams.dataFim = dataFim;
    } else if (periodoFiltro) {
      queryParams.periodo = periodoFiltro;
    }

  } else {
    if (filtroCampo === "data") {
      if (valorFiltro === "7" || valorFiltro === "30") {
        queryParams.periodo = valorFiltro;
      } else if (valorFiltro === "customizado") {
        if (dataInicio) queryParams.dataInicio = dataInicio;
        if (dataFim) queryParams.dataFim = dataFim;
      }
    } else if (filtroCampo && valorFiltro) {
      queryParams[filtroCampo] = valorFiltro;
    }
  }
}


    const url =
      abaAtiva === "abertas"
        ? `/Notificacao/MinhasNotificacoes/${user?.usuarioId}`
        : `/Notificacao/Recebidas/${user?.usuarioId}`;

    const { data } = await api.get(url, {
      params: {
        ...queryParams,
        criadoPorSindico: false,
      },
    });

    let notificacoesFiltradas = data.notificacoes;
    if (abaAtiva === "recebidas") {
      notificacoesFiltradas = notificacoesFiltradas.filter((n: Notificacao) => n.status !== 1 && n.status !== 3);
    }

    if (reset) {
      setNotificacoes(notificacoesFiltradas);
    } else {
      setNotificacoes((prev) => [...prev, ...notificacoesFiltradas]);
    }

    setTemMais(notificacoesFiltradas.length === 30);
  } catch (error) {
    console.error("Erro ao buscar notificações", error);
    setNotificacoes([]);
  } finally {
    setLoading(false);
  }
};


  // Exibir todas
  const exibirTodas = () => {
  setModoCombinar(false);
  setFiltroCampo("status");
  setValorFiltro("");
  setStatusFiltro("");
  setTipoFiltro("");
  setPeriodoFiltro("7");
  setDataInicio("");
  setDataFim("");
  setMostrarNotificacoes(true); // agora ativa a listagem
  buscarNotificacoes(true, true); // <- passa ignorarValidacao = true
};

  // Buscar apartamentos (Bloco + Número)
  const buscarApartamentos = async (bloco: string, numero: string) => {
    if (!bloco || !numero) {
      setApartamentosSugestoes([]);
      return;
    }
    try {
      const { data } = await api.get(`/Apartamento/BuscarPor?bloco=${bloco}&numero=${numero}`);
      setApartamentosSugestoes(data);
    } catch {
      setApartamentosSugestoes([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 bg-white border-b shadow-sm flex justify-between items-center px-4 py-3 z-50">
  <Button
    onClick={() => router.push("/home/mobile?aba=morador")}
    variant="ghost"
    className="flex items-center gap-2 text-gray-700 text-sm"
  >
    <BsChevronDoubleLeft size={18} /> Voltar
  </Button>

  {/* BOTÃO MENU HAMBÚRGUER */} 
<div className="relative">
  <Button
    variant="ghost"
    className="flex items-center gap-1"
    onClick={() => setMostrarMenu(!mostrarMenu)}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </Button>

  {mostrarMenu && (
    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
         onClick={async () => {
        try {
  const response = await api.get(
    "/relatorios/notificacoes-completo",
    { responseType: "blob" } // ESSENCIAL para arquivos binários
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Relatorio_Notificacoes_Completo.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setMostrarPopupRelatorio(false);
} catch (error) {
  console.error("Erro ao baixar relatório de notificações:", error);
}

      }}
      
        >
          Baixar Excel
        </Button>
            </div>
          </div>
        </div>
      )}

    <Button
        onClick={() => router.push("/notification/user/add")}
        variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
      >
        + Nova notificação
      </Button>
    </div>
  )}
</div>

</div>


      {/* Título da Página */}
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Notificações</h1>


      {/* ABAS */}
      <div className="flex justify-between border-b border-gray-200">
        {["abertas", "recebidas"].map((aba) => (
          <button
            key={aba}
            className={`flex-1 py-2 text-sm font-medium ${abaAtiva === aba ? "border-b-2 border-[#26c9a8] text-[#26c9a8]" : "text-gray-600"}`}
            onClick={() => setAbaAtiva(aba as any)}
          >
            {aba === "abertas" ? "Abertas" : aba === "recebidas" ? "Recebidas" : "Criar"}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* MENSAGENS */}
        {mensagemErro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {mensagemErro}
          </div>
        )}
        {mensagemSucesso && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            {mensagemSucesso}
          </div>
        )}

        {/* FILTRO */}
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex justify-between items-center">
              <select
  value={filtroCampo}
  onChange={(e) => {
    const novoCampo = e.target.value;
    setFiltroCampo(novoCampo);

    if (novoCampo === "data") {
      setValorFiltro("7"); // valor padrão para data
    } else {
      setValorFiltro("");
    }
  }}
  className="border rounded px-2 py-1 text-sm w-1/2"
>

                <option value="status">Status</option>
                <option value="tipo">Tipo</option>
                <option value="data">Data</option>
              </select>

              <Button
                variant={modoCombinar ? "default" : "outline"}
                size="sm"
                onClick={() => setModoCombinar(!modoCombinar)}
                className="text-xs flex gap-1"
              >
                <FaFilter size={12} /> Combinar filtros
              </Button>
            </div>

            {!modoCombinar ? (
  <div className="flex gap-2">
    {filtroCampo === "status" && (
      <select
        value={valorFiltro}
        onChange={(e) => setValorFiltro(e.target.value)}
        className="border rounded px-2 py-2 text-sm w-full"
      >
        {(abaAtiva === "abertas" ? statusOptionsAbertas : statusOptionsRecebidas).map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )}

    {filtroCampo === "tipo" && (
  <select
    value={valorFiltro}
    onChange={(e) => setValorFiltro(e.target.value)}
    className="border rounded px-2 py-2 text-sm w-full"
  >
    <option value="">Selecione o tipo</option>
    {(abaAtiva === "recebidas" ? tiposNotificacaoRecebidas : tiposNotificacao).map((t) => (
      <option key={t.value} value={t.value}>
        {t.label}
      </option>
    ))}
  </select>
)}


    {filtroCampo === "data" && (
      <div className="flex flex-col gap-2 w-full">
        <select
          value={valorFiltro}
          onChange={(e) => setValorFiltro(e.target.value)}
          className="border rounded px-2 py-2 text-sm w-full"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="customizado">Personalizado</option>
        </select>

        {valorFiltro === "customizado" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <label htmlFor="dataInicio" className="text-sm text-gray-700 mb-1">Data início</label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="dataFim" className="text-sm text-gray-700 mb-1">Data fim</label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    )}

    <Button
  onClick={() => {
    setNotificacoes([]); // limpa antes de buscar
    buscarNotificacoes();
  }}
  size="icon"
  className="bg-black text-white hover:bg-gray-800 rounded"
>
  <FaSearch size={14} />
</Button>

  </div>
) : (
  <div className="flex flex-col gap-3">
    <div>
      <label className="text-sm text-gray-700 mb-1">Status</label>
      <select
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
        className="w-full border rounded px-2 py-2"
      >
        {(abaAtiva === "abertas" ? statusOptionsAbertas : statusOptionsRecebidas).map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-700 mb-1">Tipo</label>
      <select
  value={tipoFiltro}
  onChange={(e) => setTipoFiltro(e.target.value)}
  className="w-full border rounded px-2 py-2"
>
  <option value="">Selecione o tipo</option>
  {(abaAtiva === "recebidas" ? tiposNotificacaoRecebidas : tiposNotificacao).map((t) => (
    <option key={t.value} value={t.value}>
      {t.label}
    </option>
  ))}
</select>

    </div>

    <div>
      <label className="text-sm text-gray-700 mb-1">Período</label>
      <select
        value={periodoFiltro}
        onChange={(e) => setPeriodoFiltro(e.target.value)}
        className="w-full border rounded px-2 py-2"
      >
        <option value="7">Últimos 7 dias</option>
        <option value="30">Últimos 30 dias</option>
        <option value="customizado">Personalizado</option>
      </select>
    </div>

    {periodoFiltro === "customizado" && (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label htmlFor="dataInicio" className="text-sm text-gray-700 mb-1">Data início</label>
          <Input
            id="dataInicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="dataFim" className="text-sm text-gray-700 mb-1">Data fim</label>
          <Input
            id="dataFim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>
    )}

    <Button
      onClick={() => buscarNotificacoes()}
      className="w-full bg-black text-white hover:bg-gray-800 mt-2"
    >
      <FaSearch size={14} className="mr-2" />
      Buscar notificações
    </Button>
  </div>
)}


            <Button
              onClick={exibirTodas}
              variant="outline"
              className="w-full border-[#167f6c] text-[#167f6c] hover:bg-[#167f6c15]"
            >
              Exibir todas as notificações
            </Button>
          </div>

        {/* LISTAGEM */}
        {abaAtiva !== "criar" && (
          loading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : (
            <div className="space-y-3">
              {notificacoes.length === 0 ? (
                <p className="text-gray-500 text-center">Nenhuma notificação encontrada.</p>
              ) : (
                notificacoes.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white p-4 rounded-lg border shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                          n.status === 1
                            ? "bg-gray-400 text-black"
                            : n.status === 2
                            ? "bg-green-400  text-black"
                            : n.status === 3
                            ? "bg-red-500 text-black"
                            : n.status === 4
                            ? "bg-yellow-400 text-black"
                            : "bg-green-700 text-black"
                        }`}
                      >
                        {statusOptions.find(s => s.value === String(n.status))?.label}
                      </span>
                    </div>

                    <h2 className="font-semibold uppercase">{n.titulo}</h2>
                    <p className="text-sm text-gray-600">
                      Assunto: {(abaAtiva === "recebidas" ? tiposNotificacaoRecebidas : tiposNotificacao).find(t => t.value === n.tipo)?.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Data:</strong>{" "}
                      {new Date(n.dataCriacao).toLocaleDateString("pt-BR")}{" "}
                      <strong>Hora:</strong>{" "}
                      {new Date(n.dataCriacao).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/notification/user/details/${n.id}`)}
                      className="w-fit text-xs"
                    >
                      Ver detalhes
                    </Button>
                  </div>
                ))
              )}

              {temMais && (
                <Button
                  onClick={() => {
                    setPagina((p) => p + 1);
                    buscarNotificacoes(false);
                  }}
                  className="w-full bg-[#26c9a8] text-white"
                >
                  Carregar mais
                </Button>
              )}
            </div>
          )
        )}
      </div>
    </div>
    </div>
  );
}
