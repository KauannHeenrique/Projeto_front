"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { BsChevronDoubleLeft } from "react-icons/bs";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { FiBell } from "react-icons/fi";

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: number;
  status: number;
  dataCriacao: string;
}

const tiposNotificacao = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outros" },
  { value: 5, label: "Comunicado geral" },
];

const statusOptions = [
  { value: "1", label: "Enviada" },
  { value: "2", label: "Aprovada" },
  { value: "3", label: "Rejeitada" },
  { value: "4", label: "Em andamento" },
  { value: "5", label: "Concluída" },
];

export default function NotificacoesMobile() {
  const router = useRouter();
  const { user } = useAuth();

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);

  // Filtros
  const [statusFiltro, setStatusFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    if (!user?.usuarioId) return;
    setNotificacoes([]);
  }, [user]);

  const buscarNotificacoes = async (reset = true, ignorarFiltros = false) => {
  if (!user?.usuarioId) return;

  if (!ignorarFiltros) {
    const temStatus = !!statusFiltro;
    const temTipo = !!tipoFiltro;
    const temPeriodo = !!periodoFiltro && periodoFiltro !== "";
    const ehCustomizado = periodoFiltro === "customizado";

    if (!temStatus && !temTipo && !temPeriodo) {
      setNotificacoes([]);
      setMensagemErro("Por favor, preencha ao menos um filtro para buscar.");
      return;
    }

    // Validação para personalizado
  if (periodoFiltro === "customizado" && (!dataInicio || !dataFim)) {
    setMensagemErro("Preencha as duas datas para busca personalizada.");
    return;
  }
  }

  setMensagemErro("");

  try {
    setLoading(true);
    if (reset) {
      setPagina(1);
      setNotificacoes([]);
    }

    const queryParams: Record<string, string> = {
      page: String(reset ? 1 : pagina),
      pageSize: "30",
    };

    if (!ignorarFiltros) {
      if (statusFiltro) queryParams.status = statusFiltro;
      if (tipoFiltro) queryParams.tipo = tipoFiltro;

      if (periodoFiltro === "customizado") {
        queryParams.dataInicio = dataInicio;
        queryParams.dataFim = dataFim;
      } else if (periodoFiltro) {
        queryParams.periodo = periodoFiltro; // Agora
      }
    }

    const url = `/Notificacao/MinhasNotificacoes/${user?.usuarioId}`;
    const { data } = await api.get(url, { params: queryParams });

    const notificacoesData = data.notificacoes || [];

    if (reset) {
      setNotificacoes(notificacoesData);
    } else {
      setNotificacoes((prev) => [...prev, ...notificacoesData]);
    }

    setTemMais(notificacoesData.length === 30);
  } catch (error) {
    console.error("Erro ao buscar notificações", error);
    setNotificacoes([]);
  } finally {
    setLoading(false);
  }
};


  const exibirTodas = () => {
    setStatusFiltro("");
    setTipoFiltro("");
    setPeriodoFiltro("7");
    setDataInicio("");
    setDataFim("");
    setMensagemErro("");
    buscarNotificacoes(true, true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 bg-white border-b shadow-sm flex items-center px-6 py-4 z-50">
        <Button
          onClick={() => router.push("/home")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-700"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Título + Botão */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            Notificações Abertas
          </h1>
          <Button
            onClick={exibirTodas}
            type="button"
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2 text-sm"
          >
            <FiBell size={16} /> Exibir todas as notificações
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
  <div className="grid grid-cols-12 gap-4 items-end">
    {/* Status */}
    <div className="col-span-3">
      <select
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full"
      >
        <option value="">Status</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>

    {/* Tipo */}
    <div className="col-span-3">
      <select
        value={tipoFiltro}
        onChange={(e) => setTipoFiltro(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full"
      >
        <option value="">Tipo</option>
        {tiposNotificacao.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>

    {/* Período */}
<div className="col-span-4">
  <select
    value={periodoFiltro}
    onChange={(e) => {
      setPeriodoFiltro(e.target.value);
      if (e.target.value !== "customizado") {
        setDataInicio("");
        setDataFim("");
      }
    }}
    className="border rounded px-3 py-2 text-sm w-full text-gray-700"
  >
    <option value="">Período</option> {/* Placeholder */}
    <option value="7">Últimos 7 dias</option>
    <option value="30">Últimos 30 dias</option>
    <option value="customizado">Personalizado</option>
  </select>
</div>


    {/* Botão Buscar */}
    <div className="col-span-2 flex justify-end">
      <Button
        onClick={() => buscarNotificacoes(true)}
        className="bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 w-full"
      >
        <FaSearch size={14} /> Buscar
      </Button>
    </div>
  </div>

  {/* Campos de data quando for personalizado */}
  {periodoFiltro === "customizado" && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <Input
        type="date"
        value={dataInicio}
        onChange={(e) => setDataInicio(e.target.value)}
      />
      <Input
        type="date"
        value={dataFim}
        onChange={(e) => setDataFim(e.target.value)}
      />
    </div>
  )}
</div>


        {/* Mensagem de erro */}
        {mensagemErro && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {mensagemErro}
          </div>
        )}

        {/* LISTAGEM */}
        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : (
          <div className="space-y-3 mt-6">
            {notificacoes.length === 0 ? (
              <p className="text-gray-500 text-center">
                Nenhuma notificação encontrada.
              </p>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-lg border shadow-sm flex flex-col gap-2"
                >
                  <h2 className="font-semibold">{n.titulo}</h2>
                  <p className="text-sm text-gray-600">
                    {tiposNotificacao.find((t) => t.value === n.tipo)?.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.dataCriacao).toLocaleString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/notification/admin/details/${n.id}`)
                    }
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
        )}
      </div>
    </div>
  );
}
