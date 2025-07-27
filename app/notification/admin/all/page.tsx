"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { BsChevronDoubleLeft } from "react-icons/bs";
import api from "@/services/api";
import { Loader, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

// Interfaces
interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: number;
  status: number;
  dataCriacao: string;
}

// Status & Tipos
const tiposNotificacao = [
  { value: 1, label: "Aviso de barulho" },
  { value: 2, label: "Solicitação de reparo" },
  { value: 3, label: "Sugestão" },
  { value: 4, label: "Outros" },
  { value: 5, label: "Comunicado geral" } 
];

const statusOptions = [
  { value: "", label: "Status" },
  { value: "1", label: "Pendente" },
  { value: "2", label: "Aprovada" },
  { value: "3", label: "Rejeitada" },
  { value: "4", label: "Em Andamento" },
  { value: "5", label: "Concluída" },
];

// Funções auxiliares
const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return "Pendente";
    case 2:
      return "Aprovada";
    case 3:
      return "Rejeitada";
    case 4:
      return "Em Andamento";
    case 5:
      return "Concluída";
    default:
      return "Desconhecido";
  }
};

const getStatusIcon = (status: number) => {
  switch (status) {
    case 1: // Pendente
      return <Clock className="h-6 w-6 text-gray-400 mt-1" />;
    case 2: // Aprovada
      return <Clock className="h-6 w-6 text-green-400 mt-1" />;
    case 3: // Rejeitada
      return <XCircle className="h-6 w-6 text-red-500 mt-1" />;
    case 4: // Em andamento
      return <Clock className="h-6 w-6 text-yellow-400 mt-1" />;
    case 5: // Concluida
      return <CheckCircle className="h-6 w-6 text-green-700 mt-1" />;
    default:
      return <AlertCircle className="h-6 w-6 text-gray-500 mt-1" />;
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 1:
      return "text-gray-400 font-medium";
    case 2:
      return "text-green-400 font-medium";
    case 3:
      return "text-red-500 font-medium";
    case 4:
      return "text-yellow-400 font-medium";
    case 5:
      return "text-green-700 font-medium";
    default:
      return "text-gray-500";
  }
};

export default function TodasNotificacoesPage() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);
  const [erro, setErro] = useState("");

  const [exibindoTodas, setExibindoTodas] = useState(false);

  // Filtros
  const [statusFiltro, setStatusFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [blocoFiltro, setBlocoFiltro] = useState("");
  const [apartamentoFiltro, setApartamentoFiltro] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Mostrar lista após clicar em "Exibir todas"
  const [mostrarLista, setMostrarLista] = useState(false);

  const buscarNotificacoes = async (exibirTodas = false) => {
  try {
    setErro("");
    setNotificacoes([]);
    setLoading(true);

    let url = "";
    let queryParams: Record<string, string> = {};

    if (exibirTodas) {
      // ✅ Chama rota que lista todas
      url = "/Notificacao/ListarTodas";
    } else {
      // ✅ Chama rota que busca com filtros
      url = "/Notificacao/BuscarNotificacaoPor";

      if (statusFiltro !== "") queryParams.status = statusFiltro;
      if (tipoFiltro !== "") queryParams.tipo = tipoFiltro;
      if (blocoFiltro) queryParams.bloco = blocoFiltro;
      if (apartamentoFiltro) queryParams.apartamento = apartamentoFiltro;

      // ✅ Período
      if (periodoFiltro && periodoFiltro !== "customizado") {
        const hoje = new Date();
        const dias = parseInt(periodoFiltro, 10);
        const dataInicioCalc = new Date();
        dataInicioCalc.setDate(hoje.getDate() - dias);
        queryParams.dataInicio = dataInicioCalc.toISOString().split("T")[0];
        queryParams.dataFim = hoje.toISOString().split("T")[0];
      } else if (periodoFiltro === "customizado") {
        if (dataInicio) queryParams.dataInicio = dataInicio;
        if (dataFim) queryParams.dataFim = dataFim;
      }
    }

    const { data } = await api.get(url, { params: queryParams });

    setNotificacoes(data.notificacoes || []);
  } catch (error: any) {
    setNotificacoes([]);
    console.error("Erro ao buscar notificações", error);
    setErro("Erro ao carregar notificações.");
  } finally {
    setLoading(false);
  }
};



  const handleBuscarClick = () => {
  const nenhumFiltro =
    statusFiltro === "" &&
    tipoFiltro === "" &&
    blocoFiltro.trim() === "" &&
    apartamentoFiltro.trim() === "" &&
    (periodoFiltro === "" || (periodoFiltro === "customizado" && !dataInicio && !dataFim));

  if (nenhumFiltro) {
    setErro("Preencha pelo menos um filtro antes de buscar.");
    setNotificacoes([]);
    return;
  }

  setErro("");
  setExibindoTodas(false); // ✅ Resetar
  setMostrarLista(true);
  buscarNotificacoes(false);
};

  const exibirTodas = () => {
  setExibindoTodas(true);
  setMostrarLista(true);
  buscarNotificacoes(true);
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 bg-white border-b shadow-sm flex items-center px-4 py-3 z-50">
        <Button
          onClick={() => router.push("/home/desktop")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-700"
        >
          <BsChevronDoubleLeft size={18} /> Voltar
        </Button>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold mb-4">Notificações</h1>

        {/* FILTROS */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            {/* Status */}
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Tipo */}
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Tipo</option>
              {tiposNotificacao.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Bloco */}
            <Input
              placeholder="Bloco"
              value={blocoFiltro}
              onChange={(e) => setBlocoFiltro(e.target.value)}
            />

            {/* Apartamento */}
            <Input
              placeholder="Apartamento"
              value={apartamentoFiltro}
              onChange={(e) => setApartamentoFiltro(e.target.value)}
            />

            {/* Período */}
            <select
              value={periodoFiltro}
              onChange={(e) => setPeriodoFiltro(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Período</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="customizado">Personalizado</option>
            </select>

            {/* Botão Buscar */}
            <Button
              onClick={handleBuscarClick}
              className="bg-black text-white hover:bg-gray-800 flex gap-2 items-center"
            >
              <FaSearch size={14} /> Buscar
            </Button>
          </div>

          {/* Filtros de data customizada */}
          {periodoFiltro === "customizado" && (
            <div className="flex gap-2">
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

          {!exibindoTodas && (
  <Button
    onClick={exibirTodas}
    variant="outline"
    className="w-full border-[#167f6c] text-[#167f6c] hover:bg-[#167f6c15]"
  >
    Exibir todas as notificações
  </Button>
)}

          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {erro}
            </div>
          )}

          

        </div>

        {/* LISTA */}
        {mostrarLista && (
          <div className="space-y-3">
            {loading && notificacoes.length === 0 ? (
              <p className="text-center text-gray-500">Carregando...</p>
            ) : notificacoes.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhuma notificação encontrada.
              </p>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(n.status)}
                    <div>
                      <p className="font-semibold text-gray-800 truncate max-w-[200px]">
                        {n.titulo || "Alerta"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(n.dataCriacao).toLocaleDateString("pt-BR")} {" "}
                      </p>
                      {n.status === 1 && (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                          • Ação necessária
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/notification/admin/details/${n.id}`)
                    }
                  >
                    Ver detalhes
                  </Button>
                </div>
              ))
            )}

            {temMais && (
              <Button
                onClick={() => {
                  setPagina((prev) => prev + 1);
                  buscarNotificacoes(false, mostrarLista);
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
